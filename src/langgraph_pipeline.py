"""
langgraph_pipeline.py
LangGraph orchestration for the job application pipeline.

Graph:
  START → extract_metadata → [generate_docs || github_search] → save_excel → END
"""

from __future__ import annotations

import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional, TypedDict, Any

from langgraph.graph import StateGraph, END

from .rag_pipeline import run_jd_pipeline_api
from .github_agent import build_engineers_list

try:
    from .config import OUT_DIR
except ImportError:
    OUT_DIR = Path("data/outputs")
    OUT_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class JobPipelineState(TypedDict):
    jd_text: str
    options: dict
    company_name: str
    role_name: str
    doc_result: dict
    engineers: list
    excel_filename: str
    error: Optional[str]


# ---------------------------------------------------------------------------
# Nodes
# ---------------------------------------------------------------------------

def extract_metadata_node(state: JobPipelineState) -> dict:
    """
    Extract company name and role name from the JD text using simple regex heuristics.
    """
    jd = state.get("jd_text", "")

    # Company: look for "at <Company>", "with <Company>", or "Company: ..."
    company = ""
    for pattern in [
        r"(?:at|with|join|@)\s+([A-Z][A-Za-z0-9&.,\s]{1,40}?)(?:\s+as|\s+in|\s+–|\s+-|\n|,)",
        r"Company[:\s]+([A-Z][A-Za-z0-9&.,\s]{1,40}?)(?:\n|,|\s{2,})",
    ]:
        m = re.search(pattern, jd)
        if m:
            company = m.group(1).strip(" ,.")
            break

    # Role: look for title-like lines near the top
    role = ""
    for pattern in [
        r"(?:Role|Position|Title|Job Title)[:\s]+([A-Z][A-Za-z0-9\s/&-]{2,60}?)(?:\n|,|\s{2,})",
        r"^([A-Z][A-Za-z0-9\s/&-]{5,60}?)\s*[\n\r]",
    ]:
        m = re.search(pattern, jd, re.MULTILINE)
        if m:
            role = m.group(1).strip()
            break

    if not company:
        company = "Unknown Company"
    if not role:
        role = "Unknown Role"

    return {"company_name": company, "role_name": role}


def generate_docs_node(state: JobPipelineState) -> dict:
    """
    Run the full RAG document generation pipeline.
    """
    try:
        result = run_jd_pipeline_api(
            jd_text=state["jd_text"],
            options=state.get("options", {}),
        )
        return {"doc_result": result}
    except Exception as e:
        return {"doc_result": {}, "error": str(e)}


def github_search_node(state: JobPipelineState) -> dict:
    """
    Search GitHub for engineers at the extracted company.
    """
    company = state.get("company_name", "")
    if not company or company == "Unknown Company":
        return {"engineers": []}
    try:
        engineers = build_engineers_list(company, max_results=20)
        return {"engineers": engineers}
    except Exception:
        return {"engineers": []}


def save_excel_node(state: JobPipelineState) -> dict:
    """
    Write engineers data to an Excel file (2 sheets).
    Sheet 1: summary (company, role, date, count)
    Sheet 2: engineer details
    """
    try:
        import openpyxl
    except ImportError:
        return {"excel_filename": ""}

    company = state.get("company_name", "Unknown Company")
    role = state.get("role_name", "Unknown Role")
    engineers = state.get("engineers", [])

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_company = re.sub(r"[^\w]", "_", company)[:30]
    filename = f"{ts}_{safe_company}_engineers.xlsx"
    filepath = OUT_DIR / filename

    wb = openpyxl.Workbook()

    # Sheet 1 — Summary
    ws1 = wb.active
    ws1.title = "Summary"
    ws1.append(["Company", "Role", "Date", "Engineers Found"])
    ws1.append([
        company,
        role,
        datetime.now().strftime("%Y-%m-%d %H:%M"),
        len(engineers),
    ])

    # Sheet 2 — Engineers
    ws2 = wb.create_sheet("Engineers")
    ws2.append([
        "Name", "Username", "GitHub URL", "Email",
        "Bio", "Location", "Top Languages", "Followers", "Public Repos",
    ])
    for eng in engineers:
        ws2.append([
            eng.get("name", ""),
            eng.get("username", ""),
            eng.get("html_url", ""),
            eng.get("email", ""),
            eng.get("bio", ""),
            eng.get("location", ""),
            ", ".join(eng.get("top_languages", [])),
            eng.get("followers", 0),
            eng.get("public_repos", 0),
        ])

    wb.save(str(filepath))
    return {"excel_filename": filename}


# ---------------------------------------------------------------------------
# Graph builder
# ---------------------------------------------------------------------------

def build_pipeline():
    """
    Build and compile the LangGraph pipeline.

    Graph topology:
      START → extract_metadata → generate_docs
                               → github_search
      (both) → save_excel → END
    """
    graph = StateGraph(JobPipelineState)

    graph.add_node("extract_metadata", extract_metadata_node)
    graph.add_node("generate_docs", generate_docs_node)
    graph.add_node("github_search", github_search_node)
    graph.add_node("save_excel", save_excel_node)

    graph.set_entry_point("extract_metadata")

    # Fan out to parallel nodes after metadata extraction
    graph.add_edge("extract_metadata", "generate_docs")
    graph.add_edge("extract_metadata", "github_search")

    # Both converge at save_excel
    graph.add_edge("generate_docs", "save_excel")
    graph.add_edge("github_search", "save_excel")

    graph.add_edge("save_excel", END)

    return graph.compile()


def run_pipeline(jd_text: str, options: dict | None = None) -> dict[str, Any]:
    """
    Run the full LangGraph pipeline and return the final state as a dict.
    """
    pipeline = build_pipeline()
    initial_state: JobPipelineState = {
        "jd_text": jd_text,
        "options": options or {},
        "company_name": "",
        "role_name": "",
        "doc_result": {},
        "engineers": [],
        "excel_filename": "",
        "error": None,
    }
    final_state = pipeline.invoke(initial_state)
    return dict(final_state)

# app/api.py

from typing import Any, Dict, Optional

from altair import Field
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import desc
from traitlets import default
import traceback
from fastapi import HTTPException

from src.rag_pipeline import run_jd_pipeline_api, simple_chat_api


# -----------------------------------------------------------
# FastAPI app setup
# -----------------------------------------------------------

app = FastAPI(
    title="Job Assistant RAG API",
    description="RAG-based backend for job applications (skills, cover letters, emails, ATS summary).",
    version="0.1.0",
)

# If you have a frontend (Streamlit, React, etc.), enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # later you can restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------
# Pydantic models (request/response shapes)
# -----------------------------------------------------------




class ChatRequest(BaseModel):
    message: str
    top_k: Optional[int] = None


class JDOptions(BaseModel):
    generate_skills: bool = True
    generate_cover: bool = True
    generate_emails: bool = True
    generate_ats: bool = True
    generate_top_choice: bool = True
    generate_short_recruiter_email: bool = True


    top_k: Optional[int] = Field(default=None, ge=1, le=20)


class JDRequest(BaseModel):
    jd_text: str = Field(..., min_length=30, max_length=30000)
    options: JDOptions = Field(default_factory=JDOptions)





# For the full JD pipeline response, we can just return Dict[str, Any]
# since generate_all_from_jd() already returns a clean dict.


# -----------------------------------------------------------
# Endpoints
# -----------------------------------------------------------

@app.get("/")
def root() -> Dict[str, str]:
    return {"status": "ok", "message": "Job Assistant RAG API is running"}


# @app.post("/jd", response_model=Dict[str, Any])
# def process_job_description(req: JDRequest) -> Dict[str, Any]:
#     """
#     Run the FULL JD pipeline:
#     - indexes profile docs + this JD
#     - extracts skills, keywords, alignment
#     - generates skills summary, cover letter, emails, ATS summary, etc.

#     Returns the same dict structure as `generate_all_from_jd()`.
#     """
#     result = run_jd_pipeline_api(req.jd_text)
#     return result

# @app.post("/jd", response_model=Dict[str, Any])
# def process_job_description(req: JDRequest) -> Dict[str, Any]:
#     result = run_jd_pipeline_api(req.jd_text, options=req.options.model_dump())
#     return result

@app.post("/jd")
def process_job_description(req: JDRequest):
    try:
        return run_jd_pipeline_api(req.jd_text, options=req.options.model_dump())
    except Exception as e:
        traceback.print_exc()  # prints full traceback to terminal
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/chat")
def chat(req: ChatRequest) -> Dict[str, Any]:
    """
    Simple RAG chat over your profile docs using `generate_answer()`.
    Returns just {"answer": "..."}.
    """
    k = req.top_k if req.top_k is not None else 6
    answer = simple_chat_api(req.message, k=k)
    return {"answer": answer}


@app.get("/health")

def health_check():
    return {"status": "healthy"}


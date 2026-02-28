# ApplyVista — AI-Powered Job Application Assistant

**ApplyVista** is an intelligent, offline-first job application assistant that generates ATS-ready skills summaries, cover letters, recruiter emails, and follow-up emails — all grounded in your own resume and project documents using a Retrieval-Augmented Generation (RAG) pipeline.

It also discovers engineers at companies you're applying to via GitHub, and runs an automated job scout every 6 hours that searches LinkedIn and Seek for new opportunities and sends email alerts.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js Frontend (localhost:3000)          │
│  shadcn/ui + Tailwind                       │
│  Pages: / (apply) + /scout (job scout)      │
└─────────────┬───────────────────────────────┘
              │ HTTP
┌─────────────▼───────────────────────────────┐
│  FastAPI Backend (localhost:8000)           │
│  ├── POST /jd         ← LangGraph pipeline  │
│  ├── POST /export/docx|pdf                  │
│  ├── GET  /download/{filename}              │
│  ├── GET  /scout/jobs                       │
│  ├── GET  /scout/status                     │
│  └── POST /scout/run                        │
└──────┬──────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────┐
│  LangGraph Pipeline                         │
│  extract_metadata → [generate_docs ||       │
│  github_search] → save_excel                │
└──────┬──────────────────────────────────────┘
       │                     ┌─────────────────┐
       │                     │  APScheduler    │
       │                     │  Every 6 hours  │
       │                     │  ↓              │
       │                     │  Job Scout      │
       │                     │  (DuckDuckGo)   │
       │                     │  ↓              │
       │                     │  Email Alert    │
       └─────────────────────┴─────────────────┘
```

---

## Features

### RAG Document Generation
- Indexes your CV and project docs into ChromaDB
- Retrieves the most relevant context per query
- Generates 6 tailored outputs per job description:
  - Skills & Keywords
  - Cover Letter
  - Application Emails (3 variants)
  - ATS Resume Summary
  - "Why this role?" short response
  - Cold recruiter outreach email

### LangGraph Orchestration
- Stateful graph replaces the old sequential pipeline
- `extract_metadata` → parallel fan-out → `save_excel`
- `generate_docs` and `github_search` run concurrently

### GitHub Engineer Discovery
- Searches GitHub for engineers at the company in the JD
- Returns name, email, bio, location, top languages, repo count
- Exports results to a 2-sheet Excel file

### Job Scout Agent
- Runs automatically every 6 hours via APScheduler
- Searches LinkedIn and Seek using DuckDuckGo
- Scores each result by keyword overlap with your skills
- Deduplicates against previously seen jobs
- Appends new jobs to a persistent Excel file
- Sends a Gmail email alert listing new findings

### Next.js Frontend
- Paste a JD → click Generate → 7 tabs appear instantly
- Each tab has an editable text area + Download DOCX / PDF
- Engineers tab shows a GitHub profile table + Excel download
- `/scout` page shows job scout status, jobs table, and a manual trigger button

### Local LLM (Fully Offline)
- Powered by Ollama (Llama 3.2 3B by default)
- No API keys, no cloud calls, no cost, 100% private

---

## Tech Stack

| Component | Purpose |
|---|---|
| **Next.js 16** | Frontend (React, App Router) |
| **shadcn/ui + Tailwind** | UI components |
| **FastAPI** | Backend REST API |
| **LangGraph** | Pipeline orchestration |
| **LangChain** | RAG chains and prompt building |
| **Ollama** | Local LLM runtime |
| **ChromaDB** | Vector store |
| **SentenceTransformers** | Embeddings (all-MiniLM-L6-v2) |
| **APScheduler** | Job scout scheduling |
| **duckduckgo-search** | Job search queries |
| **openpyxl** | Excel export |
| **python-docx / fpdf** | DOCX and PDF export |

---

## Project Structure

```
ApplyVista/
├── app/
│   └── api.py                  ← FastAPI app (all endpoints)
├── src/
│   ├── rag_pipeline.py         ← Core RAG logic
│   ├── langgraph_pipeline.py   ← LangGraph graph
│   ├── github_agent.py         ← GitHub engineer discovery
│   ├── job_scout_agent.py      ← Job search + email alerts
│   ├── scheduler.py            ← APScheduler setup
│   ├── config.py               ← Paths and model settings
│   ├── text_utils.py           ← NLP utilities
│   └── profile_config.py       ← Your private profile (gitignored)
├── frontend/
│   ├── app/
│   │   ├── page.tsx            ← Main JD input + output tabs
│   │   └── scout/page.tsx      ← Job scout dashboard
│   ├── components/
│   │   ├── JDInput.tsx
│   │   ├── OutputTabs.tsx
│   │   ├── DocTab.tsx
│   │   ├── EngineersTable.tsx
│   │   └── ScoutDashboard.tsx
│   └── lib/api.ts              ← Typed fetch helpers
├── data/
│   ├── job_rag/
│   │   ├── profile_docs/       ← Drop your CV and project docs here
│   │   ├── chroma_db/          ← Vector store (auto-generated)
│   │   └── seen_jobs.json      ← Scout dedup store
│   └── outputs/                ← Generated Excel, DOCX, PDF files
├── .env.example
└── requirements.txt
```

---

## Setup

### 1. Clone

```bash
git clone https://github.com/sheikhmunim/ApplyVista.git
cd ApplyVista
```

### 2. Python environment

```bash
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Ollama

```bash
ollama pull llama3.2:3b
ollama serve
```

### 4. Profile config

Copy the template and fill in your details:

```bash
cp src/profile_config\(template\).txt src/profile_config.py
```

Drop your CV (PDF) and any project docs into `data/job_rag/profile_docs/`.

### 5. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required
OLLAMA_HOST=http://localhost:11434
LLM_MODEL=llama3.2:3b

# Optional — GitHub engineer discovery
GITHUB_TOKEN=ghp_your_token_here

# Optional — Job scout email alerts (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASSWORD=your_app_password     # Gmail App Password, not account password
ALERT_EMAIL=your_gmail@gmail.com

# Job scout search config
SCOUT_ROLE=ML Engineer
SCOUT_LOCATION=Melbourne
```

> Gmail App Password: [myaccount.google.com → Security → App passwords](https://myaccount.google.com/apppasswords) (requires 2FA)

### 6. Frontend dependencies

```bash
cd frontend
npm install
```

---

## Running

**Terminal 1 — Backend:**
```bash
uvicorn app.api:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

| URL | Description |
|---|---|
| http://localhost:3000 | Main app |
| http://localhost:3000/scout | Job scout dashboard |
| http://localhost:8000/docs | Swagger API explorer |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/jd` | Run full LangGraph pipeline |
| `POST` | `/export/docx` | Convert text to DOCX |
| `POST` | `/export/pdf` | Convert text to PDF |
| `GET` | `/download/{filename}` | Download a file from outputs/ |
| `GET` | `/scout/jobs` | Get all scouted jobs as JSON |
| `GET` | `/scout/status` | Scheduler status + job count |
| `POST` | `/scout/run` | Manually trigger the scout |
| `POST` | `/chat` | RAG chat over your profile docs |
| `GET` | `/health` | Health check |

---

## Workflow

1. Paste a job description into the input box
2. Click **Generate Documents** and wait (~30–60s depending on hardware)
3. Six document tabs appear — each is editable
4. Download any tab as **DOCX** or **PDF**
5. The **Engineers** tab shows GitHub profiles at the company + Excel download
6. Open `/scout` to see jobs found automatically or click **Search Now**

---

## License

MIT License

---

## Author

**Sheikh Abdul Munim**
Master of Artificial Intelligence — RMIT University

[LinkedIn](https://www.linkedin.com/in/sheikh-abdul-munim-b19391158) · [GitHub](https://github.com/sheikhmunim)

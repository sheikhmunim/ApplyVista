# 🌄 ApplyVista — AI-Powered Job Application Assistant (MVP)

**ApplyVista** is an intelligent, offline-first job application assistant that generates **ATS-ready skills, summaries, cover letters, recruiter outreach emails, follow-up emails, and short-form responses**, all grounded in your **own resume and project documents** using a custom Retrieval-Augmented Generation (RAG) pipeline.

Built using **FastAPI**, **Streamlit**, **LangChain**, **Ollama**, and **ChromaDB**, ApplyVista runs completely **locally**, ensuring privacy, speed, and full control of your data.

---

## 🚀 Features

### 🔍 Retrieval-Augmented Generation (RAG)
- Processes and indexes your personal documents  
- Creates embeddings using SentenceTransformers  
- Stores vectors in ChromaDB for semantic search  
- Retrieves the most relevant snippets for grounded LLM outputs  
- Avoids hallucinations by anchoring responses in your real content  

### 🧠 Local LLM (Fully Offline)
- Powered by **Ollama Llama 3.2 (3B)**  
- No API keys  
- No cloud calls  
- No cost  
- 100% private  

### 🧩 Job Application Generation
Automatically produces:
- Key Skills & Keywords  
- ATS-friendly Resume Summary  
- Full Cover Letter  
- Application Email  
- Recruiter Outreach Email  
- Follow-up Email  
- “Why this Job?” Short Response  
- Skill Alignment (Have vs. Gap)  

### 💬 Chat With Your Documents
Ask personalized questions such as:
- “Summarize my machine learning project.”  
- “Rewrite my experience for a senior AI engineer role.”  
- “Give me resume bullet points for my RAG pipeline.”  

### 🖥️ Streamlit Interface
- Paste job description  
- Click **Generate Application Content**  
- Edit each section in its own tab  
- Download results as DOCX or PDF  

### ⚙️ FastAPI Backend
- `/jd` → Full job application package  
- `/chat` → Q&A grounded in your documents  
- Auto-generated Swagger docs at: http://localhost:8000/docs  

---

## 🧰 Tech Stack

| Component     | Purpose |
|---------------|---------|
| **FastAPI**   | Backend REST API |
| **Streamlit** | Frontend UI |
| **Ollama**    | Local LLM runtime |
| **LangChain** | RAG orchestration |
| **ChromaDB**  | Vector storage + retrieval |
| **FPDF/DOCX** | Export utilities |
| **Docker**    | Optional containerization |

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/sheikhmunim/ApplyVista.git
cd ApplyVista
```
### 1️⃣ Clone the Repository

python -m venv .venv
source .venv/bin/activate         # macOS / Linux
.\.venv\Scripts\activate          # Windows

### 3️⃣ Install Dependencies

pip install -r requirements.txt

### 4️⃣ Install & Start Ollama

ollama pull llama3.2:3b
ollama serve

### ▶️ Run the Application

uvicorn app.api:app --reload

API Docs: http://localhost:8000/docs

### Start Streamlit Frontend

streamlit run app/app_fast.py

User Interface: http://localhost:8501

## 🧠 Example Workflow

### **Step 1 — Paste the Job Description**
Insert any job description into the input box.

### **Step 2 — Click *Generate Application Content***
The system will automatically process the description using the NLP pipeline.

### **Step 3 — Receive Automatically Generated Outputs**
You will instantly get:

- **Skills & Keywords**
- **ATS Summary**
- **Cover Letter**
- **Application Email**
- **Recruiter Outreach Email**
- **Follow-up Email**
- **Short “Why this Role?” Answer**
- **Skill Alignment Report**

### **Step 4 — Edit Text Directly in Streamlit**
All generated content is displayed with editable text fields for immediate adjustments.

### **Step 5 — Download as DOCX or PDF**
Export your final application package in your preferred format.

---

## 🛠️ Implementation Notes

### 📌 RAG Pipeline
- Loads and chunks resume and project documents  
- Converts text into vector embeddings  
- Performs top-K similarity search to find the most relevant context  
- Builds structured contextual prompt blocks  
- Generates each component (cover letter, emails, summaries, etc.) using carefully designed prompts  

### 📌 FastAPI Backend
- Clean, well-typed endpoints using **Pydantic** models  
- Stateless design suitable for **Docker** and cloud deployment  
- Separate handlers for:
  - Job description (JD) processing
  - General chat / utility endpoints  

### 📌 Streamlit Frontend
- Multi-tab, in-browser editor for all generated content  
- Real-time updates using **Streamlit session state**  
- Export functionality to download results as **PDF** or **DOCX**  


🐳 **Docker Support (Optional)**

**Build Docker Image**

docker build -t applyvista .


**Run Docker Container**

docker run -p 8000:8000 -p 8501:8501 applyvista


🗺️ **Future Enhancements**
- Resume–JD Matching Score
- Personalized Job Recommendations
- Improved reranking with BGE/ColBERT
- Resume optimization engine
- Skill gap analysis visuals
- Multi-user account system
- Analytics dashboard

🪪 **License**
This project is licensed under the MIT License.

✨ **Author**
**Sheikh Abdul Munim**  
Master of Artificial Intelligence — RMIT University  

🔗 **LinkedIn:** [https://www.linkedin.com/in/sheikh-abdul-munim-b19391158](https://www.linkedin.com/in/sheikh-abdul-munim-b19391158)  
🔗 **GitHub:** [https://github.com/sheikhmunim](https://github.com/sheikhmunim)
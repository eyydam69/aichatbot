# AI Chatbot with RAG

An AI-powered chatbot using Angular frontend and Python backend with:
- PDF/TXT document ingestion
- FAISS vector database for embeddings
- LangChain orchestration
- LLaMA 3 via Ollama (local, no API key)

## Project Structure

```
chatbotai/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Config, models, constants
│   │   ├── services/    # Business logic (RAG, embeddings)
│   │   └── utils/       # Helpers
│   ├── data/            # Uploads & vector store
│   ├── tests/           # Unit tests
│   ├── requirements.txt # Python dependencies
│   └── main.py          # Entry point
├── frontend/            # Angular application
│   └── src/
│       └── app/
│           ├── components/  # Chat, Upload UI
│           ├── services/    # API calls
│           └── models/      # TypeScript interfaces
├── docs/                # Documentation
└── scripts/             # Setup & deployment scripts
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- Ollama installed locally
- LLaMA 3 pulled via Ollama: `ollama pull llama3`

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

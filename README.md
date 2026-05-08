# AI Chatbot with RAG (Retrieval-Augmented Generation)

A complete AI-powered chatbot system that lets you upload documents (PDF/TXT) and ask questions about their content. Built with Angular frontend, Python FastAPI backend, LangChain for RAG pipeline, FAISS for vector storage, and LLaMA 3 via Ollama for local AI responses - no API keys required!

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐         HTTP/REST          ┌──────────────────────┐    │
│  │   ANGULAR       │ ◄───────────────────────► │   PYTHON/FASTAPI    │    │
│  │   FRONTEND      │     (Port 4200/4201)      │      BACKEND         │    │
│  │   (Port 4201)   │                           │     (Port 8000)       │    │
│  └─────────────────┘                           └──────────────────────┘    │
│           │                                              │                   │
│           │                                              │                   │
│           ▼                                              ▼                   │
│  ┌─────────────────┐                           ┌──────────────────────┐    │
│  │  - Chat UI      │                           │  - Document Upload   │    │
│  │  - File Upload  │                           │  - Text Processing   │    │
│  │  - HTTP Client  │                           │  - Vector Store (FAISS)│   │
│  └─────────────────┘                           │  - LLM Integration   │    │
│                                                └──────────────────────┘    │
│                                                         │                    │
│                                                         ▼                    │
│                                                ┌──────────────────────┐    │
│                                                │   EMBEDDING MODEL     │    │
│                                                │ (all-MiniLM-L6-v2)    │    │
│                                                │   HuggingFace         │    │
│                                                └──────────────────────┘    │
│                                                         │                    │
│                                                         ▼                    │
│                                                ┌──────────────────────┐    │
│                                                │      LLaMA 3         │    │
│                                                │    via OLLAMA         │    │
│                                                │   (Local LLM)         │    │
│                                                └──────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## How It Works - Complete Data Flow

### 1. Document Upload Flow

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  User    │───►│ Frontend │───►│   Backend    │───►│   Document  │───►│   FAISS     │
│ Uploads  │    │ (Upload) │    │  (/upload)   │    │  Processor  │    │ Vector DB   │
│   File   │    └──────────┘    └──────────────┘    └─────────────┘    └─────────────┘
└──────────┘
                                                                              │
                                                                              ▼
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  User    │◄───│ Frontend │◄───│   Backend    │◄───│   Save      │◄───│  Embed +    │
│  Sees    │    │(Success) │    │   Response   │    │  Vectors    │    │  Index      │
│ Message  │    └──────────┘    └──────────────┘    └─────────────┘    └─────────────┘
└──────────┘

STEP-BY-STEP:
1. User selects PDF/TXT file via Angular UploadComponent
2. File sent via HTTP POST to /api/upload endpoint
3. FastAPI saves file to backend/data/uploads/
4. DocumentLoader (PyPDFLoader/TextLoader) extracts text
5. CharacterTextSplitter chunks text into segments (500 chars, 50 overlap)
6. HuggingFaceEmbeddings converts chunks to vectors (384 dimensions)
7. FAISS vector store indexes and saves to backend/data/vectorstore/
8. Success message returned to frontend
```

### 2. Chat/Query Flow

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  User    │───►│ Frontend │───►│   Backend    │───►│   Retriever │───►│   FAISS     │
│ Asks     │    │ (Chat)   │    │   (/chat)    │    │   Search    │    │  Query      │
│Question  │    └──────────┘    └──────────────┘    └─────────────┘    └─────────────┘
└──────────┘
                                                                              │
                                                                              ▼
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  User    │◄───│ Frontend │◄───│   Backend    │◄───│   Format    │◄───│  Top 3      │
│  Sees    │    │ (Answer) │    │   Response   │    │   Context   │    │  Chunks     │
│  Answer  │    └──────────┘    └──────────────┘    └─────────────┘    └─────────────┘
└──────────┘                                            │
                                                        ▼
                                               ┌─────────────────┐
                                               │     LLaMA 3     │
                                               │   (via Ollama)  │
                                               │   Generate      │
                                               │   Response      │
                                               └─────────────────┘

STEP-BY-STEP:
1. User types question in Angular ChatComponent
2. Question sent via HTTP POST to /api/chat endpoint
3. Backend loads FAISS vector store (if not already loaded)
4. Question converted to embedding via HuggingFaceEmbeddings
5. FAISS similarity search finds top 3 most relevant chunks
6. Retrieved context + question formatted into LLM prompt
7. LLaMA 3 via Ollama generates answer based ONLY on context
8. Answer + source snippets returned to frontend
9. Frontend displays answer in chat bubble
```

---

## Technology Stack

### Backend (Python)
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Web Framework | FastAPI | REST API endpoints |
| RAG Pipeline | LangChain | Document processing, chunking, retrieval |
| Embeddings | HuggingFace (all-MiniLM-L6-v2) | Text → Vector conversion (384-dim) |
| Vector DB | FAISS | Efficient similarity search |
| LLM | Ollama + LLaMA 3 | Local AI text generation |
| File Handling | python-multipart | Upload processing |
| Data Processing | pandas, numpy | Analytics/ML utilities |
| Visualization | matplotlib, seaborn | Data visualization |
| Web UI (Alt) | Streamlit | Alternative standalone interface |

### Frontend (Angular)
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Angular 17+ | Modern web application |
| HTTP Client | @angular/common/http | Backend API communication |
| UI Components | Standalone Components | Chat interface, file upload |
| Forms | Reactive Forms | Input handling |
| Styling | CSS3 | Responsive design |

---

## Project Structure

```
aichatbot/
│
├── backend/                          # Python FastAPI Application
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py             # REST endpoints: /upload, /chat, /status
│   │   ├── core/
│   │   │   └── config.py             # Configuration: paths, models, chunk sizes
│   │   └── services/
│   │       └── rag_service.py        # Core RAG logic: embeddings, retrieval, LLM
│   ├── data/
│   │   ├── uploads/                  # Uploaded PDF/TXT files
│   │   └── vectorstore/              # FAISS index files
│   ├── main.py                       # FastAPI entry point
│   ├── requirements.txt              # Python dependencies
│   └── app/__init__.py               # Package init
│
├── frontend/                         # Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── chat/             # Chat UI component
│   │   │   │   │   └── chat.component.ts
│   │   │   │   └── upload/           # File upload component
│   │   │   │       └── upload.component.ts
│   │   │   ├── services/
│   │   │   │   └── chat.service.ts   # HTTP client for backend API
│   │   │   ├── models/
│   │   │   │   └── chat.models.ts    # TypeScript interfaces
│   │   │   └── app.component.ts      # Root component
│   │   ├── index.html                # Main HTML
│   │   ├── main.ts                   # Bootstrap entry
│   │   └── styles.css                # Global styles
│   ├── angular.json                  # Angular CLI config
│   ├── package.json                  # Node dependencies
│   └── tsconfig.json                 # TypeScript config
│
├── README.md                         # This documentation
└── .gitignore                        # Git exclusions
```

---

## Key Components Explained

### 1. RAG Service (`backend/app/services/rag_service.py`)

The heart of the system - handles document processing and question answering:

```python
class RAGService:
    - __init__(): Initialize embeddings (HuggingFace) + LLM (Ollama)
    - load_document(): Process PDF/TXT → chunks → embeddings → FAISS index
    - query(): Retrieve relevant chunks → prompt LLaMA 3 → return answer
```

**Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2`
- Converts text to 384-dimensional vectors
- Optimized for semantic similarity
- Runs locally, no API key needed

**Chunking Strategy**:
- Size: 500 characters
- Overlap: 50 characters
- Ensures context continuity between chunks

### 2. API Routes (`backend/app/api/routes.py`)

Three main endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Accepts file, processes, creates vector store |
| `/api/chat` | POST | Accepts question, returns AI answer with sources |
| `/api/status` | GET | Returns whether documents are loaded |

### 3. Frontend Components

**UploadComponent** (`frontend/src/app/components/upload/upload.component.ts`):
- Drag & drop file upload
- Supports PDF and TXT
- Shows upload progress/status

**ChatComponent** (`frontend/src/app/components/chat/chat.component.ts`):
- Chat message display (user/assistant bubbles)
- Message input with send button
- Loading indicators

**ChatService** (`frontend/src/app/services/chat.service.ts`):
- HTTP methods: uploadFile(), sendMessage(), getStatus()
- Base URL: `http://localhost:8000/api`

---

## Prerequisites

### Required Software
1. **Python 3.10+** - Backend runtime
2. **Node.js 18+** - Frontend build tools
3. **Ollama** - Local LLM server
   - Download: https://ollama.com/download
   - Install LLaMA 3: `ollama pull llama3`

### Optional but Recommended
- **Git** - Version control
- **VS Code** - IDE with Python/Angular extensions

---

## Quick Start Guide

### Step 1: Clone Repository
```bash
git clone https://github.com/eyydam69/aichatbot.git
cd aichatbot
```

### Step 2: Install Ollama and Download LLaMA 3

**Windows:**
```powershell
# Download from https://ollama.com/download and install
# Then in terminal:
ollama pull llama3
ollama serve  # Starts Ollama server
```

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3
ollama serve
```

### Step 3: Setup Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python main.py
```

**Backend will start on:** http://localhost:8000

### Step 4: Setup Frontend

Open a **new terminal** (keep backend running):

```bash
cd frontend

# Install dependencies
npm install

# Start Angular dev server
ng serve --port 4201
```

**Frontend will start on:** http://localhost:4201

### Step 5: Use the Chatbot

1. Open browser: http://localhost:4201
2. Upload a document (PDF or TXT)
3. Wait for "Processed X chunks" message
4. Type questions about the document content
5. Get AI-generated answers based on your document!

---

## API Documentation

### Upload Document
```http
POST /api/upload
Content-Type: multipart/form-data

Parameters:
  - file: File (PDF or TXT)

Response:
  {
    "message": "Processed 42 chunks from ndis_overview.txt"
  }
```

### Chat/Query
```http
POST /api/chat
Content-Type: application/json

Body:
  {
    "question": "What is the NDIS?"
  }

Response:
  {
    "answer": "The NDIS is the National Disability Insurance Scheme...",
    "sources": ["Context chunk 1...", "Context chunk 2..."]
  }
```

### Check Status
```http
GET /api/status

Response:
  {
    "documents_loaded": true
  }
```

---

## Configuration

Edit `backend/app/core/config.py` to customize:

```python
# Embedding model (HuggingFace)
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# LLM model (Ollama)
LLM_MODEL = "llama3"

# Text chunking
CHUNK_SIZE = 500        # Characters per chunk
CHUNK_OVERLAP = 50      # Overlap between chunks

# Storage paths
UPLOAD_DIR = "data/uploads"
VECTORSTORE_DIR = "data/vectorstore"
```

---

## Troubleshooting

### Backend won't start (Port 8000 in use)
```bash
# Find and kill process on port 8000
# Windows:
Get-NetTCPConnection -LocalPort 8000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Or use different port:
python main.py --port 8001
```

### "Failed to get response" when chatting
1. Check Ollama is running: `ollama list`
2. Ensure LLaMA 3 is downloaded: `ollama pull llama3`
3. Check backend terminal for error messages
4. Verify documents are uploaded: GET http://localhost:8000/api/status

### Frontend build errors
```bash
cd frontend
rm -rf node_modules  # Delete node_modules
npm install          # Reinstall
ng serve --port 4201
```

### CORS errors
Backend already includes CORS middleware for `localhost:4200/4201`. If using different ports, edit `main.py`:
```python
allow_origins=["http://localhost:YOUR_PORT"]
```

---

## How RAG Works (Technical Deep Dive)

### What is RAG?
**R**etrieval-**A**ugmented **G**eneration - A technique where:
1. User query retrieves relevant documents from a knowledge base
2. Retrieved context is added to the LLM prompt
3. LLM generates answer based ONLY on provided context
4. Eliminates hallucinations, ensures factual accuracy

### Why Local LLM (Ollama + LLaMA 3)?
- **Privacy**: Documents never leave your computer
- **Cost**: No API fees (OpenAI, Anthropic, etc.)
- **Offline**: Works without internet after initial setup
- **Control**: Full control over model and parameters

### Why FAISS?
- **Speed**: Millisecond similarity search on thousands of chunks
- **Local**: Runs entirely on your machine
- **Efficient**: Optimized for high-dimensional vectors
- **Scalable**: Handles millions of vectors

### Embeddings Explained
Embeddings convert text to numerical vectors capturing semantic meaning:
- "king" and "monarch" have similar vectors
- "cat" and "dog" are closer than "cat" and "car"
- Enables finding relevant chunks even with different wording

---

## Future Enhancements

Potential improvements you could add:
- [ ] Multiple document support
- [ ] Conversation history/memory
- [ ] Different LLM models (Mistral, Llama2, etc.)
- [ ] Web search integration
- [ ] Document deletion/management
- [ ] User authentication
- [ ] Docker deployment
- [ ] Cloud deployment (AWS/GCP/Azure)

---

## License

MIT License - Feel free to use, modify, and distribute.

---

## Credits

- **LangChain**: RAG pipeline framework
- **HuggingFace**: Embeddings and model hub
- **Ollama**: Local LLM serving
- **FAISS**: Facebook AI Similarity Search
- **FastAPI**: Modern Python web framework
- **Angular**: Frontend framework

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review backend terminal for error messages
3. Open an issue on GitHub: https://github.com/eyydam69/aichatbot/issues

---

**Happy Chatting! 🤖**

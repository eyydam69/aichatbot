# Request Flow: Which File Handles User Input First?

## The Chain of Files (Frontend → Backend)

When a user uploads a file or asks a question, here's the exact order of files that handle the request:

---

## FILE 1: Component Template (HTML) - FIRST CONTACT

**File:** `frontend/src/app/components/upload/upload.component.ts` (Template section)
**or** `frontend/src/app/components/chat/chat.component.ts` (Template section)

**Role:** Detects the user action (click, file selection, enter key)

```
User clicks "Upload" button
        │
        ▼
┌─────────────────────────────────┐
│  TEMPLATE (HTML in .ts file)   │
│                                 │
│  <input type="file"            │
│    (change)="onFileSelected($event)">  ←── EVENT BINDING
│                                 │
│  <button (click)="uploadFile()"> ←── CLICK HANDLER
│    Upload                       │
│  </button>                       │
└─────────────────────────────────┘
```

**What it does:**
- Listens for DOM events (click, change, drag-drop)
- Calls component methods when events occur
- NO HTTP calls here - just event detection

---

## FILE 2: Component Class (TypeScript) - EVENT HANDLER

**File:** `frontend/src/app/components/upload/upload.component.ts` (Class section)
**or** `frontend/src/app/components/chat/chat.component.ts` (Class section)

**Role:** Processes the event and calls the Service

```
┌─────────────────────────────────┐
│  COMPONENT CLASS (.ts)         │
│                                 │
│  export class UploadComponent { │
│                                 │
│    onFileSelected(event) {     │
│      const file = event.       │
│              target.files[0];  │
│      this.uploadFile(file);    │ ←── Calls service
│    }                           │
│                                 │
│    uploadFile(file) {          │
│      this.chatService.         │ ←── CALLS SERVICE
│        uploadFile(file)        │
│        .subscribe(response => { │
│          this.message =        │
│            response.message;    │
│        });                     │
│    }                           │
│  }                             │
└─────────────────────────────────┘
```

**What it does:**
- Extracts data from event (file, text input)
- Updates local UI state (loading, error messages)
- Calls Service to make HTTP request
- Handles response and updates UI

---

## FILE 3: Service (TypeScript) - HTTP CALLER

**File:** `frontend/src/app/services/chat.service.ts`

**Role:** Makes the actual HTTP request to backend

```
┌─────────────────────────────────┐
│  SERVICE (.ts)                 │
│                                 │
│  @Injectable()                 │
│  export class ChatService {    │
│                                 │
│    private apiUrl =            │
│      'http://localhost:8000/api'; │
│                                 │
│    uploadFile(file: File) {    │
│      const formData = new      │
│                  FormData();   │
│      formData.append('file',   │
│                  file);        │
│                                 │
│      return this.http.post(    │ ←── HTTP POST
│        `${this.apiUrl}/upload`, │
│        formData                │
│      );                        │
│    }                           │
│                                 │
│    sendMessage(question) {     │
│      return this.http.post(    │ ←── HTTP POST
│        `${this.apiUrl}/chat`,  │
│        { question }            │
│      );                        │
│    }                           │
│  }                             │
└─────────────────────────────────┘
```

**What it does:**
- Builds HTTP request (URL, method, body, headers)
- Uses Angular's HttpClient
- Returns Observable for async response
- NO business logic - just API communication

---

## NETWORK JUMP (Browser → Server)

The HTTP request travels across the network:
```
Angular HttpClient
      │
      ▼
Browser XMLHttpRequest
      │
      ▼
Network (localhost:4201 → localhost:8000)
      │
      ▼
Uvicorn Server (listening on port 8000)
      │
      ▼
FastAPI Application
```

---

## FILE 4: FastAPI Main (Python) - SERVER ENTRY

**File:** `backend/main.py`

**Role:** Creates the FastAPI app and mounts routers

```python
┌─────────────────────────────────┐
│  main.py                       │
│                                 │
│  from fastapi import FastAPI   │
│  from app.api import routes    │
│                                 │
│  app = FastAPI()               │ ←── Creates app
│                                 │
│  # Enable CORS for frontend     │
│  app.add_middleware(           │
│    CORSMiddleware,             │
│    allow_origins=[             │
│      "http://localhost:4201"   │
│    ]                           │
│  )                             │
│                                 │
│  # Mount routes                │
│  app.include_router(           │ ←── MOUNTS ROUTER
│    routes.router,              │
│    prefix="/api"               │
│  )                             │
│                                 │
│  if __name__ == "__main__":   │
│    uvicorn.run(app,            │
│      host="0.0.0.0",         │
│      port=8000               │
│    )                           │
└─────────────────────────────────┘
```

**What it does:**
- Creates FastAPI application instance
- Adds CORS middleware (security)
- Mounts API routes under `/api` prefix
- Starts Uvicorn server
- NO route handling - just setup

---

## FILE 5: API Routes (Python) - ROUTE HANDLER

**File:** `backend/app/api/routes.py`

**Role:** Defines URL endpoints and handles HTTP requests

```python
┌─────────────────────────────────┐
│  routes.py                     │
│                                 │
│  from fastapi import APIRouter │
│  from app.services.rag_service │
│    import rag_service         │
│                                 │
│  router = APIRouter()          │ ←── Creates router
│                                 │
│  @router.post("/upload")       │ ←── ROUTE DEFINITION
│  async def upload_file(        │
│    file: UploadFile = File(...) │
│  ):                            │
│    # Save file                 │
│    # Process document          │
│    chunks = rag_service.       │ ←── CALLS SERVICE
│      load_document(file_path)  │
│    return {                    │ ←── RETURNS JSON
│      "message": f"Processed   │
│        {chunks} chunks"       │
│    }                           │
│                                 │
│  @router.post("/chat")         │ ←── ROUTE DEFINITION
│  async def chat(request: dict): │
│    result = rag_service.       │ ←── CALLS SERVICE
│      query(request["question"])│
│    return result               │ ←── RETURNS JSON
│                                 │
│  @router.get("/status")        │ ←── ROUTE DEFINITION
│  async def status():           │
│    ...                         │
└─────────────────────────────────┘
```

**What it does:**
- Defines URL paths (`/upload`, `/chat`, `/status`)
- Matches HTTP methods (POST, GET)
- Extracts request data (files, JSON body)
- Calls business logic service
- Returns JSON response
- NO AI/ML logic - just HTTP handling

---

## FILE 6: RAG Service (Python) - BUSINESS LOGIC

**File:** `backend/app/services/rag_service.py`

**Role:** Core AI logic (embeddings, retrieval, LLM calls)

```python
┌─────────────────────────────────┐
│  rag_service.py                │
│                                 │
│  class RAGService:             │
│                                 │
│    def __init__(self):         │
│      self.embeddings =         │
│        HuggingFaceEmbeddings() │
│      self.llm = OllamaLLM(     │
│        model="llama3"          │
│      )                         │
│                                 │
│    def load_document(self,     │
│                       file_path): │
│      # 1. Load PDF/TXT         │
│      loader = PyPDFLoader(...) │
│      documents = loader.load() │
│                                 │
│      # 2. Split into chunks     │
│      splitter = CharacterTextSplitter() │
│      chunks = splitter.split_documents(documents) │
│                                 │
│      # 3. Create embeddings     │
│      self.vectorstore = FAISS.from_documents(chunks, self.embeddings) │
│                                 │
│      # 4. Save to disk         │
│      self.vectorstore.save_local(...) │
│                                 │
│      return len(chunks)        │
│                                 │
│    def query(self, question):  │
│      # 1. Load vector store     │
│      # 2. Search similar docs   │
│      docs = self.vectorstore.  │
│        as_retriever().invoke(question) │
│                                 │
│      # 3. Build prompt          │
│      prompt = f"Answer: {docs} Question: {question}" │
│                                 │
│      # 4. Call LLaMA 3          │
│      answer = self.llm.invoke(prompt) │
│                                 │
│      return {                   │
│        "answer": answer,       │
│        "sources": [...]          │
│      }                         │
│                                 │
│  rag_service = RAGService()    │ ←── SINGLETON INSTANCE
└─────────────────────────────────┘
```

**What it does:**
- Initializes AI models (embeddings + LLM)
- Processes documents (PDF/TXT → chunks → vectors)
- Handles questions (search → retrieve → generate)
- Manages FAISS vector database
- NO HTTP handling - pure business logic

---

## FILE 7: Config (Python) - SETTINGS

**File:** `backend/app/core/config.py`

**Role:** Central configuration (constants, paths, model names)

```python
┌─────────────────────────────────┐
│  config.py                     │
│                                 │
│  EMBEDDING_MODEL =             │
│    "all-MiniLM-L6-v2"         │
│                                 │
│  LLM_MODEL = "llama3"         │
│                                 │
│  CHUNK_SIZE = 500             │
│  CHUNK_OVERLAP = 50           │
│                                 │
│  UPLOAD_DIR = "data/uploads"   │
│  VECTORSTORE_DIR =             │
│    "data/vectorstore"         │
└─────────────────────────────────┘
```

**What it does:**
- Stores configuration constants
- Used by RAGService
- Easy to modify settings in one place

---

## COMPLETE FILE CHAIN

```
USER ACTION
    │
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTEND (Browser)                                                  │
│                                                                     │
│  1. upload.component.ts (Template)  ←── FIRST: Detects click/event   │
│     └─> 2. upload.component.ts (Class)                              │
│          └─> 3. chat.service.ts  ←── HTTP CALLER                    │
│               └─> POST http://localhost:8000/api/upload              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Network
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BACKEND (Server)                                                    │
│                                                                     │
│  4. main.py  ←── SERVER ENTRY: Creates app, mounts routes            │
│     └─> 5. routes.py  ←── ROUTE HANDLER: Matches URL, extracts data │
│          └─> 6. rag_service.py  ←── BUSINESS LOGIC: AI processing    │
│               └─> 7. config.py  ←── SETTINGS: Model names, paths     │
│                    └─> 8. FAISS/Ollama  ←── EXTERNAL: Vector DB, LLM│
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ JSON Response
                              ▼
                    Back to Frontend (Step 3 → Step 2 → Step 1)
```

---

## SUMMARY: FIRST FILE FOR EACH ACTION

| User Action | First File (Frontend) | First File (Backend) |
|-------------|----------------------|----------------------|
| **Click Upload button** | `upload.component.ts` (Template) | `routes.py` (POST /upload handler) |
| **Select file** | `upload.component.ts` (onFileSelected) | N/A (wait for upload click) |
| **Type question** | `chat.component.ts` (Template input) | N/A (wait for send) |
| **Click Send** | `chat.component.ts` (sendMessage) | `routes.py` (POST /chat handler) |

---

## KEY INSIGHTS

1. **Template** = Event Listener (FIRST contact)
2. **Component** = Coordinator (handles UI + calls service)
3. **Service** = HTTP Client (only makes API calls)
4. **main.py** = Server Setup (creates app, not request handler)
5. **routes.py** = Request Handler (FIRST backend contact)
6. **rag_service.py** = Brain (AI logic, no HTTP knowledge)

---

## QUICK REFERENCE

```
USER CLICKS "UPLOAD"
    ↓
[1] upload.component.ts (Template)
    "(click)=uploadFile()"
    ↓
[2] upload.component.ts (Class)
    uploadFile() { chatService.uploadFile() }
    ↓
[3] chat.service.ts
    http.post('/api/upload')
    ↓
[NETWORK]
    ↓
[4] main.py (already running - just setup)
    ↓
[5] routes.py ← FIRST BACKEND FILE
    @router.post('/upload')
    def upload_file():
        rag_service.load_document()
    ↓
[6] rag_service.py
    load_document():
        - PyPDFLoader
        - CharacterTextSplitter
        - HuggingFaceEmbeddings
        - FAISS.save_local()
    ↓
[7] config.py (settings)
    ↓
Response back up the chain...
```

**Answer:** The first file to handle user input depends on which side you're on:
- **Frontend First:** `upload.component.ts` or `chat.component.ts` (Template)
- **Backend First:** `routes.py` (FastAPI router)

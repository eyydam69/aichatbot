# Frontend to Backend Routing Explained

## Overview

This document explains how data flows between the Angular frontend and Python FastAPI backend, detailing every route, request, and response.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT-SERVER ROUTING                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   BROWSER (User)                                                             │
│      │                                                                       │
│      ▼                                                                       │
│   ┌────────────────────┐                                                     │
│   │  ANGULAR FRONTEND  │  http://localhost:4201                            │
│   │  (Single Page App) │                                                     │
│   │                    │                                                     │
│   │  ┌──────────────┐  │         HTTP REQUESTS                             │
│   │  │   Routes     │  │◄──────────────────────────────────────────┐       │
│   │  │   (Paths)    │  │                                          │       │
│   │  └──────────────┘  │                                          │       │
│   │         │          │                                          │       │
│   │         ▼          │                                          │       │
│   │  ┌──────────────┐  │                                          │       │
│   │  │   Services   │  │◄──────────────────────────────────────────┤       │
│   │  │ (HTTP Client)│  │        GET / POST / DELETE                 │       │
│   │  └──────────────┘  │                                          │       │
│   │         │          │                                          │       │
│   └─────────┼──────────┘                                          │       │
│             │                                                      │       │
│             │  CORS Enabled                                        │       │
│             ▼                                                      │       │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                         NETWORK (HTTP)                               │  │
│   │              localhost:4201 ◄────► localhost:8000                   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│             │                                                      ▲       │
│             │                                                      │       │
│   ┌─────────┼──────────────────────────────────────────────────────┤       │
│   │         ▼                                                      │       │
│   │  ┌────────────────────┐                                         │       │
│   │  │  FASTAPI BACKEND  │  http://localhost:8000                   │       │
│   │  │    (REST API)     │                                         │       │
│   │  │                   │◄───────────────────────────────────────────┘       │
│   │  │  ┌────────────┐  │         Routes (Endpoints)                     │
│   │  │  │  Router    │  │                                               │
│   │  │  │   /api/*   │  │                                               │
│   │  │  └────────────┘  │                                               │
│   │  │       │          │                                               │
│   │  │       ▼          │                                               │
│   │  │  ┌────────────┐  │                                               │
│   │  │  │  Services  │  │                                               │
│   │  │  │   (RAG)    │  │                                               │
│   │  │  └────────────┘  │                                               │
│   │  │       │          │                                               │
│   │  │       ▼          │                                               │
│   │  │  ┌────────────┐  │                                               │
│   │  │  │  Models    │  │                                               │
│   │  │  │  (LLM/DB)  │  │                                               │
│   │  │  └────────────┘  │                                               │
│   │  └───────────────────┘                                               │
│   └────────────────────────────────────────────────────────────────────────┘
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. FRONTEND ROUTES (Angular)

### What is Routing in Angular?

Angular is a Single Page Application (SPA) framework. Instead of loading new pages, it swaps components in the same page based on the URL path.

**File:** `frontend/src/main.ts`
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([]),  // Empty router - no page navigation, all in one view
    provideHttpClient()  // HTTP client for API calls
  ]
});
```

**Note:** In this simple chatbot, we use NO frontend routes (empty router array). Everything is on one page.

### Frontend Components Structure

```
Browser URL: http://localhost:4201
                    │
                    ▼
            ┌───────────────┐
            │  AppComponent │ (Root container)
            │  (app-root)   │
            └───────┬───────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌───────────────┐
│  UploadComponent│      │  ChatComponent│
│  (File Upload) │      │  (Chat UI)    │
└───────────────┘      └───────────────┘
        │                       │
        ▼                       ▼
   Calls HTTP              Calls HTTP
   POST /api/upload        POST /api/chat
```

---

## 2. BACKEND ROUTES (FastAPI)

### What is a Route/Endpoint?

A route is a URL path that the backend listens to. When a request matches that path, the backend executes specific code.

**File:** `backend/app/api/routes.py`

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api")  # All routes start with /api

@router.post("/upload")   # Full path: POST /api/upload
async def upload_file(...):
    # Handle file upload
    pass

@router.post("/chat")     # Full path: POST /api/chat
async def chat(...):
    # Handle chat question
    pass

@router.get("/status")    # Full path: GET /api/status
async def status():
    # Check document status
    pass
```

### Route Registration

**File:** `backend/main.py`
```python
from fastapi import FastAPI
from app.api import routes

app = FastAPI()
app.include_router(routes.router, prefix="/api")

# This creates:
#   /api/upload
#   /api/chat
#   /api/status
```

---

## 3. COMPLETE REQUEST-RESPONSE FLOW

### Route 1: Upload Document

**Purpose:** Send PDF/TXT file from frontend to backend for processing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UPLOAD DOCUMENT FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: User clicks "Upload" in Browser
══════════════════════════════════════════════════════════════════════════════
  Browser (localhost:4201)
         │
         ▼
  Angular UploadComponent
  ┌────────────────────────────────┐
  │  File selected via:            │
  │  - Drag & drop                 │
  │  - File picker button          │
  │                                │
  │  Template: (upload.component.ts)
  │  <input type="file" 
  │         accept=".pdf,.txt"
  │         (change)="onFileSelected($event)">
  └────────────────────────────────┘


STEP 2: Frontend Prepares HTTP Request
══════════════════════════════════════════════════════════════════════════════
  Angular ChatService
  ┌────────────────────────────────┐
  │  uploadFile(file: File) {      │
  │    const formData = new        │
  │                  FormData();   │
  │    formData.append('file',     │
  │                    file);      │
  │                                │
  │    return this.http.post(      │
  │      'http://localhost:8000/api/upload',
  │      formData                  │
  │    );                          │
  │  }                             │
  └────────────────────────────────┘


STEP 3: HTTP Request Travels Network
══════════════════════════════════════════════════════════════════════════════
  REQUEST:
  ┌────────────────────────────────────────────────────────┐
  │ POST /api/upload HTTP/1.1                             │
  │ Host: localhost:8000                                   │
  │ Content-Type: multipart/form-data                     │
  │ Origin: http://localhost:4201                       │
  │                                                        │
  │ ------WebKitFormBoundary                               │
  │ Content-Disposition: form-data; name="file"           │
  │ filename="document.pdf"                               │
  │ Content-Type: application/pdf                         │
  │                                                        │
  │ [BINARY FILE DATA]                                     │
  │ ------WebKitFormBoundary--                             │
  └────────────────────────────────────────────────────────┘
         │
         │  Network (localhost)
         ▼
  FastAPI Backend (localhost:8000)


STEP 4: Backend Receives & Processes
══════════════════════════════════════════════════════════════════════════════
  FastAPI Router
  ┌────────────────────────────────┐
  │ @router.post("/upload")        │
  │ async def upload_file(        │
  │   file: UploadFile = File(...) │
  │ ):                             │
  │                                │
  │  # 1. Save file to disk        │
  │  file_path = "data/uploads/"   │
  │             + file.filename    │
  │  with open(file_path, "wb")    │
  │                     as buffer: │
  │    shutil.copyfileobj(...)     │
  │                                │
  │  # 2. Process with RAG         │
  │  chunks = rag_service.         │
  │        load_document(          │
  │          file_path             │
  │        )                       │
  │                                │
  │  # 3. Return response          │
  │  return {                      │
  │    "message": f"Processed      │
  │       {chunks} chunks"         │
  │  }                             │
  └────────────────────────────────┘


STEP 5: RAG Processing (Behind the Scenes)
══════════════════════════════════════════════════════════════════════════════
  RAGService
  ┌────────────────────────────────┐
  │ load_document(file_path):      │
  │                                │
  │ 1. PyPDFLoader/TextLoader      │
  │    → Extract raw text          │
  │                                │
  │ 2. CharacterTextSplitter       │
  │    → Split into 500-char       │
  │      chunks with 50-char       │
  │      overlap                   │
  │                                │
  │ 3. HuggingFaceEmbeddings       │
  │    → Convert to 384-dim        │
  │      vectors                   │
  │                                │
  │ 4. FAISS                       │
  │    → Store vectors locally     │
  │    → Save to disk              │
  └────────────────────────────────┘


STEP 6: HTTP Response Returns
══════════════════════════════════════════════════════════════════════════════
  RESPONSE:
  ┌────────────────────────────────────────────────────────┐
  │ HTTP/1.1 200 OK                                        │
  │ Content-Type: application/json                        │
  │ Access-Control-Allow-Origin: *                        │
  │                                                        │
  │ {                                                      │
  │   "message": "Processed 42 chunks                     │
  │              from document.pdf"                       │
  │ }                                                      │
  └────────────────────────────────────────────────────────┘
         │
         │  Network
         ▼
  Angular Frontend (localhost:4201)


STEP 7: Frontend Updates UI
══════════════════════════════════════════════════════════════════════════════
  UploadComponent
  ┌────────────────────────────────┐
  │  .subscribe({                 │
  │    next: (response) => {       │
  │      this.message =            │
  │        response.message;       │
  │      // Shows: "Processed 42   │
  │      //         chunks..."     │
  │    },                          │
  │    error: (error) => {         │
  │      this.message =            │
  │        'Error: ' + error;      │
  │    }                           │
  │  });                           │
  └────────────────────────────────┘

         │
         ▼
  User sees success message in browser!
```

---

### Route 2: Chat/Ask Question

**Purpose:** Send user question and get AI-generated answer

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHAT/QUERY FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: User Types Question
══════════════════════════════════════════════════════════════════════════════
  Browser (localhost:4201)
         │
         ▼
  Angular ChatComponent
  ┌────────────────────────────────┐
  │ Template:                     │
  │ <input [(ngModel)]="question" │
  │   placeholder="Ask about..."  │
  │   (keyup.enter)="send()">    │
  │                                │
  │ <button (click)="send()">     │
  │   Send                         │
  │ </button>                      │
  └────────────────────────────────┘


STEP 2: Frontend Prepares HTTP Request
══════════════════════════════════════════════════════════════════════════════
  ChatComponent.sendMessage()
  ┌────────────────────────────────┐
  │ sendMessage() {                │
  │   // Add to chat UI           │
  │   this.messages.push({         │
  │     role: 'user',             │
  │     content: question         │
  │   });                          │
  │                                │
  │   // Call service             │
  │   this.chatService.            │
  │     sendMessage(question)      │
  │     .subscribe(response => {    │
  │       // Handle response       │
  │     });                        │
  │ }                              │
  └────────────────────────────────┘


STEP 3: HTTP POST Request
══════════════════════════════════════════════════════════════════════════════
  ChatService
  ┌────────────────────────────────┐
  │ sendMessage(question) {        │
  │   return this.http.post(       │
  │     'http://localhost:8000/api/chat',
  │     { question: question }     │
  │   );                           │
  │ }                              │
  └────────────────────────────────┘
         │
         ▼
  REQUEST:
  ┌────────────────────────────────────────────────────────┐
  │ POST /api/chat HTTP/1.1                               │
  │ Host: localhost:8000                                   │
  │ Content-Type: application/json                        │
  │                                                        │
  │ {                                                      │
  │   "question": "What is the NDIS?"                    │
  │ }                                                      │
  └────────────────────────────────────────────────────────┘


STEP 4: Backend Processes Question
══════════════════════════════════════════════════════════════════════════════
  FastAPI Router
  ┌────────────────────────────────┐
  │ @router.post("/chat")          │
  │ async def chat(               │
  │   request: dict                │
  │ ):                             │
  │   question = request[           │
  │           "question"]          │
  │                                │
  │   result = rag_service.        │
  │           query(question)      │
  │                                │
  │   return result                │
  └────────────────────────────────┘


STEP 5: RAG Query Process
══════════════════════════════════════════════════════════════════════════════
  RAGService.query()
  ┌────────────────────────────────┐
  │ query(question):               │
  │                                │
  │ 1. Load FAISS index           │
  │    if not loaded              │
  │                                │
  │ 2. Convert question           │
  │    to embedding               │
  │    (384-dim vector)           │
  │                                │
  │ 3. FAISS similarity search    │
  │    → Find top 3 chunks        │
  │                                │
  │ 4. Build prompt:              │
  │    "Answer based on:          │
  │     [Context chunks]          │
  │     Question: [user_q]        │
  │     Answer:"                  │
  │                                │
  │ 5. Send to LLaMA 3            │
  │    via Ollama                 │
  │                                │
  │ 6. Return answer + sources    │
  └────────────────────────────────┘


STEP 6: Ollama LLM Call
══════════════════════════════════════════════════════════════════════════════
  OllamaLLM.invoke(prompt)
  ┌────────────────────────────────┐
  │ Request to Ollama server       │
  │ (localhost:11434)             │
  │                                │
  │ {                              │
  │   "model": "llama3",          │
  │   "prompt": "Answer based...",│
  │   "stream": false              │
  │ }                              │
  │                                │
  │ Response:                     │
  │ {                              │
  │   "response": "The NDIS is..."│
  │ }                              │
  └────────────────────────────────┘


STEP 7: HTTP Response
══════════════════════════════════════════════════════════════════════════════
  RESPONSE:
  ┌────────────────────────────────────────────────────────┐
  │ HTTP/1.1 200 OK                                        │
  │ Content-Type: application/json                        │
  │                                                        │
  │ {                                                      │
  │   "answer": "The NDIS is the National                 │
  │     Disability Insurance Scheme...",                  │
  │   "sources": [                                         │
  │     "The NDIS is an Australian...",                  │
  │     "It provides support to..."                        │
  │   ]                                                    │
  │ }                                                      │
  └────────────────────────────────────────────────────────┘


STEP 8: Frontend Displays Answer
══════════════════════════════════════════════════════════════════════════════
  ChatComponent
  ┌────────────────────────────────┐
  │ .subscribe(response => {        │
  │   this.messages.push({         │
  │     role: 'assistant',         │
  │     content: response.answer  │
  │   });                          │
  │   // UI updates automatically  │
  │ });                            │
  └────────────────────────────────┘

         │
         ▼
  User sees AI answer in chat bubble!
```

---

### Route 3: Check Status

**Purpose:** Check if documents are loaded in the backend

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STATUS CHECK FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

REQUEST:
┌────────────────────────────────────────────────────────┐
│ GET /api/status HTTP/1.1                               │
│ Host: localhost:8000                                   │
└────────────────────────────────────────────────────────┘
         │
         ▼
  FastAPI
  ┌────────────────────────────────┐
  │ @router.get("/status")         │
  │ async def status():            │
  │   has_docs = rag_service.      │
  │       load_existing_vectorstore│
  │   return {                      │
  │     "documents_loaded": true   │
  │   }                            │
  └────────────────────────────────┘
         │
         ▼
RESPONSE:
┌────────────────────────────────────────────────────────┐
│ HTTP/1.1 200 OK                                        │
│ {                                                      │
│   "documents_loaded": true                             │
│ }                                                      │
└────────────────────────────────────────────────────────┘
         │
         ▼
  Angular AppComponent shows "Ready" badge!
```

---

## 4. CORS (Cross-Origin Resource Sharing)

### Why CORS Matters

Browsers block requests from one domain to another for security. Our frontend (port 4201) and backend (port 8000) are different origins.

**File:** `backend/main.py`
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4201"],  # Allow frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all: GET, POST, PUT, DELETE
    allow_headers=["*"],  # Allow all headers
)
```

### Without CORS (Error)
```
Browser Console:
Access to XMLHttpRequest at 'http://localhost:8000/api/chat' 
from origin 'http://localhost:4201' has been blocked by CORS policy!
```

### With CORS (Works)
```
Browser Console:
Request successful!
Response: { "answer": "..." }
```

---

## 5. HTTP METHODS EXPLAINED

| Method | Usage | Example |
|--------|-------|---------|
| **GET** | Retrieve data | `GET /api/status` - Check if docs loaded |
| **POST** | Create/Send data | `POST /api/upload` - Upload file |
| **POST** | Create/Send data | `POST /api/chat` - Send question |

### GET vs POST

**GET Request:**
- No body
- Data in URL (query parameters)
- Safe for reading
- Cacheable

**POST Request:**
- Has body (JSON or FormData)
- Data in request body
- Used for creating/sending
- Not cacheable

---

## 6. HTTP STATUS CODES

| Code | Meaning | When Used |
|------|---------|-----------|
| **200** | OK | Request successful |
| **201** | Created | New resource created |
| **400** | Bad Request | Invalid input from client |
| **404** | Not Found | Route doesn't exist |
| **500** | Server Error | Backend crashed/had error |

**Backend Error Handling:**
```python
from fastapi import HTTPException

# Bad request
if not question:
    raise HTTPException(400, "Question is required")

# Server error
try:
    result = rag_service.query(question)
except Exception as e:
    raise HTTPException(500, f"Server error: {str(e)}")
```

---

## 7. COMPLETE ROUTE TABLE

| Route | Method | Frontend Service | Backend Handler | Description |
|-------|--------|------------------|-----------------|-------------|
| `/` | - | AppComponent | - | Main page with upload + chat |
| `/api/upload` | POST | `ChatService.uploadFile()` | `routes.upload_file()` | Upload PDF/TXT |
| `/api/chat` | POST | `ChatService.sendMessage()` | `routes.chat()` | Ask question |
| `/api/status` | GET | `ChatService.getStatus()` | `routes.status()` | Check doc status |

---

## 8. DATA TYPES

### Frontend (TypeScript Interfaces)
```typescript
// chat.models.ts
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface UploadResponse {
  message: string;
}

export interface StatusResponse {
  documents_loaded: boolean;
}
```

### Backend (Python Type Hints)
```python
from typing import Dict, List

# Response types
def upload_file() -> Dict[str, str]:
    return {"message": "Processed X chunks"}

def chat(request: dict) -> Dict[str, any]:
    return {
        "answer": str,
        "sources": List[str]
    }

def status() -> Dict[str, bool]:
    return {"documents_loaded": bool}
```

---

## 9. NETWORK FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMPLETE NETWORK JOURNEY                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   User clicks "Upload" or types question

2. ANGULAR DETECTS EVENT
   - Event binding (click), (change), (keyup.enter)
   - Calls component method

3. COMPONENT CALLS SERVICE
   - ChatService method invoked
   - HttpClient prepares request

4. HTTP REQUEST SENT
   - Browser creates HTTP packet
   - Adds headers (Content-Type, Origin)
   - Sends to localhost:8000

5. FASTAPI RECEIVES
   - Uvicorn server accepts connection
   - FastAPI router matches URL path
   - Executes handler function

6. BUSINESS LOGIC EXECUTES
   - File processing OR
   - RAG query with FAISS + LLaMA 3

7. RESPONSE PREPARED
   - Python dict converted to JSON
   - HTTP response built
   - CORS headers added

8. RESPONSE SENT
   - Travels back to localhost:4201
   - Browser receives JSON

9. ANGULAR PROCESSES
   - HttpClient parses JSON
   - Observable emits result
   - Component updates UI

10. USER SEES RESULT
    - Success message OR
    - AI answer in chat

Total Time: ~500ms - 3s (depending on file size and LLM response)
```

---

## Summary

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | Angular 17+ | UI components, user interaction |
| **HTTP Client** | Angular HttpClient | Sends/receives HTTP requests |
| **Network** | HTTP/1.1 | Transports data between machines |
| **Backend** | FastAPI | Receives requests, processes logic |
| **Router** | APIRouter | Routes URLs to handler functions |
| **Services** | RAGService | Document processing, AI queries |
| **Database** | FAISS | Vector storage and search |
| **LLM** | Ollama + LLaMA 3 | Generates AI answers |

**Key Takeaway:** Frontend and backend communicate via HTTP requests. Angular sends data, FastAPI processes it, and returns JSON responses that Angular displays in the UI.

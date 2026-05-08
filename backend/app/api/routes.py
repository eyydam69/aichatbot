from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.rag_service import rag_service
from app.core import config
import os
import shutil

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload PDF or TXT file for processing"""
    if not file.filename.endswith(('.pdf', '.txt')):
        raise HTTPException(400, "Only PDF and TXT files allowed")
    
    os.makedirs(config.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(config.UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        chunks = rag_service.load_document(file_path)
        return {"message": f"Processed {chunks} chunks from {file.filename}"}
    except Exception as e:
        raise HTTPException(500, f"Error processing file: {str(e)}")

@router.post("/chat")
async def chat(request: dict):
    """Chat with the AI about uploaded documents"""
    question = request.get("question", "")
    if not question:
        raise HTTPException(400, "Question is required")
    
    try:
        result = rag_service.query(question)
        if "error" in result:
            raise HTTPException(400, result["error"])
        return result
    except Exception as e:
        import traceback
        print(f"ERROR in chat: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(500, f"Server error: {str(e)}")

@router.get("/status")
async def status():
    """Check if documents are loaded"""
    has_docs = rag_service.load_existing_vectorstore()
    return {"documents_loaded": has_docs}

import os

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "uploads")
VECTORSTORE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "vectorstore")

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
LLM_MODEL = "llama3"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

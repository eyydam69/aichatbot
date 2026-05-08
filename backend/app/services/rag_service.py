from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader, PyPDFLoader
import os
from app.core import config

class RAGService:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name=config.EMBEDDING_MODEL)
        self.llm = OllamaLLM(model=config.LLM_MODEL)
        self.vectorstore = None
    
    def load_document(self, file_path: str):
        """Load PDF or TXT file and create vector store"""
        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
        else:
            loader = TextLoader(file_path, encoding='utf-8')
        
        documents = loader.load()
        text_splitter = CharacterTextSplitter(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP
        )
        texts = text_splitter.split_documents(documents)
        
        self.vectorstore = FAISS.from_documents(texts, self.embeddings)
        
        # Save vectorstore
        os.makedirs(config.VECTORSTORE_DIR, exist_ok=True)
        self.vectorstore.save_local(config.VECTORSTORE_DIR)
        
        return len(texts)
    
    def load_existing_vectorstore(self):
        """Load previously saved vectorstore"""
        if os.path.exists(config.VECTORSTORE_DIR) and os.listdir(config.VECTORSTORE_DIR):
            self.vectorstore = FAISS.load_local(
                config.VECTORSTORE_DIR, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            return True
        return False
    
    def query(self, question: str) -> dict:
        """Query the RAG system"""
        if not self.vectorstore:
            if not self.load_existing_vectorstore():
                return {"error": "No documents loaded. Please upload a document first."}
        
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})
        docs = retriever.invoke(question)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        prompt = f"""Answer the question based only on the following context:

Context:
{context}

Question: {question}

Answer:"""
        
        answer = self.llm.invoke(prompt)
        return {
            "answer": answer,
            "sources": [doc.page_content[:200] + "..." for doc in docs]
        }

rag_service = RAGService()

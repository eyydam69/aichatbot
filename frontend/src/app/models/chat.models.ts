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

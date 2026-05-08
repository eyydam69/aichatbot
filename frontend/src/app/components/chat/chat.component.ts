import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h2>Chat with your document</h2>
        <p class="chat-subtitle">Ask questions about your uploaded documents</p>
      </div>
      
      <div class="messages-container" #messagesContainer>
        <div class="messages">
          <div *ngIf="messages.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Upload a document first, then ask questions about it</p>
          </div>

          <div *ngFor="let msg of messages; let i = index" 
               class="message-wrapper" 
               [class.user-message]="msg.role === 'user'"
               [class.assistant-message]="msg.role === 'assistant'">
            <div class="message-content">
              <div class="message-bubble" [class.user]="msg.role === 'user'">
                <p>{{ msg.content }}</p>
              </div>
              <span class="timestamp">{{ getTimeString(i) }}</span>
            </div>
          </div>

          <div *ngIf="loading" class="message-wrapper assistant-message">
            <div class="message-content">
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="input-section">
        <div class="input-wrapper">
          <input 
            type="text" 
            [(ngModel)]="question" 
            (keyup.enter)="sendMessage()"
            placeholder="Ask a question about your document..."
            [disabled]="loading"
            class="message-input"
            #inputField
          >
          <button 
            (click)="sendMessage()" 
            [disabled]="!question.trim() || loading"
            class="send-button"
            title="Send message (Enter)"
          >
            <span *ngIf="!loading" class="send-icon">➤</span>
            <span *ngIf="loading" class="loading-spinner"></span>
          </button>
        </div>
        <p class="input-hint">Press Enter to send</p>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }

    .chat-header {
      padding: 24px;
      border-bottom: 1px solid var(--gray-200);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
    }

    .chat-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .chat-subtitle {
      font-size: 13px;
      color: var(--gray-500);
      margin: 4px 0 0 0;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: linear-gradient(to bottom, white, var(--gray-50));
    }

    .messages {
      display: flex;
      flex-direction: column;
      padding: 20px;
      gap: 12px;
      min-height: 100%;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--gray-400);
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--gray-600);
      margin: 0;
    }

    .empty-state p {
      font-size: 13px;
      margin: 8px 0 0 0;
      color: var(--gray-500);
    }

    .message-wrapper {
      display: flex;
      justify-content: flex-start;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-wrapper.user-message {
      justify-content: flex-end;
    }

    .message-content {
      display: flex;
      flex-direction: column;
      max-width: 75%;
    }

    .message-wrapper.user-message .message-content {
      align-items: flex-end;
    }

    .message-bubble {
      padding: 12px 16px;
      border-radius: var(--border-radius-lg);
      word-wrap: break-word;
      word-break: break-word;
      line-height: 1.5;
    }

    .message-bubble p {
      margin: 0;
      font-size: 14px;
      color: var(--gray-700);
    }

    .message-bubble {
      background: var(--gray-100);
      color: var(--gray-800);
      border: 1px solid var(--gray-200);
    }

    .message-wrapper.user-message .message-bubble {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border: none;
      box-shadow: var(--shadow-sm);
    }

    .message-wrapper.user-message .message-bubble p {
      color: white;
    }

    .timestamp {
      font-size: 11px;
      color: var(--gray-400);
      margin-top: 6px;
      padding: 0 4px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      height: 20px;
    }

    .typing-indicator span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gray-500);
      animation: typingAnimation 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typingAnimation {
      0%, 60%, 100% {
        opacity: 0.3;
        transform: translateY(0);
      }
      30% {
        opacity: 1;
        transform: translateY(-8px);
      }
    }

    .input-section {
      padding: 16px 20px;
      border-top: 1px solid var(--gray-200);
      background: white;
    }

    .input-wrapper {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .message-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid var(--gray-200);
      border-radius: var(--border-radius-lg);
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: var(--transition);
      background: white;
    }

    .message-input:hover {
      border-color: var(--gray-300);
    }

    .message-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .message-input:disabled {
      background: var(--gray-50);
      color: var(--gray-400);
    }

    .send-button {
      width: 44px;
      height: 44px;
      padding: 0;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border: none;
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: var(--transition);
      box-shadow: var(--shadow-md);
    }

    .send-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .send-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-icon {
      display: block;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .input-hint {
      font-size: 11px;
      color: var(--gray-400);
      margin: 8px 0 0 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .message-content {
        max-width: 90%;
      }

      .message-input {
        padding: 10px 12px;
        font-size: 13px;
      }

      .send-button {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  question = '';
  loading = false;

  constructor(private chatService: ChatService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {}
  }

  getTimeString(index: number): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  sendMessage() {
    if (!this.question.trim() || this.loading) return;

    const userQuestion = this.question.trim();
    this.messages.push({ role: 'user', content: userQuestion });
    this.question = '';
    this.loading = true;

    this.chatService.sendMessage(userQuestion).subscribe({
      next: (response) => {
        this.messages.push({ role: 'assistant', content: response.answer });
        this.loading = false;
      },
      error: (error) => {
        this.messages.push({ 
          role: 'assistant', 
          content: 'Sorry, I encountered an error: ' + (error.error?.detail || 'Failed to get response. Please try again.') 
        });
        this.loading = false;
      }
    });
  }
}

import { Component } from '@angular/core';
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
      <div class="messages">
        <div *ngFor="let msg of messages" class="message" [class.user]="msg.role === 'user'">
          <div class="bubble">{{ msg.content }}</div>
        </div>
        <div *ngIf="loading" class="message assistant">
          <div class="bubble">Thinking...</div>
        </div>
      </div>
      <div class="input-area">
        <input 
          type="text" 
          [(ngModel)]="question" 
          (keyup.enter)="sendMessage()"
          placeholder="Ask about your document..."
          [disabled]="loading"
        >
        <button (click)="sendMessage()" [disabled]="!question.trim() || loading">
          Send
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      height: 500px;
      display: flex;
      flex-direction: column;
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    .message {
      margin-bottom: 15px;
      display: flex;
    }
    .message.user {
      justify-content: flex-end;
    }
    .bubble {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 16px;
      background: #e9ecef;
    }
    .message.user .bubble {
      background: #007bff;
      color: white;
    }
    .input-area {
      display: flex;
      padding: 15px;
      border-top: 1px solid #e9ecef;
      gap: 10px;
    }
    input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
    }
    button {
      padding: 12px 24px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
    }
  `]
})
export class ChatComponent {
  messages: ChatMessage[] = [];
  question = '';
  loading = false;

  constructor(private chatService: ChatService) {}

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
          content: 'Error: ' + (error.error?.detail || 'Failed to get response') 
        });
        this.loading = false;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './components/upload/upload.component';
import { ChatComponent } from './components/chat/chat.component';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UploadComponent, ChatComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>AI Chatbot</h1>
        <span class="status" [class.ready]="docsLoaded">
          {{ docsLoaded ? 'Ready' : 'No documents loaded' }}
        </span>
      </header>
      <main>
        <app-upload (uploadComplete)="onUploadComplete()"></app-upload>
        <app-chat></app-chat>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
    }
    .status {
      padding: 5px 12px;
      border-radius: 12px;
      background: #dc3545;
      color: white;
      font-size: 12px;
    }
    .status.ready {
      background: #28a745;
    }
  `]
})
export class AppComponent implements OnInit {
  docsLoaded = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.checkStatus();
  }

  checkStatus() {
    this.chatService.getStatus().subscribe({
      next: (response) => this.docsLoaded = response.documents_loaded,
      error: () => this.docsLoaded = false
    });
  }

  onUploadComplete() {
    this.checkStatus();
  }
}

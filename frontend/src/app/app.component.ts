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
    <div class="app-wrapper">
      <header class="app-header">
        <div class="header-content">
          <div class="header-branding">
            <div class="logo">
              <span class="logo-icon">🤖</span>
            </div>
            <div class="header-text">
              <h1>Document Assistant</h1>
              <p class="subtitle">Intelligent document analysis powered by AI</p>
            </div>
          </div>
          <div class="header-status">
            <div class="status-indicator" [class.active]="docsLoaded">
              <span class="status-dot"></span>
              <span class="status-text">{{ docsLoaded ? 'Ready to chat' : 'Awaiting documents' }}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main class="app-main">
        <div class="app-container">
          <div class="layout-grid">
            <div class="sidebar-section">
              <app-upload (uploadComplete)="onUploadComplete()"></app-upload>
            </div>
            <div class="chat-section">
              <app-chat></app-chat>
            </div>
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <p>&copy; 2026 Intelligent Document Assistant. Powered by advanced AI.</p>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: linear-gradient(135deg, var(--gray-50) 0%, #f5f3ff 100%);
    }

    .app-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      padding: 24px;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    }

    .app-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      pointer-events: none;
    }

    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: var(--border-radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .header-text h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin: 4px 0 0 0;
      font-weight: 400;
    }

    .header-status {
      display: flex;
      align-items: center;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--border-radius-lg);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--danger);
      animation: pulse 2s infinite;
    }

    .status-indicator.active .status-dot {
      background: var(--success);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-text {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }

    .app-main {
      flex: 1;
      overflow-y: auto;
      padding: 32px 24px;
    }

    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
    }

    .chat-section {
      display: flex;
      flex-direction: column;
    }

    .app-footer {
      padding: 20px 24px;
      text-align: center;
      color: var(--gray-500);
      font-size: 13px;
      border-top: 1px solid var(--gray-200);
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .app-header {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-status {
        width: 100%;
      }

      .header-text h1 {
        font-size: 24px;
      }

      .layout-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .app-main {
        padding: 16px;
      }
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

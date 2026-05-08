import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div class="upload-header">
        <h3>📄 Upload Document</h3>
        <p class="upload-subtitle">Supports PDF and TXT files</p>
      </div>

      <div class="upload-area" 
           (drop)="onDrop($event)" 
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           [class.dragover]="isDragging">
        
        <div class="upload-icon">📁</div>
        <h4 class="upload-title">Drag & drop your document here</h4>
        <p class="upload-description">or click the button below to browse</p>
        
        <input 
          type="file" 
          #fileInput 
          accept=".pdf,.txt" 
          (change)="onFileSelected($event)" 
          hidden
        >
        
        <button 
          class="browse-button"
          (click)="fileInput.click()" 
          [disabled]="uploading"
        >
          <span *ngIf="!uploading" class="button-text">📤 Browse Files</span>
          <span *ngIf="uploading" class="button-text">
            <span class="uploading-spinner"></span>
            Uploading...
          </span>
        </button>
      </div>

      <div *ngIf="message" class="message" [class.success]="!message.includes('Error')">
        <span class="message-icon">{{ message.includes('Error') ? '❌' : '✅' }}</span>
        {{ message }}
      </div>

      <div class="file-info">
        <p class="info-label">Accepted formats:</p>
        <div class="formats">
          <span class="format-badge">PDF</span>
          <span class="format-badge">TXT</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .upload-header {
      padding: 24px;
      border-bottom: 1px solid var(--gray-200);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
    }

    .upload-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }

    .upload-subtitle {
      font-size: 13px;
      color: var(--gray-500);
      margin: 4px 0 0 0;
    }

    .upload-area {
      flex: 1;
      border: 2px dashed var(--gray-300);
      border-radius: var(--border-radius-md);
      padding: 32px 20px;
      text-align: center;
      margin: 20px;
      background: linear-gradient(135deg, var(--gray-50) 0%, #f5f3ff 100%);
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .upload-area:hover {
      border-color: var(--primary);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
    }

    .upload-area.dragover {
      border-color: var(--primary);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
      box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.1);
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 12px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .upload-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 8px 0;
    }

    .upload-description {
      font-size: 13px;
      color: var(--gray-500);
      margin: 0 0 20px 0;
    }

    .browse-button {
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      border: none;
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition);
      box-shadow: var(--shadow-md);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .browse-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .browse-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .browse-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .button-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .uploading-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .message {
      margin: 0 20px 20px 20px;
      padding: 12px 16px;
      border-radius: var(--border-radius-md);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
      color: #991b1b;
      border-left: 4px solid var(--danger);
      font-size: 13px;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message.success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
      color: #065f46;
      border-left-color: var(--success);
    }

    .message-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .file-info {
      padding: 0 20px 20px 20px;
    }

    .info-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--gray-600);
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .formats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .format-badge {
      display: inline-block;
      padding: 4px 12px;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .upload-area {
        padding: 24px 16px;
      }

      .upload-icon {
        font-size: 36px;
      }

      .upload-title {
        font-size: 14px;
      }

      .browse-button {
        padding: 10px 20px;
        font-size: 13px;
      }
    }
  `]
})
export class UploadComponent {
  @Output() uploadComplete = new EventEmitter<void>();
  uploading = false;
  message = '';
  isDragging = false;

  constructor(private chatService: ChatService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.uploadFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadFile(input.files[0]);
    }
  }

  uploadFile(file: File) {
    this.uploading = true;
    this.message = '';
    
    this.chatService.uploadFile(file).subscribe({
      next: (response) => {
        this.message = response.message;
        this.uploading = false;
        this.uploadComplete.emit();
      },
      error: (error) => {
        this.message = 'Error: ' + error.error.detail;
        this.uploading = false;
      }
    });
  }
}

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <h3>Upload Document</h3>
      <div class="upload-area" (drop)="onDrop($event)" (dragover)="onDragOver($event)">
        <p>Drag & drop PDF or TXT file here</p>
        <p>or</p>
        <input type="file" #fileInput accept=".pdf,.txt" (change)="onFileSelected($event)" hidden>
        <button (click)="fileInput.click()" [disabled]="uploading">
          {{ uploading ? 'Uploading...' : 'Select File' }}
        </button>
      </div>
      <p *ngIf="message" class="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
    }
    .upload-area.dragover {
      border-color: #007bff;
      background: #f0f8ff;
    }
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
    }
    .message {
      margin-top: 10px;
      color: #28a745;
    }
  `]
})
export class UploadComponent {
  @Output() uploadComplete = new EventEmitter<void>();
  uploading = false;
  message = '';

  constructor(private chatService: ChatService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
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

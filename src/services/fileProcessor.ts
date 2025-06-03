
import { createWorker } from 'tesseract.js';
import { apiClient } from './apiClient';

export class FileProcessor {
  private static ocrWorker: any = null;

  static async initializeOCR() {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('eng');
    }
    return this.ocrWorker;
  }

  static async extractTextFromImage(file: File): Promise<string> {
    try {
      const worker = await this.initializeOCR();
      const { data: { text } } = await worker.recognize(file);
      
      // Store OCR text in knowledge base for RAG
      await this.storeOCRInKnowledgeBase(file.name, text);
      
      return text.trim();
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  static async storeOCRInKnowledgeBase(filename: string, ocrText: string): Promise<void> {
    try {
      // Create a text file from OCR content
      const textContent = `OCR Extracted Text from ${filename}\n\n${ocrText}`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', blob, `ocr_${filename.replace(/\.[^/.]+$/, "")}.txt`);

      // Upload to knowledge base
      await apiClient.post('/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(`📄 OCR text from ${filename} stored in knowledge base`);
    } catch (error) {
      console.error('Error storing OCR in knowledge base:', error);
    }
  }

  static async transcribeAudio(file: File): Promise<string> {
    // For now, return a placeholder - audio transcription would require additional API
    return `🎵 [Audio file: ${file.name} - Transcription would require additional API integration]`;
  }

  static async processFile(file: File): Promise<{ type: string; content: string; showContent: boolean }> {
    if (file.type.startsWith('image/')) {
      const text = await this.extractTextFromImage(file);
      // Return minimal visible content for images with OCR
      return { 
        type: 'image', 
        content: `📷 Image processed with OCR (${text.length} characters extracted and stored in knowledge base)`,
        showContent: false // Don't show OCR text to user
      };
    } else if (file.type.startsWith('audio/')) {
      const transcription = await this.transcribeAudio(file);
      return { type: 'audio', content: transcription, showContent: true };
    } else {
      return { type: 'file', content: `📄 [File: ${file.name}]`, showContent: true };
    }
  }

  static createOCRPreview(filename: string, ocrText: string): string {
    return `📄 **OCR Preview for ${filename}**\n\n${ocrText.substring(0, 500)}${ocrText.length > 500 ? '...' : ''}`;
  }
}

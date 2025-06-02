
import { createWorker } from 'tesseract.js';

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
      return text.trim();
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  static async transcribeAudio(file: File): Promise<string> {
    // For now, return a placeholder - audio transcription would require additional API
    return `[Audio file: ${file.name} - Transcription would require additional API integration]`;
  }

  static async processFile(file: File): Promise<{ type: string; content: string }> {
    if (file.type.startsWith('image/')) {
      const text = await this.extractTextFromImage(file);
      return { type: 'image', content: text };
    } else if (file.type.startsWith('audio/')) {
      const transcription = await this.transcribeAudio(file);
      return { type: 'audio', content: transcription };
    } else {
      return { type: 'file', content: `[File: ${file.name}]` };
    }
  }
}

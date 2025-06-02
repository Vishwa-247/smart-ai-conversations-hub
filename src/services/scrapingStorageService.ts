
export interface ScrapedContent {
  id: string;
  url: string;
  title: string;
  content: string;
  timestamp: Date;
  summary?: string;
}

export class ScrapingStorageService {
  private static readonly STORAGE_KEY = 'scraped_content';

  static saveScrapedContent(content: Omit<ScrapedContent, 'id' | 'timestamp'>): string {
    const id = Date.now().toString();
    const scrapedContent: ScrapedContent = {
      ...content,
      id,
      timestamp: new Date(),
    };

    const existingContent = this.getAllScrapedContent();
    existingContent.push(scrapedContent);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingContent));
    return id;
  }

  static getAllScrapedContent(): ScrapedContent[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static getScrapedContentById(id: string): ScrapedContent | null {
    const allContent = this.getAllScrapedContent();
    return allContent.find(content => content.id === id) || null;
  }

  static deleteScrapedContent(id: string): void {
    const allContent = this.getAllScrapedContent();
    const filtered = allContent.filter(content => content.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static clearAllScrapedContent(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

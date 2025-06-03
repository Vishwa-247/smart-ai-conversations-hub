
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
    
    // Log for debugging
    console.log('Saving scraped content:', scrapedContent);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingContent));
    
    // Verify it was saved
    const saved = this.getAllScrapedContent();
    console.log('All scraped content after save:', saved);
    
    return id;
  }

  static getAllScrapedContent(): ScrapedContent[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
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

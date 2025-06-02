
import { apiClient } from './apiClient';
import { ScrapingStorageService } from './scrapingStorageService';

export interface UrlScrapeResult {
  success: boolean;
  url: string;
  title: string;
  content: string;
}

export class UrlContentService {
  static async fetchAndSummarize(url: string): Promise<string> {
    try {
      // First, scrape the URL
      const response = await apiClient.post<UrlScrapeResult>('/scrape-url', { url });
      const { title, content } = response.data;
      
      // Return formatted content for AI processing
      return `
**URL Analysis Request**
URL: ${url}
Title: ${title}

**Content Summary:**
${content}

Please analyze this content and provide a comprehensive summary highlighting the key points, main topics, and important information.
      `;
    } catch (error: any) {
      console.error('URL content fetch error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch URL content');
    }
  }
  
  static async scrapeAndStore(url: string): Promise<string> {
    try {
      const response = await apiClient.post<UrlScrapeResult>('/scrape-url', { url });
      const { title, content } = response.data;
      
      // Store the scraped content
      const contentId = ScrapingStorageService.saveScrapedContent({
        url,
        title,
        content,
      });
      
      return contentId;
    } catch (error: any) {
      console.error('URL scraping error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to scrape URL');
    }
  }
  
  static async scrapeUrl(url: string): Promise<UrlScrapeResult> {
    try {
      const response = await apiClient.post<UrlScrapeResult>('/scrape-url', { url });
      return response.data;
    } catch (error: any) {
      console.error('URL scraping error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to scrape URL');
    }
  }
}

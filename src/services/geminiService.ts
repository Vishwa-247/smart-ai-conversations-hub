
const GEMINI_API_KEY = 'AIzaSyDPzunaXJw4Iri8sDQRLNSTHa2NRiBU-d0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const callGeminiAPI = async (messages: GeminiMessage[]): Promise<string> => {
  try {
    // Convert messages to Gemini format
    const contents = messages
      .filter(msg => msg.role !== 'system') // Gemini doesn't use system messages in the same way
      .map(msg => ({
        parts: [{ text: msg.content }]
      }));

    // Add system message as part of the first user message if it exists
    const systemMessage = messages.find(msg => msg.role === 'system');
    if (systemMessage && contents.length > 0) {
      contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`;
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

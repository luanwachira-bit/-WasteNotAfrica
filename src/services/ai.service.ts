import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../config';

class AIService {
  private static instance: AIService;
  private model: any;

  private constructor() {
    const genAI = new GoogleGenerativeAI(AI_CONFIG.geminiApiKey!);
    this.model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateSwahiliAlert(humidity: number, temperature: number): Promise<string> {
    try {
      const prompt = `
        Translate to Swahili and format as an urgent alert:
        Warning! Environment conditions are risky:
        - Humidity: ${humidity}%
        - Temperature: ${temperature}°C
        Please move produce to a controlled environment immediately.
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Failed to generate alert:', error);
      return 'Tahadhari! Hali ya hewa sio nzuri. Tafadhali linda mazao yako.';
    }
  }
}

export default AIService;
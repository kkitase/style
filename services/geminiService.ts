
import { GoogleGenAI, Type } from "@google/genai";
import { BodyType, WeatherData, OutfitSuggestion } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getLocalWeather(lat: number, lon: number): Promise<WeatherData> {
    const prompt = `今の座標(${lat}, ${lon})付近の最新の天気情報を教えてください。
    都市名、気温(℃)、天候の状態、湿度、簡単な説明を日本語で返してください。`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            temp: { type: Type.NUMBER },
            condition: { type: Type.STRING },
            humidity: { type: Type.NUMBER },
            description: { type: Type.STRING }
          },
          required: ["city", "temp", "condition", "humidity", "description"]
        }
      }
    });

    try {
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Weather parsing failed", e);
      // Fallback dummy data if parsing fails
      return {
        city: "現在地",
        temp: 20,
        condition: "晴れ",
        humidity: 50,
        description: "快適な天気です"
      };
    }
  }

  async getOutfitSuggestion(bodyType: BodyType, weather: WeatherData): Promise<OutfitSuggestion> {
    const prompt = `
    骨格タイプ: ${bodyType}
    現在の天気: ${weather.city}、気温 ${weather.temp}℃、天候 ${weather.condition} (${weather.description})、湿度 ${weather.humidity}%

    この条件に最適な今日の服装を提案してください。
    骨格タイプの特徴（Straight: 立体感、Wave: 曲線美、Natural: フレーム感）と、気温に応じた調節を考慮してください。
    
    以下のJSON形式で答えてください：
    {
      "title": "コーディネートのテーマ名",
      "items": ["トップス", "ボトムス", "アウター/小物"],
      "tips": "着こなしのアドバイス",
      "reason": "なぜその骨格と天気に合うのかの理由"
    }`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            items: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tips: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["title", "items", "tips", "reason"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  }
}

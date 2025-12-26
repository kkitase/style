
import { GoogleGenAI, Type } from "@google/genai";
import { BodyType, WeatherData, OutfitSuggestion } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("【重要】APIキーが設定されていません。VITE_API_KEYを確認してください。");
    }
    console.log("GeminiService initialized. API Key length:", apiKey ? apiKey.length : 0);
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async getLocalWeather(lat: number, lon: number): Promise<WeatherData> {
    const prompt = `今の座標(${lat}, ${lon})付近の最新の天気情報を教えてください。
    都市名、気温(℃)、天候の状態、湿度、簡単な説明を日本語で返してください。`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash", // モデル名を最新のものに変更(推奨)
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
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.warn("Weather API failed, using mock data", e);
      return {
        city: "東京(デモ)",
        temp: 22,
        condition: "晴れ",
        humidity: 45,
        description: "過ごしやすい陽気です"
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

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
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
    } catch (e) {
      console.warn("Outfit API failed, using mock data", e);
      return {
        title: "大人のリラックスカジュアル（デモ）",
        items: ["オーバーサイズシャツ", "テーパードパンツ", "シルバーアクセサリー"],
        tips: "手首・足首を見せて抜け感を出しましょう。",
        reason: "骨格タイプと天気に合わせた、動きやすく洗練されたスタイルです。（API制限のためデモデータを表示しています）"
      };
    }
  }
}

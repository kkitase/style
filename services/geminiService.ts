import { GoogleGenAI, Type } from "@google/genai";
import { BodyType, WeatherData, OutfitSuggestion } from "../types";
import { compressImage } from "../utils/imageUtils";

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

  private readonly MODEL_NAME = "gemini-flash-latest";


  // リトライ付きのAPI呼び出し
  private async generateContentWithRetry(params: any, retries = 5, delayMs = 10000): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.ai.models.generateContent(params);
      } catch (error: any) {
        // 429エラーまたは503エラーの場合はリトライ
        if ((error.message?.includes("429") || error.message?.includes("503")) && i < retries - 1) {
          console.warn(`API call failed (attempt ${i + 1}/${retries}). Retrying in ${delayMs}ms...`, error.message);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2; // 指数バックオフ
          continue;
        }
        throw error;
      }
    }
  }

  // 座標ではなく「地名」を受け取るように変更
  async getLocalWeather(location: string): Promise<WeatherData> {
    const prompt = `
    「${location}」の現在の天気情報を教えてください。
    都市名、気温(℃)、天候の状態、湿度、簡単な説明を日本語で返してください。
    `;

    try {
      const response = await this.generateContentWithRetry({
        model: this.MODEL_NAME,
        contents: prompt,
        config: {
          // tools: [{ googleSearch: {} }], // 負荷軽減のため一時的に検索無効化
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
        city: `${location}（サンプル）`,
        temp: 20,
        condition: "晴れ",
        humidity: 50,
        description: `※現在はアクセス集中等のため、サンプル情報を表示しています。しばらく時間をおいてお試しください。`
      };
    }
  }

  async getOutfitSuggestion(bodyType: BodyType, weather: WeatherData, location: string): Promise<OutfitSuggestion> {
    const prompt = `
    ターゲット: 骨格タイプ「${bodyType}」の女性
    シチュエーション: 「${location}」へのお出かけ
    天候: ${weather.city}、${weather.temp}℃、${weather.condition} (${weather.description})

    この条件に最適な今日の服装を提案してください。
    また、その服装に合う**実際の通販アイテム（Amazon, 楽天, ZOZOなど）**を3つ探して提案してください。
    以下のJSON形式で答えてください：
    {
      "title": "コーディネートのテーマ名",
      "items": ["トップス名", "ボトムス名", "小物"],
      "tips": "着こなしアドバイス",
      "reason": "選定理由",
      "products": [
        { "title": "商品名", "url": "商品URL", "price": "価格（概算）" }
      ]
    }`;

    try {
      const response = await this.generateContentWithRetry({
        model: this.MODEL_NAME,
        contents: prompt,
        config: {
          // tools: [{ googleSearch: {} }], // 負荷軽減のため一時的に検索無効化
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              items: { type: Type.ARRAY, items: { type: Type.STRING } },
              tips: { type: Type.STRING },
              reason: { type: Type.STRING },
              products: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    price: { type: Type.STRING }
                  },
                  required: ["title", "url"]
                }
              }
            },
            required: ["title", "items", "tips", "reason", "products"]
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.warn("Outfit API failed, using mock data", e);
      return {
        title: "大人のリラックスカジュアル（サンプル）",
        items: ["オーバーサイズシャツ", "テーパードパンツ", "シルバーアクセサリー"],
        tips: "手首・足首を見せて抜け感を出しましょう。",
        reason: `※現在はアクセス集中等のため、サンプル提案を表示しています。しばらく時間をおいてお試しください。`,
        products: [
          { title: "オーバーサイズシャツ（サンプル）", url: "https://example.com", price: "¥4,000" },
          { title: "テーパードパンツ（サンプル）", url: "https://example.com", price: "¥5,000" }
        ]
      };
    }
  }

  async predictBodyType(imageBase64: string): Promise<{ type: BodyType; reason: string }> {
    const prompt = `
    この画像の人物の骨格タイプ（Straight, Wave, Natural）を診断してください。
    
    以下のJSON形式で答えてください：
    {
      "type": "Straight" | "Wave" | "Natural",
      "reason": "診断理由（日本語で簡潔に）"
    }`;

    try {
      // 送信前に画像を圧縮・リサイズ (最大800px, 品質0.7)
      const compressedBase64 = await compressImage(imageBase64);

      // Base64ヘッダー除去
      const base64Data = compressedBase64.split(',')[1];

      const response = await this.generateContentWithRetry({
        model: this.MODEL_NAME,
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            // ... (スキーマは同じ)
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["Straight", "Wave", "Natural"] },
              reason: { type: Type.STRING }
            },
            required: ["type", "reason"]
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.warn("Body type prediction failed", e);
      // エラー時のフォールバックは維持するが、理由は明確にする
      return {
        type: "Natural", // 仮の値
        reason: `【診断エラー】画像の解析に失敗しました。もう少し小さな画像か、別の画像を試してみてください。`
      };
    }
  }
}

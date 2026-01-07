import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BodyType, WeatherData, OutfitSuggestion, UserContext } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private readonly MODEL_NAME = "gemini-3-flash-preview";

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getLocalWeather(lat: number, lon: number): Promise<WeatherData> {
    const prompt = `今の座標(${lat}, ${lon})付近の最新の天気情報を教えてください。
    都市名、気温(℃)、天候の状態、湿度、簡単な説明を日本語で返してください。`;

    const response = await this.ai.models.generateContent({
      model: this.MODEL_NAME,
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
      return {
        city: "現在地",
        temp: 22,
        condition: "晴れ",
        humidity: 45,
        description: "過ごしやすい天気です"
      };
    }
  }

  async getWeatherByLocation(locationName: string, date: string): Promise<WeatherData> {
    const prompt = `${locationName}の${date}の天気予報を検索してください。
    都市名（正確に）、気温(℃)、天候の状態、湿度、簡単な説明を日本語で返してください。`;

    const response = await this.ai.models.generateContent({
      model: this.MODEL_NAME,
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
      const data = JSON.parse(response.text.trim());
      return { ...data, date };
    } catch (e) {
      console.error("Weather parsing failed", e);
      throw new Error("指定された場所・日付の天気が取得できませんでした。");
    }
  }

  async getOutfitSuggestion(imageContent: string, weather: WeatherData, context: UserContext): Promise<OutfitSuggestion> {
    const [mimeType, base64Data] = imageContent.split(';base64,');
    const realMimeType = mimeType.replace('data:', '');

    const prompt = `
    あなたはプロのファッションスタイリストです。
    
    【分析】
    1. 添付写真から人物の「性別」と「骨格タイプ（Straight/Wave/Natural）」を正確に判定してください。
    2. 性別に適した（女性ならレディース、男性ならメンズ）具体的な実在ブランドのアイテムを3つ提案してください。
    
    【画像URLに関する重要ルール】
    - アイテムの画像(imageUrl)には、必ず実在するファッション商品の有効なURLをセットしてください。
    - 適切なURLが見当たらない場合は、Unsplashの高品質なファッション関連の公開画像（例: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80"）を、そのアイテムの雰囲気に合わせて選択してください。
    
    【ZOZO検索キーワードに関する重要ルール】
    - searchKeywordには、記号を含まない純粋な「ブランド名 アイテム名 性別」のスペース区切り文字列のみを入れてください。
    - 例: "UNITED ARROWS ロングコート レディース"
    - 余計な説明や引用符、ハッシュタグは一切入れないでください。

    【状況】
    - 天気：${weather.city}、${weather.temp}℃、${weather.condition}
    - 希望：${context.mood}

    JSON形式で出力：
    {
      "diagnosis": "Straight" | "Wave" | "Natural",
      "diagnosisReason": "性別と骨格の判断理由",
      "title": "コーデのタイトル",
      "items": [
        {
          "name": "商品名",
          "brandName": "ブランド名",
          "imageUrl": "有効な画像URL",
          "description": "選定理由",
          "searchKeyword": "ZOZO検索用のクリーンなキーワード"
        }
      ],
      "tips": "ワンポイントアドバイス",
      "reason": "総合提案理由",
      "audioText": "読み上げ用のアドバイステキスト"
    }`;

    const response = await this.ai.models.generateContent({
      model: this.MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: realMimeType } },
          { text: prompt }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            diagnosisReason: { type: Type.STRING },
            title: { type: Type.STRING },
            items: { 
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brandName: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                  description: { type: Type.STRING },
                  searchKeyword: { type: Type.STRING }
                },
                required: ["name", "imageUrl", "description", "searchKeyword"]
              }
            },
            tips: { type: Type.STRING },
            reason: { type: Type.STRING },
            audioText: { type: Type.STRING }
          },
          required: ["diagnosis", "diagnosisReason", "title", "items", "tips", "reason", "audioText"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    
    // 画像のフォールバック処理を徹底
    const fallbackImages = [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1467043237213-65f2da53396f?auto=format&fit=crop&w=800&q=80"
    ];

    result.items = result.items.map((item: any, idx: number) => ({
      ...item,
      imageUrl: (item.imageUrl && item.imageUrl.startsWith('http')) 
        ? item.imageUrl 
        : fallbackImages[idx % fallbackImages.length]
    }));

    return result;
  }

  async generateSpeech(text: string): Promise<Uint8Array> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `スタイリストとして落ち着いたトーンで話してください: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed");

    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

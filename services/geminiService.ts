
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BodyType, WeatherData, OutfitSuggestion, UserContext } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getLocalWeather(lat: number, lon: number): Promise<WeatherData> {
    const prompt = `今の座標(${lat}, ${lon})付近の天気情報を教えてください。
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
    const prompt = `Yahoo!天気の情報を検索して、${locationName}の${date}の天気予報を教えてください。
    必ず${date}時点の予報を反映させてください。
    都市名（正確に）、気温(℃)、天候の状態、湿度、簡単な説明を日本語で返してください。`;

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
    あなたは世界最高峰のパーソナルスタイリスト兼、骨格診断の専門家です。
    
    【依頼内容】
    1. 添付された写真から、この人物の骨格タイプ（Straight/Wave/Natural）を分析してください。
    2. 行先の環境：${weather.city}、気温 ${weather.temp}℃、天候 ${weather.condition}
    3. なりたい雰囲気：${context.mood}
    
    【ZOZOTOWN具体的な商品提案ルール】
    - 各おすすめアイテムについて、実際にZOZOTOWNで人気のあるブランドや、現在トレンドの具体的な商品名を1つずつ挙げてください。
    - アイテム名は「ブランド名 / 具体的な商品名」の形式にしてください。
    - zozoSearchUrlには、そのアイテムをZOZOTOWNで検索するためのURL（https://zozo.jp/search/?p_keyv=検索ワード）を生成して入れてください。
    - imageUrlは、そのアイテムを象徴する高品質なファッション画像（Unsplash等）のURLを入れてください。

    以下のJSON形式で厳密に出力してください：
    {
      "diagnosis": "Straight" | "Wave" | "Natural",
      "diagnosisReason": "診断理由",
      "title": "テーマ名",
      "items": [
        {
          "name": "ブランド名 / 具体的な商品名",
          "brandName": "ブランド名のみ",
          "imageUrl": "画像URL",
          "description": "選定理由",
          "zozoSearchUrl": "ZOZO検索用URL"
        }
      ],
      "tips": "着こなしのアドバイス",
      "reason": "総合的な提案理由",
      "audioText": "読み上げ用のメッセージ"
    }`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
                  zozoSearchUrl: { type: Type.STRING }
                },
                required: ["name", "imageUrl", "description", "zozoSearchUrl"]
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

    return JSON.parse(response.text.trim());
  }

  async generateSpeech(text: string): Promise<Uint8Array> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `優しく落ち着いた女性スタイリストのトーンで話してください: ${text}` }] }],
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

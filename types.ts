
export type BodyType = 'Straight' | 'Wave' | 'Natural' | null;

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  description: string;
  date?: string;
}

export interface UserContext {
  locationName: string;
  mood: string;
  date: string;
}

export interface RecommendedItem {
  name: string;
  brandName?: string;
  imageUrl: string;
  description: string;
  searchKeyword: string;
}

export interface OutfitSuggestion {
  diagnosis: BodyType;
  diagnosisReason: string;
  title: string;
  items: RecommendedItem[];
  tips: string;
  reason: string;
  audioText: string;
}

export interface QuizOption {
  label: string;
  value: BodyType;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

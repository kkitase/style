
export type BodyType = 'Straight' | 'Wave' | 'Natural' | null;

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  description: string;
}

export interface OutfitSuggestion {
  title: string;
  items: string[];
  tips: string;
  reason: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    label: string;
    value: BodyType;
  }[];
}

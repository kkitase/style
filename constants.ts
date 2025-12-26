
import { QuizQuestion } from './types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "首の特徴は？",
    options: [
      { label: "どちらかといえば短め、太めで筋肉質", value: "Straight" },
      { label: "どちらかといえば長め、細めで華奢", value: "Wave" },
      { label: "どちらかといえば長め、関節や筋が目立つ", value: "Natural" }
    ]
  },
  {
    id: 2,
    question: "鎖骨の状態は？",
    options: [
      { label: "ほとんど見えない", value: "Straight" },
      { label: "細く、くっきりと出ている", value: "Wave" },
      { label: "太く、しっかり目立っている", value: "Natural" }
    ]
  },
  {
    id: 3,
    question: "手のひらの質感や形は？",
    options: [
      { label: "厚みがあり、弾力がある。手首は細い", value: "Straight" },
      { label: "薄く、柔らかい。手首は平べったい", value: "Wave" },
      { label: "厚みは個人差があるが、関節や骨が目立つ", value: "Natural" }
    ]
  },
  {
    id: 4,
    question: "腰の位置は？",
    options: [
      { label: "高めで、ウエストラインがはっきりしている", value: "Straight" },
      { label: "低めで、なだらかな曲線を描いている", value: "Wave" },
      { label: "個人差はあるが、腰骨が横に張っている", value: "Natural" }
    ]
  }
];

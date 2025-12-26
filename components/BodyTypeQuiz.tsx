
import React, { useState } from 'react';
import { BodyType } from '../types';
import { QUIZ_QUESTIONS } from '../constants';

interface BodyTypeQuizProps {
  onComplete: (result: BodyType) => void;
}

const BodyTypeQuiz: React.FC<BodyTypeQuizProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<BodyType[]>([]);

  const handleSelect = (value: BodyType) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate majority
      const counts: Record<string, number> = { Straight: 0, Wave: 0, Natural: 0 };
      newAnswers.forEach(ans => {
        if (ans) counts[ans]++;
      });
      const result = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as BodyType;
      onComplete(result);
    }
  };

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-orange-400">Question {currentStep + 1} of {QUIZ_QUESTIONS.length}</span>
          <span className="text-sm font-medium text-gray-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-orange-50 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-orange-300 h-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
        {currentQuestion.question}
      </h2>

      <div className="space-y-4">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option.value)}
            className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200 group"
          >
            <span className="text-gray-700 font-medium group-hover:text-orange-600">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BodyTypeQuiz;


import React from 'react';
import { OutfitSuggestion, BodyType } from '../types';

interface OutfitCardProps {
  suggestion: OutfitSuggestion;
  bodyType: BodyType;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ suggestion, bodyType }) => {
  const getBodyTypeName = (type: BodyType) => {
    switch (type) {
      case 'Straight': return 'ストレート';
      case 'Wave': return 'ウェーブ';
      case 'Natural': return 'ナチュラル';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-8 text-white">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">
            Today's Recommendation
          </span>
          <span className="text-sm font-bold opacity-80">骨格: {getBodyTypeName(bodyType)}</span>
        </div>
        <h3 className="text-3xl font-bold mb-2">{suggestion.title}</h3>
        <p className="text-white/90 text-sm italic">{suggestion.reason}</p>
      </div>

      <div className="p-8 space-y-8">
        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Recommended Items</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestion.items.map((item, idx) => (
              <div key={idx} className="flex items-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <span className="text-orange-400 font-bold text-xs">{idx + 1}</span>
                </div>
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.586 15.586a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM16 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1z" />
            </svg>
            Styling Tips
          </h4>
          <p className="text-gray-600 leading-relaxed text-sm">
            {suggestion.tips}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;

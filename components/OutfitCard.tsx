import React, { useState } from 'react';
import { OutfitSuggestion } from '../types';
import { GeminiService, decodeAudioData } from '../services/geminiService';
import { Sparkles, Volume2, Music, Lightbulb, Info, ShoppingBag, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface OutfitCardProps {
  suggestion: OutfitSuggestion;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ suggestion }) => {
  const [playing, setPlaying] = useState(false);

  const playAdvice = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      const gemini = new GeminiService();
      const audioBytes = await gemini.generateSpeech(suggestion.audioText);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(audioBytes, audioCtx);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => setPlaying(false);
      source.start();
    } catch (err) {
      setPlaying(false);
    }
  };

  const getZozoUrl = (keyword: string) => {
    // 記号や不要な空白を除去
    const cleanKeyword = keyword
      .replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // ZOZOのURLパラメータ p_keyv に対応。二重エンコードを避けるため一度デコードしてからエンコード
    return `https://zozo.jp/search/?p_keyv=${encodeURIComponent(cleanKeyword)}`;
  };

  const fallbackImage = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-[#e3acae]/10 overflow-hidden flex flex-col">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#e3acae] via-[#ecc1c3] to-[#f5d6d8] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Visual Concierge</span>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase text-white/70 font-black tracking-widest mb-0.5">Body Type</div>
              <div className="text-xl font-black">{suggestion.diagnosis || 'Analysis'} <span className="text-sm font-light opacity-60">type</span></div>
            </div>
          </div>
          
          <h3 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase italic">
            {suggestion.title}
          </h3>

          <div className="flex items-start space-x-3 bg-black/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 max-w-lg">
            <Info className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/90 font-medium leading-relaxed">
              {suggestion.diagnosisReason}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-12">
        {/* Play Advice Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
          <div>
            <h4 className="text-[10px] font-black text-[#e3acae] uppercase tracking-[0.3em] mb-1">Curated Selection</h4>
            <p className="text-2xl font-black text-gray-900">おすすめのアイテム</p>
          </div>
          <button 
            onClick={playAdvice}
            disabled={playing}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-full font-black transition-all shadow-md text-[10px] uppercase tracking-widest ${
              playing ? 'bg-gray-100 text-gray-400' : 'bg-[#e3acae] text-white hover:bg-[#d4999b]'
            }`}
          >
            {playing ? <Music className="w-3.5 h-3.5 animate-bounce" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{playing ? 'Playing Audio...' : '音声アドバイスを聞く'}</span>
          </button>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {suggestion.items.map((item, idx) => (
            <div key={idx} className="flex flex-col group h-full">
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-[2rem] bg-gray-50 shadow-sm border border-gray-100">
                <img 
                  src={item.imageUrl || fallbackImage} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== fallbackImage) {
                      target.src = fallbackImage;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                  <a 
                    href={getZozoUrl(item.searchKeyword)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white text-black py-3 rounded-xl flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>ZOZOで詳細を見る</span>
                  </a>
                </div>
              </div>
              <div className="space-y-2 px-2">
                <span className="text-[9px] font-black text-[#e3acae] uppercase tracking-widest">{item.brandName || 'Special Item'}</span>
                <h5 className="text-base font-black text-gray-900 leading-tight group-hover:text-[#e3acae] transition-colors">{item.name}</h5>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tips Footer */}
        <div className="bg-[#e3acae]/5 rounded-[2rem] p-8 border border-[#e3acae]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#e3acae]/10 rounded-full translate-x-1/4 -translate-y-1/4 blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-12 h-12 bg-[#e3acae] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#e3acae]/20 flex-shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-900 tracking-tight mb-2">Stylist's Secret Advice</h4>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium italic">
                "{suggestion.tips}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;
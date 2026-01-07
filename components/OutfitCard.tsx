
import React, { useState } from 'react';
import { OutfitSuggestion } from '../types';
import { GeminiService, decodeAudioData } from '../services/geminiService';
import { Sparkles, Volume2, Music, Lightbulb, Info, ImageIcon, ExternalLink, ShoppingBag } from 'lucide-react';

interface OutfitCardProps {
  suggestion: OutfitSuggestion;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ suggestion }) => {
  const [playing, setPlaying] = useState(false);
  const gemini = new GeminiService();

  const getBodyTypeName = (type: string | null) => {
    switch (type) {
      case 'Straight': return 'ストレート';
      case 'Wave': return 'ウェーブ';
      case 'Natural': return 'ナチュラル';
      default: return '分析中';
    }
  };

  const playAdvice = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      const audioBytes = await gemini.generateSpeech(suggestion.audioText);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(audioBytes, audioCtx);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => setPlaying(false);
      source.start();
    } catch (err) {
      console.error(err);
      setPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#ff7f50]/10 animate-fade-in max-w-5xl mx-auto mb-10">
      <div className="bg-gradient-to-br from-[#ff7f50] via-[#ff9370] to-[#ffb347] p-10 md:p-14 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/30">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Visual Concierge</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-white/70 font-black tracking-widest mb-1">Body Type Result</div>
              <div className="text-2xl font-black">
                {getBodyTypeName(suggestion.diagnosis)} <span className="ml-1 opacity-60 font-light text-white">type</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter uppercase italic">
            {suggestion.title}
          </h3>
          
          <div className="flex items-start space-x-4 bg-black/10 backdrop-blur-md p-6 rounded-[2rem] mb-8 border border-white/20 max-w-2xl">
            <Info className="w-6 h-6 text-white flex-shrink-0 mt-1" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">Analysis Detail</p>
              <p className="text-sm md:text-base text-white font-medium leading-relaxed">
                {suggestion.diagnosisReason}
              </p>
            </div>
          </div>

          <p className="text-white/80 text-lg md:text-xl italic max-w-3xl leading-relaxed font-medium">
            "{suggestion.reason}"
          </p>
        </div>
      </div>

      <div className="p-10 md:p-16 space-y-20">
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-100 pb-8 gap-6">
            <div>
              <h4 className="text-[10px] font-black text-[#ff7f50] uppercase tracking-[0.3em] mb-2">Curated Items</h4>
              <p className="text-3xl font-black text-gray-900 tracking-tight">おすすめの商品</p>
            </div>
            <button 
              onClick={playAdvice}
              disabled={playing}
              className={`flex items-center justify-center space-x-3 px-8 py-4 rounded-full font-black transition-all shadow-xl active:scale-95 text-sm uppercase tracking-widest ${
                playing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#ff7f50] text-white hover:bg-[#ff8e6e] hover:shadow-[#ff7f50]/20'
              }`}
            >
              {playing ? <Music className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
              <span>{playing ? 'Playing Audio...' : 'Listen Advice'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {suggestion.items.map((item, idx) => (
              <div key={idx} className="flex flex-col group h-full bg-white rounded-[2.5rem] border border-gray-50 hover:border-orange-100 p-6 transition-all duration-300 hover:shadow-xl">
                <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-[1.8rem] bg-gray-50 shadow-sm transition-transform duration-500 group-hover:-translate-y-2">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex flex-col flex-grow space-y-4">
                  <div>
                    {item.brandName && (
                      <span className="text-[9px] font-black text-[#ff7f50] uppercase tracking-[0.2em] block mb-1">
                        {item.brandName}
                      </span>
                    )}
                    <h5 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#ff7f50] transition-colors leading-tight">
                      {item.name}
                    </h5>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                  
                  <a 
                    href={item.zozoSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto w-full bg-black text-white py-4 rounded-2xl flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-widest hover:bg-[#ff7f50] transition-all group/btn"
                  >
                    <ShoppingBag className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span>ZOZOで探す</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#ff7f50]/5 rounded-[3rem] p-10 md:p-14 border border-[#ff7f50]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7f50]/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-[#ff7f50] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#ff7f50]/20">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-gray-900 tracking-tight">Stylist's Secret Advice</h4>
            </div>
            <div className="text-gray-700 leading-relaxed text-lg md:text-xl font-medium max-w-4xl italic">
              {suggestion.tips}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;

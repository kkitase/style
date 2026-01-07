
import React, { useState, useRef, useMemo } from 'react';
import { WeatherData, OutfitSuggestion, UserContext } from './types';
import { GeminiService } from './services/geminiService';
import WeatherSection from './components/WeatherSection';
import OutfitCard from './components/OutfitCard';
import { RefreshCw, Loader2, Sparkles, MapPin, Smile, Camera, Image as ImageIcon, X, Upload, Search, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'context' | 'result'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10); // Yahoo! Weather typically provides 10-day forecast
    return d.toISOString().split('T')[0];
  }, []);

  const [context, setContext] = useState<UserContext>({ 
    locationName: '', 
    mood: 'トレンド重視', 
    date: todayStr 
  });
  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gemini = new GeminiService();

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStep('context');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const startAnalysis = async () => {
    if (!image) return;
    setStep('result');
    setLoading(true);
    setError(null);

    try {
      let weatherData: WeatherData;

      if (context.locationName.trim()) {
        weatherData = await gemini.getWeatherByLocation(context.locationName, context.date);
      } else {
        weatherData = await new Promise<WeatherData>((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const w = await gemini.getLocalWeather(pos.coords.latitude, pos.coords.longitude);
                resolve({ ...w, date: context.date });
              },
              async () => {
                const w = await gemini.getLocalWeather(35.6895, 139.6917); // Tokyo
                resolve({ ...w, date: context.date });
              }
            );
          } else {
            gemini.getLocalWeather(35.6895, 139.6917).then(w => resolve({ ...w, date: context.date }));
          }
        });
      }

      setWeather(weatherData);
      const s = await gemini.getOutfitSuggestion(image, weatherData, context);
      setSuggestion(s);
    } catch (err: any) {
      setError(err.message || "解析に失敗しました。日付がYahoo!天気の予報範囲内か確認してください。");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setWeather(null);
    setSuggestion(null);
    setIsDragging(false);
    setContext({ locationName: '', mood: 'トレンド重視', date: todayStr });
    setStep('upload');
  };

  return (
    <div className="min-h-screen pb-40 bg-[#fff9f5]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#ff7f50]/20">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={reset}>
            <div className="w-10 h-10 bg-[#ff7f50] rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-[#ff7f50]/30 group-hover:scale-110 transition-transform">M</div>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tighter leading-none">STYLE MAKER</h1>
              <span className="text-[9px] text-[#ff7f50] font-bold uppercase tracking-[0.2em]">Visual Concierge</span>
            </div>
          </div>
          
          {step !== 'upload' && (
            <button 
              onClick={reset}
              className="flex items-center space-x-2 text-[10px] font-black text-gray-400 hover:text-[#ff7f50] transition-colors uppercase tracking-widest px-5 py-2.5 bg-gray-50 rounded-full"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16">
        {step === 'upload' && (
          <div className="space-y-20 animate-fade-in pb-20">
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-[#ff7f50]/10 px-5 py-2.5 rounded-full border border-[#ff7f50]/20">
                <ImageIcon className="w-4 h-4 text-[#ff7f50]" />
                <span className="text-[10px] font-black text-[#ff7f50] uppercase tracking-[0.2em]">Visual AI Analysis</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.85] tracking-tighter">
                骨格から紐解く、<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7f50] to-[#ffb347]">最高の着こなし。</span>
              </h2>
              <p className="text-gray-500 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                写真をアップロードするだけでAIが骨格を精密診断。Yahoo!天気と連携し、<br className="hidden md:block"/>予定日の予報に合わせた究極のスタイリングをご提案します。
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative h-[450px] bg-white border-2 border-dashed rounded-[4rem] flex flex-col items-center justify-center space-y-6 cursor-pointer transition-all duration-500 shadow-sm ${
                  isDragging 
                    ? 'border-[#ff7f50] bg-[#ff7f50]/5 scale-[1.02] shadow-2xl shadow-[#ff7f50]/20' 
                    : 'border-[#ff7f50]/20 hover:border-[#ff7f50]/50 hover:bg-[#ff7f50]/5 hover:shadow-xl'
                }`}
              >
                <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 ${
                  isDragging ? 'bg-[#ff7f50] text-white scale-110 shadow-lg' : 'bg-[#ff7f50]/10 text-[#ff7f50] group-hover:scale-110'
                }`}>
                  {isDragging ? <Upload className="w-12 h-12 animate-bounce" /> : <Camera className="w-12 h-12" />}
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-900 mb-2">
                    {isDragging ? 'ドロップして解析開始' : '全身写真をアップロード'}
                  </p>
                  <p className="text-gray-400 font-medium text-lg">
                    {isDragging ? 'スタイリストに渡します' : 'タップまたはドラッグ＆ドロップ'}
                  </p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-center mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
                Secure Analysis • Privacy Protected • Yahoo! Weather Sync
              </p>
            </div>
          </div>
        )}

        {step === 'context' && (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start animate-fade-in pb-32">
            <div className="space-y-8 sticky top-28">
              <div className="relative group overflow-hidden rounded-[3.5rem] shadow-2xl shadow-[#ff7f50]/10">
                <img src={image!} alt="Your Photo" className="w-full h-[700px] object-cover border border-white transition-transform duration-700 group-hover:scale-105" />
                <button 
                  onClick={() => setStep('upload')}
                  className="absolute top-6 right-6 w-12 h-12 bg-black/40 backdrop-blur-xl text-white rounded-full flex items-center justify-center hover:bg-black transition-all shadow-xl hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-tight uppercase">Planning</h2>
                <p className="text-gray-500 font-medium text-xl">AIがYahoo!天気を参照し、最適なバランスを算出します。</p>
              </div>
              
              <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-[#ff7f50]/10 space-y-12">
                
                {/* Location & Date Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Location Input */}
                  <div className="space-y-4">
                    <label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center">
                      <MapPin className="w-4 h-4 mr-3 text-[#ff7f50]" /> 1. Location
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="h-6 w-6 text-gray-300 group-focus-within:text-[#ff7f50] transition-colors" />
                      </div>
                      <input 
                        type="text"
                        placeholder="例：銀座、札幌"
                        value={context.locationName}
                        onChange={(e) => setContext({...context, locationName: e.target.value})}
                        className="block w-full pl-16 pr-8 py-6 bg-[#ff7f50]/5 border-2 border-transparent rounded-[2rem] text-lg font-bold placeholder:text-gray-300 focus:outline-none focus:border-[#ff7f50] focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Date Picker */}
                  <div className="space-y-4">
                    <label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center">
                      <Calendar className="w-4 h-4 mr-3 text-[#ff7f50]" /> 2. Date
                    </label>
                    <div className="relative group">
                      <input 
                        type="date"
                        min={todayStr}
                        max={maxDateStr}
                        value={context.date}
                        onChange={(e) => setContext({...context, date: e.target.value})}
                        className="block w-full px-8 py-6 bg-[#ff7f50]/5 border-2 border-transparent rounded-[2rem] text-lg font-bold focus:outline-none focus:border-[#ff7f50] focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Mood Selection */}
                <div className="space-y-6">
                  <label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center">
                    <Sparkles className="w-4 h-4 mr-3 text-[#ff7f50]" /> 3. Desired Vibe
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['トレンド重視', '好印象・モテ', 'スポーティー', 'ミニマル・上品', 'ヴィンテージ風', '知性的・モード'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setContext({...context, mood: m})}
                        className={`py-5 rounded-[1.5rem] text-[11px] font-black border-2 transition-all active:scale-95 ${
                          context.mood === m 
                            ? 'border-[#ff7f50] bg-[#ff7f50] text-white shadow-xl shadow-[#ff7f50]/20' 
                            : 'border-[#ff7f50]/10 bg-[#ff7f50]/5 text-gray-400 hover:border-[#ff7f50]/30 hover:bg-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={startAnalysis}
                  className="w-full bg-[#ff7f50] text-white py-7 rounded-[2rem] font-black text-2xl shadow-2xl shadow-[#ff7f50]/30 hover:bg-gray-900 hover:-translate-y-1.5 transition-all active:scale-95 flex items-center justify-center space-x-4 group"
                >
                  <span>コーデを生成する</span>
                  <Sparkles className="w-7 h-7 text-white/80 group-hover:rotate-12 transition-transform" />
                </button>
                <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  Powered by Yahoo! Weather Forecast
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-16 animate-fade-in pb-40">
            {weather && <WeatherSection weather={weather} />}
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-48 space-y-10 bg-white rounded-[4rem] border border-[#ff7f50]/10 shadow-xl">
                <div className="relative">
                  <div className="w-40 h-40 border-[16px] border-[#ff7f50]/10 border-t-[#ff7f50] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#ff7f50]/20 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-4 px-10">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter">AI Concierge is Analyzing...</h3>
                  <p className="text-gray-400 font-medium text-xl max-w-lg mx-auto leading-relaxed">
                    Yahoo!天気の{context.date}の予報と、あなたの骨格を照らし合わせ、究極のスタイリングを構築しています。
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-rose-50 p-16 rounded-[4rem] border border-rose-100 text-center max-w-2xl mx-auto shadow-2xl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-full text-rose-600 mb-8 text-3xl font-black">!</div>
                <p className="text-rose-700 font-black mb-10 text-2xl leading-relaxed">{error}</p>
                <button 
                  onClick={reset}
                  className="bg-rose-600 text-white px-14 py-6 rounded-[1.5rem] font-black text-xl hover:bg-rose-700 transition-all shadow-2xl shadow-rose-200 active:scale-95"
                >
                  最初からやり直す
                </button>
              </div>
            ) : suggestion ? (
              <OutfitCard suggestion={suggestion} />
            ) : null}
          </div>
        )}
      </main>

      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full px-6 flex justify-center">
        <div className="bg-gray-900/95 backdrop-blur-3xl px-12 py-6 rounded-full shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] flex items-center space-x-10 border border-white/10 max-w-xl">
          <div className="flex items-center space-x-4">
             <div className="w-10 h-10 bg-[#ff7f50] rounded-2xl flex items-center justify-center text-white shadow-lg"><Smile className="w-6 h-6" /></div>
             <div className="flex flex-col">
                <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em] leading-none mb-1.5">System Status</span>
                <span className="text-white text-xs font-black tracking-tight leading-none uppercase">Yahoo Weather Synced</span>
             </div>
          </div>
          <div className="w-[1px] h-10 bg-white/10"></div>
          <div className="flex items-center space-x-8">
             <div className="flex flex-col">
                <span className="text-[#ff7f50] text-[9px] font-black uppercase tracking-widest mb-1.5">Core</span>
                <span className="text-white text-[13px] font-black leading-none">Flash 3.0</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[#ffb347] text-[9px] font-black uppercase tracking-widest mb-1.5">Design</span>
                <span className="text-white text-[13px] font-black leading-none">STYLE MAKER v2</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

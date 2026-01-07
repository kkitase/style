
import React, { useState, useRef, useMemo } from 'react';
import { WeatherData, OutfitSuggestion, UserContext } from './types';
import { GeminiService } from './services/geminiService';
import WeatherSection from './components/WeatherSection';
import OutfitCard from './components/OutfitCard';
import { RefreshCw, Loader2, Sparkles, MapPin, Smile, Camera, Image as ImageIcon, X, Search, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'context' | 'result'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
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

  const startAnalysis = async () => {
    if (!image) return;
    setStep('result');
    setLoading(true);
    setError(null);

    try {
      const gemini = new GeminiService();
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
                const w = await gemini.getLocalWeather(35.6895, 139.6917);
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
      setError(err.message || "解析に失敗しました。");
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
    <div className={`flex flex-col bg-[#fdf8f9] ${step === 'result' ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-[#e3acae]/20 h-14 z-50 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={reset}>
            <div className="w-8 h-8 bg-[#e3acae] rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-[#e3acae]/20 group-hover:scale-105 transition-transform text-xs">M</div>
            <h1 className="text-sm font-black text-gray-900 tracking-tighter">STYLE MAKER</h1>
          </div>
          {step !== 'upload' && (
            <button onClick={reset} className="text-[10px] font-black text-gray-400 hover:text-[#e3acae] transition-colors uppercase tracking-widest flex items-center space-x-1">
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </header>

      <main className={`flex-grow ${step === 'result' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <div className={`max-w-5xl mx-auto px-4 h-full flex flex-col ${step === 'result' ? 'py-8' : 'justify-center py-4'}`}>
          {step === 'upload' && (
            <div className="space-y-4 animate-fade-in flex flex-col items-center justify-center h-full max-h-[85vh]">
              <div className="text-center space-y-2 mb-2">
                <div className="inline-flex items-center space-x-2 bg-[#e3acae]/10 px-3 py-1 rounded-full border border-[#e3acae]/20">
                  <Sparkles className="w-3 h-3 text-[#e3acae]" />
                  <span className="text-[8px] font-black text-[#e3acae] uppercase tracking-widest">Visual Analysis</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                  AIが導き出す<br/><span className="text-[#e3acae]">最高の自分。</span>
                </h2>
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full max-w-[320px] h-[400px] max-h-[50vh] rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
                  isDragging ? 'border-[#e3acae] bg-[#e3acae]/5' : 'border-[#e3acae]/20 bg-white hover:border-[#e3acae]/50 shadow-sm'
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                <div className="w-16 h-16 bg-[#e3acae]/10 rounded-2xl flex items-center justify-center text-[#e3acae]">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="text-center px-6">
                  <p className="text-sm font-black text-gray-800">全身写真をアップロード</p>
                  <p className="text-[10px] text-gray-400 mt-1">骨格をAIが即座に分析します</p>
                </div>
              </div>
            </div>
          )}

          {step === 'context' && (
            <div className="animate-fade-in flex flex-col items-center justify-center h-full overflow-hidden">
              <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-[#e3acae]/10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 text-[#e3acae] mr-2" />
                    プラン設定
                  </h3>
                  <button onClick={() => setStep('upload')} className="text-[9px] font-bold text-[#e3acae] underline">写真を変更</button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-[#e3acae]" /> Destination
                    </label>
                    <input type="text" placeholder="例：渋谷（空欄で現在地）" value={context.locationName} onChange={e => setContext({...context, locationName: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-1 focus:ring-[#e3acae]/50 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-[#e3acae]" /> Date
                    </label>
                    <input type="date" min={todayStr} max={maxDateStr} value={context.date} onChange={e => setContext({...context, date: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-1 focus:ring-[#e3acae]/50 transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <Smile className="w-3 h-3 mr-1 text-[#e3acae]" /> Mood
                    </label>
                    <select value={context.mood} onChange={e => setContext({...context, mood: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-1 focus:ring-[#e3acae]/50 appearance-none">
                      <option>トレンド重視</option>
                      <option>上品・コンサバ</option>
                      <option>カジュアル・ラフ</option>
                      <option>デート・特別な日</option>
                    </select>
                  </div>
                </div>
                <button onClick={startAnalysis} className="w-full bg-[#e3acae] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#e3acae]/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center space-x-2">
                  <Search className="w-3.5 h-3.5" />
                  <span>AI スタイリングを開始</span>
                </button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="animate-fade-in space-y-8 pb-12 w-full">
              {loading ? (
                <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-[#e3acae] animate-spin" />
                    <Sparkles className="w-4 h-4 text-[#e3acae] absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Analyzing your style...</p>
                </div>
              ) : error ? (
                <div className="h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <X className="w-10 h-10 text-red-400" />
                  <p className="text-sm font-bold text-gray-800">{error}</p>
                  <button onClick={() => setStep('context')} className="text-xs font-black text-[#e3acae] underline">設定に戻る</button>
                </div>
              ) : (
                <>
                  <WeatherSection weather={weather!} />
                  <OutfitCard suggestion={suggestion!} />
                  <div className="flex justify-center pt-4">
                    <button onClick={reset} className="px-10 py-5 bg-white border border-[#e3acae]/30 text-[#e3acae] rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#e3acae] hover:text-white transition-all shadow-md active:scale-95">
                      別の写真を試す
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

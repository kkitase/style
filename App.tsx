
import React, { useState, useEffect, useCallback } from 'react';
import { BodyType, WeatherData, OutfitSuggestion } from './types';
import { GeminiService } from './services/geminiService';
import BodyTypeImageUpload from './components/BodyTypeImageUpload';
import WeatherSection from './components/WeatherSection';
import OutfitCard from './components/OutfitCard';
import LocationInput from './components/LocationInput';

import ShoppingList from './components/ShoppingList';

const App: React.FC = () => {
  const [bodyType, setBodyType] = useState<BodyType>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');

  const gemini = new GeminiService();

  const handleDiagnosisComplete = (result: BodyType) => {
    setBodyType(result);
  };

  const handleLocationSubmit = (loc: string) => {
    setLocation(loc);
    fetchWeatherAndSuggest(loc);
  };

  const fetchWeatherAndSuggest = useCallback(async (loc: string) => {
    if (!bodyType) return;
    setLoading(true);
    setError(null);
    try {
      const weatherData = await gemini.getLocalWeather(loc);
      setWeather(weatherData);
      const outfit = await gemini.getOutfitSuggestion(bodyType, weatherData, loc);
      setSuggestion(outfit);
    } catch (err) {
      console.error(err);
      setError(`AIとの通信に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [bodyType]);

  const reset = () => {
    setBodyType(null);
    setWeather(null);
    setSuggestion(null);
    setLocation('');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">S</div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">StyleCast</h1>
          </div>
          {bodyType && (
            <button
              onClick={reset}
              className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors"
            >
              診断をやり直す
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {!bodyType ? (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                あなたの骨格と天気に、<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">最高の提案を。</span>
              </h2>
              <p className="text-gray-500 text-lg">
                写真をアップロードするだけで、AIがあなたの骨格タイプを診断。
              </p>
            </div>
            <BodyTypeImageUpload onComplete={handleDiagnosisComplete} />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Location Input Phase */}
            {!weather && !loading && (
              <div className="animate-fade-in">
                <div className="bg-orange-50 p-6 rounded-2xl mb-8 border border-orange-100">
                  <p className="font-bold text-orange-800 flex items-center">
                    <span className="bg-white p-2 rounded-full mr-3 shadow-sm">✨</span>
                    骨格タイプ: {bodyType}
                  </p>
                  <p className="text-sm text-orange-600 mt-2 ml-14">
                    診断完了しました！次は行き先を教えてください。
                  </p>
                </div>
                <LocationInput onLocationSubmit={handleLocationSubmit} />
              </div>
            )}

            {/* Application Content */}
            {(weather || loading) && (
              <>
                {weather && <WeatherSection weather={weather} />}

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-400 rounded-full animate-spin"></div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-700">AIがスタイリング中...</p>
                      <p className="text-gray-400 text-sm">あなたの骨格と現地の天気を分析し、商品を探しています</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center">
                    <p className="text-red-600 font-medium mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors"
                    >
                      再読み込み
                    </button>
                  </div>
                ) : suggestion ? (
                  <div className="animate-fade-in space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <OutfitCard suggestion={suggestion} bodyType={bodyType} />
                      </div>
                      <div className="space-y-8">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="font-bold text-gray-800 mb-2">💡 ポイント</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{suggestion.tips}</p>
                        </div>
                      </div>
                    </div>

                    {suggestion.products && <ShoppingList items={suggestion.products} />}
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </main>

      {/* Floating Call to Action (if needed) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-gray-900/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center space-x-4 border border-white/10">
          <span className="text-white/60 text-xs font-medium uppercase tracking-widest">Personal Stylist AI</span>
          <div className="w-[1px] h-4 bg-white/20"></div>
          <span className="text-white text-sm font-semibold">Powered by Gemini</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

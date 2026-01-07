
import React from 'react';
import { WeatherData } from '../types';
import { Cloud, Sun, CloudRain, CloudLightning, MapPin, Droplets, Calendar } from 'lucide-react';

interface WeatherSectionProps {
  weather: WeatherData;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ weather }) => {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes('晴')) return <Sun className="w-8 h-8 text-[#ff7f50]" />;
    if (condition.includes('雨')) return <CloudRain className="w-8 h-8 text-blue-400" />;
    if (condition.includes('雷')) return <CloudLightning className="w-8 h-8 text-yellow-400" />;
    if (condition.includes('曇')) return <Cloud className="w-8 h-8 text-gray-400" />;
    return <Cloud className="w-8 h-8 text-gray-300" />;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-white rounded-[3rem] shadow-xl shadow-[#ff7f50]/5 border border-[#ff7f50]/10 max-w-4xl mx-auto space-y-6 md:space-y-0 relative overflow-hidden">
      <div className="absolute top-0 right-0 px-6 py-2 bg-[#ff7f50] text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl flex items-center shadow-sm">
        <Calendar className="w-3 h-3 mr-2" />
        {weather.date || 'Today'} Forecast
      </div>

      <div className="flex items-center space-x-6">
        <div className="w-16 h-16 bg-[#ff7f50]/5 rounded-2xl flex items-center justify-center">
          {getWeatherIcon(weather.condition)}
        </div>
        <div>
          <div className="flex items-center space-x-2 text-gray-400 mb-1">
            <MapPin className="w-3 h-3 text-[#ff7f50]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{weather.city}</span>
          </div>
          <div className="text-xl font-black text-gray-800 tracking-tight">{weather.condition}</div>
          <div className="text-xs text-gray-400 font-medium italic">{weather.description}</div>
        </div>
      </div>

      <div className="flex items-center space-x-12">
        <div className="text-center">
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Temp</div>
          <div className="flex items-baseline">
            <span className="text-4xl font-black text-gray-900 leading-none">{weather.temp}</span>
            <span className="text-lg font-bold text-[#ff7f50]/40 ml-1">°C</span>
          </div>
        </div>
        <div className="w-[1px] h-10 bg-[#ff7f50]/10 hidden md:block"></div>
        <div className="text-center">
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 flex items-center justify-center">
            <Droplets className="w-2.5 h-2.5 mr-1 text-blue-300" /> Humidity
          </div>
          <div className="flex items-baseline">
            <span className="text-4xl font-black text-gray-900 leading-none">{weather.humidity}</span>
            <span className="text-lg font-bold text-[#ff7f50]/40 ml-1">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSection;

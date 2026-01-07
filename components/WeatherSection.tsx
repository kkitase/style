import React from 'react';
import { WeatherData } from '../types';
import { Cloud, Sun, CloudRain, CloudLightning, MapPin, Droplets, ThermometerSun } from 'lucide-react';

interface WeatherSectionProps {
  weather: WeatherData;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ weather }) => {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes('晴')) return <Sun className="w-16 h-16 text-orange-400 drop-shadow-sm" />;
    if (condition.includes('雨')) return <CloudRain className="w-16 h-16 text-blue-400 drop-shadow-sm" />;
    if (condition.includes('雷')) return <CloudLightning className="w-16 h-16 text-yellow-400 drop-shadow-sm" />;
    return <Cloud className="w-16 h-16 text-gray-400 drop-shadow-sm" />;
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-[#e3acae]/10 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#e3acae]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-[#e3acae]/10 transition-colors"></div>
      
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 relative z-10">
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-[#e3acae]" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{weather.city}</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="bg-[#fdf8f9] p-4 rounded-3xl">
              {getWeatherIcon(weather.condition)}
            </div>
            <div>
              <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1">
                {weather.condition}
              </div>
              <p className="text-xs text-gray-400 font-bold max-w-[200px]">
                {weather.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-10 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-10 w-full md:w-auto justify-around md:justify-end">
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-x-1 text-[9px] font-black text-[#e3acae] uppercase tracking-widest mb-1">
              <ThermometerSun className="w-3 h-3" />
              <span>Temp</span>
            </div>
            <div className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
              {weather.temp}<span className="text-xl font-light text-[#e3acae]/50 ml-1">°C</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-x-1 text-[9px] font-black text-[#e3acae] uppercase tracking-widest mb-1">
              <Droplets className="w-3 h-3" />
              <span>Humidity</span>
            </div>
            <div className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
              {weather.humidity}<span className="text-xl font-light text-[#e3acae]/50 ml-1">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSection;
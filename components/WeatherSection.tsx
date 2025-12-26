
import React from 'react';
import { WeatherData } from '../types';

interface WeatherSectionProps {
  weather: WeatherData;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ weather }) => {
  return (
    <div className="flex items-center space-x-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">
        {weather.condition.includes('晴') ? '☀️' : 
         weather.condition.includes('雨') ? '🌧️' : 
         weather.condition.includes('曇') ? '☁️' : '🌤️'}
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{weather.city}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-sm font-medium text-gray-500">{weather.condition}</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-gray-800">{weather.temp}</span>
          <span className="text-xl font-medium text-gray-400">°C</span>
          <span className="ml-4 text-sm text-gray-400">湿度 {weather.humidity}%</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherSection;

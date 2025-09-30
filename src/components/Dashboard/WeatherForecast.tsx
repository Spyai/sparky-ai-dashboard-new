import React from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye, Gauge } from 'lucide-react';
import { WeatherData } from '../../lib/api';

interface WeatherForecastProps {
  data: WeatherData;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ data }) => {
  const getWeatherIcon = (weatherMain: string, icon: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'rain':
        return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'clouds':
        return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-400" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const kelvinToCelsius = (kelvin: number) => {
    return Math.round(kelvin - 273.15);
  };

  const getUVILevel = (uvi: number) => {
    if (uvi <= 2) return { level: 'Low', color: 'text-green-400' };
    if (uvi <= 5) return { level: 'Moderate', color: 'text-yellow-400' };
    if (uvi <= 7) return { level: 'High', color: 'text-orange-400' };
    if (uvi <= 10) return { level: 'Very High', color: 'text-red-400' };
    return { level: 'Extreme', color: 'text-purple-400' };
  };

  const today = data.daily[0];
  const forecast = data.daily.slice(1, 5); // Next 4 days

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Cloud className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Weather Forecast</h3>
      </div>

      {/* Today's Weather */}
      <div className="bg-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-white">Today</h4>
            <p className="text-zinc-400 text-sm">{today.summary}</p>
          </div>
          {getWeatherIcon(today.weather[0].main, today.weather[0].icon)}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Thermometer className="w-4 h-4 text-red-400" />
              <span className="text-zinc-400 text-sm">High</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {kelvinToCelsius(today.temp.max)}°C
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Thermometer className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-400 text-sm">Low</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {kelvinToCelsius(today.temp.min)}°C
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-400 text-sm">Rain</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.round(today.pop * 100)}%
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wind className="w-4 h-4 text-gray-400" />
              <span className="text-zinc-400 text-sm">Wind</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.round(today.wind_speed)} m/s
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-400">Humidity:</span>
            <span className="text-white">{today.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400">Pressure:</span>
            <span className="text-white">{today.pressure} hPa</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-yellow-400" />
            <span className="text-zinc-400">UV Index:</span>
            <span className={`font-medium ${getUVILevel(today.uvi).color}`}>
              {today.uvi} ({getUVILevel(today.uvi).level})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-400">Sunrise:</span>
            <span className="text-white">{formatTime(today.sunrise)}</span>
          </div>
        </div>

        {today.rain && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">
                Expected rainfall: {today.rain}mm
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4-Day Forecast */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">4-Day Forecast</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {forecast.map((day, index) => (
            <div key={index} className="bg-zinc-800 rounded-lg p-4">
              <div className="text-center mb-3">
                <p className="text-white font-medium mb-1">{formatDate(day.dt)}</p>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(day.weather[0].main, day.weather[0].icon)}
                </div>
                <p className="text-zinc-400 text-xs capitalize">
                  {day.weather[0].description}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">High:</span>
                  <span className="text-white font-medium">
                    {kelvinToCelsius(day.temp.max)}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Low:</span>
                  <span className="text-white font-medium">
                    {kelvinToCelsius(day.temp.min)}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Rain:</span>
                  <span className={`font-medium ${day.pop >= 0.8 ? 'text-blue-400' : 'text-white'}`}>
                    {Math.round(day.pop * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Wind:</span>
                  <span className="text-white font-medium">
                    {Math.round(day.wind_speed)} m/s
                  </span>
                </div>
              </div>

              {day.pop >= 0.8 && (
                <div className="mt-3 p-2 bg-blue-900/20 border border-blue-800 rounded text-center">
                  <p className="text-blue-400 text-xs">
                    ⚠️ High rain probability
                  </p>
                </div>
              )}

              {day.rain && (
                <div className="mt-2 text-center">
                  <span className="text-blue-400 text-xs">
                    Expected: {day.rain}mm
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weather Insights */}
      <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
        <h5 className="text-green-400 font-medium mb-2">🌱 Farming Insights</h5>
        <div className="space-y-1 text-sm text-green-300">
          {today.pop >= 0.8 ? (
            <p>• High rain probability today - consider delaying irrigation</p>
          ) : (
            <p>• Good weather for irrigation and field activities</p>
          )}
          {today.wind_speed > 10 && (
            <p>• Strong winds expected - secure loose materials</p>
          )}
          {today.uvi > 8 && (
            <p>• High UV levels - ensure adequate sun protection for workers</p>
          )}
          {today.temp.max > 308 && ( // 35°C
            <p>• High temperatures - monitor crop stress and increase watering</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
import React, { useState } from 'react';
import { Droplets, Calendar, Cloud, Brain, AlertTriangle, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { WeatherData } from '../../lib/api';
import { IrrigationSchedule } from '../../lib/realtime-api';

interface IrrigationCalendarProps {
  data: IrrigationSchedule[];
  weatherData?: WeatherData | null;
}

const IrrigationCalendar: React.FC<IrrigationCalendarProps> = ({ data, weatherData }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeatherIcon = (probability: number) => {
    if (probability >= 80) return '🌧️';
    if (probability >= 60) return '⛅';
    if (probability >= 40) return '🌤️';
    return '☀️';
  };

  const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'Medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'Low': return 'bg-green-500/20 border-green-500 text-green-400';
      default: return 'bg-zinc-500/20 border-zinc-500 text-zinc-400';
    }
  };

  const getStressLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Droplets className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">AI Irrigation Schedule</h3>
          <p className="text-sm text-zinc-400">Weather-based AI recommendations for optimal irrigation</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm font-medium">AI Generated</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {data.slice(0, showDetails ? data.length : 4).map((schedule, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all ${
              schedule.precipitation_probability >= 80
                ? 'bg-red-900/20 border-red-800'
                : schedule.priority === 'High'
                ? 'bg-orange-900/20 border-orange-800'
                : 'bg-zinc-800 border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{getWeatherIcon(schedule.precipitation_probability)}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span className="text-white font-medium">{formatDate(schedule.date)}</span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(schedule.priority)}`}>
                      {schedule.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>⏰ {schedule.time}</span>
                    <span>💧 {schedule.quantity_mm}mm</span>
                    <span>⏱️ {schedule.duration_hours}h</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">{schedule.precipitation_probability}%</span>
                </div>
                <span className="text-xs text-zinc-400">Rain chance</span>
              </div>
            </div>

            {/* Water Stress and Method Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="bg-zinc-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-zinc-400 text-sm">Water Stress</span>
                </div>
                <span className={`font-medium ${getStressLevelColor(schedule.water_stress_level)}`}>
                  {schedule.water_stress_level}
                </span>
              </div>
              
              <div className="bg-zinc-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-400 text-sm">Method</span>
                </div>
                <span className="text-white font-medium">{schedule.irrigation_method}</span>
              </div>

              <div className="bg-zinc-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-green-400" />
                  <span className="text-zinc-400 text-sm">AI Status</span>
                </div>
                <span className="text-green-400 font-medium">Optimized</span>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  <span className="text-blue-400 text-sm font-medium">AI Recommendation: </span>
                  <span className="text-zinc-300 text-sm">{schedule.ai_recommendation}</span>
                </div>
              </div>
            </div>

            {/* High priority or rain warning */}
            {(schedule.precipitation_probability >= 80 || schedule.priority === 'High') && (
              <div className="mt-3 p-3 bg-amber-900/30 rounded border border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div className="text-amber-400 text-sm">
                    {schedule.precipitation_probability >= 80 && (
                      <p>⚠️ High rain probability ({schedule.precipitation_probability}%) - Consider delaying irrigation</p>
                    )}
                    {schedule.priority === 'High' && schedule.precipitation_probability < 80 && (
                      <p>🚨 High priority irrigation needed due to water stress level: {schedule.water_stress_level}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {data.length > 4 && (
        <div className="text-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
          >
            <span className="text-zinc-300">
              {showDetails ? 'Show Less' : `Show All ${data.length} Days`}
            </span>
            {showDetails ? 
              <ChevronUp className="w-4 h-4 text-zinc-400" /> : 
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default IrrigationCalendar;
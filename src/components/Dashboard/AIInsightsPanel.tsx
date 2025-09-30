import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { generateFarmingInsights, analyzeCropHealth, generateWeatherRecommendations } from '../../lib/gemini';

interface AIInsightsPanelProps {
  farmData: any;
  weatherData: any;
  cropHealthData: any;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  farmData,
  weatherData,
  cropHealthData
}) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'health' | 'weather'>('general');

  useEffect(() => {
    if (farmData && cropHealthData) {
      generateInsights();
    }
  }, [farmData, weatherData, cropHealthData]);

  const generateInsights = async () => {
    setLoading(true);
    setError('');
    
    try {
      let aiInsights = '';
      
      switch (activeTab) {
        case 'health':
          if (cropHealthData) {
            aiInsights = await analyzeCropHealth(cropHealthData);
          } else {
            aiInsights = 'Crop health data is not available for analysis.';
          }
          break;
        case 'weather':
          if (weatherData) {
            aiInsights = await generateWeatherRecommendations(weatherData, farmData);
          } else {
            aiInsights = 'Weather data is not available for analysis.';
          }
          break;
        default:
          aiInsights = await generateFarmingInsights(farmData, weatherData, cropHealthData);
      }
      
      setInsights(aiInsights);
    } catch (err: any) {
      setError('Failed to generate AI insights. Please try again.');
      console.error('Error generating insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmData && (cropHealthData || weatherData)) {
      generateInsights();
    }
  }, [activeTab]);

  const formatInsights = (text: string) => {
    // Split by numbered points and format
    const sections = text.split(/\d+\.\s+/).filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      const title = lines[0];
      const content = lines.slice(1);
      
      return (
        <div key={index} className="mb-4">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            {index === 0 && <TrendingUp className="w-4 h-4 text-green-400" />}
            {index === 1 && <Lightbulb className="w-4 h-4 text-yellow-400" />}
            {index === 2 && <AlertTriangle className="w-4 h-4 text-blue-400" />}
            {index === 3 && <AlertTriangle className="w-4 h-4 text-red-400" />}
            {index === 4 && <Brain className="w-4 h-4 text-purple-400" />}
            {title}
          </h4>
          <div className="space-y-1">
            {content.map((line, lineIndex) => (
              <p key={lineIndex} className="text-zinc-300 text-sm leading-relaxed">
                {line.trim()}
              </p>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">AI Farming Insights</h3>
            <p className="text-zinc-400 text-sm">
              Powered by Gemini AI • Real-time analysis
            </p>
          </div>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg transition-colors text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      {/* Analysis Type Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-purple-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          General Insights
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'health'
              ? 'bg-purple-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          Crop Health Analysis
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'weather'
              ? 'bg-purple-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          Weather Recommendations
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-zinc-400">Generating AI insights...</p>
            <p className="text-zinc-500 text-sm">Analyzing crop health, weather, and field data</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 font-medium">Error</p>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
          <button
            onClick={generateInsights}
            className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-4">
          {formatInsights(insights)}
          
          <div className="mt-6 p-4 bg-purple-900/20 border border-purple-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium">AI Analysis Complete</span>
            </div>
            <p className="text-purple-300 text-sm">
              These insights are generated using advanced AI analysis of your farm data, 
              weather conditions, and agricultural best practices. Always consult with 
              local agricultural experts for specific recommendations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;
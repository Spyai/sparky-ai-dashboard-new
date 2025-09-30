import React, { useState } from 'react';
import { Beaker, Calendar, Target, DollarSign, Brain, Thermometer, ChevronDown, ChevronUp } from 'lucide-react';
import { FertilizerRecommendation } from '../../lib/realtime-api';

interface FertilizerInfoProps {
  data: FertilizerRecommendation;
}

const FertilizerInfo: React.FC<FertilizerInfoProps> = ({ data }) => {
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showSoilAnalysis, setShowSoilAnalysis] = useState(false);

  const nutrients = [
    { name: 'Nitrogen (N)', value: data.N, unit: 'kg/acre', color: 'bg-blue-500' },
    { name: 'Phosphorus (P)', value: data.P, unit: 'kg/acre', color: 'bg-purple-500' },
    { name: 'Potassium (K)', value: data.K, unit: 'kg/acre', color: 'bg-orange-500' },
    { name: 'Sulfur (S)', value: data.S, unit: 'kg/acre', color: 'bg-yellow-500' },
    { name: 'Zinc (Zn)', value: data.Zn, unit: 'kg/acre', color: 'bg-green-500' },
  ];

  const getHealthColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Beaker className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">AI Fertilizer Management</h3>
          <p className="text-sm text-zinc-400">AI-powered recommendations based on real-time data</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
          <Brain className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">AI Generated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {nutrients.map((nutrient) => (
          <div key={nutrient.name} className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${nutrient.color}`}></div>
              <span className="text-zinc-300 text-sm">{nutrient.name}</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {nutrient.value}
              <span className="text-sm text-zinc-400 ml-1">{nutrient.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300 font-medium">Frequency</span>
          </div>
          <p className="text-white text-lg">{data.frequency}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-300 font-medium">Method</span>
          </div>
          <p className="text-white text-lg">{data.method}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-300 font-medium">Timing</span>
          </div>
          <p className="text-white text-sm">{data.timing}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-zinc-300 font-medium">Est. Cost</span>
          </div>
          <p className="text-white text-lg">${data.cost_estimate}</p>
        </div>
      </div>

      <div className="bg-zinc-800 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-zinc-300 font-medium">Fertilizer Sources</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.sources.map((source, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-zinc-700 text-zinc-300 text-sm rounded-full border border-zinc-600"
            >
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* Soil Analysis Section */}
      <div className="bg-zinc-800 rounded-lg p-4 mb-4">
        <button
          onClick={() => setShowSoilAnalysis(!showSoilAnalysis)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-300 font-medium">Soil Analysis</span>
          </div>
          {showSoilAnalysis ? 
            <ChevronUp className="w-4 h-4 text-zinc-400" /> : 
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          }
        </button>
        
        {showSoilAnalysis && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-zinc-400 text-sm">pH Level</p>
              <p className="text-white font-semibold">{data.soil_analysis.ph_level.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-zinc-400 text-sm">Organic Matter</p>
              <p className="text-white font-semibold">{data.soil_analysis.organic_matter.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-zinc-400 text-sm">Nitrogen</p>
              <p className={`font-semibold ${getHealthColor(data.soil_analysis.nitrogen_level)}`}>
                {data.soil_analysis.nitrogen_level}
              </p>
            </div>
            <div className="text-center">
              <p className="text-zinc-400 text-sm">Phosphorus</p>
              <p className={`font-semibold ${getHealthColor(data.soil_analysis.phosphorus_level)}`}>
                {data.soil_analysis.phosphorus_level}
              </p>
            </div>
            <div className="text-center">
              <p className="text-zinc-400 text-sm">Potassium</p>
              <p className={`font-semibold ${getHealthColor(data.soil_analysis.potassium_level)}`}>
                {data.soil_analysis.potassium_level}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
        <button
          onClick={() => setShowAIInsights(!showAIInsights)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-white font-medium">AI Insights & Recommendations</span>
          </div>
          {showAIInsights ? 
            <ChevronUp className="w-4 h-4 text-zinc-400" /> : 
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          }
        </button>
        
        {showAIInsights && (
          <div className="mt-4">
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                {data.ai_insights}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilizerInfo;
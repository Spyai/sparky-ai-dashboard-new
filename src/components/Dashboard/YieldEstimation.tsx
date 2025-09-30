import React, { useState } from 'react';
import { TrendingUp, Calendar, Target, Brain, BarChart3, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { YieldPrediction } from '../../lib/realtime-api';

interface YieldEstimationProps {
  crop: string;
  data: YieldPrediction;
}

const YieldEstimation: React.FC<YieldEstimationProps> = ({ crop, data }) => {
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showFactors, setShowFactors] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGrowthRateColor = (rate: string) => {
    switch (rate.toLowerCase()) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'needs attention': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">AI Growth & Yield Estimation</h3>
          <p className="text-sm text-zinc-400">AI-powered predictions based on real-time growth metrics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
          <Brain className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">AI Generated</span>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300 font-medium">Crop</span>
          </div>
          <p className="text-2xl font-bold text-white">{crop}</p>
          <p className="text-sm text-zinc-400 mt-1">{data.current_growth_stage}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 font-medium">Expected Yield</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {data.expected_yield_per_acre.toLocaleString()}
            <span className="text-sm text-zinc-400 ml-1">kg/acre</span>
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-sm font-medium ${getConfidenceColor(data.yield_confidence)}`}>
              {data.yield_confidence}% confidence
            </span>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-300 font-medium">Harvest Period</span>
          </div>
          <p className="text-xl font-bold text-white">{data.harvesting_period}</p>
          <p className="text-sm text-zinc-400 mt-1">
            {data.growth_metrics.maturity_percentage}% mature
          </p>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-300 font-medium">Days Since Sowing</span>
          </div>
          <p className="text-xl font-bold text-white">{data.growth_metrics.days_since_sowing}</p>
          <p className="text-sm text-zinc-400">days</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300 font-medium">Growth Rate</span>
          </div>
          <p className={`text-xl font-bold ${getGrowthRateColor(data.growth_metrics.growth_rate)}`}>
            {data.growth_metrics.growth_rate}
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 font-medium">Maturity</span>
          </div>
          <p className="text-xl font-bold text-white">{data.growth_metrics.maturity_percentage}%</p>
          <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${data.growth_metrics.maturity_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Factors Affecting Yield */}
      <div className="bg-zinc-800 rounded-lg p-4 mb-4">
        <button
          onClick={() => setShowFactors(!showFactors)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-300 font-medium">Factors Affecting Yield</span>
          </div>
          {showFactors ? 
            <ChevronUp className="w-4 h-4 text-zinc-400" /> : 
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          }
        </button>
        
        {showFactors && (
          <div className="mt-4 space-y-2">
            {data.factors_affecting_yield.map((factor, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-zinc-300 text-sm">{factor}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optimization Suggestions */}
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
        <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Optimization Suggestions
        </h4>
        <div className="space-y-2">
          {data.optimization_suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span className="text-green-300 text-sm">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
        <button
          onClick={() => setShowAIAnalysis(!showAIAnalysis)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-green-400" />
            <span className="text-white font-medium">Detailed AI Analysis</span>
          </div>
          {showAIAnalysis ? 
            <ChevronUp className="w-4 h-4 text-zinc-400" /> : 
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          }
        </button>
        
        {showAIAnalysis && (
          <div className="mt-4">
            <div className="prose prose-sm prose-invert max-w-none">
              <div className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                {data.ai_analysis}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YieldEstimation;
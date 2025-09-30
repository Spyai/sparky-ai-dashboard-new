import React, { useState } from 'react';
import { Flower, Scissors, AlertCircle, Brain, ChevronDown, ChevronUp, Calendar, Target, Shield, Clock } from 'lucide-react';
import { WeedManagementData } from '../../lib/realtime-api';

interface WeedManagementProps {
  data: WeedManagementData;
}

const WeedManagement: React.FC<WeedManagementProps> = ({ data }) => {
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [selectedWeed, setSelectedWeed] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'low': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '🌱';
      default: return '📊';
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Flower className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">AI Weed Management</h3>
          <p className="text-sm text-zinc-400">AI-powered weed identification and control strategies</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-full">
          <Brain className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">AI Generated</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flower className="w-4 h-4 text-yellow-400" />
            <span className="text-zinc-300 font-medium">Detected Weeds</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.potential_weeds.length}</p>
          <p className="text-sm text-zinc-400">species identified</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-300 font-medium">High Priority</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {data.potential_weeds.filter(w => w.severity === 'High').length}
          </p>
          <p className="text-sm text-zinc-400">urgent treatment</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 font-medium">Treatments</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.application_schedule.length}</p>
          <p className="text-sm text-zinc-400">scheduled</p>
        </div>
      </div>

      {/* Weed List */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-medium text-white flex items-center gap-2">
          <Flower className="w-5 h-5 text-yellow-400" />
          Identified Weeds
        </h4>
        {data.potential_weeds.map((weed, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 transition-all cursor-pointer hover:bg-zinc-800/50 ${
              selectedWeed === `weed-${index}` ? 'bg-zinc-800' : 'bg-zinc-800/30'
            } ${getSeverityColor(weed.severity).split(' ')[2]}`}
            onClick={() => setSelectedWeed(selectedWeed === `weed-${index}` ? null : `weed-${index}`)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSeverityIcon(weed.severity)}</span>
                <span className="text-white font-medium">{weed.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(weed.severity)}`}>
                  {weed.severity}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Scissors className="w-4 h-4" />
              <span className="text-sm">{weed.solution}</span>
            </div>

            {selectedWeed === `weed-${index}` && (
              <div className="border-t border-zinc-700 pt-3 mt-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      Optimal Timing
                    </h5>
                    <p className="text-zinc-300 text-sm">{weed.timing}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      Cost Estimate
                    </h5>
                    <p className="text-green-400 text-sm font-medium">${weed.cost_estimate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prevention Strategies */}
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
        <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Prevention Strategies
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.prevention_strategies.map((strategy, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span className="text-green-300 text-sm">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Application Schedule */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
        <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Application Schedule
        </h4>
        <div className="space-y-2">
          {data.application_schedule.map((schedule, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300 text-sm">{schedule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-green-500/10 rounded-lg p-4 border border-yellow-500/20">
        <button
          onClick={() => setShowAIAnalysis(!showAIAnalysis)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">AI Weed Management Insights</span>
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
                {data.ai_recommendations}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeedManagement;
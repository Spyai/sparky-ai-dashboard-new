import React, { useState } from 'react';
import { Bug, AlertTriangle, Shield, Brain, ChevronDown, ChevronUp, Calendar, Zap } from 'lucide-react';
import { PestDiseaseData } from '../../lib/realtime-api';

interface PestDiseaseOverviewProps {
  data: PestDiseaseData;
}

const PestDiseaseOverview: React.FC<PestDiseaseOverviewProps> = ({ data }) => {
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

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
      case 'low': return '💡';
      default: return '📊';
    }
  };

  const allIssues = [...data.diseases, ...data.pests];

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">AI Pest & Disease Management</h3>
          <p className="text-sm text-zinc-400">AI-powered detection and treatment recommendations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
          <Brain className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-medium">AI Generated</span>
        </div>
      </div>

      {/* Health Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300 font-medium">Overall Health</span>
          </div>
          <p className="text-2xl font-bold text-white">Good</p>
          <p className="text-sm text-zinc-400">Current assessment</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-300 font-medium">Active Issues</span>
          </div>
          <p className="text-2xl font-bold text-white">{allIssues.length}</p>
          <p className="text-sm text-zinc-400">requiring attention</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 font-medium">Risk Assessment</span>
          </div>
          <p className="text-lg font-bold text-white">Updated</p>
          <p className="text-sm text-zinc-400">Weather-based</p>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Diseases Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h4 className="text-lg font-medium text-white">Detected Diseases</h4>
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
              {data.diseases.length} found
            </span>
          </div>
          <div className="space-y-3">
            {data.diseases.map((disease, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 transition-all cursor-pointer hover:bg-zinc-800/50 ${
                  selectedIssue === `disease-${index}` ? 'bg-zinc-800' : 'bg-zinc-800/30'
                } ${getSeverityColor(disease.severity).split(' ')[2]}`}
                onClick={() => setSelectedIssue(selectedIssue === `disease-${index}` ? null : `disease-${index}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getSeverityIcon(disease.severity)}</span>
                    <span className="text-white font-medium">{disease.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(disease.severity)}`}>
                    {disease.severity}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-3">{disease.treatment}</p>
                
                {selectedIssue === `disease-${index}` && (
                  <div className="border-t border-zinc-700 pt-3 mt-3 space-y-3">
                    <div>
                      <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Prevention
                      </h5>
                      <p className="text-zinc-300 text-sm">{disease.prevention}</p>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-3">
                      <p className="text-green-400 text-sm">
                        <strong>💰 Estimated Cost:</strong> ${disease.cost_estimate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pests Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bug className="w-5 h-5 text-red-400" />
            <h4 className="text-lg font-medium text-white">Detected Pests</h4>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              {data.pests.length} found
            </span>
          </div>
          <div className="space-y-3">
            {data.pests.map((pest, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 transition-all cursor-pointer hover:bg-zinc-800/50 ${
                  selectedIssue === `pest-${index}` ? 'bg-zinc-800' : 'bg-zinc-800/30'
                } ${getSeverityColor(pest.severity).split(' ')[2]}`}
                onClick={() => setSelectedIssue(selectedIssue === `pest-${index}` ? null : `pest-${index}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getSeverityIcon(pest.severity)}</span>
                    <span className="text-white font-medium">{pest.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(pest.severity)}`}>
                    {pest.severity}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-3">{pest.treatment}</p>
                
                {selectedIssue === `pest-${index}` && (
                  <div className="border-t border-zinc-700 pt-3 mt-3 space-y-3">                    
                    <div>
                      <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Prevention
                      </h5>
                      <p className="text-zinc-300 text-sm">{pest.prevention}</p>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-3">
                      <p className="text-green-400 text-sm">
                        <strong>💰 Estimated Cost:</strong> ${pest.cost_estimate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Risk Assessment */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
        <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Weather Risk Assessment
        </h4>
        <p className="text-blue-300 text-sm">{data.weather_risk_assessment}</p>
      </div>

      {/* Monitoring Schedule */}
      <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
        <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Monitoring Schedule
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.monitoring_schedule.map((task, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span className="text-green-300 text-sm">{task}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg p-4 border border-red-500/20">
        <button
          onClick={() => setShowAIAnalysis(!showAIAnalysis)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-red-400" />
            <span className="text-white font-medium">AI Recommendations</span>
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

export default PestDiseaseOverview;
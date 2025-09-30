import React from 'react';
import { useGeminiAPI, useManualAPICall } from '../../hooks/useGeminiAPI';
import { clearCache } from '../../lib/gemini';

export const APIUsageDashboard: React.FC = () => {
  const { 
    stats, 
    lastUpdate, 
    updateStats, 
    getStatusColor, 
    getStatusMessage,
    isLowQuota,
    isVeryLowQuota,
    isQuotaExhausted 
  } = useGeminiAPI();

  const {
    isManualMode,
    pendingCalls,
    enableManualMode,
    disableManualMode,
    clearPendingCalls
  } = useManualAPICall();

  const handleClearCache = () => {
    clearCache();
    updateStats();
  };

  const progressPercentage = (stats.dailyCalls / stats.maxCalls) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI API Usage</h3>
        <button
          onClick={updateStats}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Status Alert */}
      <div className={`p-3 rounded-lg mb-4 ${
        isQuotaExhausted ? 'bg-red-50 border border-red-200' :
        isVeryLowQuota ? 'bg-orange-50 border border-orange-200' :
        isLowQuota ? 'bg-yellow-50 border border-yellow-200' :
        'bg-green-50 border border-green-200'
      }`}>
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.dailyCalls}</div>
          <div className="text-sm text-gray-600">Calls Today</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${getStatusColor()}`}>{stats.remainingCalls}</div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.cacheSize}</div>
          <div className="text-sm text-gray-600">Cached Items</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.maxCalls}</div>
          <div className="text-sm text-gray-600">Daily Limit</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Daily Usage</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              progressPercentage > 80 ? 'bg-red-500' :
              progressPercentage > 60 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={handleClearCache}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Clear Cache
        </button>
        
        {!isManualMode ? (
          <button
            onClick={enableManualMode}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Enable Manual Mode
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={disableManualMode}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Disable Manual Mode
            </button>
            {pendingCalls.length > 0 && (
              <button
                onClick={clearPendingCalls}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Clear Pending ({pendingCalls.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Manual Mode Info */}
      {isManualMode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Manual Mode Active:</strong> AI calls will be queued instead of automatic execution.
            {pendingCalls.length > 0 && (
              <div className="mt-2">
                Pending calls: {pendingCalls.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-xs text-gray-500 mt-4">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

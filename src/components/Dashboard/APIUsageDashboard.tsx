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
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">AI API Usage</h3>
        <button
          onClick={updateStats}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Status Alert */}
      <div className={`p-3 rounded-lg mb-4 border ${
        isQuotaExhausted ? 'bg-red-900/20 border-red-800' :
        isVeryLowQuota   ? 'bg-orange-900/20 border-orange-800' :
        isLowQuota       ? 'bg-yellow-900/20 border-yellow-800' :
                           'bg-green-900/20 border-green-800'
      }`}>
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-zinc-800 rounded-lg">
          <div className="text-2xl font-bold text-white">{stats.dailyCalls}</div>
          <div className="text-sm text-zinc-400">Calls Today</div>
        </div>

        <div className="text-center p-3 bg-zinc-800 rounded-lg">
          <div className={`text-2xl font-bold ${getStatusColor()}`}>{stats.remainingCalls}</div>
          <div className="text-sm text-zinc-400">Remaining</div>
        </div>

        <div className="text-center p-3 bg-zinc-800 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{stats.cacheSize}</div>
          <div className="text-sm text-zinc-400">Cached Items</div>
        </div>

        <div className="text-center p-3 bg-zinc-800 rounded-lg">
          <div className="text-2xl font-bold text-white">{stats.maxCalls}</div>
          <div className="text-sm text-zinc-400">Daily Limit</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-zinc-400 mb-2">
          <span>Daily Usage</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2">
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
          className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
        >
          Clear Cache
        </button>

        {!isManualMode ? (
          <button
            onClick={enableManualMode}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Enable Manual Mode
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={disableManualMode}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Disable Manual Mode
            </button>
            {pendingCalls.length > 0 && (
              <button
                onClick={clearPendingCalls}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Pending ({pendingCalls.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Manual Mode Info */}
      {isManualMode && (
        <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <div className="text-sm text-blue-300">
            <strong className="text-blue-200">Manual Mode Active:</strong> AI calls will be queued instead of automatic execution.
            {pendingCalls.length > 0 && (
              <div className="mt-2 text-blue-400">
                Pending calls: {pendingCalls.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-xs text-zinc-500 mt-4">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

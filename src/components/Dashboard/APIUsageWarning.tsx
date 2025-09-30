import React from 'react';
import { AlertTriangle, Ban } from 'lucide-react';
import { useGeminiAPI } from '../../hooks/useGeminiAPI';

interface APIUsageWarningProps {
  className?: string;
}

export const APIUsageWarning: React.FC<APIUsageWarningProps> = ({ className = '' }) => {
  const { stats, isLowQuota, isVeryLowQuota, isQuotaExhausted } = useGeminiAPI();

  if (!isLowQuota && !isQuotaExhausted) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {isQuotaExhausted ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <Ban className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">
            Daily API limit reached - Using cached responses only
          </span>
        </div>
      ) : isVeryLowQuota ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-orange-800">
            Very low API quota: {stats.remainingCalls} calls remaining
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Low API quota: {stats.remainingCalls} calls remaining
          </span>
        </div>
      )}
    </div>
  );
};

// Compact version for headers/small spaces
export const CompactAPIWarning: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { stats, isLowQuota, isQuotaExhausted } = useGeminiAPI();

  if (!isLowQuota && !isQuotaExhausted) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {isQuotaExhausted ? (
        <Ban className="w-4 h-4 text-red-500" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
      )}
      <span className="text-xs text-gray-600">
        {isQuotaExhausted ? 'API Limit' : `${stats.remainingCalls} left`}
      </span>
    </div>
  );
};

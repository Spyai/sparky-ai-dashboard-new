import { useState, useEffect, useCallback } from 'react';
import { getAPIUsageStats, canMakeAPICall, getRemainingAPICalls } from '../lib/gemini';

interface APIUsageStats {
  cacheSize: number;
  dailyCalls: number;
  maxCalls: number;
  remainingCalls: number;
  canMakeCall: boolean;
}

export const useGeminiAPI = () => {
  const [stats, setStats] = useState<APIUsageStats>({
    cacheSize: 0,
    dailyCalls: 0,
    maxCalls: 50,
    remainingCalls: 50,
    canMakeCall: true
  });
  
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const updateStats = useCallback(() => {
    const apiStats = getAPIUsageStats();
    const remaining = getRemainingAPICalls();
    const canCall = canMakeAPICall();
    
    setStats({
      cacheSize: apiStats.cacheSize,
      dailyCalls: apiStats.dailyCalls,
      maxCalls: apiStats.maxCalls,
      remainingCalls: remaining,
      canMakeCall: canCall
    });
    
    setLastUpdate(new Date());
  }, []);

  // Update stats every 30 seconds
  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, [updateStats]);

  const getStatusColor = (): string => {
    const percentage = (stats.remainingCalls / stats.maxCalls) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusMessage = (): string => {
    if (!stats.canMakeCall) {
      return 'Daily limit reached - Using cached responses only';
    }
    if (stats.remainingCalls < 5) {
      return 'Low API quota - Consider reducing usage';
    }
    if (stats.remainingCalls < 15) {
      return 'Moderate API usage - Monitor consumption';
    }
    return 'API quota available';
  };

  return {
    stats,
    lastUpdate,
    updateStats,
    getStatusColor,
    getStatusMessage,
    isLowQuota: stats.remainingCalls < 10,
    isVeryLowQuota: stats.remainingCalls < 5,
    isQuotaExhausted: !stats.canMakeCall
  };
};

// Hook for manual API call control
export const useManualAPICall = () => {
  const [isManualMode, setIsManualMode] = useState(false);
  const [pendingCalls, setPendingCalls] = useState<string[]>([]);

  const enableManualMode = () => setIsManualMode(true);
  const disableManualMode = () => setIsManualMode(false);

  const addPendingCall = (callType: string) => {
    if (isManualMode && !pendingCalls.includes(callType)) {
      setPendingCalls(prev => [...prev, callType]);
    }
  };

  const removePendingCall = (callType: string) => {
    setPendingCalls(prev => prev.filter(call => call !== callType));
  };

  const clearPendingCalls = () => setPendingCalls([]);

  return {
    isManualMode,
    pendingCalls,
    enableManualMode,
    disableManualMode,
    addPendingCall,
    removePendingCall,
    clearPendingCalls,
    hasPendingCalls: pendingCalls.length > 0
  };
};

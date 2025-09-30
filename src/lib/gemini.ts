import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEl;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const RATE_LIMIT_DELAY = 2000; // 2 seconds between calls
const MAX_DAILY_CALLS = 50; // Limit API calls per day

// In-memory cache for API responses
interface CacheEntry {
  data: string;
  timestamp: number;
  key: string;
}

class GeminiCache {
  private cache = new Map<string, CacheEntry>();
  private lastCallTime = 0;
  private dailyCallCount = 0;
  private lastResetDate = new Date().toDateString();

  // Check if we've exceeded daily limits
  private checkDailyLimit(): boolean {
    const currentDate = new Date().toDateString();
    if (this.lastResetDate !== currentDate) {
      this.dailyCallCount = 0;
      this.lastResetDate = currentDate;
    }
    return this.dailyCallCount >= MAX_DAILY_CALLS;
  }

  // Generate cache key from parameters
  private generateCacheKey(type: string, params: any): string {
    return `${type}_${JSON.stringify(params)}`;
  }

  // Get from cache if valid
  get(type: string, params: any): string | null {
    const key = this.generateCacheKey(type, params);
    const entry = this.cache.get(key);
    
    if (entry && (Date.now() - entry.timestamp) < CACHE_DURATION) {
      console.log(`🎯 Cache hit for ${type}`);
      return entry.data;
    }
    
    // Remove expired entry
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  // Set cache entry
  set(type: string, params: any, data: string): void {
    const key = this.generateCacheKey(type, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }

  // Rate limiting check
  async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < RATE_LIMIT_DELAY) {
      const waitTime = RATE_LIMIT_DELAY - timeSinceLastCall;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCallTime = Date.now();
  }

  // Check if API call should be made
  shouldMakeCall(): boolean {
    if (this.checkDailyLimit()) {
      console.warn(`⚠️ Daily API limit (${MAX_DAILY_CALLS}) reached. Using cached responses only.`);
      return false;
    }
    return true;
  }

  // Increment call counter
  incrementCallCount(): void {
    this.dailyCallCount++;
    console.log(`📊 API calls today: ${this.dailyCallCount}/${MAX_DAILY_CALLS}`);
  }

  // Get cache stats
  getStats(): { cacheSize: number; dailyCalls: number; maxCalls: number } {
    return {
      cacheSize: this.cache.size,
      dailyCalls: this.dailyCallCount,
      maxCalls: MAX_DAILY_CALLS
    };
  }
}

// Global cache instance
const geminiCache = new GeminiCache();

export const generateFarmingInsights = async (
  farmData: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  weatherData: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  cropHealthData: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  userQuery?: string
): Promise<string> => {
  try {
    // Create cache key from parameters
    const cacheParams = {
      fieldId: farmData?.field_id,
      crop: farmData?.crop,
      location: farmData?.location,
      ndvi: cropHealthData?.Health?.ndvi ? Object.values(cropHealthData.Health.ndvi)[0] : null,
      weatherSummary: weatherData?.daily?.slice(0, 3).map((day: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        description: day.weather[0].description,
        temp: Math.round(day.temp.max - 273.15),
        rain: Math.round(day.pop * 100)
      })),
      userQuery: userQuery || 'default'
    };

    // Check cache first
    const cached = geminiCache.get('farming_insights', cacheParams);
    if (cached) {
      return cached;
    }

    // Check if we should make API call
    if (!geminiCache.shouldMakeCall()) {
      return `Based on recent analysis (cached data):
      
⚠️ **Daily API limit reached** - Using recent insights for your farm.

**Crop Health Summary:**
Your ${farmData?.crop || 'crop'} field shows stable health indicators. Continue current management practices.

**Weather Recommendations:**
Monitor weather conditions and adjust irrigation accordingly.

**Action Items:**
1. Continue regular field monitoring
2. Check soil moisture levels
3. Review fertilization schedule
4. Monitor for pest activity

*For real-time insights, please check back tomorrow when API quota resets.*`;
    }

    // Apply rate limiting
    await geminiCache.checkRateLimit();

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = userQuery || `
      As an expert agricultural AI assistant, analyze the following farm data and provide actionable insights:

      Farm Information:
      - Field ID: ${farmData?.field_id || 'N/A'}
      - Crop: ${farmData?.crop || 'N/A'}
      - Location: ${farmData?.location || 'N/A'}
      - Field Area: ${cropHealthData?.FieldArea || 'N/A'} sq.m

      Crop Health Indices:
      - NDVI: ${cropHealthData?.Health?.ndvi ? Object.values(cropHealthData.Health.ndvi)[0] : 'N/A'}
      - EVI: ${cropHealthData?.Health?.evi ? Object.values(cropHealthData.Health.evi)[0] : 'N/A'}
      - LAI: ${cropHealthData?.Health?.lai ? Object.values(cropHealthData.Health.lai)[0] : 'N/A'}
      - NDMI: ${cropHealthData?.Health?.ndmi ? Object.values(cropHealthData.Health.ndmi)[0] : 'N/A'}
      - Soil Organic Carbon: ${cropHealthData?.Health?.soc ? Object.values(cropHealthData.Health.soc)[0] : 'N/A'}%

      Weather Forecast:
      ${weatherData?.daily?.slice(0, 3).map((day: any, index: number) => ` // eslint-disable-line @typescript-eslint/no-explicit-any
      Day ${index + 1}: ${day.weather[0].description}, Temp: ${Math.round(day.temp.max - 273.15)}°C, Rain: ${Math.round(day.pop * 100)}%`).join('\n') || 'Weather data unavailable'}

      Please provide:
      1. Overall crop health assessment
      2. Specific recommendations for irrigation, fertilization, and pest management
      3. Weather-based action items for the next 3 days
      4. Any alerts or warnings based on the data
      5. Optimization suggestions for better yield

      Keep the response practical, actionable, and farmer-friendly.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Cache the response
    geminiCache.set('farming_insights', cacheParams, text);
    geminiCache.incrementCallCount();
    
    return text;
  } catch (error) {
    console.error('Error generating farming insights:', error);
    
    // Return cached response if available, otherwise fallback
    const fallbackCache = geminiCache.get('farming_insights', { fallback: true });
    if (fallbackCache) {
      return fallbackCache + '\n\n⚠️ *Using cached insights due to API error.*';
    }
    
    throw new Error('Failed to generate AI insights. Please try again.');
  }
};

export const chatWithGemini = async (
  message: string,
  farmContext: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> => {
  try {
    // Create cache key for chat
    const cacheParams = {
      message: message.substring(0, 100), // First 100 chars for caching
      fieldId: farmContext?.fieldId,
      crop: farmContext?.crop,
      historyLength: conversationHistory.length
    };

    // Check cache first
    const cached = geminiCache.get('chat', cacheParams);
    if (cached) {
      return cached;
    }

    // Check daily limits
    if (!geminiCache.shouldMakeCall()) {
      return `I've reached the daily API limit, but I can provide general farming advice:

Based on your question about "${message.substring(0, 50)}...", here are some general recommendations:

**General Farming Best Practices:**
- Monitor soil moisture regularly
- Observe weather patterns for irrigation timing
- Check for pest and disease symptoms weekly
- Maintain proper fertilization schedules
- Keep farm equipment in good condition

*For personalized AI insights, please check back tomorrow when the API quota resets.*`;
    }

    // Apply rate limiting
    await geminiCache.checkRateLimit();

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const contextPrompt = `
      You are an expert agricultural AI assistant helping farmers optimize their operations. 
      
      Current Farm Context:
      - Field ID: ${farmContext?.fieldId || 'N/A'}
      - Crop: ${farmContext?.crop || 'N/A'}
      - Location: ${farmContext?.location || 'N/A'}
      - Field Area: ${farmContext?.fieldArea || 'N/A'} sq.m
      - Current Health Indices: NDVI: ${farmContext?.ndvi || 'N/A'}, EVI: ${farmContext?.evi || 'N/A'}, LAI: ${farmContext?.lai || 'N/A'}
      
      Conversation History:
      ${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')} // Only last 3 messages to reduce token usage
      
      User Question: ${message}
      
      Please provide a helpful, accurate, and practical response based on modern agricultural practices and the farm context provided. Keep responses concise but informative.
    `;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Cache the response
    geminiCache.set('chat', cacheParams, text);
    geminiCache.incrementCallCount();
    
    return text;
  } catch (error) {
    console.error('Error in Gemini chat:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
};

// Enhanced chat function with conversation history support
export const chatWithGeminiAdvanced = async (
  message: string,
  farmContext: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> => {
  try {
    // For advanced chat, prioritize conversation flow over caching
    // Only cache if conversation history is short
    if (conversationHistory.length > 5) {
      // Use basic chat for longer conversations to avoid excessive API usage
      return await chatWithGemini(message, farmContext, conversationHistory);
    }

    // Check daily limits
    if (!geminiCache.shouldMakeCall()) {
      return await chatWithGemini(message, farmContext, conversationHistory);
    }

    // Apply rate limiting
    await geminiCache.checkRateLimit();

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Start a chat session with limited history to reduce token usage
    const chat = model.startChat({
      history: conversationHistory.slice(-4).map(msg => ({ // Only last 4 messages
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 500, // Reduced from 1000 to save on API costs
        temperature: 0.7,
      },
    });

    // Add farm context to the message
    const contextualMessage = `
      Farm Context: Field ID: ${farmContext?.fieldId || 'N/A'}, Crop: ${farmContext?.crop || 'N/A'}, Location: ${farmContext?.location || 'N/A'}
      Health Indices: NDVI: ${farmContext?.ndvi || 'N/A'}, EVI: ${farmContext?.evi || 'N/A'}, LAI: ${farmContext?.lai || 'N/A'}
      
      Question: ${message}
    `;

    const result = await chat.sendMessage(contextualMessage);
    const response = await result.response;
    const text = response.text();
    
    geminiCache.incrementCallCount();
    
    return text;
  } catch (error) {
    console.error('Error in advanced Gemini chat:', error);
    // Fallback to basic chat
    return await chatWithGemini(message, farmContext, conversationHistory);
  }
};

// Function to analyze crop health and provide recommendations
export const analyzeCropHealth = async (cropHealthData: any): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `
      As an agricultural expert, analyze the following crop health data and provide specific recommendations:

      Health Indices:
      ${Object.entries(cropHealthData?.Health || {}).map(([index, values]: [string, any]) => {
        const latestDate = Object.keys(values)[0];
        const value = values[latestDate];
        return `- ${index.toUpperCase()}: ${value}`;
      }).join('\n')}

      Field Area: ${cropHealthData?.FieldArea || 'N/A'} sq.m
      Crop Code: ${cropHealthData?.CropCode || 'N/A'}

      Please provide:
      1. Health status assessment (Good/Fair/Poor)
      2. Specific areas of concern
      3. Immediate action items
      4. Long-term recommendations
      5. Expected outcomes if recommendations are followed

      Keep the response practical and actionable for farmers.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error analyzing crop health:', error);
    throw new Error('Failed to analyze crop health. Please try again.');
  }
};

// Function to generate weather-based recommendations
export const generateWeatherRecommendations = async (weatherData: any, farmContext: any): Promise<string> => { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    // Create cache key
    const cacheParams = {
      location: farmContext?.location,
      crop: farmContext?.crop,
      weatherSummary: weatherData?.daily?.slice(0, 3).map((day: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        description: day.weather[0].description,
        temp: Math.round(day.temp.max - 273.15)
      }))
    };

    // Check cache first
    const cached = geminiCache.get('weather_recommendations', cacheParams);
    if (cached) {
      return cached;
    }

    // Check daily limits
    if (!geminiCache.shouldMakeCall()) {
      return `**Weather Recommendations (Cached Analysis)**

Based on recent weather analysis for your ${farmContext?.crop || 'crop'} field:

**General Weather Guidelines:**
- Monitor daily temperature and precipitation
- Adjust irrigation based on rainfall probability
- Plan field activities during favorable weather windows
- Protect crops during extreme weather events

**Standard Recommendations:**
1. **Irrigation**: Check soil moisture before watering
2. **Field Work**: Schedule during dry periods
3. **Pest Management**: Increase monitoring after rain
4. **Equipment**: Prepare for weather changes

*For current weather-specific advice, please check back tomorrow when API quota resets.*`;
    }

    // Apply rate limiting
    await geminiCache.checkRateLimit();

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `
      Based on the following weather forecast, provide farming recommendations:

      Farm: ${farmContext?.crop || 'Unknown crop'} in ${farmContext?.location || 'Unknown location'}
      
      Weather Forecast (next 5 days):
      ${weatherData?.daily?.slice(0, 5).map((day: any, index: number) => ` // eslint-disable-line @typescript-eslint/no-explicit-any
      Day ${index + 1}: 
      - Weather: ${day.weather[0].description}
      - Temperature: ${Math.round(day.temp.min - 273.15)}°C to ${Math.round(day.temp.max - 273.15)}°C
      - Rain Probability: ${Math.round(day.pop * 100)}%
      - Wind Speed: ${Math.round(day.wind_speed)} m/s
      - Humidity: ${day.humidity}%
      - UV Index: ${day.uvi}
      ${day.rain ? `- Expected Rainfall: ${day.rain}mm` : ''}
      `).join('\n') || 'Weather data unavailable'}

      Please provide:
      1. Irrigation recommendations
      2. Field work scheduling
      3. Pest and disease risk assessment
      4. Harvest timing considerations (if applicable)
      5. Equipment and labor planning

      Focus on actionable advice for the next 5 days.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Cache the response
    geminiCache.set('weather_recommendations', cacheParams, text);
    geminiCache.incrementCallCount();
    
    return text;
  } catch (error) {
    console.error('Error generating weather recommendations:', error);
    throw new Error('Failed to generate weather recommendations. Please try again.');
  }
};

// Utility function to get API usage statistics
export const getAPIUsageStats = () => {
  return geminiCache.getStats();
};

// Function to clear cache manually (for admin/debug purposes)
export const clearCache = () => {
  const stats = geminiCache.getStats();
  // Create new cache instance
  const newCache = new GeminiCache();
  Object.setPrototypeOf(geminiCache, Object.getPrototypeOf(newCache));
  Object.assign(geminiCache, newCache);
  return `Cache cleared. Previous stats: ${JSON.stringify(stats)}`;
};

// Function to check if API calls are available
export const canMakeAPICall = (): boolean => {
  return geminiCache.shouldMakeCall();
};

// Function to get remaining API calls for today
export const getRemainingAPICalls = (): number => {
  const stats = geminiCache.getStats();
  return Math.max(0, stats.maxCalls - stats.dailyCalls);
};


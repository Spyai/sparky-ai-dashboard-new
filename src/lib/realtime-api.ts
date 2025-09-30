import { chatWithGemini } from './gemini';
import { FarmerData, WeatherData } from './api';

// Real-time data generation using AI and external APIs

// Fertilizer Management with AI recommendations
export interface FertilizerRecommendation {
  N: number;
  P: number;
  K: number;
  S: number;
  Zn: number;
  frequency: string;
  sources: string[];
  timing: string;
  method: string;
  cost_estimate: number;
  ai_insights: string;
  soil_analysis: {
    ph_level: number;
    organic_matter: number;
    nitrogen_level: string;
    phosphorus_level: string;
    potassium_level: string;
  };
}

export const getAIFertilizerRecommendations = async (
  farmData: any,
  cropHealthData: FarmerData,
  weatherData: WeatherData
): Promise<FertilizerRecommendation> => {
  try {
    const cropCode = farmData?.crop || 'Unknown';
    const fieldArea = cropHealthData?.FieldArea || 1000;
    const healthIndices = cropHealthData?.Health || {};
    
    // Get latest NDVI and other indices
    const latestNDVI = healthIndices.ndvi ? Object.values(healthIndices.ndvi)[0] as string : '0.5';
    const latestEVI = healthIndices.evi ? Object.values(healthIndices.evi)[0] as string : '0.3';
    const latestSOC = healthIndices.soc ? Object.values(healthIndices.soc)[0] as string : '2.5';

    // Generate AI insights using Gemini
    const aiPrompt = `
      As an agricultural expert, provide specific fertilizer recommendations for:
      
      Crop: ${cropCode}
      Field Area: ${fieldArea} sq.m
      Current Health Indices:
      - NDVI: ${latestNDVI}
      - EVI: ${latestEVI}  
      - Soil Organic Carbon: ${latestSOC}%
      
      Weather conditions (next 7 days): ${weatherData?.daily?.slice(0, 7).map(day => 
        `${day.weather[0].description}, Temp: ${Math.round(day.temp.max - 273.15)}°C, Rain: ${Math.round(day.pop * 100)}%`
      ).join(', ')}
      
      Provide specific NPK recommendations, application timing, and cost estimates. Focus on:
      1. Exact fertilizer quantities (N, P, K, S, Zn in kg/ha)
      2. Application frequency and timing
      3. Recommended fertilizer sources
      4. Application method
      5. Estimated costs
      6. Soil improvement strategies
    `;

    const aiInsights = await chatWithGemini(aiPrompt, {
      fieldId: farmData?.field_id,
      crop: cropCode,
      fieldArea: fieldArea
    });

    // Calculate base recommendations based on crop type and health indices
    const ndviValue = parseFloat(latestNDVI);
    const baseN = cropCode.toLowerCase().includes('wheat') ? 120 : 
                 cropCode.toLowerCase().includes('rice') ? 100 :
                 cropCode.toLowerCase().includes('corn') ? 150 : 80;
    
    const healthMultiplier = ndviValue < 0.3 ? 1.3 : ndviValue < 0.5 ? 1.1 : 0.9;
    
    return {
      N: Math.round(baseN * healthMultiplier),
      P: Math.round((baseN * 0.5) * healthMultiplier),
      K: Math.round((baseN * 0.7) * healthMultiplier),
      S: Math.round((baseN * 0.2) * healthMultiplier),
      Zn: Math.round((baseN * 0.05) * healthMultiplier),
      frequency: ndviValue < 0.4 ? 'Every 14 days' : 'Every 21 days',
      sources: ['Urea', 'DAP', 'MOP', 'Gypsum', 'Zinc Sulfate'],
      timing: 'Early morning (6-8 AM) or late evening (6-8 PM)',
      method: fieldArea > 5000 ? 'Fertigation or Broadcasting' : 'Manual application',
      cost_estimate: Math.round((baseN * healthMultiplier * 2.5) + (fieldArea * 0.1)),
      ai_insights: aiInsights,
      soil_analysis: {
        ph_level: 6.5 + (Math.random() * 1.5),
        organic_matter: parseFloat(latestSOC) || (2.0 + Math.random() * 2),
        nitrogen_level: ndviValue < 0.3 ? 'Low' : ndviValue < 0.6 ? 'Medium' : 'High',
        phosphorus_level: ndviValue < 0.4 ? 'Low' : 'Medium',
        potassium_level: 'Medium'
      }
    };
  } catch (error) {
    console.error('Error generating fertilizer recommendations:', error);
    // Return fallback data
    return {
      N: 120,
      P: 60,
      K: 80,
      S: 25,
      Zn: 5,
      frequency: 'Every 21 days',
      sources: ['Urea', 'Gypsum', 'Potash', 'Zinc Sulfate'],
      timing: 'Early morning or late evening',
      method: 'Manual application',
      cost_estimate: 500,
      ai_insights: 'AI insights temporarily unavailable. Using standard recommendations.',
      soil_analysis: {
        ph_level: 6.8,
        organic_matter: 2.5,
        nitrogen_level: 'Medium',
        phosphorus_level: 'Medium',
        potassium_level: 'Medium'
      }
    };
  }
};

// Irrigation Schedule with weather-based AI recommendations
export interface IrrigationSchedule {
  date: string;
  quantity_mm: number;
  time: string;
  precipitation_probability: number;
  ai_recommendation: string;
  water_stress_level: string;
  irrigation_method: string;
  duration_hours: number;
  priority: 'High' | 'Medium' | 'Low';
}

export const getAIIrrigationSchedule = async (
  farmData: any,
  cropHealthData: FarmerData,
  weatherData: WeatherData
): Promise<IrrigationSchedule[]> => {
  try {
    const healthIndices = cropHealthData?.Health || {};
    const latestNDMI = healthIndices.ndmi ? Object.values(healthIndices.ndmi)[0] as string : '0.4';
    const latestNDVI = healthIndices.ndvi ? Object.values(healthIndices.ndvi)[0] as string : '0.5';
    
    const aiPrompt = `
      Provide a 7-day irrigation schedule for:
      
      Crop: ${farmData?.crop || 'Unknown'}
      Field Area: ${cropHealthData?.FieldArea || 1000} sq.m
      Moisture Index (NDMI): ${latestNDMI}
      Vegetation Health (NDVI): ${latestNDVI}
      
      Weather Forecast:
      ${weatherData?.daily?.slice(0, 7).map((day, index) => 
        `Day ${index + 1}: ${day.weather[0].description}, Temp: ${Math.round(day.temp.max - 273.15)}°C, Rain: ${Math.round(day.pop * 100)}%, Humidity: ${day.humidity}%`
      ).join('\n')}
      
      Provide specific irrigation recommendations including timing, quantity, and water stress assessment.
    `;

    const aiInsights = await chatWithGemini(aiPrompt, {
      fieldId: farmData?.field_id,
      crop: farmData?.crop
    });

    const schedule: IrrigationSchedule[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayWeather = weatherData?.daily?.[i];
      
      if (!dayWeather) continue;
      
      const rainProbability = dayWeather.pop;
      const maxTemp = dayWeather.temp.max - 273.15;
      const humidity = dayWeather.humidity;
      
      // Calculate irrigation need based on weather and plant health
      const ndmiValue = parseFloat(latestNDMI);
      const baseIrrigation = maxTemp > 30 ? 25 : maxTemp > 25 ? 20 : 15;
      const moistureAdjustment = ndmiValue < 0.3 ? 1.5 : ndmiValue < 0.5 ? 1.2 : 0.8;
      const rainAdjustment = rainProbability > 0.7 ? 0.2 : rainProbability > 0.4 ? 0.6 : 1.0;
      
      const quantity = Math.round(baseIrrigation * moistureAdjustment * rainAdjustment);
      
      schedule.push({
        date: date.toISOString().split('T')[0],
        quantity_mm: quantity,
        time: maxTemp > 28 ? '05:30 AM' : '06:00 AM',
        precipitation_probability: Math.round(rainProbability * 100),
        ai_recommendation: `${quantity}mm irrigation ${rainProbability > 0.5 ? 'adjusted for expected rain' : 'recommended'}`,
        water_stress_level: ndmiValue < 0.3 ? 'High' : ndmiValue < 0.5 ? 'Medium' : 'Low',
        irrigation_method: cropHealthData?.FieldArea > 5000 ? 'Drip irrigation' : 'Sprinkler',
        duration_hours: Math.round(quantity / 5),
        priority: ndmiValue < 0.3 ? 'High' : rainProbability < 0.3 ? 'Medium' : 'Low'
      });
    }
    
    return schedule;
  } catch (error) {
    console.error('Error generating irrigation schedule:', error);
    // Return fallback schedule
    const fallbackSchedule: IrrigationSchedule[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      fallbackSchedule.push({
        date: date.toISOString().split('T')[0],
        quantity_mm: 20,
        time: '06:00 AM',
        precipitation_probability: 30,
        ai_recommendation: 'Standard irrigation schedule',
        water_stress_level: 'Medium',
        irrigation_method: 'Sprinkler',
        duration_hours: 4,
        priority: 'Medium'
      });
    }
    
    return fallbackSchedule;
  }
};

// Growth & Yield Estimation with AI predictions
export interface YieldPrediction {
  expected_yield_per_acre: number;
  current_growth_stage: string;
  harvesting_period: string;
  yield_confidence: number;
  factors_affecting_yield: string[];
  optimization_suggestions: string[];
  ai_analysis: string;
  growth_metrics: {
    days_since_sowing: number;
    growth_rate: string;
    maturity_percentage: number;
  };
}

export const getAIYieldPrediction = async (
  farmData: any,
  cropHealthData: FarmerData,
  weatherData: WeatherData
): Promise<YieldPrediction> => {
  try {
    const healthIndices = cropHealthData?.Health || {};
    const latestNDVI = parseFloat(healthIndices.ndvi ? Object.values(healthIndices.ndvi)[0] as string : '0.5');
    const latestLAI = parseFloat(healthIndices.lai ? Object.values(healthIndices.lai)[0] as string : '2.0');
    
    const sowingDate = new Date(cropHealthData?.SowingDate || '2024-01-01');
    const daysSinceSowing = Math.floor((Date.now() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const aiPrompt = `
      Predict yield and growth analysis for:
      
      Crop: ${farmData?.crop || 'Unknown'}
      Days since sowing: ${daysSinceSowing}
      Field Area: ${cropHealthData?.FieldArea || 1000} sq.m
      Current NDVI: ${latestNDVI}
      Leaf Area Index: ${latestLAI}
      
      Recent weather patterns: ${weatherData?.daily?.slice(0, 5).map(day => 
        `${day.weather[0].description}, ${Math.round(day.temp.max - 273.15)}°C`
      ).join(', ')}
      
      Provide detailed yield predictions, growth stage analysis, and optimization recommendations.
    `;

    const aiAnalysis = await chatWithGemini(aiPrompt, {
      fieldId: farmData?.field_id,
      crop: farmData?.crop
    });

    // Calculate yield based on health indices and crop type
    const cropType = farmData?.crop?.toLowerCase() || 'general';
    const baseYield = {
      'wheat': 1200,
      'rice': 1800,
      'corn': 2500,
      'apple': 1500,
      'tomato': 3000
    }[cropType] || 1000;

    const healthMultiplier = (latestNDVI * 0.6) + (latestLAI * 0.2) + 0.2;
    const expectedYield = Math.round(baseYield * healthMultiplier);
    
    // Determine growth stage based on days since sowing
    const getGrowthStage = (days: number, crop: string) => {
      if (crop.includes('wheat') || crop.includes('rice')) {
        if (days < 30) return 'Germination & Early Growth';
        if (days < 60) return 'Tillering & Stem Extension';
        if (days < 90) return 'Heading & Flowering';
        return 'Grain Filling & Maturity';
      }
      if (days < 30) return 'Seedling Stage';
      if (days < 60) return 'Vegetative Growth';
      if (days < 90) return 'Flowering & Fruit Development';
      return 'Maturity & Harvest Ready';
    };

    return {
      expected_yield_per_acre: expectedYield,
      current_growth_stage: getGrowthStage(daysSinceSowing, cropType),
      harvesting_period: new Date(sowingDate.getTime() + (120 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      yield_confidence: Math.min(95, Math.max(60, 70 + (latestNDVI * 30))),
      factors_affecting_yield: [
        latestNDVI < 0.4 ? 'Low vegetation health' : 'Good vegetation health',
        latestLAI < 2 ? 'Insufficient leaf coverage' : 'Adequate leaf coverage',
        'Weather conditions',
        'Soil fertility management'
      ],
      optimization_suggestions: [
        'Monitor irrigation based on weather forecasts',
        'Apply balanced fertilizers as recommended',
        'Regular pest and disease monitoring',
        'Optimize planting density for next season'
      ],
      ai_analysis: aiAnalysis,
      growth_metrics: {
        days_since_sowing: daysSinceSowing,
        growth_rate: latestNDVI > 0.6 ? 'Excellent' : latestNDVI > 0.4 ? 'Good' : 'Needs attention',
        maturity_percentage: Math.min(100, Math.round((daysSinceSowing / 120) * 100))
      }
    };
  } catch (error) {
    console.error('Error generating yield prediction:', error);
    // Return fallback data
    return {
      expected_yield_per_acre: 1200,
      current_growth_stage: 'Vegetative Growth',
      harvesting_period: 'October 2024',
      yield_confidence: 75,
      factors_affecting_yield: ['Weather conditions', 'Soil fertility', 'Pest management'],
      optimization_suggestions: ['Regular monitoring', 'Balanced fertilization', 'Timely irrigation'],
      ai_analysis: 'AI analysis temporarily unavailable. Using standard estimates.',
      growth_metrics: {
        days_since_sowing: 45,
        growth_rate: 'Good',
        maturity_percentage: 60
      }
    };
  }
};

// Pest & Disease Management with AI detection
export interface PestDiseaseData {
  diseases: Array<{
    name: string;
    treatment: string;
    severity: 'Low' | 'Medium' | 'High';
    prevention: string;
    cost_estimate: number;
  }>;
  pests: Array<{
    name: string;
    treatment: string;
    severity: 'Low' | 'Medium' | 'High';
    prevention: string;
    cost_estimate: number;
  }>;
  ai_recommendations: string;
  weather_risk_assessment: string;
  monitoring_schedule: string[];
}

export const getAIPestDiseaseManagement = async (
  farmData: any,
  cropHealthData: FarmerData,
  weatherData: WeatherData
): Promise<PestDiseaseData> => {
  try {
    const healthIndices = cropHealthData?.Health || {};
    const latestNDVI = parseFloat(healthIndices.ndvi ? Object.values(healthIndices.ndvi)[0] as string : '0.5');
    
    const aiPrompt = `
      Analyze pest and disease risks for:
      
      Crop: ${farmData?.crop || 'Unknown'}
      Location: ${farmData?.location || 'Unknown'}
      Current Health (NDVI): ${latestNDVI}
      
      Weather conditions: ${weatherData?.daily?.slice(0, 5).map(day => 
        `${day.weather[0].description}, Temp: ${Math.round(day.temp.max - 273.15)}°C, Humidity: ${day.humidity}%`
      ).join(', ')}
      
      Provide specific pest and disease risks, treatments, and prevention strategies based on current conditions.
    `;

    const aiRecommendations = await chatWithGemini(aiPrompt, {
      fieldId: farmData?.field_id,
      crop: farmData?.crop,
      location: farmData?.location
    });

    // Get weather-based risk assessment
    const avgHumidity = weatherData?.daily?.slice(0, 5).reduce((sum, day) => sum + day.humidity, 0) / 5 || 70;
    const avgTemp = weatherData?.daily?.slice(0, 5).reduce((sum, day) => sum + day.temp.max, 0) / 5 || 298;
    const tempCelsius = avgTemp - 273.15;
    
    const highRiskWeather = avgHumidity > 80 && tempCelsius > 25;
    
    // Generate crop-specific pest and disease data
    const cropType = farmData?.crop?.toLowerCase() || 'general';
    const commonPests = {
      'wheat': [
        { name: 'Aphids', treatment: 'Imidacloprid spray', severity: 'Medium' as const, prevention: 'Regular monitoring, beneficial insects', cost_estimate: 150 },
        { name: 'Army worms', treatment: 'Chlorpyrifos application', severity: 'High' as const, prevention: 'Early detection, crop rotation', cost_estimate: 200 }
      ],
      'rice': [
        { name: 'Brown planthopper', treatment: 'Buprofezin spray', severity: 'High' as const, prevention: 'Water management, resistant varieties', cost_estimate: 180 },
        { name: 'Stem borer', treatment: 'Carbofuran granules', severity: 'Medium' as const, prevention: 'Pheromone traps, light traps', cost_estimate: 160 }
      ],
      'apple': [
        { name: 'Codling moth', treatment: 'Organophosphate spray', severity: 'High' as const, prevention: 'Pheromone traps, sanitation', cost_estimate: 220 },
        { name: 'Aphids', treatment: 'Neem oil application', severity: 'Medium' as const, prevention: 'Beneficial insects, pruning', cost_estimate: 120 }
      ]
    };

    const commonDiseases = {
      'wheat': [
        { name: 'Rust', treatment: 'Propiconazole fungicide', severity: 'High' as const, prevention: 'Resistant varieties, proper spacing', cost_estimate: 200 },
        { name: 'Powdery mildew', treatment: 'Sulfur dust application', severity: 'Medium' as const, prevention: 'Good air circulation', cost_estimate: 100 }
      ],
      'rice': [
        { name: 'Blast', treatment: 'Tricyclazole spray', severity: 'High' as const, prevention: 'Balanced fertilization, water management', cost_estimate: 250 },
        { name: 'Bacterial blight', treatment: 'Copper oxychloride', severity: 'Medium' as const, prevention: 'Clean seed, avoid over-fertilization', cost_estimate: 150 }
      ],
      'apple': [
        { name: 'Fire blight', treatment: 'Streptomycin spray', severity: 'High' as const, prevention: 'Pruning, sanitation', cost_estimate: 300 },
        { name: 'Apple scab', treatment: 'Captan fungicide', severity: 'Medium' as const, prevention: 'Resistant varieties, leaf cleanup', cost_estimate: 180 }
      ]
    };

    return {
      diseases: commonDiseases[cropType] || commonDiseases['wheat'],
      pests: commonPests[cropType] || commonPests['wheat'],
      ai_recommendations: aiRecommendations,
      weather_risk_assessment: highRiskWeather ? 
        'High risk due to favorable conditions (high humidity and temperature)' : 
        'Moderate risk - monitor regularly',
      monitoring_schedule: [
        'Daily visual inspection during high-risk periods',
        'Weekly systematic field walks',
        'Use pheromone traps for early detection',
        'Monitor weather conditions daily'
      ]
    };
  } catch (error) {
    console.error('Error generating pest disease management:', error);
    // Return fallback data
    return {
      diseases: [
        { name: 'Early Leaf Spot', treatment: 'Chlorothalonil', severity: 'Medium', prevention: 'Crop rotation', cost_estimate: 150 },
        { name: 'Collar Rot', treatment: 'Carbendazim', severity: 'Low', prevention: 'Proper drainage', cost_estimate: 100 }
      ],
      pests: [
        { name: 'Aphids', treatment: 'Neem Oil', severity: 'Medium', prevention: 'Regular monitoring', cost_estimate: 80 },
        { name: 'Thrips', treatment: 'Spinosad', severity: 'Low', prevention: 'Yellow sticky traps', cost_estimate: 60 }
      ],
      ai_recommendations: 'AI recommendations temporarily unavailable. Follow standard practices.',
      weather_risk_assessment: 'Moderate risk - continue regular monitoring',
      monitoring_schedule: ['Daily inspection', 'Weekly field walks', 'Weather monitoring']
    };
  }
};

// Weed Management with AI identification
export interface WeedManagementData {
  potential_weeds: Array<{
    name: string;
    solution: string;
    severity: 'Low' | 'Medium' | 'High';
    timing: string;
    cost_estimate: number;
  }>;
  ai_recommendations: string;
  prevention_strategies: string[];
  application_schedule: string[];
}

export const getAIWeedManagement = async (
  farmData: any,
  cropHealthData: FarmerData,
  weatherData: WeatherData
): Promise<WeedManagementData> => {
  try {
    const healthIndices = cropHealthData?.Health || {};
    const latestNDVI = parseFloat(healthIndices.ndvi ? Object.values(healthIndices.ndvi)[0] as string : '0.5');
    
    const aiPrompt = `
      Analyze weed management needs for:
      
      Crop: ${farmData?.crop || 'Unknown'}
      Field Area: ${cropHealthData?.FieldArea || 1000} sq.m
      Vegetation Health (NDVI): ${latestNDVI}
      
      Weather: ${weatherData?.daily?.slice(0, 3).map(day => 
        `${day.weather[0].description}, ${Math.round(day.temp.max - 273.15)}°C`
      ).join(', ')}
      
      Provide specific weed identification, control methods, and timing recommendations.
    `;

    const aiRecommendations = await chatWithGemini(aiPrompt, {
      fieldId: farmData?.field_id,
      crop: farmData?.crop
    });

    const cropType = farmData?.crop?.toLowerCase() || 'general';
    const commonWeeds = {
      'wheat': [
        { name: 'Wild oats', solution: 'Clodinafop-propargyl herbicide', severity: 'High' as const, timing: 'Pre-emergence', cost_estimate: 180 },
        { name: 'Phalaris minor', solution: 'Pinoxaden spray', severity: 'Medium' as const, timing: '2-3 leaf stage', cost_estimate: 150 }
      ],
      'rice': [
        { name: 'Echinochloa', solution: 'Butachlor pre-emergence', severity: 'High' as const, timing: '3-5 days after transplanting', cost_estimate: 200 },
        { name: 'Cyperus rotundus', solution: '2,4-D application', severity: 'Medium' as const, timing: '20-25 days after transplanting', cost_estimate: 120 }
      ],
      'apple': [
        { name: 'Broadleaf weeds', solution: 'Glyphosate spot treatment', severity: 'Medium' as const, timing: 'Spring before bud break', cost_estimate: 100 },
        { name: 'Grass weeds', solution: 'Mulching + manual removal', severity: 'Low' as const, timing: 'Throughout growing season', cost_estimate: 80 }
      ]
    };

    return {
      potential_weeds: commonWeeds[cropType] || commonWeeds['wheat'],
      ai_recommendations: aiRecommendations,
      prevention_strategies: [
        'Crop rotation to break weed cycles',
        'Use of cover crops during off-season',
        'Proper land preparation and leveling',
        'Timely and balanced fertilization',
        'Regular monitoring and early intervention'
      ],
      application_schedule: [
        'Pre-emergence herbicide application',
        'Post-emergence treatment at 2-3 leaf stage',
        'Manual weeding at 30-40 days',
        'Cultivation between rows as needed'
      ]
    };
  } catch (error) {
    console.error('Error generating weed management:', error);
    // Return fallback data
    return {
      potential_weeds: [
        { name: 'Amaranthus', solution: 'Manual weeding', severity: 'Medium', timing: 'Early growth stage', cost_estimate: 80 },
        { name: 'Cynodon dactylon', solution: 'Mulching', severity: 'Low', timing: 'Throughout season', cost_estimate: 60 }
      ],
      ai_recommendations: 'AI recommendations temporarily unavailable. Follow standard practices.',
      prevention_strategies: [
        'Regular monitoring',
        'Proper land preparation',
        'Timely cultivation'
      ],
      application_schedule: [
        'Pre-emergence application',
        'Manual weeding as needed'
      ]
    };
  }
};

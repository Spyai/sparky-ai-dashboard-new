export interface User {
  id: string;
  phone: string;
  created_at: string;
}

export interface Farm {
  id: string;
  field_id: string;
  farm_name: string;
  location: string;
  user_phone: string;
  crop: string;
  fertilizer_data: any;
  growth_yield_data: any;
  irrigation_data: any[];
  pest_disease_data: any;
  weed_data: any;
  coordinates: any[];
  created_at: string;
  updated_at: string;
  uid: string;
  timestamp: number;
  sensed_day: string;
  enhanced_fertilizer_data: any;
  enhanced_irrigation_data: any[];
  enhanced_pest_disease_data: any;
  enhanced_weed_data: any;
  soil_analysis_data: any;
  weather_data: any;
}

export interface FarmData {
  UID: string;
  fieldID: string;
  Crop: string;
  Fertilizer: {
    N: number;
    P: number;
    K: number;
    S: number;
    Zn: number;
    frequency: string;
    sources: string[];
  };
  GrowthAndYieldEstimation: {
    expected_yield_per_acre: number;
    harvesting_period: string;
  };
  Irrigation: Array<{
    date: string;
    quantity_mm: number;
    time: string;
    precipitation_probability: number;
  }>;
  PestAndDisease: {
    diseases: Array<{
      name: string;
      treatment: string;
    }>;
    pests: Array<{
      name: string;
      treatment: string;
    }>;
  };
  Weed: {
    potential_weeds: Array<{
      name: string;
      solution: string;
    }>;
  };
}

export interface AIAlert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
}
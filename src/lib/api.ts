// External API integration for farm creation
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

export interface SubmitFieldRequest {
  CropCode: string;
  FieldName: string;
  PaymentType: number;
  SowingDate: string;
  Points: number[][];
}

export interface SubmitFieldResponse {
  Subscription: boolean;
  Coordinates: {
    [key: string]: {
      Latitude: number;
      Longitude: number;
    };
  };
  CropCode: string;
  PreviousDataRequests: {
    [date: string]: string;
  };
  FieldMaxLat: number;
  FieldMaxLong: number;
  FieldMinLat: number;
  FieldMinLong: number;
  FieldArea: number;
  FieldID: string;
  UID: string;
  OrderDate: string;
  Email: string;
  GenTif: string;
  FieldAddress: string | null;
  FieldDescription: string;
  SowingDate: string;
  Paid: string;
  PaymentType: number;
  hUnits: number;
}

export const submitField = async (data: SubmitFieldRequest): Promise<SubmitFieldResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/submitField`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting field:', error);
    throw error;
  }
};

// Crop code mapping
export const getCropCode = (cropName: string): string => {
  const cropCodes: { [key: string]: string } = {
    'Apple': '1r',
    'Wheat': '2w',
    'Rice': '3r',
    'Corn': '4c',
    'Soybean': '5s',
    'Cotton': '6c',
    'Tomato': '7t',
    'Potato': '8p',
    'Onion': '9o',
    'Cabbage': '10c',
  };
  
  return cropCodes[cropName] || '1r'; // Default to Apple
};

// Weather API integration
export interface WeatherData {
  daily: Array<{
    clouds: number;
    dew_point: number;
    dt: number;
    feels_like: {
      day: number;
      eve: number;
      morn: number;
      night: number;
    };
    humidity: number;
    moon_phase: number;
    moonrise: number;
    moonset: number;
    pop: number;
    pressure: number;
    summary: string;
    sunrise: number;
    sunset: number;
    temp: {
      day: number;
      eve: number;
      max: number;
      min: number;
      morn: number;
      night: number;
    };
    uvi: number;
    weather: Array<{
      description: string;
      icon: string;
      id: number;
      main: string;
    }>;
    wind_deg: number;
    wind_gust: number;
    wind_speed: number;
    rain?: number;
  }>;
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
}

export const getForecastWeather = async (fieldID: string): Promise<WeatherData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getForecastWeather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ FieldID: fieldID }),
    });

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Farmer Data API integration
export interface FarmerData {
  CenterLat: number;
  CenterLatLarge: number;
  CenterLong: number;
  CenterLongLarge: number;
  Coordinates: {
    [key: string]: {
      Latitude: number;
      Longitude: number;
    };
  };
  CropCode: string;
  Email: string;
  Expiring: string;
  FieldArea: number;
  FieldDescription: string;
  FieldID: string;
  FieldLatLen: number;
  FieldLatLenLarge: number;
  FieldLongLen: number;
  FieldLongLenLarge: number;
  FieldMaxLat: number;
  FieldMaxLong: number;
  FieldMinLat: number;
  FieldMinLong: number;
  GenTif: string;
  Health: {
    [index: string]: {
      [date: string]: string;
    };
  };
  IndexBreakdown: {
    [date: string]: {
      [index: string]: string[];
    };
  };
  MapDimensions: {
    height: number;
    horiPadPer: number;
    verPadPer: number;
    width: number;
    zoom: number;
  };
  OrderDate: string;
  Paid: string;
  PaymentType: number;
  PreviousDataRequests: {
    [date: string]: string;
  };
  SARDays: {
    [date: string]: string;
  };
  SowingDate: string;
  Subscription: boolean;
  UID: string;
  Weather: {
    [date: string]: {
      cloud_cover: number;
      humidity: number;
      max_temp: number;
      min_temp: number;
      pressure: number;
      station: string;
      wind_deg: number;
      wind_speed: number;
    };
  };
  hUnits: number;
}

export const getFarmerData = async (fieldID: string): Promise<FarmerData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getFarmerData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ FieldID: fieldID }),
    });

    if (!response.ok) {
      throw new Error(`Farmer Data API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching farmer data:', error);
    throw error;
  }
};
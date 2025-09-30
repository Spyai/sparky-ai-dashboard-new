import React, { useState } from 'react';
import { MapPin, Plus, Save, AlertCircle } from 'lucide-react';
import { createFarm } from '../../lib/supabase';
import { submitField, getCropCode } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import MapBoundarySelector from './MapBoundarySelector';

const FarmSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    farm_name: '',
    location: '',
    crop: '',
    user_phone: user?.phone || '',
  });
  const [coordinates, setCoordinates] = useState<number[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cropOptions = [
    'Apple', 'Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Tomato', 'Potato', 'Onion', 'Cabbage'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.phone) {
      setError('User phone number is required');
      return;
    }

    if (coordinates.length < 4) {
      setError('Please draw a farm boundary on the map');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Submit to external API first
      const apiData = {
        CropCode: getCropCode(formData.crop),
        FieldName: formData.farm_name,
        PaymentType: 1,
        SowingDate: Math.floor(Date.now() / 1000).toString(), // Current timestamp
        Points: coordinates.slice(0, -1), // Remove the duplicate last point for API
      };

      const apiResponse = await submitField(apiData);

      // Save to Supabase with API response data

      const { error } = await createFarm({
        field_id: apiResponse.FieldID,
        farm_name: formData.farm_name,
        location: formData.location,
        user_phone: user.phone,
        crop: formData.crop,
        coordinates: coordinates,
        fertilizer_data: {},
        growth_yield_data: {},
        irrigation_data: [],
        pest_disease_data: {},
        weed_data: {},
        enhanced_fertilizer_data: {},
        enhanced_irrigation_data: [],
        enhanced_pest_disease_data: {},
        enhanced_weed_data: {},
        soil_analysis_data: {},
        weather_data: {},
        uid: apiResponse.UID,
        timestamp: parseInt(apiResponse.SowingDate),
        sensed_day: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to create farm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  console.log("Data")
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Create Your Farm</h1>
          </div>
          <p className="text-zinc-400">Let's set up your first farm to get started</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Farm Name
                </label>
                <input
                  type="text"
                  name="farm_name"
                  value={formData.farm_name}
                  onChange={handleInputChange}
                  placeholder="My Farm"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Primary Crop
                </label>
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a crop</option>
                  {cropOptions.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="user_phone"
                  value={formData.user_phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-400 placeholder-zinc-500 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-zinc-500 mt-1">Phone number from your login</p>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
              <MapBoundarySelector
                onBoundaryChange={setCoordinates}
                initialCoordinates={coordinates}
              />
            </div>

            {coordinates.length > 0 && (
              <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 text-sm">
                    Farm boundary defined with {coordinates.length - 1} points
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating Farm...' : 'Save Farm'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmSetup;
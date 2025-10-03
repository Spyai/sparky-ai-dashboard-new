import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFarms } from '../lib/supabase';
import { getForecastWeather, WeatherData, getFarmerData, FarmerData } from '../lib/api';
import { 
  getAIFertilizerRecommendations, 
  getAIIrrigationSchedule, 
  getAIYieldPrediction, 
  getAIPestDiseaseManagement, 
  getAIWeedManagement,
  FertilizerRecommendation,
  IrrigationSchedule,
  YieldPrediction,
  PestDiseaseData,
  WeedManagementData
} from '../lib/realtime-api';
import { Farm } from '../types';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import FarmSelector from '../components/Dashboard/FarmSelector';
import FertilizerInfo from '../components/Dashboard/FertilizerInfo';
import IrrigationCalendar from '../components/Dashboard/IrrigationCalendar';
import YieldEstimation from '../components/Dashboard/YieldEstimation';
import PestDiseaseOverview from '../components/Dashboard/PestDiseaseOverview';
import WeedManagement from '../components/Dashboard/WeedManagement';
import AIChat from '../components/Dashboard/AIChat';
import FarmMap from '../components/Dashboard/FarmMap';
import WeatherForecast from '../components/Dashboard/WeatherForecast';
import CropHealthMonitor from '../components/Dashboard/CropHealthMonitor';
import AdvancedFieldAnalytics from '../components/Dashboard/AdvancedFieldAnalytics';
// import AIInsightsPanel from '../components/Dashboard/AIInsightsPanel';
import ColorizationMap from '../components/Dashboard/ColorizationMap';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [farmerDataLoading, setFarmerDataLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time AI data states
  const [fertilizerData, setFertilizerData] = useState<FertilizerRecommendation | null>(null);
  const [irrigationData, setIrrigationData] = useState<IrrigationSchedule[]>([]);
  const [yieldData, setYieldData] = useState<YieldPrediction | null>(null);
  const [pestDiseaseData, setPestDiseaseData] = useState<PestDiseaseData | null>(null);
  const [weedData, setWeedData] = useState<WeedManagementData | null>(null);
  const [aiDataLoading, setAiDataLoading] = useState(false);

  // Remove sample farm data - we'll use real-time AI data instead

  const fetchFarms = useCallback(async () => {
    if (!user?.phone) return;

    try {
      const { data, error } = await getUserFarms(user.phone);
      if (error) throw error;
      
      setFarms(data || []);
      if (data && data.length > 0) {
        setSelectedFarm(data[0]);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.phone]);

  const fetchWeatherData = useCallback(async (fieldId: string) => {
    setWeatherLoading(true);
    try {
      const weather = await getForecastWeather(fieldId);
      setWeatherData(weather);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const fetchFarmerData = useCallback(async (fieldId: string) => {
    setFarmerDataLoading(true);
    try {
      const data = await getFarmerData(fieldId);
      setFarmerData(data);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
      setFarmerData(null);
    } finally {
      setFarmerDataLoading(false);
    }
  }, []);

  const fetchAIData = useCallback(async () => {
    if (!selectedFarm || !farmerData || !weatherData) return;
    
    setAiDataLoading(true);
    try {
      // Fetch all AI-generated data in parallel
      const [
        fertilizerRecommendations,
        irrigationSchedule, 
        yieldPrediction,
        pestDiseaseManagement,
        weedManagement
      ] = await Promise.all([
        getAIFertilizerRecommendations(selectedFarm, farmerData, weatherData),
        getAIIrrigationSchedule(selectedFarm, farmerData, weatherData),
        getAIYieldPrediction(selectedFarm, farmerData, weatherData),
        getAIPestDiseaseManagement(selectedFarm, farmerData, weatherData),
        getAIWeedManagement(selectedFarm, farmerData, weatherData)
      ]);

      setFertilizerData(fertilizerRecommendations);
      setIrrigationData(irrigationSchedule);
      setYieldData(yieldPrediction);
      setPestDiseaseData(pestDiseaseManagement);
      setWeedData(weedManagement);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setAiDataLoading(false);
    }
  }, [selectedFarm, farmerData, weatherData]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  useEffect(() => {
    if (selectedFarm?.field_id) {
      fetchWeatherData(selectedFarm.field_id);
      fetchFarmerData(selectedFarm.field_id);
    }
  }, [selectedFarm, fetchWeatherData, fetchFarmerData]);

  // Fetch real-time AI data when farm data and weather data are available
  useEffect(() => {
    if (selectedFarm && farmerData && weatherData) {
      fetchAIData();
    }
  }, [selectedFarm, farmerData, weatherData, fetchAIData]);

  // Close sidebar on window resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.querySelector('[data-menu-button]');
      
      if (sidebarOpen && sidebar && !sidebar.contains(event.target as Node) && 
          menuButton && !menuButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sidebarOpen]);

  const handleAddFarm = () => {
    // Navigate to farm creation
    window.location.href = '/farm-setup';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="mx-auto space-y-6 max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Farm Dashboard</h1>
              <FarmSelector
                farms={farms}
                selectedFarm={selectedFarm}
                onSelectFarm={setSelectedFarm}
                onAddFarm={handleAddFarm}
              />
            </div>

            {selectedFarm ? (
              <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2">
                <div className="xl:col-span-2">
                  <FarmMap farm={selectedFarm} />
                </div>
                
                <div className="xl:col-span-2">
                  <ColorizationMap farm={selectedFarm} />
                </div>
                
                <div className="xl:col-span-2">
                  {weatherLoading ? (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        <p className="text-zinc-400">Loading weather data...</p>
                      </div>
                    </div>
                  ) : weatherData ? (
                    <WeatherForecast data={weatherData} />
                  ) : (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <p className="text-zinc-400">Weather data unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="xl:col-span-2">
                  {farmerDataLoading ? (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                        <p className="text-zinc-400">Loading crop health data...</p>
                      </div>
                    </div>
                  ) : farmerData ? (
                    <CropHealthMonitor data={farmerData} />
                  ) : (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <p className="text-zinc-400">Crop health data unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="xl:col-span-2">
                  {aiDataLoading ? (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                        <p className="text-zinc-400">Loading AI fertilizer recommendations...</p>
                      </div>
                    </div>
                  ) : fertilizerData ? (
                    <FertilizerInfo data={fertilizerData} />
                  ) : (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <p className="text-zinc-400">Fertilizer recommendations unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {aiDataLoading ? (
                  <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      <p className="text-zinc-400">Loading AI irrigation schedule...</p>
                    </div>
                  </div>
                ) : irrigationData.length > 0 ? (
                  <IrrigationCalendar 
                    data={irrigationData} 
                    weatherData={weatherData}
                  />
                ) : (
                  <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                    <div className="text-center">
                      <p className="text-zinc-400">Irrigation schedule unavailable</p>
                    </div>
                  </div>
                )}
                
                {aiDataLoading ? (
                  <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 border-2 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                      <p className="text-zinc-400">Loading AI yield predictions...</p>
                    </div>
                  </div>
                ) : yieldData ? (
                  <YieldEstimation 
                    crop={selectedFarm?.crop || 'Unknown'}
                    data={yieldData}
                  />
                ) : (
                  <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                    <div className="text-center">
                      <p className="text-zinc-400">Yield estimation unavailable</p>
                    </div>
                  </div>
                )}
                
                <div className="xl:col-span-2">
                  {aiDataLoading ? (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-red-500 rounded-full border-t-transparent animate-spin"></div>
                        <p className="text-zinc-400">Loading AI pest & disease analysis...</p>
                      </div>
                    </div>
                  ) : pestDiseaseData ? (
                    <PestDiseaseOverview data={pestDiseaseData} />
                  ) : (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <p className="text-zinc-400">Pest & disease data unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="xl:col-span-2">
                  {aiDataLoading ? (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
                        <p className="text-zinc-400">Loading AI weed management recommendations...</p>
                      </div>
                    </div>
                  ) : weedData ? (
                    <WeedManagement data={weedData} />
                  ) : (
                    <div className="flex items-center justify-center p-6 border bg-zinc-900 rounded-xl border-zinc-800">
                      <div className="text-center">
                        <p className="text-zinc-400">Weed management data unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="xl:col-span-2">
                  {farmerData && (
                    <AdvancedFieldAnalytics data={farmerData} />
                  )}
                </div>
                
                <div className="xl:col-span-2">
                  {/* <AIInsightsPanel 
                    farmData={selectedFarm}
                    weatherData={weatherData}
                    cropHealthData={farmerData}
                  /> */}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mb-4 text-zinc-400">
                  No farms found. Create your first farm to get started.
                </div>
                <button
                  onClick={handleAddFarm}
                  className="px-6 py-3 font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
                >
                  Create Farm
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* AI Chat - Hidden on large screens, shown as floating on mobile/tablet */}
      <div className="lg:hidden">
        <AIChat 
          farmContext={{
            fieldId: selectedFarm?.field_id,
            crop: selectedFarm?.crop,
            location: selectedFarm?.location,
            fieldArea: farmerData?.FieldArea,
            ndvi: farmerData?.Health?.ndvi ? Object.values(farmerData.Health.ndvi)[0] as string : undefined,
            evi: farmerData?.Health?.evi ? Object.values(farmerData.Health.evi)[0] as string : undefined,
            lai: farmerData?.Health?.lai ? Object.values(farmerData.Health.lai)[0] as string : undefined,
          }}
        />
      </div>
      
      {/* AI Chat - Shown as sidebar on large screens */}
      <div className="hidden lg:block">
        <AIChat 
          farmContext={{
            fieldId: selectedFarm?.field_id,
            crop: selectedFarm?.crop,
            location: selectedFarm?.location,
            fieldArea: farmerData?.FieldArea,
            ndvi: farmerData?.Health?.ndvi ? Object.values(farmerData.Health.ndvi)[0] as string : undefined,
            evi: farmerData?.Health?.evi ? Object.values(farmerData.Health.evi)[0] as string : undefined,
            lai: farmerData?.Health?.lai ? Object.values(farmerData.Health.lai)[0] as string : undefined,
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
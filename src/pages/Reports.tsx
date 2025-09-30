import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserFarms } from '../lib/supabase';
import { getForecastWeather, getFarmerData } from '../lib/api';
import { Farm } from '../types';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import FarmSelector from '../components/Dashboard/FarmSelector';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState<'crop-health' | 'weather' | 'activities' | 'yield' | 'financial'>('crop-health');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportData, setReportData] = useState<any>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    fetchFarms();
  }, [user?.phone]);

  useEffect(() => {
    if (selectedFarm) {
      generateReportData();
    }
  }, [selectedFarm, reportType, dateRange]);

  const fetchFarms = async () => {
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
  };

  const generateReportData = async () => {
    if (!selectedFarm) return;

    try {
      switch (reportType) {
        case 'crop-health':
          await generateCropHealthReport();
          break;
        case 'weather':
          await generateWeatherReport();
          break;
        case 'activities':
          generateActivitiesReport();
          break;
        case 'yield':
          generateYieldReport();
          break;
        case 'financial':
          generateFinancialReport();
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const generateCropHealthReport = async () => {
    try {
      const farmerData = await getFarmerData(selectedFarm!.field_id);
      
      // Process health data for charts
      const healthIndices = Object.entries(farmerData.Health).map(([index, values]: [string, any]) => {
        const latestDate = Object.keys(values)[0];
        return {
          index: index.toUpperCase(),
          value: parseFloat(values[latestDate]),
          status: getHealthStatus(parseFloat(values[latestDate]), index),
        };
      });

      // Index breakdown for distribution chart
      const latestDate = Object.keys(farmerData.IndexBreakdown)[0];
      const ndviDistribution = farmerData.IndexBreakdown[latestDate]?.ndvi?.map((value: string, index: number) => ({
        category: `Level ${index + 1}`,
        value: parseInt(value),
        percentage: (parseInt(value) / farmerData.FieldArea * 100).toFixed(1),
      })) || [];

      setReportData({
        type: 'crop-health',
        healthIndices,
        ndviDistribution,
        fieldArea: farmerData.FieldArea,
        cropCode: farmerData.CropCode,
        lastUpdated: latestDate,
        summary: {
          overallHealth: calculateOverallHealth(healthIndices),
          criticalIssues: identifyCriticalIssues(healthIndices),
          recommendations: generateHealthRecommendations(healthIndices),
        }
      });
    } catch (error) {
      console.error('Error generating crop health report:', error);
    }
  };

  const generateWeatherReport = async () => {
    try {
      const weatherData = await getForecastWeather(selectedFarm!.field_id);
      
      const dailyData = weatherData.daily.slice(0, 7).map((day, index) => ({
        day: `Day ${index + 1}`,
        date: new Date(day.dt * 1000).toLocaleDateString(),
        maxTemp: Math.round(day.temp.max - 273.15),
        minTemp: Math.round(day.temp.min - 273.15),
        humidity: day.humidity,
        rainfall: Math.round(day.pop * 100),
        windSpeed: Math.round(day.wind_speed),
        uvIndex: day.uvi,
      }));

      const weatherSummary = {
        avgTemp: Math.round(dailyData.reduce((sum, day) => sum + (day.maxTemp + day.minTemp) / 2, 0) / dailyData.length),
        totalRainfall: dailyData.reduce((sum, day) => sum + day.rainfall, 0),
        avgHumidity: Math.round(dailyData.reduce((sum, day) => sum + day.humidity, 0) / dailyData.length),
        maxUV: Math.max(...dailyData.map(day => day.uvIndex)),
      };

      setReportData({
        type: 'weather',
        dailyData,
        summary: weatherSummary,
        recommendations: generateWeatherRecommendations(weatherSummary),
      });
    } catch (error) {
      console.error('Error generating weather report:', error);
    }
  };

  const generateActivitiesReport = () => {
    const activities = JSON.parse(localStorage.getItem(`activities_${selectedFarm?.id || 'default'}`) || '[]');
    
    const activityTypes = activities.reduce((acc: any, activity: any) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    const statusBreakdown = activities.reduce((acc: any, activity: any) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(activityTypes).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));

    const statusData = Object.entries(statusBreakdown).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));

    setReportData({
      type: 'activities',
      totalActivities: activities.length,
      chartData,
      statusData,
      completionRate: Math.round((statusBreakdown.completed || 0) / activities.length * 100),
      upcomingActivities: activities.filter((a: any) => a.status === 'pending' && new Date(a.date) > new Date()).length,
    });
  };

  const generateYieldReport = () => {
    // Sample yield data - in real app, this would come from actual measurements
    const yieldData = [
      { month: 'Jan', estimated: 1200, actual: 1150 },
      { month: 'Feb', estimated: 1300, actual: 1280 },
      { month: 'Mar', estimated: 1400, actual: 1420 },
      { month: 'Apr', estimated: 1500, actual: 1480 },
      { month: 'May', estimated: 1600, actual: 1590 },
      { month: 'Jun', estimated: 1700, actual: 0 }, // Future months
    ];

    const totalEstimated = yieldData.reduce((sum, month) => sum + month.estimated, 0);
    const totalActual = yieldData.reduce((sum, month) => sum + month.actual, 0);
    const accuracy = totalActual > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

    setReportData({
      type: 'yield',
      yieldData,
      totalEstimated,
      totalActual,
      accuracy,
      projectedHarvest: '1,700 kg/acre',
      harvestDate: 'October 2024',
    });
  };

  const generateFinancialReport = () => {
    // Sample financial data
    const expenses = [
      { category: 'Seeds', amount: 5000, percentage: 20 },
      { category: 'Fertilizers', amount: 8000, percentage: 32 },
      { category: 'Pesticides', amount: 3000, percentage: 12 },
      { category: 'Labor', amount: 6000, percentage: 24 },
      { category: 'Equipment', amount: 3000, percentage: 12 },
    ];

    const revenue = [
      { month: 'Jan', income: 15000, expenses: 8000 },
      { month: 'Feb', income: 18000, expenses: 9000 },
      { month: 'Mar', income: 22000, expenses: 10000 },
      { month: 'Apr', income: 25000, expenses: 11000 },
      { month: 'May', income: 28000, expenses: 12000 },
    ];

    const totalIncome = revenue.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = revenue.reduce((sum, month) => sum + month.expenses, 0);
    const profit = totalIncome - totalExpenses;
    const profitMargin = Math.round((profit / totalIncome) * 100);

    setReportData({
      type: 'financial',
      expenses,
      revenue,
      totalIncome,
      totalExpenses,
      profit,
      profitMargin,
      roi: Math.round((profit / totalExpenses) * 100),
    });
  };

  const getHealthStatus = (value: number, index: string) => {
    // Simplified health status logic
    if (index === 'ndvi' || index === 'evi') {
      if (value > 50) return 'Good';
      if (value > 30) return 'Fair';
      return 'Poor';
    }
    return 'Normal';
  };

  const calculateOverallHealth = (indices: any[]) => {
    const avgValue = indices.reduce((sum, item) => sum + item.value, 0) / indices.length;
    if (avgValue > 50) return 'Excellent';
    if (avgValue > 30) return 'Good';
    if (avgValue > 20) return 'Fair';
    return 'Poor';
  };

  const identifyCriticalIssues = (indices: any[]) => {
    return indices.filter(item => item.value < 20).map(item => `Low ${item.index}`);
  };

  const generateHealthRecommendations = (indices: any[]) => {
    const recommendations = [];
    const ndvi = indices.find(item => item.index === 'NDVI');
    const ndmi = indices.find(item => item.index === 'NDMI');
    
    if (ndvi && ndvi.value < 30) {
      recommendations.push('Increase fertilization to improve vegetation health');
    }
    if (ndmi && ndmi.value < 20) {
      recommendations.push('Increase irrigation frequency due to low moisture content');
    }
    
    return recommendations;
  };

  const generateWeatherRecommendations = (summary: any) => {
    const recommendations = [];
    
    if (summary.avgTemp > 35) {
      recommendations.push('High temperatures detected - increase irrigation and provide shade');
    }
    if (summary.totalRainfall > 300) {
      recommendations.push('High rainfall expected - ensure proper drainage');
    }
    if (summary.maxUV > 8) {
      recommendations.push('High UV levels - protect workers and monitor crop stress');
    }
    
    return recommendations;
  };

  const downloadReport = async () => {
    if (!reportData) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // Create downloadable content
      const reportContent = generateReportContent();
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete the progress
      setDownloadProgress(100);
      
      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show completion animation
      setDownloadComplete(true);
      
      // Reset after delay
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadComplete(false);
      }, 3000);

    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const generateReportContent = () => {
    const farmName = selectedFarm?.farm_name || 'Farm';
    const reportTitle = reportType.replace('-', ' ').toUpperCase();
    const currentDate = new Date().toLocaleDateString();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>${reportTitle} Report - ${farmName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #f0f9ff; border-left: 4px solid #2563eb; }
        .metric h4 { margin: 0 0 8px 0; color: #1e40af; }
        .metric p { margin: 0; font-size: 24px; font-weight: bold; color: #1f2937; }
        .section { margin: 20px 0; }
        .section h3 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${reportTitle} Report</h1>
        <p>Farm: ${farmName} | Generated: ${currentDate}</p>
    </div>
    <div class="content">
        ${generateReportHTML()}
    </div>
</body>
</html>`;
  };

  const generateReportHTML = () => {
    if (!reportData) return '<p>No data available</p>';

    switch (reportType) {
      case 'crop-health':
        return `
          <div class="section">
            <h3>Health Overview</h3>
            <div class="metric">
              <h4>Overall Health</h4>
              <p>${reportData.overallHealth}%</p>
            </div>
            <div class="metric">
              <h4>Growth Rate</h4>
              <p>${reportData.growthRate}%</p>
            </div>
            <div class="metric">
              <h4>Disease Risk</h4>
              <p>${reportData.diseaseRisk}</p>
            </div>
            <div class="metric">
              <h4>Irrigation Status</h4>
              <p>${reportData.irrigationStatus}</p>
            </div>
          </div>
        `;
      case 'weather':
        return `
          <div class="section">
            <h3>Weather Summary</h3>
            <div class="metric">
              <h4>Temperature</h4>
              <p>${reportData.temperature}°C</p>
            </div>
            <div class="metric">
              <h4>Humidity</h4>
              <p>${reportData.humidity}%</p>
            </div>
            <div class="metric">
              <h4>Rainfall</h4>
              <p>${reportData.rainfall}mm</p>
            </div>
            <div class="metric">
              <h4>Wind Speed</h4>
              <p>${reportData.windSpeed} km/h</p>
            </div>
          </div>
        `;
      case 'activities':
        return `
          <div class="section">
            <h3>Activity Summary</h3>
            <div class="metric">
              <h4>Total Activities</h4>
              <p>${reportData.totalActivities}</p>
            </div>
            <div class="metric">
              <h4>Completion Rate</h4>
              <p>${reportData.completionRate}%</p>
            </div>
            <div class="metric">
              <h4>Upcoming Activities</h4>
              <p>${reportData.upcomingActivities}</p>
            </div>
          </div>
        `;
      case 'yield':
        return `
          <div class="section">
            <h3>Yield Projection</h3>
            <div class="metric">
              <h4>Projected Harvest</h4>
              <p>${reportData.projectedHarvest}</p>
            </div>
            <div class="metric">
              <h4>Accuracy</h4>
              <p>${reportData.accuracy}%</p>
            </div>
            <div class="metric">
              <h4>Harvest Date</h4>
              <p>${reportData.harvestDate}</p>
            </div>
          </div>
        `;
      case 'financial':
        return `
          <div class="section">
            <h3>Financial Summary</h3>
            <div class="metric">
              <h4>Total Income</h4>
              <p>₹${reportData.totalIncome?.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h4>Total Expenses</h4>
              <p>₹${reportData.totalExpenses?.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h4>Profit</h4>
              <p>₹${reportData.profit?.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h4>ROI</h4>
              <p>${reportData.roi}%</p>
            </div>
          </div>
        `;
      default:
        return '<p>Report type not supported</p>';
    }
  };  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'crop-health':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 font-medium text-white">Overall Health</h4>
                <p className="text-xl font-bold text-green-400 sm:text-2xl">{reportData.summary.overallHealth}</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 font-medium text-white">Field Area</h4>
                <p className="text-xl font-bold text-blue-400 sm:text-2xl">{(reportData.fieldArea / 10000).toFixed(2)} ha</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800 sm:col-span-2 lg:col-span-1">
                <h4 className="mb-2 font-medium text-white">Last Updated</h4>
                <p className="text-xl font-bold text-purple-400 sm:text-2xl">{reportData.lastUpdated}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg sm:p-6 bg-zinc-800">
              <h4 className="mb-4 font-medium text-white">Health Indices</h4>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[400px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.healthIndices}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="index" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Bar dataKey="value" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {reportData.summary.recommendations.length > 0 && (
              <div className="p-4 border border-green-800 rounded-lg bg-green-900/20">
                <h4 className="mb-2 font-medium text-green-400">Recommendations</h4>
                <ul className="space-y-1">
                  {reportData.summary.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-green-300">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'weather':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Avg Temperature</h4>
                <p className="text-xl font-bold text-orange-400 sm:text-2xl">{reportData.summary.avgTemp}°C</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Total Rainfall</h4>
                <p className="text-xl font-bold text-blue-400 sm:text-2xl">{reportData.summary.totalRainfall}%</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Avg Humidity</h4>
                <p className="text-xl font-bold sm:text-2xl text-cyan-400">{reportData.summary.avgHumidity}%</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Max UV Index</h4>
                <p className="text-xl font-bold text-yellow-400 sm:text-2xl">{reportData.summary.maxUV}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg sm:p-6 bg-zinc-800">
              <h4 className="mb-4 font-medium text-white">7-Day Weather Trend</h4>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[400px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Line type="monotone" dataKey="maxTemp" stroke="#f97316" name="Max Temp" />
                      <Line type="monotone" dataKey="minTemp" stroke="#06b6d4" name="Min Temp" />
                      <Line type="monotone" dataKey="humidity" stroke="#8b5cf6" name="Humidity" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 font-medium text-white">Total Activities</h4>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{reportData.totalActivities}</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 font-medium text-white">Completion Rate</h4>
                <p className="text-xl sm:text-2xl font-bold text-green-400">{reportData.completionRate}%</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800 sm:col-span-2 lg:col-span-1">
                <h4 className="mb-2 font-medium text-white">Upcoming</h4>
                <p className="text-xl sm:text-2xl font-bold text-orange-400">{reportData.upcomingActivities}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <div className="p-4 sm:p-6 rounded-lg bg-zinc-800">
                <h4 className="mb-4 font-medium text-white">Activities by Type</h4>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[300px]">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={reportData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="type" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-lg bg-zinc-800">
                <h4 className="mb-4 font-medium text-white">Status Breakdown</h4>
                <div className="space-y-3">
                  {reportData.statusData.map((status: { status: string; count: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-zinc-300">{status.status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-zinc-700">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${(status.count / reportData.totalActivities) * 100}%`,
                              backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'][index] || '#6b7280'
                            }}
                          ></div>
                        </div>
                        <span className="font-medium text-white">{status.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'yield':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Projected Harvest</h4>
                <p className="text-xl sm:text-2xl font-bold text-green-400">{reportData.projectedHarvest}</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Accuracy</h4>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{reportData.accuracy}%</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Harvest Date</h4>
                <p className="text-xl sm:text-2xl font-bold text-purple-400">{reportData.harvestDate}</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Total Actual</h4>
                <p className="text-xl sm:text-2xl font-bold text-orange-400">{reportData.totalActual} kg</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-lg bg-zinc-800">
              <h4 className="mb-4 font-medium text-white">Yield Comparison</h4>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[400px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.yieldData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Line type="monotone" dataKey="estimated" stroke="#3b82f6" name="Estimated" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="actual" stroke="#22c55e" name="Actual" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Total Income</h4>
                <p className="text-xl sm:text-2xl font-bold text-green-400">₹{reportData.totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Total Expenses</h4>
                <p className="text-xl sm:text-2xl font-bold text-red-400">₹{reportData.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">Profit</h4>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">₹{reportData.profit.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <h4 className="mb-2 text-sm font-medium text-white sm:text-base">ROI</h4>
                <p className="text-xl sm:text-2xl font-bold text-purple-400">{reportData.roi}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <div className="p-4 sm:p-6 rounded-lg bg-zinc-800">
                <h4 className="mb-4 font-medium text-white">Revenue vs Expenses</h4>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[300px]">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={reportData.revenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Bar dataKey="income" fill="#22c55e" name="Income" />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-lg bg-zinc-800">
                <h4 className="mb-4 font-medium text-white">Expense Breakdown</h4>
                <div className="space-y-3">
                  {reportData.expenses.map((expense: { category: string; amount: number; percentage: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-zinc-300">{expense.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 sm:w-20 h-2 rounded-full bg-zinc-700">
                          <div 
                            className="h-2 bg-blue-500 rounded-full transition-all duration-500" 
                            style={{ width: `${expense.percentage}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-white text-sm sm:text-base">₹{expense.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <img src="https://www.sparkyai.in/lovable-uploads/5422e3a0-c113-4836-83dc-61eb88a401d4.png" alt="" className='h-24 animate-pulse' />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 overflow-y-auto sm:p-6">
          <div className="mx-auto space-y-4 sm:space-y-6 max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{t('title')}</h1>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <FarmSelector
                  farms={farms}
                  selectedFarm={selectedFarm}
                  onSelectFarm={setSelectedFarm}
                  onAddFarm={() => {}}
                />
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={downloadReport}
                    disabled={!reportData || isDownloading}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg sm:px-6 sm:py-3 ${
                      isDownloading 
                        ? 'bg-blue-500 cursor-not-allowed' 
                        : downloadComplete 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-green-500 hover:bg-green-600 hover:scale-105'
                    } shadow-lg hover:shadow-xl disabled:bg-green-500/50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Generating...</span>
                        <span className="sm:hidden">Gen...</span>
                      </>
                    ) : downloadComplete ? (
                      <>
                        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="hidden sm:inline">Downloaded!</span>
                        <span className="sm:hidden">Done!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('download')}</span>
                        <span className="sm:hidden">DL</span>
                      </>
                    )}
                  </button>
                  
                  {/* Progress Bar */}
                  {isDownloading && (
                    <div className="w-full max-w-[200px] overflow-hidden bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 transition-all duration-500 ease-out bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {/* Progress Percentage */}
                  {isDownloading && (
                    <span className="text-xs text-zinc-400">{Math.round(downloadProgress)}%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Report Type Selection */}
            <div className="p-4 border sm:p-6 bg-zinc-900 rounded-xl border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white sm:text-xl">Report Type</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                {[
                  { key: 'crop-health', label: t('cropHealth'), icon: Activity },
                  { key: 'weather', label: t('weather'), icon: TrendingUp },
                  { key: 'activities', label: t('activities'), icon: Calendar },
                  { key: 'yield', label: t('yield'), icon: BarChart3 },
                  { key: 'financial', label: t('financial'), icon: PieChart },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setReportType(key as 'crop-health' | 'weather' | 'activities' | 'yield' | 'financial')}
                    className={`p-3 sm:p-4 rounded-lg border transition-colors ${
                      reportType === key
                        ? 'bg-blue-500 border-blue-400 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-2 sm:w-6 sm:h-6" />
                    <p className="text-xs font-medium truncate sm:text-sm">{label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Report Content */}
            {selectedFarm && (
              <div className="space-y-4 sm:space-y-6">
                {/* Success Notification */}
                {downloadComplete && (
                  <div className="flex items-center gap-3 p-4 text-green-800 bg-green-100 border border-green-200 rounded-lg animate-in slide-in-from-top duration-500">
                    <div className="p-1 bg-green-200 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Report Downloaded Successfully!</p>
                      <p className="text-sm text-green-600">Your {reportType.replace('-', ' ')} report has been saved to your downloads.</p>
                    </div>
                  </div>
                )}

                <div className="p-4 border sm:p-6 bg-zinc-900 rounded-xl border-zinc-800">
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white sm:text-xl">
                      {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace('-', ' ')} Report
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {selectedFarm.farm_name} • {selectedFarm.location}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-zinc-400">Generated on</p>
                    <p className="font-medium text-white">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {renderReportContent()}
                </div>
              </div>
            )}

            {!selectedFarm && (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                <p className="mb-2 text-zinc-400">Select a farm to generate reports</p>
                <p className="text-sm text-zinc-500">Choose a farm from the dropdown above to view detailed reports</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
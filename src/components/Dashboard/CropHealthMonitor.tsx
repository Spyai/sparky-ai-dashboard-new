import React from 'react';
import { Activity, TrendingUp, Leaf, Droplets, Target, AlertTriangle } from 'lucide-react';
import { FarmerData } from '../../lib/api';

interface CropHealthMonitorProps {
  data: FarmerData;
}

const CropHealthMonitor: React.FC<CropHealthMonitorProps> = ({ data }) => {
  // Get the latest date from health data
  const latestDate = Object.keys(data.Health.ndvi || {})[0] || '';
  
  // Vegetation indices with their descriptions and ideal ranges
  const vegetationIndices = [
    {
      key: 'ndvi',
      name: 'NDVI',
      fullName: 'Normalized Difference Vegetation Index',
      description: 'Overall vegetation health and biomass',
      value: data.Health.ndvi?.[latestDate] || '0',
      unit: '',
      color: 'bg-green-500',
      icon: Leaf,
      range: { min: 0, max: 100, good: [30, 80] }
    },
    {
      key: 'evi',
      name: 'EVI',
      fullName: 'Enhanced Vegetation Index',
      description: 'Vegetation health with atmospheric correction',
      value: data.Health.evi?.[latestDate] || '0',
      unit: '',
      color: 'bg-emerald-500',
      icon: TrendingUp,
      range: { min: 0, max: 100, good: [20, 70] }
    },
    {
      key: 'lai',
      name: 'LAI',
      fullName: 'Leaf Area Index',
      description: 'Leaf coverage and canopy density',
      value: data.Health.lai?.[latestDate] || '0',
      unit: '',
      color: 'bg-lime-500',
      icon: Activity,
      range: { min: 0, max: 100, good: [30, 70] }
    },
    {
      key: 'ndmi',
      name: 'NDMI',
      fullName: 'Normalized Difference Moisture Index',
      description: 'Plant water content and stress',
      value: data.Health.ndmi?.[latestDate] || '0',
      unit: '',
      color: 'bg-blue-500',
      icon: Droplets,
      range: { min: 0, max: 100, good: [20, 60] }
    },
    {
      key: 'ndre',
      name: 'NDRE',
      fullName: 'Normalized Difference Red Edge',
      description: 'Chlorophyll content and nitrogen status',
      value: data.Health.ndre?.[latestDate] || '0',
      unit: '',
      color: 'bg-red-500',
      icon: Target,
      range: { min: 0, max: 100, good: [15, 50] }
    },
    {
      key: 'savi',
      name: 'SAVI',
      fullName: 'Soil Adjusted Vegetation Index',
      description: 'Vegetation health accounting for soil background',
      value: data.Health.savi?.[latestDate] || '0',
      unit: '',
      color: 'bg-yellow-500',
      icon: Activity,
      range: { min: 0, max: 100, good: [20, 60] }
    }
  ];

  // Soil and environmental indices
  const soilIndices = [
    {
      key: 'bsi',
      name: 'BSI',
      fullName: 'Bare Soil Index',
      description: 'Exposed soil areas',
      value: data.Health.bsi?.[latestDate] || '0',
      unit: '',
      color: 'bg-orange-500',
      range: { min: 0, max: 100, good: [0, 30] }
    },
    {
      key: 'ndwi',
      name: 'NDWI',
      fullName: 'Normalized Difference Water Index',
      description: 'Surface water content',
      value: data.Health.ndwi?.[latestDate] || '0',
      unit: '',
      color: 'bg-cyan-500',
      range: { min: 0, max: 100, good: [30, 70] }
    },
    {
      key: 'soc',
      name: 'SOC',
      fullName: 'Soil Organic Carbon',
      description: 'Soil fertility and organic matter',
      value: data.Health.soc?.[latestDate] || '0',
      unit: '%',
      color: 'bg-amber-600',
      range: { min: 0, max: 5, good: [1, 3] }
    }
  ];

  const getHealthStatus = (value: string, range: { min: number; max: number; good: [number, number] }) => {
    const numValue = parseFloat(value);
    if (numValue >= range.good[0] && numValue <= range.good[1]) {
      return { status: 'Good', color: 'text-green-400', bgColor: 'bg-green-900/20 border-green-800' };
    } else if (numValue < range.good[0]) {
      return { status: 'Low', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20 border-yellow-800' };
    } else {
      return { status: 'High', color: 'text-red-400', bgColor: 'bg-red-900/20 border-red-800' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No data';
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Crop Health Monitor</h3>
            <p className="text-zinc-400 text-sm">
              Field Analysis • {formatDate(latestDate)} • {data.FieldArea.toLocaleString()} sq.m
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-zinc-400 text-sm">Field ID</p>
          <p className="text-white font-medium">{data.FieldID}</p>
        </div>
      </div>

      {/* Vegetation Health Indices */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-400" />
          Vegetation Health Indices
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vegetationIndices.map((index) => {
            const health = getHealthStatus(index.value, index.range);
            const IconComponent = index.icon;
            
            return (
              <div key={index.key} className={`p-4 rounded-lg border ${health.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${index.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h5 className="text-white font-medium">{index.name}</h5>
                      <p className="text-zinc-400 text-xs">{index.fullName}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${health.color} bg-zinc-800`}>
                    {health.status}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-white">
                    {index.value}{index.unit}
                  </p>
                  <p className="text-zinc-400 text-xs">{index.description}</p>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${index.color}`}
                    style={{
                      width: `${Math.min(100, (parseFloat(index.value) / index.range.max) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soil & Environmental Indices */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-400" />
          Soil & Environmental Indices
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {soilIndices.map((index) => {
            const health = getHealthStatus(index.value, index.range);
            
            return (
              <div key={index.key} className={`p-4 rounded-lg border ${health.bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="text-white font-medium">{index.name}</h5>
                    <p className="text-zinc-400 text-xs">{index.fullName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${health.color} bg-zinc-800`}>
                    {health.status}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-xl font-bold text-white">
                    {index.value}{index.unit}
                  </p>
                  <p className="text-zinc-400 text-xs">{index.description}</p>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${index.color}`}
                    style={{
                      width: `${Math.min(100, (parseFloat(index.value) / index.range.max) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 text-sm">Field Area</span>
          </div>
          <p className="text-xl font-bold text-white">
            {(data.FieldArea / 10000).toFixed(2)} ha
          </p>
          <p className="text-zinc-400 text-xs">{data.FieldArea.toLocaleString()} sq.m</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300 text-sm">Crop Code</span>
          </div>
          <p className="text-xl font-bold text-white">{data.CropCode}</p>
          <p className="text-zinc-400 text-xs">Classification</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-300 text-sm">Sowing Date</span>
          </div>
          <p className="text-xl font-bold text-white">
            {new Date(parseInt(data.SowingDate) * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-zinc-400 text-xs">
            {new Date(parseInt(data.SowingDate) * 1000).getFullYear()}
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-300 text-sm">Health Units</span>
          </div>
          <p className="text-xl font-bold text-white">{data.hUnits}</p>
          <p className="text-zinc-400 text-xs">Analysis units</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
        <h5 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          AI Health Insights
        </h5>
        <div className="space-y-1 text-sm text-blue-300">
          {parseFloat(data.Health.ndvi?.[latestDate] || '0') < 30 && (
            <p>• Low NDVI detected - consider fertilization to boost vegetation health</p>
          )}
          {parseFloat(data.Health.ndmi?.[latestDate] || '0') < 20 && (
            <p>• Low moisture content - increase irrigation frequency</p>
          )}
          {parseFloat(data.Health.bsi?.[latestDate] || '0') > 70 && (
            <p>• High bare soil exposure - consider cover crops or mulching</p>
          )}
          {parseFloat(data.Health.lai?.[latestDate] || '0') > 60 && (
            <p>• Excellent canopy development - monitor for pest pressure</p>
          )}
          {parseFloat(data.Health.soc?.[latestDate] || '0') < 1 && (
            <p>• Low soil organic carbon - add organic matter to improve soil health</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropHealthMonitor;
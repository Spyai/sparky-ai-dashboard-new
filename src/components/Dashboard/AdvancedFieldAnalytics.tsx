import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Target, Activity } from 'lucide-react';
import { FarmerData } from '../../lib/api';

interface AdvancedFieldAnalyticsProps {
  data: FarmerData;
}

const AdvancedFieldAnalytics: React.FC<AdvancedFieldAnalyticsProps> = ({ data }) => {
  const latestDate = Object.keys(data.IndexBreakdown)[0] || '';
  const indexData = data.IndexBreakdown[latestDate] || {};

  // Prepare data for different chart types
  const prepareDistributionData = (values: string[], indexName: string) => {
    const categories = [
      'Very Low', 'Low', 'Below Avg', 'Average', 'Above Avg',
      'Good', 'Very Good', 'Excellent', 'Outstanding', 'Exceptional'
    ];
    
    return values.map((value, index) => ({
      category: categories[index],
      value: parseInt(value),
      percentage: values.reduce((sum, val) => sum + parseInt(val), 0) > 0 
        ? ((parseInt(value) / values.reduce((sum, val) => sum + parseInt(val), 0)) * 100).toFixed(1)
        : '0',
      fill: getColorForIndex(index)
    }));
  };

  const getColorForIndex = (index: number) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'
    ];
    return colors[index] || '#6b7280';
  };

  // NDVI Distribution Data
  const ndviData = prepareDistributionData(indexData.ndvi || [], 'NDVI');
  
  // EVI Distribution Data
  const eviData = prepareDistributionData(indexData.evi || [], 'EVI');
  
  // LAI Distribution Data
  const laiData = prepareDistributionData(indexData.lai || [], 'LAI');

  // Health Indices Comparison
  const healthComparison = [
    {
      index: 'NDVI',
      value: parseFloat(data.Health.ndvi?.[latestDate] || '0'),
      optimal: 60,
      fill: '#22c55e'
    },
    {
      index: 'EVI',
      value: parseFloat(data.Health.evi?.[latestDate] || '0'),
      optimal: 45,
      fill: '#10b981'
    },
    {
      index: 'LAI',
      value: parseFloat(data.Health.lai?.[latestDate] || '0'),
      optimal: 50,
      fill: '#84cc16'
    },
    {
      index: 'NDMI',
      value: parseFloat(data.Health.ndmi?.[latestDate] || '0'),
      optimal: 40,
      fill: '#06b6d4'
    },
    {
      index: 'SAVI',
      value: parseFloat(data.Health.savi?.[latestDate] || '0'),
      optimal: 40,
      fill: '#eab308'
    }
  ];

  // Radar Chart Data for Health Overview
  const radarData = [
    {
      subject: 'NDVI',
      current: parseFloat(data.Health.ndvi?.[latestDate] || '0'),
      optimal: 60,
      fullMark: 100
    },
    {
      subject: 'EVI',
      current: parseFloat(data.Health.evi?.[latestDate] || '0'),
      optimal: 45,
      fullMark: 100
    },
    {
      subject: 'LAI',
      current: parseFloat(data.Health.lai?.[latestDate] || '0'),
      optimal: 50,
      fullMark: 100
    },
    {
      subject: 'NDMI',
      current: parseFloat(data.Health.ndmi?.[latestDate] || '0'),
      optimal: 40,
      fullMark: 100
    },
    {
      subject: 'SAVI',
      current: parseFloat(data.Health.savi?.[latestDate] || '0'),
      optimal: 40,
      fullMark: 100
    }
  ];

  // Soil Health Pie Chart
  const soilHealthData = [
    {
      name: 'Healthy Vegetation',
      value: parseFloat(data.Health.ndvi?.[latestDate] || '0'),
      fill: '#22c55e'
    },
    {
      name: 'Bare Soil',
      value: parseFloat(data.Health.bsi?.[latestDate] || '0'),
      fill: '#f97316'
    },
    {
      name: 'Water Content',
      value: parseFloat(data.Health.ndwi?.[latestDate] || '0'),
      fill: '#06b6d4'
    },
    {
      name: 'Organic Carbon',
      value: parseFloat(data.Health.soc?.[latestDate] || '0') * 20, // Scale up for visibility
      fill: '#8b5cf6'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-zinc-300">
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'percentage' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Advanced Field Analytics</h3>
          <p className="text-zinc-400 text-sm">
            Comprehensive data visualization and distribution analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NDVI Distribution Bar Chart */}
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <h4 className="text-lg font-semibold text-white">NDVI Distribution</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ndviData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
                stroke="#9ca3af"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Health Indices Comparison */}
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-blue-400" />
            <h4 className="text-lg font-semibold text-white">Health Indices vs Optimal</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={healthComparison} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis dataKey="index" type="category" stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#22c55e" radius={[0, 2, 2, 0]} />
              <Bar dataKey="optimal" fill="#374151" radius={[0, 2, 2, 0]} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* EVI Area Chart */}
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-lg font-semibold text-white">EVI Distribution Curve</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={eviData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
                stroke="#9ca3af"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Soil Health Pie Chart */}
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-orange-400" />
            <h4 className="text-lg font-semibold text-white">Soil Health Composition</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={soilHealthData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {soilHealthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LAI Line Chart */}
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-lime-400" />
            <h4 className="text-lg font-semibold text-white">LAI Distribution Trend</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={laiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
                stroke="#9ca3af"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#84cc16" 
                strokeWidth={3}
                dot={{ fill: '#84cc16', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Health Overview Radar Chart */}
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-purple-400" />
            <h4 className="text-lg font-semibold text-white">Health Overview Radar</h4>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Optimal"
                dataKey="optimal"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {((ndviData.reduce((sum, item) => sum + item.value, 0) / data.FieldArea) * 100).toFixed(1)}%
          </div>
          <div className="text-zinc-400 text-sm">NDVI Coverage</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {data.FieldArea.toLocaleString()}
          </div>
          <div className="text-zinc-400 text-sm">Field Area (sq.m)</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Object.keys(data.Coordinates).length}
          </div>
          <div className="text-zinc-400 text-sm">Boundary Points</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {data.hUnits}
          </div>
          <div className="text-zinc-400 text-sm">Health Units</div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFieldAnalytics;
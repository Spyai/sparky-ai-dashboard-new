import React from 'react';
import { BarChart3, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { FarmerData } from '../../lib/api';

interface FieldAnalyticsProps {
  data: FarmerData;
}

const FieldAnalytics: React.FC<FieldAnalyticsProps> = ({ data }) => {
  // Get the latest date from index breakdown
  const latestDate = Object.keys(data.IndexBreakdown)[0] || '';
  const indexData = data.IndexBreakdown[latestDate] || {};

  // Calculate distribution percentages for key indices
  const calculateDistribution = (values: string[]) => {
    const total = values.reduce((sum, val) => sum + parseInt(val), 0);
    return values.map(val => total > 0 ? (parseInt(val) / total * 100).toFixed(1) : '0');
  };

  const ndviDistribution = calculateDistribution(indexData.ndvi || []);
  const eviDistribution = calculateDistribution(indexData.evi || []);
  const laiDistribution = calculateDistribution(indexData.lai || []);

  // Index categories for better visualization
  const indexCategories = [
    'Very Low', 'Low', 'Below Average', 'Average', 'Above Average',
    'Good', 'Very Good', 'Excellent', 'Outstanding', 'Exceptional'
  ];

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

  const getColorForCategory = (index: number) => {
    const colors = [
      'bg-red-500', 'bg-red-400', 'bg-orange-500', 'bg-yellow-500', 'bg-yellow-400',
      'bg-lime-500', 'bg-green-500', 'bg-green-400', 'bg-emerald-500', 'bg-emerald-400'
    ];
    return colors[index] || 'bg-gray-500';
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <BarChart3 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Field Analytics</h3>
          <p className="text-zinc-400 text-sm">
            Distribution Analysis • {formatDate(latestDate)}
          </p>
        </div>
      </div>

      {/* Field Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300 text-sm">Field Center</span>
          </div>
          <p className="text-white font-medium">
            {data.CenterLat.toFixed(6)}°N
          </p>
          <p className="text-white font-medium">
            {data.CenterLong.toFixed(6)}°E
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className="text-zinc-300 text-sm">Order Date</span>
          </div>
          <p className="text-xl font-bold text-white">{data.OrderDate}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-300 text-sm">Payment Status</span>
          </div>
          <p className="text-xl font-bold text-green-400 capitalize">{data.Paid}</p>
        </div>
      </div>

      {/* NDVI Distribution */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">NDVI Distribution</h4>
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="grid grid-cols-10 gap-1 mb-3">
            {ndviDistribution.map((percentage, index) => (
              <div key={index} className="text-center">
                <div
                  className={`${getColorForCategory(index)} rounded-t h-20 flex items-end justify-center text-white text-xs font-medium pb-1`}
                  style={{ height: `${Math.max(20, parseFloat(percentage) * 2)}px` }}
                >
                  {parseFloat(percentage) > 5 ? `${percentage}%` : ''}
                </div>
                <div className="text-zinc-400 text-xs mt-1 transform -rotate-45 origin-top-left">
                  {indexCategories[index]}
                </div>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 text-sm">
            Vegetation health distribution across {data.FieldArea.toLocaleString()} sq.m field area
          </p>
        </div>
      </div>

      {/* EVI Distribution */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">EVI Distribution</h4>
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="grid grid-cols-10 gap-1 mb-3">
            {eviDistribution.map((percentage, index) => (
              <div key={index} className="text-center">
                <div
                  className={`${getColorForCategory(index)} rounded-t h-20 flex items-end justify-center text-white text-xs font-medium pb-1`}
                  style={{ height: `${Math.max(20, parseFloat(percentage) * 2)}px` }}
                >
                  {parseFloat(percentage) > 5 ? `${percentage}%` : ''}
                </div>
                <div className="text-zinc-400 text-xs mt-1 transform -rotate-45 origin-top-left">
                  {indexCategories[index]}
                </div>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 text-sm">
            Enhanced vegetation index with atmospheric correction
          </p>
        </div>
      </div>

      {/* LAI Distribution */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">LAI Distribution</h4>
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="grid grid-cols-10 gap-1 mb-3">
            {laiDistribution.map((percentage, index) => (
              <div key={index} className="text-center">
                <div
                  className={`${getColorForCategory(index)} rounded-t h-20 flex items-end justify-center text-white text-xs font-medium pb-1`}
                  style={{ height: `${Math.max(20, parseFloat(percentage) * 2)}px` }}
                >
                  {parseFloat(percentage) > 5 ? `${percentage}%` : ''}
                </div>
                <div className="text-zinc-400 text-xs mt-1 transform -rotate-45 origin-top-left">
                  {indexCategories[index]}
                </div>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 text-sm">
            Leaf area index showing canopy density distribution
          </p>
        </div>
      </div>

      {/* Field Coordinates */}
      <div className="bg-zinc-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Field Boundaries</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-zinc-300 font-medium mb-2">Coordinate Points</h5>
            <div className="space-y-2">
              {Object.entries(data.Coordinates).map(([key, coord]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{key}:</span>
                  <span className="text-white">
                    {coord.Latitude.toFixed(6)}°, {coord.Longitude.toFixed(6)}°
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-zinc-300 font-medium mb-2">Field Dimensions</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Max Latitude:</span>
                <span className="text-white">{data.FieldMaxLat.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Min Latitude:</span>
                <span className="text-white">{data.FieldMinLat.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Max Longitude:</span>
                <span className="text-white">{data.FieldMaxLong.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Min Longitude:</span>
                <span className="text-white">{data.FieldMinLong.toFixed(6)}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldAnalytics;
import React, { useEffect, useState, useCallback } from 'react';
import { 
  MapPin, 
  Maximize2, 
  Layers, 
  Eye, 
  Download,
  Calendar,
  Settings,
  Palette
} from 'lucide-react';
import { Farm } from '../../types';
import { getFarmerData, FarmerData } from '../../lib/api';

interface ColorizationMapProps {
  farm: Farm | null;
  className?: string;
}

// Available image types from Farmonaut API
const IMAGE_TYPES = [
  { id: 'ndvi', name: 'NDVI', description: 'Normalized Difference Vegetation Index', color: '#22c55e' },
  { id: 'ndwi', name: 'NDWI', description: 'Normalized Difference Water Index', color: '#3b82f6' },
  { id: 'evi', name: 'EVI', description: 'Enhanced Vegetation Index', color: '#10b981' },
  { id: 'ndmi', name: 'NDMI', description: 'Normalized Difference Moisture Index', color: '#06b6d4' },
  { id: 'rvi', name: 'RVI', description: 'Ratio Vegetation Index', color: '#84cc16' },
  { id: 'savi', name: 'SAVI', description: 'Soil Adjusted Vegetation Index', color: '#eab308' },
  { id: 'lai', name: 'LAI', description: 'Leaf Area Index', color: '#059669' },
  { id: 'tci', name: 'TCI', description: 'True Color Image', color: '#dc2626' },
  { id: 'hybrid', name: 'Hybrid', description: 'Hybrid Satellite Image', color: '#7c3aed' },
];

// Colormap options
const COLORMAPS = [
  { id: '1', name: 'Colormap 1', description: 'High vegetation colormap (red=low, green=high)' },
  { id: '2', name: 'Colormap 2', description: 'Small vegetation colormap (black=low, green=high)' },
];

// Hex codes for color legend (from Farmonaut docs)
const COLOR_LEGEND = [
  { range: '0.9-1.0', color: '#06653d', label: 'Excellent' },
  { range: '0.8-0.9', color: '#11a75f', label: 'Very Good' },
  { range: '0.7-0.8', color: '#81bf6c', label: 'Good' },
  { range: '0.6-0.7', color: '#bae383', label: 'Above Average' },
  { range: '0.5-0.6', color: '#e6f3a4', label: 'Average' },
  { range: '0.4-0.5', color: '#fff0b5', label: 'Below Average' },
  { range: '0.3-0.4', color: '#fbc07e', label: 'Low' },
  { range: '0.2-0.3', color: '#f7885a', label: 'Very Low' },
  { range: '0.1-0.2', color: '#ea4f3b', label: 'Poor' },
  { range: '-1.0-0.1', color: '#ab0535', label: 'Very Poor' },
];

const ColorizationMap: React.FC<ColorizationMapProps> = ({ farm, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Colorization controls
  const [selectedImageType, setSelectedImageType] = useState('ndvi');
  const [selectedColormap, setSelectedColormap] = useState('1');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Load farmer data when farm changes
  useEffect(() => {
    if (!farm?.field_id) return;

    const loadFarmerData = async () => {
      try {
        setIsLoading(true);
        const data = await getFarmerData(farm.field_id);
        setFarmerData(data);
        
        // Extract available sensed days
        const dates = Object.keys(data.SensedDays || {}).sort().reverse();
        setAvailableDates(dates);
        if (dates.length > 0 && !selectedDate) {
          setSelectedDate(dates[0]); // Select most recent date
        }
      } catch (err) {
        console.error('Error loading farmer data:', err);
        setError('Failed to load farm data');
      } finally {
        setIsLoading(false);
      }
    };

    loadFarmerData();
  }, [farm?.field_id]);

  // Load satellite image overlay
  const loadSatelliteImage = useCallback(async () => {
    if (!farm?.field_id || !selectedDate || !selectedImageType) return;

    setIsLoadingImage(true);
    try {
      // Fetch satellite image from Farmonaut API
      const response = await fetch(`https://us-central1-farmbase-b2f7e.cloudfunctions.net/getFieldImage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer fn_live_1748264194699_PjyYUjTRbH6EKHxyWhKgJFt8m0dm2lhx`,
        },
        body: JSON.stringify({
          FieldID: farm.field_id,
          ImageType: selectedImageType,
          SensedDay: selectedDate,
          ColorMap: selectedColormap,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.url) {
        setCurrentImageUrl(result.url);
        setError('');
      }
    } catch (err) {
      console.error('Error loading satellite image:', err);
      setError('Failed to load satellite image');
      setCurrentImageUrl(null);
    } finally {
      setIsLoadingImage(false);
    }
  }, [farm?.field_id, selectedDate, selectedImageType, selectedColormap]);

  // Load image when parameters change
  useEffect(() => {
    if (selectedDate && selectedImageType && farm?.field_id && farmerData) {
      loadSatelliteImage();
    }
  }, [selectedDate, selectedImageType, selectedColormap, farm?.field_id, farmerData, loadSatelliteImage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadImage = async () => {
    if (!currentImageUrl || !farm) return;

    try {
      const link = document.createElement('a');
      link.href = currentImageUrl;
      link.download = `${farm.farm_name}_${selectedImageType}_${selectedDate}.jpg`;
      link.target = '_blank';
      link.click();
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  };

  if (error && !currentImageUrl) {
    return (
      <div className={`bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 ${className}`}>
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-400 mb-2">Error</p>
          <p className="text-zinc-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Colorization Map
              </h3>
              {farm && (
                <p className="text-zinc-400 text-sm">{farm.farm_name} • {selectedImageType.toUpperCase()}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Toggle Controls"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Toggle Legend"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={downloadImage}
              disabled={!currentImageUrl || isLoadingImage}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
              title="Download Image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className="p-4 bg-zinc-800/50 border-b border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Image Type Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Layers className="w-4 h-4 inline mr-1" />
                Index Type
              </label>
              <select
                value={selectedImageType}
                onChange={(e) => setSelectedImageType(e.target.value)}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {IMAGE_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Sensing Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                disabled={availableDates.length === 0}
              >
                {availableDates.length === 0 ? (
                  <option>No dates available</option>
                ) : (
                  availableDates.map((date) => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Colormap Selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Colormap
              </label>
              <select
                value={selectedColormap}
                onChange={(e) => setSelectedColormap(e.target.value)}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {COLORMAPS.map((colormap) => (
                  <option key={colormap.id} value={colormap.id}>
                    {colormap.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Image Display Area */}
      <div className="relative">
        <div className="w-full h-96 bg-zinc-800 flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-zinc-400">Loading farm data...</p>
            </div>
          ) : isLoadingImage ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-zinc-400">Loading satellite image...</p>
            </div>
          ) : currentImageUrl ? (
            <div className="w-full h-full relative">
              <img
                src={currentImageUrl}
                alt={`${selectedImageType} satellite image`}
                className="w-full h-full object-contain"
                onError={() => setError('Failed to load image')}
              />
              {/* Overlay farm info */}
              <div className="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white font-medium">{farm?.farm_name}</p>
                <p className="text-zinc-400 text-sm">{farm?.location}</p>
              </div>
            </div>
          ) : !farm ? (
            <div className="text-center">
              <MapPin className="w-12 h-12 text-zinc-500 mx-auto mb-2" />
              <p className="text-zinc-400">Select a farm to view colorization map</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Palette className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-zinc-400">No satellite data available</p>
              <p className="text-zinc-500 text-sm">Try selecting a different date or index type</p>
            </div>
          )}
        </div>

        {/* Color Legend */}
        {showLegend && currentImageUrl && (
          <div className="absolute bottom-4 right-4 bg-zinc-900/95 backdrop-blur-sm rounded-lg p-3 max-w-xs">
            <h4 className="text-white font-medium mb-2 text-sm">
              {IMAGE_TYPES.find(t => t.id === selectedImageType)?.name} Scale
            </h4>
            <div className="space-y-1">
              {COLOR_LEGEND.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-4 h-3 rounded border border-zinc-600"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-zinc-300 min-w-0 flex-1">
                    {item.label}
                  </span>
                  <span className="text-zinc-400 text-xs">
                    {item.range}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message overlay */}
        {error && currentImageUrl && (
          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {farm && (
        <div className="p-4 bg-zinc-800 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-zinc-500">Image Type:</span>
              <span className="text-white ml-2">{selectedImageType.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-zinc-500">Date:</span>
              <span className="text-white ml-2">{formatDate(selectedDate)}</span>
            </div>
            <div>
              <span className="text-zinc-500">Colormap:</span>
              <span className="text-white ml-2">{selectedColormap}</span>
            </div>
            <div>
              <span className="text-zinc-500">Field ID:</span>
              <span className="text-white ml-2">{farm.field_id}</span>
            </div>
          </div>
          {farmerData && (
            <div className="mt-3 pt-3 border-t border-zinc-700">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500">Field Area:</span>
                  <span className="text-white ml-2">{farmerData.FieldArea.toLocaleString()} sq.m</span>
                </div>
                <div>
                  <span className="text-zinc-500">Center:</span>
                  <span className="text-white ml-2">
                    {farmerData.CenterLat.toFixed(4)}°, {farmerData.CenterLong.toFixed(4)}°
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Status:</span>
                  <span className="text-green-400 ml-2">{farmerData.Paid}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorizationMap;

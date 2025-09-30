import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Trash2 } from 'lucide-react';

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY;

interface MapBoundarySelectorProps {
  onBoundaryChange: (coordinates: number[][]) => void;
  initialCoordinates?: number[][];
}

const MapBoundarySelector: React.FC<MapBoundarySelectorProps> = ({
  onBoundaryChange,
  initialCoordinates = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: MAP_API_KEY,
          version: 'weekly',
          libraries: ['drawing', 'geometry']
        });

        await loader.load();

        if (!mapRef.current) return;

        // Initialize map
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 }, // Default to New York
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        setMap(mapInstance);

        // Initialize drawing manager
        const drawingManagerInstance = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
          },
          polygonOptions: {
            fillColor: '#22c55e',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#16a34a',
            clickable: true,
            editable: true,
            zIndex: 1,
          },
        });

        drawingManagerInstance.setMap(mapInstance);
        setDrawingManager(drawingManagerInstance);

        // Handle polygon completion
        google.maps.event.addListener(
          drawingManagerInstance,
          'polygoncomplete',
          (polygon: google.maps.Polygon) => {
            // Remove previous polygon if exists
            if (currentPolygon) {
              currentPolygon.setMap(null);
            }

            setCurrentPolygon(polygon);
            drawingManagerInstance.setDrawingMode(null);

            // Extract coordinates
            const path = polygon.getPath();
            const coordinates: number[][] = [];
            
            for (let i = 0; i < path.getLength(); i++) {
              const point = path.getAt(i);
              coordinates.push([point.lng(), point.lat()]);
            }
            
            // Close the polygon by adding the first point at the end
            if (coordinates.length > 0) {
              coordinates.push(coordinates[0]);
            }

            onBoundaryChange(coordinates);

            // Add listeners for path changes
            google.maps.event.addListener(path, 'set_at', () => {
              updateCoordinates(polygon);
            });

            google.maps.event.addListener(path, 'insert_at', () => {
              updateCoordinates(polygon);
            });

            google.maps.event.addListener(path, 'remove_at', () => {
              updateCoordinates(polygon);
            });
          }
        );

        // Load initial coordinates if provided
        if (initialCoordinates.length > 0) {
          loadInitialPolygon(mapInstance, initialCoordinates);
        }

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              mapInstance.setCenter(userLocation);
              mapInstance.setZoom(16);
            },
            (error) => {
              console.log('Geolocation error:', error);
            }
          );
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  const updateCoordinates = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const coordinates: number[][] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push([point.lng(), point.lat()]);
    }
    
    if (coordinates.length > 0) {
      coordinates.push(coordinates[0]);
    }

    onBoundaryChange(coordinates);
  };

  const loadInitialPolygon = (mapInstance: google.maps.Map, coordinates: number[][]) => {
    if (coordinates.length < 3) return;

    const path = coordinates.slice(0, -1).map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));

    const polygon = new google.maps.Polygon({
      paths: path,
      fillColor: '#22c55e',
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeColor: '#16a34a',
      clickable: true,
      editable: true,
      zIndex: 1,
    });

    polygon.setMap(mapInstance);
    setCurrentPolygon(polygon);

    // Fit map to polygon bounds
    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    mapInstance.fitBounds(bounds);
  };

  const clearPolygon = () => {
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
      onBoundaryChange([]);
    }
  };

  const startDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center border rounded-lg aspect-video bg-zinc-800 border-zinc-700">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-red-500" />
          <p className="mb-2 text-red-400">Map Loading Error</p>
          <p className="text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">Farm Boundary</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startDrawing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
          >
            <MapPin className="w-4 h-4" />
            Draw Boundary
          </button>
          {currentPolygon && (
            <button
              type="button"
              onClick={clearPolygon}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={mapRef}
          className="w-full border rounded-lg aspect-video border-zinc-700"
          style={{ minHeight: '400px' }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-800">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-green-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-zinc-400">Loading Google Maps...</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1 text-sm text-zinc-400">
        <p>• Click "Draw Boundary" to start drawing your farm boundary</p>
        <p>• Click on the map to add points, double-click to finish</p>
        <p>• Drag points to adjust the boundary after drawing</p>
        <p>• Use satellite view for better accuracy</p>
        <p>• Minimum 3 points required to create a valid boundary</p>
      </div>
    </div>
  );
};

export default MapBoundarySelector;
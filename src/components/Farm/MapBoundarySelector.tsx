import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Trash2, LocateFixed } from 'lucide-react';

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [searchMarker, setSearchMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: MAP_API_KEY,
          version: 'weekly',
          libraries: ['drawing', 'geometry', 'places'], // ✅ Added "places"
        });

        await loader.load();

        if (!mapRef.current) return;

        // Initialize map
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 },
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          // mapTypeControl: true,
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

            updateCoordinates(polygon);

            const path = polygon.getPath();
            google.maps.event.addListener(path, 'set_at', () => updateCoordinates(polygon));
            google.maps.event.addListener(path, 'insert_at', () => updateCoordinates(polygon));
            google.maps.event.addListener(path, 'remove_at', () => updateCoordinates(polygon));
          }
        );

        // Load initial polygon
        if (initialCoordinates.length > 0) {
          loadInitialPolygon(mapInstance, initialCoordinates);
        }

        // ✅ Setup search bar
        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['geometry', 'name'],
            types: ['geocode'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) return;

            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(16);

            // Place or move marker
            if (searchMarker) {
              searchMarker.setPosition(place.geometry.location);
            } else {
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: mapInstance,
              });
              setSearchMarker(marker);
            }
          });
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

  // ✅ Helper to update polygon coordinates
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

  // ✅ Load polygon from initial coordinates
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

  // ✅ Handle current location button
  const goToCurrentLocation = () => {
    if (map && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(userLocation);
          map.setZoom(16);

          if (searchMarker) {
            searchMarker.setPosition(userLocation);
          } else {
            const marker = new google.maps.Marker({
              position: userLocation,
              map,
            });
            setSearchMarker(marker);
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
          alert('Unable to fetch current location. Please enable GPS.');
        }
      );
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
      {/* Header */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
        {/* 🔎 Search bar */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search location..."
          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />

        {/* 📍 Current Location button */}
        <button
          type="button"
          onClick={goToCurrentLocation}
          className="flex items-center gap-1 px-2 py-2 text-sm text-white transition-colors bg-violet-500 rounded-lg hover:bg-violet-600"
        >
          <LocateFixed className="w-4 h-4" />
          Current Location
        </button>

        {/* ✏️ Draw polygon */}
        <button
          type="button"
          onClick={startDrawing}
          className="flex items-center gap-1 px-2 py-2 text-sm text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
        >
          <MapPin className="w-4 h-4" />
          Draw Boundary
        </button>

        {/* 🗑️ Clear polygon */}
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

      {/* Map */}
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

      {/* Instructions */}
      <div className="space-y-1 text-sm text-zinc-400">
        <p>• Search for a location or click "Current Location" to jump to your position</p>
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

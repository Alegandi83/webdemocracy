import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, useMapEvents } from 'react-leaflet';
import { MapIcon, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface HexData {
  hex_boundary: {
    type: string;
    coordinates: number[][][];
  };
  count: number;
}

interface MapConfig {
  catalog: string;
  schema: string;
  table: string;
  column: string;
  column_resolution: number;
  default_zoom: number;
  default_center: {
    lat: number;
    lng: number;
  };
}

type DatasetType = 'locations' | 'surveys';

interface DatasetConfig {
  name: string;
  catalog: string;
  schema: string;
  table: string;
  column: string;
  column_resolution: number;
}

// Color palette matching app theme (blue/purple)
const APP_COLORS = {
  primary: '#6366f1',
  light: '#818cf8',
  lighter: '#a5b4fc',
  lightest: '#c7d2fe',
};

// Create log-scaled color breaks
const createLogColorScale = (counts: number[]): number[] => {
  if (counts.length === 0) return [1, 2, 3, 4, 5, 6, 7];
  
  const positiveCounts = counts.filter(c => c > 0);
  if (positiveCounts.length === 0) return [1, 2, 3, 4, 5, 6, 7];
  
  const logMin = Math.log10(Math.min(...positiveCounts));
  const logMax = Math.log10(Math.max(...positiveCounts));
  
  const breaks: number[] = [];
  for (let i = 0; i <= 6; i++) {
    const logValue = logMin + (logMax - logMin) * (i / 6);
    breaks.push(Math.pow(10, logValue));
  }
  
  return breaks;
};

// Get color based on count and septiles - using app theme colors (blue/purple)
const getColor = (count: number, septiles: number[]): string => {
  if (count >= septiles[6]) return '#4338ca'; // Deep indigo
  if (count >= septiles[5]) return '#4f46e5'; // Indigo
  if (count >= septiles[4]) return '#6366f1'; // Primary purple
  if (count >= septiles[3]) return '#818cf8'; // Light purple
  if (count >= septiles[2]) return '#a5b4fc'; // Lighter purple
  if (count >= septiles[1]) return '#c7d2fe'; // Very light purple
  if (count >= septiles[0]) return '#e0e7ff'; // Palest purple
  return '#f5f5f5'; // Light gray for no data
};

// Legend Component
const Legend: React.FC<{ septiles: number[] }> = ({ septiles }) => {
  const legendItems = [
    { color: "#e0e7ff", label: `< ${Math.round(septiles[1])}` },
    { color: "#c7d2fe", label: `${Math.round(septiles[1])}-${Math.round(septiles[2])}` },
    { color: "#a5b4fc", label: `${Math.round(septiles[2])}-${Math.round(septiles[3])}` },
    { color: "#818cf8", label: `${Math.round(septiles[3])}-${Math.round(septiles[4])}` },
    { color: "#6366f1", label: `${Math.round(septiles[4])}-${Math.round(septiles[5])}` },
    { color: "#4f46e5", label: `${Math.round(septiles[5])}-${Math.round(septiles[6])}` },
    { color: "#4338ca", label: `≥ ${Math.round(septiles[6])}` }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: '#3A3A3A',
      padding: '8px 16px',
      borderRadius: '4px',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      zIndex: 1000,
      color: '#FFFFFF',
      fontFamily: 'Helvetica'
    }}>
      <div style={{
        marginBottom: '10px',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        Counts
      </div>
      {legendItems.map((item, index) => (
        <div key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
          <div style={{
            backgroundColor: item.color,
            width: '20px',
            height: '20px',
            border: '1px solid #000',
            marginRight: '8px'
          }} />
          <span style={{ fontSize: '12px' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Map event handler component
const MapEventHandler: React.FC<{
  onMapMove: (bounds: L.LatLngBounds, zoom: number) => void;
}> = ({ onMapMove }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onMapMove(bounds, zoom);
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onMapMove(bounds, zoom);
    }
  });

  return null;
};

const Map: React.FC = () => {
  // Dataset configurations
  const datasets: Record<DatasetType, DatasetConfig> = {
    locations: {
      name: "Analisi Geografica H3",
      catalog: "dad_open_data",
      schema: "locations",
      table: "world",
      column: "cities_h3_res_15",
      column_resolution: 15
    },
    surveys: {
      name: "Distribuzione Notizie H3",
      catalog: "dad_open_data",
      schema: "news",
      table: "eventhub_clean_ai",
      column: "ai_h3_res_15",
      column_resolution: 15
    }
  };

  const [selectedDataset, setSelectedDataset] = useState<DatasetType>('locations');
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [hexData, setHexData] = useState<HexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);
  const [septiles, setSeptiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [selectedResolution, setSelectedResolution] = useState<number>(6);

  // Load map configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/map/config');
        if (response.ok) {
          const config = await response.json();
          setMapConfig(config);
        }
      } catch (error) {
        console.error('Error loading map config:', error);
      }
    };
    loadConfig();
  }, []);

  // Load H3 data
  const loadH3Data = useCallback(async (bounds?: L.LatLngBounds, zoom?: number) => {
    const currentDataset = datasets[selectedDataset];
    
    setLoading(true);
    try {
      // Use selected resolution and current dataset
      let url = `/api/map/h3-data?resolution=${selectedResolution}`;
      url += `&catalog=${currentDataset.catalog}`;
      url += `&schema=${currentDataset.schema}`;
      url += `&table=${currentDataset.table}`;
      url += `&column=${currentDataset.column}`;
      
      if (bounds) {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        url += `&min_lat=${sw.lat}&max_lat=${ne.lat}&min_lng=${sw.lng}&max_lng=${ne.lng}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setHexData(result.data);
        
        // Calculate septiles for color scaling
        const counts = result.data.map((d: HexData) => d.count);
        const newSeptiles = createLogColorScale(counts);
        setSeptiles(newSeptiles);
      }
    } catch (error) {
      console.error('Error loading H3 data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDataset, selectedResolution]);

  // Initial data load
  useEffect(() => {
    if (mapConfig && !autoRefreshing) {
      loadH3Data();
    }
  }, [mapConfig]);

  // Reload data when resolution changes
  useEffect(() => {
    if (mapConfig) {
      if (currentBounds) {
        loadH3Data(currentBounds, currentZoom);
      } else {
        loadH3Data();
      }
    }
  }, [selectedResolution]);

  // Reload data when dataset changes
  useEffect(() => {
    if (mapConfig) {
      loadH3Data();
    }
  }, [selectedDataset]);

  // Handle map movement
  const handleMapMove = useCallback((bounds: L.LatLngBounds, zoom: number) => {
    setCurrentBounds(bounds);
    setCurrentZoom(zoom);
    
    if (autoRefreshing) {
      loadH3Data(bounds, zoom);
    }
  }, [autoRefreshing, loadH3Data]);

  // Manual refresh
  const handleRefresh = () => {
    if (currentBounds) {
      loadH3Data(currentBounds, currentZoom);
    } else {
      loadH3Data();
    }
  };

  if (!mapConfig) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Caricamento configurazione mappa...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Title, Buttons, and Table Name on Same Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '1.5rem'
      }}>
        {/* Title */}
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          color: '#0f172a',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          whiteSpace: 'nowrap'
        }}>
          <MapIcon size={32} style={{ color: '#6366f1' }} />
          Analisi Geospaziale
        </h1>
        
        {/* Dataset Selection Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flex: '0 0 auto' }}>
          <button
            onClick={() => {
              setSelectedDataset('locations');
              setSelectedResolution(6); // Default resolution for locations
              setHexData([]);
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedDataset === 'locations' ? '#6366f1' : 'white',
              color: selectedDataset === 'locations' ? 'white' : '#475569',
              border: selectedDataset === 'locations' ? 'none' : '2px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {datasets.locations.name}
          </button>
          <button
            onClick={() => {
              setSelectedDataset('surveys');
              setSelectedResolution(5); // Default resolution for surveys
              setHexData([]);
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedDataset === 'surveys' ? '#6366f1' : 'white',
              color: selectedDataset === 'surveys' ? 'white' : '#475569',
              border: selectedDataset === 'surveys' ? 'none' : '2px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {datasets.surveys.name}
          </button>
        </div>

        {/* Table Name */}
        <p style={{ 
          color: '#64748b', 
          fontSize: '0.875rem',
          margin: 0,
          fontWeight: '500',
          textAlign: 'right',
          flex: '0 0 auto'
        }}>
          {datasets[selectedDataset].catalog}.{datasets[selectedDataset].schema}.{datasets[selectedDataset].table}
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#475569'
        }}>
          <label htmlFor="resolution-select" style={{ fontWeight: '600' }}>
            Resolution:
          </label>
          <select
            id="resolution-select"
            value={selectedResolution}
            onChange={(e) => setSelectedResolution(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map(res => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: loading ? '#94a3b8' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Caricamento...' : 'Aggiorna Mappa'}
        </button>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          <input
            type="checkbox"
            checked={autoRefreshing}
            onChange={(e) => setAutoRefreshing(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Auto-refresh on pan/zoom
        </label>

        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#475569'
        }}>
          Zoom: {currentZoom} | Hexagons: {hexData.length.toLocaleString()}
        </div>
      </div>

      {/* Map Container */}
      <div style={{ position: 'relative', height: '70vh', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <MapContainer
          center={[mapConfig.default_center.lat, mapConfig.default_center.lng]}
          zoom={mapConfig.default_zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          <MapEventHandler onMapMove={handleMapMove} />
          
          {hexData.map((hex, index) => {
            const coords = hex.hex_boundary.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number]);
            const color = getColor(hex.count, septiles);
            
            return (
              <Polygon
                key={index}
                positions={coords}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.7,
                  color: color,
                  weight: 1,
                  opacity: 0.9
                }}
              >
                {/* Optional: Add tooltip */}
              </Polygon>
            );
          })}
        </MapContainer>
        
        <Legend septiles={septiles} />
      </div>

      {/* Statistics */}
      <div style={{ marginTop: '1.5rem' }} className="card">
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '1rem'
        }}>
          Statistiche
        </h2>
                    <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Tabella</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>{datasets[selectedDataset].table}</div>
                    </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Colonna H3</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>{datasets[selectedDataset].column}</div>
                  </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Risoluzione Nativa</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>{datasets[selectedDataset].column_resolution}</div>
                    </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Esagoni Visualizzati</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>{hexData.length.toLocaleString()}</div>
              </div>
        </div>
      </div>

      {/* Spin animation for refresh button */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Map;

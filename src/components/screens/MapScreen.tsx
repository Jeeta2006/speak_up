import React, { useEffect, useRef, useState } from 'react';
import { Report, Sector, ToastType } from '../../types';

declare const L: typeof import('leaflet');

interface MapScreenProps {
  reports: Report[];
  isActive: boolean;
  showToast?: (msg: string, type?: ToastType) => void;
}

const SECTOR_COLORS: Record<Sector, string> = {
  Education: '#3D9BFF',
  Healthcare: '#00C97A',
  'BBMP/Infra': '#FFB800',
  'Police/Other': '#FF2D2D',
};

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1000;
    const incrementTime = Math.max(duration / end, 20);

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
};

const MapScreen: React.FC<MapScreenProps> = ({
  reports,
  isActive,
  showToast,
}) => {
  const [heatmapMode, setHeatmapMode] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (isActive && !mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([12.9716, 77.5946], 11);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const tiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors',
        }
      ).addTo(map);

      tiles.on('load', () => {
        const layers = mapContainerRef.current?.querySelectorAll('.leaflet-layer');
        layers?.forEach((layer) => {
          (layer as HTMLElement).style.filter =
            'brightness(0.4) saturate(0.7) hue-rotate(180deg)';
        });
      });

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    if (isActive && mapRef.current) {
      const timeoutId = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isActive]);

  // Cleanup Map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    reports.forEach((report) => {
      const color = SECTOR_COLORS[report.sector] || '#FFFFFF';

      if (heatmapMode) {
        L.circleMarker([report.lat, report.lng], {
          radius: 25,
          color: 'transparent',
          fillColor: color,
          fillOpacity: 0.35,
        }).addTo(markersLayerRef.current!);
      } else {
        const iconHtml = `<div style="
          width: 14px; 
          height: 14px; 
          background: ${color}; 
          border: 2px solid white; 
          border-radius: 50%; 
          box-shadow: 0 0 10px ${color};
        "></div>`;

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        L.marker([report.lat, report.lng], { icon })
          .bindPopup(
            `<strong>${report.sector}</strong><br/>${report.ward}<br/><small>${report.id}</small>`
          )
          .addTo(markersLayerRef.current!);
      }
    });
  }, [reports, heatmapMode]);

  const toggleHeatmap = () => {
    const newMode = !heatmapMode;
    setHeatmapMode(newMode);
    if (showToast) {
      showToast(`Heatmap mode ${newMode ? 'ON' : 'OFF'}`, 'success');
    }
  };

  const getStats = (): Record<Sector, number> => {
    const stats: Record<Sector, number> = {
      Education: 0,
      Healthcare: 0,
      'BBMP/Infra': 0,
      'Police/Other': 0,
    };
    reports.forEach((r) => {
      if (stats[r.sector] !== undefined) {
        stats[r.sector]++;
      }
    });
    return stats;
  };

  const stats = getStats();

  return (
    <div className={`screen ${isActive ? 'active' : ''}`}>
      <div className="screen-inner" style={{ maxWidth: '1000px' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="screen-title" style={{ marginBottom: 0 }}>
            <span className="screen-title-icon">🗺️</span> Corruption Map
          </h2>
          <div className="flex items-center gap-2 text-sm" style={{ fontWeight: 700, color: 'var(--muted-lt)' }}>
            <span id="heatmap-label" style={{ opacity: heatmapMode ? 0.4 : 1 }}>Markers</span>
            <div className={`toggle-switch ${heatmapMode ? 'active' : ''}`} onClick={toggleHeatmap} id="map-toggle"></div>
            <span id="heatmap-label-2" style={{ opacity: heatmapMode ? 1 : 0.4 }}>Heatmap</span>
          </div>
        </div>

        <div id="map-container" ref={mapContainerRef}></div>

        <div className="map-stats">
          <div className="map-stat-card" style={{ borderTop: '3px solid var(--blue)' }}>
            <h3 className="counter"><AnimatedCounter value={stats['Education'] || 0} /></h3>
            <p>Education</p>
          </div>
          <div className="map-stat-card" style={{ borderTop: '3px solid var(--green)' }}>
            <h3 className="counter"><AnimatedCounter value={stats['Healthcare'] || 0} /></h3>
            <p>Healthcare</p>
          </div>
          <div className="map-stat-card" style={{ borderTop: '3px solid var(--amber)' }}>
            <h3 className="counter"><AnimatedCounter value={stats['BBMP/Infra'] || 0} /></h3>
            <p>Infra / BBMP</p>
          </div>
          <div className="map-stat-card" style={{ borderTop: '3px solid var(--red)' }}>
            <h3 className="counter"><AnimatedCounter value={stats['Police/Other'] || 0} /></h3>
            <p>Police</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;

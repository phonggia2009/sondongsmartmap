import { memo, useEffect } from 'react';
import {
  MapContainer, TileLayer, GeoJSON, LayersControl,
  useMapEvents, useMap,
} from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import type { Village } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useGeoJSONLayers } from '@/hooks/useGeoJSONLayers';
import { MapOverlayStats } from './MapOverlayStats';
import { SchoolsLayer } from './SchoolsLayer';
import { HealthStationsLayer } from './HealthStationsLayer';
import { VillageBoundariesLayer } from './VillageBoundariesLayer';
import { VillageLabelsLayer } from './VillageLabelsLayer';
import L from 'leaflet';
import iconUrl        from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl  from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl      from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon paths with Vite bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// ============================================================
//  MapViewer Component
//  Center panel — Leaflet map with all layers.
// ============================================================

interface MapViewerProps {
  selectedVillage: Village | null;
}

// Handler: fly/zoom to selected village polygon or label point
function VillageFlyToHandler({
  selectedVillage,
  ranhGioiThonData,
  thonNhanTenData,
}: {
  selectedVillage: Village | null;
  ranhGioiThonData: any;
  thonNhanTenData: any;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedVillage) {
      map.flyTo([21.037, 105.703], 14, { duration: 1.2 });
      return;
    }

    // Try finding boundary polygon feature
    if (ranhGioiThonData?.features) {
      const feature = ranhGioiThonData.features.find(
        (f: any) => f.properties?.village_id === selectedVillage.id
      );
      if (feature) {
        const bounds = L.geoJSON(feature).getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [60, 60],
            maxZoom: 16,
            duration: 1.2,
          });
          return;
        }
      }
    }

    // Fallback to label point feature
    if (thonNhanTenData?.features) {
      const labelFeature = thonNhanTenData.features.find(
        (f: any) => f.properties?.village_id === selectedVillage.id
      );
      if (labelFeature?.geometry?.type === 'Point') {
        const [lng, lat] = labelFeature.geometry.coordinates;
        map.flyTo([lat, lng], 15.5, { duration: 1.2 });
      }
    }
  }, [selectedVillage, ranhGioiThonData, thonNhanTenData, map]);

  return null;
}

// Handler: automatically invalidate Leaflet map size.
function MapResizeHandler() {
  const map = useMap();
  const { sidebarOpen } = useAppContext();

  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [sidebarOpen, map]);

  useEffect(() => {
    let rafId: number;
    const handleWindowResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => map.invalidateSize());
    };
    window.addEventListener('resize', handleWindowResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [map]);

  useEffect(() => {
    const container = map.getContainer();
    if (!container || typeof ResizeObserver === 'undefined') return;

    let rafId: number;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => map.invalidateSize());
    });
    ro.observe(container);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [map]);

  return null;
}

// Click handler: deselect items when clicking empty map area
function MapClickHandler({
  onDeselectAll,
}: {
  onDeselectAll: () => void;
}) {
  useMapEvents({
    click: (e: any) => {
      if (!e.originalEvent._stopped) {
        onDeselectAll();
      }
    },
  });
  return null;
}

export const MapViewer = memo(function MapViewer({ selectedVillage }: MapViewerProps) {
  const {
    selectVillage,
    selectSchool,
    selectHealthStation,
    activeSidebarTab,
    isDark,
  } = useAppContext();

  const isSchoolMode        = activeSidebarTab === 'schools';
  const isHealthStationMode = activeSidebarTab === 'healthStations';
  const isVillageMode       = activeSidebarTab === 'villages';

  const { ranhGioiXaData, ranhGioiThonData, thonNhanTenData } = useGeoJSONLayers();

  return (
    <div className={`relative flex-1 flex flex-col overflow-hidden ${isDark ? 'bg-gov-950' : 'bg-gray-100'}`}>

      {/* Mode overlay indicator */}
      <AnimatePresence>
        {isSchoolMode && (
          <motion.div
            key="school-mode-badge"
            className="absolute top-4 right-14 z-[400] pointer-events-none"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold
              backdrop-blur-md border shadow-lg
              ${isDark
                ? 'bg-green-900/60 text-green-300 border-green-700/40'
                : 'bg-green-50/90 text-green-700 border-green-200/60'
              }
            `}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              🏫 Chế độ xem trường học
            </div>
          </motion.div>
        )}

        {isHealthStationMode && (
          <motion.div
            key="health-mode-badge"
            className="absolute top-4 right-14 z-[400] pointer-events-none"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold
              backdrop-blur-md border shadow-lg
              ${isDark
                ? 'bg-red-900/60 text-red-300 border-red-700/40'
                : 'bg-red-50/90 text-red-700 border-red-200/60'
              }
            `}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              🏥 Chế độ xem trạm y tế
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapContainer
        center={[21.037, 105.703]}
        zoom={14}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Bản đồ mặc định (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ vệ tinh (Esri)">
            <TileLayer
              attribution='&copy; <a href="https://server.arcgisonline.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ sáng (CartoDB)" checked>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ tối (CartoDB)">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Schools layer — displayed in School mode */}
        {isSchoolMode && <SchoolsLayer />}

        {/* Health Stations layer — displayed in Health Station mode */}
        {isHealthStationMode && <HealthStationsLayer />}

        {/* Commune boundary — always visible */}
        {ranhGioiXaData && (
          <GeoJSON
            data={ranhGioiXaData}
            style={{
              color: '#eab308',
              weight: 3,
              opacity: 1,
              fillColor: 'transparent',
              fillOpacity: 0,
              className: 'animate-marching-ants',
            }}
          />
        )}

        {/* Village boundaries — visible only in Village mode */}
        {isVillageMode && ranhGioiThonData && (
          <VillageBoundariesLayer
            data={ranhGioiThonData}
            selectedVillage={selectedVillage}
            isSchoolMode={false}
          />
        )}

        {/* Village name labels — visible only in Village mode */}
        {isVillageMode && thonNhanTenData && (
          <VillageLabelsLayer
            data={thonNhanTenData}
            selectedVillage={selectedVillage}
            isSchoolMode={false}
          />
        )}

        <VillageFlyToHandler
          selectedVillage={selectedVillage}
          ranhGioiThonData={ranhGioiThonData}
          thonNhanTenData={thonNhanTenData}
        />

        <MapResizeHandler />

        <MapClickHandler
          onDeselectAll={() => {
            selectVillage(null);
            selectSchool(null);
            selectHealthStation(null);
          }}
        />
      </MapContainer>

      {/* Floating stats overlay */}
      <MapOverlayStats />

      {/* Edge gradients for depth */}
      <div className="absolute top-0 left-0 right-0 h-6 map-edge-top pointer-events-none z-[399]" />
      <div className="absolute bottom-0 left-0 right-0 h-10 map-edge-bottom pointer-events-none z-[399]" />

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-[400]
        ${isDark
          ? 'bg-gradient-to-r from-transparent via-accent-600/30 to-transparent'
          : 'bg-gradient-to-r from-transparent via-gov-400/20 to-transparent'
        }
      `} />
    </div>
  );
});

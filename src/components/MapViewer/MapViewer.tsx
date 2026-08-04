import { memo, useEffect } from 'react';
import {
  MapContainer, TileLayer, GeoJSON, LayersControl,
  useMapEvents, useMap, ZoomControl,
} from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import type { Village } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useGeoJSONLayers } from '@/hooks/useGeoJSONLayers';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MapOverlayStats } from './MapOverlayStats';
import { SchoolsLayer } from './SchoolsLayer';
import { HealthStationsLayer } from './HealthStationsLayer';
import { RelicsLayer } from './RelicsLayer';
import { GovUnitsLayer } from './GovUnitsLayer';
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
  const { activeSidebarTab } = useAppContext();

  useEffect(() => {
    // Only execute flyTo for villages when in Village mode
    if (activeSidebarTab !== 'villages') return;

    if (!selectedVillage) {
      map.flyTo([21.037, 105.703], 14, { duration: 1.0 });
      return;
    }

    // 1. Try finding boundary polygon feature
    if (ranhGioiThonData?.features) {
      const cleanName = selectedVillage.name.toLowerCase().replace(/^thôn\s+/, '').trim();
      const feature = ranhGioiThonData.features.find(
        (f: any) =>
          f.properties?.village_id === selectedVillage.id ||
          f.properties?.village_id === selectedVillage.geojson_boundary_index ||
          (f.properties?.village_name &&
            f.properties.village_name.toLowerCase().includes(cleanName)) ||
          (f.properties?.ten_thon &&
            f.properties.ten_thon.toLowerCase().includes(cleanName))
      );
      if (feature) {
        const bounds = L.geoJSON(feature).getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [45, 45],
            maxZoom: 16,
            duration: 1.0,
          });
          return;
        }
      }
    }

    // 2. Fallback to label point feature
    if (thonNhanTenData?.features) {
      const cleanName = selectedVillage.name.toLowerCase().replace(/^thôn\s+/, '').trim();
      const labelFeature = thonNhanTenData.features.find(
        (f: any) =>
          f.properties?.village_id === selectedVillage.id ||
          f.properties?.village_id === selectedVillage.geojson_label_index ||
          (f.properties?.name && f.properties.name.toLowerCase().includes(cleanName))
      );
      if (labelFeature?.geometry?.type === 'Point') {
        const [lng, lat] = labelFeature.geometry.coordinates;
        map.flyTo([lat, lng], 15.5, { duration: 1.0 });
        return;
      }
    }

    // 3. Fallback to village coordinates
    if (selectedVillage.coordinates) {
      map.flyTo([selectedVillage.coordinates.lat, selectedVillage.coordinates.lng], 15.5, { duration: 1.0 });
    }
  }, [selectedVillage, activeSidebarTab, ranhGioiThonData, thonNhanTenData, map]);

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
    selectRelic,
    activeSidebarTab,
    isDark,
  } = useAppContext();
  const isMobile = useIsMobile();

  const isSchoolMode        = activeSidebarTab === 'schools';
  const isHealthStationMode = activeSidebarTab === 'healthStations';
  const isRelicMode         = activeSidebarTab === 'relics';
  const isGovUnitMode       = activeSidebarTab === 'govUnits';
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

        {isRelicMode && (
          <motion.div
            key="relic-mode-badge"
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
                ? 'bg-purple-900/60 text-purple-300 border-purple-700/40'
                : 'bg-purple-50/90 text-purple-700 border-purple-200/60'
              }
            `}>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              🏛️ Chế độ xem di tích lịch sử
            </div>
          </motion.div>
        )}

        {isGovUnitMode && (
          <motion.div
            key="gov-unit-mode-badge"
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
                ? 'bg-indigo-900/60 text-indigo-300 border-indigo-700/40'
                : 'bg-indigo-50/90 text-indigo-700 border-indigo-200/60'
              }
            `}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              🏢 Chế độ xem Đơn vị HCSN
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapContainer
        center={[21.037, 105.703]}
        zoom={14}
        maxZoom={20}
        minZoom={10}
        className={`w-full h-full z-0 ${isDark ? 'bg-gov-950' : 'bg-gray-100'}`}
        zoomControl={false}
      >
        <ZoomControl position={isMobile ? 'topleft' : 'bottomleft'} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Bản đồ mặc định (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxNativeZoom={18}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ vệ tinh (Esri)">
            <TileLayer
              attribution='&copy; <a href="https://server.arcgisonline.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={18}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ sáng (CartoDB)" checked={!isDark}>
            <TileLayer
              key={`tile-light-${!isDark}`}
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              maxNativeZoom={18}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ tối (CartoDB)" checked={isDark}>
            <TileLayer
              key={`tile-dark-${isDark}`}
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxNativeZoom={18}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Schools layer — displayed in School mode */}
        {isSchoolMode && <SchoolsLayer />}

        {/* Health Stations layer — displayed in Health Station mode */}
        {isHealthStationMode && <HealthStationsLayer />}

        {/* Relics layer — displayed in Relics mode */}
        {isRelicMode && <RelicsLayer />}

        {/* Administrative & Public Service Units layer */}
        {isGovUnitMode && <GovUnitsLayer />}

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
            selectRelic(null);
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

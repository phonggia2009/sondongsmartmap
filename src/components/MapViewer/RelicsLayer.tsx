import { memo, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import useSupercluster from 'use-supercluster';
import L from 'leaflet';
import { useAppContext } from '@/context/AppContext';
import { useRelics } from '@/hooks/useRelics';
import { getRelicColor, getRelicEmoji } from '@/utils/relicUtils';
import type { Relic } from '@/types';
import { Navigation } from 'lucide-react';

// ============================================================
//  RelicMarkerItem — Memoized marker component
// ============================================================

interface RelicMarkerItemProps {
  relic: Relic;
  isSelected: boolean;
  isHovered: boolean;
  isDark: boolean;
  onSelect: (relic: Relic) => void;
  onHover: (id: string | null) => void;
  registerRef: (id: string, instance: L.Marker | null) => void;
}

const RelicMarkerItem = memo(function RelicMarkerItem({
  relic,
  isSelected,
  isHovered,
  isDark,
  onSelect,
  onHover,
  registerRef,
}: RelicMarkerItemProps) {
  const elevated   = isHovered || isSelected;
  const color      = getRelicColor(relic.type);
  const emoji      = getRelicEmoji(relic.type);
  const isNational = relic.rank === 'Quốc Gia';

  const icon = useMemo(() => {
    const markerHtml = `<div style="
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%, -50%) ${elevated ? 'scale(1.15)' : 'scale(1)'};
      display: flex; align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.98);
      border: 2.5px solid ${color};
      padding: 4px 10px;
      border-radius: 9999px;
      box-shadow: ${
        elevated
          ? `0 8px 20px -2px ${color}55, 0 0 0 3px ${color}33`
          : '0 3px 8px rgba(0,0,0,0.15)'
      };
      font-family: 'Be Vietnam Pro', sans-serif;
      font-weight: 700; font-size: 11px; color: #1e1b4b;
      white-space: nowrap; cursor: pointer;
      transition: all 0.2s ease;
      z-index: ${elevated ? 1000 : 1};
    ">
      <span style="font-size:14px; line-height:1;">${emoji}</span>
      <span>${relic.name}</span>
      ${isNational ? `<span style="background:#fef3c7; color:#b45309; padding:1px 4px; border-radius:4px; font-size:9px;">QG</span>` : ''}
    </div>`;

    return L.divIcon({
      html: markerHtml,
      className: 'relic-custom-marker',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }, [elevated, color, emoji, relic.name, isNational]);

  const handleRef = useCallback((ref: L.Marker | null) => {
    registerRef(relic.id, ref);
    if (ref && isSelected) {
      setTimeout(() => {
        try {
          ref.openPopup();
        } catch {}
      }, 50);
    }
  }, [relic.id, isSelected, registerRef]);

  return (
    <Marker
      position={[relic.lat, relic.lng]}
      ref={handleRef}
      icon={icon}
      eventHandlers={{
        click: e => {
          L.DomEvent.stopPropagation(e.originalEvent);
          onSelect(relic);
        },
        mouseover: () => onHover(relic.id),
        mouseout:  () => onHover(null),
      }}
    >
      {isSelected && (
        <Popup autoPan={false} className="relic-popup" offset={[0, -10]}>
          <div className="p-3 max-w-[280px]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">{emoji}</span>
              <div className="min-w-0 flex-1">
                <h4 className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {relic.name}
                </h4>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{relic.type}</span>
              </div>
            </div>

            <div className={`space-y-1.5 pt-2 border-t text-xs ${isDark ? 'border-gov-800' : 'border-gray-100'}`}>
              {/* Rank badge */}
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Cấp xếp hạng:</span>
                <span
                  className={`
                    px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                    ${isNational
                      ? isDark ? 'bg-amber-900/50 text-amber-300 border border-amber-700/60' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      : isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700/60' : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }
                  `}
                >
                  {relic.rank}
                </span>
              </div>

              {/* Village */}
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Địa bàn thôn/xã:</span>
                <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{relic.village}</span>
              </div>

              {/* Decision number */}
              {relic.decisionNo && (
                <div className={`mt-1 p-2 rounded-lg border text-[11px] leading-normal ${
                  isDark ? 'bg-purple-950/60 border-purple-800/40 text-purple-200' : 'bg-purple-50/60 border-purple-100 text-purple-900'
                }`}>
                  <div className={`font-bold mb-0.5 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Số quyết định xếp hạng:</div>
                  <div>{relic.decisionNo}</div>
                </div>
              )}

              {/* Directions button */}
              <button
                className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${relic.lat},${relic.lng}`,
                    '_blank'
                  );
                }}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ đường</span>
              </button>
            </div>
          </div>
        </Popup>
      )}
    </Marker>
  );
});

// ============================================================
//  RelicsLayer
//  Renders historical relic markers with clustering on Leaflet.
// ============================================================

export function RelicsLayer() {
  const map = useMap();
  const { relicFilters, relicSearchQuery, selectedRelic, selectRelic, isDark } = useAppContext();
  const { relics } = useRelics();

  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [zoom, setZoom]     = useState(map.getZoom());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  const registerRef = useCallback((id: string, instance: L.Marker | null) => {
    if (instance) {
      markerRefs.current.set(id, instance);
    } else {
      markerRefs.current.delete(id);
    }
  }, []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  // ── Map state sync ─────────────────────────────────────────
  const updateMapState = useCallback(() => {
    const b = map.getBounds();
    setBounds([
      b.getSouthWest().lng, b.getSouthWest().lat,
      b.getNorthEast().lng, b.getNorthEast().lat,
    ]);
    setZoom(map.getZoom());
  }, [map]);

  useMapEvents({ moveend: updateMapState, zoomend: updateMapState });
  useEffect(() => { updateMapState(); }, [updateMapState]);

  // ── FlyTo and auto open popup when selectedRelic changes ──────
  useEffect(() => {
    if (!selectedRelic) return;

    // Fly to relic coordinates
    map.flyTo([selectedRelic.lat, selectedRelic.lng], 17, { duration: 0.8 });

    // Open popup after flyTo animation completes
    const timer = setTimeout(() => {
      const marker = markerRefs.current.get(selectedRelic.id);
      if (marker) {
        try {
          marker.openPopup();
        } catch {
          // ignore if map unmounted
        }
      }
    }, 850);

    return () => clearTimeout(timer);
  }, [selectedRelic, map]);

  // ── Filter by active filters & search query ────────────────
  const filteredRelics = useMemo(
    () =>
      relics.filter(r => {
        // Always include selected relic even if search/filters would exclude it
        if (selectedRelic?.id === r.id) return true;
        if (!relicFilters[r.type]) return false;
        if (relicSearchQuery.trim()) {
          const q = relicSearchQuery.toLowerCase().trim();
          return (
            r.name.toLowerCase().includes(q) ||
            r.village.toLowerCase().includes(q) ||
            r.decisionNo.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [relics, relicFilters, relicSearchQuery, selectedRelic]
  );

  // ── Convert to GeoJSON points for supercluster ─────────────
  const points = useMemo(
    () =>
      filteredRelics.map(relic => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          relicId: relic.id,
          name: relic.name,
          type: relic.type,
          rank: relic.rank,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [relic.lng, relic.lat],
        },
      })),
    [filteredRelics]
  );

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 45, maxZoom: 16 },
  });

  return (
    <>
      {clusters.map(cluster => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = cluster.properties;

        // Render cluster marker
        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[latitude, longitude]}
              icon={L.divIcon({
                html: `<div style="
                  width: 36px; height: 36px;
                  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
                  color: white; border-radius: 9999px;
                  display: flex; align-items: center; justify-content: center;
                  font-weight: 800; font-size: 13px;
                  box-shadow: 0 4px 12px rgba(126, 34, 206, 0.4), 0 0 0 2px white;
                  border: 2px solid white;
                  cursor: pointer;
                ">${pointCount}</div>`,
                className: 'custom-cluster-icon',
                iconSize: [36, 36],
                iconAnchor: [18, 18],
              })}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id as number),
                    18
                  );
                  map.flyTo([latitude, longitude], expansionZoom, { duration: 0.6 });
                },
              }}
            />
          );
        }

        // Render individual relic marker
        const relic = filteredRelics.find(r => r.id === cluster.properties.relicId);
        if (!relic) return null;

        return (
          <RelicMarkerItem
            key={relic.id}
            relic={relic}
            isSelected={selectedRelic?.id === relic.id}
            isHovered={hoveredId === relic.id}
            isDark={isDark}
            onSelect={selectRelic}
            onHover={handleHover}
            registerRef={registerRef}
          />
        );
      })}
    </>
  );
}


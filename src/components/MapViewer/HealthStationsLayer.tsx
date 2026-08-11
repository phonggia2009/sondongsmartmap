import { memo, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '@/context/AppContext';
import { useHealthStations } from '@/hooks/useHealthStations';
import type { HealthStation } from '@/types';
import { trackGetDirections } from '@/utils/analytics';

// ============================================================
//  HealthStationMarkerItem — Memoized marker component
// ============================================================

interface HealthStationMarkerItemProps {
  station: HealthStation;
  isSelected: boolean;
  isHovered: boolean;
  isDark: boolean;
  onSelect: (station: HealthStation) => void;
  onHover: (id: string | null) => void;
  registerRef: (id: string, instance: L.Marker | null) => void;
}

const HealthStationMarkerItem = memo(function HealthStationMarkerItem({
  station,
  isSelected,
  isHovered,
  isDark,
  onSelect,
  onHover,
  registerRef,
}: HealthStationMarkerItemProps) {
  const elevated = isHovered || isSelected;
  const color = '#ef4444'; // Medical Red

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
          ? `0 8px 20px -2px rgba(239,68,68,0.3), 0 0 0 3px ${color}33`
          : '0 3px 8px rgba(0,0,0,0.15)'
      };
      font-family: 'Be Vietnam Pro', sans-serif;
      font-weight: 700; font-size: 11px; color: #b91c1c;
      white-space: nowrap; cursor: pointer;
      transition: all 0.2s ease;
      z-index: ${elevated ? 1000 : 1};
    ">
      <span style="font-size:14px; line-height:1;">🏥</span>
      <span>${station.name}</span>
    </div>`;

    return L.divIcon({
      html: markerHtml,
      className: 'bg-transparent border-0 shadow-none',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }, [elevated, station.name]);

  const handleRef = useCallback((instance: L.Marker | null) => {
    registerRef(station.id, instance);
    if (instance && isSelected) {
      setTimeout(() => {
        try {
          instance.openPopup();
        } catch {}
      }, 50);
    }
  }, [station.id, isSelected, registerRef]);

  return (
    <Marker
      position={[station.lat, station.lng]}
      ref={handleRef}
      icon={icon}
      eventHandlers={{
        mouseover: () => onHover(station.id),
        mouseout: () => onHover(null),
        click: () => onSelect(station),
      }}
    >
      {isSelected && (
        <Popup autoPan={false} closeButton={false} className="school-popup">
          <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", minWidth: '220px' }}>
            {/* Category badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: isDark ? '#451a1a' : '#fee2e2',
                color: isDark ? '#fca5a5' : '#dc2626',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              <span>🏥</span>
              <span>Trạm Y Tế</span>
            </div>

            {/* Station name */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: isDark ? '#f8fafc' : '#111827',
                lineHeight: 1.4,
                marginBottom: '8px',
              }}
            >
              {station.name}
            </div>

            {/* Doctor Info */}
            {station.doctor && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: isDark ? '#cbd5e1' : '#374151',
                  fontWeight: 600,
                  marginBottom: '6px',
                  background: isDark ? '#1e293b' : '#f9fafb',
                  padding: '6px 8px',
                  borderRadius: '6px',
                }}
              >
                <span>👨‍⚕️</span>
                <span>{station.doctor}</span>
              </div>
            )}

            {/* Phone Info */}
            {station.phone && (
              <div style={{ marginBottom: '10px' }}>
                <a
                  href={`tel:${station.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: isDark ? '#fca5a5' : '#dc2626',
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: isDark ? '#451a1a' : '#fef2f2',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    width: '100%',
                    justifyContent: 'center',
                    border: isDark ? '1px solid #7f1d1d' : '1px solid #fecaca',
                  }}
                >
                  <span>📞</span>
                  <span>Gọi: {station.phone}</span>
                </a>
              </div>
            )}

            {/* Directions button */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                width: '100%',
                background: 'linear-gradient(135deg, #ef444422, #ef444411)',
                color: '#dc2626',
                border: '1.5px solid #ef444444',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={e => {
                e.stopPropagation();
                trackGetDirections(station.name, 'Trạm Y tế');
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`,
                  '_blank'
                );
              }}
            >
              <span>📍</span>
              <span>Chỉ đường</span>
            </button>
          </div>
        </Popup>
      )}
    </Marker>
  );
});

// ============================================================
//  HealthStationsLayer
//  Renders health station markers & interactive popups on the map.
// ============================================================

export function HealthStationsLayer() {
  const map = useMap();
  const {
    healthStationFilters,
    healthStationSearchQuery,
    selectedHealthStation,
    selectHealthStation,
    isDark,
  } = useAppContext();
  const { healthStations } = useHealthStations();

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

  // ── FlyTo and auto open popup when selectedHealthStation changes ──────
  useEffect(() => {
    if (!selectedHealthStation) return;
    map.flyTo([selectedHealthStation.lat, selectedHealthStation.lng], 17, { duration: 0.8 });

    const timer = setTimeout(() => {
      const marker = markerRefs.current.get(selectedHealthStation.id);
      if (marker) {
        try {
          marker.openPopup();
        } catch {}
      }
    }, 850);

    return () => clearTimeout(timer);
  }, [selectedHealthStation, map]);

  // ── Filter health stations by active filters & search query ────
  const filteredStations = useMemo(
    () =>
      healthStations.filter(s => {
        if (selectedHealthStation?.id === s.id) return true;
        if (!healthStationFilters['Trạm y tế']) return false;
        if (healthStationSearchQuery.trim()) {
          const q = healthStationSearchQuery.toLowerCase().trim();
          return (
            s.name.toLowerCase().includes(q) ||
            (s.doctor && s.doctor.toLowerCase().includes(q)) ||
            (s.phone && s.phone.includes(q))
          );
        }
        return true;
      }),
    [healthStations, healthStationFilters, healthStationSearchQuery, selectedHealthStation]
  );

  return (
    <>
      {filteredStations.map(station => (
        <HealthStationMarkerItem
          key={station.id}
          station={station}
          isSelected={selectedHealthStation?.id === station.id}
          isHovered={hoveredId === station.id}
          isDark={isDark}
          onSelect={selectHealthStation}
          onHover={handleHover}
          registerRef={registerRef}
        />
      ))}
    </>
  );
}


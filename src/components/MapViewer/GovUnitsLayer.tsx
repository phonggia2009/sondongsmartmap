import { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useGovUnits } from '@/hooks/useGovUnits';
import { getGovUnitCategoryColor, getGovUnitCategoryEmoji } from '@/utils/govUnitUtils';
import type { GovUnit } from '@/types';

// ============================================================
//  GovUnitMarkerItem — Memoized marker component
// ============================================================

interface GovUnitMarkerItemProps {
  unit: GovUnit;
  isSelected: boolean;
  isHovered: boolean;
  isDark: boolean;
  onSelect: (unit: GovUnit) => void;
  onHover: (id: string | null) => void;
  registerRef: (id: string, instance: L.Marker | null) => void;
}

const GovUnitMarkerItem = memo(function GovUnitMarkerItem({
  unit,
  isSelected,
  isHovered,
  isDark,
  onSelect,
  onHover,
  registerRef,
}: GovUnitMarkerItemProps) {
  const elevated = isHovered || isSelected;
  const color = getGovUnitCategoryColor(unit.category);
  const emoji = getGovUnitCategoryEmoji(unit.category);

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
      font-weight: 700; font-size: 11px; color: ${color};
      white-space: nowrap; cursor: pointer;
      transition: all 0.2s ease;
      z-index: ${elevated ? 1000 : 1};
    ">
      <span style="font-size:14px; line-height:1;">${emoji}</span>
      <span>${unit.name}</span>
    </div>`;

    return L.divIcon({
      html: markerHtml,
      className: 'bg-transparent border-0 shadow-none',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }, [elevated, color, emoji, unit.name]);

  const handleRef = useCallback((instance: L.Marker | null) => {
    registerRef(unit.id, instance);
    if (instance && isSelected) {
      setTimeout(() => {
        try {
          instance.openPopup();
        } catch {}
      }, 50);
    }
  }, [unit.id, isSelected, registerRef]);

  return (
    <Marker
      position={[unit.lat, unit.lng]}
      ref={handleRef}
      icon={icon}
      eventHandlers={{
        mouseover: () => onHover(unit.id),
        mouseout: () => onHover(null),
        click: () => onSelect(unit),
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
                background: isDark ? `${color}22` : `${color}15`,
                color,
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                marginBottom: '8px',
                border: `1px solid ${color}44`,
              }}
            >
              <span>{emoji}</span>
              <span>{unit.category}</span>
            </div>

            {/* Unit name */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: isDark ? '#f8fafc' : '#111827',
                lineHeight: 1.4,
                marginBottom: '8px',
              }}
            >
              {unit.name}
            </div>

            {/* Address */}
            {unit.address && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: isDark ? '#cbd5e1' : '#374151',
                  fontWeight: 500,
                  marginBottom: '10px',
                  background: isDark ? '#1e293b' : '#f9fafb',
                  padding: '6px 8px',
                  borderRadius: '6px',
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{unit.address}</span>
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
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${unit.lat},${unit.lng}`,
                  '_blank'
                );
              }}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Chỉ đường</span>
            </button>
          </div>
        </Popup>
      )}
    </Marker>
  );
});

// ============================================================
//  GovUnitsLayer Component
//  Renders markers and popups for administrative & public service units on Leaflet map.
// ============================================================

export function GovUnitsLayer() {
  const map = useMap();
  const {
    govUnitFilters,
    govUnitSearchQuery,
    selectedGovUnit,
    selectGovUnit,
    isDark,
  } = useAppContext();
  const { govUnits } = useGovUnits();

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

  // FlyTo and auto open popup when selectedGovUnit changes
  useEffect(() => {
    if (!selectedGovUnit) return;
    map.flyTo([selectedGovUnit.lat, selectedGovUnit.lng], 17, { duration: 0.8 });

    const timer = setTimeout(() => {
      const marker = markerRefs.current.get(selectedGovUnit.id);
      if (marker) {
        try {
          marker.openPopup();
        } catch {}
      }
    }, 850);

    return () => clearTimeout(timer);
  }, [selectedGovUnit, map]);

  // Filter units
  const filteredUnits = useMemo(
    () =>
      govUnits.filter(unit => {
        if (selectedGovUnit?.id === unit.id) return true;
        if (!govUnitFilters[unit.category]) return false;
        if (govUnitSearchQuery.trim()) {
          const q = govUnitSearchQuery.toLowerCase().trim();
          return (
            unit.name.toLowerCase().includes(q) ||
            unit.category.toLowerCase().includes(q) ||
            (unit.address && unit.address.toLowerCase().includes(q))
          );
        }
        return true;
      }),
    [govUnits, govUnitFilters, govUnitSearchQuery, selectedGovUnit]
  );

  return (
    <>
      {filteredUnits.map(unit => (
        <GovUnitMarkerItem
          key={unit.id}
          unit={unit}
          isSelected={selectedGovUnit?.id === unit.id}
          isHovered={hoveredId === unit.id}
          isDark={isDark}
          onSelect={selectGovUnit}
          onHover={handleHover}
          registerRef={registerRef}
        />
      ))}
    </>
  );
}


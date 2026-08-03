import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import useSupercluster from 'use-supercluster';
import L from 'leaflet';
import { useAppContext } from '@/context/AppContext';
import { useSchools } from '@/hooks/useSchools';
import { getLevelColor, getLevelBgColor, getLevelEmoji } from '@/utils/schoolUtils';
import type { SchoolLevel } from '@/types';

// ============================================================
//  SchoolsLayer
//  Renders school markers with clustering on the Leaflet map.
// ============================================================

export function SchoolsLayer() {
  const map = useMap();
  const { schoolFilters, schoolSearchQuery, selectedSchool, selectSchool } = useAppContext();
  const { schools } = useSchools();

  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [zoom, setZoom]     = useState(map.getZoom());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Ref map: schoolId → Leaflet marker instance, used to auto-open popup after flyTo
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

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

  // ── FlyTo and auto open popup when selectedSchool changes ──
  useEffect(() => {
    if (!selectedSchool) return;
    map.flyTo([selectedSchool.lat, selectedSchool.lng], 17.5, { duration: 0.8 });

    const timer = setTimeout(() => {
      const marker = markerRefs.current.get(selectedSchool.id);
      if (marker) {
        try {
          marker.openPopup();
        } catch {}
      }
    }, 850);

    return () => clearTimeout(timer);
  }, [selectedSchool, map]);

  // ── Filter by sidebar checkboxes & search query ────────────
  const filteredSchools = useMemo(
    () => schools.filter(s => {
      if (selectedSchool?.id === s.id) return true;
      if (!schoolFilters[s.level]) return false;
      if (schoolSearchQuery.trim()) {
        return s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase().trim());
      }
      return true;
    }),
    [schools, schoolFilters, schoolSearchQuery, selectedSchool],
  );

  // ── Convert to GeoJSON points for supercluster ─────────────
  const points = useMemo(() =>
    filteredSchools.map(school => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        schoolId: school.id,
        name:     school.name,
        level:    school.level,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [school.lng, school.lat],
      },
    })),
    [filteredSchools],
  );

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 60, maxZoom: 16 },
  });

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const {
          cluster: isCluster,
          point_count: pointCount,
          schoolId, name, level,
        } = cluster.properties;

        // ── Cluster marker ─────────────────────────────────
        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[latitude, longitude]}
              icon={L.divIcon({
                html: `<div style="
                  position: absolute;
                  left: 50%; top: 50%;
                  transform: translate(-50%, -50%);
                  display: flex; align-items: center; gap: 5px;
                  background: white;
                  border: 2.5px solid #1e3a8a;
                  border-radius: 9999px;
                  padding: 5px 12px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  font-family: 'Be Vietnam Pro', sans-serif;
                  font-weight: 700; font-size: 13px; color: #1e3a8a;
                  white-space: nowrap; cursor: pointer;
                  transition: transform 0.2s, box-shadow 0.2s;
                "
                onmouseover="this.style.transform='translate(-50%,-50%) scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)';"
                onmouseout="this.style.transform='translate(-50%,-50%) scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
                  <span style="font-size:15px; line-height:1;">🏫</span>
                  <span>${pointCount}</span>
                </div>`,
                className: 'bg-transparent border-0 shadow-none',
                iconSize:   [0, 0],
                iconAnchor: [0, 0],
              })}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id as number), 18,
                  );
                  map.setView([latitude, longitude], expansionZoom, { animate: true });
                },
              }}
            />
          );
        }

        // ── Individual school marker ───────────────────────
        const isSelected = selectedSchool?.id === schoolId;
        const isHovered  = hoveredId === schoolId;
        const showLabel  = zoom >= 15 || isHovered || isSelected;
        const color      = getLevelColor(level as SchoolLevel);
        const emoji      = getLevelEmoji(level as SchoolLevel);
        const elevated   = isHovered || isSelected;

        const markerHtml = `<div style="
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%) ${elevated ? 'scale(1.15)' : 'scale(1)'};
          display: flex; align-items: center;
          gap: ${showLabel ? '6px' : '0'};
          background: rgba(255,255,255,0.97);
          border: 2.5px solid ${color};
          padding: ${showLabel ? '4px 10px' : '6px 8px'};
          border-radius: 9999px;
          box-shadow: ${elevated
            ? `0 8px 20px -2px rgba(0,0,0,0.2), 0 0 0 3px ${color}33`
            : '0 3px 8px rgba(0,0,0,0.12)'};
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 700; font-size: 11px; color: ${color};
          white-space: nowrap; cursor: pointer;
          transition: all 0.2s ease;
          z-index: ${elevated ? 1000 : 1};
        ">
          <span style="font-size:${showLabel ? '13px' : '15px'}; line-height:1;">${emoji}</span>
          ${showLabel ? `<span>${name}</span>` : ''}
        </div>`;

        return (
          <Marker
            key={`school-${schoolId}`}
            position={[latitude, longitude]}
            ref={(markerInstance) => {
              if (markerInstance) {
                markerRefs.current.set(schoolId, markerInstance);
                if (isSelected) {
                  setTimeout(() => {
                    try {
                      markerInstance.openPopup();
                    } catch {}
                  }, 50);
                }
              } else {
                markerRefs.current.delete(schoolId);
              }
            }}
            icon={L.divIcon({
              html: markerHtml,
              className: 'bg-transparent border-0 shadow-none',
              iconSize:   [0, 0],
              iconAnchor: [0, 0],
            })}
            eventHandlers={{
              mouseover: () => setHoveredId(schoolId),
              mouseout:  () => setHoveredId(null),
              click: () => {
                const school = schools.find(s => s.id === schoolId);
                if (school) selectSchool(school);
              },
            }}
          >

            {isSelected && (
              <Popup
                autoPan={false}
                closeButton={false}
                className="school-popup"
              >
                <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", minWidth: '180px' }}>
                  {/* Level badge */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: getLevelBgColor(level as SchoolLevel),
                    color, borderRadius: '6px', padding: '3px 8px',
                    fontSize: '11px', fontWeight: 700, marginBottom: '8px',
                  }}>
                    <span>{getLevelEmoji(level as SchoolLevel)}</span>
                    <span>{level}</span>
                  </div>

                  {/* School name */}
                  <div style={{
                    fontSize: '13px', fontWeight: 700,
                    color: '#111827', lineHeight: 1.4, marginBottom: '10px',
                  }}>
                    {name}
                  </div>

                  {/* Directions button */}
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '5px', width: '100%',
                      background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                      color, border: `1.5px solid ${color}44`,
                      borderRadius: '8px', padding: '7px 12px',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={e => {
                      (e.target as HTMLElement).style.background = `${color}22`;
                    }}
                    onMouseOut={e => {
                      (e.target as HTMLElement).style.background = `linear-gradient(135deg, ${color}22, ${color}11)`;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
                        '_blank',
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
      })}
    </>
  );
}

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '@/context/AppContext';
import { useHealthStations } from '@/hooks/useHealthStations';

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
  } = useAppContext();
  const { healthStations } = useHealthStations();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  // ── FlyTo + auto-open popup when selectedHealthStation changes ────
  useEffect(() => {
    if (!selectedHealthStation) return;

    map.flyTo([selectedHealthStation.lat, selectedHealthStation.lng], 17, { duration: 1.2 });

    const openPopup = () => {
      const marker = markerRefs.current.get(selectedHealthStation.id);
      if (marker && (marker as any)._popup) {
        marker.openPopup();
      } else {
        setTimeout(() => {
          const m = markerRefs.current.get(selectedHealthStation.id);
          if (m && (m as any)._popup) m.openPopup();
        }, 100);
      }
    };

    map.once('moveend', openPopup);
    return () => {
      map.off('moveend', openPopup);
    };
  }, [selectedHealthStation, map]);

  // ── Filter health stations by active filters & search query ────
  const filteredStations = useMemo(
    () =>
      healthStations.filter(s => {
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
    [healthStations, healthStationFilters, healthStationSearchQuery]
  );

  return (
    <>
      {filteredStations.map(station => {
        const isSelected = selectedHealthStation?.id === station.id;
        const isHovered = hoveredId === station.id;
        const elevated = isHovered || isSelected;
        const color = '#ef4444'; // Medical Red

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

        return (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            ref={instance => {
              if (instance) {
                markerRefs.current.set(station.id, instance);
              } else {
                markerRefs.current.delete(station.id);
              }
            }}
            icon={L.divIcon({
              html: markerHtml,
              className: 'bg-transparent border-0 shadow-none',
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            })}
            eventHandlers={{
              mouseover: () => setHoveredId(station.id),
              mouseout: () => setHoveredId(null),
              click: () => {
                selectHealthStation(station);
              },
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
                      background: '#fee2e2',
                      color: '#dc2626',
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
                      color: '#111827',
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
                        color: '#374151',
                        fontWeight: 600,
                        marginBottom: '6px',
                        background: '#f9fafb',
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
                          color: '#dc2626',
                          fontWeight: 700,
                          textDecoration: 'none',
                          background: '#fef2f2',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          width: '100%',
                          justifyContent: 'center',
                          border: '1px solid #fecaca',
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
      })}
    </>
  );
}

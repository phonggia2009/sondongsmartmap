import { memo, useRef, useEffect, useCallback } from 'react';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '@/context/useAppContext';
import { useVillages } from '@/hooks/useVillages';
import type { Village } from '@/types';

// ============================================================
//  VillageBoundariesLayer
//  Renders village polygon boundaries from GeoJSON.
//  Extracted from MapViewer for isolated re-renders.
// ============================================================

interface Props {
  data: any;
  selectedVillage: Village | null;
  isSchoolMode: boolean;
}

export const VillageBoundariesLayer = memo(function VillageBoundariesLayer({
  data,
  selectedVillage,
  isSchoolMode,
}: Props) {
  const { selectVillage } = useAppContext();
  const { villages } = useVillages();
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const isFeatureSelected = useCallback((feature: any) => {
    if (!selectedVillage) return false;
    if (selectedVillage.id === feature.properties?.village_id) return true;
    if (selectedVillage.geojson_boundary_index === feature.properties?.village_id) return true;
    const cleanName = selectedVillage.name.toLowerCase().replace(/^thôn\s+/, '').trim();
    if (feature.properties?.village_name && feature.properties.village_name.toLowerCase().includes(cleanName)) return true;
    if (feature.properties?.ten_thon && feature.properties.ten_thon.toLowerCase().includes(cleanName)) return true;
    return false;
  }, [selectedVillage]);

  const styleFeature = useCallback((feature: any) => {
    const isSelected  = isFeatureSelected(feature);
    const hasSelection = !!selectedVillage;

    // School mode — faded, non-interactive appearance
    if (isSchoolMode) {
      return {
        color: 'white',
        weight: 1,
        opacity: 0.15,
        fillColor: '#9ca3af',
        fillOpacity: 0.04,
        dashArray: '',
        className: 'transition-all duration-300',
      };
    }

    // Dimmed unselected village when another is selected
    if (hasSelection && !isSelected) {
      return {
        color: '#ef4444',
        weight: 2,
        opacity: 0.6,
        fillColor: '#fecaca',
        fillOpacity: 0.2,
        dashArray: '4, 4',
        className: 'transition-all duration-300',
      };
    }

    return {
      color: isSelected ? '#facc15' : 'white',
      weight: isSelected ? 4 : 2,
      opacity: 1,
      fillColor: isSelected ? '#eab308' : '#dc2626',
      fillOpacity: isSelected ? 0.7 : 0.4,
      dashArray: '',
      className: isSelected
        ? 'animate-pulse-glow transition-all duration-300'
        : 'transition-all duration-300',
    };
  }, [isFeatureSelected, selectedVillage, isSchoolMode]);

  // Dynamic style update without destroying/recreating Leaflet GeoJSON layer
  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.eachLayer((layer: any) => {
      if (layer.feature) {
        layer.setStyle(styleFeature(layer.feature));
        if (isFeatureSelected(layer.feature)) {
          layer.bringToFront();
        }
      }
    });
  }, [selectedVillage, isSchoolMode, styleFeature, isFeatureSelected]);

  const onEachFeature = useCallback((feature: any, layer: any) => {
    if (isSchoolMode) return;

    const matchedVillage = villages.find((v: Village) =>
      v.id === feature.properties?.village_id ||
      v.geojson_boundary_index === feature.properties?.village_id ||
      (feature.properties?.village_name && v.name.toLowerCase().includes(feature.properties.village_name.toLowerCase().replace(/^thôn\s+/, '').trim()))
    );

    // Tooltip
    if (matchedVillage) {
      layer.bindTooltip(
        `<div style="font-weight:700;font-size:13px;margin-bottom:2px">${matchedVillage.name}</div>
         <div style="font-size:11px;color:#6b7280">Diện tích: ${matchedVillage.area}</div>`,
        { sticky: true, direction: 'auto', className: 'custom-polygon-tooltip' },
      );
    }

    layer.on({
      mouseover: (e: any) => {
        const isSelected = isFeatureSelected(feature);
        e.target.setStyle({
          fillColor: isSelected ? '#eab308' : '#ef4444',
          fillOpacity: isSelected ? 0.8 : 0.5,
          weight: isSelected ? 4 : 3,
        });
        e.target.bringToFront();
      },
      mouseout: (e: any) => {
        e.target.setStyle(styleFeature(feature));
      },
      click: (e: any) => {
        if (isSchoolMode) return;
        e.originalEvent._stopped = true;
        if (matchedVillage) {
          selectVillage(matchedVillage);
        }
      },
    });
  }, [isSchoolMode, villages, isFeatureSelected, styleFeature, selectVillage]);

  return (
    <GeoJSON
      key={`boundaries-layer-static`}
      ref={geoJsonRef}
      data={data}
      interactive={!isSchoolMode}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
});


import { memo } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useAppContext } from '@/context/AppContext';
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

  const styleFeature = (feature: any) => {
    const isSelected  = selectedVillage?.id === feature.properties.village_id;
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
  };

  const onEachFeature = (feature: any, layer: any) => {
    if (isSchoolMode) return;

    const isSelected  = selectedVillage?.id === feature.properties.village_id;
    const hasSelection = !!selectedVillage;
    const matchedVillage = villages.find((v: Village) => v.id === feature.properties.village_id);

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
        e.target.setStyle({
          fillColor: isSelected ? '#eab308' : '#ef4444',
          fillOpacity: isSelected ? 0.8 : 0.5,
          weight: isSelected ? 4 : 3,
        });
        e.target.bringToFront();
      },
      mouseout: (e: any) => {
        const target = e.target;
        if (hasSelection && !isSelected) {
          target.setStyle({ color: '#ef4444', weight: 2, opacity: 0.6, fillColor: '#fecaca', fillOpacity: 0.2, dashArray: '4, 4' });
        } else {
          target.setStyle({
            color: isSelected ? '#facc15' : 'white',
            weight: isSelected ? 4 : 2,
            opacity: 1,
            fillColor: isSelected ? '#eab308' : '#dc2626',
            fillOpacity: isSelected ? 0.7 : 0.4,
            dashArray: '',
          });
        }
      },
      click: (e: any) => {
        if (isSchoolMode) return;
        e.originalEvent._stopped = true;
        const villageId = feature.properties?.village_id;
        if (villageId !== undefined) {
          const v = villages.find((v: Village) => v.id === villageId);
          if (v) selectVillage(v);
        }
      },
    });
  };

  return (
    <GeoJSON
      key={`boundaries-${selectedVillage?.id ?? 'none'}-${isSchoolMode}`}
      data={data}
      interactive={!isSchoolMode}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
});

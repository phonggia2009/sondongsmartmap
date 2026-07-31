import { memo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '@/context/AppContext';
import { useVillages } from '@/hooks/useVillages';
import type { Village } from '@/types';

// ============================================================
//  VillageLabelsLayer
//  Renders floating text labels for each village on the map.
//  Extracted from MapViewer to isolate re-renders.
// ============================================================

interface Props {
  data: any;
  selectedVillage: Village | null;
  isSchoolMode: boolean;
}

export const VillageLabelsLayer = memo(function VillageLabelsLayer({
  data,
  selectedVillage,
  isSchoolMode,
}: Props) {
  const { selectVillage } = useAppContext();
  const { villages } = useVillages();

  if (!data?.features) return null;

  return (
    <>
      {data.features.map((feature: any, index: number) => {
        if (feature.geometry?.type !== 'Point') return null;

        const [lng, lat]  = feature.geometry.coordinates;
        const name        = feature.properties.ten_thon;
        const villageId   = feature.properties.village_id;
        const isSelected  = selectedVillage?.id === villageId;

        const html = `<div style="
          text-align: center;
          text-shadow: 1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff, 0 1px 3px rgba(0,0,0,0.4);
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 800;
          font-size: ${isSelected ? '14px' : '11px'};
          color: ${isSelected ? '#eab308' : '#374151'};
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: ${isSchoolMode ? '0.25' : '1'};
          pointer-events: ${isSchoolMode ? 'none' : 'auto'};
          transition: all 0.35s ease;
        ">${name}</div>`;

        return (
          <Marker
            key={`label-${index}`}
            position={[lat, lng]}
            interactive={!isSchoolMode}
            icon={L.divIcon({
              html,
              className: 'bg-transparent border-0 shadow-none',
              iconSize:   [100, 30],
              iconAnchor: [50, 15],
            })}
            eventHandlers={{
              click: () => {
                if (isSchoolMode || villageId === undefined) return;
                const v = villages.find((v: Village) => v.id === villageId);
                if (v) selectVillage(v);
              },
            }}
          />
        );
      })}
    </>
  );
});

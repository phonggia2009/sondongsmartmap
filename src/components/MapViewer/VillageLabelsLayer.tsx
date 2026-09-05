import { memo, useMemo, useCallback } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '@/context/useAppContext';
import { useVillages } from '@/hooks/useVillages';
import type { Village } from '@/types';

// ============================================================
//  VillageLabelItem — Memoized marker for individual label
// ============================================================

interface LabelItemProps {
  lat: number;
  lng: number;
  name: string;
  villageId: number;
  isSelected: boolean;
  isSchoolMode: boolean;
  onSelect: (village: Village) => void;
  villages: Village[];
}

const VillageLabelItem = memo(function VillageLabelItem({
  lat,
  lng,
  name,
  villageId,
  isSelected,
  isSchoolMode,
  onSelect,
  villages,
}: LabelItemProps) {
  const icon = useMemo(() => {
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

    return L.divIcon({
      html,
      className: 'bg-transparent border-0 shadow-none',
      iconSize: [100, 30],
      iconAnchor: [50, 15],
    });
  }, [name, isSelected, isSchoolMode]);

  const handleClick = useCallback(() => {
    if (isSchoolMode || villageId === undefined) return;
    const v = villages.find((v: Village) => v.id === villageId);
    if (v) onSelect(v);
  }, [isSchoolMode, villageId, villages, onSelect]);

  return (
    <Marker
      position={[lat, lng]}
      interactive={!isSchoolMode}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    />
  );
});

// ============================================================
//  VillageLabelsLayer
//  Renders floating text labels for each village on the map.
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

        const [lng, lat] = feature.geometry.coordinates;
        const name = feature.properties.ten_thon;
        const villageId = feature.properties.village_id;
        const isSelected = selectedVillage?.id === villageId;

        return (
          <VillageLabelItem
            key={`label-${villageId ?? index}`}
            lat={lat}
            lng={lng}
            name={name}
            villageId={villageId}
            isSelected={isSelected}
            isSchoolMode={isSchoolMode}
            onSelect={selectVillage}
            villages={villages}
          />
        );
      })}
    </>
  );
});


import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import useSupercluster from 'use-supercluster';
import L from 'leaflet';

export type BBox = [number, number, number, number];

export interface IdentifiableCoordinateItem {
  id: string;
  lat: number;
  lng: number;
}

// ============================================================
//  useMapMarkerSync
//  Handles marker reference tracking, hover states, and
//  automatic flyTo + popup opening when an item is selected.
// ============================================================

export function useMapMarkerSync<T extends IdentifiableCoordinateItem>(
  selectedItem: T | null | undefined,
  flyToZoom = 17
) {
  const map = useMap();
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

  // FlyTo & open popup when selectedItem changes
  useEffect(() => {
    if (!selectedItem) return;
    map.flyTo([selectedItem.lat, selectedItem.lng], flyToZoom, { duration: 0.8 });

    const timer = setTimeout(() => {
      const marker = markerRefs.current.get(selectedItem.id);
      if (marker) {
        try {
          marker.openPopup();
        } catch {
          // ignore if map instance unmounted
        }
      }
    }, 850);

    return () => clearTimeout(timer);
  }, [selectedItem, map, flyToZoom]);

  return {
    map,
    hoveredId,
    setHoveredId,
    handleHover,
    registerRef,
    markerRefs,
  };
}

// ============================================================
//  useClusterLayer
//  Generic hook encapsulating Supercluster calculations,
//  viewport bounding box tracking, zoom levels, and cluster clicks.
// ============================================================

export interface UseClusterLayerOptions<T extends IdentifiableCoordinateItem, P extends Record<string, unknown> = Record<string, unknown>> {
  items: T[];
  selectedItem?: T | null;
  getProperties?: (item: T) => P;
  flyToZoom?: number;
  clusterRadius?: number;
  clusterMaxZoom?: number;
}

export function useClusterLayer<T extends IdentifiableCoordinateItem, P extends Record<string, unknown> = Record<string, unknown>>({
  items,
  selectedItem,
  getProperties,
  flyToZoom = 17,
  clusterRadius = 50,
  clusterMaxZoom = 16,
}: UseClusterLayerOptions<T, P>) {
  const { map, hoveredId, setHoveredId, handleHover, registerRef, markerRefs } =
    useMapMarkerSync(selectedItem, flyToZoom);

  const [bounds, setBounds] = useState<BBox | undefined>(undefined);
  const [zoom, setZoom] = useState(map.getZoom());

  // ── Sync viewport bounds & zoom level ─────────────────────
  const updateMapState = useCallback(() => {
    const b = map.getBounds();
    setBounds([
      b.getSouthWest().lng,
      b.getSouthWest().lat,
      b.getNorthEast().lng,
      b.getNorthEast().lat,
    ]);
    setZoom(map.getZoom());
  }, [map]);

  useMapEvents({
    moveend: updateMapState,
    zoomend: updateMapState,
  });

  useEffect(() => {
    updateMapState();
  }, [updateMapState]);

  // ── Fast O(1) item lookup by ID ───────────────────────────
  const itemsMap = useMemo(() => {
    const mapObj = new Map<string, T>();
    items.forEach(item => mapObj.set(item.id, item));
    return mapObj;
  }, [items]);

  // ── Convert to GeoJSON Points for Supercluster ────────────
  const points = useMemo(
    () =>
      items.map(item => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          itemId: item.id,
          ...(getProperties ? getProperties(item) : {}),
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [item.lng, item.lat] as [number, number],
        },
      })),
    [items, getProperties]
  );

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: {
      radius: clusterRadius,
      maxZoom: clusterMaxZoom,
    },
  });

  // ── Zoom in on cluster click ──────────────────────────────
  const handleClusterClick = useCallback(
    (clusterId: number, coordinates: [number, number], maxExpansionZoom = 18) => {
      if (!supercluster) return;
      const expansionZoom = Math.min(
        supercluster.getClusterExpansionZoom(clusterId),
        maxExpansionZoom
      );
      const [lng, lat] = coordinates;
      map.setView([lat, lng], expansionZoom, { animate: true });
    },
    [supercluster, map]
  );

  return {
    map,
    zoom,
    bounds,
    hoveredId,
    setHoveredId,
    handleHover,
    registerRef,
    markerRefs,
    clusters,
    supercluster,
    itemsMap,
    handleClusterClick,
  };
}

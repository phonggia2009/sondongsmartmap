import type { Village, School, HealthStation } from '@/types';
import {
  getDataUrl,
  getSchoolsGeoJsonUrl,
  getHealthStationsGeoJsonUrl,
  getCommuneBoundaryGeoJsonUrl,
  getVillageBoundariesGeoJsonUrl,
  getVillageLabelsGeoJsonUrl,
} from '@/config';
import { parseSchoolLevel } from '@/utils/schoolUtils';

// ============================================================
//  DATA SERVICE
//  All data fetching goes through this service layer.
//  Replace with API calls when backend is available.
// ============================================================

/**
 * Fetches and validates village data from the JSON file.
 * Throws a descriptive error if the data is missing or malformed.
 */
export async function fetchVillages(): Promise<Village[]> {
  const url = getDataUrl();

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      `Không thể kết nối đến dữ liệu. Vui lòng kiểm tra tệp ${url} tồn tại.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Tải dữ liệu thất bại (HTTP ${response.status}). ` +
      `Kiểm tra tệp ${url} có tồn tại và hợp lệ.`
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      'Tệp dữ liệu JSON không hợp lệ. Vui lòng kiểm tra định dạng JSON.'
    );
  }

  if (!Array.isArray(data)) {
    throw new Error(
      'Định dạng dữ liệu không đúng. Tệp JSON phải là một mảng (array).'
    );
  }

  // Validate & sanitize each village record
  return data.map((item: unknown, index: number) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Bản ghi thôn số ${index + 1} không hợp lệ.`);
    }
    const raw = item as Record<string, unknown>;

    // Required field validation
    if (typeof raw.id !== 'number')
      throw new Error(`Thôn số ${index + 1}: Trường "id" phải là số.`);
    if (typeof raw.name !== 'string' || !raw.name)
      throw new Error(`Thôn số ${index + 1}: Trường "name" bắt buộc.`);

    return {
      id: raw.id as number,
      name: (raw.name as string) || `Thôn ${index + 1}`,
      image: typeof raw.image === 'string' ? raw.image : '',
      area: typeof raw.area === 'string' ? raw.area : 'N/A',
      partyMembers: typeof raw.partyMembers === 'number' ? raw.partyMembers : 0,
      households: typeof raw.households === 'number' ? raw.households : undefined,
      population: typeof raw.population === 'number' ? raw.population : undefined,
      north: typeof raw.north === 'string' ? raw.north : '',
      south: typeof raw.south === 'string' ? raw.south : '',
      east: typeof raw.east === 'string' ? raw.east : '',
      west: typeof raw.west === 'string' ? raw.west : '',
      landmarks: Array.isArray(raw.landmarks)
        ? (raw.landmarks as unknown[]).filter((l): l is string => typeof l === 'string')
        : [],
      description: typeof raw.description === 'string' ? raw.description : '',
      coordinates: raw.coordinates as Village['coordinates'],
      polygon: raw.polygon as Village['polygon'],
    } satisfies Village;
  });
}

/**
 * Fetches and parses school GeoJSON data.
 */
export async function fetchSchools(): Promise<School[]> {
  const url = getSchoolsGeoJsonUrl();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu trường học (HTTP ${response.status})`);
  }
  const data = await response.json();

  const parsed: School[] = [];
  if (Array.isArray(data.features)) {
    data.features.forEach((feature: any, index: number) => {
      if (feature.geometry?.type === 'Point') {
        const name =
          feature.properties?.commune_name ||
          feature.properties?.name ||
          'Trường học';
        parsed.push({
          id: `school-${index}`,
          name,
          level: parseSchoolLevel(name),
          lng: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
        });
      }
    });
  }
  return parsed;
}

/**
 * Fetches and parses health stations GeoJSON data.
 */
export async function fetchHealthStations(): Promise<HealthStation[]> {
  const url = getHealthStationsGeoJsonUrl();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu trạm y tế (HTTP ${response.status})`);
  }
  const data = await response.json();

  const parsed: HealthStation[] = [];
  if (Array.isArray(data.features)) {
    data.features.forEach((feature: any, index: number) => {
      if (feature.geometry?.type === 'Point') {
        const name =
          feature.properties?.commune_name ||
          feature.properties?.name ||
          'Trạm y tế';
        parsed.push({
          id: `health-station-${index}`,
          name,
          doctor: feature.properties?.doctor || '',
          phone: feature.properties?.phone || '',
          lng: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
        });
      }
    });
  }
  return parsed;
}

export interface GeoJSONLayersData {
  ranhGioiXa: any;
  ranhGioiThon: any;
  thonNhanTen: any;
}

/**
 * Fetches map GeoJSON layers (commune boundary, village boundaries, village label points).
 */
export async function fetchGeoJSONLayers(): Promise<GeoJSONLayersData> {
  const [xa, thon, ten] = await Promise.all([
    fetch(getCommuneBoundaryGeoJsonUrl()).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(getVillageBoundariesGeoJsonUrl()).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(getVillageLabelsGeoJsonUrl()).then(r => r.ok ? r.json() : null).catch(() => null),
  ]);

  return {
    ranhGioiXa: xa,
    ranhGioiThon: thon,
    thonNhanTen: ten,
  };
}

/**
 * Preloads a village image and returns success/failure.
 * Used to warm up the image cache before presentation transitions.
 */
export async function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

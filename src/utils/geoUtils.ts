import { SpeedCamera } from '../data/cameras';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Haversine distance in meters
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate compass bearing in degrees (0-360)
export function calculateBearing(coord1: Coordinates, coord2: Coordinates): number {
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export interface CameraProximityResult {
  camera: SpeedCamera;
  distanceMeters: number;
  timeToCameraSeconds: number | null;
  alertLevel: 'none' | 'info' | 'warning' | 'danger';
  isOverspeeding: boolean;
  speedDelta: number; // currentSpeed - speedLimit
}

export function evaluateNearestCamera(
  currentPos: Coordinates,
  currentSpeedKmH: number,
  cameras: SpeedCamera[]
): CameraProximityResult | null {
  if (cameras.length === 0) return null;

  let nearestCam: SpeedCamera | null = null;
  let minDistance = Infinity;

  for (const cam of cameras) {
    const dist = calculateDistanceMeters(currentPos, cam.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCam = cam;
    }
  }

  if (!nearestCam) return null;

  const speedDelta = currentSpeedKmH - nearestCam.speedLimit;
  const isOverspeeding = speedDelta > 0;

  // Convert speed to m/s to get estimated time
  const speedMetersPerSec = (currentSpeedKmH * 1000) / 3600;
  const timeToCameraSeconds =
    speedMetersPerSec > 2 ? Math.round(minDistance / speedMetersPerSec) : null;

  let alertLevel: 'none' | 'info' | 'warning' | 'danger' = 'none';

  if (minDistance <= 1200) {
    if (minDistance <= 350) {
      alertLevel = isOverspeeding ? 'danger' : 'warning';
    } else if (minDistance <= 700) {
      alertLevel = isOverspeeding ? 'warning' : 'info';
    } else {
      alertLevel = 'info';
    }
  }

  return {
    camera: nearestCam,
    distanceMeters: Math.round(minDistance),
    timeToCameraSeconds,
    alertLevel,
    isOverspeeding,
    speedDelta: Math.round(speedDelta)
  };
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

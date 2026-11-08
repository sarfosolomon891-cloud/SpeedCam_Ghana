import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
  Polyline
} from '@vis.gl/react-google-maps';
import {
  Camera,
  Radio,
  ShieldAlert,
  Gauge,
  Shield,
  AlertTriangle,
  Navigation,
  Crosshair,
  Layers,
  Key,
  Compass,
  Volume2
} from 'lucide-react';
import { SpeedCamera, CameraType } from '../data/cameras';

interface SpeedCamMapProps {
  cameras: SpeedCamera[];
  userLocation: { lat: number; lng: number };
  userBearing: number;
  userSpeed: number;
  selectedRouteWaypoints: { lat: number; lng: number }[];
  selectedCamera: SpeedCamera | null;
  onSelectCamera: (cam: SpeedCamera | null) => void;
  apiKey: string;
  onUpdateApiKey: (key: string) => void;
  followVehicle: boolean;
  onToggleFollowVehicle: () => void;
}

// Custom camera marker icon helper
function getMarkerBadge(type: CameraType, speedLimit: number) {
  let bgColor = '#ef4444'; // Red
  let icon = <Camera className="w-3.5 h-3.5 text-white" />;

  switch (type) {
    case 'mobile_radar':
      bgColor = '#f59e0b'; // Amber
      icon = <Radio className="w-3.5 h-3.5 text-slate-950" />;
      break;
    case 'red_light':
      bgColor = '#a855f7'; // Purple
      icon = <ShieldAlert className="w-3.5 h-3.5 text-white" />;
      break;
    case 'average_speed':
      bgColor = '#06b6d4'; // Cyan
      icon = <Gauge className="w-3.5 h-3.5 text-slate-950" />;
      break;
    case 'police_checkpoint':
      bgColor = '#3b82f6'; // Blue
      icon = <Shield className="w-3.5 h-3.5 text-white" />;
      break;
    case 'accident_blackspot':
      bgColor = '#f97316'; // Orange
      icon = <AlertTriangle className="w-3.5 h-3.5 text-white" />;
      break;
  }

  return (
    <div className="relative group cursor-pointer transform hover:scale-110 transition-transform">
      <div
        className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center border-2 border-white ring-2 ring-black/30"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 bg-slate-950 text-white border border-slate-700 text-[10px] font-hud font-bold px-1 rounded shadow">
        {speedLimit}
      </div>
    </div>
  );
}

// Camera Follower Controller to pan when vehicle moves in follow mode
function MapFollower({
  target,
  followVehicle
}: {
  target: { lat: number; lng: number };
  followVehicle: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (map && followVehicle) {
      map.panTo(target);
    }
  }, [map, target, followVehicle]);

  return null;
}

export const SpeedCamMap: React.FC<SpeedCamMapProps> = ({
  cameras,
  userLocation,
  userBearing,
  userSpeed,
  selectedRouteWaypoints,
  selectedCamera,
  onSelectCamera,
  apiKey,
  onUpdateApiKey,
  followVehicle,
  onToggleFollowVehicle
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(apiKey);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [apiError, setApiError] = useState(false);

  // Listen to potential quota or auth errors
  useEffect(() => {
    const handleQuota = () => setApiError(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateApiKey(inputKey.trim());
    setShowKeyModal(false);
    setApiError(false);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col">
      {/* Google Maps View */}
      <APIProvider
        apiKey={apiKey}
        solutionChannel="GMP_devsite_samples_v3_rgm"
        onError={() => setApiError(true)}
      >
        <GoogleMap
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={userLocation}
          defaultZoom={13}
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full min-h-[350px]"
        >
          <MapFollower target={userLocation} followVehicle={followVehicle} />

          {/* Active Route Polyline */}
          {selectedRouteWaypoints.length > 1 && (
            <Polyline
              path={selectedRouteWaypoints}
              strokeColor="#38bdf8"
              strokeOpacity={0.85}
              strokeWeight={5}
            />
          )}

          {/* User Vehicle Marker */}
          <AdvancedMarker position={userLocation} zIndex={100}>
            <div className="relative flex items-center justify-center">
              {/* Radar pulse wave */}
              <div className="absolute w-14 h-14 rounded-full bg-cyan-500/20 animate-ping pointer-events-none" />
              <div className="absolute w-10 h-10 rounded-full border border-cyan-400/50 bg-cyan-500/10 pointer-events-none" />
              {/* Vehicle Arrow Icon rotated by bearing */}
              <div
                className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 transition-transform duration-300"
                style={{ transform: `rotate(${userBearing}deg)` }}
              >
                <Navigation className="w-4 h-4 fill-current stroke-current" />
              </div>
              {/* Floating Speed Bubble */}
              <div className="absolute -bottom-6 bg-slate-950/90 text-cyan-400 text-[10px] font-mono-nums font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap shadow-md">
                {Math.round(userSpeed)} km/h
              </div>
            </div>
          </AdvancedMarker>

          {/* Speed Cameras & Enforcement Markers */}
          {cameras.map((cam) => (
            <AdvancedMarker
              key={cam.id}
              position={cam.coordinates}
              onClick={() => onSelectCamera(cam)}
            >
              {getMarkerBadge(cam.type, cam.speedLimit)}
            </AdvancedMarker>
          ))}

          {/* Active InfoWindow for Selected Camera */}
          {selectedCamera && (
            <InfoWindow
              position={selectedCamera.coordinates}
              onCloseClick={() => onSelectCamera(null)}
            >
              <div className="p-1 max-w-xs text-slate-900">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-hud font-bold text-xs flex items-center justify-center border-2 border-white shadow">
                    {selectedCamera.speedLimit}
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm leading-tight text-slate-950">
                      {selectedCamera.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{selectedCamera.road}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                  {selectedCamera.description}
                </p>

                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] space-y-1 mb-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fine Schedule:</span>
                    <span className="font-medium text-rose-700">{selectedCamera.fineSchedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Region:</span>
                    <span className="text-slate-700">{selectedCamera.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Direction:</span>
                    <span className="text-slate-700">{selectedCamera.direction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-emerald-700 font-medium">
                      Active · Verified {selectedCamera.lastReported}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onSelectCamera(null);
                    }}
                    className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </APIProvider>

      {/* Floating Map Overlays & Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Follow Vehicle Toggle */}
        <button
          onClick={onToggleFollowVehicle}
          className={`p-2.5 rounded-lg shadow-lg border backdrop-blur-md transition-all flex items-center justify-center ${
            followVehicle
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title={followVehicle ? 'Recenter Locked to Vehicle' : 'Click to Lock Camera to Vehicle'}
        >
          <Crosshair className={`w-4 h-4 ${followVehicle ? 'animate-spin' : ''}`} />
        </button>

        {/* Map Style Selector */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-1 shadow-lg flex flex-col gap-1">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              mapType === 'roadmap' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Roads
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              mapType === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sat
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              mapType === 'hybrid' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hybrid
          </button>
        </div>

        {/* API Key Configure Button */}
        <button
          onClick={() => setShowKeyModal(true)}
          className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 shadow-lg backdrop-blur-md transition-colors"
          title="Google Maps API Key Settings"
        >
          <Key className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-xs shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-300">Fixed Cam</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-300">MTTD Radar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-slate-300">Red Light</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-300">Checkpoint</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-slate-300">Blackspot</span>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl text-slate-200">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Google Maps API Configuration
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Google Maps API is provisioned via AI Studio. You can optionally specify a custom Google Cloud Maps API key to override, or view your current connection status.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Google Maps API Key (VITE_GOOGLE_MAPS_API_KEY)
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Target Region:</span>
                  <span className="text-slate-200 font-medium">Ghana (Accra / Kumasi / N1 / N6)</span>
                </div>
                <div className="flex justify-between">
                  <span>SDK:</span>
                  <span className="text-slate-200 font-medium">@vis.gl/react-google-maps v1.7.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Attribution ID:</span>
                  <span className="text-cyan-400 font-mono text-[10px]">gmp_mcp_codeassist_v1_aistudio</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

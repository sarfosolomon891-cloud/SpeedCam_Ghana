import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GHANA_CAMERAS, SpeedCamera, CameraType, CAMERA_TYPE_CONFIG } from './data/cameras';
import { GHANA_SIMULATION_ROUTES, SimulationRoute } from './data/routes';
import { SpeedCamMap } from './components/SpeedCamMap';
import { SpeedometerCard } from './components/SpeedometerCard';
import { SpeedTelemetryChart, SpeedHistoryPoint } from './components/SpeedTelemetryChart';
import { HUDView } from './components/HUDView';
import { ReportModal } from './components/ReportModal';
import { SafetyRegulationsModal } from './components/SafetyRegulationsModal';
import {
  evaluateNearestCamera,
  calculateBearing,
  calculateDistanceMeters,
  CameraProximityResult
} from './utils/geoUtils';
import { soundManager } from './utils/audioAlerts';
import {
  Camera,
  Radio,
  Shield,
  Gauge,
  AlertTriangle,
  Compass,
  MapPin,
  ListFilter,
  PlusCircle,
  BookOpen,
  Route as RouteIcon,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function App() {
  // Quota banner state for Google Maps Platform
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // API Key state
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ||
      localStorage.getItem('speedcam_ghana_maps_key') ||
      ''
    );
  });

  const handleUpdateApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('speedcam_ghana_maps_key', newKey);
  };

  // Cameras database (preloaded + localStorage reports)
  const [cameras, setCameras] = useState<SpeedCamera[]>(() => {
    const saved = localStorage.getItem('speedcam_ghana_custom_cameras');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...GHANA_CAMERAS, ...parsed];
      } catch {
        return GHANA_CAMERAS;
      }
    }
    return GHANA_CAMERAS;
  });

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected route for simulation
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const currentRoute = GHANA_SIMULATION_ROUTES[activeRouteIndex];

  // Simulation & Vehicle State
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRealGPS, setIsRealGPS] = useState(false);
  const [unit, setUnit] = useState<'km/h' | 'mph'>('km/h');
  const [currentSpeed, setCurrentSpeed] = useState<number>(75);
  const [followVehicle, setFollowVehicle] = useState(true);

  // Position along route (index in waypoints and interpolation ratio)
  const [waypointIndex, setWaypointIndex] = useState(0);
  const [segmentProgress, setSegmentProgress] = useState(0); // 0 to 1

  // User coordinate & bearing
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: GHANA_SIMULATION_ROUTES[0].waypoints[0].lat,
    lng: GHANA_SIMULATION_ROUTES[0].waypoints[0].lng
  });
  const [userBearing, setUserBearing] = useState<number>(90);

  // Modals state
  const [showHUD, setShowHUD] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<SpeedCamera | null>(null);

  // 60-second speed telemetry history
  const [speedHistory, setSpeedHistory] = useState<SpeedHistoryPoint[]>(() => {
    const initial: SpeedHistoryPoint[] = [];
    const now = Date.now();
    for (let i = 59; i >= 0; i--) {
      initial.push({
        timestamp: now - i * 1000,
        secondsAgo: i,
        speed: 70 + Math.round(Math.sin(i / 6) * 12),
        speedLimit: 80
      });
    }
    return initial;
  });

  // Track previous proximity alert to trigger audio events
  const lastAlertRef = useRef<string | null>(null);

  // Filtered cameras
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      if (selectedRegion !== 'All' && cam.region !== selectedRegion) return false;
      if (selectedType !== 'All' && cam.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          cam.name.toLowerCase().includes(q) ||
          cam.road.toLowerCase().includes(q) ||
          cam.region.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cameras, selectedRegion, selectedType, searchQuery]);

  // Nearest Camera proximity evaluation
  const nearestAlert: CameraProximityResult | null = useMemo(() => {
    return evaluateNearestCamera(userLocation, currentSpeed, cameras);
  }, [userLocation, currentSpeed, cameras]);

  // Record speed sample every 1 second for telemetry history
  useEffect(() => {
    const interval = setInterval(() => {
      const currentLimit = nearestAlert
        ? nearestAlert.camera.speedLimit
        : currentRoute.waypoints[waypointIndex]?.speedLimit || 80;

      setSpeedHistory((prev) => {
        const now = Date.now();
        const updated = prev.map((pt) => ({
          ...pt,
          secondsAgo: Math.min(60, Math.round((now - pt.timestamp) / 1000))
        }));

        return [
          ...updated,
          {
            timestamp: now,
            secondsAgo: 0,
            speed: Math.round(currentSpeed),
            speedLimit: currentLimit
          }
        ].slice(-60);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSpeed, nearestAlert, currentRoute, waypointIndex]);

  // Handle Audio alerts when approaching or overspeeding
  useEffect(() => {
    if (!nearestAlert) {
      lastAlertRef.current = null;
      return;
    }

    const alertKey = `${nearestAlert.camera.id}-${nearestAlert.alertLevel}-${nearestAlert.isOverspeeding}`;
    if (lastAlertRef.current !== alertKey) {
      lastAlertRef.current = alertKey;

      if (nearestAlert.alertLevel === 'danger') {
        soundManager.playOverspeedAlarm();
        soundManager.speakAlert(
          `Attention! Speed camera in ${nearestAlert.distanceMeters} meters. Speed limit is ${nearestAlert.camera.speedLimit} kilometers per hour. Reduce speed immediately!`
        );
      } else if (nearestAlert.alertLevel === 'warning') {
        soundManager.playWarningBeep();
        soundManager.speakAlert(
          `Speed enforcement ${nearestAlert.distanceMeters} meters ahead. Limit ${nearestAlert.camera.speedLimit}.`
        );
      } else if (nearestAlert.alertLevel === 'info' && nearestAlert.distanceMeters <= 800) {
        soundManager.playProximityPing();
      }
    }
  }, [nearestAlert]);

  // Simulation tick loop
  useEffect(() => {
    if (!isSimulating || isRealGPS) return;

    const interval = setInterval(() => {
      const waypoints = currentRoute.waypoints;
      if (waypoints.length < 2) return;

      const p1 = waypoints[waypointIndex];
      const nextIdx = (waypointIndex + 1) % waypoints.length;
      const p2 = waypoints[nextIdx];

      const segmentDistMeters = calculateDistanceMeters(p1, p2);
      // Speed in meters per second * interval in seconds (0.1s)
      const distPerTick = (currentSpeed * 1000) / 3600 * 0.15;
      const progressDelta = distPerTick / Math.max(10, segmentDistMeters);

      setSegmentProgress((prev) => {
        const next = prev + progressDelta;
        if (next >= 1) {
          setWaypointIndex(nextIdx);
          return 0;
        }

        // Interpolate position
        const lat = p1.lat + (p2.lat - p1.lat) * next;
        const lng = p1.lng + (p2.lng - p1.lng) * next;
        setUserLocation({ lat, lng });

        // Calculate heading
        const bearing = calculateBearing(p1, p2);
        setUserBearing(bearing);

        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isSimulating, isRealGPS, currentRoute, waypointIndex, currentSpeed]);

  // Real GPS Geolocation Watcher
  useEffect(() => {
    if (!isRealGPS || typeof navigator === 'undefined' || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (speed !== null && !isNaN(speed) && speed > 0) {
          setCurrentSpeed(Math.round(speed * 3.6)); // m/s to km/h
        }
        if (heading !== null && !isNaN(heading)) {
          setUserBearing(heading);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsRealGPS(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRealGPS]);

  // Handle route selection change
  const handleSelectRoute = (idx: number) => {
    setActiveRouteIndex(idx);
    const newRoute = GHANA_SIMULATION_ROUTES[idx];
    setWaypointIndex(0);
    setSegmentProgress(0);
    setUserLocation({
      lat: newRoute.waypoints[0].lat,
      lng: newRoute.waypoints[0].lng
    });
    setCurrentSpeed(newRoute.defaultSpeed);
  };

  // Reset simulation
  const handleResetSimulation = () => {
    setWaypointIndex(0);
    setSegmentProgress(0);
    setUserLocation({
      lat: currentRoute.waypoints[0].lat,
      lng: currentRoute.waypoints[0].lng
    });
    setIsSimulating(false);
  };

  // Add user report
  const handleAddReport = (newCam: SpeedCamera) => {
    setCameras((prev) => {
      const updated = [newCam, ...prev];
      // Save user reports
      const customOnes = updated.filter((c) => c.id.startsWith('user-report-'));
      localStorage.setItem('speedcam_ghana_custom_cameras', JSON.stringify(customOnes));
      return updated;
    });
    setSelectedCamera(newCam);
  };

  const currentRoadName = currentRoute.waypoints[waypointIndex]?.name || currentRoute.highway;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Required In-App Quota Notice Banner (google-maps-platform Case A) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav links) - Zone 3 (1 Primary Action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-lg font-hud font-black tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span>SpeedCam Ghana</span>
        </a>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => {
              setFollowVehicle(true);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Live Radar</span>
          </button>
          <button
            onClick={() => setShowHUD(true)}
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>HUD Mode</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>Report Trap</span>
          </button>
          <button
            onClick={() => setShowSafetyModal(true)}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span>MTTD Fines & Rules</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (isRealGPS) {
                setIsRealGPS(false);
              } else {
                setIsSimulating(!isSimulating);
              }
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-lg ${
              isSimulating || isRealGPS
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isSimulating ? 'Pause Drive' : isRealGPS ? 'Stop GPS' : 'Drive Highway'}
          </button>
        </div>
      </header>

      {/* Main Dual-Panel Viewport Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Map Viewport Container */}
        <div className="flex-1 min-h-[450px] lg:min-h-0 relative h-[50vh] lg:h-auto border-b lg:border-b-0 lg:border-r border-slate-800">
          <SpeedCamMap
            cameras={filteredCameras}
            userLocation={userLocation}
            userBearing={userBearing}
            userSpeed={currentSpeed}
            selectedRouteWaypoints={currentRoute.waypoints}
            selectedCamera={selectedCamera}
            onSelectCamera={setSelectedCamera}
            apiKey={apiKey}
            onUpdateApiKey={handleUpdateApiKey}
            followVehicle={followVehicle}
            onToggleFollowVehicle={() => setFollowVehicle(!followVehicle)}
          />
        </div>

        {/* Right Sidebar Control & Telemetry Panel */}
        <div className="w-full lg:w-[460px] xl:w-[480px] bg-slate-950 flex flex-col overflow-y-auto p-4 md:p-6 gap-5 shrink-0">
          {/* Driver Speedometer & Radar Proximity Card */}
          <SpeedometerCard
            currentSpeed={currentSpeed}
            onSpeedChange={setCurrentSpeed}
            nearestAlert={nearestAlert}
            unit={unit}
            onToggleUnit={() => setUnit(unit === 'km/h' ? 'mph' : 'km/h')}
            onOpenHUD={() => setShowHUD(true)}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating(!isSimulating)}
            onResetSimulation={handleResetSimulation}
            isRealGPS={isRealGPS}
            onToggleRealGPS={() => setIsRealGPS(!isRealGPS)}
            currentRoadName={currentRoadName}
          />

          {/* 60s Speed Telemetry Chart */}
          <SpeedTelemetryChart
            history={speedHistory}
            currentSpeed={currentSpeed}
            currentSpeedLimit={
              nearestAlert
                ? nearestAlert.camera.speedLimit
                : currentRoute.waypoints[waypointIndex]?.speedLimit || 80
            }
            unit={unit}
          />

          {/* Highway Simulation Route Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <RouteIcon className="w-4 h-4 text-cyan-400" />
                Ghana Highway Corridors
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentRoute.totalDistanceKm} km
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GHANA_SIMULATION_ROUTES.map((route, idx) => (
                <button
                  key={route.id}
                  onClick={() => handleSelectRoute(idx)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeRouteIndex === idx
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-white truncate">{route.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {route.highway} · {route.region}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Filter Bar & Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ListFilter className="w-4 h-4 text-cyan-400" />
                Active Radar Traps ({filteredCameras.length})
              </span>
              <button
                onClick={() => setShowReportModal(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report Spot
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search road, junction, or camera name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Region Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {['All', 'Greater Accra', 'Central', 'Eastern', 'Ashanti', 'Western'].map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors font-medium ${
                    selectedRegion === region
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* List of Cameras in View */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredCameras.map((cam) => {
                const isSelected = selectedCamera?.id === cam.id;
                return (
                  <div
                    key={cam.id}
                    onClick={() => {
                      setSelectedCamera(cam);
                      setUserLocation(cam.coordinates);
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white truncate max-w-[220px]">
                        {cam.name}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-hud font-bold text-[11px] flex items-center justify-center shrink-0 border border-white">
                        {cam.speedLimit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{cam.road}</div>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
                      <span>{CAMERA_TYPE_CONFIG[cam.type]?.label || cam.type}</span>
                      <span className="text-emerald-500">Active · {cam.verifiedCount} verified</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Road Safety Guidelines Button */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-white">Ghana Road Safety Authority</div>
                <div className="text-[10px] text-slate-400">National Speed Limits & MTTD Court Fines</div>
              </div>
            </div>
            <button
              onClick={() => setShowSafetyModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              View Guide
            </button>
          </div>
        </div>
      </main>

      {/* Fullscreen Night Windshield HUD View Modal */}
      {showHUD && (
        <HUDView
          currentSpeed={currentSpeed}
          nearestAlert={nearestAlert}
          onClose={() => setShowHUD(false)}
          unit={unit}
        />
      )}

      {/* Driver Incident Report Modal */}
      {showReportModal && (
        <ReportModal
          currentLocation={userLocation}
          onClose={() => setShowReportModal(false)}
          onSubmitReport={handleAddReport}
        />
      )}

      {/* Safety & Fines Modal */}
      {showSafetyModal && (
        <SafetyRegulationsModal onClose={() => setShowSafetyModal(false)} />
      )}
    </div>
  );
}

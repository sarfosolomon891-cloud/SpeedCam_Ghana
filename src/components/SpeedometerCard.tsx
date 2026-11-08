import React from 'react';
import { CameraProximityResult, formatDistance } from '../utils/geoUtils';
import {
  Volume2,
  VolumeX,
  Maximize2,
  AlertTriangle,
  Camera,
  Radio,
  Shield,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Navigation2,
  Sliders,
  Sparkles,
  MapPin
} from 'lucide-react';
import { soundManager } from '../utils/audioAlerts';

interface SpeedometerCardProps {
  currentSpeed: number; // km/h
  onSpeedChange: (speed: number) => void;
  nearestAlert: CameraProximityResult | null;
  unit: 'km/h' | 'mph';
  onToggleUnit: () => void;
  onOpenHUD: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  isRealGPS: boolean;
  onToggleRealGPS: () => void;
  currentRoadName: string;
}

export const SpeedometerCard: React.FC<SpeedometerCardProps> = ({
  currentSpeed,
  onSpeedChange,
  nearestAlert,
  unit,
  onToggleUnit,
  onOpenHUD,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  isRealGPS,
  onToggleRealGPS,
  currentRoadName
}) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.getMuted());
  const [voiceEnabled, setVoiceEnabled] = React.useState(soundManager.getVoiceEnabled());

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    soundManager.setVoiceEnabled(next);
  };

  const speedLimit = nearestAlert ? nearestAlert.camera.speedLimit : 80;
  const isOverspeeding = nearestAlert ? currentSpeed > nearestAlert.camera.speedLimit : false;
  const isApproaching = nearestAlert && currentSpeed >= nearestAlert.camera.speedLimit - 5 && !isOverspeeding;

  const displaySpeed = unit === 'mph' ? Math.round(currentSpeed * 0.621371) : Math.round(currentSpeed);
  const displayLimit = unit === 'mph' ? Math.round(speedLimit * 0.621371) : speedLimit;

  // Max gauge speed 160 km/h
  const gaugePercent = Math.min(100, (currentSpeed / 160) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
      {/* Top Header / Mode Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {isRealGPS ? 'GPS Live Radar' : 'Simulation Radar'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 truncate max-w-[150px]">
            {currentRoadName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Unit Toggle */}
          <button
            onClick={onToggleUnit}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded text-slate-300 transition-colors"
            title="Toggle between km/h and mph"
          >
            {unit}
          </button>

          {/* Sound Mute */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded transition-colors ${
              isMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* HUD Fullscreen */}
          <button
            onClick={onOpenHUD}
            className="p-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 transition-colors"
            title="Launch Head-Up Display (HUD)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Speedometer Gauge Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Speedometer Gauge */}
        <div className="md:col-span-7 flex items-center justify-center relative py-2">
          <div className="relative flex flex-col items-center justify-center">
            {/* Speed Gauge Ring */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="82"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="96"
                cy="96"
                r="82"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={515}
                strokeDashoffset={515 - (515 * (gaugePercent * 0.75)) / 100}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-200 ${
                  isOverspeeding
                    ? 'text-rose-500'
                    : isApproaching
                    ? 'text-amber-400'
                    : 'text-cyan-400'
                }`}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`font-hud font-black text-6xl tracking-tight transition-colors ${
                  isOverspeeding
                    ? 'text-rose-500 animate-pulse'
                    : isApproaching
                    ? 'text-amber-400'
                    : 'text-white'
                }`}
              >
                {displaySpeed}
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                {unit}
              </span>
            </div>
          </div>

          {/* Floating Speed Limit Sign */}
          <div className="absolute right-4 top-2 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-white border-4 border-rose-600 flex items-center justify-center shadow-lg ring-2 ring-black/40">
              <span className="text-slate-950 font-hud font-black text-xl leading-none">
                {displayLimit}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase">Limit</span>
          </div>
        </div>

        {/* Nearest Camera Proximity & Radar Notice */}
        <div className="md:col-span-5 flex flex-col justify-center">
          {nearestAlert ? (
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                isOverspeeding
                  ? 'bg-rose-950/40 border-rose-600 text-rose-200'
                  : isApproaching
                  ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  {nearestAlert.camera.type.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono font-bold">
                  {formatDistance(nearestAlert.distanceMeters)}
                </span>
              </div>

              <h4 className="font-semibold text-sm text-white truncate mb-1">
                {nearestAlert.camera.name}
              </h4>

              <div className="text-xs text-slate-400 space-y-1 mb-2">
                <p className="truncate">{nearestAlert.camera.road}</p>
                <div className="flex justify-between text-[11px]">
                  <span>Fine:</span>
                  <span className="text-rose-400 font-medium">{nearestAlert.camera.fineSchedule}</span>
                </div>
              </div>

              {/* Status Banner */}
              {isOverspeeding ? (
                <div className="bg-rose-600 text-white text-xs font-semibold py-1 px-2 rounded text-center animate-pulse">
                  SLAP BRAKES! +{nearestAlert.speedDelta} {unit} OVER LIMIT
                </div>
              ) : (
                <div className="bg-slate-800 text-slate-300 text-xs py-1 px-2 rounded text-center font-medium">
                  {nearestAlert.distanceMeters <= 400
                    ? 'Caution: Approaching Enforcement Zone'
                    : 'Monitoring Zone Ahead'}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-1.5 opacity-80" />
              <div className="text-sm font-semibold text-white">Path Clear</div>
              <p className="text-xs text-slate-400 mt-0.5">
                No active speed traps detected within 1.2 km on this highway.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Driver Controls & Simulation Bar */}
      <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
        {/* Speed Slider in Simulation Mode */}
        {!isRealGPS && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                Simulated Vehicle Speed
              </span>
              <span className="font-mono text-cyan-400 font-bold">{Math.round(currentSpeed)} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="140"
              value={currentSpeed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (Stop)</span>
              <span>50 (Urban)</span>
              <span>80 (Highway)</span>
              <span>100 (Motorway)</span>
              <span>140 (Speeding)</span>
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* GPS Toggle */}
          <button
            onClick={onToggleRealGPS}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isRealGPS
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Navigation2 className="w-3.5 h-3.5" />
            {isRealGPS ? 'GPS Tracking Active' : 'Enable Live GPS'}
          </button>

          {/* Simulation Controls */}
          {!isRealGPS && (
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSimulation}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isSimulating
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-cyan-600 text-white hover:bg-cyan-500'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isSimulating ? 'Pause Drive' : 'Drive Route'}
              </button>

              <button
                onClick={onResetSimulation}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Reset Route to Start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Voice Prompt Toggle */}
          <button
            onClick={handleToggleVoice}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              voiceEnabled
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Spoken audio navigation warnings"
          >
            Voice: {voiceEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

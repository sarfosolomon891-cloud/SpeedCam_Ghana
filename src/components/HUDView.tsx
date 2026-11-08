import React, { useState } from 'react';
import { CameraProximityResult, formatDistance } from '../utils/geoUtils';
import {
  Volume2,
  VolumeX,
  Maximize2,
  FlipHorizontal,
  X,
  AlertTriangle,
  Camera,
  Radio,
  Shield,
  Gauge
} from 'lucide-react';
import { soundManager } from '../utils/audioAlerts';

interface HUDViewProps {
  currentSpeed: number; // km/h
  nearestAlert: CameraProximityResult | null;
  onClose: () => void;
  unit: 'km/h' | 'mph';
}

export const HUDView: React.FC<HUDViewProps> = ({
  currentSpeed,
  nearestAlert,
  onClose,
  unit
}) => {
  const [isMirrored, setIsMirrored] = useState(false);
  const [hudColor, setHudColor] = useState<'cyan' | 'green' | 'amber' | 'red'>('cyan');
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const displayedSpeed = unit === 'mph' ? Math.round(currentSpeed * 0.621371) : Math.round(currentSpeed);
  const speedLimit = nearestAlert ? (unit === 'mph' ? Math.round(nearestAlert.camera.speedLimit * 0.621371) : nearestAlert.camera.speedLimit) : 80;

  const isOverspeeding = nearestAlert ? currentSpeed > nearestAlert.camera.speedLimit : false;
  const isApproaching = nearestAlert && currentSpeed >= nearestAlert.camera.speedLimit - 5 && !isOverspeeding;

  // Color profiles
  const colorMap = {
    cyan: {
      text: 'text-cyan-400',
      border: 'border-cyan-500/40',
      bgGlow: 'bg-cyan-500/10',
      accent: 'text-cyan-300'
    },
    green: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bgGlow: 'bg-emerald-500/10',
      accent: 'text-emerald-300'
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      bgGlow: 'bg-amber-500/10',
      accent: 'text-amber-300'
    },
    red: {
      text: 'text-rose-500',
      border: 'border-rose-500/40',
      bgGlow: 'bg-rose-500/10',
      accent: 'text-rose-400'
    }
  };

  const activeColor = isOverspeeding ? colorMap.red : isApproaching ? colorMap.amber : colorMap[hudColor];

  return (
    <div
      className={`fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 select-none transition-transform duration-300 ${
        isMirrored ? '-scale-x-100' : ''
      }`}
    >
      {/* Top HUD Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit HUD Mode"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/IMG_6058_e0c4769c.jpeg"
              alt="SpeedCam Ghana"
              className="w-7 h-7 rounded-lg object-contain shadow ring-1 ring-white/15"
            />
            <div className="text-xs uppercase tracking-widest text-slate-400 font-mono">
              Ghana MTTD · Windshield HUD
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-full">
            <button
              onClick={() => setHudColor('cyan')}
              className={`w-6 h-6 rounded-full bg-cyan-500 transition-transform ${
                hudColor === 'cyan' ? 'scale-110 ring-2 ring-white' : 'opacity-60'
              }`}
            />
            <button
              onClick={() => setHudColor('green')}
              className={`w-6 h-6 rounded-full bg-emerald-500 transition-transform ${
                hudColor === 'green' ? 'scale-110 ring-2 ring-white' : 'opacity-60'
              }`}
            />
            <button
              onClick={() => setHudColor('amber')}
              className={`w-6 h-6 rounded-full bg-amber-500 transition-transform ${
                hudColor === 'amber' ? 'scale-110 ring-2 ring-white' : 'opacity-60'
              }`}
            />
          </div>

          {/* Mirror Reflection Toggle */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-3 rounded-full border transition-colors ${
              isMirrored
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Mirror for Windshield Reflection"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full border transition-colors ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center HUD Speed & Alert Cluster */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Giant Speed Limit Badge */}
        {nearestAlert && (
          <div className="mb-4 flex items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-4 border-rose-600 flex items-center justify-center shadow-2xl">
              <span className="text-slate-950 font-hud font-black text-2xl md:text-3xl">
                {speedLimit}
              </span>
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                {nearestAlert.camera.type.replace('_', ' ')}
              </div>
              <div className="text-sm md:text-base font-bold text-white max-w-xs truncate">
                {nearestAlert.camera.name}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {formatDistance(nearestAlert.distanceMeters)} ahead · {nearestAlert.camera.road}
              </div>
            </div>
          </div>
        )}

        {/* Overspeeding Critical Warning Banner */}
        {isOverspeeding && (
          <div className="mb-4 px-6 py-2 rounded-full bg-rose-600/30 border border-rose-500 text-rose-400 font-hud font-bold tracking-widest text-sm md:text-lg animate-pulse flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            REDUCE SPEED · OVER LIMIT (+{nearestAlert?.speedDelta} {unit})
          </div>
        )}

        {/* Main Digital Speed Display */}
        <div className="relative flex flex-col items-center">
          <div
            className={`font-hud font-black text-9xl md:text-[14rem] leading-none tracking-tighter ${activeColor.text} drop-shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-colors duration-200`}
          >
            {displayedSpeed}
          </div>
          <div className="text-xl md:text-2xl font-mono uppercase tracking-widest text-slate-500 -mt-2">
            {unit}
          </div>
        </div>

        {/* Distance Countdown Bar */}
        {nearestAlert && nearestAlert.distanceMeters <= 1500 && (
          <div className="w-full max-w-md mt-6 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Trap Proximity</span>
              <span className={activeColor.text}>
                {formatDistance(nearestAlert.distanceMeters)}
                {nearestAlert.timeToCameraSeconds ? ` · ~${nearestAlert.timeToCameraSeconds}s` : ''}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverspeeding ? 'bg-rose-500' : 'bg-cyan-500'
                }`}
                style={{
                  width: `${Math.max(5, Math.min(100, 100 - (nearestAlert.distanceMeters / 1500) * 100))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD Metadata */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-900 pt-4">
        <div>GHANA ROAD SAFETY AUTHORITY</div>
        <div className="text-center">
          {isMirrored ? 'WINDSHIELD REFLECTION MODE ACTIVE' : 'PLACE DEVICE ON DASHBOARD FACING GLASS'}
        </div>
        <div>GPS SPEED: {displayedSpeed} {unit}</div>
      </div>
    </div>
  );
};

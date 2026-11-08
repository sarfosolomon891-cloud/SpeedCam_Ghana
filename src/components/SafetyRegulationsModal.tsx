import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Scale,
  PhoneCall,
  AlertOctagon,
  ShieldCheck,
  Calculator,
  ChevronRight
} from 'lucide-react';

interface SafetyRegulationsModalProps {
  onClose: () => void;
}

export const SafetyRegulationsModal: React.FC<SafetyRegulationsModalProps> = ({ onClose }) => {
  const [vehicleType, setVehicleType] = useState<'private' | 'commercial' | 'heavy'>('private');
  const [roadType, setRoadType] = useState<'urban' | 'highway' | 'motorway'>('urban');
  const [driverSpeed, setDriverSpeed] = useState<number>(75);

  // Speed limits under Ghana Road Traffic Act / Regulations
  const limits = {
    urban: {
      private: 50,
      commercial: 50,
      heavy: 40
    },
    highway: {
      private: 90,
      commercial: 80,
      heavy: 60
    },
    motorway: {
      private: 100,
      commercial: 80,
      heavy: 80
    }
  };

  const allowedLimit = limits[roadType][vehicleType];
  const excess = driverSpeed - allowedLimit;

  // Fine estimation based on Ghana MTTD fine schedules (L.I. 2180)
  let fineAmount = 0;
  let penaltyPoints = 0;
  let verdict = 'Within Legal Limit';
  let severity: 'safe' | 'minor' | 'serious' | 'critical' = 'safe';

  if (excess > 0 && excess <= 15) {
    fineAmount = 360;
    penaltyPoints = 2;
    verdict = 'Minor Speeding Infraction';
    severity = 'minor';
  } else if (excess > 15 && excess <= 30) {
    fineAmount = 600;
    penaltyPoints = 3;
    verdict = 'Substantial Overspeeding (MTTD Radar Citation)';
    severity = 'serious';
  } else if (excess > 30) {
    fineAmount = 1200;
    penaltyPoints = 5;
    verdict = 'Reckless Driving & High Speed Offence (Court Summons + License Suspension Risk)';
    severity = 'critical';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg text-white">
              Ghana Road Safety Regulations & Fine Estimator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Fine Calculator */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">
              Ghana Police MTTD Speed Violation & Fine Calculator
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Vehicle Category</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="private">Private Saloon / SUV</option>
                <option value="commercial">Trotro / Taxi / Minibus</option>
                <option value="heavy">Articulated Haulage / Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Road Classification</label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="urban">Urban / Town (Lapaz, Spintex, High St)</option>
                <option value="highway">National Highway (N1, N6, N2)</option>
                <option value="motorway">Accra - Tema Motorway</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Your Speed ({driverSpeed} km/h)
              </label>
              <input
                type="range"
                min="30"
                max="160"
                value={driverSpeed}
                onChange={(e) => setDriverSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
              />
            </div>
          </div>

          {/* Calculator Verdict Result */}
          <div
            className={`p-3.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              severity === 'safe'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : severity === 'minor'
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}
          >
            <div>
              <div className="text-xs font-mono uppercase tracking-wider">
                Ghana Statutory Limit: {allowedLimit} km/h · Margin: {excess > 0 ? `+${excess}` : excess} km/h
              </div>
              <div className="font-semibold text-sm text-white mt-0.5">{verdict}</div>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-mono">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Est. Penalty Fine</div>
                <div className="text-base font-bold text-white">
                  {fineAmount === 0 ? 'GHS 0' : `GHS ${fineAmount.toLocaleString()}`}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Penalty Points</div>
                <div className="text-base font-bold text-white">
                  {penaltyPoints === 0 ? '0 Pts' : `+${penaltyPoints} Pts`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ghana Statutory Speed Limits Guide */}
        <div className="space-y-4 text-xs text-slate-300 mb-6">
          <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Official Ghana Speed Limits (Road Traffic Regulations, L.I. 2180)
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="p-2.5">Road Environment</th>
                  <th className="p-2.5">Private Vehicles</th>
                  <th className="p-2.5">Commercial Vehicles (Taxis/Trotros)</th>
                  <th className="p-2.5">Heavy Trucks & Tankers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                <tr>
                  <td className="p-2.5 text-slate-300 font-sans font-medium">Urban / Township Roads</td>
                  <td className="p-2.5 text-cyan-400">50 km/h (30 near schools)</td>
                  <td className="p-2.5 text-cyan-400">50 km/h</td>
                  <td className="p-2.5 text-cyan-400">40 km/h</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-300 font-sans font-medium">Single Carriage Highways</td>
                  <td className="p-2.5 text-cyan-400">80 km/h</td>
                  <td className="p-2.5 text-cyan-400">70 km/h</td>
                  <td className="p-2.5 text-cyan-400">60 km/h</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-300 font-sans font-medium">Dual Carriage Expressways (N1, N6)</td>
                  <td className="p-2.5 text-cyan-400">90 km/h</td>
                  <td className="p-2.5 text-cyan-400">80 km/h</td>
                  <td className="p-2.5 text-cyan-400">70 km/h</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-slate-300 font-sans font-medium">Accra - Tema Motorway</td>
                  <td className="p-2.5 text-emerald-400">100 km/h</td>
                  <td className="p-2.5 text-emerald-400">80 km/h</td>
                  <td className="p-2.5 text-emerald-400">80 km/h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Emergency Assistance in Ghana */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-1.5 mb-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            Ghana National Highway Emergency Contacts
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Police Emergency / MTTD</span>
              <span className="font-mono font-bold text-white text-sm">191 / 18555</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">National Ambulance Service</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">193</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">National Road Safety Authority</span>
              <span className="font-mono font-bold text-amber-400 text-sm">0800 108 00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CameraType, SpeedCamera } from '../data/cameras';
import {
  X,
  Radio,
  Camera,
  AlertTriangle,
  Shield,
  Truck,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface ReportModalProps {
  currentLocation: { lat: number; lng: number };
  onClose: () => void;
  onSubmitReport: (newReport: SpeedCamera) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  currentLocation,
  onClose,
  onSubmitReport
}) => {
  const [reportType, setReportType] = useState<CameraType>('mobile_radar');
  const [roadName, setRoadName] = useState('N1 George Walker Bush Hwy');
  const [landmark, setLandmark] = useState('');
  const [speedLimit, setSpeedLimit] = useState(60);
  const [direction, setDirection] = useState<'Both' | 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound'>('Both');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportCategories: { type: CameraType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'mobile_radar',
      label: 'MTTD Mobile Radar',
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      desc: 'Police officers with handheld radar or tripod laser gun'
    },
    {
      type: 'fixed_camera',
      label: 'New Speed Camera',
      icon: <Camera className="w-5 h-5 text-rose-400" />,
      desc: 'Permanent gantry or overhead traffic surveillance camera'
    },
    {
      type: 'police_checkpoint',
      label: 'Police Roadblock',
      icon: <Shield className="w-5 h-5 text-blue-400" />,
      desc: 'Inspection checkpoint, weighbridge, or document check'
    },
    {
      type: 'accident_blackspot',
      label: 'Hazard / Broken Truck',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      desc: 'Stationary vehicle, bad pothole, or severe accident scene'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamera: SpeedCamera = {
      id: `user-report-${Date.now()}`,
      name: landmark.trim() || `${reportType.replace('_', ' ').toUpperCase()} on ${roadName}`,
      type: reportType,
      coordinates: {
        lat: currentLocation.lat + (Math.random() - 0.5) * 0.002,
        lng: currentLocation.lng + (Math.random() - 0.5) * 0.002
      },
      speedLimit: Number(speedLimit),
      road: roadName,
      region: 'Greater Accra',
      direction,
      description: description.trim() || 'Driver reported active enforcement at this highway location.',
      status: 'active',
      verifiedCount: 1,
      lastReported: 'Just now (Driver Report)',
      fineSchedule: 'GHS 480 standard fine schedule'
    };

    onSubmitReport(newCamera);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-lg text-white">Report Road Enforcement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
            <h4 className="text-xl font-bold text-white">Report Broadcasted!</h4>
            <p className="text-sm text-slate-300 max-w-xs">
              Thank you for keeping Ghanaian drivers safe. Your report has been added to the live radar map.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Enforcement or Hazard Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reportCategories.map((cat) => (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => setReportType(cat.type)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      reportType === cat.type
                        ? 'bg-cyan-950/40 border-cyan-500 text-white ring-1 ring-cyan-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">{cat.icon}</div>
                    <div>
                      <div className="text-xs font-semibold text-white">{cat.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Highway / Corridor
                </label>
                <select
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="N1 George Walker Bush Hwy">N1 George Walker Bush Hwy</option>
                  <option value="Accra - Tema Motorway (N1)">Accra - Tema Motorway (N1)</option>
                  <option value="N6 Accra - Kumasi Highway">N6 Accra - Kumasi Highway</option>
                  <option value="N1 Accra - Cape Coast Road">N1 Accra - Cape Coast Road</option>
                  <option value="Liberation Road">Liberation Road (37 / Airport)</option>
                  <option value="Spintex Road">Spintex Road</option>
                  <option value="N2 Tema - Akosombo Highway">N2 Tema - Akosombo Highway</option>
                  <option value="Kumasi Ring Road">Kumasi Ring Road</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Posted Speed Limit
                </label>
                <select
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="30">30 km/h (School / Hospital)</option>
                  <option value="50">50 km/h (Urban / Township)</option>
                  <option value="60">60 km/h (Outer Urban / Interchange)</option>
                  <option value="80">80 km/h (Single Carriage Highway)</option>
                  <option value="90">90 km/h (Dual Carriage Highway)</option>
                  <option value="100">100 km/h (Accra-Tema Motorway)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nearest Landmark / Spot Name
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Achimota Overhead, Shell station..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Enforcement Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Both">Both Directions</option>
                  <option value="Eastbound">Eastbound (Towards Tema / Aflao)</option>
                  <option value="Westbound">Westbound (Towards Kasoa / Cape Coast)</option>
                  <option value="Northbound">Northbound (Towards Kumasi / Nsawam)</option>
                  <option value="Southbound">Southbound (Towards Central Accra)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Driver Note / Visibility Details (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Hidden behind billboard, active laser gun targeting fast lane..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Target GPS Coordinates:
              </span>
              <span className="font-mono text-slate-300">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                Broadcast Trap Alert
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export type CameraType = 
  | 'fixed_camera' 
  | 'mobile_radar' 
  | 'red_light' 
  | 'average_speed' 
  | 'police_checkpoint' 
  | 'accident_blackspot';

export interface SpeedCamera {
  id: string;
  name: string;
  type: CameraType;
  coordinates: {
    lat: number;
    lng: number;
  };
  speedLimit: number; // km/h
  road: string;
  region: 'Greater Accra' | 'Ashanti' | 'Central' | 'Eastern' | 'Western' | 'Northern';
  direction: 'Both' | 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound';
  description: string;
  status: 'active' | 'temporary' | 'maintenance';
  verifiedCount: number;
  lastReported: string;
  fineSchedule: string;
}

export const GHANA_CAMERAS: SpeedCamera[] = [
  // Greater Accra Corridors
  {
    id: 'cam-accra-01',
    name: 'George Walker Bush Hwy (Lapaz Overhead)',
    type: 'fixed_camera',
    coordinates: { lat: 5.5976, lng: -0.2442 },
    speedLimit: 60,
    road: 'N1 George Walker Bush Highway',
    region: 'Greater Accra',
    direction: 'Both',
    description: 'High-definition gantry camera monitoring 6-lane urban traffic, pedestrian crossing zone, and speeding.',
    status: 'active',
    verifiedCount: 142,
    lastReported: '10 mins ago',
    fineSchedule: 'GHS 480 + 3 penalty points'
  },
  {
    id: 'cam-accra-02',
    name: 'Fiesta Royale / Dzorwulu Traffic Cameras',
    type: 'red_light',
    coordinates: { lat: 5.6033, lng: -0.1988 },
    speedLimit: 50,
    road: 'N1 George Walker Bush Highway',
    region: 'Greater Accra',
    direction: 'Both',
    description: 'Dual red-light and speed camera intersection surveillance covering east/west bound traffic towards Airport.',
    status: 'active',
    verifiedCount: 98,
    lastReported: '35 mins ago',
    fineSchedule: 'GHS 600 + 4 penalty points'
  },
  {
    id: 'cam-accra-03',
    name: 'Tema Motorway Klagon Underpass',
    type: 'mobile_radar',
    coordinates: { lat: 5.6882, lng: -0.0634 },
    speedLimit: 100,
    road: 'Accra - Tema Motorway (N1)',
    region: 'Greater Accra',
    direction: 'Eastbound',
    description: 'Regular MTTD mobile laser gun patrol stationed near Klagon bridge catching overspeeding vehicles.',
    status: 'active',
    verifiedCount: 215,
    lastReported: '5 mins ago',
    fineSchedule: 'GHS 600–1,200 (Court summons if >120 km/h)'
  },
  {
    id: 'cam-accra-04',
    name: 'Tema Motorway Abattoir Stretch',
    type: 'average_speed',
    coordinates: { lat: 5.6515, lng: -0.1042 },
    speedLimit: 100,
    road: 'Accra - Tema Motorway (N1)',
    region: 'Greater Accra',
    direction: 'Both',
    description: 'Automated ANPR average speed timing zone between Tetteh Quarshie and Tema roundabout.',
    status: 'active',
    verifiedCount: 310,
    lastReported: 'Verified today',
    fineSchedule: 'GHS 720 + 3 penalty points'
  },
  {
    id: 'cam-accra-05',
    name: 'Liberation Road (37 Military Hospital Approach)',
    type: 'fixed_camera',
    coordinates: { lat: 5.5867, lng: -0.1834 },
    speedLimit: 50,
    road: 'Liberation Road',
    region: 'Greater Accra',
    direction: 'Southbound',
    description: 'Strict 50 km/h hospital and diplomatic zone speed enforcement with automated ticketing.',
    status: 'active',
    verifiedCount: 84,
    lastReported: '1 hour ago',
    fineSchedule: 'GHS 360 + 2 penalty points'
  },
  {
    id: 'cam-accra-06',
    name: 'Pokuase 4-Tier Interchange Southbound',
    type: 'fixed_camera',
    coordinates: { lat: 5.6894, lng: -0.2872 },
    speedLimit: 60,
    road: 'N6 Accra - Kumasi Highway',
    region: 'Greater Accra',
    direction: 'Southbound',
    description: 'Overhead speed camera at the entrance ramp of the 4-tier interchange monitoring descending traffic.',
    status: 'active',
    verifiedCount: 167,
    lastReported: '22 mins ago',
    fineSchedule: 'GHS 480 + 3 penalty points'
  },
  {
    id: 'cam-accra-07',
    name: 'Achimota Old Barrier Gantry',
    type: 'fixed_camera',
    coordinates: { lat: 5.6321, lng: -0.2315 },
    speedLimit: 50,
    road: 'Accra - Nsawam Road',
    region: 'Greater Accra',
    direction: 'Both',
    description: 'Pedestrian heavy school and market zone camera; strict compliance checked 24/7.',
    status: 'active',
    verifiedCount: 112,
    lastReported: '40 mins ago',
    fineSchedule: 'GHS 500 + 3 penalty points'
  },
  {
    id: 'cam-accra-08',
    name: 'Mallam Market Interchange Ramps',
    type: 'red_light',
    coordinates: { lat: 5.5678, lng: -0.2831 },
    speedLimit: 50,
    road: 'N1 Winneba Road Junction',
    region: 'Greater Accra',
    direction: 'Westbound',
    description: 'High-traffic intersection speed camera capturing yellow line violations and excessive ramp speed.',
    status: 'active',
    verifiedCount: 76,
    lastReported: '2 hours ago',
    fineSchedule: 'GHS 420 + 2 penalty points'
  },
  {
    id: 'cam-accra-09',
    name: 'Spintex Road (Ecobank / Coastal Junction)',
    type: 'mobile_radar',
    coordinates: { lat: 5.6302, lng: -0.1345 },
    speedLimit: 50,
    road: 'Spintex Road',
    region: 'Greater Accra',
    direction: 'Both',
    description: 'Police MTTD spot radar check; speeders weaving through traffic penalized on the spot.',
    status: 'active',
    verifiedCount: 63,
    lastReported: '18 mins ago',
    fineSchedule: 'GHS 360 on-the-spot citation'
  },
  {
    id: 'cam-accra-10',
    name: 'Independence Avenue (National Theatre / Ridge)',
    type: 'fixed_camera',
    coordinates: { lat: 5.5562, lng: -0.1989 },
    speedLimit: 50,
    road: 'Independence Avenue',
    region: 'Greater Accra',
    direction: 'Both',
    description: 'Government ministry zone speed trap monitoring late-night speeders along the ministerial boulevard.',
    status: 'active',
    verifiedCount: 52,
    lastReported: 'Verified today',
    fineSchedule: 'GHS 400 + 2 penalty points'
  },

  // Central Region (Accra - Cape Coast - Takoradi Corridor)
  {
    id: 'cam-central-01',
    name: 'Kasoa Tollbooth / Bypass Merge',
    type: 'mobile_radar',
    coordinates: { lat: 5.5342, lng: -0.4287 },
    speedLimit: 50,
    road: 'N1 Accra - Cape Coast Road',
    region: 'Central',
    direction: 'Westbound',
    description: 'Frequent MTTD radar roadblock immediately after Kasoa flyover descent.',
    status: 'active',
    verifiedCount: 189,
    lastReported: '8 mins ago',
    fineSchedule: 'GHS 600 + 3 penalty points'
  },
  {
    id: 'cam-central-02',
    name: 'Gomoa Okyereko Blackspot',
    type: 'accident_blackspot',
    coordinates: { lat: 5.3781, lng: -0.5892 },
    speedLimit: 60,
    road: 'N1 Accra - Cape Coast Road',
    region: 'Central',
    direction: 'Both',
    description: 'High-fatality accident blackspot prone to head-on collisions. Permanent caution and radar surveillance.',
    status: 'active',
    verifiedCount: 240,
    lastReported: 'Verified today',
    fineSchedule: 'Caution Zone · Enforced by mobile patrol'
  },
  {
    id: 'cam-central-03',
    name: 'Winneba Junction MTTD Checkpoint',
    type: 'police_checkpoint',
    coordinates: { lat: 5.3619, lng: -0.6384 },
    speedLimit: 50,
    road: 'N1 Coastal Highway',
    region: 'Central',
    direction: 'Both',
    description: 'Full vehicle inspection, speed radar, and driver license verification checkpoint.',
    status: 'active',
    verifiedCount: 304,
    lastReported: '15 mins ago',
    fineSchedule: 'GHS 600–1,000 for road code infractions'
  },
  {
    id: 'cam-central-04',
    name: 'Mankessim Central Market Corridor',
    type: 'fixed_camera',
    coordinates: { lat: 5.2678, lng: -1.0189 },
    speedLimit: 50,
    road: 'N1 Coastal Highway',
    region: 'Central',
    direction: 'Both',
    description: 'Township speed restriction camera protecting dense pedestrian and market shopper traffic.',
    status: 'active',
    verifiedCount: 95,
    lastReported: '1 hour ago',
    fineSchedule: 'GHS 480 + 3 penalty points'
  },
  {
    id: 'cam-central-05',
    name: 'Cape Coast Bypass (UCC Junction)',
    type: 'mobile_radar',
    coordinates: { lat: 5.1204, lng: -1.2829 },
    speedLimit: 60,
    road: 'N1 Cape Coast Expressway',
    region: 'Central',
    direction: 'Both',
    description: 'University campus entrance speed check; university students crossing road regularly.',
    status: 'active',
    verifiedCount: 88,
    lastReported: '45 mins ago',
    fineSchedule: 'GHS 450 + 2 penalty points'
  },

  // Eastern & Ashanti (Accra - Kumasi Corridor)
  {
    id: 'cam-eastern-01',
    name: 'Nsawam Bypass Dobro Weighbridge',
    type: 'police_checkpoint',
    coordinates: { lat: 5.7952, lng: -0.3421 },
    speedLimit: 60,
    road: 'N6 Accra - Kumasi Highway',
    region: 'Eastern',
    direction: 'Northbound',
    description: 'Heavy cargo weighbridge, radar gun team, and roadworthiness compliance inspection station.',
    status: 'active',
    verifiedCount: 220,
    lastReported: '12 mins ago',
    fineSchedule: 'Strict axle load + speed penalties'
  },
  {
    id: 'cam-eastern-02',
    name: 'Suhum Overhead Roundabout',
    type: 'fixed_camera',
    coordinates: { lat: 6.0412, lng: -0.4523 },
    speedLimit: 50,
    road: 'N6 Kumasi Highway',
    region: 'Eastern',
    direction: 'Both',
    description: 'Overhead speed camera tracking vehicles transitioning from open 90 km/h highway to Suhum town limits.',
    status: 'active',
    verifiedCount: 134,
    lastReported: '28 mins ago',
    fineSchedule: 'GHS 600 + 3 penalty points'
  },
  {
    id: 'cam-eastern-03',
    name: 'Bunso Junction (Linda Dor Rest Stop)',
    type: 'accident_blackspot',
    coordinates: { lat: 6.2874, lng: -0.5218 },
    speedLimit: 50,
    road: 'N6 Kumasi Highway',
    region: 'Eastern',
    direction: 'Both',
    description: 'Major transit rest stop with high turning traffic, buses, and frequent mobile speed traps.',
    status: 'active',
    verifiedCount: 412,
    lastReported: '3 mins ago',
    fineSchedule: 'GHS 600 + 4 penalty points'
  },
  {
    id: 'cam-eastern-04',
    name: 'Nkawkaw Bypass Dual Carriage',
    type: 'average_speed',
    coordinates: { lat: 6.5491, lng: -0.7714 },
    speedLimit: 80,
    road: 'N6 Kumasi Highway',
    region: 'Eastern',
    direction: 'Both',
    description: 'Scenic bypass around Kwahu mountain base; average speed timing prevents dangerous overtaking.',
    status: 'active',
    verifiedCount: 178,
    lastReported: '50 mins ago',
    fineSchedule: 'GHS 750 + 3 penalty points'
  },
  {
    id: 'cam-ashanti-01',
    name: 'Ejisu Approach Radar Check',
    type: 'mobile_radar',
    coordinates: { lat: 6.7215, lng: -1.5032 },
    speedLimit: 50,
    road: 'N6 Kumasi Highway',
    region: 'Ashanti',
    direction: 'Northbound',
    description: 'Police radar team targeting vehicles entering Kumasi metropolitan boundary from Accra.',
    status: 'active',
    verifiedCount: 195,
    lastReported: '14 mins ago',
    fineSchedule: 'GHS 500 + 3 penalty points'
  },
  {
    id: 'cam-ashanti-02',
    name: 'Tech Junction (KNUST Gate 1)',
    type: 'fixed_camera',
    coordinates: { lat: 6.6749, lng: -1.5714 },
    speedLimit: 50,
    road: 'Kumasi - Accra Road',
    region: 'Ashanti',
    direction: 'Both',
    description: 'High-traffic intersection camera recording red-light jumping and speeding near university gates.',
    status: 'active',
    verifiedCount: 156,
    lastReported: '30 mins ago',
    fineSchedule: 'GHS 480 + 3 penalty points'
  },
  {
    id: 'cam-ashanti-03',
    name: 'Sofoline Interchange Kumasi',
    type: 'fixed_camera',
    coordinates: { lat: 6.6961, lng: -1.6512 },
    speedLimit: 60,
    road: 'Kumasi Ring Road West',
    region: 'Ashanti',
    direction: 'Both',
    description: 'Underpass and flyover surveillance monitoring speeding on the 3-tier interchange.',
    status: 'active',
    verifiedCount: 110,
    lastReported: '1 hour ago',
    fineSchedule: 'GHS 480 + 2 penalty points'
  },

  // Western & Northern Corridors
  {
    id: 'cam-western-01',
    name: 'Kojokrom Roundabout (Takoradi Entrance)',
    type: 'fixed_camera',
    coordinates: { lat: 4.9392, lng: -1.7483 },
    speedLimit: 50,
    road: 'N1 Takoradi Bypass',
    region: 'Western',
    direction: 'Both',
    description: 'Major commercial vehicle route into Takoradi Harbour city with active speed enforcement.',
    status: 'active',
    verifiedCount: 82,
    lastReported: '2 hours ago',
    fineSchedule: 'GHS 400 + 2 penalty points'
  },
  {
    id: 'cam-northern-01',
    name: 'Tamale Central Roundabout (N10 Highway)',
    type: 'police_checkpoint',
    coordinates: { lat: 9.4074, lng: -0.8393 },
    speedLimit: 50,
    road: 'N10 Kumasi - Tamale Highway',
    region: 'Northern',
    direction: 'Both',
    description: 'MTTD northern corridor inspection post; checks cross-border haulage and passenger bus speed.',
    status: 'active',
    verifiedCount: 74,
    lastReported: 'Verified today',
    fineSchedule: 'GHS 500 standard citation'
  }
];

export const CAMERA_TYPE_CONFIG: Record<CameraType, { label: string; color: string; icon: string; description: string }> = {
  fixed_camera: {
    label: 'Fixed Speed Camera',
    color: 'bg-rose-500 text-white',
    icon: 'Camera',
    description: 'Permanent pole or gantry-mounted automated radar camera'
  },
  mobile_radar: {
    label: 'Mobile MTTD Radar',
    color: 'bg-amber-500 text-slate-950',
    icon: 'Radio',
    description: 'Police squad with laser gun or tripod speed radar'
  },
  red_light: {
    label: 'Red Light & Speed',
    color: 'bg-purple-500 text-white',
    icon: 'ShieldAlert',
    description: 'Traffic light camera capturing yellow/red line & intersection speed'
  },
  average_speed: {
    label: 'Average Speed Zone',
    color: 'bg-cyan-500 text-slate-950',
    icon: 'Gauge',
    description: 'Entry/Exit ANPR cameras computing average velocity over corridor'
  },
  police_checkpoint: {
    label: 'Police Checkpoint',
    color: 'bg-blue-500 text-white',
    icon: 'Shield',
    description: 'MTTD inspection post with active speed radar verification'
  },
  accident_blackspot: {
    label: 'Accident Blackspot',
    color: 'bg-orange-500 text-white',
    icon: 'AlertTriangle',
    description: 'High-risk road curve, pedestrian collision zone, or steep grade'
  }
};

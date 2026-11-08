export interface SimulationRoute {
  id: string;
  name: string;
  description: string;
  highway: string;
  region: string;
  totalDistanceKm: number;
  defaultSpeed: number; // km/h
  waypoints: {
    lat: number;
    lng: number;
    speedLimit: number;
    name?: string;
  }[];
}

export const GHANA_SIMULATION_ROUTES: SimulationRoute[] = [
  {
    id: 'route-lapaz-tema',
    name: 'George Walker Bush Highway to Tema Motorway',
    description: 'Traverses Lapaz, Dzorwulu, Tetteh Quarshie Interchange and full length of Accra-Tema Motorway.',
    highway: 'N1 Corridor',
    region: 'Greater Accra',
    totalDistanceKm: 28.4,
    defaultSpeed: 80,
    waypoints: [
      { lat: 5.5891, lng: -0.2582, speedLimit: 60, name: 'Mallam / Kwashieman Merge' },
      { lat: 5.5976, lng: -0.2442, speedLimit: 60, name: 'Lapaz Overhead Gantry' },
      { lat: 5.6021, lng: -0.2224, speedLimit: 60, name: 'Abeka Junction' },
      { lat: 5.6033, lng: -0.1988, speedLimit: 50, name: 'Fiesta Royale / Dzorwulu' },
      { lat: 5.6125, lng: -0.1782, speedLimit: 70, name: 'Tetteh Quarshie Interchange' },
      { lat: 5.6294, lng: -0.1512, speedLimit: 90, name: 'Motorway Toll Plaza Approach' },
      { lat: 5.6515, lng: -0.1042, speedLimit: 100, name: 'Motorway Abattoir Bridge' },
      { lat: 5.6702, lng: -0.0821, speedLimit: 100, name: 'Ashaiman Underpass' },
      { lat: 5.6882, lng: -0.0634, speedLimit: 100, name: 'Klagon Overhead' },
      { lat: 5.6984, lng: -0.0381, speedLimit: 80, name: 'Tema Roundabout Interchange' }
    ]
  },
  {
    id: 'route-accra-kumasi-n6',
    name: 'Accra to Bunso (N6 Kumasi Highway)',
    description: 'Pokuase 4-tier interchange through Nsawam bypass, Suhum and Bunso Junction (Linda Dor).',
    highway: 'N6 Kumasi Highway',
    region: 'Eastern Region',
    totalDistanceKm: 85.0,
    defaultSpeed: 85,
    waypoints: [
      { lat: 5.6321, lng: -0.2315, speedLimit: 50, name: 'Achimota Old Barrier' },
      { lat: 5.6894, lng: -0.2872, speedLimit: 60, name: 'Pokuase 4-Tier Interchange' },
      { lat: 5.7198, lng: -0.3012, speedLimit: 70, name: 'Amasaman Toll Area' },
      { lat: 5.7952, lng: -0.3421, speedLimit: 60, name: 'Nsawam Bypass Dobro' },
      { lat: 5.8612, lng: -0.3812, speedLimit: 90, name: 'Adoagyiri Open Highway' },
      { lat: 6.0412, lng: -0.4523, speedLimit: 50, name: 'Suhum Overhead Roundabout' },
      { lat: 6.1623, lng: -0.4891, speedLimit: 90, name: 'Kyebi Junction Turnoff' },
      { lat: 6.2874, lng: -0.5218, speedLimit: 50, name: 'Bunso / Linda Dor Rest Stop' }
    ]
  },
  {
    id: 'route-mallam-winneba',
    name: 'Mallam to Winneba Junction (Cape Coast N1)',
    description: 'Through Kasoa flyover, Gomoa Okyereko blackspot to Winneba MTTD checkpoint.',
    highway: 'N1 West Highway',
    region: 'Central Region',
    totalDistanceKm: 52.3,
    defaultSpeed: 75,
    waypoints: [
      { lat: 5.5678, lng: -0.2831, speedLimit: 50, name: 'Mallam Interchange West' },
      { lat: 5.5512, lng: -0.3541, speedLimit: 60, name: 'Weija SCC Barrier' },
      { lat: 5.5342, lng: -0.4287, speedLimit: 50, name: 'Kasoa Flyover Descent' },
      { lat: 5.4821, lng: -0.4952, speedLimit: 80, name: 'Budumburam Bypass' },
      { lat: 5.4215, lng: -0.5412, speedLimit: 90, name: 'Gomoa Fetteh Junction' },
      { lat: 5.3781, lng: -0.5892, speedLimit: 60, name: 'Gomoa Okyereko Blackspot' },
      { lat: 5.3619, lng: -0.6384, speedLimit: 50, name: 'Winneba Roundabout Checkpoint' }
    ]
  },
  {
    id: 'route-accra-core',
    name: 'Liberation Road & Airport City Loop',
    description: 'Urban business & government corridor through 37 Military Hospital, Airport City and Ridge.',
    highway: 'Accra Urban Central',
    region: 'Greater Accra',
    totalDistanceKm: 12.8,
    defaultSpeed: 45,
    waypoints: [
      { lat: 5.5562, lng: -0.1989, speedLimit: 50, name: 'National Theatre / Ridge' },
      { lat: 5.5721, lng: -0.1912, speedLimit: 50, name: 'Ring Road Central' },
      { lat: 5.5867, lng: -0.1834, speedLimit: 50, name: '37 Military Hospital Approach' },
      { lat: 5.6052, lng: -0.1712, speedLimit: 50, name: 'Kotoka Airport Bypass' },
      { lat: 5.6125, lng: -0.1782, speedLimit: 60, name: 'Tetteh Quarshie Interchange' }
    ]
  }
];

// Rough boxes around areas with official Street View coverage.
// w = relative chance of picking the box. Points that miss coverage are simply re-rolled.
export const REGIONS = [
  // North America
  { name: 'USA',             lat: [25, 49],       lng: [-124, -67],   w: 10 },
  { name: 'Alaska',          lat: [55, 65],       lng: [-165, -140],  w: 0.5 },
  { name: 'Canada',          lat: [43, 55],       lng: [-128, -60],   w: 5 },
  { name: 'Mexico',          lat: [15, 32],       lng: [-117, -87],   w: 4 },
  { name: 'Central America', lat: [8, 17],        lng: [-92, -77],    w: 1.5 },
  { name: 'Caribbean',       lat: [17.5, 19],     lng: [-71.5, -65],  w: 0.5 },

  // South America
  { name: 'Colombia',        lat: [-4, 11],       lng: [-79, -67],    w: 2 },
  { name: 'Ecuador, Peru',   lat: [-18, 1],       lng: [-81, -69],    w: 2 },
  { name: 'Bolivia',         lat: [-22, -10],     lng: [-69, -58],    w: 1 },
  { name: 'Brazil',          lat: [-33, -3],      lng: [-60, -35],    w: 6 },
  { name: 'Chile',           lat: [-45, -18],     lng: [-74, -68],    w: 2 },
  { name: 'Argentina',       lat: [-50, -22],     lng: [-72, -54],    w: 4 },
  { name: 'Uruguay',         lat: [-35, -30],     lng: [-58, -53],    w: 1 },

  // Europe
  { name: 'Iceland',         lat: [63.3, 66.5],   lng: [-24, -13.5],  w: 0.7 },
  { name: 'UK, Ireland',     lat: [50, 58.5],     lng: [-10.5, 2],    w: 3 },
  { name: 'Iberia',          lat: [36, 43.8],     lng: [-9.5, 3.3],   w: 4 },
  { name: 'France',          lat: [42.5, 51],     lng: [-4.5, 8],     w: 4 },
  { name: 'Central Europe',  lat: [45.5, 55],     lng: [3, 19],       w: 6 },
  { name: 'Italy',           lat: [37, 46.5],     lng: [7, 18.5],     w: 3 },
  { name: 'Scandinavia',     lat: [55, 70],       lng: [5, 30],       w: 4 },
  { name: 'Poland, Baltics', lat: [49, 59.5],     lng: [14, 28],      w: 3 },
  { name: 'Balkans',         lat: [40, 48],       lng: [13, 30],      w: 4 },
  { name: 'Greece, Turkey',  lat: [36, 42],       lng: [20, 44],      w: 4 },
  { name: 'Western Russia',  lat: [44, 62],       lng: [30, 60],      w: 5 },

  // Asia
  { name: 'Siberia',         lat: [50, 58],       lng: [60, 135],     w: 2 },
  { name: 'Central Asia',    lat: [40, 54],       lng: [50, 85],      w: 1.5 },
  { name: 'Mongolia',        lat: [42, 52],       lng: [88, 120],     w: 1 },
  { name: 'Israel, Jordan',  lat: [29, 33.3],     lng: [34.2, 36.5],  w: 1 },
  { name: 'Gulf',            lat: [22, 26.5],     lng: [51, 57],      w: 0.5 },
  { name: 'India',           lat: [8, 32],        lng: [68, 90],      w: 4 },
  { name: 'Sri Lanka',       lat: [6, 10],        lng: [79.6, 82],    w: 0.5 },
  { name: 'Bangladesh',      lat: [21, 26.5],     lng: [88, 92.5],    w: 0.5 },
  { name: 'Mainland SE Asia', lat: [6, 20],       lng: [97, 108],     w: 3 },
  { name: 'Malaysia',        lat: [1, 7],         lng: [99.5, 119],   w: 1.5 },
  { name: 'Indonesia',       lat: [-9, 6],        lng: [95, 141],     w: 4 },
  { name: 'Philippines',     lat: [5, 19],        lng: [117, 127],    w: 2 },
  { name: 'Taiwan',          lat: [21.9, 25.3],   lng: [120, 122],    w: 1 },
  { name: 'Japan',           lat: [31, 45.5],     lng: [129.5, 146],  w: 4 },
  { name: 'South Korea',     lat: [34, 38.5],     lng: [126, 129.5],  w: 1.5 },

  // Oceania
  { name: 'Australia',       lat: [-39, -11],     lng: [113, 154],    w: 6 },
  { name: 'Tasmania',        lat: [-43.6, -40.6], lng: [144.5, 148.5], w: 0.5 },
  { name: 'New Zealand',     lat: [-47, -34],     lng: [166, 179],    w: 2 },

  // Africa
  { name: 'Southern Africa', lat: [-35, -17],     lng: [12, 33],      w: 5 },
  { name: 'East Africa',     lat: [-11, 5],       lng: [29, 42],      w: 2 },
  { name: 'West Africa',     lat: [4, 15],        lng: [-17, 10],     w: 2 },
  { name: 'Tunisia',         lat: [30, 37.5],     lng: [7.5, 11.6],   w: 0.5 },
  { name: 'Madagascar',      lat: [-26, -12],     lng: [43, 51],      w: 0.5 },
];

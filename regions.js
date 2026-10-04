// Rough boxes around areas with official Street View coverage.
// w = relative chance of picking the box, c = continent. Points that miss coverage are simply re-rolled.
export const REGIONS = [
  // North America
  { name: 'USA', c: 'Americas',             lat: [25, 49],       lng: [-124, -67],   w: 10 },
  { name: 'Alaska', c: 'Americas',          lat: [55, 65],       lng: [-165, -140],  w: 0.5 },
  { name: 'Canada', c: 'Americas',          lat: [43, 55],       lng: [-128, -60],   w: 5 },
  { name: 'Mexico', c: 'Americas',          lat: [15, 32],       lng: [-117, -87],   w: 4 },
  { name: 'Central America', c: 'Americas', lat: [8, 17],        lng: [-92, -77],    w: 1.5 },
  { name: 'Caribbean', c: 'Americas',       lat: [17.5, 19],     lng: [-71.5, -65],  w: 0.5 },

  // South America
  { name: 'Colombia', c: 'Americas',        lat: [-4, 11],       lng: [-79, -67],    w: 2 },
  { name: 'Ecuador, Peru', c: 'Americas',   lat: [-18, 1],       lng: [-81, -69],    w: 2 },
  { name: 'Bolivia', c: 'Americas',         lat: [-22, -10],     lng: [-69, -58],    w: 1 },
  { name: 'Brazil', c: 'Americas',          lat: [-33, -3],      lng: [-60, -35],    w: 6 },
  { name: 'Chile', c: 'Americas',           lat: [-45, -18],     lng: [-74, -68],    w: 2 },
  { name: 'Argentina', c: 'Americas',       lat: [-50, -22],     lng: [-72, -54],    w: 4 },
  { name: 'Uruguay', c: 'Americas',         lat: [-35, -30],     lng: [-58, -53],    w: 1 },

  // Europe
  { name: 'Iceland', c: 'Europe',         lat: [63.3, 66.5],   lng: [-24, -13.5],  w: 0.7 },
  { name: 'UK, Ireland', c: 'Europe',     lat: [50, 58.5],     lng: [-10.5, 2],    w: 3 },
  { name: 'Iberia', c: 'Europe',          lat: [36, 43.8],     lng: [-9.5, 3.3],   w: 4 },
  { name: 'France', c: 'Europe',          lat: [42.5, 51],     lng: [-4.5, 8],     w: 4 },
  { name: 'Central Europe', c: 'Europe',  lat: [45.5, 55],     lng: [3, 19],       w: 6 },
  { name: 'Italy', c: 'Europe',           lat: [37, 46.5],     lng: [7, 18.5],     w: 3 },
  { name: 'Scandinavia', c: 'Europe',     lat: [55, 70],       lng: [5, 30],       w: 4 },
  { name: 'Poland, Baltics', c: 'Europe', lat: [49, 59.5],     lng: [14, 28],      w: 3 },
  { name: 'Balkans', c: 'Europe',         lat: [40, 48],       lng: [13, 30],      w: 4 },
  { name: 'Greece, Turkey', c: 'Europe',  lat: [36, 42],       lng: [20, 44],      w: 4 },
  { name: 'Western Russia', c: 'Europe',  lat: [44, 62],       lng: [30, 60],      w: 5 },

  // Asia
  { name: 'Siberia', c: 'Asia',         lat: [50, 58],       lng: [60, 135],     w: 2 },
  { name: 'Central Asia', c: 'Asia',    lat: [40, 54],       lng: [50, 85],      w: 1.5 },
  { name: 'Mongolia', c: 'Asia',        lat: [42, 52],       lng: [88, 120],     w: 1 },
  { name: 'Israel, Jordan', c: 'Asia',  lat: [29, 33.3],     lng: [34.2, 36.5],  w: 1 },
  { name: 'Gulf', c: 'Asia',            lat: [22, 26.5],     lng: [51, 57],      w: 0.5 },
  { name: 'India', c: 'Asia',           lat: [8, 32],        lng: [68, 90],      w: 4 },
  { name: 'Sri Lanka', c: 'Asia',       lat: [6, 10],        lng: [79.6, 82],    w: 0.5 },
  { name: 'Bangladesh', c: 'Asia',      lat: [21, 26.5],     lng: [88, 92.5],    w: 0.5 },
  { name: 'Mainland SE Asia', c: 'Asia', lat: [6, 20],       lng: [97, 108],     w: 3 },
  { name: 'Malaysia', c: 'Asia',        lat: [1, 7],         lng: [99.5, 119],   w: 1.5 },
  { name: 'Indonesia', c: 'Asia',       lat: [-9, 6],        lng: [95, 141],     w: 4 },
  { name: 'Philippines', c: 'Asia',     lat: [5, 19],        lng: [117, 127],    w: 2 },
  { name: 'Taiwan', c: 'Asia',          lat: [21.9, 25.3],   lng: [120, 122],    w: 1 },
  { name: 'Japan', c: 'Asia',           lat: [31, 45.5],     lng: [129.5, 146],  w: 4 },
  { name: 'South Korea', c: 'Asia',     lat: [34, 38.5],     lng: [126, 129.5],  w: 1.5 },

  // Oceania
  { name: 'Australia', c: 'Oceania',       lat: [-39, -11],     lng: [113, 154],    w: 6 },
  { name: 'Tasmania', c: 'Oceania',        lat: [-43.6, -40.6], lng: [144.5, 148.5], w: 0.5 },
  { name: 'New Zealand', c: 'Oceania',     lat: [-47, -34],     lng: [166, 179],    w: 2 },

  // Africa
  { name: 'Southern Africa', c: 'Africa', lat: [-35, -17],     lng: [12, 33],      w: 5 },
  { name: 'East Africa', c: 'Africa',     lat: [-11, 5],       lng: [29, 42],      w: 2 },
  { name: 'West Africa', c: 'Africa',     lat: [4, 15],        lng: [-17, 10],     w: 2 },
  { name: 'Tunisia', c: 'Africa',         lat: [30, 37.5],     lng: [7.5, 11.6],   w: 0.5 },
];

// Islands with Street View. Tight boxes, searched with a small radius so we don't land on a nearby mainland.
export const ISLANDS = [
  { name: 'Faroe Islands',    lat: [61.4, 62.4],    lng: [-7.7, -6.3],      w: 1 },
  { name: 'Shetland',         lat: [59.8, 60.9],    lng: [-1.7, -0.7],      w: 1 },
  { name: 'Skye',             lat: [57, 57.7],      lng: [-6.8, -5.6],      w: 1 },
  { name: 'Isle of Man',      lat: [54.05, 54.42],  lng: [-4.8, -4.3],      w: 0.5 },
  { name: 'Iceland',          lat: [63.3, 66.5],    lng: [-24, -13.5],      w: 1.5 },
  { name: 'Lofoten',          lat: [67.8, 68.5],    lng: [12.9, 15.5],      w: 0.7 },
  { name: 'Gotland',          lat: [56.9, 57.95],   lng: [18.1, 19],        w: 0.7 },
  { name: 'São Miguel',       lat: [37.7, 37.9],    lng: [-25.9, -25.1],    w: 0.7 },
  { name: 'Madeira',          lat: [32.6, 32.9],    lng: [-17.3, -16.6],    w: 0.7 },
  { name: 'Tenerife',         lat: [28, 28.6],      lng: [-16.9, -16.1],    w: 0.7 },
  { name: 'Gran Canaria',     lat: [27.7, 28.2],    lng: [-15.85, -15.35],  w: 0.7 },
  { name: 'Mallorca',         lat: [39.25, 39.95],  lng: [2.3, 3.5],        w: 0.7 },
  { name: 'Corsica',          lat: [41.4, 43],      lng: [8.55, 9.55],      w: 1 },
  { name: 'Sardinia',         lat: [38.9, 41.3],    lng: [8.1, 9.8],        w: 1.5 },
  { name: 'Sicily',           lat: [36.7, 38.3],    lng: [12.4, 15.6],      w: 1.5 },
  { name: 'Malta',            lat: [35.8, 36.08],   lng: [14.18, 14.58],    w: 0.5 },
  { name: 'Crete',            lat: [34.9, 35.6],    lng: [23.5, 26.3],      w: 1 },
  { name: 'Rhodes',           lat: [35.9, 36.45],   lng: [27.7, 28.25],     w: 0.5 },
  { name: 'Cyprus',           lat: [34.6, 35.7],    lng: [32.3, 34.6],      w: 1 },
  { name: 'Sri Lanka',        lat: [6, 9.8],        lng: [79.7, 81.9],      w: 1 },
  { name: 'Phuket',           lat: [7.75, 8.2],     lng: [98.25, 98.45],    w: 0.5 },
  { name: 'Bali',             lat: [-8.85, -8.06],  lng: [114.4, 115.7],    w: 1 },
  { name: 'Lombok',           lat: [-8.95, -8.2],   lng: [115.8, 116.7],    w: 0.5 },
  { name: 'Cebu',             lat: [9.4, 11.3],     lng: [123.3, 124.1],    w: 0.7 },
  { name: 'Okinawa',          lat: [26.05, 26.9],   lng: [127.6, 128.35],   w: 0.7 },
  { name: 'Jeju',             lat: [33.2, 33.57],   lng: [126.15, 126.95],  w: 0.7 },
  { name: 'Guam',             lat: [13.24, 13.65],  lng: [144.6, 145],      w: 0.5 },
  { name: 'Hawaii (Big Island)', lat: [18.9, 20.3], lng: [-156.1, -154.8],  w: 1 },
  { name: 'Oahu',             lat: [21.25, 21.72],  lng: [-158.3, -157.65], w: 0.7 },
  { name: 'Maui',             lat: [20.57, 21.03],  lng: [-156.7, -155.97], w: 0.5 },
  { name: 'Puerto Rico',      lat: [17.9, 18.5],    lng: [-67.3, -65.6],    w: 1 },
  { name: 'Curaçao',          lat: [12.03, 12.39],  lng: [-69.17, -68.73],  w: 0.5 },
  { name: 'Prince Edward Island', lat: [45.95, 47.07], lng: [-64.4, -62],   w: 0.7 },
  { name: 'Newfoundland',     lat: [47, 49.5],      lng: [-59, -52.6],      w: 1 },
  { name: 'Chiloé',           lat: [-43.4, -41.8],  lng: [-74.2, -73.4],    w: 0.5 },
  { name: 'Tasmania',         lat: [-43.6, -40.6],  lng: [144.5, 148.5],    w: 1 },
  { name: 'Kangaroo Island',  lat: [-36.1, -35.6],  lng: [136.5, 138.1],    w: 0.5 },
  { name: 'Réunion',          lat: [-21.4, -20.85], lng: [55.2, 55.85],     w: 0.7 },
  { name: 'Mauritius',        lat: [-20.53, -19.98], lng: [57.3, 57.8],     w: 0.5 },
];

// Remote, sparsely populated areas with road coverage.
export const NOWHERE = [
  { name: 'Australian Outback', lat: [-26, -18],   lng: [120, 138],   w: 2 },
  { name: 'Nullarbor',          lat: [-32.5, -30.5], lng: [125, 133], w: 1 },
  { name: 'Patagonia',          lat: [-50, -40],   lng: [-71, -65],   w: 2 },
  { name: 'Atacama',            lat: [-27, -21],   lng: [-70.5, -68.5], w: 1 },
  { name: 'Altiplano',          lat: [-21, -17],   lng: [-68.5, -66], w: 1 },
  { name: 'Pampas',             lat: [-38, -33],   lng: [-66, -60],   w: 1 },
  { name: 'Cerrado',            lat: [-16, -10],   lng: [-50, -44],   w: 1 },
  { name: 'Sonora, Chihuahua',  lat: [27, 31],     lng: [-109, -104], w: 1 },
  { name: 'West Texas',         lat: [29, 33],     lng: [-105, -101], w: 1 },
  { name: 'Great Basin',        lat: [37, 42],     lng: [-119, -111], w: 1.5 },
  { name: 'Great Plains',       lat: [42, 49],     lng: [-110, -98],  w: 2 },
  { name: 'Prairies',           lat: [49.2, 53],   lng: [-110, -102], w: 1.5 },
  { name: 'Yukon',              lat: [60, 64],     lng: [-140, -128], w: 1 },
  { name: 'Interior Alaska',    lat: [61, 66],     lng: [-152, -142], w: 1 },
  { name: 'Icelandic highlands', lat: [64, 66],    lng: [-20, -14],   w: 0.7 },
  { name: 'Lapland',            lat: [66, 70],     lng: [18, 30],     w: 1.5 },
  { name: 'Kazakh steppe',      lat: [45, 52],     lng: [55, 80],     w: 1.5 },
  { name: 'Mongolian steppe',   lat: [43, 49],     lng: [95, 115],    w: 1.5 },
  { name: 'Yakutia',            lat: [60, 64],     lng: [120, 135],   w: 1 },
  { name: 'Karoo',              lat: [-33, -30],   lng: [20, 25],     w: 1 },
  { name: 'Namibia',            lat: [-27, -18],   lng: [14, 20],     w: 1.5 },
  { name: 'Kalahari',           lat: [-26, -19],   lng: [20, 26],     w: 1 },
  { name: 'Northern Kenya',     lat: [1, 4],       lng: [36, 40],     w: 0.7 },
];

// Look-alike groups for the tricky neighbours themes.
export const NEIGHBOURS = {
  nordics: [
    { name: 'Norway, Sweden, Finland', lat: [55, 70],     lng: [5, 30],       w: 4 },
    { name: 'Denmark',                 lat: [54.6, 57.7], lng: [8.1, 12.6],   w: 1 },
    { name: 'Iceland',                 lat: [63.3, 66.5], lng: [-24, -13.5],  w: 0.7 },
  ],
  baltics: [
    { name: 'Estonia, Latvia, Lithuania', lat: [53.9, 59.7], lng: [21, 28.2], w: 1 },
  ],
  balkans: [
    { name: 'Western Balkans', lat: [41, 46.5], lng: [13.5, 21],  w: 2 },
    { name: 'Bulgaria, North Macedonia', lat: [41, 44], lng: [20.5, 28], w: 1 },
  ],
  andes: [
    { name: 'Colombia',      lat: [-4, 11],   lng: [-79, -67],   w: 1 },
    { name: 'Ecuador, Peru', lat: [-18, 1],   lng: [-81, -69],   w: 2 },
    { name: 'Bolivia',       lat: [-22, -10], lng: [-69, -58],   w: 1 },
    { name: 'Northern Chile', lat: [-30, -18], lng: [-71.5, -68], w: 1 },
  ],
  seasia: [
    { name: 'Thailand, Cambodia, Laos', lat: [6, 20],   lng: [97, 108],   w: 3 },
    { name: 'Malaysia',                 lat: [1, 7],    lng: [99.5, 119], w: 1.5 },
    { name: 'Indonesia',                lat: [-9, 6],   lng: [95, 141],   w: 3 },
    { name: 'Philippines',              lat: [5, 19],   lng: [117, 127],  w: 2 },
  ],
  anglosphere: [
    { name: 'USA',          lat: [25, 49],    lng: [-124, -67], w: 3 },
    { name: 'Canada',       lat: [43, 55],    lng: [-128, -60], w: 2 },
    { name: 'UK, Ireland',  lat: [50, 58.5],  lng: [-10.5, 2],  w: 2 },
    { name: 'Australia',    lat: [-39, -11],  lng: [113, 154],  w: 2 },
    { name: 'New Zealand',  lat: [-47, -34],  lng: [166, 179],  w: 1 },
    { name: 'South Africa', lat: [-35, -22],  lng: [16, 33],    w: 1.5 },
  ],
};

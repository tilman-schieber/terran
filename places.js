// Point lists for the place themes. Rounds land near one of these (see `jitterKm` in themes.js).
// Only places with official Street View coverage.

const p = (name, lat, lng) => ({ name, lat, lng });

export const CAPITALS = [
  // Europe
  p('London', 51.5074, -0.1278), p('Dublin', 53.3498, -6.2603), p('Paris', 48.8566, 2.3522),
  p('Madrid', 40.4168, -3.7038), p('Lisbon', 38.7223, -9.1393), p('Rome', 41.9028, 12.4964),
  p('Berlin', 52.52, 13.405), p('Amsterdam', 52.3676, 4.9041), p('Brussels', 50.8503, 4.3517),
  p('Luxembourg', 49.6116, 6.1319), p('Bern', 46.948, 7.4474), p('Vienna', 48.2082, 16.3738),
  p('Prague', 50.0755, 14.4378), p('Bratislava', 48.1486, 17.1077), p('Budapest', 47.4979, 19.0402),
  p('Warsaw', 52.2297, 21.0122), p('Copenhagen', 55.6761, 12.5683), p('Oslo', 59.9139, 10.7522),
  p('Stockholm', 59.3293, 18.0686), p('Helsinki', 60.1699, 24.9384), p('Reykjavík', 64.1466, -21.9426),
  p('Tallinn', 59.437, 24.7536), p('Riga', 56.9496, 24.1052), p('Vilnius', 54.6872, 25.2797),
  p('Ljubljana', 46.0569, 14.5058), p('Zagreb', 45.815, 15.9819), p('Belgrade', 44.7866, 20.4489),
  p('Sarajevo', 43.8563, 18.4131), p('Podgorica', 42.4304, 19.2594), p('Skopje', 41.9973, 21.428),
  p('Tirana', 41.3275, 19.8187), p('Sofia', 42.6977, 23.3219), p('Bucharest', 44.4268, 26.1025),
  p('Athens', 37.9838, 23.7275), p('Valletta', 35.8989, 14.5146), p('Andorra la Vella', 42.5063, 1.5218),
  p('Monaco', 43.7384, 7.4246), p('San Marino', 43.9424, 12.4578), p('Vaduz', 47.141, 9.5209),
  p('Kyiv', 50.4501, 30.5234), p('Moscow', 55.7558, 37.6173), p('Ankara', 39.9334, 32.8597),
  // Asia
  p('Tokyo', 35.6762, 139.6503), p('Seoul', 37.5665, 126.978), p('Taipei', 25.033, 121.5654),
  p('Bangkok', 13.7563, 100.5018), p('Phnom Penh', 11.5564, 104.9282), p('Vientiane', 17.9757, 102.6331),
  p('Kuala Lumpur', 3.139, 101.6869), p('Singapore', 1.2903, 103.8519), p('Jakarta', -6.2088, 106.8456),
  p('Manila', 14.5995, 120.9842), p('Dhaka', 23.8103, 90.4125), p('Colombo', 6.9271, 79.8612),
  p('New Delhi', 28.6139, 77.209), p('Ulaanbaatar', 47.8864, 106.9057), p('Astana', 51.1694, 71.4491),
  p('Bishkek', 42.8746, 74.5698), p('Jerusalem', 31.7683, 35.2137), p('Amman', 31.9454, 35.9284),
  p('Doha', 25.2854, 51.531), p('Beirut', 33.8938, 35.5018),
  // Americas
  p('Washington, D.C.', 38.9072, -77.0369), p('Ottawa', 45.4215, -75.6972), p('Mexico City', 19.4326, -99.1332),
  p('Guatemala City', 14.6349, -90.5069), p('San José', 9.9281, -84.0907), p('Panama City', 8.9824, -79.5199),
  p('Santo Domingo', 18.4861, -69.9312), p('Bogotá', 4.711, -74.0721), p('Quito', -0.1807, -78.4678),
  p('Lima', -12.0464, -77.0428), p('La Paz', -16.4897, -68.1193), p('Santiago', -33.4489, -70.6693),
  p('Buenos Aires', -34.6037, -58.3816), p('Montevideo', -34.9011, -56.1645), p('Brasília', -15.7975, -47.8919),
  // Africa
  p('Pretoria', -25.7479, 28.2293), p('Gaborone', -24.6282, 25.9231), p('Windhoek', -22.5609, 17.0658),
  p('Maseru', -29.3151, 27.4869), p('Mbabane', -26.3054, 31.1367), p('Nairobi', -1.2921, 36.8219),
  p('Kampala', 0.3476, 32.5825), p('Kigali', -1.9441, 30.0619), p('Dakar', 14.7167, -17.4677),
  p('Accra', 5.6037, -0.187), p('Abuja', 9.0765, 7.3986), p('Tunis', 36.8065, 10.1815),
  // Oceania
  p('Canberra', -35.2809, 149.13), p('Wellington', -41.2865, 174.7762),
];

export const BIG_CITIES = [
  // Asia
  p('Tokyo', 35.6762, 139.6503), p('Osaka', 34.6937, 135.5023), p('Nagoya', 35.1815, 136.9066),
  p('Seoul', 37.5665, 126.978), p('Busan', 35.1796, 129.0756), p('Taipei', 25.033, 121.5654),
  p('Bangkok', 13.7563, 100.5018), p('Jakarta', -6.2088, 106.8456), p('Surabaya', -7.2575, 112.7521),
  p('Manila', 14.5995, 120.9842), p('Kuala Lumpur', 3.139, 101.6869), p('Singapore', 1.3521, 103.8198),
  p('Mumbai', 19.076, 72.8777), p('Delhi', 28.7041, 77.1025), p('Kolkata', 22.5726, 88.3639),
  p('Bengaluru', 12.9716, 77.5946), p('Chennai', 13.0827, 80.2707), p('Hyderabad', 17.385, 78.4867),
  p('Dhaka', 23.8103, 90.4125), p('Istanbul', 41.0082, 28.9784), p('Dubai', 25.2048, 55.2708),
  // Europe
  p('Moscow', 55.7558, 37.6173), p('Saint Petersburg', 59.9311, 30.3609), p('London', 51.5074, -0.1278),
  p('Paris', 48.8566, 2.3522), p('Madrid', 40.4168, -3.7038), p('Barcelona', 41.3874, 2.1686),
  p('Berlin', 52.52, 13.405), p('Hamburg', 53.5511, 9.9937), p('Rome', 41.9028, 12.4964),
  p('Milan', 45.4642, 9.19), p('Warsaw', 52.2297, 21.0122), p('Kyiv', 50.4501, 30.5234),
  // Americas
  p('New York', 40.7128, -74.006), p('Los Angeles', 34.0522, -118.2437), p('Chicago', 41.8781, -87.6298),
  p('Houston', 29.7604, -95.3698), p('Philadelphia', 39.9526, -75.1652), p('San Francisco', 37.7749, -122.4194),
  p('Toronto', 43.6532, -79.3832), p('Montreal', 45.5019, -73.5674), p('Vancouver', 49.2827, -123.1207),
  p('Mexico City', 19.4326, -99.1332), p('Guadalajara', 20.6597, -103.3496), p('Monterrey', 25.6866, -100.3161),
  p('Bogotá', 4.711, -74.0721), p('Medellín', 6.2442, -75.5812), p('Lima', -12.0464, -77.0428),
  p('Santiago', -33.4489, -70.6693), p('Buenos Aires', -34.6037, -58.3816), p('São Paulo', -23.5505, -46.6333),
  p('Rio de Janeiro', -22.9068, -43.1729), p('Belo Horizonte', -19.9167, -43.9345),
  // Africa
  p('Johannesburg', -26.2041, 28.0473), p('Cape Town', -33.9249, 18.4241), p('Durban', -29.8587, 31.0218),
  p('Nairobi', -1.2921, 36.8219), p('Lagos', 6.5244, 3.3792), p('Accra', 5.6037, -0.187),
  // Oceania
  p('Sydney', -33.8688, 151.2093), p('Melbourne', -37.8136, 144.9631), p('Brisbane', -27.4698, 153.0251),
  p('Perth', -31.9505, 115.8605), p('Auckland', -36.8485, 174.7633),
];

// The round starts facing the landmark.
export const LANDMARKS = [
  // Europe
  p('Eiffel Tower', 48.8584, 2.2945), p('Arc de Triomphe', 48.8738, 2.295), p('Louvre', 48.8606, 2.3376),
  p('Notre-Dame', 48.853, 2.3499), p('Big Ben', 51.5007, -0.1246), p('Tower Bridge', 51.5055, -0.0754),
  p('Edinburgh Castle', 55.9486, -3.1999), p('Stonehenge', 51.1789, -1.8262),
  p('Brandenburg Gate', 52.5163, 13.3777), p('Cologne Cathedral', 50.9413, 6.9583),
  p('Atomium', 50.8949, 4.3415),
  p('Sagrada Família', 41.4036, 2.1744), p('Alhambra', 37.1761, -3.5881), p('Plaza Mayor, Madrid', 40.4155, -3.7074),
  p('Belém Tower', 38.6916, -9.216), p('Colosseum', 41.8902, 12.4922), p('Trevi Fountain', 41.9009, 12.4833),
  p("St. Peter's Square", 41.9022, 12.4568), p('Leaning Tower of Pisa', 43.723, 10.3966),
  p('Prague Castle', 50.0909, 14.4005), p('Charles Bridge', 50.0865, 14.4114),
  p('Hungarian Parliament', 47.507, 19.0456), p('Acropolis', 37.9715, 23.7257),
  p('Hagia Sophia', 41.0086, 28.9802), p('Red Square', 55.7539, 37.6208),
  // Americas
  p('Times Square', 40.758, -73.9855), p('White House', 38.8977, -77.0365), p('US Capitol', 38.8899, -77.0091),
  p('Golden Gate Bridge', 37.8199, -122.4783), p('Space Needle', 47.6205, -122.3493),
  p('Las Vegas Strip', 36.1147, -115.1728), p('CN Tower', 43.6426, -79.3871), p('Niagara Falls', 43.0828, -79.0742),
  p('Zócalo', 19.4326, -99.1332), p('Christ the Redeemer', -22.9519, -43.2105), p('Copacabana', -22.9711, -43.1822),
  p('Obelisco de Buenos Aires', -34.6037, -58.3816), p('Machu Picchu', -13.1631, -72.545),
  // Asia
  p('Shibuya Crossing', 35.6595, 139.7005), p('Tokyo Tower', 35.6586, 139.7454), p('Fushimi Inari', 34.9671, 135.7727),
  p('Gyeongbokgung', 37.5796, 126.977), p('Taipei 101', 25.034, 121.5645), p('Petronas Towers', 3.1579, 101.7116),
  p('Marina Bay Sands', 1.2834, 103.8607), p('Grand Palace, Bangkok', 13.75, 100.4913), p('Angkor Wat', 13.4125, 103.867),
  p('Taj Mahal', 27.1751, 78.0421), p('India Gate', 28.6129, 77.2295), p('Gateway of India', 18.922, 72.8347),
  p('Western Wall', 31.7767, 35.2345), p('Petra', 30.3285, 35.4444), p('Burj Khalifa', 25.1972, 55.2744),
  p('Sheikh Zayed Mosque', 24.4128, 54.4749),
  // Africa
  p('Pyramids of Giza', 29.9792, 31.1342),
  // Oceania
  p('Sydney Opera House', -33.8568, 151.2153), p('Sydney Harbour Bridge', -33.8523, 151.2108), p('Uluru', -25.3444, 131.0369),
];

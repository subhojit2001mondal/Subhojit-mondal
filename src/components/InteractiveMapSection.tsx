import React, { useState, useEffect, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
  ColorScheme
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  HeartPulse,
  Car,
  Footprints,
  ExternalLink,
  PhoneCall,
  Sparkles,
  Mountain,
  Building,
  CheckCircle2,
  ChevronRight,
  Search,
  Layers,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  RefreshCw,
  Camera,
  Star
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface Landmark {
  id: string;
  name: string;
  distance: string;
  distanceKm: number;
  walkTime: string;
  driveTime: string;
  category: 'medical' | 'sightseeing' | 'transit' | 'market' | 'nature' | 'pass';
  categoryLabel: string;
  lat: number;
  lng: number;
  description: string;
  travelTip: string;
  googleMapQuery: string;
  imageUrl?: string;
  altitude?: string;
  isCustomPlace?: boolean;
}

interface PropertyMapData {
  id: 'gangtok' | 'kalyani';
  name: string;
  subtitle: string;
  location: string;
  address: string;
  badge: string;
  hotelIcon: 'mountain' | 'building';
  color: string;
  center: { lat: number; lng: number };
  googleDirectionsUrl: string;
  landmarks: Landmark[];
}

const GANGTOK_MAP_DATA: PropertyMapData = {
  id: 'gangtok',
  name: 'Trikuta Residency',
  subtitle: 'Gangtok, Sikkim',
  location: 'Near District Court, Upper Sichey',
  address: 'Trikuta Residency, Upper Sichey, Gangtok, Sikkim 737101',
  badge: '7 mins to MG Marg · Kanchenjunga Valley Views',
  hotelIcon: 'mountain',
  color: 'amber',
  center: { lat: 27.3389, lng: 88.6083 },
  googleDirectionsUrl: 'https://maps.app.goo.gl/UXcc68jGZGVdVyPW9',
  landmarks: [
    {
      id: 'g-mgmarg',
      name: 'MG Marg Promenade & Town Centre',
      distance: '1.2 km',
      distanceKm: 1.2,
      walkTime: '7 mins walk',
      driveTime: '4 mins cab',
      category: 'market',
      categoryLabel: 'Promenade & Cafes',
      lat: 27.3294,
      lng: 88.6128,
      altitude: '5,410 ft',
      description: 'Vehicle-free pedestrian promenade with European-style mountain cafes, Sikkimese craft stores, bakeries, and evening valley lights.',
      travelTip: 'Pedestrian only. Great for warm evening tea, momos, and handicraft shopping.',
      googleMapQuery: 'MG+Marg+Gangtok',
      imageUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'g-ridge',
      name: 'Ridge Park & Flower Exhibition',
      distance: '400 m',
      distanceKm: 0.4,
      walkTime: '4 mins walk',
      driveTime: '2 mins',
      category: 'nature',
      categoryLabel: 'Botanical & Orchid Walk',
      lat: 27.3367,
      lng: 88.6148,
      altitude: '5,600 ft',
      description: 'Lush botanical walkway and year-round orchid greenhouse with colorful Himalayan flora overlooking mountain mists.',
      travelTip: 'Gentle, scenic stroll along Ridge road; highly recommended for fresh morning walks.',
      googleMapQuery: 'Flower+Exhibition+Centre+Gangtok'
    },
    {
      id: 'g-enchey',
      name: 'Enchey Monastery (200-yr-old)',
      distance: '1.6 km',
      distanceKm: 1.6,
      walkTime: '15 mins walk',
      driveTime: '5 mins',
      category: 'sightseeing',
      categoryLabel: 'Historic Buddhist Shrine',
      lat: 27.3353,
      lng: 88.6186,
      altitude: '5,800 ft',
      description: 'Historic Nyingma monastery blessed by Lama Druptob Karpo with panoramic Kanchenjunga backdrop and peaceful prayer halls.',
      travelTip: 'Peaceful morning prayer chants; dress respectfully and remove shoes at the shrine hall.',
      googleMapQuery: 'Enchey+Monastery+Gangtok'
    },
    {
      id: 'g-ropeway',
      name: 'Gangtok Cable Car (Ropeway)',
      distance: '2.1 km',
      distanceKm: 2.1,
      walkTime: '22 mins walk',
      driveTime: '7 mins',
      category: 'sightseeing',
      categoryLabel: '360° Aerial Cable Car',
      lat: 27.3195,
      lng: 88.6105,
      altitude: '5,300 ft',
      description: 'Zig-zag cable car connecting Deorali Bazar with Tashiling Secretariat over forested pine gorges and cascading valleys.',
      travelTip: 'Clear sunny mornings offer breathtaking 360-degree aerial photographs across Gangtok valley.',
      googleMapQuery: 'Gangtok+Ropeway'
    },
    {
      id: 'g-deorali',
      name: 'Deorali Shared Taxi Stand & Permit Point',
      distance: '2.4 km',
      distanceKm: 2.4,
      walkTime: '25 mins walk',
      driveTime: '8 mins cab',
      category: 'transit',
      categoryLabel: 'Transit & Permit Hub',
      lat: 27.3188,
      lng: 88.6095,
      altitude: '5,200 ft',
      description: 'Primary departure terminus for shared cabs to Siliguri, NJP, Bagdogra & Nathula Pass protected area checkpoints.',
      travelTip: 'Book early morning slots for smoother travel; front desk can coordinate private doorstep pickups.',
      googleMapQuery: 'Deorali+Taxi+Stand+Gangtok'
    },
    {
      id: 'g-banjhakri',
      name: 'Banjhakri Falls & Energy Park',
      distance: '6.2 km',
      distanceKm: 6.2,
      walkTime: 'N/A',
      driveTime: '18 mins cab',
      category: 'nature',
      categoryLabel: 'Cascading Mountain Waterfall',
      lat: 27.3486,
      lng: 88.5912,
      altitude: '5,100 ft',
      description: '100-foot natural cascading waterfall nestled within manicured sub-tropical gardens and traditional Shamanic sculptures.',
      travelTip: 'Ideal afternoon excursion; taxi can wait for round-trip return to hotel.',
      googleMapQuery: 'Banjhakri+Falls+Gangtok'
    },
    {
      id: 'g-tsomgo',
      name: 'Tsomgo (Changu) Lake',
      distance: '38 km',
      distanceKm: 38.0,
      walkTime: 'Day Trip',
      driveTime: '1.5 hrs 4x4 cab',
      category: 'pass',
      categoryLabel: 'Glacial Alpine Sanctuary',
      lat: 27.3742,
      lng: 88.7619,
      altitude: '12,310 ft',
      description: 'High-altitude sacred glacial lake reflecting Himalayan peaks and yak trails. Frozen in winter and surrounded by wildflowers in spring.',
      travelTip: 'Protected Area Permit required (handled by our in-house Travel Desk with Voter ID and 2 photos).',
      googleMapQuery: 'Tsomgo+Lake+Sikkim',
      imageUrl: '/images/destinations/tsomgo-lake.jpg'
    },
    {
      id: 'g-nathula',
      name: 'Nathula Pass Indo-China Border',
      distance: '56 km',
      distanceKm: 56.0,
      walkTime: 'Excursion',
      driveTime: '2.5 hrs 4x4 cab',
      category: 'pass',
      categoryLabel: 'Historic Old Silk Route',
      lat: 27.3865,
      lng: 88.8309,
      altitude: '14,140 ft',
      description: 'Legendary high-altitude mountain frontier winding through Himalayan snows and Indian army posts along the historic Old Silk Route.',
      travelTip: 'Carry warm thermals, gloves, and sunglasses. Permit coordination available at our front desk.',
      googleMapQuery: 'Nathu+La+Pass+Sikkim',
      imageUrl: '/images/destinations/nathula-pass.jpg'
    },
    {
      id: 'g-babamandir',
      name: 'Baba Harbhajan Singh Mandir',
      distance: '52 km',
      distanceKm: 52.0,
      walkTime: 'Excursion',
      driveTime: '2.2 hrs 4x4 cab',
      category: 'sightseeing',
      categoryLabel: 'Revered Mountain Frontier Shrine',
      lat: 27.3942,
      lng: 88.8211,
      altitude: '13,123 ft',
      description: 'Revered mountain shrine dedicated to soldier-saint Baba Harbhajan Singh, draped in prayer flags above the cloud line.',
      travelTip: 'Seamlessly combined on the Tsomgo Lake - Nathula Pass same-day tourist circuit.',
      googleMapQuery: 'Baba+Harbhajan+Singh+Temple+Sikkim'
    },
    {
      id: 'g-yumthang',
      name: 'Yumthang Valley (Valley of Flowers)',
      distance: '140 km',
      distanceKm: 140.0,
      walkTime: 'North Sikkim 2N/3D',
      driveTime: 'North Sikkim Tour',
      category: 'nature',
      categoryLabel: 'Himalayan Valley of Flowers',
      lat: 27.7954,
      lng: 88.6961,
      altitude: '11,693 ft',
      description: 'Celebrated Valley of Flowers featuring blooming rhododendrons, alpine river meadows, and hot springs surrounded by snow-clad peaks.',
      travelTip: 'Arranged as part of our signature Lachung-Yumthang 2N/3D tour package departing from Gangtok.',
      googleMapQuery: 'Yumthang+Valley+Sikkim',
      imageUrl: '/images/destinations/yumthang-valley.jpg'
    },
    {
      id: 'g-rumtek',
      name: 'Rumtek Dharma Chakra Centre',
      distance: '24 km',
      distanceKm: 24.0,
      walkTime: 'Day Excursion',
      driveTime: '50 mins cab',
      category: 'sightseeing',
      categoryLabel: 'Seat of the Karmapa',
      lat: 27.3023,
      lng: 88.5683,
      altitude: '4,900 ft',
      description: 'One of the grandest Buddhist monasteries in Sikkim, featuring golden stupas, intricate murals, and sacred Tibetan relics.',
      travelTip: 'Scenic drive across lush valleys; visit in afternoon for gentle sunlight across the main courtyard.',
      googleMapQuery: 'Rumtek+Monastery+Gangtok'
    },
    {
      id: 'g-ganeshtok',
      name: 'Ganesh Tok & Hanuman Tok',
      distance: '4.5 km',
      distanceKm: 4.5,
      walkTime: 'N/A',
      driveTime: '14 mins cab',
      category: 'sightseeing',
      categoryLabel: 'Panoramic Valley Viewpoints',
      lat: 27.3475,
      lng: 88.6315,
      altitude: '6,500 ft',
      description: 'Hilltop circular viewpoint shrines with telescope pavilions offering unobstructed vistas of Mount Kanchenjunga and Gangtok town.',
      travelTip: 'Visit before 9:00 AM on clear mornings for crystal clear snow-peak panoramas.',
      googleMapQuery: 'Ganesh+Tok+Gangtok'
    }
  ]
};

const KALYANI_MAP_DATA: PropertyMapData = {
  id: 'kalyani',
  name: 'Hotel Parijaye',
  subtitle: 'Kalyani, West Bengal',
  location: 'Basantapur, Near AIIMS Kalyani',
  address: 'Hotel Parijaye, Basantapur, NH-12 Connector, Kalyani, West Bengal 741246',
  badge: '800 meters (2-3 mins) to AIIMS OPD Gate · Quiet Recovery',
  hotelIcon: 'building',
  color: 'emerald',
  center: { lat: 22.9734, lng: 88.435 },
  googleDirectionsUrl: 'https://maps.app.goo.gl/AjjMa723DRpFGUe36?g_st=ac',
  landmarks: [
    {
      id: 'k-aiims-opd',
      name: 'AIIMS Kalyani OPD Gate 1',
      distance: '800 m',
      distanceKm: 0.8,
      walkTime: '8 mins walk',
      driveTime: '2 mins (Free Shuttle)',
      category: 'medical',
      categoryLabel: 'Outpatient Clinic',
      lat: 22.9699,
      lng: 88.5204,
      description: 'Primary patient entrance for morning doctor appointments, registrations, and specialist diagnostic consults.',
      travelTip: 'Our complimentary electric shuttle leaves every 20 minutes from the hotel lobby.',
      googleMapQuery: 'AIIMS+Kalyani+Gate+1'
    },
    {
      id: 'k-aiims-emergency',
      name: 'AIIMS 24/7 Emergency & Trauma Centre',
      distance: '950 m',
      distanceKm: 0.95,
      walkTime: '10 mins walk',
      driveTime: '3 mins',
      category: 'medical',
      categoryLabel: '24/7 Tertiary Trauma Care',
      lat: 22.9712,
      lng: 88.5218,
      description: 'Full tertiary emergency wing, rapid ambulance triage, and round-the-clock intensive medical treatment facilities.',
      travelTip: 'Front desk keeps an on-call driver available 24/7 for urgent patient needs.',
      googleMapQuery: 'AIIMS+Kalyani+Emergency'
    },
    {
      id: 'k-pharmacy',
      name: '24/7 Janaushadhi & Chemist Hub',
      distance: '600 m',
      distanceKm: 0.6,
      walkTime: '6 mins walk',
      driveTime: '2 mins',
      category: 'medical',
      categoryLabel: 'Subsidized Pharmacy Hub',
      lat: 22.9705,
      lng: 88.5195,
      description: 'Subsidized generic medicines, surgical disposables, oxygen canisters, and certified pharmacy counters.',
      travelTip: 'Hotel staff can coordinate urgent medicine deliveries directly to your guest suite.',
      googleMapQuery: 'Medicine+Shop+near+AIIMS+Kalyani'
    },
    {
      id: 'k-kalyani-jn',
      name: 'Kalyani Main Railway Junction',
      distance: '4.8 km',
      distanceKm: 4.8,
      walkTime: 'N/A',
      driveTime: '12 mins cab',
      category: 'transit',
      categoryLabel: 'Eastern Railway Main Junction',
      lat: 22.9751,
      lng: 88.4285,
      description: 'Major junction on Eastern Railway connecting to Sealdah (Kolkata) in 75 minutes with direct suburban trains every 15 mins.',
      travelTip: 'Frequent local trains run to Sealdah, Ranaghat, and Naihati. Pre-booked cabs available at hotel desk.',
      googleMapQuery: 'Kalyani+Railway+Station'
    },
    {
      id: 'k-nh12',
      name: 'NH-12 (Kolkata-Siliguri Express Highway)',
      distance: '1.4 km',
      distanceKm: 1.4,
      walkTime: '14 mins walk',
      driveTime: '4 mins',
      category: 'transit',
      categoryLabel: 'National Expressway Connector',
      lat: 22.965,
      lng: 88.445,
      description: 'Smooth 4-lane arterial expressway connecting to Kolkata Airport (50 mins) and North Bengal express corridors.',
      travelTip: 'Direct, congestion-free highway access to Kolkata Netaji Subhash Chandra Bose Airport.',
      googleMapQuery: 'NH12+Kalyani+Connector'
    },
    {
      id: 'k-picnic',
      name: 'Kalyani Central Park & Lake Respite',
      distance: '3.2 km',
      distanceKm: 3.2,
      walkTime: '30 mins walk',
      driveTime: '8 mins cab',
      category: 'nature',
      categoryLabel: 'Serene Botanical Lake Park',
      lat: 22.9832,
      lng: 88.4412,
      description: 'Sprawling lakeside botanical park with shaded benches, flowering gardens, migratory birds, and paved walking circuits.',
      travelTip: 'Soothing afternoon natural respite for patient attendants seeking fresh air and calm.',
      googleMapQuery: 'Central+Park+Kalyani'
    },
    {
      id: 'k-stadium',
      name: 'Kalyani Stadium & Sports Complex',
      distance: '3.8 km',
      distanceKm: 3.8,
      walkTime: 'N/A',
      driveTime: '9 mins cab',
      category: 'sightseeing',
      categoryLabel: 'National Sports Arena',
      lat: 22.986,
      lng: 88.432,
      description: 'Premier football and multi-sport stadium hosting I-League and national athletic meets in lush planned surroundings.',
      travelTip: 'Wide open perimeter boulevard pleasant for early morning jogs.',
      googleMapQuery: 'Kalyani+Stadium'
    },
    {
      id: 'k-university',
      name: 'University of Kalyani Main Campus',
      distance: '4.2 km',
      distanceKm: 4.2,
      walkTime: 'N/A',
      driveTime: '10 mins cab',
      category: 'sightseeing',
      categoryLabel: 'Academic & Research Hub',
      lat: 22.9905,
      lng: 88.448,
      description: 'Renowned state university campus featuring sprawling tree-lined avenues, research institutes, and quiet open quadrangles.',
      travelTip: 'Ideal for visiting academic faculty and examination candidates.',
      googleMapQuery: 'University+of+Kalyani'
    }
  ]
};

// Polyline component rendering the direct short map connection
function ShortMapPolyline({
  origin,
  destination,
  isAmber
}: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  isAmber: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const strokeColor = isAmber ? '#f59e0b' : '#10b981';

    const polyline = new google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor,
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map
    });

    // Auto-fit bounds so both the hotel and destination are visible ("the short map")
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    map.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 });

    return () => {
      polyline.setMap(null);
    };
  }, [map, origin, destination, isAmber]);

  return null;
}

interface InteractiveMapSectionProps {
  selectedProperty?: 'gangtok' | 'kalyani';
}

export const InteractiveMapSection: React.FC<InteractiveMapSectionProps> = ({
  selectedProperty = 'gangtok'
}) => {
  const { isNight } = useTheme();

  const data = selectedProperty === 'gangtok' ? GANGTOK_MAP_DATA : KALYANI_MAP_DATA;
  const isAmber = selectedProperty === 'gangtok';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [customPlaces, setCustomPlaces] = useState<Landmark[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Active selected landmark
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>(
    selectedProperty === 'gangtok' ? 'g-mgmarg' : 'k-aiims-opd'
  );

  // InfoWindow open state
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(true);

  // Map view type (roadmap vs hybrid/satellite)
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Fullscreen expansion toggle
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Places Library Hook for modern text search
  const placesLibrary = useMapsLibrary('places');

  // Reset states when property switches
  useEffect(() => {
    setSelectedLandmarkId(selectedProperty === 'gangtok' ? 'g-mgmarg' : 'k-aiims-opd');
    setSearchQuery('');
    setSelectedCategory('all');
    setCustomPlaces([]);
    setSearchError(null);
    setIsInfoWindowOpen(true);
  }, [selectedProperty]);

  // Combined landmark pool (curated + dynamically searched places)
  const allLandmarks = useMemo(() => {
    return [...customPlaces, ...data.landmarks];
  }, [customPlaces, data.landmarks]);

  // Filtered landmarks based on category and search query
  const filteredLandmarks = useMemo(() => {
    return allLandmarks.filter((landmark) => {
      const matchesCategory =
        selectedCategory === 'all' || landmark.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        landmark.name.toLowerCase().includes(q) ||
        landmark.categoryLabel.toLowerCase().includes(q) ||
        landmark.description.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [allLandmarks, selectedCategory, searchQuery]);

  const activeLandmark =
    allLandmarks.find((l) => l.id === selectedLandmarkId) || allLandmarks[0];

  // Dynamic Google Maps Places API search handler
  const handlePerformPlacesSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (!placesLibrary) {
      setSearchError('Google Maps Places API is initializing...');
      return;
    }

    try {
      setIsSearchingPlaces(true);
      setSearchError(null);

      // Using modern Place.searchByText (Zero-Legacy Places API New)
      const { places } = await google.maps.places.Place.searchByText({
        textQuery: `${query} in ${data.subtitle}`,
        fields: ['displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount'],
        locationBias: data.center,
        maxResultCount: 5
      });

      if (places && places.length > 0) {
        const generatedPlaces: Landmark[] = places.map((place: google.maps.places.Place, idx: number) => {
          const lat = place.location?.lat() || data.center.lat;
          const lng = place.location?.lng() || data.center.lng;

          // Estimate approximate straight-line distance in km
          const dLat = (lat - data.center.lat) * 111;
          const dLng =
            (lng - data.center.lng) *
            111 *
            Math.cos((data.center.lat * Math.PI) / 180);
          const distKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;

          return {
            id: `places-search-${idx}-${Date.now()}`,
            name: place.displayName || query,
            distance: `${distKm} km`,
            distanceKm: distKm,
            walkTime: distKm <= 1.5 ? `${Math.round(distKm * 12)} mins walk` : 'Cab recommended',
            driveTime: `${Math.max(2, Math.round(distKm * 3.5))} mins cab`,
            category: 'sightseeing',
            categoryLabel: 'Verified Google Places Result',
            lat,
            lng,
            description:
              place.formattedAddress ||
              `Live destination retrieved from Google Maps Places in ${data.subtitle}.`,
            travelTip: 'Point of interest verified live via Google Maps Platform.',
            googleMapQuery: place.displayName || query,
            isCustomPlace: true
          };
        });

        setCustomPlaces(generatedPlaces);
        if (generatedPlaces[0]) {
          setSelectedLandmarkId(generatedPlaces[0].id);
          setIsInfoWindowOpen(true);
        }
      } else {
        setSearchError(`No live places found for "${query}". Try landmarks like "Monastery", "Lake", or "AIIMS".`);
      }
    } catch (err: unknown) {
      console.error('Google Maps Places API Search error:', err);
      const msg = String(err);
      if (
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('OVER_QUERY_LIMIT') ||
        msg.includes('QuotaExceeded')
      ) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      setSearchError('Search quota reached or network error. You can continue browsing our curated destinations.');
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const categories =
    selectedProperty === 'gangtok'
      ? [
          { id: 'all', label: 'All Destinations' },
          { id: 'market', label: 'Town Center & Promenade' },
          { id: 'pass', label: 'Glacial Lakes & Passes' },
          { id: 'sightseeing', label: 'Monasteries & Heritage' },
          { id: 'nature', label: 'Waterfalls & Gardens' },
          { id: 'transit', label: 'Transit & Permits' }
        ]
      : [
          { id: 'all', label: 'All Locations' },
          { id: 'medical', label: 'AIIMS & Healthcare' },
          { id: 'transit', label: 'Railway & Expressways' },
          { id: 'nature', label: 'Parks & Recreation' },
          { id: 'sightseeing', label: 'Township & Campus' }
        ];

  return (
    <section
      id="interactive-map"
      className={`py-14 sm:py-20 border-t transition-colors duration-500 relative ${
        isNight ? 'bg-slate-950 text-slate-100 border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'
      } ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto p-4' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2.5 border shadow-xs ${
                isAmber
                  ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Google Maps Platform · Live Destination & Route Navigator</span>
            </div>

            <h2
              className={`text-2xl sm:text-4xl font-serif font-bold tracking-tight ${
                isNight ? 'text-white' : 'text-slate-950'
              }`}
            >
              Discover Regional Destinations from {data.name}
            </h2>

            <p className={`mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed ${isNight ? 'text-slate-400' : 'text-slate-600'}`}>
              Interactive Google Map navigation with direct short paths, verified drive & walk transit times,
              and live Google Places discovery centered at{' '}
              <strong className={isAmber ? 'text-amber-400' : 'text-emerald-400'}>
                {data.name}
              </strong>
              .
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isNight
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expand Map</span>
                </>
              )}
            </button>

            <a
              href={data.googleDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isAmber
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps App</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div
          className={`p-4 rounded-2xl border shadow-sm space-y-3 ${
            isNight ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
            {/* Search Input */}
            <form onSubmit={handlePerformPlacesSearch} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  selectedProperty === 'gangtok'
                    ? 'Find destinations (e.g. Nathula, Tsomgo, MG Marg, Monasteries)...'
                    : 'Find locations (e.g. AIIMS OPD, Emergency, Chemist, Station)...'
                }
                className={`w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all ${
                  isNight
                    ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-amber-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                }`}
              />
              <button
                type="submit"
                disabled={isSearchingPlaces || !searchQuery.trim()}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isAmber
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                }`}
              >
                {isSearchingPlaces ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Searching</span>
                  </span>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </form>

            {/* Map Type Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/20 border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMapTypeId('roadmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapTypeId === 'roadmap'
                    ? isAmber
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Roadmap</span>
              </button>
              <button
                type="button"
                onClick={() => setMapTypeId('hybrid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapTypeId === 'hybrid'
                    ? isAmber
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Satellite</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? isAmber
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : isNight
                      ? 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search feedback & clear filter */}
          {(searchQuery || selectedCategory !== 'all' || customPlaces.length > 0) && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>
                Showing <strong>{filteredLandmarks.length}</strong> matching destination
                {filteredLandmarks.length === 1 ? '' : 's'}
                {customPlaces.length > 0 && ` (${customPlaces.length} live from Google Places)`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setCustomPlaces([]);
                  setSearchError(null);
                }}
                className="underline hover:text-amber-400 cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}

          {searchError && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              {searchError}
            </div>
          )}
        </div>

        {/* MAIN CLASSIC GOOGLE MAP & DESTINATIONS SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7-COLUMNS: The Real Google Map */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div
              className={`relative rounded-3xl overflow-hidden border shadow-2xl transition-all ${
                isNight ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-white'
              }`}
              style={{ height: isFullscreen ? '70vh' : '520px', width: '100%' }}
            >
              <Map
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                defaultCenter={data.center}
                defaultZoom={12}
                mapTypeId={mapTypeId}
                colorScheme={isNight ? ColorScheme.DARK : ColorScheme.LIGHT}
                gestureHandling="cooperative"
                disableDefaultUI={false}
                style={{ width: '100%', height: '100%' }}
              >
                {/* Short Map Direct Polyline Connection */}
                {activeLandmark && (
                  <ShortMapPolyline
                    origin={data.center}
                    destination={{ lat: activeLandmark.lat, lng: activeLandmark.lng }}
                    isAmber={isAmber}
                  />
                )}

                {/* Hotel Origin Advanced Marker */}
                <AdvancedMarker
                  position={data.center}
                  title={`${data.name} (Hotel Origin)`}
                  zIndex={40}
                  onClick={() => setIsInfoWindowOpen(true)}
                >
                  <div className="relative group cursor-pointer flex flex-col items-center">
                    <span
                      className={`absolute w-10 h-10 rounded-full animate-ping opacity-75 ${
                        isAmber ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    <div
                      className={`relative px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 font-bold text-slate-950 shadow-2xl border-2 border-white ${
                        isAmber
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/50'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/50'
                      }`}
                    >
                      {data.hotelIcon === 'mountain' ? (
                        <Mountain className="w-4 h-4 text-slate-950" />
                      ) : (
                        <Building className="w-4 h-4 text-slate-950" />
                      )}
                      <span className="text-[11px] whitespace-nowrap font-serif">
                        ★ {data.name}
                      </span>
                    </div>
                  </div>
                </AdvancedMarker>

                {/* Destinations Advanced Markers */}
                {filteredLandmarks.map((landmark) => {
                  const isSelected = landmark.id === activeLandmark?.id;

                  return (
                    <AdvancedMarker
                      key={landmark.id}
                      position={{ lat: landmark.lat, lng: landmark.lng }}
                      title={`${landmark.name} (${landmark.distance})`}
                      zIndex={isSelected ? 35 : 20}
                      onClick={() => {
                        setSelectedLandmarkId(landmark.id);
                        setIsInfoWindowOpen(true);
                      }}
                    >
                      <Pin
                        background={
                          isSelected
                            ? isAmber
                              ? '#f59e0b'
                              : '#10b981'
                            : landmark.category === 'pass'
                            ? '#0284c7'
                            : landmark.category === 'medical'
                            ? '#e11d48'
                            : landmark.category === 'transit'
                            ? '#059669'
                            : landmark.category === 'market'
                            ? '#8b5cf6'
                            : '#334155'
                        }
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                        scale={isSelected ? 1.3 : 0.95}
                      />
                    </AdvancedMarker>
                  );
                })}

                {/* Active Landmark InfoWindow */}
                {activeLandmark && isInfoWindowOpen && (
                  <InfoWindow
                    position={{ lat: activeLandmark.lat, lng: activeLandmark.lng }}
                    onCloseClick={() => setIsInfoWindowOpen(false)}
                    maxWidth={300}
                  >
                    <div className="p-1 text-slate-900">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {activeLandmark.categoryLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold ml-auto">
                          {activeLandmark.distance}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm leading-tight text-slate-950">
                        {activeLandmark.name}
                      </h4>

                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-snug">
                        {activeLandmark.description}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-semibold text-slate-700">
                        <span>Drive: {activeLandmark.driveTime}</span>
                        <span>Walk: {activeLandmark.walkTime}</span>
                      </div>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                          data.address
                        )}&destination=${encodeURIComponent(
                          `${activeLandmark.lat},${activeLandmark.lng}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 block text-center py-1.5 px-3 rounded-lg bg-slate-950 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors"
                      >
                        Navigate with Google Maps →
                      </a>
                    </div>
                  </InfoWindow>
                )}
              </Map>

              {/* In-Map Short Map Metric Badge */}
              {activeLandmark && (
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/20 text-white shadow-xl flex items-center gap-2 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAmber ? 'bg-amber-400' : 'bg-emerald-400'
                      } animate-pulse`}
                    />
                    <span className="font-semibold truncate max-w-[160px] sm:max-w-[220px]">
                      {activeLandmark.name}
                    </span>
                    <span className="text-white/40">|</span>
                    <span
                      className={`font-mono font-bold ${
                        isAmber ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {activeLandmark.distance}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick helper note under map */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Showing direct shortest route line between {data.name} and selected landmark.
                </span>
              </span>
              <span className="hidden sm:inline font-mono">
                {activeLandmark ? `${activeLandmark.lat.toFixed(4)}, ${activeLandmark.lng.toFixed(4)}` : ''}
              </span>
            </div>
          </div>

          {/* RIGHT 5-COLUMNS: Destination Details & Interactive Destination List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Destination Card */}
            {activeLandmark && (
              <div
                className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
                  isNight ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {/* Photo preview if available (e.g. for Yumthang, Tsomgo, Nathula) */}
                {activeLandmark.imageUrl && (
                  <div className="relative h-36 w-full -mt-5 -mx-5 mb-4 overflow-hidden rounded-t-3xl">
                    <img
                      src={activeLandmark.imageUrl}
                      alt={activeLandmark.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <span className="absolute bottom-2.5 left-4 text-[11px] font-bold text-white px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs border border-white/20">
                      Scenic Photo Preview
                    </span>
                    {activeLandmark.altitude && (
                      <span className="absolute bottom-2.5 right-4 text-[11px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs border border-white/20">
                        {activeLandmark.altitude}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      isAmber
                        ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {activeLandmark.categoryLabel}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    From {data.name}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-bold leading-snug">
                  {activeLandmark.name}
                </h3>

                {/* Transit Metric Badges */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div
                    className={`p-2.5 rounded-2xl border text-center ${
                      isNight ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 mx-auto mb-1 ${isAmber ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span className="font-mono text-sm sm:text-base font-bold block">{activeLandmark.distance}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Distance</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-2xl border text-center ${
                      isNight ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Footprints className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                    <span className="font-semibold text-xs block leading-tight mt-1">{activeLandmark.walkTime}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">Walking</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-2xl border text-center ${
                      isNight ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Car className={`w-4 h-4 mx-auto mb-1 ${isAmber ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-xs block leading-tight mt-1">{activeLandmark.driveTime}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">Drive / Cab</span>
                  </div>
                </div>

                <p className={`text-xs mt-3 leading-relaxed ${isNight ? 'text-slate-300' : 'text-slate-600'}`}>
                  {activeLandmark.description}
                </p>

                {/* Local Travel Tip */}
                <div
                  className={`mt-3.5 p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    isAmber
                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-200'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <strong className="block text-[10px] uppercase tracking-wider opacity-90">
                      Local Concierge Advice:
                    </strong>
                    <span className="opacity-95 leading-relaxed text-[11px]">
                      {activeLandmark.travelTip}
                    </span>
                  </div>
                </div>

                {/* Turn-by-Turn Navigation & Front Desk CTA */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2.5">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                      data.address
                    )}&destination=${encodeURIComponent(
                      `${activeLandmark.lat},${activeLandmark.lng}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isAmber
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions in Google Maps</span>
                  </a>

                  <a
                    href="tel:+919163008361"
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors shadow-xs ${
                      isNight
                        ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                        : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                    title="Call Reception / Travel Desk"
                  >
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                  </a>
                </div>
              </div>
            )}

            {/* Scrollable Destination List */}
            <div
              className={`rounded-2xl border p-4 space-y-2 text-xs ${
                isNight ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span>Select Any Destination to Map</span>
                <span>{filteredLandmarks.length} Locations</span>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredLandmarks.map((item) => {
                  const isItemActive = item.id === activeLandmark?.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedLandmarkId(item.id);
                        setIsInfoWindowOpen(true);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                        isItemActive
                          ? isAmber
                            ? 'bg-amber-400/20 text-white border border-amber-400/40 font-semibold'
                            : 'bg-emerald-500/20 text-white border border-emerald-500/40 font-semibold'
                          : isNight
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isItemActive
                              ? isAmber
                                ? 'bg-amber-400 ring-2 ring-amber-300/40'
                                : 'bg-emerald-400 ring-2 ring-emerald-300/40'
                              : 'bg-slate-500'
                          }`}
                        />
                        <div className="truncate">
                          <span className="block truncate font-medium">{item.name}</span>
                          <span className="block text-[10px] text-slate-400 leading-none">
                            {item.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2 font-mono">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-md ${
                            isItemActive
                              ? isAmber
                                ? 'bg-slate-950 text-amber-300 font-bold'
                                : 'bg-slate-950 text-emerald-300 font-bold'
                              : isNight
                              ? 'bg-slate-950 text-slate-400'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.distance}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

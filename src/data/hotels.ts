export interface Room {
  id: string;
  propertyId: 'gangtok' | 'kalyani';
  name: string;
  tagline: string;
  sqft: number;
  bed: string;
  occupancy: string;
  pricePerNight: number;
  originalPrice: number;
  remainingRooms: number;
  freeCancellation: boolean;
  images: string[];
  amenities: string[];
  purposeTags: ('leisure' | 'medical' | 'corporate')[];
}

export interface HotelGalleryPhoto {
  id: string;
  url: string;
  title: string;
  caption: string;
  category: 'exterior' | 'balcony' | 'rooms' | 'dining';
  tag: string;
}

export interface Property {
  id: 'gangtok' | 'kalyani';
  name: string;
  subtitle: string;
  location: string;
  district: string;
  landmark: string;
  distanceToLandmark: string;
  rating: number;
  reviewCount: number;
  tripAdvisorRating: number;
  startingPrice: number;
  vibe: string;
  description: string;
  image: string;
  gallery: HotelGalleryPhoto[];
  highlights: string[];
  keyAmenities: { name: string; icon: string; description: string }[];
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapQuery: string;
  mapUrl: string;
}

export interface BookingAddOn {
  id: string;
  propertyId: 'gangtok' | 'kalyani';
  name: string;
  description: string;
  price: number;
  recommendedFor: 'leisure' | 'medical' | 'corporate';
}

export interface BookingConfirmationSummary {
  bookingRef: string;
  propertyId: 'gangtok' | 'kalyani';
  propertyName: string;
  propertyLocation: string;
  propertyPhone: string;
  propertyWhatsapp: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  childrenCount: number;
  purpose: 'leisure' | 'medical' | 'corporate';
  selectedAddOns: { name: string; price: number }[];
  baseTariff: number;
  addOnsTotal: number;
  gst: number;
  grandTotal: number;
  paymentMethod: string;
  specialNeeds?: string;
  createdAt: string;
}

export const PROPERTIES: Record<'gangtok' | 'kalyani', Property> = {
  gangtok: {
    id: 'gangtok',
    name: 'Trikuta Residency',
    subtitle: 'Parijay Group of Hotels',
    location: 'Gangtok, Sikkim',
    district: 'East Sikkim',
    landmark: 'near District Court, Upper Sichey',
    distanceToLandmark: '7 mins to MG Marg',
    rating: 4.7,
    reviewCount: 382,
    tripAdvisorRating: 4.6,
    startingPrice: 2250,
    vibe: 'Serene Himalayan mountain retreat, valley views & cozy timber aesthetics',
    description: 'Perched in the tranquil hill slopes of Gangtok near District Court, Trikuta Residency offers pristine views of the Kanchenjunga range, cedar-insulated rooms with electric bed warmers, authentic Sikkimese & Indian cuisine, and seamless tour permits desk.',
    image: '',
    gallery: [],
    highlights: [
      'Unobstructed Kanchenjunga mountain and pine valley views',
      'Individual electric bed warmers & room heaters for mountain comfort',
      'In-house Sikkimese organic specialty dining + North/South Indian',
      'Dedicated Travel Desk for Nathula Pass, Tsomgo Lake & North Sikkim permits'
    ],
    keyAmenities: [
      { name: 'Mountain View Balconies', icon: 'Mountain', description: 'Private scenic decks overlooking misty green ridges' },
      { name: 'Climate Warmth & Heaters', icon: 'Flame', description: 'Bed warmers and silent heaters in every suite' },
      { name: 'Sikkimese & Indian Dining', icon: 'UtensilsCrossed', description: 'Freshly prepared local delicacies & comforting thalis' },
      { name: 'Permit & Transit Desk', icon: 'Compass', description: 'Permits and 4x4 cab assistance for Nathula & Tsomgo' }
    ],
    phone: '+91 91630 08361',
    whatsapp: '+91 91630 08361',
    email: 'trikuta.gangtok@parijaigroup.com',
    address: 'near District Court, Upper Sichey, Gangtok, Sikkim 737101',
    mapQuery: 'Trikuta+Residency+Parijay+Group+Gangtok+Sikkim',
    mapUrl: 'https://maps.app.goo.gl/UXcc68jGZGVdVyPW9'
  },
  kalyani: {
    id: 'kalyani',
    name: 'Hotel Parijaye',
    subtitle: 'Parijay Group of Hotels',
    location: 'Kalyani, West Bengal',
    district: 'Nadia District',
    landmark: 'AIIMS Kalyani Main Gate & OPD',
    distanceToLandmark: '3 mins (800m) to AIIMS OPD',
    rating: 4.8,
    reviewCount: 429,
    tripAdvisorRating: 4.7,
    startingPrice: 1950,
    vibe: 'Pristine, hygienic, elevator-equipped comfort stay tailored for medical convenience & long-term care',
    description: 'Specially engineered for AIIMS patient attendants, visiting doctors, and recovery guests. Located in Basantapur just 2-3 minutes from AIIMS Kalyani Gate 1 with dedicated e-rickshaw transit, wheelchair accessibility, elevator, and sanitized kitchen preparing customized light meals.',
    image: '',
    gallery: [],
    highlights: [
      '2-3 minute dedicated door-to-door transit to AIIMS Kalyani Gate 1 & OPD',
      'Wheelchair ramps, extra-wide doorway corridors and hospital-grade elevator',
      'Sanitized home-style in-house kitchen with customizable low-sodium patient meals',
      'Discounted weekly and monthly tariff packages for long-term attendant stays'
    ],
    keyAmenities: [
      { name: 'AIIMS Dedicated Transit', icon: 'Car', description: 'Quick e-rickshaws and shuttles directly to Gate 1 & OPD' },
      { name: 'Wheelchair & Elevator Access', icon: 'Accessibility', description: 'Barrier-free premises, ramps and stretcher-capable lifts' },
      { name: 'Diet Kitchen & Kitchenettes', icon: 'Soup', description: 'Boiled, low-oil, low-sodium meals cooked to doctor specifications' },
      { name: 'Long-Stay Care Tariffs', icon: 'BadgePercent', description: 'Substantial concessions for attendants staying >7 nights' }
    ],
    phone: '+91 91630 08361',
    whatsapp: '+91 91630 08361',
    email: 'parijaye.kalyani@parijaigroup.com',
    address: 'Basantapur, Near AIIMS Kalyani, West Bengal 741246',
    mapQuery: 'Hotel+parijaye+Basantapur+West+Bengal+741246',
    mapUrl: 'https://maps.app.goo.gl/AjjMa723DRpFGUe36?g_st=ac'
  }
};

export const DEFAULT_ROOM_PRICES: Record<string, number> = {
  'g-view-deluxe': 2850,
  'g-non-view-regular': 2250,
  'k-non-ac': 1450,
  'k-standard-ac': 1950,
  'k-deluxe-twin': 2350
};

export const ROOMS: Room[] = [
  // Gangtok Rooms
  {
    id: 'g-view-deluxe',
    propertyId: 'gangtok',
    name: 'View Room',
    tagline: 'Window faces the hillside, offering direct views of the Kanchenjunga range and verdant valley mist.',
    sqft: 260,
    bed: '1 King Bed',
    occupancy: '2 Adults, 1 Child',
    pricePerNight: 2850,
    originalPrice: 3450,
    remainingRooms: 3,
    freeCancellation: true,
    images: [],
    amenities: [
      'Water heater / geyser (hot water)',
      'TV',
      'Mini table',
      'WiFi'
    ],
    purposeTags: ['leisure', 'corporate']
  },
  {
    id: 'g-non-view-regular',
    propertyId: 'gangtok',
    name: 'Non-View Room',
    tagline: 'Standard window, peaceful mountain room with cozy wooden aesthetics.',
    sqft: 260,
    bed: '1 King Bed',
    occupancy: '2 Adults, 1 Child',
    pricePerNight: 2250,
    originalPrice: 2750,
    remainingRooms: 4,
    freeCancellation: true,
    images: [],
    amenities: [
      'Water heater / geyser (hot water)',
      'TV',
      'Mini table',
      'WiFi'
    ],
    purposeTags: ['leisure', 'corporate']
  },

  // Kalyani Rooms
  {
    id: 'k-non-ac',
    propertyId: 'kalyani',
    name: 'Non-AC Rooms',
    tagline: 'Economical, well-ventilated comfort with hospital-grade elevator & ramp access for AIIMS attendants.',
    sqft: 220,
    bed: '1 Queen Bed or 2 Single Beds',
    occupancy: '2 Adults',
    pricePerNight: 1450,
    originalPrice: 1800,
    remainingRooms: 4,
    freeCancellation: true,
    images: [],
    amenities: ['Elevator Access', 'Attached Clean Bath', '24/7 Hot Water', 'Wi-Fi', 'OPD Shuttle Support'],
    purposeTags: ['medical', 'corporate']
  },
  {
    id: 'k-standard-ac',
    propertyId: 'kalyani',
    name: 'Standard AC Rooms',
    tagline: 'Climate-controlled serene comfort with elevator access, sanitized bedding & doctor-on-call.',
    sqft: 260,
    bed: '1 King Bed',
    occupancy: '2 Adults, 1 Child',
    pricePerNight: 1950,
    originalPrice: 2400,
    remainingRooms: 3,
    freeCancellation: true,
    images: [],
    amenities: ['Air Conditioning', 'Attached Clean Bath', 'Wi-Fi', '24/7 Hot Water', 'Doctor On-Call Support'],
    purposeTags: ['medical', 'corporate', 'leisure']
  },
  {
    id: 'k-deluxe-twin',
    propertyId: 'kalyani',
    name: 'Deluxe Twin Care Room',
    tagline: 'Spotlessly sanitized comfort with twin ergonomic care beds, wheelchair ramps & stretcher lift access.',
    sqft: 280,
    bed: '2 Single Ergonomic Beds',
    occupancy: '2 Adults',
    pricePerNight: 2350,
    originalPrice: 2900,
    remainingRooms: 3,
    freeCancellation: true,
    images: [],
    amenities: ['Wheelchair Accessible', 'Antimicrobial Linens', 'Attached Clean Bath', 'Wi-Fi', '24/7 Hot Water'],
    purposeTags: ['medical', 'corporate']
  }
];

export const ADD_ONS: BookingAddOn[] = [
  // Gangtok Add-ons
  {
    id: 'add-g-transfer',
    propertyId: 'gangtok',
    name: 'Bagdogra / NJP Station Private Cab Transfer',
    description: 'Sanitized private Innova/Xylo pickup with experienced mountain driver directly to resort.',
    price: 3600,
    recommendedFor: 'leisure'
  },
  {
    id: 'add-g-tour',
    propertyId: 'gangtok',
    name: 'Full-Day Gangtok Sightseeing & Permit Pass',
    description: 'Tsomgo Lake, Baba Mandir permits processing + 7-point Gangtok scenic viewpoint tour.',
    price: 2400,
    recommendedFor: 'leisure'
  },
  {
    id: 'add-g-bonfire',
    propertyId: 'gangtok',
    name: 'Evening Himalayan Barbecue & Bonfire Experience',
    description: 'Private terrace campfire with traditional Sikkimese snacks and herbal tea.',
    price: 950,
    recommendedFor: 'leisure'
  },

  // Kalyani Add-ons
  {
    id: 'add-k-shuttle',
    propertyId: 'kalyani',
    name: 'Daily AIIMS OPD Unlimited Drop & Pickup Pass',
    description: 'On-demand dedicated e-rickshaw transit between hotel and AIIMS OPD/Gate 1 during stay.',
    price: 250,
    recommendedFor: 'medical'
  },
  {
    id: 'add-k-dietmeal',
    propertyId: 'kalyani',
    name: 'Healthy Dietary / Low-Sodium Meal Package (Daily)',
    description: 'Breakfast, lunch, and dinner cooked fresh with boiled vegetables, light lentil soup, and curd.',
    price: 490,
    recommendedFor: 'medical'
  },
  {
    id: 'add-k-station',
    propertyId: 'kalyani',
    name: 'Kalyani Railway Station / Kolkata Airport Transit',
    description: 'Chauffeured pickup from Kalyani Main Station or Netaji Subhash Chandra Bose Airport.',
    price: 1800,
    recommendedFor: 'corporate'
  }
];

export const FAQS = [
  {
    question: 'How far is Hotel Parijaye from AIIMS Kalyani OPD and Emergency?',
    answer: 'Hotel Parijaye is located approximately 800 meters (3 to 5 minutes) from the AIIMS Kalyani Main Gate and OPD complex. We provide complimentary dedicated e-rickshaw shuttles for our guests so patients and elderly attendants do not need to walk.'
  },
  {
    question: 'Do you offer long-term stay discounts for patient attendants at Kalyani?',
    answer: 'Yes! We recognize that medical treatments and diagnostic tests can take days or weeks. We provide 15% off for stays of 7+ nights, and 25% off for stays exceeding 14 nights, including access to our customized dietary kitchen and laundry service.'
  },
  {
    question: 'How does Trikuta Residency help with Sikkim travel permits (Nathula & Tsomgo)?',
    answer: 'Our in-house Travel Desk handles all permit paperwork for protected areas including Nathula Pass, Tsomgo (Changu) Lake, and North Sikkim (Lachen/Lachung). Simply submit your ID copies (Voter ID or Passport) and 2 passport photos upon arrival or in advance via WhatsApp.'
  },
  {
    question: 'Are rooms heated at Trikuta Residency in Gangtok during winter?',
    answer: 'Yes, every room at Trikuta Residency is equipped with electric bed warmers, heavy thermal duvets, and supplemental heaters to ensure warm, cozy comfort throughout Gangtok winter months.'
  },
  {
    question: 'What is your cancellation policy in case of medical changes or flight delays?',
    answer: 'We provide Free Cancellation up to 48 hours prior to your scheduled check-in. For medical emergencies (with AIIMS appointment updates) or severe weather landslides, we offer full credit rollover or prompt refunds.'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Dr. Arindam Mukherjee',
    role: 'Visiting Faculty & Consultant',
    property: 'Hotel Parijaye, Kalyani',
    rating: 5,
    text: 'Stayed here for 4 days during an academic symposium at AIIMS Kalyani. The rooms are spotless, Wi-Fi is blazing fast for telemedicine calls, and the 3-minute transit was a lifesaver. Excellent hospitality.',
    badge: 'Medical & Academic Stay'
  },
  {
    name: 'Sneha & Rohith Sharma',
    role: 'Honeymoon Travelers from Pune',
    property: 'Trikuta Residency, Gangtok',
    rating: 5,
    text: 'Waking up to the morning sunrise over Kanchenjunga from our balcony was unforgettable! The wooden interiors, electric bed warmers, and freshly prepared Sikkimese momos made our vacation magical.',
    badge: 'Mountain Leisure'
  },
  {
    name: 'Debabrata Ghosh',
    role: 'AIIMS Patient Attendant from Murshidabad',
    property: 'Hotel Parijaye, Kalyani',
    rating: 5,
    text: 'My mother underwent treatment at AIIMS. The staff at Parijaye treated us like family. The elevator, wheelchair ramp, and fresh boiled low-salt food made a difficult medical journey so much easier.',
    badge: 'Patient Family Care'
  }
];

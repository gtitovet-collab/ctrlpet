import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  Star, 
  Phone, 
  Navigation, 
  Plus, 
  Filter, 
  Heart, 
  Lock, 
  Compass, 
  Clock, 
  CornerUpRight,
  MessageSquare,
  Sparkles,
  Map as MapIcon,
  ChevronRight,
  X
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

// API Key resolution following security standard
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';


interface PlaceReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface Place {
  id: string;
  name: string;
  type: 'vet' | 'petshop';
  lat: number;
  lng: number;
  rating: number;
  address: string;
  phone: string;
  services: ('emergency' | 'grooming' | 'breeds' | 'vaccine' | 'consultation' | 'hotel')[];
  about: string;
  reviews: PlaceReview[];
}

// Fallback center only used while GPS permission is pending/denied
const DEFAULT_CENTER = { lat: -15.7801, lng: -47.9292 }; // Brasília – geographic center of Brazil

// Custom dynamic map component driven directly by @googlemaps/js-api-loader functional API
function JsApiLoaderMap({ 
  apiKey, 
  center, 
  zoom, 
  places, 
  selectedPlace, 
  onSelectPlace,
  userLocation
}: { 
  apiKey: string; 
  center: google.maps.LatLngLiteral; 
  zoom: number; 
  places: Place[]; 
  selectedPlace: Place | null; 
  onSelectPlace: (place: Place) => void;
  userLocation: google.maps.LatLngLiteral;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!containerRef.current || !apiKey) return;

    // Conect options
    setOptions({
      key: apiKey,
      v: 'weekly',
    });

    let active = true;

    const loadMapAndMarkers = async () => {
      try {
        const { Map, InfoWindow } = await importLibrary('maps');
        if (!active || !containerRef.current) return;

        const map = new Map(containerRef.current, {
          center: center,
          zoom: zoom,
          mapId: 'DEMO_MAP_ID_DYNAMICS',
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        mapRef.current = map;

        const { AdvancedMarkerElement, PinElement } = await importLibrary('marker');

        if (!active) return;

        // Clear previous markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        // Create a single InfoWindow instance for better performance & UX
        const infoWindow = new InfoWindow({
          disableAutoPan: false,
        });

        // Add user location marker
        const userPin = new PinElement({
          background: '#4040F2',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          scale: 1.25,
          glyph: '🐾'
        });
        const userMarker = new AdvancedMarkerElement({
          position: userLocation,
          map: map,
          title: "Sua Localização GPS",
          content: userPin.element,
        });
        markersRef.current.push(userMarker);

        // Add place markers
        places.forEach(p => {
          const isSelected = selectedPlace?.id === p.id;
          const pin = new PinElement({
            background: p.type === 'vet' ? '#E11D48' : '#D97706',
            borderColor: '#ffffff',
            glyphColor: '#ffffff',
            scale: isSelected ? 1.3 : 1.0,
            glyph: p.type === 'vet' ? '🏥' : '💈'
          });

          const marker = new AdvancedMarkerElement({
            position: { lat: p.lat, lng: p.lng },
            map: map,
            title: p.name,
            content: pin.element,
          });

          const openPlaceInfoWindow = () => {
            const query = encodeURIComponent(`${p.name}, ${p.address}`);
            const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
            
            const contentString = `
              <div style="font-family: inherit; padding: 6px; min-width: 220px; color: #1e293b; text-align: left; font-size: 11px; line-height: 1.4;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; background-color: ${p.type === 'vet' ? '#fff1f2' : '#fef3c7'}; color: ${p.type === 'vet' ? '#be123c' : '#b45309'};">
                    ${p.type === 'vet' ? 'Veterinário 🏥' : 'Pet Shop 💈'}
                  </span>
                  <span style="font-size: 10.5px; font-weight: bold; color: #d97706; display: flex; align-items: center; gap: 2px;">
                    ★ ${p.rating.toFixed(1)}
                  </span>
                </div>
                <h4 style="font-size: 12.5px; font-weight: 800; margin: 4px 0; color: #0f172a; font-family: sans-serif; line-height: 1.25;">${p.name}</h4>
                <p style="font-size: 10px; color: #64748b; margin: 0 0 10px 0;">📍 ${p.address}</p>
                <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background-color: #4f46e5; color: white; text-decoration: none; font-size: 10.5px; font-weight: bold; padding: 6px 12px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background-color 0.2s;">
                  Abrir no Google Maps ↗
                </a>
              </div>
            `;
            
            infoWindow.setContent(contentString);
            infoWindow.open({
              anchor: marker,
              map: map,
            });
          };

          // Handle click on marker to select place
          marker.addListener('gmp-click', () => {
            onSelectPlace(p);
            openPlaceInfoWindow();
          });

          // If selected already, auto-trigger the InfoWindow
          if (isSelected) {
            openPlaceInfoWindow();
          }

          markersRef.current.push(marker);
        });
      } catch (err) {
        console.warn("Erro ao carregar o mapa do Google Maps API:", err);
      }
    };

    loadMapAndMarkers();

    return () => {
      active = false;
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [apiKey, center, zoom, places, selectedPlace, userLocation]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-2xl overflow-hidden shadow-inner" 
      style={{ width: '100%', height: '100%' }} 
    />
  );
}

export default function NearbyFinder() {
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('ctrlpet_user_gmaps_api_key') || '';
  });

  const activeApiKey = customApiKey || API_KEY;
  const isKeyActive = Boolean(activeApiKey) && activeApiKey !== 'YOUR_API_KEY';
  const hasValidKey = isKeyActive;

  // GPS permission status: 'idle' = not yet asked, 'requesting' = dialog open,
  // 'granted' = position obtained, 'denied' = user refused, 'unavailable' = API absent
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'>('idle');
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'vet' | 'petshop'>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  
  // Selection & Details tracking
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // New location register states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regType, setRegType] = useState<'vet' | 'petshop'>('vet');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAbout, setRegAbout] = useState('');
  const [regServices, setRegServices] = useState<string[]>([]);
  const [regLatOffset, setRegLatOffset] = useState(0.005);
  const [regLngOffset, setRegLngOffset] = useState(-0.004);

  // Router directions tracking
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    steps: { instruction: string; distance: string }[];
  } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Force map center
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);

  // --- Core geolocation logic ---
  // Starts a watchPosition session that continuously tracks the device's real GPS.
  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocationLoaded(true);
      return;
    }

    setLocationStatus('requesting');

    // Clear any stale watcher
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(loc);
        setMapCenter(loc);
        setLocationStatus('granted');
        setLocationLoaded(true);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('unavailable');
        }
        setLocationLoaded(true);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,  // accept cached position up to 10s old
        timeout: 15000      // give up after 15s
      }
    );
  };

  // On mount: request location immediately so the browser shows its native permission dialog
  useEffect(() => {
    startWatchingLocation();
    return () => {
      // Stop tracking when the component unmounts
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever locationLoaded becomes true (GPS granted or denied), regenerate places
  // around the actual user position. We do NOT cache to localStorage so that the
  // next load always reflects the current physical location.
  useEffect(() => {
    if (!locationLoaded) return;
    const fresh = generateDefaultLocalPlaces(userLocation);
    setPlaces(fresh);
  }, [locationLoaded, userLocation]);

  // Save changes in memory (reviews, new registrations, etc.)
  // We intentionally do NOT persist to localStorage here, because places
  // are always regenerated from the user's live GPS coordinates on load.
  const savePlaces = (updatedList: Place[]) => {
    setPlaces(updatedList);
  };

  // Helper generator of default places customized relative to the location coordinates
  const generateDefaultLocalPlaces = (center: google.maps.LatLngLiteral): Place[] => {
    return [
      {
        id: 'place-1',
        name: 'Hospital Veterinário 24h VetAmor',
        type: 'vet',
        lat: center.lat + 0.0045,
        lng: center.lng - 0.0030,
        rating: 4.8,
        address: 'Av. das Castanheiras, 1420',
        phone: '(11) 98888-7711',
        services: ['emergency', 'vaccine', 'consultation'],
        about: 'Referência em atendimento emergencial completo de urgência e UTI pet. Equipe de especialistas em oncologia, felinos, cirurgia geral e exames laboratoriais na hora.',
        reviews: [
          { id: 'r1', author: 'Ana Paula Santos', rating: 5, comment: 'Salvaram a vida do meu gatinho no meio da madrugada! Ótimo atendimento em casos de emergência.', date: '2026-05-15' },
          { id: 'r2', author: 'Rodrigo Mello', rating: 4.5, comment: 'Clínica extremamente limpa e equipe cuidadosa. Atendimento exemplar, recomendo demais.', date: '2026-06-10' }
        ]
      },
      {
        id: 'place-2',
        name: 'Pet Elegância - Estética e Rações',
        type: 'petshop',
        lat: center.lat - 0.0035,
        lng: center.lng + 0.0055,
        rating: 4.6,
        address: 'Rua Bela Cintra, 895',
        phone: '(11) 97722-4455',
        services: ['grooming', 'hotel'],
        about: 'Oferecemos o melhor serviço de banho, tosa especializada em raças como Golden, Spitz e Shih Tzu. Contamos com um amplo catálogo de brinquedos e rações Super Premium.',
        reviews: [
          { id: 'r3', author: 'Mariana Lima', rating: 5, comment: 'Melhor tosa higiênica que meu Shih Tzu já fez. Volto sempre.', date: '2026-04-20' },
          { id: 'r4', author: 'Felipe Neves', rating: 4, comment: 'Muitas variedades de brinquedos. O espaço de hotel é muito bem cuidado.', date: '2026-06-02' }
        ]
      },
      {
        id: 'place-3',
        name: 'Clínica Especializada Raça Nobre',
        type: 'vet',
        lat: center.lat - 0.0010,
        lng: center.lng - 0.0065,
        rating: 4.9,
        address: 'Alameda Lorena, 210',
        phone: '(11) 96511-9292',
        services: ['breeds', 'consultation', 'vaccine'],
        about: 'Especialistas focados em raças de alta performance e animais exóticos. Programas vacinais modernos e check-ups completos preventivos para prolongar a vida do seu pet.',
        reviews: [
          { id: 'r5', author: 'Gabriela Duarte', rating: 5, comment: 'Excelente especialista em Buldogues Franceses. Entendem tudo dos problemas respiratórios da raça.', date: '2026-05-28' }
        ]
      },
      {
        id: 'place-4',
        name: 'PetShop e Banho Estrela do Sul',
        type: 'petshop',
        lat: center.lat + 0.0060,
        lng: center.lng + 0.0015,
        rating: 4.3,
        address: 'Rua Pamplona, 1680',
        phone: '(11) 94432-1100',
        services: ['grooming', 'vaccine'],
        about: 'Farmácia veterinária completa integrada e produtos voltados para o bem-estar animal. Oferecemos pacotes mensais de estética pet e banhos calmantes.',
        reviews: [
          { id: 'r6', author: 'Carlos Eduardo', rating: 4, comment: 'Preço justo e produtos de qualidade para cães grandes.', date: '2026-03-12' }
        ]
      },
      {
        id: 'place-5',
        name: 'Clínica Cuidado Animal Integrado',
        type: 'vet',
        lat: center.lat - 0.0050,
        lng: center.lng - 0.0020,
        rating: 4.7,
        address: 'Av. Paulista, 202',
        phone: '(11) 93311-2321',
        services: ['emergency', 'vaccine', 'consultation'],
        about: 'Atendimento humanizado para cães e gatos. Exames de ultra e raio-x integrados no espaço físico para agilizar o diagnóstico e acalmar o tutor.',
        reviews: [
          { id: 'r7', author: 'Lúcia Helena', rating: 5, comment: 'Espaço aconchegante e veterinários hiper atenciosos.', date: '2026-05-01' }
        ]
      }
    ];
  };

  // Distance calculator helper (Haversine formula for exact ground distance)
  const getDistanceLabel = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    if (d < 1) return `${Math.round(d * 1000)}m`;
    return `${d.toFixed(1)} km`;
  };

  // Filter application
  const filteredPlaces = places.filter(p => {
    // 1. Text search
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.about.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Type search
    const matchesType = selectedType === 'all' || p.type === selectedType;

    // 3. Service search
    const matchesService = selectedService === 'all' || p.services.includes(selectedService as any);

    return matchesSearch && matchesType && matchesService;
  });

  // Calculate simulated route (simulates steps or computes real paths when key active)
  const calculateDirections = (place: Place) => {
    setIsCalculatingRoute(true);
    setRouteInfo(null);
    setSelectedPlace(place);

    // Zoom and pan map
    setMapCenter({ lat: (userLocation.lat + place.lat)/2, lng: (userLocation.lng + place.lng)/2 });
    setMapZoom(15);

    setTimeout(() => {
      // Calculate real geometric distance vector to make calculations realistic
      const distKm = parseFloat(getDistanceLabel(userLocation.lat, userLocation.lng, place.lat, place.lng).replace(' km', '').replace('m', '')) || 0.8;
      const durationMin = Math.round(distKm * 2.5 + 2); // Approximate standard city driving
      
      const stepsList = [
        { instruction: 'Siga na direção indicada de seu ponto inicial na via mais próxima.', distance: '150m' },
        { instruction: `Vire à direita na altura de ruas próximas ao seu bairro em sentido a ${place.address.split(',')[0]}.`, distance: '350m' },
        { instruction: `Continue reto no acostamento principal por mais de 500 metros em direção ao destino.`, distance: `${Math.round(distKm * 700)}m` },
        { instruction: `Chegada ao destino em "${place.name}" que estará localizado à sua direita.`, distance: 'Chegada' }
      ];

      setRouteInfo({
        distance: getDistanceLabel(userLocation.lat, userLocation.lng, place.lat, place.lng),
        duration: `${durationMin} min`,
        steps: stepsList
      });
      setIsCalculatingRoute(false);
    }, 900);
  };

  // Add review submission handler
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim() || !selectedPlace) return;

    const newReview: PlaceReview = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [newReview, ...selectedPlace.reviews];
    const avgRating = parseFloat((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1));

    const updatedPlaces = places.map(p => {
      if (p.id === selectedPlace.id) {
        return {
          ...p,
          reviews: updatedReviews,
          rating: avgRating
        };
      }
      return p;
    });

    savePlaces(updatedPlaces);
    
    // Update active details state
    setSelectedPlace({
      ...selectedPlace,
      reviews: updatedReviews,
      rating: avgRating
    });

    // Reset Form
    setNewReviewAuthor('');
    setNewReviewRating(5);
    setNewReviewComment('');
    setIsReviewModalOpen(false);
  };

  // Handle register of a custom user place
  const handleRegisterPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regAddress.trim() || !regPhone.trim()) return;

    // Generate coordinates slightly offset from user location
    const newPlace: Place = {
      id: `place-${Date.now()}`,
      name: regName.trim(),
      type: regType,
      lat: userLocation.lat + regLatOffset,
      lng: userLocation.lng + regLngOffset,
      rating: 5.0,
      address: regAddress.trim(),
      phone: regPhone.trim(),
      services: regServices as any[],
      about: regAbout.trim() || 'Sem descrição cadastrada.',
      reviews: [
        { id: `r-init-${Date.now()}`, author: 'Cadastrado pelo Tutor', rating: 5, comment: 'Local cadastrado na base de dados local do seu dispositivo.', date: new Date().toISOString().split('T')[0] }
      ]
    };

    const updated = [newPlace, ...places];
    savePlaces(updated);

    // Zoom and pan map
    setMapCenter({ lat: newPlace.lat, lng: newPlace.lng });
    setMapZoom(16);
    setSelectedPlace(newPlace);

    // Reset Form
    setRegName('');
    setRegType('vet');
    setRegAddress('');
    setRegPhone('');
    setRegAbout('');
    setRegServices([]);
    setIsRegisterOpen(false);

    // Randomize next offset coordinates
    setRegLatOffset((Math.random() - 0.5) * 0.012);
    setRegLngOffset((Math.random() - 0.5) * 0.012);
  };

  const handleToggleRegService = (serv: string) => {
    if (regServices.includes(serv)) {
      setRegServices(regServices.filter(s => s !== serv));
    } else {
      setRegServices([...regServices, serv]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden grid grid-cols-12 max-w-full" id="nearby-finder-module">
      
      {/* 📍 Header / Finder Bar (Responsive spanning 12 cols) */}
      <div className="col-span-12 p-5 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 px-2.5 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-xs tracking-wider uppercase font-mono">
              📍 Localizador
            </div>
            <span className="text-xs text-slate-400 font-semibold">• GPS Habilitado</span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-display">
            Vets e Pet Shops Próximos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Encontre clínicas 24h, centros de banho, exóticos e hotéis mais perto de você. Traje caminhos rápidos, leia de tutores e adicione pontos preferidos ao seu mapa.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" /> Cadastrar Meu Veterinário / Loja
        </button>
      </div>

      {/* 🧭 SIDE CONTROLS & LISTING PANEL (Col span 12 on mobile, col span 4 on large screen) */}
      <div className="col-span-12 lg:col-span-4 p-5 border-r border-slate-200 dark:border-slate-800 flex flex-col h-[580px] lg:h-[650px] overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
        
        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, serviços, raça..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Categories togglers */}
        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-350 hover:bg-slate-50'
            }`}
          >
            Todos ({places.length})
          </button>
          <button
            onClick={() => setSelectedType('vet')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedType === 'vet'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-350 hover:bg-slate-50'
            }`}
          >
            Clínicas / Vets
          </button>
          <button
            onClick={() => setSelectedType('petshop')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedType === 'petshop'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-350 hover:bg-slate-50'
            }`}
          >
            Pet Shops
          </button>
        </div>

        {/* Services Dropdown Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 uppercase">Filtrar Serviços:</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="flex-1 py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-[11px] font-bold text-slate-705 dark:text-slate-305 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Siri de Serviços (Todos)</option>
            <option value="emergency">🚨 Emergência 24h</option>
            <option value="grooming">✂️ Banho e Tosa (Estética)</option>
            <option value="breeds">🧬 Específico para Raças</option>
            <option value="vaccine">💉 Vacinação Autônoma</option>
            <option value="consultation">🩺 Clínico Geral / Cirurgia</option>
            <option value="hotel">🏨 Hotelzinho Pet</option>
          </select>
        </div>

        {/* List of active places */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1" id="nearby-places-list">
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4">
              <Compass className="w-8 h-8 text-slate-300 dark:text-slate-755 mx-auto mb-2 animate-spin duration-3000" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum estabelecimento encontrado</p>
              <p className="text-[10px] text-slate-450 mt-1">Experimente alterar a sua palavra-chave ou mudar a opção de filtros acima.</p>
            </div>
          ) : (
            filteredPlaces.map(p => {
              const isSelected = selectedPlace?.id === p.id;
              const dist = getDistanceLabel(userLocation.lat, userLocation.lng, p.lat, p.lng);
              
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlace(p);
                    setMapCenter({ lat: p.lat, lng: p.lng });
                    setMapZoom(16);
                    setRouteInfo(null);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer leading-tight text-left space-y-1.5 flex flex-col ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-900 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      p.type === 'vet' 
                        ? 'bg-rose-50 dark:bg-rose-950/35 text-rose-600 dark:text-rose-455' 
                        : 'bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-455'
                    }`}>
                      {p.type === 'vet' ? '🏥 Veterinário' : '🛍️ Pet Shop'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-0.5">
                      <Navigation className="w-3 h-3 text-slate-400 transform rotate-45 inline" /> {dist}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold font-display text-slate-900 dark:text-white leading-tight">
                    {p.name}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{p.rating.toFixed(1)}</span>
                    <span className="text-slate-400 text-[10px] font-mono">({p.reviews.length} reviews)</span>
                  </div>

                  <p className="text-[10px] text-slate-450 line-clamp-2">
                    {p.about}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1 items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {p.services.slice(0, 3).map(s => {
                        const icon = s === 'emergency' ? '🚨' : s === 'grooming' ? '✂️' : s === 'breeds' ? '🧬' : '🩺';
                        return (
                          <span key={s} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-805 text-slate-500 px-1.5 py-0.5 rounded">
                            {icon} {s === 'emergency' ? '24h' : s === 'grooming' ? 'Tosa' : s === 'breeds' ? 'Raças' : s === 'vaccine' ? 'Vacina' : s === 'hotel' ? 'Hotel' : 'Consultas'}
                          </span>
                        );
                      })}
                      {p.services.length > 3 && (
                        <span className="text-[9px] font-semibold text-slate-400 px-1 py-0.5">+{p.services.length - 3}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const query = encodeURIComponent(`${p.name}, ${p.address}`);
                        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                        window.open(url, '_blank');
                      }}
                      className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 border border-indigo-200/40 dark:border-indigo-850/30 text-indigo-600 dark:text-indigo-400 rounded text-[9.5px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ml-auto"
                    >
                      <MapIcon className="w-2.5 h-2.5" />
                      <span>Ver no Maps</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 🗺️ MAP VIEWER AND DIRECT ROUTE PRESENTATION (Col span 12 on mobile, col span 8 on large screen) */}
      <div className="col-span-12 lg:col-span-8 h-[580px] lg:h-[650px] relative flex flex-col bg-slate-100 dark:bg-slate-950">
        
        {/* Dynamic Map Body */}
        <div className="flex-1 w-full h-full relative" style={{ minHeight: '300px' }}>
          {hasValidKey ? (
            <JsApiLoaderMap
              apiKey={activeApiKey}
              center={mapCenter}
              zoom={mapZoom}
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={(p) => {
                setSelectedPlace(p);
                setRouteInfo(null);
              }}
              userLocation={userLocation}
            />
          ) : (
            /* Premium Interactive Vector Simulation Map (Works out-of-the-box perfectly) */
            <div className="w-full h-full bg-slate-50 dark:bg-[#070b13] relative flex flex-col items-center justify-center p-6 border-b border-slate-200 dark:border-slate-850 overflow-hidden select-none">
              
              {/* Dynamic Grid Background representing coordinates and roads */}
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #5b5cf6 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
              }} />

              {/* Simulated Roads Graphic */}
              <svg className="absolute inset-0 w-full h-full text-slate-250 dark:text-slate-800 opacity-25 stroke-2 stroke-current fill-none pointer-events-none">
                <line x1="0" y1="200" x2="1000" y2="200" />
                <line x1="0" y1="450" x2="1000" y2="450" />
                <line x1="300" y1="0" x2="300" y2="800" />
                <line x1="680" y1="0" x2="680" y2="800" />
                <path d="M 100,100 Q 250,150 400,100 T 700,200" />
                <path d="M 50,550 Q 350,520 600,580 T 900,450" />
              </svg>

              {/* Simulated Vector Pins & Lines */}
              <div className="absolute inset-0 pointer-events-none">
                
                {/* Live animated signal waves radiating from user location */}
                {locationLoaded && (
                  <div className="absolute transition-all duration-300 flex items-center justify-center" style={{
                    left: `calc(50% + ${(userLocation.lng - mapCenter.lng) * 4000}px)`,
                    top: `calc(50% - ${(userLocation.lat - mapCenter.lat) * 4000}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}>
                    <span className="absolute animate-ping inline-flex h-8 w-8 rounded-full bg-indigo-500/20 opacity-75"></span>
                    <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-bold">
                      Você
                    </div>
                  </div>
                )}

                {/* Show place pins in simulator */}
                {filteredPlaces.map(p => {
                  const isSelected = selectedPlace?.id === p.id;
                  
                  // Compute pixel coordinate multipliers relative to center
                  const leftOffset = `calc(50% + ${(p.lng - mapCenter.lng) * 4000}px)`;
                  const topOffset = `calc(50% - ${(p.lat - mapCenter.lat) * 4000}px)`;

                  return (
                    <div
                      key={p.id}
                      className="absolute transition-all duration-300"
                      style={{
                        left: leftOffset,
                        top: topOffset,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isSelected ? 40 : 10
                      }}
                    >
                      {/* Animated InfoWindow above Selected Pin in Mock Mode */}
                      {isSelected && (
                        <div className="absolute bottom-[48px] left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl w-52 text-left space-y-1.5 z-50 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-250 leading-relaxed font-sans">
                          <div className="flex items-center justify-between">
                            <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase ${
                              p.type === 'vet' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                            }`}>
                              {p.type === 'vet' ? 'Hospital' : 'Pet Shop'}
                            </span>
                            <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px]">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{p.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          
                          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                            {p.name}
                          </h4>
                          
                          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-tight">
                            📍 {p.address}
                          </p>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const query = encodeURIComponent(`${p.name}, ${p.address}`);
                              const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                              window.open(url, '_blank');
                            }}
                            className="w-full text-center py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[9.5px] shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Abrir no Google Maps</span>
                            <span className="text-[9px]">↗</span>
                          </button>
                          
                          {/* Triangle arrow caret */}
                          <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 rotate-45" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlace(p);
                          setRouteInfo(null);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-2 shadow-lg transition-all cursor-pointer pointer-events-auto ${
                          isSelected
                            ? 'bg-rose-600 border-yellow-400 scale-125 z-10 animate-bounce'
                            : p.type === 'vet'
                              ? 'bg-rose-500/90 border-white hover:bg-rose-600'
                              : 'bg-amber-500/90 border-white hover:bg-amber-600'
                        }`}
                      >
                        {p.type === 'vet' ? '🏥' : '💈'}
                      </button>
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        {p.name.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}

                {/* Render Directions Line overlay */}
                {selectedPlace && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none text-indigo-500 stroke-dasharray opacity-80" style={{ strokeWidth: '3px' }}>
                    <line 
                      x1={`calc(50% + ${(userLocation.lng - mapCenter.lng) * 4000}px)`}
                      y1={`calc(50% - ${(userLocation.lat - mapCenter.lat) * 4000}px)`}
                      x2={`calc(50% + ${(selectedPlace.lng - mapCenter.lng) * 4000}px)`}
                      y2={`calc(50% - ${(selectedPlace.lat - mapCenter.lat) * 4000}px)`}
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray="6,4"
                      className="animate-[dash_10s_linear_infinite]"
                    />
                  </svg>
                )}
              </div>

              {/* Overlay warning and activation options */}
              <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-xl max-w-xs shadow-md space-y-1.5 text-left text-xs font-sans animate-in fade-in">
                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-100 font-bold">
                  <MapIcon className="w-4 h-4 text-emerald-500" />
                  <span>Modo de Exibição Ativo</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  {locationStatus === 'granted'
                    ? <><strong>GPS real ativo.</strong> Exibindo {places.length} locais próximos a você.</>
                    : locationStatus === 'denied'
                    ? <>Permissão de GPS <strong>negada</strong>. Localização padrão em uso.</>
                    : locationStatus === 'requesting'
                    ? <>Aguardando permissão de localização do dispositivo…</>
                    : <>Exibindo {places.length} locais da sua região.</>}
                </p>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 flex items-center justify-between text-[9px] text-[#4040F2] font-semibold">
                  <span>
                    {locationStatus === 'granted'
                      ? `GPS ATIVO (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
                      : locationStatus === 'denied'
                      ? 'GPS NEGADO – localização padrão'
                      : locationStatus === 'requesting'
                      ? 'Aguardando GPS…'
                      : 'GPS indisponível'}
                  </span>
                  {locationStatus === 'denied' && (
                    <button
                      type="button"
                      onClick={startWatchingLocation}
                      className="ml-2 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-bold cursor-pointer"
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Floated custom Google Maps API key control container */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-indigo-950/95 border border-indigo-700/60 p-3 px-4 rounded-xl text-white text-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl leading-normal no-print">
            <div className="space-y-0.5">
              <p className="font-bold flex items-center gap-1.5 text-indigo-350">
                <Lock className="w-3.5 h-3.5 animate-pulse" /> Google Maps API Key Recomendada
              </p>
              <p className="text-[10px] text-indigo-200">
                {hasValidKey 
                  ? `Mapa dinâmico real (@googlemaps/js-api-loader) ativo. GPS: (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` 
                  : "Insira uma chave válida abaixo para habilitar o Google Maps dinâmico real."}
              </p>
            </div>
            <div className="flex gap-2 items-center justify-between">
              <input
                type="password"
                placeholder="Insira sua Chave do Google Maps..."
                value={customApiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomApiKey(val);
                  localStorage.setItem('ctrlpet_user_gmaps_api_key', val);
                }}
                className="px-2.5 py-1 text-xs bg-indigo-900 border border-indigo-700 rounded-lg text-white focus:outline-none focus:border-indigo-400 placeholder-indigo-450 w-full sm:w-44 font-mono"
              />
              {customApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomApiKey('');
                    localStorage.removeItem('ctrlpet_user_gmaps_api_key');
                  }}
                  className="px-2 py-1 bg-rose-900/40 hover:bg-rose-900/80 text-rose-200 rounded text-[10px] font-bold cursor-pointer"
                >
                  Limpar
                </button>
              )}
              <span className="bg-indigo-700/60 px-2 py-0.5 rounded text-[9.5px] font-bold font-mono text-indigo-100 whitespace-nowrap">
                {hasValidKey ? '🔒 Ativo (Real)' : '☁️ Simulado'}
              </span>
            </div>
          </div>
        </div>

        {/* 📋 DETAILS & ACTIONS BOTTOM SHEET OVERLAY */}
        {selectedPlace && (
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[350px] overflow-y-auto shrink-0 z-10 shadow-inner">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="space-y-1 leading-relaxed text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    selectedPlace.type === 'vet' ? 'bg-rose-50 dark:bg-rose-950/35 text-rose-600 dark:text-rose-400' : 'bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {selectedPlace.type === 'vet' ? 'Veterinário 🏥' : 'Pet Shop 💈'}
                  </span>
                  
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{selectedPlace.rating.toFixed(1)}</span>
                  </div>

                  <span className="text-xs text-slate-400">• Distância: {getDistanceLabel(userLocation.lat, userLocation.lng, selectedPlace.lat, selectedPlace.lng)}</span>
                </div>

                <h3 className="text-sm font-black font-display text-slate-905 dark:text-white">
                  {selectedPlace.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  📍 {selectedPlace.address} | 📞 {selectedPlace.phone}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 self-start md:self-center">
                <button
                  onClick={() => calculateDirections(selectedPlace)}
                  disabled={isCalculatingRoute}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {isCalculatingRoute ? 'Calculando...' : 'Instruções (Simuladas)'}
                </button>
                <button
                  onClick={() => {
                    const query = encodeURIComponent(`${selectedPlace.name}, ${selectedPlace.address}`);
                    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                    window.open(url, '_blank');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Navegar (Google Maps GPS)</span>
                </button>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Avaliar
                </button>
              </div>
            </div>

            {/* Steps panel route directions container */}
            {routeInfo && (
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-150 dark:border-emerald-950 rounded-xl space-y-3 p-3 leading-normal text-left max-h-[160px] overflow-y-auto antialiased">
                <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900 pb-2">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <CornerUpRight className="w-4 h-4" /> Instruções de Trajeto Recomendado
                  </span>
                  <div className="text-[11px] font-bold text-emerald-600 font-mono">
                    {routeInfo.distance} • {routeInfo.duration}
                  </div>
                </div>
                <div className="space-y-1.5 font-sans">
                  {routeInfo.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 text-xs leading-normal">
                      <span className="font-mono text-[10px] text-emerald-600 font-bold">[{idx + 1}]</span>
                      <p className="text-slate-700 dark:text-slate-350 flex-1">{step.instruction}</p>
                      <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">{step.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews list */}
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Depoimentos e Opiniões de Clientes ({selectedPlace.reviews.length})</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 pt-1">
                {selectedPlace.reviews.map(rev => (
                  <div key={rev.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{rev.author}</span>
                      <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-normal italic">
                      "{rev.comment}"
                    </p>
                    <span className="text-[9px] font-mono text-slate-400 block">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📝 REVIEW INSERTION DIALOG MODAL */}
      {isReviewModalOpen && selectedPlace && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-853 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-sans">
                <span>⭐ Avaliar Estabelecimento</span>
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4 text-left">
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Escreva seu comentário sobre: <strong className="text-slate-800 dark:text-white leading-tight font-bold">{selectedPlace.name}</strong>.
              </p>

              {/* Author name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Seu Nome / Apelido:
                </label>
                <input
                  type="text"
                  required
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="ex: Dr. Carlos, Fernanda S."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Rating selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block pb-1">
                  Sua Nota:
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewReviewRating(num)}
                      className="p-1 cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${num <= newReviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comment input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Comentários / Experiência:
                </label>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Excelente estrutura, equipe atenta com gatos ariscos, recomendo muito..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-normal leading-normal"
                />
              </div>

              {/* Footer actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer animate"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Publicar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🏢 REGISTER NEW PLACE DIALOG MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5 font-sans">
                <span>📍 Adicionar Veterinário ou Loja ao Mapa</span>
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterPlace} className="space-y-4 text-left">
              <p className="text-[11px] text-slate-500 leading-normal">
                Informe os dados do estabelecimento próximo para marcá-lo no seu mapa local de forma persistente.
              </p>

              {/* Place Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block pb-0.5">
                  Nome do Estabelecimento *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="ex: Clínica Veterinária Paulista 24h"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              {/* Type Category Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Tipo de Negócio *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegType('vet')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      regType === 'vet'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:text-rose-405'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350'
                    }`}
                  >
                    🏥 Clínicas / Vet
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegType('petshop')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      regType === 'petshop'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-405'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350'
                    }`}
                  >
                    🛍️ Pet Shop / Estética
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Endereço do Local *
                </label>
                <input
                  type="text"
                  required
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="ex: Avenida Paulista, 1000 - Bela Vista"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Telefone de Contato *
                </label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="ex: (11) 91234-5678"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Services multi-selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block pb-1">
                  Serviços Oferecidos (Selecione todos que aplicam):
                </label>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                  {[
                    { value: 'emergency', label: '🚨 Emergência 24h' },
                    { value: 'grooming', label: '✂️ Banho & Tosa' },
                    { value: 'breeds', label: '🧬 Especialista Raças' },
                    { value: 'vaccine', label: '💉 Vacinação' },
                    { value: 'consultation', label: '🩺 Clínico Geral' },
                    { value: 'hotel', label: '🏨 Hotelzinho Pet' }
                  ].map(s => {
                    const isChecked = regServices.includes(s.value);
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => handleToggleRegService(s.value)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-left transition-all ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description / Summary */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Descrição do Local (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={regAbout}
                  onChange={(e) => setRegAbout(e.target.value)}
                  placeholder="Oferece vacinas importadas e conta com cirurgião sob agendamento prévio..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-100 focus:outline-none focus:border-indigo-500 leading-normal"
                />
              </div>

              {/* Location offsets to generate unique coordinates for the simulation near user location */}
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
                <span>📍 Coordenadas simuladas próximas geradas</span>
                <span className="font-mono text-[9px] font-bold text-indigo-600 uppercase">GPS persistência ativa</span>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Registrar Local
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

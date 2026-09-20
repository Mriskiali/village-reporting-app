import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getGeolocationErrorMessage, requestGeolocation } from '../lib/geolocation';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapPickerProps {
  initialPosition?: [number, number];
  onLocationSelected: (location: Location) => void;
  onClose: () => void;
  isVisible: boolean;
  showLocateButton?: boolean;
}


const LOCATION_DATABASE = [
  { name: 'Taman Kelurahan', coords: [-6.1951, 106.8658], radius: 0.001 },
  { name: 'Terminal Kelurahan', coords: [-6.1905, 106.8634], radius: 0.001 },
  { name: 'Pulo Gadung Trade Center', coords: [-6.1896, 106.8683], radius: 0.001 },
  { name: 'RS Islam Jakarta', coords: [-6.1938, 106.8567], radius: 0.001 },
  { name: 'Stasiun Klender', coords: [-6.2013, 106.8686], radius: 0.001 },
  { name: 'Kantor Kelurahan', coords: [-6.1941, 106.8641], radius: 0.001 },
  { name: 'Pasar Kelurahan', coords: [-6.1960, 106.8649], radius: 0.001 }
];

const MapPicker: React.FC<MapPickerProps> = ({ 
  initialPosition = [-6.195, 106.865], 
  onLocationSelected, 
  onClose, 
  isVisible,
  showLocateButton = true
}) => {
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [address, setAddress] = useState<string>("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const findLocationName = (lat: number, lng: number): string | null => {
    for (const location of LOCATION_DATABASE) {
      const [locLat, locLng] = location.coords;
      const distance = Math.sqrt(Math.pow(lat - locLat, 2) + Math.pow(lng - locLng, 2));
      
      if (distance <= location.radius) {
        return location.name;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!isVisible || !position) return;
    
    setIsLoadingAddress(true);
    
    const locationName = findLocationName(position[0], position[1]);
    
    if (locationName) {
      setAddress(locationName);
    } else {
      setAddress(`${position[0].toFixed(6)}, ${position[1].toFixed(6)}`);
    }
    
    setIsLoadingAddress(false);
  }, [position, isVisible]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    
    try {
      const locationName = findLocationName(lat, lng);
      if (locationName) {
        setAddress(locationName);
        setIsLoadingAddress(false);
        return;
      }
      
      setAddress(`(${lat.toFixed(4)}, ${lng.toFixed(4)}) - Menunggu koneksi...`);

      setTimeout(() => {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setIsLoadingAddress(false);
      }, 1000);
    } catch (err) {
      console.error('Geocoding failed:', err);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setIsLoadingAddress(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    const map = L.map(containerRef.current).setView(position, 16);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker(position, { draggable: true }).addTo(map);
    
    marker.on('dragend', async function() {
      const newPos = marker.getLatLng();
      setPosition([newPos.lat, newPos.lng]);
      await reverseGeocode(newPos.lat, newPos.lng);
    });
    
    map.on('click', async function(e) {
      const clickedPos = e.latlng;
      setPosition([clickedPos.lat, clickedPos.lng]);
      
      marker.setLatLng(clickedPos);
      await reverseGeocode(clickedPos.lat, clickedPos.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    reverseGeocode(position[0], position[1]);

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [isVisible]);

  const handleLocateMe = () => {
    if (!mapRef.current || !markerRef.current) return;
    
    setIsLocating(true);
    setAddress("Mendeteksi lokasi GPS...");
    
    requestGeolocation(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const latLng: [number, number] = [latitude, longitude];

        mapRef.current.setView(latLng, 18);
        markerRef.current.setLatLng(latLng);
        setPosition(latLng);

        await reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        const errorMessage = getGeolocationErrorMessage(error);
        setAddress(errorMessage);
        setIsLocating(false);
      }
    );
  };

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng(position);
      
      if (mapRef.current) {
        mapRef.current.setView(position, 16);
      }
    }
  }, [position]);

  const handleConfirm = () => {
    onLocationSelected({
      lat: position[0],
      lng: position[1],
      address: address
    });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:w-[600px] h-[90vh] md:h-[600px] rounded-t-2xl md:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Pilih Lokasi</h3>
          {showLocateButton !== false && (
            <div className="relative">
            <button 
              onClick={handleLocateMe}
              disabled={isLocating}
              className="bg-blue-100 text-blue-600 p-2 rounded-full border border-blue-200 disabled:opacity-50"
              title="Lokasi Saya Saat Ini"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {(!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost') && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded whitespace-nowrap opacity-90">
                Hanya di HTTPS
              </div>
            )}
          </div>
          )}
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map Container */}
        <div ref={containerRef} className="flex-1 relative"></div>

        {/* Preview Lokasi */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="mb-3">
            <p className="text-xs text-gray-500 font-medium uppercase">Lokasi Terpilih</p>
            <p className="font-medium text-gray-900 truncate">
              {isLoadingAddress ? 'Mengambil alamat...' : address || `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>
          
          <button
            onClick={handleConfirm}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold shadow-md transition-colors"
          >
            Gunakan Lokasi Ini
          </button>
        </div>
      </div>
    </div>
  );
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default MapPicker;
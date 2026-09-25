import { useEffect, useRef } from "react";
import L from "leaflet";

interface IPMapProps {
  latitude: number;
  longitude: number;
  ip: string;
  city: string;
  country: string;
}

export default function IPMap({ latitude, longitude, ip, city, country }: IPMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map on first render
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false, // Cleaner custom footer representation
      }).setView([latitude, longitude], 12);

      // Set up high quality OpenStreetMap raster style
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapInstanceRef.current);
    } else {
      // Pan map smoothly to the target coordinate
      mapInstanceRef.current.setView([latitude, longitude], 12);
    }

    const map = mapInstanceRef.current;

    // Handle Resize to ensure Leaflet recalculates correctly in flex bounds
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 150);

    // Clean up old marker if it active
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // High fidelity custom animated HTML marker (Tailwind-powered)
    const markerHtml = `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute w-8 h-8 bg-indigo-500 rounded-full opacity-35 animate-ping"></div>
        <div class="relative w-4 h-4 bg-indigo-600 border-2 border-white rounded-full shadow-md"></div>
      </div>
    `;

    const trackingIcon = L.divIcon({
      html: markerHtml,
      className: "custom-tracker-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Spawn marker and launch elegant popup info
    markerRef.current = L.marker([latitude, longitude], { icon: trackingIcon })
      .addTo(map)
      .bindPopup(`
        <div class="font-sans antialiased text-xs select-none">
          <div class="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">
            🎯 ${ip}
          </div>
          <div class="text-gray-600 text-[11px] leading-normal font-medium">
            ${city}, ${country}
          </div>
          <div class="text-[10px] font-mono text-gray-400 mt-0.5">
            ${latitude.toFixed(4)}N, ${longitude.toFixed(4)}E
          </div>
        </div>
      `, {
        closeButton: false,
        offset: [0, -4],
      })
      .openPopup();

  }, [latitude, longitude, ip, city, country]);

  // Handle ultimate unmounting map cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] md:h-full min-h-[350px] rounded-2xl overflow-hidden border border-gray-100/80 shadow-sm transition-all duration-300">
      <div ref={containerRef} className="w-full h-full z-10" />
      
      {/* Absolute mapping badges */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-bold text-gray-700 tracking-wider font-sans uppercase">
          OpenStreetMap Tile Engine Live
        </span>
      </div>

      <div className="absolute top-4 right-4 z-20 bg-indigo-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono font-medium tracking-tight shadow-lg border border-indigo-800">
        LAT: {latitude.toFixed(4)} &bull; LON: {longitude.toFixed(4)}
      </div>
    </div>
  );
}

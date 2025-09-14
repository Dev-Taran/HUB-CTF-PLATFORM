'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number } | null
}

export function LocationPickerMap({ onLocationSelect, selectedLocation }: LocationPickerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const marker = useRef<any>(null)
  const [mapboxLoaded, setMapboxLoaded] = useState(false)

  useEffect(() => {
    // Mapbox GL JS 동적 로딩
    const loadMapbox = async () => {
      if (typeof window === 'undefined') return;
      
      if ((window as any).mapboxgl) {
        setMapboxLoaded(true);
        return;
      }

      try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
        script.onload = () => setMapboxLoaded(true);
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Mapbox:', error);
      }
    };

    loadMapbox();
  }, []);

  useEffect(() => {
    if (!mapboxLoaded || !mapContainer.current || map.current) return;

    try {
      const mapboxgl = (window as any).mapboxgl;
      
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [127.5, 36.0], // 대한민국 중심
        zoom: 6.5,
        cursor: 'crosshair'
      });

      // 한국 지도 경계선 로드
      map.current.on('load', async () => {
        try {
          const response = await fetch('/south-korea-geo.json')
          if (response.ok) {
            const geoData = await response.json()
            
            map.current.addSource('korea-boundaries', {
              type: 'geojson',
              data: geoData
            })

            map.current.addLayer({
              id: 'korea-boundaries-line',
              type: 'line',
              source: 'korea-boundaries',
              paint: {
                'line-color': '#00ff41',
                'line-width': 2,
                'line-opacity': 0.8
              }
            })

            map.current.addLayer({
              id: 'korea-boundaries-fill',
              type: 'fill',
              source: 'korea-boundaries',
              paint: {
                'fill-color': '#00ff41',
                'fill-opacity': 0.1
              }
            }, 'korea-boundaries-line')
          }
        } catch (error) {
          console.error('Failed to load Korea boundaries:', error)
        }
      });

      // 클릭 이벤트로 위치 선택
      map.current.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        
        // 기존 마커 제거
        if (marker.current) {
          marker.current.remove();
        }

        // 새 마커 추가
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.style.cssText = `
          width: 20px;
          height: 20px;
          background-color: #ff0000;
          border: 3px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        `;

        marker.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);

        onLocationSelect(lat, lng);
      });

    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxLoaded, onLocationSelect]);

  // 선택된 위치가 외부에서 변경되었을 때
  useEffect(() => {
    if (!map.current || !selectedLocation) return;

    const mapboxgl = (window as any).mapboxgl;
    
    // 기존 마커 제거
    if (marker.current) {
      marker.current.remove();
    }

    // 새 마커 추가
    const el = document.createElement('div');
    el.className = 'location-marker';
    el.style.cssText = `
      width: 20px;
      height: 20px;
      background-color: #ff0000;
      border: 3px solid #ffffff;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    `;

    marker.current = new mapboxgl.Marker(el)
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .addTo(map.current);

  }, [selectedLocation]);

  if (!mapboxLoaded) {
    return (
      <div className="w-full h-64 glass-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-white text-sm">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
'use client';

import { useEffect, useRef, useState } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  isActive: boolean;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  _count: {
    solves: number;
  };
}

interface MapboxChallengeMapProps {
  challenges: Challenge[];
  onChallengeClick: (challenge: Challenge) => void;
}

export function MapboxChallengeMap({ challenges, onChallengeClick }: MapboxChallengeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [mapboxError, setMapboxError] = useState(false);

  // 마커 관리를 위한 ref
  const markersRef = useRef<any[]>([])

  // 지도 로드 완료 후 마커 추가를 위한 state
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    // Mapbox GL JS 동적 로딩
    const loadMapbox = async () => {
      if (typeof window === 'undefined') return;
      
      // Mapbox GL JS가 이미 로드되었는지 확인
      if ((window as any).mapboxgl) {
        setMapboxLoaded(true);
        return;
      }

      try {
        // CSS 로드
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        document.head.appendChild(link);

        // JS 로드
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
        script.onload = () => {
          setMapboxLoaded(true);
        };
        script.onerror = () => {
          console.error('Failed to load Mapbox');
          setMapboxError(true);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Mapbox:', error);
        setMapboxError(true);
      }
    };

    loadMapbox();
  }, []);

  useEffect(() => {
    if (!mapboxLoaded || !mapContainer.current || map.current || mapboxError) return;

    try {
      const mapboxgl = (window as any).mapboxgl;
      
      if (!mapboxgl) {
        console.error('Mapbox GL JS not loaded');
        setMapboxError(true);
        return;
      }
      
      // Mapbox access token 설정
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // 다크 테마로 해킹 느낌
        center: [127.5, 36.0], // 대한민국 중심
        zoom: 6.5, // 대한민국 전체가 보이는 줌 레벨
        minZoom: 6.5, // 최소 줌 (고정)
        maxZoom: 6.5, // 최대 줌 (고정)
        dragPan: false, // 드래그 이동 비활성화
        scrollZoom: false, // 스크롤 줌 비활성화
        doubleClickZoom: false, // 더블클릭 줌 비활성화
        touchZoomRotate: false, // 터치 회전 비활성화
        keyboard: false, // 키보드 네비게이션 비활성화
        dragRotate: false, // 드래그 회전 비활성화
        pitchWithRotate: false, // 회전 시 기울임 비활성화
        boxZoom: false, // 박스 줌 비활성화
      });

      map.current.on('load', () => {
        setMapReady(true); // 지도 로드 완료 상태로 변경

        // 한국 지리 데이터 로드 및 추가
        const loadKoreaGeoData = async () => {
          try {
            console.log('🗺️ Loading South Korea geo data...')
            const response = await fetch('/south-korea-geo.json')
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const geoData = await response.json()
            console.log('🗺️ South Korea geo data loaded successfully', geoData)
            
            // 한국 경계선 레이어 추가
            if (!map.current.getSource('korea-boundaries')) {
              map.current.addSource('korea-boundaries', {
                type: 'geojson',
                data: geoData
              })

              // 경계선 스타일 추가
              map.current.addLayer({
                id: 'korea-boundaries-line',
                type: 'line',
                source: 'korea-boundaries',
                paint: {
                  'line-color': '#878787',
                  'line-width': 2,
                  'line-opacity': 0.8
                }
              })

              // 영역 채우기 (선택사항)
              map.current.addLayer({
                id: 'korea-boundaries-fill',
                type: 'fill',
                source: 'korea-boundaries',
                paint: {
                  'fill-color': '#3a3a3a',
                  'fill-opacity': 0.1
                }
              }, 'korea-boundaries-line') // 선 아래에 배치

              console.log('✅ South Korea boundaries added to map')
            }
          } catch (error) {
            console.error('❌ Failed to load South Korea geo data:', error)
            console.error('❌ Error details:', error instanceof Error ? error.message : String(error))
          }
        }

        loadKoreaGeoData()

        // 전역 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
          .challenge-marker {
            z-index: 100 !important;
            position: relative !important;
          }
          .challenge-marker:hover {
            z-index: 999 !important;
            transform: scale(1.2) !important;
          }
          .mapboxgl-popup {
            z-index: 1000 !important;
          }
          .mapboxgl-popup-content {
            background: rgba(0, 0, 0, 0.8) !important;
            color: white !important;
            border: 1px solid #00ff41 !important;
            border-radius: 8px !important;
          }
        `;
        document.head.appendChild(style);
      });

      map.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
        setMapboxError(true);
      });

    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
      setMapboxError(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxLoaded, mapboxError]); // challenges 제거

  // 마커들을 별도로 관리하는 useEffect
  useEffect(() => {
    if (!map.current || !challenges.length) return;

    // 기존 마커들 제거
    const existingMarkers = document.querySelectorAll('.challenge-marker');
    existingMarkers.forEach(marker => {
      const parent = marker.closest('.mapboxgl-marker');
      if (parent) {
        parent.remove();
      }
    });

    // 새로운 마커들 추가
    challenges.forEach((challenge) => {
      if (challenge.latitude && challenge.longitude) {
        // 난이도별 색상
        const difficultyColor = {
          'easy': '#10b981',
          'medium': '#f59e0b',
          'hard': '#f97316',
          'expert': '#ef4444'
        }[challenge.difficulty] || '#6b7280';

        // 마커 엘리먼트 생성 (빨간색 테두리 빈 역삼각형 SVG)
        const el = document.createElement('div');
        el.className = 'challenge-marker';
        el.style.cssText = `
          cursor: pointer;
          position: relative;
          z-index: 1000 !important;
          transition: all 0.3s ease;
          transform-origin: center;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        `;

        // SVG로 빈 역삼각형 생성
        el.innerHTML = `
          <svg width="14" height="12" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 12 L0 0 L14 0 Z" 
                  fill="transparent" 
                  stroke="#dc2626" 
                  stroke-width="2" 
                  stroke-linejoin="round"/>
          </svg>
        `;

        // 마커 컨테이너 생성
        const markerContainer = document.createElement('div');
        markerContainer.style.cssText = `
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 12px;
        `;
        markerContainer.appendChild(el);

        // 호버 효과
        let isHovered = false;
        
        const handleMouseEnter = () => {
          if (!isHovered) {
            isHovered = true;
            el.style.transform = 'scale(1.3)';
            el.style.zIndex = '1001';
            // SVG 색상 변경
            const svg = el.querySelector('path');
            if (svg) {
              svg.setAttribute('stroke', '#b91c1c');
            }
          }
        };

        const handleMouseLeave = () => {
          if (isHovered) {
            isHovered = false;
            el.style.transform = 'scale(1)';
            el.style.zIndex = '1000';
            // SVG 색상 원복
            const svg = el.querySelector('path');
            if (svg) {
              svg.setAttribute('stroke', '#dc2626');
            }
          }
        };

        markerContainer.addEventListener('mouseenter', handleMouseEnter);
        markerContainer.addEventListener('mouseleave', handleMouseLeave);

        // 클릭 이벤트
        markerContainer.addEventListener('click', (e) => {
          e.stopPropagation();
          onChallengeClick(challenge);
        });

        // 마커 추가
        const marker = new (window as any).mapboxgl.Marker(markerContainer)
          .setLngLat([challenge.longitude, challenge.latitude])
          .addTo(map.current);

        // 마커를 markersRef에 추가
        markersRef.current.push(marker);

        // 팝업 추가
        const popup = new (window as any).mapboxgl.Popup({ 
          offset: 35,
          closeButton: false,
          closeOnClick: false,
          maxWidth: 'none',
          className: 'challenge-popup'
        }).setHTML(`
          <div style="padding: 10px; text-align: center; background: rgba(0,0,0,0.9); color: white; border: 1px solid #dc2626; border-radius: 8px;">
            <strong style="color: #dc2626;">${challenge.title}</strong><br>
            <span style="color: ${difficultyColor};">${challenge.points} pts</span><br>
            <small style="color: #9ca3af;">${challenge._count.solves} solved</small>
          </div>
        `);

        let hoverTimeout: NodeJS.Timeout;
        let leaveTimeout: NodeJS.Timeout;

        // 팝업 호버 이벤트
        markerContainer.addEventListener('mouseenter', () => {
          clearTimeout(leaveTimeout);
          hoverTimeout = setTimeout(() => {
            if (isHovered) {
              popup.setLngLat([challenge.longitude!, challenge.latitude!])
                   .addTo(map.current);
            }
          }, 200);
        });

        markerContainer.addEventListener('mouseleave', () => {
          clearTimeout(hoverTimeout);
          leaveTimeout = setTimeout(() => {
            popup.remove();
          }, 200);
        });
      }
    });
  }, [challenges, onChallengeClick]); // 마커만 업데이트

  // 마커들을 별도로 관리하는 useEffect
  useEffect(() => {
    console.log('🎯 CHALLENGE MARKER EFFECT TRIGGERED')
    console.log('Map exists:', !!map.current)
    console.log('Challenges count:', challenges.length)
    console.log('Mapbox loaded:', mapboxLoaded)
    
    if (!map.current || !challenges.length || !mapboxLoaded) {
      console.log('❌ Skipping marker creation - conditions not met')
      return
    }

    console.log('🌟 Creating challenge markers...')
    
    // 기존 마커들 제거
    const existingMarkers = document.querySelectorAll('.challenge-marker')
    console.log('🧹 Removing existing markers:', existingMarkers.length)
    existingMarkers.forEach(marker => {
      const parent = marker.closest('.mapboxgl-marker')
      if (parent) {
        parent.remove()
      }
    })

    // 새로운 마커들 추가
    challenges.forEach((challenge, index) => {
      console.log(`� Creating marker ${index + 1} for ${challenge.title}`)
      
      if (challenge.latitude && challenge.longitude) {
        try {
          // 마커 엘리먼트 생성 (빨간색 테두리 빈 역삼각형 SVG)
          const el = document.createElement('div')
          el.className = 'challenge-marker'
          el.style.cssText = `
            cursor: pointer;
            position: relative;
            z-index: 1000 !important;
            transition: all 0.3s ease;
            transform-origin: center;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          `

          // SVG로 빈 역삼각형 생성
          el.innerHTML = `
            <svg width="14" height="12" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 12 L0 0 L14 0 Z" 
                    fill="transparent" 
                    stroke="#dc2626" 
                    stroke-width="2" 
                    stroke-linejoin="round"/>
            </svg>
          `

          // 마커 컨테이너 생성
          const markerContainer = document.createElement('div')
          markerContainer.style.cssText = `
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            height: 12px;
          `
          markerContainer.appendChild(el)

          // 클릭 이벤트
          markerContainer.addEventListener('click', (e) => {
            e.stopPropagation()
            console.log(`🎯 Clicked challenge: ${challenge.title}`)
            onChallengeClick(challenge)
          })

          // 마커 추가
          const mapboxgl = (window as any).mapboxgl
          const marker = new mapboxgl.Marker(markerContainer)
            .setLngLat([challenge.longitude, challenge.latitude])
            .addTo(map.current)

          console.log(`✅ Successfully added marker for ${challenge.title} at [${challenge.longitude}, ${challenge.latitude}]`)

        } catch (error) {
          console.error(`❌ Error creating marker for ${challenge.title}:`, error)
        }
      } else {
        console.log(`⚠️ Challenge ${challenge.title} has no coordinates`)
      }
    })

    console.log('🎯 Challenge marker creation completed')
  }, [challenges, onChallengeClick, mapboxLoaded])

  // 지도와 마커 상태 디버깅
  useEffect(() => {
    console.log('🗺️ Map component props changed:')
    console.log('🗺️ Challenges count:', challenges.length)
    console.log('🗺️ Map loaded:', mapboxLoaded)
    console.log('🗺️ Map error:', mapboxError)
    console.log('🗺️ Map instance exists:', !!map.current)
    
    if (challenges.length > 0) {
      console.log('🗺️ Challenge details:')
      challenges.forEach((challenge, index) => {
        console.log(`  ${index + 1}. ${challenge.title} - Coords: [${challenge.latitude}, ${challenge.longitude}]`)
      })
    }
  }, [challenges, mapboxLoaded, mapboxError])

  // 모든 마커 제거 함수
  const clearAllMarkers = () => {
    console.log('🧹 Clearing all markers...')
    markersRef.current.forEach((marker, index) => {
      console.log(`🧹 Removing marker ${index + 1}`)
      try {
        marker.remove()
      } catch (error) {
        console.error(`❌ Error removing marker ${index + 1}:`, error)
      }
    })
    markersRef.current = []
    console.log('🧹 All markers cleared')
  }

  // 테스트용 마커 추가 함수 - 제거됨
  // const addTestMarker = () => {
  //   if (!map.current || !(window as any).mapboxgl) {
  //     console.log('❌ Cannot add test marker - map or mapboxgl not ready')
  //     return
  //   }

  //   console.log('🧪 Adding test marker...')
    
  //   try {
  //     const el = document.createElement('div')
  //     el.style.cssText = `
  //       width: 20px;
  //       height: 20px;
  //       background-color: red;
  //       border: 2px solid white;
  //       border-radius: 50%;
  //       cursor: pointer;
  //     `
      
  //     const testMarker = new (window as any).mapboxgl.Marker(el)
  //       .setLngLat([127.0, 37.5]) // 서울 중심
  //       .addTo(map.current)
      
  //     console.log('✅ Test marker added successfully')
      
  //     // 5초 후 제거 - 주석처리
  //     // setTimeout(() => {
  //     //   testMarker.remove()
  //     //   console.log('🗑️ Test marker removed')
  //     // }, 5000)
      
  //   } catch (error) {
  //     console.error('❌ Error adding test marker:', error)
  //   }
  // }

  // 지도 로드 후 테스트 마커 추가 - 제거됨
  // useEffect(() => {
  //   if (map.current && mapboxLoaded) {
  //     setTimeout(() => {
  //       console.log('🧪 Trying to add test marker after delay...')
  //       addTestMarker()
  //     }, 2000)
  //   }
  // }, [mapboxLoaded])

  if (!mapboxLoaded && !mapboxError) {
    return (
      <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Cyber Map...</p>
        </div>
      </div>
    );
  }

  // Mapbox 로딩 실패 시 fallback 지도
  if (mapboxError || !mapboxLoaded) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* 배경 그리드 */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* 중앙 도시 표시 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-6xl opacity-30">🏙️</div>
          <p className="text-sm text-green-400 text-center mt-2">Seoul Cyber District</p>
        </div>

        {/* Challenge 마커들 */}
        {challenges.map((challenge, index) => {
          const angle = (index / challenges.length) * 2 * Math.PI;
          const radius = 200 + (index % 3) * 80;
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          return (
            <div
              key={challenge.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ 
                left: `${Math.max(60, Math.min(x, window.innerWidth - 60))}px`, 
                top: `${Math.max(60, Math.min(y, window.innerHeight - 60))}px` 
              }}
              onClick={() => onChallengeClick(challenge)}
            >
              {/* 서버 아이콘 */}
              <div className="relative">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-200 filter drop-shadow-lg">
                  {challenge.category === 'Web' && '🌐'}
                  {challenge.category === 'Pwn' && '💻'}
                  {challenge.category === 'Reverse' && '🔄'}
                  {challenge.category === 'Crypto' && '🔐'}
                  {challenge.category === 'Forensics' && '🔍'}
                  {challenge.category === 'Misc' && '🎯'}
                  {challenge.category === 'OSINT' && '👁️'}
                  {challenge.category === 'Stego' && '🖼️'}
                  {!['Web', 'Pwn', 'Reverse', 'Crypto', 'Forensics', 'Misc', 'OSINT', 'Stego'].includes(challenge.category) && '🖥️'}
                </div>
                
                {/* 난이도 표시 */}
                <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white ${
                  challenge.difficulty === 'easy' ? 'bg-green-500' :
                  challenge.difficulty === 'medium' ? 'bg-yellow-500' :
                  challenge.difficulty === 'hard' ? 'bg-orange-500' :
                  'bg-red-500'
                }`} />
              </div>

              {/* 호버 시 정보 */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-black text-green-400 px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-green-400">
                  <div className="font-semibold">{challenge.title}</div>
                  <div className="text-xs text-gray-300">{challenge.points} pts • {challenge._count.solves} solved</div>
                </div>
              </div>

              {/* 펄스 효과 */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-green-400"></div>
            </div>
          );
        })}

        {/* 스캔 라인 효과 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-50 animate-pulse top-1/3"></div>
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-30 animate-pulse top-2/3" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-screen"
      style={{ minHeight: '100vh' }}
    />
  );
}
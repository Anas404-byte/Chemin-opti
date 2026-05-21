import React, { useEffect, useRef, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const POINT_COLORS = { start: '#2196F3', end: '#FF5722', middle: '#4CAF50' };

const MODE_ROUTE_COLOR = {
  driving: '#1565C0',  // bleu
  cycling: '#2E7D32',  // vert
  walking: '#E65100',  // orange
  transit: '#6A1B9A',  // violet
};

const MapComponent = forwardRef(({ optimizedRoute, pois }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const poiMarkersRef = useRef([]);
  const lineRef = useRef(null);

  useEffect(() => {
    if (map.current) return;
    map.current = L.map(mapContainer.current).setView([48.8566, 2.3522], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach(m => map.current.removeLayer(m));
    markersRef.current = [];
    if (lineRef.current) {
      map.current.removeLayer(lineRef.current);
      lineRef.current = null;
    }

    if (!optimizedRoute) return;

    const { optimizedRoute: route, routeGeometry, mode } = optimizedRoute;
    const bounds = L.latLngBounds();

    // Marqueurs
    route.forEach((point, index) => {
      const isStart = index === 0;
      const isEnd = index === route.length - 1;
      const color = isStart ? POINT_COLORS.start : isEnd ? POINT_COLORS.end : POINT_COLORS.middle;

      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 9,
        fillColor: color,
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).bindPopup(
        `<div style="font-size:12px;line-height:1.6">
          <strong>#${index + 1}${isStart ? ' — Départ' : isEnd ? ' — Fin' : ''}</strong><br/>
          ${point.address}
        </div>`
      ).addTo(map.current);

      markersRef.current.push(marker);
      bounds.extend([point.lat, point.lng]);
    });

    // Tracé du chemin : GeoJSON OSRM (vraies routes) ou lignes droites en fallback
    const routeColor = MODE_ROUTE_COLOR[mode] || MODE_ROUTE_COLOR.driving;
    if (routeGeometry) {
      const latlngs = routeGeometry.coordinates.map(([lng, lat]) => [lat, lng]);
      lineRef.current = L.polyline(latlngs, {
        color: routeColor,
        weight: 5,
        opacity: 0.75,
      }).addTo(map.current);
    } else {
      const latlngs = route.map(p => [p.lat, p.lng]);
      lineRef.current = L.polyline(latlngs, {
        color: '#4CAF50',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 10',
      }).addTo(map.current);
    }

    if (bounds.isValid()) {
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [optimizedRoute]);

  // Marqueurs des POIs (lieux d'intérêt autour du trajet)
  useEffect(() => {
    if (!map.current) return;
    poiMarkersRef.current.forEach(m => map.current.removeLayer(m));
    poiMarkersRef.current = [];
    if (!pois || pois.length === 0) return;

    pois.forEach(poi => {
      const marker = L.circleMarker([poi.lat, poi.lng], {
        radius: 7,
        fillColor: '#FF9800',
        color: 'white',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).bindPopup(
        `<div style="font-size:12px;line-height:1.6">
          <strong>${poi.icon} ${poi.name}</strong><br/>
          <em style="color:#888">${poi.categoryLabel}</em>
        </div>`
      ).addTo(map.current);
      poiMarkersRef.current.push(marker);
    });
  }, [pois]);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100%', borderRadius: '4px' }}
    />
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;

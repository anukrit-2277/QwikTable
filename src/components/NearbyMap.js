'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './NearbyMap.module.css';

// Dynamically import to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

export default function NearbyMap({ restaurants }) {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState(null);

  useEffect(() => {
    import('leaflet').then(leaflet => {
      setL(leaflet.default);
      // Fix default marker icons
      delete leaflet.default.Icon.Default.prototype._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
    setMounted(true);
  }, []);

  if (!mounted || !L) {
    return <div className={styles.placeholder}>Loading map...</div>;
  }

  const center = restaurants.length > 0
    ? [restaurants[0].latitude, restaurants[0].longitude]
    : [26.9124, 75.7873];

  const createIcon = (wait) => {
    const color = wait <= 10 ? '#7FB77E' : wait <= 25 ? '#E9C46A' : '#E76F51';
    const textColor = wait <= 25 ? '#2F2F2F' : '#FFF';
    return L.divIcon({
      className: styles.customMarker,
      html: `<div style="background:${color};color:${textColor};font-weight:700;font-size:11px;padding:4px 10px;border-radius:10px;box-shadow:0 2px 10px ${color}44;white-space:nowrap;font-family:Inter,sans-serif;">${wait}m</div>`,
      iconSize: [40, 24],
      iconAnchor: [20, 12],
    });
  };

  return (
    <div className={styles.wrap}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapContainer center={center} zoom={13} className={styles.map} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {restaurants.map(r => (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={createIcon(r.estimated_wait)}>
            <Popup>
              <div className={styles.popup}>
                <strong>{r.name}</strong>
                <span>{r.cuisine} · ~{r.estimated_wait} min wait</span>
                <a href={`/restaurant/${r.slug}`}>View & Join Queue →</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.dot} style={{background:'#7FB77E'}} /> &lt;10 min</span>
        <span className={styles.legendItem}><span className={styles.dot} style={{background:'#E9C46A'}} /> 10–25 min</span>
        <span className={styles.legendItem}><span className={styles.dot} style={{background:'#E76F51'}} /> 25+ min</span>
      </div>
    </div>
  );
}

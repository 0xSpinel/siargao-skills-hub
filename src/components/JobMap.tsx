import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { __gmapsReady?: () => void; google?: any }
}

export const SIARGAO_CENTER = { lat: 9.85, lng: 126.05 };

let loader: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    window.__gmapsReady = () => resolve();
    const env = import.meta.env as Record<string, string | undefined>;
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"]}&loading=async&callback=__gmapsReady&channel=${env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"]}`;
    s.async = true;
    s.onerror = () => { loader = null; reject(new Error("Map failed to load")); };
    document.head.appendChild(s);
  });
  return loader;
}

type LatLng = { lat: number; lng: number };

export function JobMap({ position, onPick, className }: {
  position: LatLng | null;
  onPick?: (p: LatLng) => void;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadMaps().then(() => {
      if (!alive || !el.current) return;
      const g = window.google.maps;
      map.current = new g.Map(el.current, {
        center: position ?? SIARGAO_CENTER, zoom: position ? 15 : 11,
        clickableIcons: false, mapTypeControl: false, streetViewControl: false,
      });
      marker.current = new g.Marker({ map: map.current, position: position ?? undefined });
      if (pickRef.current) map.current.addListener("click", (e: any) => {
        pickRef.current?.({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
    }).catch(() => alive && setFailed(true));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (marker.current) marker.current.setPosition(position ?? null);
  }, [position]);

  if (failed) return <div className={`${className} grid place-items-center bg-muted text-sm text-muted-foreground`}>Map unavailable</div>;
  return <div ref={el} className={className} />;
}

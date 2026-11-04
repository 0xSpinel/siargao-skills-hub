import { useEffect, useRef, useState } from "react";
import { IslandMap } from "./IslandMap";

declare global {
  interface Window { __gmapsReady?: () => void; google?: any }
}

export const SIARGAO_CENTER = { lat: 9.85, lng: 126.05 };

// Google calls window.gm_authFailure on key/referrer errors instead of rejecting.
let authFailed = false;
const authListeners = new Set<() => void>();
if (typeof window !== "undefined") {
  (window as any).gm_authFailure = () => { authFailed = true; authListeners.forEach((f) => f()); };
}

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

export function JobMap({ position, onPick, className, municipality }: {
  municipality?: string | undefined;
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

  const [offline, setOffline] = useState(false);
  useEffect(() => { if (offline) setFailed(false); }, [offline]);
  useEffect(() => {
    if (!navigator.onLine || authFailed) { setFailed(true); return; }
    const onFail = () => setFailed(true);
    authListeners.add(onFail);
    return () => { authListeners.delete(onFail); };
  }, []);

  useEffect(() => {
    if (offline || failed) return;
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
    return () => { alive = false; marker.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offline, failed]);

  useEffect(() => {
    if (marker.current) marker.current.setPosition(position ?? null);
  }, [position]);

  const toggle = <button type="button" onClick={() => { setFailed(false); setOffline(!offline); }} className="absolute right-2 bottom-2 z-10 rounded bg-card px-2 py-1 text-xs font-semibold shadow">{offline || failed ? "Try Google map" : "Offline map"}</button>;
  if (offline || failed) return <div className="relative"><IslandMap position={position} onPick={onPick} highlight={municipality} className={className} />{!authFailed && toggle}</div>;
  return <div className="relative"><div ref={el} className={className} />{toggle}</div>;
}

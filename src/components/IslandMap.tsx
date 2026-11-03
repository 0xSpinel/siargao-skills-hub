import { useRef, useState, type MouseEvent } from "react";

type LatLng = { lat: number; lng: number };

// Bundled, approximate outline of Siargao and Bucas Grande — needs no internet.
const BOUNDS = { north: 10.08, south: 9.55, west: 125.9, east: 126.22 };
const W = 320, H = 530;
const toXY = ({ lat, lng }: LatLng) => ({
  x: ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * W,
  y: ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * H,
});
const toLatLng = (x: number, y: number): LatLng => ({
  lng: BOUNDS.west + (x / W) * (BOUNDS.east - BOUNDS.west),
  lat: BOUNDS.north - (y / H) * (BOUNDS.north - BOUNDS.south),
});
const shape = (pts: [number, number][]) => pts.map(([lat, lng]) => { const p = toXY({ lat, lng }); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");

const SIARGAO = shape([[10.05, 126.05], [10.02, 126.09], [9.95, 126.13], [9.88, 126.14], [9.82, 126.16], [9.77, 126.17], [9.75, 126.12], [9.74, 126.05], [9.78, 125.99], [9.84, 125.95], [9.92, 125.97], [9.97, 126.0], [10.01, 126.02]]);
const BUCAS = shape([[9.67, 125.95], [9.66, 126.0], [9.59, 125.99], [9.57, 125.94]]);

export const PLACES: { name: string; lat: number; lng: number }[] = [
  { name: "General Luna", lat: 9.79, lng: 126.155 }, { name: "Dapa", lat: 9.76, lng: 126.05 },
  { name: "Del Carmen", lat: 9.87, lng: 125.975 }, { name: "Pilar", lat: 9.86, lng: 126.1 },
  { name: "San Isidro", lat: 9.96, lng: 126.09 }, { name: "Santa Monica", lat: 10.02, lng: 126.04 },
  { name: "Burgos", lat: 10.0, lng: 126.07 }, { name: "San Benito", lat: 9.95, lng: 126.01 },
  { name: "Socorro", lat: 9.62, lng: 125.965 },
];

export function IslandMap({ position, onPick, highlight, className }: {
  position: LatLng | null; onPick?: (p: LatLng) => void; highlight?: string; className?: string;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [zoomed, setZoomed] = useState(true);
  const focus = position ?? PLACES.find((p) => p.name === highlight) ?? null;
  const f = focus ? toXY(focus) : null;
  const viewBox = f && zoomed ? `${f.x - 70} ${f.y - 70} 140 140` : `0 0 ${W} ${H}`;
  const scale = f && zoomed ? 0.45 : 1;

  function click(e: MouseEvent<SVGSVGElement>) {
    if (!onPick || !svg.current) return;
    const pt = svg.current.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.current.getScreenCTM(); if (!m) return;
    const p = pt.matrixTransform(m.inverse());
    onPick(toLatLng(p.x, p.y));
  }
  const pin = position ? toXY(position) : null;

  return (
    <div className={`relative bg-secondary ${className ?? ""}`}>
      <svg ref={svg} viewBox={viewBox} onClick={click} role="img" aria-label="Offline map of Siargao"
        className={`h-full w-full ${onPick ? "cursor-crosshair" : ""}`} preserveAspectRatio="xMidYMid meet">
        <rect x={-500} y={-500} width={W + 1000} height={H + 1000} className="fill-secondary" />
        {[SIARGAO, BUCAS].map((s) => <polygon key={s} points={s} className="fill-card stroke-primary" strokeWidth={1.5 * scale} />)}
        {PLACES.map((p) => { const { x, y } = toXY(p); const on = p.name === highlight; return (
          <g key={p.name}>
            <circle cx={x} cy={y} r={(on ? 5 : 3.5) * scale} className={on ? "fill-accent" : "fill-muted-foreground"} />
            <text x={x + 6 * scale} y={y + 4 * scale} fontSize={11 * scale} className="fill-foreground font-semibold">{p.name}</text>
          </g>); })}
        {pin && <g transform={`translate(${pin.x} ${pin.y}) scale(${scale})`}>
          <path d="M0 0 C-8 -12 -10 -16 -10 -20 A10 10 0 1 1 10 -20 C10 -16 8 -12 0 0Z" className="fill-destructive stroke-card" strokeWidth={2} />
          <circle cy={-20} r={3.5} className="fill-card" />
        </g>}
      </svg>
      <div className="absolute bottom-2 left-2 rounded bg-card/90 px-2 py-1 text-[10px] text-muted-foreground">Offline map · approximate</div>
      {f && <button type="button" onClick={() => setZoomed(!zoomed)} className="absolute right-2 top-2 rounded bg-card px-2 py-1 text-xs font-semibold shadow">{zoomed ? "Whole island" : "Zoom in"}</button>}
    </div>
  );
}

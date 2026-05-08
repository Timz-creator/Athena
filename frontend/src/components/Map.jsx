import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MARKER_CONFIG = {
  blueBase: { color: "#00aaff", label: "B", shape: "base" },
  redBase: { color: "#ff3333", label: "R", shape: "base" },
  blueAsset: { color: "#00aaff", label: "⬥", shape: "asset" },
  redAsset: { color: "#ff3333", label: "⬥", shape: "asset" },
};

function createMarkerEl(config) {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 32px;
    height: 32px;
    border: 2px solid ${config.color};
    background: ${config.color}22;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: JetBrains Mono, monospace;
    font-size: 12px;
    font-weight: bold;
    color: ${config.color};
    box-shadow: 0 0 12px ${config.color}66;
    clip-path: ${config.shape === "asset" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : "none"};
  `;
  el.innerHTML = config.label;
  return el;
}

function Map({ agents, worldSize, scenario, setupStep, onMapClick }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 51.5],
      zoom: 10,
    });

    map.current.on("load", () => {
      map.current.addSource("uavs", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      const registerSvgIcon = (name, svgString) =>
        new Promise((resolve, reject) => {
          if (map.current.hasImage(name)) {
            resolve();
            return;
          }
          const img = new Image(40, 40);
          img.src =
            "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
          img.onload = () => {
            map.current.addImage(name, img);
            resolve();
          };
          img.onerror = reject;
        });

      const attackerBlueSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 4 L36 34 L20 28 L4 34 Z" fill="#00aaff"/></svg>`;
      const attackerRedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 4 L36 34 L20 28 L4 34 Z" fill="#ff3333"/></svg>`;
      const interceptorBlueSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 5 L35 33 L20 27 L5 33 Z" fill="none" stroke="#00aaff" stroke-width="3" stroke-linejoin="round"/></svg>`;
      const interceptorRedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 5 L35 33 L20 27 L5 33 Z" fill="none" stroke="#ff3333" stroke-width="3" stroke-linejoin="round"/></svg>`;
      const jammerBlueSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 4 L36 34 L20 28 L4 34 Z" fill="#00aaff"/><path d="M22 14 L16 23 H21 L18 30 L26 20 H21 Z" fill="#00131d"/></svg>`;
      const jammerRedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 4 L36 34 L20 28 L4 34 Z" fill="#ff3333"/><path d="M22 14 L16 23 H21 L18 30 L26 20 H21 Z" fill="#2a0000"/></svg>`;

      Promise.all([
        registerSvgIcon("attacker-blue", attackerBlueSvg),
        registerSvgIcon("attacker-red", attackerRedSvg),
        registerSvgIcon("interceptor-blue", interceptorBlueSvg),
        registerSvgIcon("interceptor-red", interceptorRedSvg),
        registerSvgIcon("jammer-blue", jammerBlueSvg),
        registerSvgIcon("jammer-red", jammerRedSvg),
      ]).then(() => {
        map.current.addLayer({
          id: "uavs",
          type: "symbol",
          source: "uavs",
          layout: {
            "icon-image": ["concat", ["get", "role"], "-", ["get", "team"]],
            "icon-rotate": ["get", "heading_degrees"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-size": 0.7,
          },
        });
      });
    });

    map.current.on("click", (e) => {
      onMapClick(e.lngLat);
    });

    map.current.getCanvas().style.cursor = "crosshair";

    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []);

  // Update cursor after setup complete
  useEffect(() => {
    if (!map.current) return;
    map.current.getCanvas().style.cursor =
      setupStep >= 4 ? "grab" : "crosshair";
  }, [setupStep]);

  // Place markers when scenario updates
  useEffect(() => {
    if (!map.current) return;

    Object.entries(scenario).forEach(([key, coords]) => {
      if (!coords) return;
      if (markers.current[key]) return;

      const config = MARKER_CONFIG[key];
      const el = createMarkerEl(config);

      markers.current[key] = new mapboxgl.Marker({ element: el })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map.current);
    });
  }, [scenario]);

  // Update UAV positions
  useEffect(() => {
    if (!map.current || !agents || agents.length === 0) return;
    if (!map.current.getSource("uavs")) return;

    const features = agents
      .filter((a) => a.alive)
      .map((agent) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [agent.lng, agent.lat],
        },
        properties: {
          team: agent.team,
          role: agent.role,
          heading_degrees: (agent.heading * 180) / Math.PI,
        },
      }));

    map.current.getSource("uavs").setData({
      type: "FeatureCollection",
      features,
    });
  }, [agents, worldSize]);

  return <div ref={mapContainer} className="w-full h-full" />;
}

export default Map;

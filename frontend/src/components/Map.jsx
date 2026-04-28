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

      map.current.addLayer({
        id: "uavs-blue",
        type: "circle",
        source: "uavs",
        filter: ["==", ["get", "team"], "blue"],
        paint: {
          "circle-radius": 6,
          "circle-color": "#00aaff",
          "circle-opacity": 0.9,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#00aaff",
        },
      });

      map.current.addLayer({
        id: "uavs-red",
        type: "circle",
        source: "uavs",
        filter: ["==", ["get", "team"], "red"],
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff3333",
          "circle-opacity": 0.9,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ff3333",
        },
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
          coordinates: [
            (agent.x / worldSize.width) * 0.1 - 0.05,
            51.5 + (agent.y / worldSize.height) * 0.1 - 0.05,
          ],
        },
        properties: { team: agent.team, heading: agent.heading },
      }));

    map.current.getSource("uavs").setData({
      type: "FeatureCollection",
      features,
    });
  }, [agents, worldSize]);

  return <div ref={mapContainer} className="w-full h-full" />;
}

export default Map;

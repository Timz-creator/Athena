import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map({ agents, worldSize }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 51.5],
      zoom: 10,
      pitch: 0,
      bearing: 0,
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

    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !agents || agents.length === 0) return;
    if (!map.current.getSource("uavs")) return;

    const features = agents.map((agent) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          (agent.x / worldSize.width) * 0.1 - 0.05,
          51.5 + (agent.y / worldSize.height) * 0.1 - 0.05,
        ],
      },
      properties: {
        team: agent.team,
        alive: agent.alive,
        heading: agent.heading,
      },
    }));

    map.current.getSource("uavs").setData({
      type: "FeatureCollection",
      features: features.filter((f) => f.properties.alive),
    });
  }, [agents, worldSize]);

  return <div ref={mapContainer} className="w-full h-full" />;
}

export default Map;

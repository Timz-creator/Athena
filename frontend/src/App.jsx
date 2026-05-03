import { useState, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import Results from "./components/Results";
import Header from "./components/Header";
import SetupIndicator from "./components/SetupIndicator";
import Toast from "./components/Toast";
import {
  buildCoordinateSystem,
  lngLatToWorld,
  worldToLngLat,
} from "./utils/coordinates";

function App() {
  const [params, setParams] = useState({
    n_agents_per_team: 3,
    steps: 200,
    attacker_ratio: 0.5,
  });

  const [results, setResults] = useState(null);
  const [setupStep, setSetupStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastColor, setToastColor] = useState("#00aaff");
  const wsRef = useRef(null);

  const [scenario, setScenario] = useState({
    blueBase: null,
    redBase: null,
    blueAsset: null,
    redAsset: null,
  });

  const STEP_LABELS = [
    { key: "blueBase", label: "Blue Base", coord: true },
    { key: "redBase", label: "Red Base", coord: true },
    { key: "blueAsset", label: "Blue Asset", coord: true },
    { key: "redAsset", label: "Red Asset", coord: true },
  ];

  const handleMapClick = (lngLat) => {
    setSetupStep((prev) => {
      if (prev >= 4) return prev;

      const step = STEP_LABELS[prev];
      const coords = { lng: lngLat.lng, lat: lngLat.lat };
      const color = step.key.startsWith("blue") ? "#00aaff" : "#ff3333";

      setScenario((s) => ({ ...s, [step.key]: coords }));
      setToast(
        `${step.label} placed — ${coords.lat.toFixed(4)}°N, ${Math.abs(coords.lng).toFixed(4)}°${coords.lng < 0 ? "W" : "E"}`,
      );
      setToastColor(color);

      return prev + 1;
    });
  };

  const handleExecute = () => {
    if (setupStep < 4 || isRunning) return;

    let bounds, worldScenario;
    try {
      bounds = buildCoordinateSystem(scenario);
      worldScenario = {
        blueBase: lngLatToWorld(scenario.blueBase.lng, scenario.blueBase.lat, bounds),
        redBase: lngLatToWorld(scenario.redBase.lng, scenario.redBase.lat, bounds),
        blueAsset: lngLatToWorld(scenario.blueAsset.lng, scenario.blueAsset.lat, bounds),
        redAsset: lngLatToWorld(scenario.redAsset.lng, scenario.redAsset.lat, bounds),
      };
    } catch (e) {
      setToast(`Setup error: ${e.message}`);
      setToastColor("#ff3333");
      return;
    }

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    setIsRunning(true);

    let ws;
    try {
      ws = new WebSocket("wss://athena-production-4518.up.railway.app/scenario/stream");
    } catch (e) {
      setIsRunning(false);
      setToast(`WebSocket error: ${e.message}`);
      setToastColor("#ff3333");
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ ...params, scenario: worldScenario, width: 200, height: 200 }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.done) {
          setIsRunning(false);
          setResults(data);
        } else {
          const agentsWithLngLat = data.agents.map((agent) => ({
            ...agent,
            lng: worldToLngLat(agent.x, agent.y, bounds).lng,
            lat: worldToLngLat(agent.x, agent.y, bounds).lat,
          }));
          setResults((prev) => ({ ...prev, agents: agentsWithLngLat, time: data.time }));
        }
      } catch (e) {
        setToast(`Message error: ${e.message}`);
        setToastColor("#ff3333");
      }
    };

    ws.onerror = () => {
      setIsRunning(false);
      setToast("Connection failed — is the server running?");
      setToastColor("#ff3333");
    };

    ws.onclose = () => setIsRunning(false);
  };
  return (
    <div className="flex h-screen w-screen bg-[#080d14] overflow-hidden">
      <Sidebar
        params={params}
        setParams={setParams}
        onExecute={handleExecute}
        setupStep={setupStep}
        scenarioReady={setupStep >= 4}
        isRunning={isRunning}
      >
        <SetupIndicator currentStep={setupStep} />
      </Sidebar>

      <div className="ml-[280px] flex-grow min-h-0 flex flex-col">
        <Header />
        <div className="flex-grow min-h-0">
          <Map
            agents={results ? results.agents : []}
            worldSize={{ width: 200, height: 200 }}
            scenario={scenario}
            setupStep={setupStep}
            onMapClick={handleMapClick}
          />
        </div>
        <Results results={results} />
      </div>

      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        color={toastColor}
      />
    </div>
  );
}

export default App;

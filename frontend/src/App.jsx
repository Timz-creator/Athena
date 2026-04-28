import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import Results from "./components/Results";
import Header from "./components/Header";
import SetupIndicator from "./components/SetupIndicator";
import Toast from "./components/Toast";

function App() {
  const [params, setParams] = useState({
    n_agents_per_team: 3,
    steps: 200,
    attacker_ratio: 0.5,
  });

  const [results, setResults] = useState(null);
  const [setupStep, setSetupStep] = useState(0);
  const [toast, setToast] = useState(null);
  const [toastColor, setToastColor] = useState("#00aaff");

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
    if (setupStep < 4) return;

    const ws = new WebSocket(
      "wss://athena-production-4518.up.railway.app/scenario/stream",
    );

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          ...params,
          scenario,
        }),
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.done) {
        setResults(data);
      } else {
        setResults((prev) => ({
          ...prev,
          agents: data.agents,
          time: data.time,
        }));
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
  };

  return (
    <div className="flex h-screen w-screen bg-[#080d14] overflow-hidden">
      <Sidebar
        params={params}
        setParams={setParams}
        onExecute={handleExecute}
        setupStep={setupStep}
        scenarioReady={setupStep >= 4}
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

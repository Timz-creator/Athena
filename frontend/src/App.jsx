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
    blue_n_agents: 3,
    red_n_agents: 3,
    blue_attacker_ratio: 0.5,
    red_attacker_ratio: 0.5,
    blue_n_jammers: 0,
    red_n_jammers: 0,
    steps: 200,
    seed: null,
  });

  const [results, setResults] = useState(null);
  const [assetStatus, setAssetStatus] = useState(null);
  const [setupStep, setSetupStep] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [monteCarloResults, setMonteCarloResults] = useState(null);
  const [isRunningMonteCarlo, setIsRunningMonteCarlo] = useState(false);
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
        blueBase: lngLatToWorld(
          scenario.blueBase.lng,
          scenario.blueBase.lat,
          bounds,
        ),
        redBase: lngLatToWorld(
          scenario.redBase.lng,
          scenario.redBase.lat,
          bounds,
        ),
        blueAsset: lngLatToWorld(
          scenario.blueAsset.lng,
          scenario.blueAsset.lat,
          bounds,
        ),
        redAsset: lngLatToWorld(
          scenario.redAsset.lng,
          scenario.redAsset.lat,
          bounds,
        ),
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
      ws = new WebSocket(
        "wss://athena-production-4518.up.railway.app/scenario/stream",
      );
    } catch (e) {
      setIsRunning(false);
      setToast(`WebSocket error: ${e.message}`);
      setToastColor("#ff3333");
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          ...params,
          scenario: worldScenario,
          width: 200,
          height: 200,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.done) {
          setIsRunning(false);
          setResults((prev) => ({
            ...prev,
            ...data,
            seed: data.seed,
          }));
        } else {
          setAssetStatus(data.assets);
          const agentsWithLngLat = data.agents.map((agent) => ({
            ...agent,
            lng: worldToLngLat(agent.x, agent.y, bounds).lng,
            lat: worldToLngLat(agent.x, agent.y, bounds).lat,
          }));
          setResults((prev) => ({
            ...prev,
            agents: agentsWithLngLat,
            time: data.time,
          }));
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

  const handleReset = () => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsRunning(false);
    setSetupStep(0);
    setScenario({
      blueBase: null,
      redBase: null,
      blueAsset: null,
      redAsset: null,
    });
    setResults(null);
    setMonteCarloResults(null);
    setAssetStatus(null);
    setResetKey((prev) => prev + 1);
  };

  const handleMonteCarlo = async () => {
    if (setupStep < 4 || isRunningMonteCarlo) return;

    setIsRunningMonteCarlo(true);
    try {
      const bounds = buildCoordinateSystem(scenario);
      const worldScenario = {
        blueBase: lngLatToWorld(
          scenario.blueBase.lng,
          scenario.blueBase.lat,
          bounds,
        ),
        redBase: lngLatToWorld(
          scenario.redBase.lng,
          scenario.redBase.lat,
          bounds,
        ),
        blueAsset: lngLatToWorld(
          scenario.blueAsset.lng,
          scenario.blueAsset.lat,
          bounds,
        ),
        redAsset: lngLatToWorld(
          scenario.redAsset.lng,
          scenario.redAsset.lat,
          bounds,
        ),
      };

      const response = await fetch(
        "https://athena-production-4518.up.railway.app/monte-carlo/run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blue_n_agents: params.blue_n_agents,
            red_n_agents: params.red_n_agents,
            blue_attacker_ratio: params.blue_attacker_ratio,
            red_attacker_ratio: params.red_attacker_ratio,
            blue_n_jammers: params.blue_n_jammers,
            red_n_jammers: params.red_n_jammers,
            steps: params.steps,
            n_runs: 50,
            width: 200,
            height: 200,
            seed: params.seed,
            blue_base: worldScenario.blueBase,
            red_base: worldScenario.redBase,
            blue_asset: worldScenario.blueAsset,
            red_asset: worldScenario.redAsset,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Monte Carlo request failed: ${response.status}`);
      }

      const data = await response.json();
      setMonteCarloResults(data);
    } catch (e) {
      setToast(`Monte Carlo error: ${e.message}`);
      setToastColor("#ff3333");
    } finally {
      setIsRunningMonteCarlo(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#080d14] overflow-hidden">
      <Sidebar
        params={params}
        setParams={setParams}
        onExecute={handleExecute}
        onReset={handleReset}
        onMonteCarlo={handleMonteCarlo}
        setupStep={setupStep}
        scenarioReady={setupStep >= 4}
        isRunning={isRunning}
        monteCarloResults={monteCarloResults}
        isRunningMonteCarlo={isRunningMonteCarlo}
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
            onReset={handleReset}
            resetKey={resetKey}
            assetStatus={assetStatus}
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

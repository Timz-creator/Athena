import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import Results from "./components/Results";
import Header from "./components/Header";

function App() {
  const [params, setParams] = useState({
    width: 200,
    height: 200,
    n_agents_per_team: 3,
    steps: 200,
  });

  const [results, setResults] = useState(null);

  const handleExecute = () => {
    const ws = new WebSocket(
      "wss://athena-production-4518.up.railway.app/scenario/stream",
    );

    ws.onopen = () => {
      ws.send(JSON.stringify(params));
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

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  return (
    <div className="flex h-screen w-screen bg-[#080d14] overflow-hidden">
      <Sidebar
        params={params}
        setParams={setParams}
        onExecute={handleExecute}
      />
      <div className="ml-[280px] flex-grow min-h-0 flex flex-col">
        <Header />
        <div className="flex-grow min-h-0">
          <Canvas
            agents={results ? results.agents : []}
            worldSize={{ width: params.width, height: params.height }}
          />
        </div>
        <Results results={results} />
      </div>
    </div>
  );
}

export default App;

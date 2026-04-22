import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import Results from "./components/Results";

function App() {
  const [params, setParams] = useState({
    width: 200,
    height: 200,
    n_agents_per_team: 3,
    steps: 200,
  });

  const [results, setResults] = useState(null);

  const handleExecute = async () => {
    const response = await fetch(
      "https://athena-production-4518.up.railway.app/scenario/run",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      },
    );
    const data = await response.json();
    setResults(data);
  };

  return (
    <div className="flex h-screen w-screen bg-[#080d14] overflow-hidden">
      <Sidebar
        params={params}
        setParams={setParams}
        onExecute={handleExecute}
      />
      <div className="ml-[280px] flex-grow min-h-0 flex flex-col">
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

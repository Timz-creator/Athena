import { useState } from "react";
import Sidebar from "./components/Sidebar";

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
    </div>
  );
}

export default App;

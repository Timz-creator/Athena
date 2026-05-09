function Sidebar({
  onExecute,
  onReset,
  onMonteCarlo,
  params,
  setParams,
  children,
  scenarioReady,
  isRunning,
  setupStep,
  monteCarloResults,
  isRunningMonteCarlo,
}) {
  const blueWins = monteCarloResults
    ? monteCarloResults.filter((r) => r.winner === "blue").length
    : 0;
  const redWins = monteCarloResults
    ? monteCarloResults.filter((r) => r.winner === "red").length
    : 0;
  const draws = monteCarloResults
    ? monteCarloResults.filter((r) => r.winner === "draw").length
    : 0;
  const total = monteCarloResults ? monteCarloResults.length : 0;

  return (
    <aside className="flex flex-col items-center py-4 w-[280px] h-screen fixed left-0 top-0 z-40 bg-[#0e0e0e] border-r border-[#1a1a1a]">
      {/* Brand Header */}
      <div className="w-full px-6 mb-4">
        <h1
          className="text-lg font-black text-[#00aaff] tracking-tighter uppercase"
          style={{ fontFamily: "Space Grotesk" }}
        >
          OP_ATHENA
        </h1>
        <p className="text-[10px] tracking-tight text-[#bbc9cf] opacity-60">
          SECTOR-7G // ACTIVE
        </p>
      </div>

      {/* Setup indicator injected here */}
      {children}

      {/* Parameters */}
      <div className="w-full px-6 py-4 space-y-6 flex-grow overflow-y-auto text-[white]">
        {[
          { label: "UAVs Per Team", key: "n_agents_per_team", min: 1, max: 20 },
          { label: "Steps", key: "steps", min: 100, max: 1000 },
          { label: "Jammers Per Team", key: "n_jammers", min: 0, max: 5 },
        ].map(({ label, key, min, max }) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-tighter">
              <span>{label}</span>
              <span className="text-[#00aaff]">{params[key]}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={params[key]}
              onChange={(e) =>
                setParams({ ...params, [key]: parseInt(e.target.value) })
              }
              className="w-full accent-[#00aaff] bg-[#1a1a1a] appearance-none h-px"
            />
          </div>
        ))}

        {/* Attacker ratio */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-tighter">
            <span>Attacker Ratio</span>
            <span className="text-[#00aaff]">
              {Math.round(params.attacker_ratio * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={params.attacker_ratio * 100}
            onChange={(e) =>
              setParams({
                ...params,
                attacker_ratio: parseInt(e.target.value) / 100,
              })
            }
            className="w-full accent-[#00aaff] bg-[#1a1a1a] appearance-none h-px"
          />
          <div className="flex justify-between text-[8px] text-[white] opacity-40">
            <span>All Intercept</span>
            <span>All Attack</span>
          </div>
        </div>
      </div>

      {/* Reset + Execute Buttons */}
      <div className="w-full px-6 pb-6">
        {setupStep > 0 && (
          <button
            onClick={onReset}
            className="w-full mb-3 py-4 font-black text-xs tracking-[0.2em] uppercase border border-[#ff3333] text-[#ff3333] hover:bg-[#ff3333] hover:text-black transition-colors"
          >
            RESET SCENARIO
          </button>
        )}
        <button
          onClick={onExecute}
          disabled={!scenarioReady || isRunning}
          className={`w-full py-4 font-black text-xs tracking-[0.2em] uppercase transition-colors ${
            isRunning
              ? "bg-[#005580] text-[#00aaff] cursor-not-allowed"
              : scenarioReady
              ? "bg-[#00aaff] text-[#000000] hover:bg-[#33bbff]"
              : "bg-[#1a1a1a] text-[#bbc9cf] opacity-40 cursor-not-allowed"
          }`}
        >
          {isRunning ? "RUNNING..." : scenarioReady ? "EXECUTE" : "COMPLETE SETUP"}
        </button>
        <button
          onClick={onMonteCarlo}
          disabled={setupStep < 4 || isRunningMonteCarlo}
          className="border border-[#9b59b6] text-[#9b59b6] hover:bg-[#9b59b6] hover:text-black transition-colors w-full py-3 text-xs tracking-[0.2em] uppercase font-black mt-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunningMonteCarlo ? "RUNNING..." : "MONTE CARLO"}
        </button>
        {monteCarloResults && total > 0 && (
          <div
            className="mt-3 text-[10px] uppercase tracking-widest space-y-1"
            style={{ fontFamily: "JetBrains Mono" }}
          >
            <div className="text-[#00aaff]">
              BLUE {Math.round((blueWins / total) * 100)}%
            </div>
            <div className="text-[#ff3333]">
              RED {Math.round((redWins / total) * 100)}%
            </div>
            <div className="text-[#bbc9cf]">
              DRAW {Math.round((draws / total) * 100)}%
            </div>
            <div className="text-[#bbc9cf]">{total} RUNS</div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

function Sidebar({ onExecute, params, setParams, children, scenarioReady, isRunning }) {
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

      {/* Execute Button */}
      <div className="w-full px-6 pb-6">
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
      </div>
    </aside>
  );
}

export default Sidebar;

function Sidebar({ onExecute, params, setParams }) {
  return (
    <aside className="flex flex-col items-center py-4 w-[280px] h-screen fixed left-0 top-0 z-40 bg-[#0e0e0e] border-r border-[#1a1a1a]">
      
      {/* Brand Header */}
      <div className="w-full px-6 mb-8">
        <h1 className="text-lg font-black text-[#00aaff] tracking-tighter uppercase" style={{fontFamily: 'Space Grotesk'}}>OP_ATHENA</h1>
        <p className="text-[10px] tracking-tight text-[#bbc9cf] opacity-60">SECTOR-7G // ACTIVE</p>
      </div>

      {/* Parameters */}
      <div className="w-full px-6 py-6 border-t text-white border-[#1a1a1a] space-y-6 flex-grow">
        
        {[
          { label: "World Width", key: "width", min: 100, max: 1000 },
          { label: "World Height", key: "height", min: 100, max: 1000 },
          { label: "Agents Per Team", key: "n_agents_per_team", min: 1, max: 20 },
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
              onChange={(e) => setParams({ ...params, [key]: parseInt(e.target.value) })}
              className="w-full accent-[#00aaff] bg-[#1a1a1a] appearance-none h-px"
            />
          </div>
        ))}

      </div>

      {/* Execute Button */}
      <div className="w-full px-6 pb-6">
        <button
          onClick={onExecute}
          className="w-full py-4 bg-[#00aaff] text-[#000000] font-black text-xs tracking-[0.2em] uppercase hover:bg-[#33bbff] transition-colors"
        >
          EXECUTE
        </button>
      </div>

    </aside>
  )
}

export default Sidebar
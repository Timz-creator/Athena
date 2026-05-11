function Results({ results }) {
  const hasResults = Boolean(results);

  const copySeed = async () => {
    if (results?.seed === undefined || results?.seed === null) return;
    try {
      await navigator.clipboard.writeText(String(results.seed));
    } catch {
      /* ignore */
    }
  };

  const winnerColour =
    results?.winner === "blue"
      ? "#00aaff"
      : results?.winner === "red"
        ? "#ff3333"
        : "#ffffff";

  const winnerText = results?.winner
    ? `${results.winner.toUpperCase()} // VICTORY`
    : "PENDING";

  const fmt = (n) => `£${(n / 1_000_000).toFixed(1)}M`;

  return (
    <div className="flex items-center gap-6 px-8 py-3 border-t border-[#1a1a1a] bg-[#0e0e0e] flex-wrap">
      <div className="flex flex-col min-w-0">
        <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
          SEED
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-white tracking-tight truncate">
            {hasResults && results.seed != null ? results.seed : "—"}
          </span>
          {hasResults && results.seed != null ? (
            <button
              type="button"
              onClick={copySeed}
              className="shrink-0 text-[10px] uppercase tracking-wider text-[#bbc9cf] opacity-70 hover:opacity-100 px-1 py-0.5 rounded border border-[#2a3540] hover:border-[#bbc9cf]"
              title="Copy seed"
            >
              Copy
            </button>
          ) : null}
        </div>
      </div>

      <div className="w-px h-6 bg-[#1a1a1a]" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
          Winner
        </span>
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: winnerColour }}
        >
          {winnerText}
        </span>
      </div>

      <div className="w-px h-6 bg-[#1a1a1a]" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
          Blue Survived
        </span>
        <span className="text-xs font-bold text-[#00aaff] tracking-widest">
          {hasResults ? (results.blue_survived ?? "-") : "-"}
        </span>
      </div>

      <div className="w-px h-6 bg-[#1a1a1a]" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
          Red Survived
        </span>
        <span className="text-xs font-bold text-[#ff3333] tracking-widest">
          {hasResults ? (results.red_survived ?? "-") : "-"}
        </span>
      </div>

      <div className="w-px h-6 bg-[#1a1a1a]" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
          Blue Damage
        </span>
        <span className="text-xs font-bold text-[#00aaff] tracking-widest">
          {hasResults && results.blue_damage_dealt
            ? fmt(results.blue_damage_dealt)
            : "-"}
        </span>
      </div>

      <div className="w-px h-6 bg-[#1a1a1a]" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
          Red Damage
        </span>
        <span className="text-xs font-bold text-[#ff3333] tracking-widest">
          {hasResults && results.red_damage_dealt
            ? fmt(results.red_damage_dealt)
            : "-"}
        </span>
      </div>

      <div className="w-px h-6 bg-[#1a1a1a]" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
          Blue Net
        </span>
        <span
          className="text-xs font-bold tracking-widest"
          style={{
            color: "#00aaff",
          }}
        >
          {hasResults && results.blue_net_outcome !== undefined
            ? fmt(results.blue_net_outcome)
            : "-"}
        </span>
      </div>

      <div className="w-px h-6 bg-[#1a1a1a]" />

      <div className="flex flex-col">
        <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
          Red Net
        </span>
        <span
          className="text-xs font-bold tracking-widest"
          style={{
            color: "#ff3333",
          }}
        >
          {hasResults && results.red_net_outcome !== undefined
            ? fmt(results.red_net_outcome)
            : "-"}
        </span>
      </div>
    </div>
  );
}

export default Results;

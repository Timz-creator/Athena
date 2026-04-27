function Results({ results }) {
  const hasResults = Boolean(results);

  const winnerColour =
    results?.winner === "blue"
      ? "#00aaff"
      : results?.winner === "red"
        ? "#ff3333"
        : "#ffffff";

  const winnerText = results?.winner
    ? `${results.winner.toUpperCase()} // VICTORY`
    : "PENDING";

  return (
    <div className="flex items-center gap-8 px-8 py-3 border-t border-[#1a1a1a] bg-[#0e0e0e]">
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
          Total Agents
        </span>
        <span className="text-xs font-bold text-white tracking-widest">
          {hasResults && results.agents ? results.agents.length : "-"}
        </span>
      </div>
    </div>
  );
}

export default Results;

import { useState } from "react";

function Results({ results }) {
  const hasResults = Boolean(results);
  const [seedCopied, setSeedCopied] = useState(false);

  const copySeed = async () => {
    if (results?.seed === undefined || results?.seed === null) return;
    try {
      await navigator.clipboard.writeText(String(results.seed));
      setSeedCopied(true);
      window.setTimeout(() => setSeedCopied(false), 1200);
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
              title={seedCopied ? "Copied" : "Copy seed"}
              aria-label={seedCopied ? "Copied" : "Copy seed"}
              className={`shrink-0 p-1 rounded border transition-all duration-200 text-[#bbc9cf] hover:text-white hover:border-[#2a3540] hover:bg-[#141920] active:scale-90 ${
                seedCopied
                  ? "border-[#00aaff] text-[#00aaff] scale-95"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {seedCopied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                  aria-hidden
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                  aria-hidden
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
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

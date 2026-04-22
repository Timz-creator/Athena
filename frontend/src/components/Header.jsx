import { useState, useEffect } from "react";

function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const utcTime = time.toUTCString().split(" ")[4];

  return (
    <header className="h-14 z-50 bg-[#080d14]/90 border-b border-[#1a1a1a] flex items-center justify-between px-8">
      <div className="flex items-center gap-10">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
            Operational Clock
          </span>
          <span className="text-xs font-bold text-[#00aaff] tracking-widest">
            {utcTime} UTC
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
            Region Coordinates
          </span>
          <span className="text-xs font-bold text-[#00aaff] tracking-widest">
            34.0522° N, 118.2437° W
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50">
            UAV Status
          </span>
          <span className="text-xs font-bold text-[#00aaff] tracking-widest">
            STABLE // TRANSMITTING
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold uppercase text-[#00aaff]">
          ATHENA // TACTICAL
        </span>
      </div>
    </header>
  );
}

export default Header;

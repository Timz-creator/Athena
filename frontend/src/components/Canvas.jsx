import { useRef, useEffect, useState } from "react";

function Canvas({ agents, worldSize }) {
  const canvasRef = useRef(null);
  const [agentPositions, setAgentPositions] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = "#080d14";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Grid
    ctx.strokeStyle = "#0d1f33";
    ctx.lineWidth = 0.5;
    const gridSize = 40;

    for (let x = 0; x <= rect.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    for (let y = 0; y <= rect.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Calculate agent positions after canvas is sized
    const positions = agents.map((agent) => ({
      ...agent,
      cx: (agent.x / worldSize.width) * rect.width,
      cy: (agent.y / worldSize.height) * rect.height,
    }));
    setAgentPositions(positions);
  }, [agents, worldSize]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />

      <svg className="absolute inset-0 w-full h-full">
        {agentPositions.map((agent, i) => {
          const colour = agent.team === "blue" ? "#00aaff" : "#ff3333";
          const degrees = (agent.heading * 180) / Math.PI;

          if (!agent.alive) {
            return (
              <g key={i} transform={`translate(${agent.cx}, ${agent.cy})`}>
                <line
                  x1="-7"
                  y1="-7"
                  x2="7"
                  y2="7"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="7"
                  y1="-7"
                  x2="-7"
                  y2="7"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <text
                  x="10"
                  y="4"
                  fill="rgba(255,255,255,0.2)"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  E_LOG_{String(i).padStart(3, "0")}
                </text>
              </g>
            );
          }

          return (
            <g
              key={i}
              transform={`translate(${agent.cx}, ${agent.cy}) rotate(${degrees})`}
            >
              <defs>
                <filter id={`glow-${i}`}>
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <polygon
                points="0,-12 -7,7 0,3 7,7"
                fill={colour + "99"}
                stroke={colour}
                strokeWidth="1.5"
                strokeLinejoin="round"
                filter={`url(#glow-${i})`}
              />
              <text
                x="12"
                y="4"
                fill={colour}
                fontSize="10"
                fontFamily="JetBrains Mono"
                transform={`rotate(${-degrees})`}
              >
                {agent.team.toUpperCase()}_{String(i).padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default Canvas;

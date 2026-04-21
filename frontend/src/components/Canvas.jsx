import { useRef, useEffect } from "react";

function Canvas({ agents, worldSize }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawAgents = () => {
      if (!agents || agents.length === 0) return;

      agents.forEach((agent) => {
        const x = (agent.x / worldSize.width) * canvas.width;
        const y = (agent.y / worldSize.height) * canvas.height;
        const colour = agent.team === "blue" ? "#00aaff" : "#ff3333";

        if (!agent.alive) {
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x - 6, y - 6);
          ctx.lineTo(x + 6, y + 6);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + 6, y - 6);
          ctx.lineTo(x - 6, y + 6);
          ctx.stroke();
        } else {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(agent.heading);

          // Glow
          ctx.shadowColor = colour;
          ctx.shadowBlur = 15;

          ctx.strokeStyle = colour;
          ctx.fillStyle = colour + "33";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.lineTo(-8, -8);
          ctx.lineTo(-4, 0);
          ctx.lineTo(-8, 8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.restore();
        }
      });
    };

    // Clear canvas
    ctx.fillStyle = "#080d14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#0d1f33";
    ctx.lineWidth = 0.5;
    const gridSize = 40;

    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw agents on top
    drawAgents();
  }, [agents, worldSize]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full"
    />
  );
}

export default Canvas;

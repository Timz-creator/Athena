import { useEffect } from "react";

function Toast({ message, onDismiss, color = "#00aaff" }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
      <div
        className="px-4 py-2 flex items-center gap-3 bg-[#131313]"
        style={{ border: `1px solid ${color}` }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
        />
        <span
          className="text-[10px] uppercase tracking-widest font-mono"
          style={{ color }}
        >
          {message}
        </span>
      </div>
    </div>
  );
}

export default Toast;

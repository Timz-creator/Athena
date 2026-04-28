const STEPS = [
    { label: 'Place Blue Base', team: 'blue' },
    { label: 'Place Red Base', team: 'red' },
    { label: 'Place Blue Asset', team: 'blue' },
    { label: 'Place Red Asset', team: 'red' },
    { label: 'Configure & Execute', team: null },
  ]
  
  function SetupIndicator({ currentStep }) {
    return (
      <div className="w-full px-6 py-4 border-b border-[#1a1a1a]">
        <div className="text-[8px] uppercase tracking-widest text-[#bbc9cf] opacity-50 mb-3">
          Mission Setup
        </div>
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const isComplete = i < currentStep
            const isCurrent = i === currentStep
            const isFuture = i > currentStep
  
            return (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isFuture ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {/* Status icon */}
                <div
                  className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${
                    isComplete
                      ? 'text-[#00aaff]'
                      : isCurrent
                      ? 'text-[#00aaff]'
                      : 'text-[#bbc9cf]'
                  }`}
                >
                  {isComplete ? (
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <polyline
                        points="2,6 5,9 10,3"
                        fill="none"
                        stroke="#00aaff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2 h-2 bg-[#00aaff] rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 border border-[#bbc9cf] rounded-full" />
                  )}
                </div>
  
                {/* Label */}
                <span
                  className={`text-[10px] uppercase tracking-widest font-mono ${
                    isComplete
                      ? 'text-[#bbc9cf]'
                      : isCurrent
                      ? 'text-[#00aaff] font-bold'
                      : 'text-[#bbc9cf]'
                  }`}
                >
                  {step.label}
                </span>
  
                {/* Current step arrow */}
                {isCurrent && (
                  <span className="text-[#00aaff] text-[10px] ml-auto animate-pulse">
                    ←
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  export default SetupIndicator
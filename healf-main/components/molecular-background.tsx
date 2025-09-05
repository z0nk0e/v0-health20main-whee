"use client"

export function MolecularBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full molecular-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}

        {/* Connection lines between molecules */}
        <svg className="absolute inset-0 w-full h-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="currentColor"
              strokeWidth="1"
              className="text-accent/20"
              strokeDasharray="2,4"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}

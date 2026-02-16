'use client'

/**
 * LiveWebcam Component
 * 
 * Links to North Bondi Surf Club live webcam feed
 * Opens in new tab due to CSP restrictions
 */
export default function LiveWebcam() {
  return (
    <a
      href="https://northbondisurfclub.com/webcam/"
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card p-4 md:p-6 block hover:scale-[1.02] transition-transform cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            🏄 North Bondi Live
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Live surf conditions
          </p>
        </div>
        <div className="text-2xl">↗️</div>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-900/30 to-cyan-900/30 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🌊</div>
          <p className="text-white font-semibold text-lg">Click to View Live Cam</p>
          <p className="text-gray-400 text-sm mt-2">Opens in new tab</p>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Courtesy of North Bondi SLSC
      </div>
    </a>
  )
}

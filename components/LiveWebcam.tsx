'use client'

/**
 * LiveWebcam Component
 * 
 * Displays the North Bondi Surf Club live webcam feed
 * Embedded from https://northbondisurfclub.com/webcam/
 */
export default function LiveWebcam() {
  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            🏄 North Bondi Live
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Live surf conditions
          </p>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-black bg-opacity-30" style={{ aspectRatio: '16/9' }}>
        <iframe
          src="https://g3.ipcamlive.com/player/player.php?alias=687a39cf71c58&skin=white&autoplay=1&mute=1&disableframecapture=1&disablestorageplayer=1&disabledownloadbutton=1&disableuserpause=1"
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="autoplay"
        />
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Courtesy of North Bondi SLSC
      </div>
    </div>
  )
}

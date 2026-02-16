'use client'

import { BandwidthMetrics } from '@/data/mockData'

interface BandwidthCapacityProps {
  metrics: BandwidthMetrics
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return `${num}`
}

const getHealthColor = (used: number, max: number) => {
  const percentage = (used / max) * 100
  if (percentage >= 90) return 'text-red-400'
  if (percentage >= 70) return 'text-yellow-400'
  return 'text-green-400'
}

const getHealthBarColor = (used: number, max: number) => {
  const percentage = (used / max) * 100
  if (percentage >= 90) return 'from-red-500 to-red-400'
  if (percentage >= 70) return 'from-yellow-500 to-yellow-400'
  return 'from-green-500 to-cyan-400'
}

export default function BandwidthCapacityComponent({
  metrics,
}: BandwidthCapacityProps) {
  const tokenPercentage = (metrics.tokensUsedToday / 1000000) * 100 // Assuming 1M daily limit
  const sessionPercentage = (metrics.concurrentSessions / metrics.maxConcurrent) * 100
  const requestPercentage = (metrics.requestsThisMin / metrics.rateLimitPerMin) * 100

  return (
    <div className="glass-card p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
        Bandwidth & Capacity
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Token Usage */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">📊</span> Token Usage (Today)
            </h3>
            <span className={`font-mono font-bold ${getHealthColor(metrics.tokensUsedToday, 1000000)}`}>
              {formatNumber(metrics.tokensUsedToday)}
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-white bg-opacity-10 rounded-full h-3 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${getHealthBarColor(metrics.tokensUsedToday, 1000000)} h-full rounded-full transition-all`}
                style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              ~1.0M daily limit ({Math.round(tokenPercentage)}%)
            </p>
          </div>
        </div>

        {/* Monthly Tokens */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">📈</span> Monthly Usage
            </h3>
            <span className="font-mono font-bold text-cyan-400">
              {formatNumber(metrics.tokensUsedMonth)}
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-white bg-opacity-10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                style={{ width: `35%` }} // Placeholder
              />
            </div>
            <p className="text-xs text-gray-400">
              ~3.0M monthly tracking
            </p>
          </div>
        </div>

        {/* Concurrent Sessions */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">🔄</span> Concurrent Sessions
            </h3>
            <span className={`font-mono font-bold ${getHealthColor(metrics.concurrentSessions, metrics.maxConcurrent)}`}>
              {metrics.concurrentSessions}/{metrics.maxConcurrent}
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-white bg-opacity-10 rounded-full h-3 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${getHealthBarColor(metrics.concurrentSessions, metrics.maxConcurrent)} h-full rounded-full transition-all`}
                style={{ width: `${sessionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {Math.round(sessionPercentage)}% capacity used
            </p>
          </div>
        </div>

        {/* Rate Limit */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="text-xl">⚡</span> Rate Limit (Per Min)
            </h3>
            <span className={`font-mono font-bold ${getHealthColor(metrics.requestsThisMin, metrics.rateLimitPerMin)}`}>
              {metrics.requestsThisMin}/{metrics.rateLimitPerMin}
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-white bg-opacity-10 rounded-full h-3 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${getHealthBarColor(metrics.requestsThisMin, metrics.rateLimitPerMin)} h-full rounded-full transition-all`}
                style={{ width: `${requestPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {Math.round(requestPercentage)}% of limit
            </p>
          </div>
        </div>
      </div>

      {/* Health Summary */}
      <div className="mt-6 pt-6 border-t border-white border-opacity-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">✓</p>
            <p className="text-xs text-gray-400 mt-1">All Systems Healthy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">OK</p>
            <p className="text-xs text-gray-400 mt-1">No Rate Limits Hit</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">↑</p>
            <p className="text-xs text-gray-400 mt-1">Capacity Available</p>
          </div>
        </div>
      </div>
    </div>
  )
}

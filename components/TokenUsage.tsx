'use client'

import { BandwidthMetrics } from '@/data/mockData'

interface TokenUsageProps {
  metrics: BandwidthMetrics
}

/**
 * Token Usage Component
 *
 * Displays detailed token consumption metrics:
 * - Daily and monthly token usage
 * - Concurrent session monitoring
 * - Rate limiting information
 *
 * Features:
 * - Visual progress bars for session capacity
 * - Real-time rate limit tracking
 * - Enhanced glassmorphism design
 */
export default function TokenUsage({ metrics }: TokenUsageProps) {
  const sessionUsagePercent = (metrics.concurrentSessions / metrics.maxConcurrent) * 100
  const rateLimitPercent = (metrics.requestsThisMin / metrics.rateLimitPerMin) * 100

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Token Usage</h2>
        <p className="text-gray-400 text-sm">Monitor your token consumption across sessions</p>
      </div>

      {/* Grid of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Usage */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Today's Usage</p>
              <p className="text-3xl font-bold text-cyan-300">
                {formatNumber(metrics.tokensUsedToday)}
              </p>
            </div>
            <span className="text-3xl">⚡</span>
          </div>
          <p className="text-xs text-gray-500">
            Tokens consumed in the last 24 hours
          </p>
        </div>

        {/* Monthly Usage */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Monthly Usage</p>
              <p className="text-3xl font-bold text-purple-300">
                {formatNumber(metrics.tokensUsedMonth)}
              </p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-xs text-gray-500">
            Total tokens consumed this month
          </p>
        </div>

        {/* Concurrent Sessions */}
        <div className="glass-card p-6 rounded-xl">
          <p className="text-gray-400 text-sm mb-4">Concurrent Sessions</p>
          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <p className="text-2xl font-bold text-blue-300">
                {metrics.concurrentSessions} / {metrics.maxConcurrent}
              </p>
              <span className="text-xs text-gray-400">{sessionUsagePercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all"
                style={{ width: `${sessionUsagePercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Active concurrent session slots in use
          </p>
        </div>

        {/* Rate Limiting */}
        <div className="glass-card p-6 rounded-xl">
          <p className="text-gray-400 text-sm mb-4">Rate Limiting</p>
          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <p className="text-2xl font-bold text-green-300">
                {metrics.requestsThisMin} / {metrics.rateLimitPerMin}
              </p>
              <span className="text-xs text-gray-400">{rateLimitPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-10 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  rateLimitPercent > 80
                    ? 'bg-gradient-to-r from-red-400 to-red-500'
                    : 'bg-gradient-to-r from-green-400 to-green-500'
                }`}
                style={{ width: `${rateLimitPercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Requests this minute
          </p>
        </div>
      </div>

      {/* Token burn rate info */}
      <div className="glass-card p-6 rounded-xl border border-white border-opacity-20">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-4">
          📈 Token Burn Rate
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Per Hour (Estimated)</p>
            <p className="text-lg font-bold text-cyan-300">
              ~{formatNumber(Math.floor(metrics.tokensUsedToday / 24))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Per Minute (Current)</p>
            <p className="text-lg font-bold text-purple-300">
              ~{Math.floor(metrics.requestsThisMin / 10)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

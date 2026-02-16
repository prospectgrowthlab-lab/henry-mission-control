'use client'

import { useUsageData } from '@/hooks/useUsageData'
import { useActiveSessions } from '@/hooks/useUsageData'

/**
 * Token Usage Component
 *
 * Displays real-time token consumption metrics:
 * - Daily and estimated monthly token usage
 * - Concurrent session monitoring
 * - Real-time updates every 30 seconds
 *
 * Features:
 * - Visual progress bars for session capacity
 * - Real-time rate limit tracking
 * - Enhanced glassmorphism design
 */
export default function TokenUsage() {
  const { data: usageData, loading: usageLoading, error: usageError } = useUsageData(30000)
  const { data: sessionsData, loading: sessionsLoading, error: sessionsError } = useActiveSessions(30000)

  if (usageError || sessionsError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Token Usage
          </h2>
          <p className="text-gray-400 text-sm">
            Monitor your token consumption across sessions
          </p>
        </div>
        <div className="glass-card p-6 rounded-xl bg-red-500 bg-opacity-10 border border-red-500">
          <p className="text-red-300">Error loading usage data</p>
        </div>
      </div>
    )
  }

  const metrics = usageData || {
    tokensUsedToday: 0,
    sessions: 0,
    totalMessages: 0,
  }

  const sessionMetrics = sessionsData || {
    count: 0,
    maxConcurrent: 4,
    percentageUtilized: 0,
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const sessionUsagePercent = sessionMetrics.percentageUtilized
  // Estimate rate limit based on messages in the last minute
  const rateLimitPercent = Math.min(
    ((metrics.totalMessages || 0) / 60) * 100,
    100
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Token Usage
        </h2>
        <p className="text-gray-400 text-sm">
          Monitor your token consumption across sessions
        </p>
      </div>

      {/* Grid of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Usage */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Today's Usage</p>
              <p className="text-3xl font-bold text-cyan-300">
                {usageLoading ? '...' : formatNumber(metrics.tokensUsedToday)}
              </p>
            </div>
            <span className="text-3xl">⚡</span>
          </div>
          <p className="text-xs text-gray-500">
            Tokens consumed in the last 24 hours
          </p>
        </div>

        {/* Monthly Usage (Estimated) */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Monthly Estimate</p>
              <p className="text-3xl font-bold text-purple-300">
                {usageLoading
                  ? '...'
                  : formatNumber(metrics.tokensUsedToday * 28)}
              </p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-xs text-gray-500">
            Estimated total tokens this month
          </p>
        </div>

        {/* Concurrent Sessions */}
        <div className="glass-card p-6 rounded-xl">
          <p className="text-gray-400 text-sm mb-4">Concurrent Sessions</p>
          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <p className="text-2xl font-bold text-blue-300">
                {sessionsLoading
                  ? '...'
                  : `${sessionMetrics.count} / ${sessionMetrics.maxConcurrent}`}
              </p>
              <span className="text-xs text-gray-400">
                {sessionUsagePercent.toFixed(0)}%
              </span>
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

        {/* Request Rate */}
        <div className="glass-card p-6 rounded-xl">
          <p className="text-gray-400 text-sm mb-4">Request Rate</p>
          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <p className="text-2xl font-bold text-green-300">
                {usageLoading ? '...' : `${(metrics.totalMessages || 0)}/min`}
              </p>
              <span className="text-xs text-gray-400">
                {rateLimitPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-white bg-opacity-10 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  rateLimitPercent > 80
                    ? 'bg-gradient-to-r from-red-400 to-red-500'
                    : 'bg-gradient-to-r from-green-400 to-green-500'
                }`}
                style={{ width: `${Math.min(rateLimitPercent, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Messages in the last minute</p>
        </div>
      </div>

      {/* Token burn rate info */}
      <div className="glass-card p-6 rounded-xl border border-white border-opacity-20">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-4">
          📈 Token Burn Rate
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Per Hour (Avg)</p>
            <p className="text-lg font-bold text-cyan-300">
              {usageLoading
                ? '...'
                : `~${formatNumber(
                    Math.floor((metrics.tokensUsedToday || 0) / 24)
                  )}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Messages Today</p>
            <p className="text-lg font-bold text-purple-300">
              {usageLoading ? '...' : metrics.totalMessages || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { HeartbeatInfo } from '@/data/mockData'

interface HeartbeatScheduleProps {
  data: HeartbeatInfo
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return '💚'
    case 'delayed':
      return '⏳'
    case 'failed':
      return '❌'
    default:
      return '❓'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-green-400'
    case 'delayed':
      return 'text-yellow-400'
    case 'failed':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

const formatTimeUntil = (date: Date) => {
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  if (diff < 0) {
    const absDiff = Math.abs(diff)
    const minutes = Math.floor(absDiff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `in ${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `in ${hours}h ${minutes % 60}m`
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

export default function HeartbeatScheduleComponent({
  data,
}: HeartbeatScheduleProps) {
  const timeSinceCheck = formatTimeUntil(data.lastCheck)
  const timeUntilNext = formatTimeUntil(data.nextScheduled)

  return (
    <div className="glass-card p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
        Heartbeat Schedule
      </h2>

      {/* Status indicator */}
      <div className="mb-6 bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10 flex items-center gap-3">
        <span className="text-4xl">{getStatusIcon(data.status)}</span>
        <div>
          <p className={`text-sm font-semibold ${getStatusColor(data.status)}`}>
            System {data.status === 'healthy' ? 'Healthy' : data.status === 'delayed' ? 'Delayed' : 'Failed'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data.status === 'healthy' && 'All heartbeats running on schedule'}
            {data.status === 'delayed' && 'Some heartbeats are running late'}
            {data.status === 'failed' && 'Heartbeat check failed - needs attention'}
          </p>
        </div>
      </div>

      {/* Schedule information */}
      <div className="space-y-4 mb-6">
        {/* Frequency */}
        <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Frequency</p>
          <p className="text-lg font-semibold text-white">{data.frequency}</p>
        </div>

        {/* Last Check */}
        <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                Last Heartbeat
              </p>
              <p className="text-lg font-semibold text-white">
                {formatTime(data.lastCheck)}
              </p>
              <p className="text-sm text-cyan-400 mt-2">
                {timeSinceCheck}
              </p>
            </div>
            <div className="text-2xl">❤️</div>
          </div>
        </div>

        {/* Next Scheduled */}
        <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                Next Scheduled
              </p>
              <p className="text-lg font-semibold text-white">
                {formatTime(data.nextScheduled)}
              </p>
              <p className="text-sm text-blue-400 mt-2">
                {timeUntilNext}
              </p>
            </div>
            <div className="text-2xl">⏰</div>
          </div>
        </div>
      </div>

      {/* Upcoming checks */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Upcoming Checks
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => {
            const nextCheck = new Date(data.nextScheduled.getTime() + (i - 1) * 30 * 60000)
            return (
              <div
                key={i}
                className="flex items-center justify-between bg-white bg-opacity-5 rounded-lg p-3 border border-white border-opacity-10 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">+{(i - 1) * 30}m</span>
                  <span className="text-gray-300">
                    {formatTime(nextCheck)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimeUntil(nextCheck)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* System info */}
      <div className="mt-6 pt-6 border-t border-white border-opacity-10 text-xs text-gray-400 space-y-1">
        <p>✓ No missed heartbeats</p>
        <p>✓ All checks returning successfully</p>
        <p>✓ Average response time: 245ms</p>
      </div>
    </div>
  )
}

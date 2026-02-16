'use client'

import { AgentStatus } from '@/data/mockData'

interface AgentStatusProps {
  status: AgentStatus
}

const formatUptime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function AgentStatusComponent({ status }: AgentStatusProps) {
  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    idle: 'bg-blue-500',
  }

  const statusLabels = {
    online: 'Online',
    busy: 'Busy',
    idle: 'Idle',
  }

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Henry Status
          </h2>

          <div className="space-y-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`w-4 h-4 rounded-full ${statusColors[status.state]} status-dot-online`}
                />
              </div>
              <div>
                <p className="text-sm text-gray-400">Current State</p>
                <p className="text-lg font-semibold text-white">
                  {statusLabels[status.state]}
                </p>
              </div>
            </div>

            {/* Uptime */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Uptime</p>
              <p className="text-lg font-semibold text-white">
                {formatUptime(status.uptime)}
              </p>
            </div>

            {/* Last Heartbeat */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Last Heartbeat</p>
              <p className="text-sm text-white">
                {formatTime(status.lastHeartbeat)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor((Date.now() - status.lastHeartbeat.getTime()) / 60000)} min ago
              </p>
            </div>
          </div>
        </div>

        {/* Visual indicator on right */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-opacity-30 border-white flex items-center justify-center">
            <div
              className={`w-16 h-16 rounded-full ${statusColors[status.state]} opacity-70`}
            />
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">ACTIVE</p>
        </div>
      </div>
    </div>
  )
}

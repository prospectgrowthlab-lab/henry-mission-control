'use client'

import AgentStatus from '@/components/AgentStatus'
import ActiveTasks from '@/components/ActiveTasks'
import BandwidthCapacity from '@/components/BandwidthCapacity'
import CostReport from '@/components/CostReport'
import HeartbeatSchedule from '@/components/HeartbeatSchedule'
import {
  mockAgentStatus,
  mockTasks,
  mockBandwidth,
  mockCostReport,
  mockHeartbeat,
} from '@/data/mockData'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    // Update time
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen px-4 md:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Henry Mission Control
            </h1>
            <p className="text-gray-400">
              Real-time monitoring and analytics for your OpenClaw agent
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <p className="text-2xl font-mono font-bold text-cyan-400">
              {currentTime}
            </p>
            <p className="text-sm text-gray-400">Sydney, Australia</p>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-green-400">✓</p>
            <p className="text-xs text-gray-400 mt-2">All Systems</p>
            <p className="text-sm font-semibold text-white">Operational</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">2</p>
            <p className="text-xs text-gray-400 mt-2">Active</p>
            <p className="text-sm font-semibold text-white">Sessions</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">145K</p>
            <p className="text-xs text-gray-400 mt-2">Tokens Today</p>
            <p className="text-sm font-semibold text-white">14.5% Budget</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">$0.62</p>
            <p className="text-xs text-gray-400 mt-2">Spent Today</p>
            <p className="text-sm font-semibold text-white">20.7% Budget</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Row 1: Agent Status + Heartbeat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentStatus status={mockAgentStatus} />
          <HeartbeatSchedule data={mockHeartbeat} />
        </div>

        {/* Row 2: Active Tasks */}
        <div>
          <ActiveTasks tasks={mockTasks} />
        </div>

        {/* Row 3: Bandwidth + Cost */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BandwidthCapacity metrics={mockBandwidth} />
          <CostReport data={mockCostReport} />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white border-opacity-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-xs text-gray-500">
        <div>
          <p>Henry Mission Control • OpenClaw Agent Dashboard</p>
          <p className="mt-1">Data updates in real-time • API integration ready</p>
        </div>
        <div className="text-right">
          <p>Last updated: {currentTime}</p>
          <p className="mt-1">Status: All systems operational</p>
        </div>
      </div>
    </main>
  )
}

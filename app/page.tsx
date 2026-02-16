'use client'

import AgentStatus from '@/components/AgentStatus'
import BandwidthCapacity from '@/components/BandwidthCapacity'
import CostReport from '@/components/CostReport'
import HeartbeatSchedule from '@/components/HeartbeatSchedule'
import Sidebar from '@/components/Sidebar'
import KanbanBoard from '@/components/KanbanBoard'
import TokenUsage from '@/components/TokenUsage'
import {
  mockAgentStatus,
  mockTasks,
  mockBandwidth,
  mockCostReport,
  mockHeartbeat,
} from '@/data/mockData'
import { useEffect, useState } from 'react'

type ActiveSection = 'agent' | 'tokens' | 'heartbeat' | 'kanban' | 'cost'

/**
 * Henry Mission Control Dashboard - Main Page
 *
 * Features:
 * - Sidebar navigation for quick section jumping
 * - Responsive grid layout (sidebar + main content)
 * - Multiple dashboard sections:
 *   - Agent Status: Real-time agent state and uptime
 *   - Token Usage: Token consumption and rate limiting
 *   - Heartbeat Monitor: System health checks
 *   - Kanban Board: Task management with drag-drop ready UI
 *   - Cost Report: Daily spending and model breakdown
 * - Enhanced glassmorphism with Apple Glass aesthetic
 * - Mobile responsive design
 */
export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [activeSection, setActiveSection] = useState<ActiveSection>('agent')
  const [tasks, setTasks] = useState(mockTasks)

  useEffect(() => {
    // Update time every second
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

  // Mock function to handle task cancellation
  const handleCancelTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: 'completed' as const, progress: 100 }
          : task
      )
    )
  }

  // Handle navigation to different sections
  const handleNavigate = (section: ActiveSection) => {
    setActiveSection(section)
  }

  // Render different sections based on active navigation
  const renderSection = () => {
    switch (activeSection) {
      case 'agent':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AgentStatus status={mockAgentStatus} />
            <HeartbeatSchedule data={mockHeartbeat} />
          </div>
        )
      case 'tokens':
        return <TokenUsage metrics={mockBandwidth} />
      case 'heartbeat':
        return (
          <div className="grid grid-cols-1 gap-6 mb-6">
            <HeartbeatSchedule data={mockHeartbeat} />
            <BandwidthCapacity metrics={mockBandwidth} />
          </div>
        )
      case 'kanban':
        return <KanbanBoard tasks={tasks} onCancelTask={handleCancelTask} />
      case 'cost':
        return (
          <div className="grid grid-cols-1 gap-6 mb-6">
            <CostReport data={mockCostReport} />
            <BandwidthCapacity metrics={mockBandwidth} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header with time */}
        <div className="sticky top-0 z-30 glass-card rounded-none md:rounded-b-2xl backdrop-blur-md border-b border-white border-opacity-20 md:ml-0">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Henry Mission Control
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Real-time monitoring and analytics
              </p>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-4">
              <div className="text-right">
                <p className="text-xl md:text-2xl font-mono font-bold text-cyan-400">
                  {currentTime}
                </p>
                <p className="text-xs md:text-sm text-gray-400">Sydney, Australia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-400">✓</p>
              <p className="text-xs text-gray-400 mt-2">All Systems</p>
              <p className="text-sm font-semibold text-white">Operational</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-400">2</p>
              <p className="text-xs text-gray-400 mt-2">Active</p>
              <p className="text-sm font-semibold text-white">Sessions</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-cyan-400">145K</p>
              <p className="text-xs text-gray-400 mt-2">Tokens Today</p>
              <p className="text-sm font-semibold text-white">14.5% Budget</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-400">$0.62</p>
              <p className="text-xs text-gray-400 mt-2">Spent Today</p>
              <p className="text-sm font-semibold text-white">20.7% Budget</p>
            </div>
          </div>

          {/* Main content section */}
          <div className="pb-8">
            {renderSection()}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white border-opacity-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-xs text-gray-500">
            <div>
              <p>Henry Mission Control • OpenClaw Agent Dashboard</p>
              <p className="mt-1">Data updates in real-time • Enhanced Glassmorphism Design</p>
            </div>
            <div className="text-right">
              <p>Last updated: {currentTime}</p>
              <p className="mt-1">Status: All systems operational</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

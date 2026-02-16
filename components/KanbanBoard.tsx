'use client'

import { Task } from '@/data/mockData'
import { useState } from 'react'

interface KanbanBoardProps {
  tasks: Task[]
  onCancelTask?: (taskId: string) => void
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'main-session':
      return '🎯'
    case 'sub-agent':
      return '🤖'
    case 'scheduled-task':
      return '⏰'
    default:
      return '📋'
  }
}

const getModelColor = (model?: string) => {
  switch (model) {
    case 'haiku':
      return 'bg-blue-500 bg-opacity-20 border-blue-500 text-blue-300'
    case 'sonnet':
      return 'bg-purple-500 bg-opacity-20 border-purple-500 text-purple-300'
    case 'opus':
      return 'bg-orange-500 bg-opacity-20 border-orange-500 text-orange-300'
    default:
      return 'bg-gray-500 bg-opacity-20 border-gray-500 text-gray-300'
  }
}

const getModelIcon = (model?: string) => {
  switch (model) {
    case 'haiku':
      return '⚡'
    case 'sonnet':
      return '🎵'
    case 'opus':
      return '👑'
    default:
      return '📦'
  }
}

const formatDuration = (startTime: Date) => {
  const minutes = Math.floor((Date.now() - startTime.getTime()) / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

/**
 * Kanban Board Component
 *
 * Displays tasks in three columns:
 * - Queued: Tasks waiting to be executed
 * - Running: Currently active tasks
 * - Completed: Finished tasks
 *
 * Features:
 * - Shows model being used for each task
 * - Cancel button for running tasks (mock implementation)
 * - Progress bar for running tasks
 * - Responsive drag-and-drop ready layout
 */
export default function KanbanBoard({ tasks, onCancelTask }: KanbanBoardProps) {
  const [cancelingTaskId, setCancelingTaskId] = useState<string | null>(null)

  const queuedTasks = tasks.filter((t) => t.status === 'queued')
  const runningTasks = tasks.filter((t) => t.status === 'running')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  const handleCancelTask = (taskId: string) => {
    setCancelingTaskId(taskId)
    // Simulate cancellation delay
    setTimeout(() => {
      if (onCancelTask) {
        onCancelTask(taskId)
      }
      setCancelingTaskId(null)
    }, 500)
  }

  const KanbanCard = ({ task }: { task: Task }) => (
    <div className="glass-card p-4 rounded-xl border border-white border-opacity-20 hover:border-opacity-40 transition-all group">
      {/* Header with type and model */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-lg">{getTypeLabel(task.type)}</span>
        <div className={`px-2 py-1 rounded-md text-xs border border-opacity-30 font-medium flex items-center gap-1 ${getModelColor(task.model)}`}>
          <span>{getModelIcon(task.model)}</span>
          <span className="capitalize">{task.model || 'unknown'}</span>
        </div>
      </div>

      {/* Task name */}
      <h3 className="text-sm font-semibold text-white mb-3 line-clamp-2 group-hover:text-cyan-300 transition">
        {task.name}
      </h3>

      {/* Progress bar for running tasks */}
      {task.status === 'running' && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs font-semibold text-cyan-400">{task.progress}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>{formatDuration(task.startTime)}</span>
        <span>•</span>
        <span className="capitalize">{task.status}</span>
      </div>

      {/* Action button */}
      {task.status === 'running' && (
        <button
          onClick={() => handleCancelTask(task.id)}
          disabled={cancelingTaskId === task.id}
          className={`
            w-full px-3 py-2 rounded-lg text-xs font-semibold
            transition-all duration-200
            ${
              cancelingTaskId === task.id
                ? 'bg-red-500 bg-opacity-20 border border-red-500 text-red-300 cursor-wait'
                : 'bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 text-red-400 hover:bg-opacity-20 hover:border-opacity-50'
            }
          `}
        >
          {cancelingTaskId === task.id ? 'Cancelling...' : 'Cancel Task'}
        </button>
      )}

      {task.status === 'completed' && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30">
          <span className="text-green-400">✓</span>
          <span className="text-xs font-semibold text-green-400">Completed</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Kanban header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Tasks</h2>
        <p className="text-gray-400 text-sm">Organize and manage your active tasks</p>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Queued Column */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white border-opacity-10">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <h3 className="text-sm font-bold text-orange-300 uppercase tracking-wide">
              Queued
            </h3>
            <span className="ml-auto text-xs font-semibold text-gray-400 bg-white bg-opacity-10 px-2 py-1 rounded-full">
              {queuedTasks.length}
            </span>
          </div>
          <div className="space-y-3 flex-1">
            {queuedTasks.length === 0 ? (
              <div className="glass-card p-6 rounded-xl flex items-center justify-center min-h-40 border-dashed border-white border-opacity-20">
                <p className="text-gray-500 text-sm text-center">No queued tasks</p>
              </div>
            ) : (
              queuedTasks.map((task) => <KanbanCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* Running Column */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white border-opacity-10">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wide">
              Running
            </h3>
            <span className="ml-auto text-xs font-semibold text-gray-400 bg-white bg-opacity-10 px-2 py-1 rounded-full">
              {runningTasks.length}
            </span>
          </div>
          <div className="space-y-3 flex-1">
            {runningTasks.length === 0 ? (
              <div className="glass-card p-6 rounded-xl flex items-center justify-center min-h-40 border-dashed border-white border-opacity-20">
                <p className="text-gray-500 text-sm text-center">No running tasks</p>
              </div>
            ) : (
              runningTasks.map((task) => <KanbanCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white border-opacity-10">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h3 className="text-sm font-bold text-green-300 uppercase tracking-wide">
              Completed
            </h3>
            <span className="ml-auto text-xs font-semibold text-gray-400 bg-white bg-opacity-10 px-2 py-1 rounded-full">
              {completedTasks.length}
            </span>
          </div>
          <div className="space-y-3 flex-1">
            {completedTasks.length === 0 ? (
              <div className="glass-card p-6 rounded-xl flex items-center justify-center min-h-40 border-dashed border-white border-opacity-20">
                <p className="text-gray-500 text-sm text-center">No completed tasks</p>
              </div>
            ) : (
              completedTasks.map((task) => <KanbanCard key={task.id} task={task} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

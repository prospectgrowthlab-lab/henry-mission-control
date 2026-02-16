'use client'

import { Task } from '@/data/mockData'

interface ActiveTasksProps {
  tasks: Task[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'bg-blue-500'
    case 'queued':
      return 'bg-orange-500'
    case 'completed':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'running':
      return 'Running'
    case 'queued':
      return 'Queued'
    case 'completed':
      return 'Completed'
    default:
      return 'Unknown'
  }
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

const formatDuration = (startTime: Date, endTime?: Date) => {
  const end = endTime || new Date()
  const minutes = Math.floor((end.getTime() - startTime.getTime()) / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

export default function ActiveTasksComponent({ tasks }: ActiveTasksProps) {
  const activeTasks = tasks.filter((t) => t.status !== 'completed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="glass-card p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
        Active Tasks
      </h2>

      {/* Active Tasks */}
      <div className="space-y-4 mb-8">
        {activeTasks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No active tasks</p>
        ) : (
          activeTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10 hover:border-opacity-20 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTypeLabel(task.type)}</span>
                    <h3 className="font-semibold text-white truncate">
                      {task.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="w-full bg-white bg-opacity-10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>Progress: {task.progress}%</span>
                    <span>•</span>
                    <span>Duration: {formatDuration(task.startTime)}</span>
                    {task.estimatedEnd && (
                      <>
                        <span>•</span>
                        <span>ETA: {formatDuration(task.startTime, task.estimatedEnd)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Recently Completed
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 bg-white bg-opacity-5 rounded-lg p-3 border border-white border-opacity-5 text-sm"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300 truncate">{task.name}</span>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDuration(task.startTime)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

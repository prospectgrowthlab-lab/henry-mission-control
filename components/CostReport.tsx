'use client'

import { useCostReportData } from '@/hooks/useUsageData'

/**
 * Cost Report Component
 *
 * Displays real-time cost tracking against the $3/day budget
 * Shows breakdown by model (Haiku/Sonnet/Opus)
 * Updates automatically every 30 seconds
 */

const getModelColor = (model: string) => {
  const lower = model.toLowerCase()
  if (lower.includes('haiku')) return 'text-blue-400'
  if (lower.includes('opus')) return 'text-orange-400'
  return 'text-purple-400' // sonnet
}

const getModelBgColor = (model: string) => {
  const lower = model.toLowerCase()
  if (lower.includes('haiku')) return 'bg-blue-500 bg-opacity-20 border-blue-500'
  if (lower.includes('opus')) return 'bg-orange-500 bg-opacity-20 border-orange-500'
  return 'bg-purple-500 bg-opacity-20 border-purple-500' // sonnet
}

const getModelIcon = (model: string) => {
  const lower = model.toLowerCase()
  if (lower.includes('haiku')) return '⚡'
  if (lower.includes('opus')) return '👑'
  return '🎵' // sonnet
}

const formatCurrency = (num: number) => {
  return `$${num.toFixed(4)}`
}

export default function CostReportComponent() {
  const { data, loading, error, isMockData } = useCostReportData(30000)

  if (loading || !data) {
    return (
      <div className="glass-card p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
          Cost Report
        </h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const summary = data.summary
  const budgetHealth =
    summary.budgetUsed >= 90
      ? 'text-red-400'
      : summary.budgetUsed >= 70
        ? 'text-yellow-400'
        : 'text-green-400'

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          Cost Report
        </h2>
        {isMockData && (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-400">
            Mock Data
          </span>
        )}
      </div>

      {/* Daily Budget Overview */}
      <div className="mb-8 bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-gray-400 mb-1">Today's Spending</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(summary.totalCost)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Daily budget: {formatCurrency(summary.dailyBudget)}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${budgetHealth}`}>
              {summary.budgetUsed.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Used</p>
          </div>
        </div>

        {/* Budget bar */}
        <div className="w-full bg-white bg-opacity-10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
            style={{ width: `${Math.min(summary.budgetUsed, 100)}%` }}
          />
        </div>

        {/* Remaining */}
        <div className="mt-3 flex justify-between items-center text-sm">
          <span className="text-gray-400">Remaining:</span>
          <span className="font-semibold text-green-400">
            {formatCurrency(Math.max(0, summary.budgetRemaining))}
          </span>
        </div>
      </div>

      {/* Model breakdown */}
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">
        Breakdown by Model
      </h3>

      <div className="space-y-3 mb-6">
        {data.modelUsage.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No usage data yet today</p>
          </div>
        ) : (
          data.modelUsage.map((usage) => {
            const totalCost = usage.totalCost
            return (
              <div
                key={usage.model}
                className={`rounded-lg p-4 border border-opacity-20 ${getModelBgColor(usage.model)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getModelIcon(usage.model)}</span>
                    <div>
                      <h4
                        className={`font-semibold capitalize ${getModelColor(usage.model)}`}
                      >
                        {usage.model}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {usage.inputTokens.toLocaleString()} in /
                        {usage.outputTokens.toLocaleString()} out
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-lg ${getModelColor(usage.model)}`}
                  >
                    {formatCurrency(totalCost)}
                  </p>
                </div>

                {/* Cost breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 pl-7">
                  <div>
                    <p className="text-gray-500">Input cost:</p>
                    <p className="font-mono">{formatCurrency(usage.costInput)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Output cost:</p>
                    <p className="font-mono">{formatCurrency(usage.costOutput)}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Total Summary */}
      <div className="pt-6 border-t border-white border-opacity-10">
        <div className="flex justify-between items-center">
          <p className="text-gray-300 font-semibold">Total Today</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(summary.totalCost)}
          </p>
        </div>
        <div className="mt-2 text-xs text-gray-400 flex justify-between">
          <span>{summary.totalMessages} messages processed</span>
          <span>{summary.totalTokens.toLocaleString()} tokens</span>
        </div>
      </div>
    </div>
  )
}

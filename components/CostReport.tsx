'use client'

import { CostReport as CostReportType } from '@/data/mockData'

interface CostReportProps {
  data: CostReportType
}

const getModelColor = (model: string) => {
  switch (model) {
    case 'haiku':
      return 'text-blue-400'
    case 'sonnet':
      return 'text-purple-400'
    case 'opus':
      return 'text-orange-400'
    default:
      return 'text-gray-400'
  }
}

const getModelBgColor = (model: string) => {
  switch (model) {
    case 'haiku':
      return 'bg-blue-500 bg-opacity-20 border-blue-500'
    case 'sonnet':
      return 'bg-purple-500 bg-opacity-20 border-purple-500'
    case 'opus':
      return 'bg-orange-500 bg-opacity-20 border-orange-500'
    default:
      return 'bg-gray-500 bg-opacity-20 border-gray-500'
  }
}

const getModelIcon = (model: string) => {
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

const formatCurrency = (num: number) => {
  return `$${num.toFixed(4)}`
}

export default function CostReportComponent({ data }: CostReportProps) {
  const budgetRemaining = data.dailyBudget - data.totalCost
  const budgetPercentage = (data.totalCost / data.dailyBudget) * 100
  const budgetHealth =
    budgetPercentage >= 90 ? 'text-red-400' : budgetPercentage >= 70 ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="glass-card p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
        Cost Report
      </h2>

      {/* Daily Budget Overview */}
      <div className="mb-8 bg-white bg-opacity-5 rounded-xl p-4 border border-white border-opacity-10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-gray-400 mb-1">Today's Spending</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(data.totalCost)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Daily budget: {formatCurrency(data.dailyBudget)}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${budgetHealth}`}>
              {budgetPercentage.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Used</p>
          </div>
        </div>

        {/* Budget bar */}
        <div className="w-full bg-white bg-opacity-10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>

        {/* Remaining */}
        <div className="mt-3 flex justify-between items-center text-sm">
          <span className="text-gray-400">Remaining:</span>
          <span className="font-semibold text-green-400">
            {formatCurrency(Math.max(0, budgetRemaining))}
          </span>
        </div>
      </div>

      {/* Model breakdown */}
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">
        Breakdown by Model
      </h3>

      <div className="space-y-3 mb-6">
        {data.modelUsage.map((usage) => {
          const totalCost = usage.costInput + usage.costOutput
          return (
            <div
              key={usage.model}
              className={`rounded-lg p-4 border border-opacity-20 ${getModelBgColor(usage.model)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getModelIcon(usage.model)}</span>
                  <div>
                    <h4 className={`font-semibold capitalize ${getModelColor(usage.model)}`}>
                      {usage.model}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {usage.inputTokens.toLocaleString()} in / {usage.outputTokens.toLocaleString()} out
                    </p>
                  </div>
                </div>
                <p className={`font-bold text-lg ${getModelColor(usage.model)}`}>
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
        })}
      </div>

      {/* Total Summary */}
      <div className="pt-6 border-t border-white border-opacity-10">
        <div className="flex justify-between items-center">
          <p className="text-gray-300 font-semibold">Total Today</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(data.totalCost)}
          </p>
        </div>
      </div>
    </div>
  )
}

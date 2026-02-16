'use client'

import { useEffect, useState } from 'react'

export interface ModelUsage {
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
  totalTokens?: number
  costInput: number
  costOutput: number
  costCacheRead?: number
  costCacheWrite?: number
  totalCost: number
  messageCount?: number
}

export interface UsageData {
  date: string
  modelUsage: ModelUsage[]
  totalCost: number
  budgetRemaining?: number
  budgetPercentage?: number
  dailyBudget: number
  tokensUsedToday: number
  totalMessages?: number
  sessions: number
}

export interface CostReportData {
  date: string
  modelUsage: ModelUsage[]
  summary: {
    totalCost: number
    totalTokens: number
    totalMessages: number
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    cacheWriteTokens: number
    inputCost: number
    outputCost: number
    cacheReadCost: number
    cacheWriteCost: number
    dailyBudget: number
    budgetUsed: number
    budgetRemaining: number
  }
}

export interface ActiveSession {
  id: string
  model: string
  startTime: string
  lastActivity: string
  isActive: boolean
  duration: number
}

export interface ActiveSessionsData {
  count: number
  sessions: ActiveSession[]
  maxConcurrent: number
  percentageUtilized: number
}

// Hook for fetching today's usage
export function useUsageData(refreshInterval: number = 30000) {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/usage/today')
        if (!response.ok) {
          throw new Error('Failed to fetch usage data')
        }
        const json = await response.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching usage data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { data, loading, error }
}

// Mock data for fallback
const mockCostReportData: CostReportData = {
  date: new Date().toISOString().split('T')[0],
  modelUsage: [
    {
      model: 'haiku',
      inputTokens: 125000,
      outputTokens: 45000,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 170000,
      costInput: 0.0313,
      costOutput: 0.0563,
      costCacheRead: 0,
      costCacheWrite: 0,
      totalCost: 0.0876,
      messageCount: 15,
    },
    {
      model: 'sonnet',
      inputTokens: 15000,
      outputTokens: 8500,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      totalTokens: 23500,
      costInput: 0.045,
      costOutput: 0.1275,
      costCacheRead: 0,
      costCacheWrite: 0,
      totalCost: 0.1725,
      messageCount: 8,
    },
  ],
  summary: {
    totalCost: 0.26,
    totalTokens: 193500,
    totalMessages: 23,
    inputTokens: 140000,
    outputTokens: 53500,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    inputCost: 0.0763,
    outputCost: 0.1838,
    cacheReadCost: 0,
    cacheWriteCost: 0,
    dailyBudget: 3.0,
    budgetUsed: 8.7,
    budgetRemaining: 2.74,
  },
}

// Hook for fetching cost report
export function useCostReportData(refreshInterval: number = 30000) {
  const [data, setData] = useState<CostReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/usage/cost-report')
        if (!response.ok) {
          throw new Error('Failed to fetch cost report')
        }
        const json = await response.json()
        setData(json)
        setError(null)
        setIsMockData(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.warn('Failed to fetch live data, using mock data:', err)
        setData(mockCostReportData)
        setIsMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { data, loading, error, isMockData }
}

// Hook for fetching active sessions
export function useActiveSessions(refreshInterval: number = 30000) {
  const [data, setData] = useState<ActiveSessionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/sessions/active')
        if (!response.ok) {
          throw new Error('Failed to fetch active sessions')
        }
        const json = await response.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching active sessions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { data, loading, error }
}

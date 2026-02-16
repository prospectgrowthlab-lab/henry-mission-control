import { NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

interface UsageData {
  input: number
  output: number
  cacheRead?: number
  cacheWrite?: number
  cost: {
    input: number
    output: number
    cacheRead?: number
    cacheWrite?: number
    total: number
  }
}

interface Message {
  timestamp: string
  message?: {
    model?: string
    usage?: UsageData
  }
}

// Check if we should proxy to external API (for Vercel deployment)
const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_USAGE_API_URL

async function fetchFromExternalAPI() {
  const response = await fetch(`${EXTERNAL_API_URL}/api/usage/today`, {
    next: { revalidate: 30 } // Cache for 30 seconds
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch from external API')
  }
  
  return response.json()
}

async function fetchFromLocalFiles() {
  const sessionsDir = '/Users/louiswand/.openclaw/agents/main/sessions'
  const today = new Date().toISOString().split('T')[0]
  
  let totalCost = 0
  let totalInputTokens = 0
  let totalOutputTokens = 0
  
  const modelBreakdown: Record<string, {
    inputTokens: number
    outputTokens: number
    costInput: number
    costOutput: number
  }> = {
    haiku: { inputTokens: 0, outputTokens: 0, costInput: 0, costOutput: 0 },
    sonnet: { inputTokens: 0, outputTokens: 0, costInput: 0, costOutput: 0 },
    opus: { inputTokens: 0, outputTokens: 0, costInput: 0, costOutput: 0 },
  }

  // Read all session files
  const files = await readdir(sessionsDir)
  const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))

  for (const file of jsonlFiles) {
    const filePath = join(sessionsDir, file)
    const content = await readFile(filePath, 'utf-8')
    const lines = content.trim().split('\n').filter(l => l.trim())

    for (const line of lines) {
      try {
        const entry: Message = JSON.parse(line)
        
        // Check if message is from today
        if (entry.timestamp && entry.timestamp.startsWith(today)) {
          const usage = entry.message?.usage
          if (usage && usage.cost) {
            totalCost += usage.cost.total
            totalInputTokens += usage.input || 0
            totalOutputTokens += usage.output || 0

            // Detect model type from model string
            const modelStr = entry.message?.model?.toLowerCase() || ''
            let modelType: 'haiku' | 'sonnet' | 'opus' | null = null
            
            if (modelStr.includes('haiku')) modelType = 'haiku'
            else if (modelStr.includes('sonnet')) modelType = 'sonnet'
            else if (modelStr.includes('opus')) modelType = 'opus'

            if (modelType) {
              modelBreakdown[modelType].inputTokens += usage.input || 0
              modelBreakdown[modelType].outputTokens += usage.output || 0
              modelBreakdown[modelType].costInput += usage.cost.input || 0
              modelBreakdown[modelType].costOutput += usage.cost.output || 0
            }
          }
        }
      } catch (parseError) {
        // Skip malformed lines
        continue
      }
    }
  }

  // Format response
  const modelUsage = Object.entries(modelBreakdown)
    .filter(([_, data]) => data.inputTokens > 0 || data.outputTokens > 0)
    .map(([model, data]) => ({
      model,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      costInput: data.costInput,
      costOutput: data.costOutput,
    }))

  return {
    date: today,
    totalCost: parseFloat(totalCost.toFixed(4)),
    totalInputTokens,
    totalOutputTokens,
    dailyBudget: 3.0,
    budgetUsedPercent: parseFloat(((totalCost / 3.0) * 100).toFixed(1)),
    modelUsage,
  }
}

export async function GET() {
  try {
    // If external API URL is configured, proxy to it (Vercel deployment)
    if (EXTERNAL_API_URL) {
      console.log('Fetching from external API:', EXTERNAL_API_URL)
      const data = await fetchFromExternalAPI()
      return NextResponse.json(data)
    }
    
    // Otherwise read from local files (local development)
    console.log('Reading from local files')
    const data = await fetchFromLocalFiles()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading usage data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

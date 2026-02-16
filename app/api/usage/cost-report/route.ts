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

export async function GET() {
  try {
    const sessionsDir = '/Users/louiswand/.openclaw/agents/main/sessions'
    const today = new Date().toISOString().split('T')[0]
    
    let totalCost = 0
    let totalInputTokens = 0
    let totalOutputTokens = 0
    let totalCacheReadTokens = 0
    let totalCacheWriteTokens = 0
    let totalInputCost = 0
    let totalOutputCost = 0
    let totalCacheReadCost = 0
    let totalCacheWriteCost = 0
    let totalMessages = 0
    
    const modelBreakdown: Record<string, {
      inputTokens: number
      outputTokens: number
      cacheReadTokens: number
      cacheWriteTokens: number
      costInput: number
      costOutput: number
      costCacheRead: number
      costCacheWrite: number
      messageCount: number
    }> = {}

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
              totalMessages++
              totalCost += usage.cost.total
              totalInputTokens += usage.input || 0
              totalOutputTokens += usage.output || 0
              totalCacheReadTokens += usage.cacheRead || 0
              totalCacheWriteTokens += usage.cacheWrite || 0
              totalInputCost += usage.cost.input || 0
              totalOutputCost += usage.cost.output || 0
              totalCacheReadCost += usage.cost.cacheRead || 0
              totalCacheWriteCost += usage.cost.cacheWrite || 0

              // Detect model type from model string
              const modelStr = entry.message?.model || ''
              let modelKey = modelStr
              
              // Normalize to simple names
              if (modelStr.toLowerCase().includes('haiku')) modelKey = 'haiku'
              else if (modelStr.toLowerCase().includes('sonnet')) modelKey = 'sonnet'
              else if (modelStr.toLowerCase().includes('opus')) modelKey = 'opus'
              else modelKey = 'other'

              if (!modelBreakdown[modelKey]) {
                modelBreakdown[modelKey] = {
                  inputTokens: 0,
                  outputTokens: 0,
                  cacheReadTokens: 0,
                  cacheWriteTokens: 0,
                  costInput: 0,
                  costOutput: 0,
                  costCacheRead: 0,
                  costCacheWrite: 0,
                  messageCount: 0,
                }
              }

              modelBreakdown[modelKey].inputTokens += usage.input || 0
              modelBreakdown[modelKey].outputTokens += usage.output || 0
              modelBreakdown[modelKey].cacheReadTokens += usage.cacheRead || 0
              modelBreakdown[modelKey].cacheWriteTokens += usage.cacheWrite || 0
              modelBreakdown[modelKey].costInput += usage.cost.input || 0
              modelBreakdown[modelKey].costOutput += usage.cost.output || 0
              modelBreakdown[modelKey].costCacheRead += usage.cost.cacheRead || 0
              modelBreakdown[modelKey].costCacheWrite += usage.cost.cacheWrite || 0
              modelBreakdown[modelKey].messageCount++
            }
          }
        } catch (parseError) {
          // Skip malformed lines
          continue
        }
      }
    }

    const dailyBudget = 3.0
    const budgetUsed = (totalCost / dailyBudget) * 100
    const budgetRemaining = Math.max(0, dailyBudget - totalCost)

    // Format model usage
    const modelUsage = Object.entries(modelBreakdown).map(([model, data]) => ({
      model,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      cacheReadTokens: data.cacheReadTokens,
      cacheWriteTokens: data.cacheWriteTokens,
      totalTokens: data.inputTokens + data.outputTokens + data.cacheReadTokens + data.cacheWriteTokens,
      costInput: parseFloat(data.costInput.toFixed(4)),
      costOutput: parseFloat(data.costOutput.toFixed(4)),
      costCacheRead: parseFloat(data.costCacheRead.toFixed(4)),
      costCacheWrite: parseFloat(data.costCacheWrite.toFixed(4)),
      totalCost: parseFloat((data.costInput + data.costOutput + data.costCacheRead + data.costCacheWrite).toFixed(4)),
      messageCount: data.messageCount,
    }))

    // Sort by total cost descending
    modelUsage.sort((a, b) => b.totalCost - a.totalCost)

    return NextResponse.json({
      date: today,
      modelUsage,
      summary: {
        totalCost: parseFloat(totalCost.toFixed(4)),
        totalTokens: totalInputTokens + totalOutputTokens + totalCacheReadTokens + totalCacheWriteTokens,
        totalMessages,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cacheReadTokens: totalCacheReadTokens,
        cacheWriteTokens: totalCacheWriteTokens,
        inputCost: parseFloat(totalInputCost.toFixed(4)),
        outputCost: parseFloat(totalOutputCost.toFixed(4)),
        cacheReadCost: parseFloat(totalCacheReadCost.toFixed(4)),
        cacheWriteCost: parseFloat(totalCacheWriteCost.toFixed(4)),
        dailyBudget,
        budgetUsed: parseFloat(budgetUsed.toFixed(1)),
        budgetRemaining: parseFloat(budgetRemaining.toFixed(4)),
      },
    })
  } catch (error) {
    console.error('Error reading cost report data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cost report' },
      { status: 500 }
    )
  }
}

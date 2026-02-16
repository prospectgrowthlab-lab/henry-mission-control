#!/usr/bin/env node
/**
 * OpenClaw Usage API Server
 * 
 * Simple Express server that reads OpenClaw session logs and serves usage data.
 * Can be run locally or exposed via ngrok for remote dashboard access.
 * 
 * Usage:
 *   node usage-api-server.js [port]
 *   Default port: 3001
 * 
 * Endpoints:
 *   GET /api/usage/today - Today's token usage and costs
 *   GET /api/usage/cost-report - Detailed cost breakdown by model
 */

const express = require('express')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')

const app = express()
const PORT = process.env.PORT || process.argv[2] || 3001
const SESSIONS_DIR = path.join(process.env.HOME, '.openclaw/agents/main/sessions')

// Enable CORS for all origins (for Vercel dashboard)
app.use(cors())

// Helper to parse JSONL and extract usage data
async function getUsageData() {
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
  
  const modelBreakdown = {}

  try {
    const files = await fs.readdir(SESSIONS_DIR)
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'))

    for (const file of jsonlFiles) {
      const filePath = path.join(SESSIONS_DIR, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.trim().split('\n').filter(l => l.trim())

      for (const line of lines) {
        try {
          const entry = JSON.parse(line)
          
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

              // Detect model type
              const modelStr = entry.message?.model?.toLowerCase() || ''
              let modelType = 'unknown'
              
              if (modelStr.includes('haiku')) modelType = 'haiku'
              else if (modelStr.includes('sonnet')) modelType = 'sonnet'
              else if (modelStr.includes('opus')) modelType = 'opus'

              if (!modelBreakdown[modelType]) {
                modelBreakdown[modelType] = {
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

              modelBreakdown[modelType].inputTokens += usage.input || 0
              modelBreakdown[modelType].outputTokens += usage.output || 0
              modelBreakdown[modelType].cacheReadTokens += usage.cacheRead || 0
              modelBreakdown[modelType].cacheWriteTokens += usage.cacheWrite || 0
              modelBreakdown[modelType].costInput += usage.cost.input || 0
              modelBreakdown[modelType].costOutput += usage.cost.output || 0
              modelBreakdown[modelType].costCacheRead += usage.cost.cacheRead || 0
              modelBreakdown[modelType].costCacheWrite += usage.cost.cacheWrite || 0
              modelBreakdown[modelType].messageCount++
            }
          }
        } catch (parseError) {
          // Skip malformed lines
          continue
        }
      }
    }
  } catch (error) {
    console.error('Error reading session files:', error)
  }

  const dailyBudget = 3.0
  const budgetUsed = (totalCost / dailyBudget) * 100
  const budgetRemaining = Math.max(0, dailyBudget - totalCost)
  const totalTokens = totalInputTokens + totalOutputTokens + totalCacheReadTokens + totalCacheWriteTokens

  const modelUsage = Object.entries(modelBreakdown)
    .filter(([_, data]) => data.inputTokens > 0 || data.outputTokens > 0)
    .map(([model, data]) => ({
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

  return {
    date: today,
    modelUsage,
    summary: {
      totalCost: parseFloat(totalCost.toFixed(4)),
      totalTokens,
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
  }
}

// API Routes
app.get('/api/usage/today', async (req, res) => {
  try {
    const data = await getUsageData()
    res.json({
      date: data.date,
      totalCost: data.summary.totalCost,
      totalInputTokens: data.summary.inputTokens,
      totalOutputTokens: data.summary.outputTokens,
      dailyBudget: data.summary.dailyBudget,
      budgetUsedPercent: data.summary.budgetUsed,
      modelUsage: data.modelUsage,
    })
  } catch (error) {
    console.error('Error in /api/usage/today:', error)
    res.status(500).json({ error: 'Failed to fetch usage data' })
  }
})

app.get('/api/usage/cost-report', async (req, res) => {
  try {
    const data = await getUsageData()
    res.json(data)
  } catch (error) {
    console.error('Error in /api/usage/cost-report:', error)
    res.status(500).json({ error: 'Failed to fetch cost report data' })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`📊 OpenClaw Usage API Server running on http://localhost:${PORT}`)
  console.log(`📁 Reading sessions from: ${SESSIONS_DIR}`)
  console.log(`\nEndpoints:`)
  console.log(`  GET /api/usage/today`)
  console.log(`  GET /api/usage/cost-report`)
  console.log(`  GET /health`)
  console.log(`\nTo expose publicly: npx ngrok http ${PORT}`)
})

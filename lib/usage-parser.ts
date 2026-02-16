'use server'

/**
 * Usage Parser - Efficiently parse JSONL session files
 * Handles streaming large files without loading into memory
 */

import fs from 'fs'
import path from 'path'
import { readdir, open } from 'fs/promises'

const OPENCLAW_DIR = '/Users/louiswand/.openclaw'
const SESSIONS_DIR = path.join(OPENCLAW_DIR, 'agents/main/sessions')

export interface UsageEntry {
  timestamp: string
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  totalCost: number
  inputCost: number
  outputCost: number
  cacheReadCost: number
  cacheWriteCost: number
  sessionId: string
  messageId: string
}

export interface ModelStats {
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  totalTokens: number
  totalCost: number
  inputCost: number
  outputCost: number
  cacheReadCost: number
  cacheWriteCost: number
  messageCount: number
}

export interface SessionInfo {
  sessionId: string
  modelId: string
  startTime: string
  lastActivity: string
  isActive: boolean
}

// Model pricing (per million tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-3-5-haiku': { input: 0.25, output: 1.25 },
  'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
  'claude-3-5-opus': { input: 15.0, output: 75.0 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'claude-3-sonnet': { input: 3.0, output: 15.0 },
  'claude-3-opus': { input: 15.0, output: 75.0 },
}

// Classify model by name
function classifyModel(modelId: string): 'haiku' | 'sonnet' | 'opus' {
  const lower = modelId.toLowerCase()
  if (lower.includes('haiku')) return 'haiku'
  if (lower.includes('opus')) return 'opus'
  return 'sonnet'
}

// Get pricing for a model
function getPricing(
  modelId: string
): { input: number; output: number } {
  const pricing = MODEL_PRICING[modelId]
  if (pricing) return pricing

  // Fallback: guess based on model name
  const classification = classifyModel(modelId)
  const fallbackPricing: Record<string, { input: number; output: number }> = {
    haiku: { input: 0.25, output: 1.25 },
    sonnet: { input: 3.0, output: 15.0 },
    opus: { input: 15.0, output: 75.0 },
  }
  return fallbackPricing[classification]
}

/**
 * Parse a single JSONL file line by line
 * Returns array of usage entries
 */
async function parseJSONLFile(
  filePath: string
): Promise<UsageEntry[]> {
  const fileHandle = await open(filePath, 'r')
  const results: UsageEntry[] = []
  
  try {
    let buffer = ''
    const chunkSize = 64 * 1024 // 64KB chunks

    let continueReading = true
    while (continueReading) {
      const { bytesRead, buffer: chunk } = await fileHandle.read(
        Buffer.alloc(chunkSize)
      )

      if (bytesRead === 0) {
        continueReading = false
        // Process any remaining data
        if (buffer.trim()) {
          try {
            const entry = JSON.parse(buffer)
            const usage = parseMessageEntry(entry)
            if (usage) results.push(usage)
          } catch (e) {
            // Skip invalid lines
          }
        }
        break
      }

      buffer += chunk.toString('utf-8', 0, bytesRead)

      // Split by newlines and process complete lines
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue

        try {
          const entry = JSON.parse(line)
          const usage = parseMessageEntry(entry)
          if (usage) results.push(usage)
        } catch (e) {
          // Skip invalid JSON lines
          continue
        }
      }
    }
  } finally {
    await fileHandle.close()
  }
  
  return results
}

/**
 * Parse a message entry from JSONL
 */
function parseMessageEntry(entry: any): UsageEntry | null {
  if (entry.type !== 'message' || !entry.message?.usage) {
    return null
  }

  const message = entry.message
  const usage = message.usage
  const timestamp = entry.timestamp || new Date().toISOString()
  const modelId = message.model || 'unknown'

  // Get pricing
  const pricing = getPricing(modelId)

  // Extract token counts (API may have different field names)
  const inputTokens = usage.input || 0
  const outputTokens = usage.output || 0
  const cacheReadTokens = usage.cacheRead || usage.cache_read || 0
  const cacheWriteTokens =
    usage.cacheWrite || usage.cache_write || 0

  // Calculate costs (API might have precalculated costs or we need to calculate)
  let totalCost = 0
  let inputCost = 0
  let outputCost = 0
  let cacheReadCost = 0
  let cacheWriteCost = 0

  if (usage.cost?.total !== undefined) {
    // Use precalculated cost if available
    totalCost = usage.cost.total
    inputCost = usage.cost.input || 0
    outputCost = usage.cost.output || 0
    cacheReadCost = usage.cost.cacheRead || 0
    cacheWriteCost = usage.cost.cacheWrite || 0
  } else {
    // Calculate costs from tokens
    const inputTokensM = inputTokens / 1000000
    const outputTokensM = outputTokens / 1000000
    const cacheReadTokensM = cacheReadTokens / 1000000
    const cacheWriteTokensM = cacheWriteTokens / 1000000

    inputCost = inputTokensM * pricing.input
    outputCost = outputTokensM * pricing.output
    cacheReadCost = cacheReadTokensM * pricing.input // Cache reads are charged at input price
    cacheWriteCost = cacheWriteTokensM * pricing.input // Cache writes are charged at input price

    totalCost = inputCost + outputCost + cacheReadCost + cacheWriteCost
  }

  return {
    timestamp,
    model: modelId,
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
    totalCost,
    inputCost,
    outputCost,
    cacheReadCost,
    cacheWriteCost,
    sessionId: message.sessionId || '',
    messageId: entry.id || '',
  }
}

/**
 * Get all usage data for a specific date
 */
export async function getUsageByDate(dateStr: string): Promise<{
  date: string
  modelUsage: Record<string, ModelStats>
  totalCost: number
  totalTokens: number
  totalMessages: number
  activeSessions: Set<string>
}> {
  const dateStart = new Date(dateStr).getTime()
  const dateEnd = dateStart + 24 * 60 * 60 * 1000

  const modelStats: Record<
    string,
    {
      model: string
      inputTokens: number
      outputTokens: number
      cacheReadTokens: number
      cacheWriteTokens: number
      totalTokens: number
      totalCost: number
      inputCost: number
      outputCost: number
      cacheReadCost: number
      cacheWriteCost: number
      messageCount: number
    }
  > = {}

  let totalCost = 0
  let totalTokens = 0
  let totalMessages = 0
  const activeSessions = new Set<string>()

  try {
    // Get all JSONL files
    const files = await readdir(SESSIONS_DIR)
    const jsonlFiles = files.filter(
      (f) => f.endsWith('.jsonl') && !f.includes('.deleted')
    )

    // Process each file
    for (const file of jsonlFiles) {
      const filePath = path.join(SESSIONS_DIR, file)

      try {
        const usageEntries = await parseJSONLFile(filePath)
        for (const usage of usageEntries) {
          const timestamp = new Date(usage.timestamp).getTime()

          // Only count entries from today
          if (timestamp < dateStart || timestamp >= dateEnd) {
            continue
          }

          // Classify model
          const classification = classifyModel(usage.model)
          const statsKey = `${classification}-${usage.model}`

          // Initialize if needed
          if (!modelStats[statsKey]) {
            modelStats[statsKey] = {
              model: classification,
              inputTokens: 0,
              outputTokens: 0,
              cacheReadTokens: 0,
              cacheWriteTokens: 0,
              totalTokens: 0,
              totalCost: 0,
              inputCost: 0,
              outputCost: 0,
              cacheReadCost: 0,
              cacheWriteCost: 0,
              messageCount: 0,
            }
          }

          // Aggregate data
          modelStats[statsKey].inputTokens += usage.inputTokens
          modelStats[statsKey].outputTokens += usage.outputTokens
          modelStats[statsKey].cacheReadTokens += usage.cacheReadTokens
          modelStats[statsKey].cacheWriteTokens += usage.cacheWriteTokens
          modelStats[statsKey].totalTokens =
            modelStats[statsKey].inputTokens +
            modelStats[statsKey].outputTokens +
            modelStats[statsKey].cacheReadTokens +
            modelStats[statsKey].cacheWriteTokens
          modelStats[statsKey].totalCost += usage.totalCost
          modelStats[statsKey].inputCost += usage.inputCost
          modelStats[statsKey].outputCost += usage.outputCost
          modelStats[statsKey].cacheReadCost += usage.cacheReadCost
          modelStats[statsKey].cacheWriteCost += usage.cacheWriteCost
          modelStats[statsKey].messageCount += 1

          totalCost += usage.totalCost
          totalTokens +=
            usage.inputTokens +
            usage.outputTokens +
            usage.cacheReadTokens +
            usage.cacheWriteTokens
          totalMessages += 1

          if (usage.sessionId) {
            activeSessions.add(usage.sessionId)
          }
        }
      } catch (error) {
        console.error(`Error parsing file ${file}:`, error)
        continue
      }
    }
  } catch (error) {
    console.error('Error reading sessions directory:', error)
  }

  return {
    date: dateStr,
    modelUsage: modelStats,
    totalCost: Math.round(totalCost * 10000) / 10000,
    totalTokens,
    totalMessages,
    activeSessions,
  }
}

/**
 * Get active sessions from sessions.json
 */
export async function getActiveSessions(): Promise<SessionInfo[]> {
  const sessionsFile = path.join(SESSIONS_DIR, 'sessions.json')
  const sessions: SessionInfo[] = []

  try {
    const content = fs.readFileSync(sessionsFile, 'utf-8')
    const data = JSON.parse(content)

    // Extract active sessions
    const entries = Object.entries(data) as any[]
    for (const [_sessionLabel, sessionData] of entries) {
      if (!sessionData.sessionId) continue

      sessions.push({
        sessionId: sessionData.sessionId,
        modelId: 'unknown',
        startTime: new Date(sessionData.updatedAt).toISOString(),
        lastActivity: new Date(sessionData.updatedAt).toISOString(),
        isActive: true,
      })
    }
  } catch (error) {
    console.error('Error reading sessions:', error)
  }

  return sessions
}

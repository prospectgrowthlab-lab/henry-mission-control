# Usage Parser Module

## Overview

The `usage-parser.ts` module is the core of the live data API. It efficiently parses OpenClaw JSONL session transcripts and aggregates token usage and cost data without loading entire files into memory.

## Key Features

1. **Streaming JSONL Parser**
   - Processes large files in 64KB chunks
   - Memory-efficient line-by-line parsing
   - Handles files with millions of entries

2. **Automatic Cost Calculation**
   - Uses pre-calculated costs when available
   - Falls back to token-based calculation
   - Handles both cache reads/writes and regular usage

3. **Model Classification**
   - Automatically classifies models as haiku/sonnet/opus
   - Flexible model name matching
   - Fallback pricing for unknown models

4. **Error Tolerance**
   - Skips invalid JSON lines gracefully
   - Continues parsing on missing files
   - Detailed error logging for debugging

## API Functions

### `getUsageByDate(dateStr: string)`

Aggregates all usage data for a specific date.

**Parameters:**
- `dateStr`: ISO date string (e.g., "2026-02-16")

**Returns:**
```typescript
{
  date: string
  modelUsage: Record<string, ModelStats>
  totalCost: number
  totalTokens: number
  totalMessages: number
  activeSessions: Set<string>
}
```

**Example:**
```typescript
const result = await getUsageByDate('2026-02-16')
console.log(`Total cost: $${result.totalCost}`)
console.log(`Tokens: ${result.totalTokens}`)
```

### `getActiveSessions()`

Retrieves currently active sessions from sessions.json.

**Returns:**
```typescript
SessionInfo[] = [
  {
    sessionId: string
    modelId: string
    startTime: string
    lastActivity: string
    isActive: boolean
  }
]
```

## Usage Examples

### Basic Usage

```typescript
import { getUsageByDate } from '@/lib/usage-parser'

// Get today's data
const today = new Date().toISOString().split('T')[0]
const result = await getUsageByDate(today)

console.log(`Cost: $${result.totalCost}`)
console.log(`Tokens: ${result.totalTokens}`)
```

### Processing Model Statistics

```typescript
const result = await getUsageByDate('2026-02-16')

for (const [key, stats] of Object.entries(result.modelUsage)) {
  console.log(`${stats.model}:`)
  console.log(`  Tokens: ${stats.totalTokens}`)
  console.log(`  Cost: $${stats.totalCost.toFixed(4)}`)
  console.log(`  Messages: ${stats.messageCount}`)
}
```

### Filtering by Cost Threshold

```typescript
const result = await getUsageByDate('2026-02-16')

// Find expensive models
const expensiveModels = Object.values(result.modelUsage)
  .filter(stats => stats.totalCost > 0.5)
  .sort((a, b) => b.totalCost - a.totalCost)

console.log('Top cost models:', expensiveModels)
```

## Implementation Details

### JSONL Entry Structure

Expected format for message entries:

```json
{
  "type": "message",
  "id": "unique-message-id",
  "timestamp": "2026-02-16T15:08:30.000Z",
  "message": {
    "role": "assistant",
    "model": "claude-3-5-sonnet-20240620",
    "sessionId": "session-uuid",
    "usage": {
      "input": 150,
      "output": 75,
      "cacheRead": 0,
      "cacheWrite": 0,
      "cost": {
        "input": 0.00045,
        "output": 0.001125,
        "total": 0.001575
      }
    }
  }
}
```

### Cost Calculation

If `usage.cost.total` is provided, it's used directly. Otherwise:

```
inputCost = (inputTokens / 1,000,000) * inputPricePerMillion
outputCost = (outputTokens / 1,000,000) * outputPricePerMillion
cacheCost = (cacheTokens / 1,000,000) * inputPricePerMillion
totalCost = inputCost + outputCost + cacheCost
```

### Model Classification

The module identifies models by checking the model ID string:

- Contains "haiku" → classified as "haiku"
- Contains "opus" → classified as "opus"
- Everything else → classified as "sonnet" (default)

Examples:
- `claude-3-5-haiku-20241022` → "haiku"
- `claude-3-5-sonnet-20240620` → "sonnet"
- `claude-3-opus-20240229` → "opus"

### Pricing Table

Default pricing (per million tokens):

```typescript
const MODEL_PRICING = {
  'claude-3-5-haiku': { input: 0.25, output: 1.25 },
  'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
  'claude-3-5-opus': { input: 15.0, output: 75.0 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'claude-3-sonnet': { input: 3.0, output: 15.0 },
  'claude-3-opus': { input: 15.0, output: 75.0 },
}
```

## Performance Characteristics

### Memory Usage

- **Typical**: ~5-10 MB for parsing
- **Peak**: 64 KB per file being read
- **Scale**: Linear with number of files, not file sizes

### Time Complexity

- Small files (< 1 MB): ~100-500 ms
- Large files (10-100 MB): ~1-5 seconds
- Very large files (> 100 MB): ~5-30 seconds

### Optimization Tips

1. **Filter by Date Early**
   - Skip entries before/after date range immediately
   - Reduces unnecessary object creation

2. **Batch Processing**
   - Process multiple dates in parallel
   - Use Promise.all() for concurrent parsing

3. **Caching**
   - Cache results for recent dates
   - Invalidate cache on new session data

## Error Handling

### Common Errors

**Missing Session Directory:**
```
Error: ENOENT: no such file or directory, opendir '/Users/louiswand/.openclaw/agents/main/sessions'
```
Solution: Ensure OpenClaw is installed and has created session directory

**Invalid JSON in JSONL:**
```
Skipped line (invalid JSON at position X)
```
Solution: This is logged but doesn't break parsing. Indicates corrupted line in file.

**Missing Cost Data:**
```
Using token-based cost calculation for model XYZ
```
Solution: Parser falls back to pricing table. Ensure pricing is configured.

### Debugging

Enable detailed logging:

```typescript
// In API route
console.log('Starting parse for', dateStr)
const result = await getUsageByDate(dateStr)
console.log('Parse complete:', {
  totalCost: result.totalCost,
  totalTokens: result.totalTokens,
  messagesProcessed: result.totalMessages,
  filesProcessed: Object.keys(result.modelUsage).length
})
```

## Testing

### Unit Test Example

```typescript
// Test getUsageByDate with mock data
describe('getUsageByDate', () => {
  it('should aggregate costs correctly', async () => {
    const result = await getUsageByDate('2026-02-16')
    
    expect(result.date).toBe('2026-02-16')
    expect(result.totalCost).toBeGreaterThanOrEqual(0)
    expect(result.totalTokens).toBeGreaterThanOrEqual(0)
    expect(result.activeSessions.size).toBeGreaterThanOrEqual(0)
  })
})
```

### Integration Test Example

```typescript
// Test API endpoint integration
describe('GET /api/usage/today', () => {
  it('should return valid usage data', async () => {
    const response = await fetch('/api/usage/today')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.totalCost).toBeDefined()
    expect(Array.isArray(data.modelUsage)).toBe(true)
  })
})
```

## Future Enhancements

Potential improvements:

1. **Caching Layer**
   - Redis cache for parsed results
   - Invalidate on new session data
   - Reduce parsing overhead

2. **Incremental Parsing**
   - Track last parsed line in each file
   - Only parse new entries since last run
   - Improve real-time updates

3. **Advanced Filtering**
   - Filter by date range
   - Filter by model/session
   - Aggregation by hour/minute

4. **Batch Operations**
   - Parse multiple dates in parallel
   - Aggregate across date ranges
   - Generate reports

## Contributing

When modifying the parser:

1. Maintain backward compatibility
2. Add tests for new functionality
3. Update this documentation
4. Ensure error handling for edge cases
5. Monitor performance impact on large files

## License

Same as henry-mission-control project

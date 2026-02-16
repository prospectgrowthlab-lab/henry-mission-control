# Henry Mission Control - Live Data API

## Overview

This document describes the live data API for the Henry Mission Control dashboard. The API efficiently parses OpenClaw session transcripts and provides real-time token usage, cost tracking, and session monitoring against the $3/day budget.

## Architecture

### Data Sources

1. **Session Transcripts**: `/Users/louiswand/.openclaw/agents/main/sessions/*.jsonl`
   - JSONL format (JSON Lines) with one entry per line
   - Contains message entries with usage data
   - Parsed efficiently without loading entire files into memory

2. **Sessions Manifest**: `/Users/louiswand/.openclaw/agents/main/sessions/sessions.json`
   - Contains active session metadata
   - Updated in real-time

### Parsing Strategy

The `lib/usage-parser.ts` module implements streaming JSONL parsing:

- **Chunked Reading**: Files are read in 64KB chunks to minimize memory usage
- **Line-by-line Processing**: Each complete JSON line is parsed and processed individually
- **Error Tolerance**: Invalid JSON lines are skipped without breaking the stream
- **Cost Calculation**: Costs are pre-calculated or derived from token counts and pricing tables

## API Endpoints

### 1. GET `/api/usage`

**Backward compatible endpoint** returning today's basic usage data.

**Response Format:**
```json
{
  "date": "2026-02-16",
  "modelUsage": [
    {
      "model": "sonnet",
      "inputTokens": 15000,
      "outputTokens": 8500,
      "costInput": 0.045,
      "costOutput": 0.1275
    }
  ],
  "totalCost": 0.62,
  "dailyBudget": 3.0,
  "tokensUsedToday": 170000,
  "sessions": 2
}
```

**Update Frequency**: 30 seconds (configurable client-side)

---

### 2. GET `/api/usage/today`

**Detailed today's usage data** with budget tracking.

**Response Format:**
```json
{
  "date": "2026-02-16",
  "modelUsage": [
    {
      "model": "haiku",
      "inputTokens": 125000,
      "outputTokens": 45000,
      "cacheReadTokens": 0,
      "cacheWriteTokens": 0,
      "totalTokens": 170000,
      "costInput": 0.0313,
      "costOutput": 0.0563,
      "costCacheRead": 0,
      "costCacheWrite": 0,
      "totalCost": 0.0876,
      "messageCount": 42
    }
  ],
  "totalCost": 0.62,
  "budgetRemaining": 2.38,
  "budgetPercentage": 20.67,
  "dailyBudget": 3.0,
  "tokensUsedToday": 170000,
  "totalMessages": 156,
  "sessions": 2
}
```

**Key Fields:**
- `budgetPercentage`: Daily budget usage (0-100%)
- `budgetRemaining`: Remaining budget in dollars
- `totalMessages`: Total messages processed today
- `sessions`: Number of unique sessions

---

### 3. GET `/api/usage/cost-report`

**Comprehensive cost breakdown** with detailed token and cost analysis.

**Response Format:**
```json
{
  "date": "2026-02-16",
  "modelUsage": [
    {
      "model": "haiku",
      "inputTokens": 125000,
      "outputTokens": 45000,
      "cacheReadTokens": 0,
      "cacheWriteTokens": 0,
      "costInput": 0.0313,
      "costOutput": 0.0563,
      "costCacheRead": 0,
      "costCacheWrite": 0,
      "totalCost": 0.0876,
      "messageCount": 42
    },
    {
      "model": "sonnet",
      "inputTokens": 15000,
      "outputTokens": 8500,
      "cacheReadTokens": 0,
      "cacheWriteTokens": 0,
      "costInput": 0.045,
      "costOutput": 0.1275,
      "costCacheRead": 0,
      "costCacheWrite": 0,
      "totalCost": 0.1725,
      "messageCount": 87
    }
  ],
  "summary": {
    "totalCost": 0.62,
    "totalTokens": 170000,
    "totalMessages": 156,
    "inputTokens": 140000,
    "outputTokens": 30000,
    "cacheReadTokens": 0,
    "cacheWriteTokens": 0,
    "inputCost": 0.45,
    "outputCost": 0.1475,
    "cacheReadCost": 0,
    "cacheWriteCost": 0,
    "dailyBudget": 3.0,
    "budgetUsed": 20.67,
    "budgetRemaining": 2.38
  }
}
```

**Use Cases:**
- Detailed cost analysis by model
- Understanding cost breakdown (input vs output vs cache)
- Budget forecasting

---

### 4. GET `/api/sessions/active`

**Active session information** and capacity tracking.

**Response Format:**
```json
{
  "count": 2,
  "sessions": [
    {
      "id": "f11643fb-4144-460e-8afd-a455b448d432",
      "model": "unknown",
      "startTime": "2026-02-15T07:56:38.108Z",
      "lastActivity": "2026-02-16T15:08:30.000Z",
      "isActive": true,
      "duration": 86400
    }
  ],
  "maxConcurrent": 4,
  "percentageUtilized": 50.0
}
```

**Key Fields:**
- `count`: Number of active sessions
- `duration`: Seconds since last activity
- `percentageUtilized`: Current session capacity usage (0-100%)
- `maxConcurrent`: Maximum concurrent sessions allowed

---

## Frontend Integration

### React Hooks

Three custom hooks are provided in `hooks/useUsageData.ts`:

#### `useUsageData(refreshInterval = 30000)`

Fetches today's usage data with optional refresh interval (in milliseconds).

```typescript
const { data, loading, error } = useUsageData(30000)

// Access data
console.log(data.totalCost)        // $0.62
console.log(data.budgetPercentage) // 20.67
console.log(data.tokensUsedToday)  // 170000
```

#### `useCostReportData(refreshInterval = 30000)`

Fetches detailed cost report.

```typescript
const { data, loading, error } = useCostReportData(30000)

// Access detailed breakdown
data.summary.budgetUsed     // 20.67%
data.modelUsage[0].totalCost // Cost for first model
```

#### `useActiveSessions(refreshInterval = 30000)`

Fetches active session information.

```typescript
const { data, loading, error } = useActiveSessions(30000)

// Access session data
console.log(data.count)           // 2
console.log(data.percentageUtilized) // 50.0
```

### Component Updates

Components have been updated to use live data:

1. **CostReport** - Displays real-time cost tracking
   - Fetches from `/api/usage/cost-report`
   - Shows budget progress bar
   - Model breakdown with individual costs

2. **TokenUsage** - Shows token consumption
   - Fetches from `/api/usage/today` and `/api/sessions/active`
   - Displays session capacity
   - Estimates burn rate

3. **Dashboard Page** - Quick stats bar
   - Real-time cost and token display
   - Active session count
   - Budget percentage indicator

## Model Pricing

Pricing per million tokens (Anthropic Claude models):

| Model        | Input    | Output   |
|--------------|----------|----------|
| Haiku 4      | $0.25    | $1.25    |
| Sonnet 4     | $3.00    | $15.00   |
| Opus 4       | $15.00   | $75.00   |

Cache reads/writes are charged at input pricing.

## Error Handling

All endpoints include error handling:

```javascript
// Example with error handling
try {
  const response = await fetch('/api/usage/today')
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch')
  }
} catch (error) {
  console.error('API Error:', error)
  // Display error to user
}
```

Hooks return error state:

```typescript
const { data, loading, error } = useUsageData()

if (error) {
  return <ErrorMessage message={error} />
}
```

## Performance Optimizations

1. **Streaming JSONL Parser**
   - 64KB chunk reads for large files
   - No complete file in-memory loading
   - Suitable for sessions with millions of messages

2. **Caching Strategy**
   - 30-second default refresh interval
   - Client controls refresh timing
   - Reduces unnecessary API calls

3. **Efficient Cost Calculation**
   - Pre-calculated costs where available
   - Token-based fallback calculation
   - Batch processing in aggregation

## File Structure

```
henry-mission-control/
├── app/
│   ├── api/
│   │   ├── usage/
│   │   │   ├── route.ts              # GET /api/usage
│   │   │   ├── today/
│   │   │   │   └── route.ts          # GET /api/usage/today
│   │   │   └── cost-report/
│   │   │       └── route.ts          # GET /api/usage/cost-report
│   │   └── sessions/
│   │       └── active/
│   │           └── route.ts          # GET /api/sessions/active
│   ├── page.tsx                      # Updated to use live data
│   └── layout.tsx
├── components/
│   ├── CostReport.tsx               # Updated for live data
│   ├── TokenUsage.tsx               # Updated for live data
│   └── ... (other components)
├── hooks/
│   └── useUsageData.ts              # Custom hooks for data fetching
├── lib/
│   └── usage-parser.ts              # JSONL parsing logic
├── data/
│   └── mockData.ts                  # Mock data (fallback)
└── API_DOCUMENTATION.md             # This file
```

## Development Notes

### Adding New Endpoints

1. Create a new file in `app/api/` following Next.js route structure
2. Use `getUsageByDate()` from `lib/usage-parser.ts` for parsing
3. Format response to match component expectations
4. Add corresponding hook in `hooks/useUsageData.ts` if component will use it

### Testing

To test endpoints locally:

```bash
# Test /api/usage
curl http://localhost:3000/api/usage

# Test /api/usage/today
curl http://localhost:3000/api/usage/today

# Test /api/usage/cost-report
curl http://localhost:3000/api/usage/cost-report

# Test /api/sessions/active
curl http://localhost:3000/api/sessions/active
```

### Debugging Parser

The usage parser includes detailed error logging. Check server console for:
- Files that fail to parse
- Individual line parse errors
- Missing session files

## Budget Tracking

The dashboard tracks spending against a $3/day budget:

- **0-70%**: Green (healthy)
- **70-90%**: Yellow (caution)
- **90%+**: Red (critical)

Visual indicators:
- Progress bar shows budget used
- Remaining budget displayed in green
- Color-coded percentage indicator

## Future Enhancements

Potential improvements:

1. **Historical Data**
   - Daily cost trends
   - Model usage patterns over time
   - Budget forecasting

2. **Advanced Filtering**
   - Filter by date range
   - Filter by model type
   - Filter by session

3. **Alerts**
   - Warn when approaching budget limit
   - Notify on unusual usage patterns
   - Daily summary emails

4. **Export**
   - Export daily report as PDF/CSV
   - Email daily summary
   - Integration with accounting systems

## Support

For issues or questions:

1. Check endpoint responses for error messages
2. Review server logs for detailed parsing errors
3. Verify session files exist in `/Users/louiswand/.openclaw/agents/main/sessions/`
4. Confirm JSONL files have valid JSON on each line

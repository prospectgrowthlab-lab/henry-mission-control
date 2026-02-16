# API Integration Guide 🔌

How to connect Henry Mission Control to real OpenClaw data.

## Current Setup

The dashboard currently uses **mock data** defined in `data/mockData.ts`. This allows you to:
- Visualize the dashboard design without a backend
- Develop UI components independently
- Test on any machine without API access

## Integration Roadmap

### Phase 1: Basic API Integration (Easy)

Replace mock data with real API calls.

#### Step 1: Create API Service

Create `services/henryAPI.ts`:

```typescript
// services/henryAPI.ts
import {
  AgentStatus,
  Task,
  BandwidthMetrics,
  CostReport,
  HeartbeatInfo,
} from '@/data/mockData'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export async function fetchAgentStatus(): Promise<AgentStatus> {
  const response = await fetch(`${API_BASE}/agent/status`)
  return response.json()
}

export async function fetchActiveTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/tasks/active`)
  return response.json()
}

export async function fetchBandwidth(): Promise<BandwidthMetrics> {
  const response = await fetch(`${API_BASE}/bandwidth`)
  return response.json()
}

export async function fetchCostReport(): Promise<CostReport> {
  const response = await fetch(`${API_BASE}/costs/today`)
  return response.json()
}

export async function fetchHeartbeat(): Promise<HeartbeatInfo> {
  const response = await fetch(`${API_BASE}/heartbeat/status`)
  return response.json()
}
```

#### Step 2: Update Component to Use API

Update `app/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import * as henryAPI from '@/services/henryAPI'
import {
  mockAgentStatus,
  mockTasks,
  // ... other mocks
} from '@/data/mockData'

export default function Dashboard() {
  const [agentStatus, setAgentStatus] = useState(mockAgentStatus)
  const [tasks, setTasks] = useState(mockTasks)
  // ... other states

  useEffect(() => {
    // Fetch real data
    const loadData = async () => {
      try {
        const [status, taskList, bandwidth, costs, heartbeat] = await Promise.all([
          henryAPI.fetchAgentStatus(),
          henryAPI.fetchActiveTasks(),
          henryAPI.fetchBandwidth(),
          henryAPI.fetchCostReport(),
          henryAPI.fetchHeartbeat(),
        ])

        setAgentStatus(status)
        setTasks(taskList)
        // ... set other states
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Fall back to mock data on error
      }
    }

    loadData()

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  // ... rest of component
}
```

### Phase 2: Real-Time Updates (Medium)

Use WebSocket for live updates instead of polling.

#### Add WebSocket Connection

```typescript
// services/webSocket.ts
export function createDashboardSocket() {
  const ws = new WebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/dashboard'
  )

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    // Dispatch events based on data type
    switch (data.type) {
      case 'agent-status':
        // Update agent status
        break
      case 'task-update':
        // Update task
        break
      case 'bandwidth-update':
        // Update bandwidth
        break
      // ... other message types
    }
  }

  return ws
}
```

### Phase 3: Caching & Performance (Advanced)

Implement SWR or React Query for smart caching:

```typescript
// Using SWR for caching and revalidation
import useSWR from 'swr'

export function useDashboardData() {
  const { data: agentStatus } = useSWR('/api/agent/status', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    dedupingInterval: 5000,
  })

  return { agentStatus }
}
```

## OpenClaw Integration

### Using OpenClaw Commands

Henry can provide data via OpenClaw commands:

```bash
# Get session status
openclaw session status <session-id>

# List active sessions
openclaw sessions list

# Get token usage
openclaw tokens usage
```

Create an API endpoint that runs these commands:

```typescript
// pages/api/agent/status.ts
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default async function handler(req, res) {
  try {
    const { stdout } = await execAsync('openclaw session status')
    const data = JSON.parse(stdout)
    
    // Transform to our AgentStatus format
    const status = {
      state: data.state,
      uptime: data.uptime,
      lastHeartbeat: new Date(data.lastHeartbeat),
    }

    res.status(200).json(status)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

## Data Source Mapping

Map OpenClaw data to dashboard components:

| Component | Data Source | Endpoint |
|-----------|-------------|----------|
| Agent Status | `session_status` | `/api/agent/status` |
| Active Tasks | `sessions_list` | `/api/tasks/active` |
| Bandwidth | `token_usage` | `/api/bandwidth` |
| Cost Report | `session_metrics` | `/api/costs/today` |
| Heartbeat | `heartbeat_status` | `/api/heartbeat/status` |

## Error Handling

Add graceful fallbacks:

```typescript
async function fetchWithFallback<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error('API Error:', error)
    return fallback // Use mock data
  }
}
```

## Example: Full Integration

```typescript
// pages/api/dashboard.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const [
    agentStatus,
    tasks,
    bandwidth,
    costs,
    heartbeat,
  ] = await Promise.all([
    fetchAgentStatus(),
    fetchActiveTasks(),
    fetchBandwidth(),
    fetchCostReport(),
    fetchHeartbeat(),
  ])

  return NextResponse.json({
    agentStatus,
    tasks,
    bandwidth,
    costs,
    heartbeat,
    timestamp: new Date(),
  })
}

// Client-side:
useEffect(() => {
  const refreshDashboard = async () => {
    const response = await fetch('/api/dashboard')
    const data = await response.json()
    
    setAgentStatus(data.agentStatus)
    setTasks(data.tasks)
    // ... etc
  }

  refreshDashboard()
  const interval = setInterval(refreshDashboard, 30000)
  return () => clearInterval(interval)
}, [])
```

## Authentication

If your API requires authentication:

```typescript
// services/henryAPI.ts
const headers = {
  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
  'Content-Type': 'application/json',
}

export async function fetchAgentStatus(): Promise<AgentStatus> {
  const response = await fetch(`${API_BASE}/agent/status`, {
    headers,
  })
  return response.json()
}
```

## Testing API Integration

Use mock API responses for testing:

```typescript
// __mocks__/henryAPI.ts
export const mockAPI = {
  fetchAgentStatus: jest.fn(() => Promise.resolve(mockAgentStatus)),
  fetchActiveTasks: jest.fn(() => Promise.resolve(mockTasks)),
  // ... etc
}
```

## Deployment Notes

When deploying with real API:

1. Set `NEXT_PUBLIC_API_URL` environment variable
2. Ensure CORS is configured if API on different domain
3. Use HTTPS for all API calls
4. Implement rate limiting on the backend
5. Cache responses appropriately
6. Monitor API health

---

**Ready to connect to real data!** Follow the steps above to integrate your OpenClaw agent's metrics.

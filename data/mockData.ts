export interface AgentStatus {
  state: 'online' | 'busy' | 'idle';
  uptime: number;
  lastHeartbeat: Date;
}

export interface Task {
  id: string;
  type: 'main-session' | 'sub-agent' | 'scheduled-task';
  name: string;
  status: 'running' | 'queued' | 'completed';
  progress: number;
  startTime: Date;
  estimatedEnd?: Date;
}

export interface BandwidthMetrics {
  tokensUsedToday: number;
  tokensUsedMonth: number;
  concurrentSessions: number;
  maxConcurrent: number;
  rateLimitPerMin: number;
  requestsThisMin: number;
}

export interface ModelUsage {
  model: 'haiku' | 'sonnet' | 'opus';
  inputTokens: number;
  outputTokens: number;
  costInput: number;
  costOutput: number;
}

export interface CostReport {
  date: string;
  modelUsage: ModelUsage[];
  totalCost: number;
  dailyBudget: number;
}

export interface HeartbeatInfo {
  lastCheck: Date;
  nextScheduled: Date;
  frequency: string;
  status: 'healthy' | 'delayed' | 'failed';
}

// Mock data
export const mockAgentStatus: AgentStatus = {
  state: 'online',
  uptime: 342000, // 95 hours
  lastHeartbeat: new Date(Date.now() - 3 * 60000), // 3 mins ago
}

export const mockTasks: Task[] = [
  {
    id: 'main-1',
    type: 'main-session',
    name: 'Chat with Louis',
    status: 'running',
    progress: 65,
    startTime: new Date(Date.now() - 45 * 60000), // 45 mins ago
  },
  {
    id: 'sub-1',
    type: 'sub-agent',
    name: 'Code Generation - Dashboard Build',
    status: 'running',
    progress: 80,
    startTime: new Date(Date.now() - 20 * 60000), // 20 mins ago
  },
  {
    id: 'task-1',
    type: 'scheduled-task',
    name: 'Memory Cleanup',
    status: 'queued',
    progress: 0,
    startTime: new Date(Date.now() + 4 * 60000), // In 4 mins
  },
  {
    id: 'sub-2',
    type: 'sub-agent',
    name: 'Email Processor',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 3 * 3600000), // 3 hours ago
  },
]

export const mockBandwidth: BandwidthMetrics = {
  tokensUsedToday: 145000,
  tokensUsedMonth: 892500,
  concurrentSessions: 2,
  maxConcurrent: 4,
  rateLimitPerMin: 60,
  requestsThisMin: 8,
}

export const mockCostReport: CostReport = {
  date: new Date().toISOString().split('T')[0],
  modelUsage: [
    {
      model: 'haiku',
      inputTokens: 125000,
      outputTokens: 45000,
      costInput: 0.0313, // 125000 * 0.00000025
      costOutput: 0.0563, // 45000 * 0.00000125
    },
    {
      model: 'sonnet',
      inputTokens: 15000,
      outputTokens: 8500,
      costInput: 0.045, // 15000 * 0.000003
      costOutput: 0.1275, // 8500 * 0.000015
    },
    {
      model: 'opus',
      inputTokens: 5000,
      outputTokens: 2000,
      costInput: 0.075, // 5000 * 0.000015
      costOutput: 0.15, // 2000 * 0.000075
    },
  ],
  totalCost: 0.62,
  dailyBudget: 3.0,
}

export const mockHeartbeat: HeartbeatInfo = {
  lastCheck: new Date(Date.now() - 15 * 60000), // 15 mins ago
  nextScheduled: new Date(Date.now() + 15 * 60000), // In 15 mins
  frequency: 'Every 30 minutes',
  status: 'healthy',
}

// Historical data for charts
export const mockCostHistory = [
  { date: '2026-02-10', cost: 1.85 },
  { date: '2026-02-11', cost: 2.45 },
  { date: '2026-02-12', cost: 0.92 },
  { date: '2026-02-13', cost: 2.10 },
  { date: '2026-02-14', cost: 3.00 },
  { date: '2026-02-15', cost: 1.56 },
  { date: '2026-02-16', cost: 0.62 },
]

export const mockTokenHistory = [
  { date: '2026-02-10', tokens: 98500 },
  { date: '2026-02-11', tokens: 156800 },
  { date: '2026-02-12', tokens: 42300 },
  { date: '2026-02-13', tokens: 125600 },
  { date: '2026-02-14', tokens: 189200 },
  { date: '2026-02-15', tokens: 76400 },
  { date: '2026-02-16', tokens: 145000 },
]

# Henry Mission Control 🎯

A sleek, professional Mission Control dashboard for monitoring **Henry** (your OpenClaw agent) in real-time.

**Built for:** Louis Wand  
**Agent:** Henry (OpenClaw)  
**Status:** Production-Ready with Mock Data

---

## 🎨 Features

### Core Dashboard Components

1. **Agent Status** 💚
   - Current state (online/busy/idle) with animated indicator
   - Uptime tracking
   - Last heartbeat timestamp
   - Visual status ring

2. **Active Tasks** 🤖
   - Real-time task list (main session, sub-agents, scheduled tasks)
   - Progress bars with percentage tracking
   - Task duration and estimated time to completion
   - Completed task history

3. **Bandwidth & Capacity** 📊
   - Daily token usage with visual progress bars
   - Monthly token tracking
   - Concurrent session capacity monitoring
   - Rate limit status (requests per minute)
   - Health indicators (green/yellow/red)

4. **Cost Report** 💰
   - Daily spending breakdown by model (Haiku/Sonnet/Opus)
   - Budget visualization ($3/day limit)
   - Token cost calculation per model
   - Input/output cost separation
   - Budget remaining indicator

5. **Heartbeat Schedule** ❤️
   - Last heartbeat timestamp
   - Next scheduled check
   - Frequency (every 30 minutes)
   - System health status
   - Upcoming check timeline

### Design Features

- **Glassmorphism UI** with frosted glass effect (Apple Big Sur inspired)
- **Dark mode optimized** with sophisticated gradients
- **Responsive layout** - Works on mobile, tablet, desktop
- **Real-time updates** - Clock display, animated indicators
- **Accessibility** - High contrast, clear typography
- **Performance** - Lightweight, optimized for fast load times

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (v25.6.1 recommended)
- **npm** 9+ or **yarn**

### Installation

```bash
cd /Users/louiswand/.openclaw/workspace/henry-mission-control

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
henry-mission-control/
├── app/
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles + glassmorphism effects
├── components/
│   ├── AgentStatus.tsx    # Agent status card
│   ├── ActiveTasks.tsx    # Task list and tracking
│   ├── BandwidthCapacity.tsx
│   ├── CostReport.tsx     # Cost breakdown by model
│   └── HeartbeatSchedule.tsx
├── data/
│   └── mockData.ts        # Mock data + types (ready for API integration)
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

---

## 🔧 Configuration

### Tailwind CSS

Glassmorphism effects are pre-configured in `tailwind.config.ts`:

```typescript
colors: {
  'glass-light': 'rgba(255, 255, 255, 0.1)',
  'glass-lighter': 'rgba(255, 255, 255, 0.05)',
}
backdropFilter: {
  'glass': 'blur(10px)',
}
```

### Global Styles

Custom CSS in `app/globals.css`:
- `.glass-card` - Ready-to-use card component
- `.animate-pulse-subtle` - Subtle real-time animation
- `.status-dot-online` - Animated status indicator

---

## 📊 Data & Mock Data

All dashboard data is currently **mocked** for demonstration. The structure is designed for seamless API integration.

### Mock Data Sources

**File:** `data/mockData.ts`

```typescript
// Agent Status
mockAgentStatus: AgentStatus

// Active Tasks
mockTasks: Task[]

// Bandwidth Metrics
mockBandwidth: BandwidthMetrics

// Cost Report
mockCostReport: CostReport

// Heartbeat Info
mockHeartbeat: HeartbeatInfo

// Historical data
mockCostHistory: Array<{date, cost}>
mockTokenHistory: Array<{date, tokens}>
```

### Model Pricing (Built-in)

```
Haiku:   $0.25 input  /  $1.25 output  per million tokens
Sonnet:  $3.00 input  / $15.00 output  per million tokens
Opus:   $15.00 input  / $75.00 output  per million tokens
Daily Budget: $3.00
```

---

## 🔌 Integration Ready

### Next Steps for API Integration

The dashboard is architected for easy API integration:

1. **Replace mock data** in `data/mockData.ts` with real API calls
2. **Add API service** in `services/` (suggested: `useHenryAPI.ts`)
3. **Implement real-time updates** with WebSocket or polling
4. **OpenClaw session data** from `sessions_list` command
5. **Token usage** from `session_status` command

### Example Integration Point

```typescript
// In a component:
const [agentStatus, setAgentStatus] = useState(mockAgentStatus)

useEffect(() => {
  // Replace with: const status = await fetchAgentStatus()
  // setAgentStatus(status)
}, [])
```

---

## 🎨 Customization

### Colors & Theme

Edit `tailwind.config.ts` to adjust:
- Background gradients
- Glassmorphism blur intensity
- Color palette
- Border opacity

### Typography

Font stack uses system fonts for optimal performance:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
```

---

## ⚡ Performance Notes

- **Lightweight:** ~50KB (gzipped) with Tailwind
- **No external UI libraries** - Custom glassmorphism CSS
- **Optimized animations** - GPU-accelerated transforms
- **Zero JavaScript bloat** - React + Next.js only
- **Fast refresh:** HMR in development

---

## 📝 License

MIT © Louis Wand

---

## 🤝 For Questions

This dashboard is built to monitor Henry (your OpenClaw agent). For integration questions or feature requests, update the mock data or add new components as needed.

**Ready to monitor!** 🚀

---

## Development Notes

### Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint (if configured)
```

### Technologies

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Utility CSS
- **PostCSS** - CSS processing

### Browser Support

- Modern browsers (Chrome 90+, Safari 14+, Firefox 88+, Edge 90+)
- Mobile browsers (iOS Safari 14+, Chrome Android)
- Dark mode optimized for all platforms

---

**Version:** 1.0.0  
**Last Updated:** February 2026


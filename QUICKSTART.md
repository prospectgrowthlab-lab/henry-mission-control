# Quick Start Guide 🚀

Get the Henry Mission Control dashboard running in 2 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Install & Run

```bash
# Navigate to the project
cd /Users/louiswand/.openclaw/workspace/henry-mission-control

# Install dependencies (already done!)
npm install

# Start the development server
npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

You should see the Mission Control dashboard with all 5 components:
- ✅ Agent Status
- ✅ Active Tasks
- ✅ Bandwidth & Capacity
- ✅ Cost Report
- ✅ Heartbeat Schedule

## Available Commands

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## What You're Looking At

The dashboard displays **real-time monitoring data** for Henry (OpenClaw agent):

- **Top bar:** Quick stats (system status, active sessions, token usage, daily spend)
- **Left column:** Agent status indicator + heartbeat schedule
- **Center:** Real-time task list showing what Henry is working on
- **Bottom:** Bandwidth metrics and cost breakdown

## Next Steps

### See Live Data (Later Integration)

Currently uses **mock data** for demonstration. To connect real data:

1. Open `data/mockData.ts` - this is your data source
2. Replace mock data with API calls to:
   - OpenClaw `session_status` (for uptime, tokens, costs)
   - OpenClaw `sessions_list` (for active tasks)
   - Your monitoring service (for bandwidth/capacity)

### Customize Colors

Edit `tailwind.config.ts` to adjust the glassmorphism theme.

### Deploy

```bash
npm run build
npm start
```

Then deploy the `.next/` folder to your hosting.

---

**Status:** ✅ Ready to use  
**Dashboard:** Live at http://localhost:3000 (development mode)

# Live Data Setup - Complete Guide

## ✅ Current Status: LIVE

Your dashboard at **https://henry-mission-control.vercel.app** is now showing **real OpenClaw usage data**.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Vercel Dashboard (henry-mission-control.vercel.app)  │
│  ├─ Fetches from NEXT_PUBLIC_USAGE_API_URL      │
│  └─ Proxies via API routes                      │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
                  ↓
┌─────────────────────────────────────────────────┐
│  Cloudflare Tunnel                              │
│  (directory-crafts-stones-thumb.trycloudflare.com) │
└─────────────────┬───────────────────────────────┘
                  │ HTTP
                  ↓
┌─────────────────────────────────────────────────┐
│  Usage API Server (localhost:3001)             │
│  ├─ Reads ~/.openclaw/agents/main/sessions/    │
│  ├─ Parses JSONL session logs                  │
│  └─ Returns real-time usage data               │
└─────────────────────────────────────────────────┘
```

## What's Running

### 1. Usage API Server (localhost:3001)

**Location:** `henry-mission-control/usage-api-server.js`

**Purpose:** Reads OpenClaw session files locally and serves usage data via HTTP API.

**Endpoints:**
- `GET /health` - Health check
- `GET /api/usage/today` - Today's usage summary
- `GET /api/usage/cost-report` - Detailed cost breakdown

**How to check if it's running:**
```bash
curl http://localhost:3001/health
```

**How to restart:**
```bash
# Find and kill the existing process
ps aux | grep usage-api-server
kill <PID>

# Start it again
cd /Users/louiswand/.openclaw/workspace/henry-mission-control
node usage-api-server.js &
```

### 2. Cloudflare Tunnel

**Purpose:** Exposes the local API server publicly so Vercel can access it.

**Current URL:** `https://directory-crafts-stones-thumb.trycloudflare.com`

**How to check if it's running:**
```bash
curl https://directory-crafts-stones-thumb.trycloudflare.com/health
```

**How to restart:**
```bash
# Find and kill the existing process
ps aux | grep cloudflared
kill <PID>

# Start a new tunnel (URL will change!)
cloudflared tunnel --url http://localhost:3001 &
```

**⚠️ IMPORTANT:** When you restart the tunnel, you get a **new URL**. You'll need to update the Vercel environment variable:

```bash
# Get the new URL from cloudflared output
# Then update Vercel:
cd henry-mission-control
echo "https://new-tunnel-url.trycloudflare.com" | vercel env add NEXT_PUBLIC_USAGE_API_URL production

# Redeploy to pick up the change:
vercel --prod
```

### 3. Vercel Dashboard

**URL:** https://henry-mission-control.vercel.app

**Environment Variable:** `NEXT_PUBLIC_USAGE_API_URL` points to the Cloudflare tunnel.

**To view/update environment variables:**
```bash
cd henry-mission-control
vercel env ls
```

## Maintenance Tasks

### Check if everything is working

Quick health check:
```bash
# 1. Check local API
curl http://localhost:3001/health

# 2. Check tunnel
curl https://directory-crafts-stones-thumb.trycloudflare.com/health

# 3. Check Vercel dashboard
curl https://henry-mission-control.vercel.app/api/usage/today | jq .totalCost
```

If any of these fail, restart that component.

### Restart Everything

If you need to restart after a machine reboot:

```bash
cd /Users/louiswand/.openclaw/workspace/henry-mission-control

# 1. Start the API server
node usage-api-server.js &

# 2. Start the tunnel (note the new URL!)
cloudflared tunnel --url http://localhost:3001 &

# 3. Get the new tunnel URL from the output above
# It will look like: https://something-words-here.trycloudflare.com

# 4. Update Vercel with the new URL
echo "https://NEW-URL-HERE.trycloudflare.com" | vercel env add NEXT_PUBLIC_USAGE_API_URL production

# 5. Redeploy
vercel --prod
```

### Keep Services Running (Optional)

If you want these to run automatically on startup, you can create launch agents.

**Option 1: Simple background processes**
```bash
# Add to your ~/.zshrc or ~/.bashrc:
cd /Users/louiswand/.openclaw/workspace/henry-mission-control && node usage-api-server.js &
cloudflared tunnel --url http://localhost:3001 &
```

**Option 2: Create launchd services** (more reliable, but more complex - let me know if you want help with this)

## Troubleshooting

### Dashboard shows mock data or old data

1. Check if the API server is running: `curl http://localhost:3001/health`
2. Check if the tunnel is accessible: `curl https://directory-crafts-stones-thumb.trycloudflare.com/health`
3. Check Vercel environment variable: `cd henry-mission-control && vercel env ls | grep USAGE_API`
4. Check Vercel logs for errors: Visit https://vercel.com/louis-projects-206826f6/henry-mission-control

### Tunnel URL changed

The free Cloudflare tunnel URLs are temporary. If it stops working:
1. Restart the tunnel (you'll get a new URL)
2. Update the Vercel environment variable
3. Redeploy

### API server not reading latest data

The API server reads files on each request, so it should always have the latest data. If it doesn't:
1. Check if OpenClaw session files exist: `ls ~/.openclaw/agents/main/sessions/*.jsonl`
2. Restart the API server
3. Check for errors in the API server logs

### Costs

- **Cloudflare Tunnel:** Free (with limitations)
- **Vercel Hosting:** Free tier (should be fine for personal use)
- **OpenClaw Usage API:** Free (runs on your machine)

The only "cost" is having your computer running with these services active.

## Alternative: Run Locally

If you don't want to keep the tunnel running, you can run the dashboard locally:

```bash
cd henry-mission-control
npm run dev
```

Visit http://localhost:3000 - it will read session files directly (no API server or tunnel needed).

## Future Improvements

1. **Persistent Tunnel:** Use a proper Cloudflare account with a named tunnel (keeps the same URL)
2. **Systemd/Launchd Service:** Auto-start the API server on boot
3. **VPS Hosting:** Run the API server on a VPS for 24/7 availability
4. **OpenClaw Gateway Integration:** Build the API directly into OpenClaw Gateway

For now, the current setup works well for development and personal use!

## Questions?

If something breaks or you need help, just ask Henry!

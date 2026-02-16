#!/bin/bash

# Henry Mission Control - Status Check Script
# Quick way to verify all components are working

echo "🔍 Henry Mission Control - Status Check"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check local API server
echo -n "1. Local API Server (localhost:3001): "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    COST=$(curl -s http://localhost:3001/api/usage/today | jq -r '.totalCost // "error"' 2>/dev/null)
    echo -e "${GREEN}✓ Running${NC} (Cost today: \$$COST)"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "  → Start with: cd henry-mission-control && node usage-api-server.js &"
fi

# 2. Check Cloudflare tunnel
echo -n "2. Cloudflare Tunnel: "
TUNNEL_URL="https://directory-crafts-stones-thumb.trycloudflare.com"
if curl -s $TUNNEL_URL/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Active${NC}"
    echo "   URL: $TUNNEL_URL"
else
    echo -e "${RED}✗ Not accessible${NC}"
    echo "  → Restart with: cloudflared tunnel --url http://localhost:3001 &"
    echo "  → Then update Vercel env with new URL"
fi

# 3. Check Vercel dashboard
echo -n "3. Vercel Dashboard: "
VERCEL_URL="https://henry-mission-control.vercel.app"
if curl -s $VERCEL_URL/api/usage/today > /dev/null 2>&1; then
    VERCEL_COST=$(curl -s $VERCEL_URL/api/usage/today | jq -r '.totalCost // "error"' 2>/dev/null)
    BUDGET_PCT=$(curl -s $VERCEL_URL/api/usage/today | jq -r '.budgetUsedPercent // "error"' 2>/dev/null)
    echo -e "${GREEN}✓ Live${NC}"
    echo "   URL: $VERCEL_URL"
    echo "   Cost: \$$VERCEL_COST ($BUDGET_PCT% of \$3 budget)"
    
    # Check if it's using real data or mock data
    if [ "$VERCEL_COST" != "null" ] && [ "$VERCEL_COST" != "error" ]; then
        echo -e "   ${GREEN}Using real data${NC}"
    else
        echo -e "   ${YELLOW}Warning: May be using mock data${NC}"
    fi
else
    echo -e "${RED}✗ Not accessible${NC}"
fi

echo ""
echo "=========================================="
echo "Summary:"

# Count what's working
WORKING=0
if curl -s http://localhost:3001/health > /dev/null 2>&1; then ((WORKING++)); fi
if curl -s $TUNNEL_URL/health > /dev/null 2>&1; then ((WORKING++)); fi
if curl -s $VERCEL_URL/api/usage/today > /dev/null 2>&1; then ((WORKING++)); fi

if [ $WORKING -eq 3 ]; then
    echo -e "${GREEN}All systems operational! 🚀${NC}"
elif [ $WORKING -eq 0 ]; then
    echo -e "${RED}All systems down. See LIVE_DATA_GUIDE.md for restart instructions.${NC}"
else
    echo -e "${YELLOW}$WORKING/3 components working. Check failed items above.${NC}"
fi

echo ""

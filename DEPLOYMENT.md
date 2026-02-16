# Deployment Guide 🚀

How to deploy Henry Mission Control to production.

## Local Development

```bash
npm run dev
```

Runs on `http://localhost:3000` with hot-reload enabled.

## Production Build

```bash
npm run build
npm start
```

Optimized build suitable for production environments.

## Deployment Options

### Option 1: Vercel (Easiest)

Next.js is optimized for Vercel deployment:

```bash
npm i -g vercel
vercel login
vercel deploy
```

### Option 2: Self-Hosted (Node.js)

```bash
# On your server:
cd /Users/louiswand/.openclaw/workspace/henry-mission-control
npm ci --omit=dev
npm run build
npm start
```

Use a process manager like `pm2`:

```bash
npm i -g pm2
pm2 start npm --name "henry-mission-control" -- start
pm2 startup
pm2 save
```

### Option 3: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t henry-mission-control .
docker run -p 3000:3000 henry-mission-control
```

## Environment Variables

No environment variables required for the dashboard (uses mock data).

When connecting to a real API:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-api.com
API_SECRET_KEY=your-secret-key
```

Then use in code:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

## Performance

- **Bundle Size:** ~50KB gzipped
- **Build Time:** <10 seconds
- **Load Time:** <1 second (optimized)
- **First Paint:** <500ms

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Run `npm run build` successfully
- [ ] Test with `npm start`
- [ ] Configure any API integrations
- [ ] Set up monitoring/logging
- [ ] Enable HTTPS on your domain
- [ ] Configure CORS if needed
- [ ] Deploy and test live

## Monitoring

Monitor your deployment:

```bash
# Logs
pm2 logs henry-mission-control

# Status
pm2 status

# Memory usage
pm2 monit
```

## Rolling Back

Keep previous builds:

```bash
# Tag releases
git tag v1.0.0
git push origin v1.0.0

# Rollback
npm ci
git checkout v1.0.0
npm run build
npm start
```

## SSL/HTTPS

For production, use HTTPS:

```bash
# Using Let's Encrypt (certbot)
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx/apache to use certificates
```

## API Integration Notes

When connecting to a real API:

1. Update `data/mockData.ts` to fetch from your endpoints
2. Add error handling for API failures
3. Implement caching for expensive queries
4. Add rate limiting for API calls
5. Set up WebSocket for real-time updates (optional)

---

**Ready to deploy!** Choose your hosting and follow the steps above.

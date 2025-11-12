# Deployment Guide

## Render.com Deployment

This guide explains how to deploy Quantum Chat to Render.com.

### Prerequisites

- A [Render.com](https://render.com) account
- GitHub repository connected to Render
- Code pushed to your repository

### Deployment Options

#### Option 1: Deploy Using render.yaml (Recommended)

The project includes a `render.yaml` file that automatically configures both backend and frontend services.

1. **Fork or Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing quantum-chat
   - Render will automatically detect `render.yaml`

3. **Environment Variables** (Auto-configured)
   - Backend automatically gets `PORT` from Render
   - Frontend gets `VITE_API_URL` and `VITE_WS_URL` pointing to backend
   - CORS is configured to allow the frontend URL

4. **Deploy**
   - Click "Apply" to create both services
   - Wait for builds to complete (~5-10 minutes)

5. **Access Your Application**
   - Frontend: `https://quantum-chat-frontend.onrender.com`
   - Backend API: `https://quantum-chat-backend.onrender.com`
   - API Docs: `https://quantum-chat-backend.onrender.com/docs`

#### Option 2: Manual Deployment

##### Deploy Backend

1. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect repository
   - Configure:
     - **Name**: `quantum-chat-backend`
     - **Runtime**: `Python 3`
     - **Region**: `Oregon` (or your choice)
     - **Branch**: `main`
     - **Root Directory**: Leave empty
     - **Build Command**: `cd backend && pip install -r requirements.txt`
     - **Start Command**: `cd backend && uvicorn api.main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables**
   - Add the following in the Environment tab:
     ```
     PYTHON_VERSION=3.11.0
     FRONTEND_URL=https://quantum-chat-frontend.onrender.com
     ```

3. **Deploy** - Click "Create Web Service"

##### Deploy Frontend

1. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect repository
   - Configure:
     - **Name**: `quantum-chat-frontend`
     - **Runtime**: `Node`
     - **Region**: `Oregon`
     - **Branch**: `main`
     - **Root Directory**: Leave empty
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Start Command**: `cd frontend && npm run preview -- --host 0.0.0.0 --port $PORT`

2. **Environment Variables**
   - Add the following:
     ```
     NODE_VERSION=20
     VITE_API_URL=https://quantum-chat-backend.onrender.com
     VITE_WS_URL=wss://quantum-chat-backend.onrender.com
     ```

3. **Deploy** - Click "Create Web Service"

### Custom Domain Setup (Optional)

If you want to use `quantum-chat.srijan.dpdns.org`:

1. **Backend Custom Domain**
   - Go to backend service settings
   - Add custom domain: `api.quantum-chat.srijan.dpdns.org`
   - Configure DNS CNAME record pointing to Render URL

2. **Frontend Custom Domain**
   - Go to frontend service settings
   - Add custom domain: `quantum-chat.srijan.dpdns.org`
   - Configure DNS CNAME record

3. **Update Environment Variables**
   - Update frontend `VITE_API_URL` to your custom backend domain
   - Update frontend `VITE_WS_URL` to WebSocket URL (wss://)
   - Update backend `FRONTEND_URL` to your custom frontend domain

### Troubleshooting

#### Backend Issues

**WebSocket Connection Failed**
- Ensure WebSocket URL uses `wss://` (not `ws://`)
- Check CORS configuration in backend allows your frontend URL
- Verify backend health: `https://your-backend.onrender.com/health`

**Import Errors**
- Ensure all relative imports use `..` notation (e.g., `from ..models import`)
- Check `PYTHON_VERSION` environment variable is set

**Module Not Found**
- Verify `requirements.txt` is in `backend/` directory
- Check build logs for pip install errors

#### Frontend Issues

**API Connection Failed**
- Verify `VITE_API_URL` points to correct backend URL
- Check browser console for CORS errors
- Ensure backend service is running

**Environment Variables Not Loading**
- Environment variables must start with `VITE_`
- Rebuild frontend after changing environment variables
- Clear browser cache

**Build Failures**
- Ensure Node version is 18+ (`NODE_VERSION=20`)
- Check for syntax errors in JavaScript files
- Verify all imports are correct

### Performance Optimization

#### Free Tier Limitations

Render free tier services:
- Spin down after 15 minutes of inactivity
- Take 30-50 seconds to spin up on first request
- Have 512MB RAM limit

#### Recommendations

1. **Keep Services Warm**
   - Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your app every 14 minutes
   - Add to `.github/workflows/keepalive.yml`:
     ```yaml
     name: Keep Alive
     on:
       schedule:
         - cron: '*/14 * * * *'
     jobs:
       keepalive:
         runs-on: ubuntu-latest
         steps:
           - name: Ping Backend
             run: curl https://quantum-chat-backend.onrender.com/health
     ```

2. **Optimize Build Time**
   - Backend builds in ~2-3 minutes
   - Frontend builds in ~1-2 minutes
   - Use caching where possible

3. **Upgrade to Paid Plan** (Optional)
   - $7/month per service for always-on
   - Better performance and no spin-down

### Monitoring

#### Health Checks

Backend includes health endpoint:
```bash
curl https://quantum-chat-backend.onrender.com/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-12T10:30:00.000Z",
  "active_sessions": 0
}
```

#### Logs

- View logs in Render Dashboard → Service → Logs tab
- Backend logs show API requests and WebSocket connections
- Frontend logs show build output and server startup

### CI/CD

Render automatically deploys on git push to main branch:

1. **Automatic Deployments**
   - Push to `main` branch triggers rebuild
   - Both services update simultaneously
   - Zero-downtime deployments

2. **Manual Deployments**
   - Trigger from Render Dashboard
   - Useful for reverting changes

3. **Deploy Branches**
   - Configure specific branches to deploy
   - Useful for staging environments

### Security Checklist

- ✅ CORS configured for specific origins (not `*`)
- ✅ HTTPS enforced (automatic on Render)
- ✅ WebSocket uses WSS (secure WebSocket)
- ✅ No secrets in code (use environment variables)
- ⚠️ Consider adding authentication for production use
- ⚠️ Implement rate limiting for API endpoints

### Scaling

For production use beyond education/demo:

1. **Database** - Add PostgreSQL for persistent session storage
2. **Redis** - Cache quantum keys and session data
3. **Load Balancer** - Distribute traffic across multiple instances
4. **CDN** - Serve frontend assets from edge locations
5. **Monitoring** - Add Sentry, LogRocket, or similar tools

### Support

For Render-specific issues:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)

For application issues:
- Check GitHub Issues
- Review application logs
- Test locally first with Docker

---

## Alternative Deployment Platforms

### Heroku

```bash
# Install Heroku CLI
heroku create quantum-chat-backend
heroku create quantum-chat-frontend

# Deploy backend
git subtree push --prefix backend heroku main

# Deploy frontend
git subtree push --prefix frontend heroku main
```

### Docker Hub + VPS

```bash
# Build and push images
docker build -t yourusername/quantum-chat-backend ./backend
docker build -t yourusername/quantum-chat-frontend ./frontend
docker push yourusername/quantum-chat-backend
docker push yourusername/quantum-chat-frontend

# Deploy on VPS
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel (Frontend Only)

```bash
cd frontend
vercel --prod
```

Set environment variables in Vercel dashboard.

---

## Local Testing Before Deployment

Always test locally before deploying:

```bash
# Test with Docker
docker-compose up --build

# Test production build
cd frontend
npm run build
npm run preview

cd ../backend
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

Verify:
- Backend health endpoint responds
- Frontend loads correctly
- WebSocket connections work
- CORS is properly configured
- All API endpoints function

---

**Ready to deploy?** Follow Option 1 (render.yaml) for the easiest deployment experience!

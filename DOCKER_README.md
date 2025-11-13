# Docker Read-Only Filesystem Setup

This project supports running with read-only Docker containers for enhanced security.

## Overview

All Docker configurations now support read-only filesystems with the following features:
- **Read-only root filesystem**: Prevents unauthorized file modifications
- **Tmpfs mounts**: Provides temporary writable storage where needed
- **Pre-compiled bytecode**: Python bytecode is compiled during build
- **No runtime file writes**: All application data stored in-memory

## Configurations

### Development Mode (docker-compose.yml)

Runs frontend and backend as separate services with read-only filesystems.

```bash
# Build and start services
docker-compose build
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Features:**
- Separate frontend (Vite preview) and backend (Uvicorn) services
- Read-only containers with tmpfs for temporary files
- Hot reload disabled for read-only compatibility
- CORS configured for cross-origin requests

### Production Mode (docker-compose.prod.yml)

Unified service where backend serves both API and frontend.

```bash
# Build and start production service
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Access the application
# Application: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Features:**
- Single unified container
- Backend serves pre-built frontend from /frontend/dist
- Gunicorn with 4 workers for production performance
- Health checks enabled
- Auto-restart policy

## Read-Only Filesystem Details

### Tmpfs Mounts

The following directories require write access and are mounted as tmpfs:

#### Backend
- `/tmp` (100MB): System temporary files
- `/run` (10MB): Runtime data and PID files

#### Frontend (Development Mode)
- `/tmp` (100MB): System temporary files
- `/app/.vite` (50MB): Vite cache directory

### Environment Variables

**Backend:**
- `PYTHONDONTWRITEBYTECODE=1`: Disables .pyc file generation
- `PYTHONUNBUFFERED=1`: Direct stdout/stderr (no buffering)

### Pre-compiled Bytecode

Python bytecode is compiled during the Docker build process:
```dockerfile
RUN python -m compileall -b .
```

This ensures the application can run without needing to generate .pyc files at runtime.

## Testing Read-Only Setup

Verify the containers are running with read-only filesystems:

```bash
# Inspect backend container
docker inspect quantum-chat-backend | grep -A 5 "ReadonlyRootfs"

# Inspect frontend container (dev mode)
docker inspect quantum-chat-frontend | grep -A 5 "ReadonlyRootfs"

# Inspect production container
docker inspect quantum-chat-app | grep -A 5 "ReadonlyRootfs"
```

Expected output: `"ReadonlyRootfs": true`

### Test File Write Protection

```bash
# Try to create a file (should fail)
docker exec quantum-chat-backend touch /test.txt
# Expected: touch: cannot touch '/test.txt': Read-only file system

# Verify tmpfs works (should succeed)
docker exec quantum-chat-backend touch /tmp/test.txt
docker exec quantum-chat-backend ls -la /tmp/test.txt
```

## Architecture

### Development Architecture
```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   Container     │────────▶│   Container     │
│   (Port 3000)   │   API   │   (Port 8000)   │
│   Vite Preview  │         │   Uvicorn       │
└─────────────────┘         └─────────────────┘
      │                              │
      └──────────┬───────────────────┘
                 │
         User Browser (localhost)
```

### Production Architecture
```
┌────────────────────────────────┐
│     Unified Container          │
│      (Port 8000)               │
│                                │
│  ┌──────────┐  ┌────────────┐ │
│  │ Gunicorn │  │  Frontend  │ │
│  │ Backend  │  │   /dist/   │ │
│  └──────────┘  └────────────┘ │
└────────────────────────────────┘
                 │
         User Browser (localhost)
```

## Security Benefits

1. **Immutable Infrastructure**: Container filesystem cannot be modified at runtime
2. **Attack Surface Reduction**: Prevents malware from writing files
3. **Configuration Drift Prevention**: Ensures containers match build spec
4. **Audit Trail**: All changes must go through build process
5. **Memory-Only Data**: Sessions and keys stored in RAM, not disk

## Troubleshooting

### Container fails to start with read-only filesystem

**Issue**: Application tries to write to read-only locations

**Solutions**:
1. Check if additional directories need tmpfs mounts
2. Verify Python bytecode is pre-compiled
3. Ensure logs go to stdout/stderr, not files

### Permission denied errors

**Issue**: Cannot write to expected directories

**Solutions**:
1. Add tmpfs mount for the directory
2. Configure application to use /tmp for temporary files
3. Check environment variables are set correctly

### Frontend cannot connect to backend

**Issue**: CORS or connection errors

**Solutions**:
1. Verify backend CORS settings allow frontend origin
2. Check network configuration in docker-compose
3. Ensure ports are correctly mapped

## Notes

- **In-Memory Storage**: All session data and quantum keys are stored in memory and lost on restart
- **No Persistent Volumes**: No data persists between container restarts
- **Stateless Design**: Application designed to be fully stateless
- **Horizontal Scaling**: Can run multiple instances behind a load balancer

## Additional Resources

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Read-only Root Filesystem](https://docs.docker.com/engine/reference/run/#security-configuration)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)

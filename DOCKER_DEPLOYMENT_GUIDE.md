# Docker Deployment Guide for FFmpeg Lyric Video Render Engine

This guide covers deploying the Dockerized FFmpeg render engine to Render.com with asynchronous job processing.

## Prerequisites

- Docker installed on your local machine
- A Render.com account
- Supabase project (for data persistence)

## 1. Docker Build and Push

### Build the Docker Image

```bash
# Build the Docker image
docker build -t lyric-video-render-engine .

# Tag for Docker Hub (replace with your username)
docker tag lyric-video-render-engine yourusername/lyric-video-render-engine:latest

# Push to Docker Hub
docker push yourusername/lyric-video-render-engine:latest
```

### Alternative: Use GitHub Container Registry

```bash
# Build and tag for GitHub Container Registry
docker build -t ghcr.io/yourusername/lyric-video-render-engine:latest .

# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin

# Push to GitHub Container Registry
docker push ghcr.io/yourusername/lyric-video-render-engine:latest
```

## 2. Deploy to Render.com

### Step 1: Create Web Service

1. Log into your [Render.com](https://render.com) dashboard
2. Click **New +** → **Web Service**
3. Choose **Deploy an existing image** or **Connect a repository** (if using GitHub)

### Step 2: Configure Service

**For Docker Image Deployment:**
- **Name**: `lyric-video-render-engine`
- **Region**: Choose closest to your users
- **Branch**: Leave blank (using Docker image)
- **Root Directory**: Leave blank
- **Runtime**: Leave blank
- **Build Command**: Leave blank
- **Start Command**: Leave blank

**For GitHub Repository Deployment:**
- **Name**: `lyric-video-render-engine`
- **Region**: Choose closest to your users
- **Branch**: `dockerize-ffmpeg-async-worker-render-deploy`
- **Root Directory**: Leave blank
- **Runtime**: **Docker**
- **Build Command**: Leave blank
- **Start Command**: Leave blank

### Step 3: Environment Variables

Add these environment variables in the Render dashboard:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Application Settings
ENVIRONMENT=production
PYTHONUNBUFFERED=1

# Optional: For production builds
RENDER=true
```

### Step 4: Resources & Scaling

**Recommended Settings:**
- **Instance Type**: **Standard** (2 vCPU, 4GB RAM) or **Memory Optimized** (4 vCPU, 16GB RAM)
- **Auto-Deploy**: Enabled
- **Min Instances**: 0
- **Max Instances**: 2-5 (depending on expected load)

## 3. API Endpoints

Once deployed, your API will be available at:
`https://lyric-video-render-engine.onrender.com`

### Core Endpoints

#### Start Video Render (Async)
```bash
curl -X POST https://lyric-video-render-engine.onrender.com/api/render \
  -H "Content-Type: application/json" \
  -d '{
    "background_url": "/path/to/background.mp4",
    "audio_url": "/path/to/audio.mp3",
    "lyrics": [
      {"text": "Hello", "start": 0, "end": 1000},
      {"text": "World", "start": 1000, "end": 2000}
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "job_id": "uuid-string",
  "status": "PENDING",
  "message": "Render job started"
}
```

#### Check Job Status
```bash
curl https://lyric-video-render-engine.onrender.com/api/status/uuid-string
```

**Response:**
```json
{
  "success": true,
  "job_id": "uuid-string",
  "status": "PROCESSING",
  "progress": 45,
  "message": "Processing video...",
  "created_at": "2024-01-01T12:00:00Z"
}
```

#### Download Video
```bash
curl -O https://lyric-video-render-engine.onrender.com/api/download/uuid-string
```

#### AI Transcription
```bash
curl -X POST https://lyric-video-render-engine.onrender.com/api/transcribe \
  -F "audio=@your-audio-file.mp3"
```

## 4. Architecture Overview

### Asynchronous Processing Flow

1. **Client Request**: User submits render request
2. **Immediate Response**: API returns job ID and PENDING status
3. **Background Processing**: Render job runs in BackgroundTasks
4. **Progress Tracking**: Client can poll status endpoint
5. **Completion**: Video file available for download

### File Structure
```
/app
├── api/
│   ├── index_fastapi.py    # Main FastAPI app
│   ├── render_engine.py     # Video rendering logic
│   └── ...
├── public/
│   └── renders/            # Output videos directory
└── Dockerfile
```

## 5. Monitoring & Logs

### View Logs in Render Dashboard

1. Go to your service in Render dashboard
2. Click **Logs** tab
3. Monitor real-time logs during development
4. Check for errors during video processing

### Health Check

Monitor service health:
```bash
curl https://lyric-video-render-engine.onrender.com/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 6. Performance Considerations

### Resource Requirements

**Minimum for small videos (under 1 minute):**
- 2 vCPU, 4GB RAM
- Render time: ~2-5 minutes

**Recommended for longer videos (1-5 minutes):**
- 4 vCPU, 8GB RAM
- Render time: ~1-2x video length

**Production workloads:**
- Memory Optimized instances (16GB+ RAM)
- Multiple instances for concurrent processing

### Scaling Strategies

**Horizontal Scaling:**
- Multiple instances can process different jobs concurrently
- Each instance maintains its own job queue

**Vertical Scaling:**
- Increase instance size for faster rendering
- Better for single long-running jobs

## 7. Cost Optimization

### Render.com Pricing

**Free Tier:**
- 750 hours/month
- Limited processing time

**Paid Plans:**
- **Starter**: $7/month - 1 vCPU, 1GB RAM
- **Standard**: $25/month - 2 vCPU, 4GB RAM
- **Memory Optimized**: $55/month - 4 vCPU, 16GB RAM

### Cost-Saving Tips

1. **Auto-Sleep**: Set Min Instances = 0 for free tier
2. **Efficient Rendering**: Use optimal FFmpeg settings
3. **Job Batching**: Process multiple short videos instead of few long ones
4. **Resource Right-Sizing**: Start with Standard, scale up if needed

## 8. Troubleshooting

### Common Issues

**Container Won't Start:**
- Check environment variables are set
- Verify Dockerfile builds successfully locally
- Check logs in Render dashboard

**FFmpeg Errors:**
- Ensure libsm6 and libxext6 are installed in Dockerfile
- Check video/audio file formats are supported

**Memory Issues:**
- Increase instance size in Render dashboard
- Monitor memory usage in logs

**Timeout Issues:**
- BackgroundTasks should handle long-running processes
- Check if job completes before 10-minute timeout

### Debug Commands

```bash
# Test locally with Docker
docker run -p 8000:8000 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_KEY=your_key \
  lyric-video-render-engine

# Check logs
curl https://lyric-video-render-engine.onrender.com/health
```

## 9. Security Best Practices

### Environment Variables
- Never commit Supabase keys to Git
- Use Render's environment variable management
- Rotate keys regularly

### File Handling
- Validate all uploaded files
- Set file size limits (recommend 50MB max)
- Sanitize file paths

### CORS Configuration
- Currently allows all origins for development
- Restrict to your domain in production

## 10. Next Steps

### Frontend Integration
- Update your React app to use the new API endpoints
- Implement job polling for status updates
- Add download functionality for completed videos

### Advanced Features
- WebSocket integration for real-time progress
- User authentication and job queues
- Database persistence for job history
- CDN integration for video delivery

### Production Enhancements
- Add rate limiting
- Implement user quotas
- Set up monitoring and alerting
- Add comprehensive logging

## Support

For issues related to:
- **Docker**: Check container logs and file paths
- **Render.com**: Review deployment logs and environment variables
- **FFmpeg**: Verify file formats and system dependencies
- **Supabase**: Check connection settings and authentication
#!/bin/bash

# Docker Build and Test Script for Lyric Video Render Engine

set -e

echo "🚀 Building Docker image for Lyric Video Render Engine..."

# Build the Docker image
docker build -t lyric-video-render-engine .

echo "✅ Docker image built successfully!"

echo "📋 Running basic container test..."

# Test that the container can start and respond to health checks
docker run --rm -d --name render-engine-test -p 8000:8000 \
  -e SUPABASE_URL=test-url \
  -e SUPABASE_KEY=test-key \
  --health-cmd="curl -f http://localhost:8000/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  lyric-video-render-engine

echo "⏳ Waiting for container to be healthy..."

# Wait for container to be healthy (max 60 seconds)
timeout=60
while [ $timeout -gt 0 ]; do
  if docker inspect --format='{{.State.Health.Status}}' render-engine-test 2>/dev/null | grep -q "healthy"; then
    echo "✅ Container is healthy!"
    break
  fi
  
  if docker inspect --format='{{.State.Status}}' render-engine-test 2>/dev/null | grep -q "running"; then
    echo "⏳ Container is running, waiting for health check..."
  else
    echo "❌ Container failed to start!"
    docker logs render-engine-test
    exit 1
  fi
  
  sleep 2
  timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
  echo "⏰ Timeout waiting for container to become healthy"
  echo "Container logs:"
  docker logs render-engine-test
  exit 1
fi

echo "🧪 Testing API endpoints..."

# Test health endpoint
echo "Testing health endpoint..."
curl -f http://localhost:8000/health > /dev/null
echo "✅ Health endpoint working"

echo "📡 Container is ready for testing!"
echo ""
echo "Container name: render-engine-test"
echo "Port: 8000"
echo "API URL: http://localhost:8000"
echo ""
echo "Available endpoints:"
echo "  GET  /health - Health check"
echo "  POST /api/render - Start async video render"
echo "  GET  /api/status/{job_id} - Check job status"
echo "  GET  /api/download/{job_id} - Download video"
echo "  POST /api/transcribe - AI audio transcription"
echo "  POST /api/pinterest - Pinterest media extraction"
echo ""
echo "🛑 To stop the test container:"
echo "docker stop render-engine-test"
echo ""
echo "📝 To run production-style container:"
echo "docker run -d --name render-engine-prod -p 8000:8000 \\"
echo "  -e SUPABASE_URL=your_url -e SUPABASE_KEY=your_key \\"
echo "  lyric-video-render-engine"
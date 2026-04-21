$PORT=5000
Write-Host "Starting HTTP service on port $PORT for dev..."
pnpm tsx watch src/server.ts
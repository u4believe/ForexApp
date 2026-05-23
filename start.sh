#!/bin/bash
# Start PrimeVault Capital — both server and client

NODE="/usr/bin/node"
NPM="$NODE /mnt/c/Program\ Files/nodejs/node_modules/npm/bin/npm-cli.js"

echo "Starting PrimeVault Capital..."
echo ""

# Start backend
cd "$(dirname "$0")/server"
$NODE index.js &
SERVER_PID=$!
echo "✓ Server started (PID $SERVER_PID) on http://localhost:5000"

# Start frontend dev server
cd "$(dirname "$0")/client"
$NODE /mnt/c/Program\ Files/nodejs/node_modules/.bin/vite &
CLIENT_PID=$!
echo "✓ Client started (PID $CLIENT_PID) on http://localhost:5173"
echo ""
echo "Admin panel: http://localhost:5173/admin"
echo ""
echo "Press Ctrl+C to stop both processes"

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; echo 'Stopped.'" INT TERM
wait

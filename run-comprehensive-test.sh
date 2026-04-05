#!/bin/bash
cd "d:\01-Teaching\682\88734365\Library-Management-v2"

echo "🧪 Starting Comprehensive System Test..."
echo ""
echo "Step 1: Removing old database..."
rm -f database/library.db

echo "Step 2: Starting server..."
npm start > server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

echo "Step 3: Waiting for server to initialize..."
sleep 6

echo "Step 4: Running comprehensive tests..."
node comprehensive-test.js

echo ""
echo "Step 5: Checking server log..."
echo "---SERVER LOG---"
tail -20 server.log
echo "---END LOG---"

echo ""
echo "Step 6: Cleaning up..."
kill $SERVER_PID 2>/dev/null || true

echo "✅ Test complete!"

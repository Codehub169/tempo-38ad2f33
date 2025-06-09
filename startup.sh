#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u
# Cause a pipeline to return the exit status of the last command in the pipe that returned a non-zero status.
set -o pipefail

# Optional: Print commands and their arguments as they are executed.
# set -x # Uncomment for debugging

echo "---- RefurbishMarket Startup Script ----"
echo ""

# --- Client Setup ---
echo "INFO: Navigating to client directory..."
if [ ! -d "client" ]; then
  echo "ERROR: 'client' directory not found in $(pwd). Aborting." >&2
  exit 1
fi
cd client

echo "INFO: Installing client dependencies..."
npm install
echo "INFO: Client dependencies installed."
echo ""

echo "INFO: Building client application..."
npm run build
echo "INFO: Client application built."
echo ""

echo "INFO: Navigating back to project root..."
cd ..
echo ""

# --- Server Setup ---
echo "INFO: Navigating to server directory..."
if [ ! -d "server" ]; then
  echo "ERROR: 'server' directory not found in $(pwd). Aborting." >&2
  exit 1
fi
cd server

echo "INFO: Installing server dependencies..."
npm install
echo "INFO: Server dependencies installed."
echo ""

echo "INFO: Initializing database (this may involve creating tables and seeding data)..."
# This script (e.g., server/db/setup.js called by 'npm run db:init') 
# should handle table creation and data seeding idempotently.
npm run db:init
echo "INFO: Database initialization process complete."
echo ""

echo "INFO: Navigating back to project root..."
cd ..
echo ""

# --- Start Server ---
echo "INFO: Starting application server..."
echo "INFO: The server will run in the foreground. Press Ctrl+C to stop."
npm start --prefix server

# The script effectively ends here when 'npm start --prefix server' is running in the foreground.
# Any commands after it would only execute if the server process detaches or terminates.
echo "INFO: Server process exited."

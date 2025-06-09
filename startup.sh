#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Print commands and their arguments as they are executed.
# set -x 

echo "INFO: Starting application setup..."

# Frontend setup
if [ -d "client" ]; then
  echo "INFO: Navigating to client directory..."
  cd client
  echo "INFO: Installing client dependencies..."
  npm install
  echo "INFO: Building client application..."
  npm run build
  echo "INFO: Client setup complete. Navigating back to root..."
  cd ..
else
  echo "ERROR: Client directory not found!"
  exit 1
fi

# Backend setup
if [ -d "server" ]; then
  echo "INFO: Navigating to server directory..."
  cd server
  echo "INFO: Installing server dependencies..."
  npm install
  
  # Check if database setup script exists and run it
  if [ -f "db/setup.js" ]; then
    echo "INFO: Setting up database..."
    node db/setup.js
  else 
    echo "WARNING: Database setup script (db/setup.js) not found. Skipping database setup."
  fi
  
  echo "INFO: Starting server on port 9000..."
  # The server.js needs to be configured to listen on port 9000
  # and serve the static files from client/dist or client/build
  npm start
else
  echo "ERROR: Server directory not found!"
  exit 1
fi

echo "INFO: Application setup complete and server started."
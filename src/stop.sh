#!/bin/bash

# GRC Suite - Stop Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Stopping GRC Suite...${NC}"

# Check if PID file exists
if [ -f ".app.pid" ]; then
    PID=$(cat .app.pid)
    
    # Check if process is running
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping process (PID: $PID)...${NC}"
        kill $PID
        
        # Wait for process to stop
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${RED}Process still running, force killing...${NC}"
            kill -9 $PID
        fi
        
        rm .app.pid
        echo -e "${GREEN}✓ GRC Suite stopped successfully${NC}"
    else
        echo -e "${YELLOW}Process not running${NC}"
        rm .app.pid
    fi
else
    # Try to find and kill by name
    if pgrep -f "grc-suite" > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping grc-suite processes...${NC}"
        pkill -f "grc-suite"
        echo -e "${GREEN}✓ GRC Suite stopped${NC}"
    elif pgrep -f "node.*index.js" > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping Node.js processes...${NC}"
        pkill -f "node.*index.js"
        echo -e "${GREEN}✓ GRC Suite stopped${NC}"
    else
        echo -e "${YELLOW}No running GRC Suite process found${NC}"
    fi
fi

echo ""
echo -e "${BLUE}To restart the application, run:${NC}"
echo -e "  ${GREEN}./start.sh${NC}"
echo ""

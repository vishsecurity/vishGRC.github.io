#!/bin/bash

# GRC Suite - Quick Start Script
# This script provides an easy way to start the GRC Suite application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║     GRC Suite - Portable Edition     ║"
echo "║            Version 1.0.0             ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}Warning: Running as root is not recommended${NC}"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check port availability
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    echo -e "${GREEN}Detected OS: $OS $VER${NC}"
}

# Create necessary directories
create_directories() {
    echo -e "${BLUE}Creating directories...${NC}"
    mkdir -p data backups logs config templates
    echo -e "${GREEN}✓ Directories created${NC}"
}

# Check dependencies
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
    else
        echo -e "${RED}✗ Node.js not found${NC}"
        echo -e "${YELLOW}Please install Node.js 18+ from: https://nodejs.org${NC}"
        exit 1
    fi
    
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
    else
        echo -e "${RED}✗ npm not found${NC}"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}Installing dependencies...${NC}"
        npm install
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    else
        echo -e "${GREEN}✓ Dependencies already installed${NC}"
    fi
}

# Check if .env exists
check_env_file() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠ .env file not found${NC}"
        if [ -f ".env.example" ]; then
            echo -e "${BLUE}Creating .env from .env.example...${NC}"
            cp .env.example .env
            echo -e "${GREEN}✓ .env file created${NC}"
            echo -e "${YELLOW}Please review and update .env file with your settings${NC}"
        fi
    else
        echo -e "${GREEN}✓ .env file exists${NC}"
    fi
}

# Check port availability
check_app_port() {
    PORT=${PORT:-8080}
    echo -e "${BLUE}Checking port $PORT availability...${NC}"
    
    if check_port $PORT; then
        echo -e "${GREEN}✓ Port $PORT is available${NC}"
    else
        echo -e "${RED}✗ Port $PORT is already in use${NC}"
        echo -e "${YELLOW}Would you like to use a different port? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo -e "${BLUE}Enter port number:${NC}"
            read -r PORT
            export PORT
            echo "PORT=$PORT" >> .env
            echo -e "${GREEN}✓ Will use port $PORT${NC}"
        else
            echo -e "${RED}Please stop the service using port $PORT and try again${NC}"
            exit 1
        fi
    fi
}

# Start application
start_app() {
    echo -e "${BLUE}Starting GRC Suite...${NC}"
    echo ""
    
    # Check if binary exists
    if [ -f "grc-suite" ]; then
        echo -e "${GREEN}Using portable binary${NC}"
        chmod +x grc-suite
        ./grc-suite &
    # Check if index.js exists
    elif [ -f "index.js" ]; then
        echo -e "${GREEN}Using Node.js${NC}"
        npm start &
    else
        echo -e "${RED}✗ No executable found (grc-suite or index.js)${NC}"
        exit 1
    fi
    
    APP_PID=$!
    echo $APP_PID > .app.pid
    
    echo -e "${GREEN}✓ Application started (PID: $APP_PID)${NC}"
    echo ""
    
    # Wait for application to be ready
    echo -e "${BLUE}Waiting for application to be ready...${NC}"
    sleep 5
    
    # Check if application is responding
    if curl -s http://localhost:${PORT:-8080}/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Application is ready!${NC}"
    else
        echo -e "${YELLOW}⚠ Application may still be starting...${NC}"
    fi
}

# Display access information
display_info() {
    PORT=${PORT:-8080}
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║      GRC Suite is now running!            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Access the application:${NC}"
    echo -e "  Local:   ${GREEN}http://localhost:$PORT${NC}"
    if command_exists hostname; then
        HOSTNAME=$(hostname -I | awk '{print $1}')
        echo -e "  Network: ${GREEN}http://$HOSTNAME:$PORT${NC}"
    fi
    echo ""
    echo -e "${BLUE}Default credentials:${NC}"
    echo -e "  Username: ${YELLOW}admin${NC}"
    echo -e "  Password: ${YELLOW}admin${NC}"
    echo -e "  ${RED}⚠ Change password immediately after first login!${NC}"
    echo ""
    echo -e "${BLUE}Logs:${NC}"
    echo -e "  View logs: ${GREEN}tail -f logs/app.log${NC}"
    echo ""
    echo -e "${BLUE}Stop application:${NC}"
    echo -e "  Run: ${GREEN}./stop.sh${NC}"
    echo -e "  Or:  ${GREEN}kill \$(cat .app.pid)${NC}"
    echo ""
}

# Main execution
main() {
    echo ""
    detect_os
    echo ""
    
    create_directories
    check_dependencies
    install_dependencies
    check_env_file
    check_app_port
    
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════${NC}"
    echo ""
    
    start_app
    display_info
    
    echo -e "${GREEN}✓ GRC Suite startup complete!${NC}"
    echo ""
    
    # Keep script running to show logs
    echo -e "${BLUE}Press Ctrl+C to stop viewing logs (app will continue running)${NC}"
    echo ""
    tail -f logs/app.log 2>/dev/null || echo -e "${YELLOW}Logs not yet available${NC}"
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}Stopped viewing logs. Application is still running.${NC}"; exit 0' INT

# Run main function
main

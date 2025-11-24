# GRC Suite - Build Instructions

This document explains how to build the GRC Suite from source into a portable executable or Docker image.

## Prerequisites

### For Binary Build
- **Go 1.21+** (for single binary compilation) OR
- **Node.js 18+** with **pkg** (for Node.js packaging)
- **Linux development environment**
- **Git**
- **Make** (optional but recommended)

### For Docker Build
- **Docker 20.10+**
- **Docker Compose 2.0+** (optional)

---

## Build Options

### Option 1: Single Linux Binary (Go-based backend)

This creates a completely self-contained executable with no dependencies.

```bash
# Install Go (if not installed)
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Clone and build
git clone https://github.com/grcsuite/portable.git
cd portable

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build backend (Go)
cd backend
go mod download
go build -o ../grc-suite \
    -ldflags="-s -w -X main.version=1.0.0" \
    ./cmd/server

# The result is a single binary: ./grc-suite
cd ..

# Test the binary
chmod +x grc-suite
./grc-suite --version
```

#### Cross-compilation for different architectures

```bash
# For AMD64
GOOS=linux GOARCH=amd64 go build -o grc-suite-amd64 ./cmd/server

# For ARM64
GOOS=linux GOARCH=arm64 go build -o grc-suite-arm64 ./cmd/server

# For 386
GOOS=linux GOARCH=386 go build -o grc-suite-386 ./cmd/server
```

---

### Option 2: Single Binary (Node.js with pkg)

This packages Node.js and your application into a single executable.

```bash
# Install pkg globally
npm install -g pkg

# Install dependencies
npm install

# Build the binary
pkg . --targets node18-linux-x64 --output grc-suite

# Or build for multiple platforms
pkg . --targets node18-linux-x64,node18-linux-arm64 --output dist/grc-suite

# Result: ./grc-suite (Linux x64)
```

#### package.json configuration for pkg

```json
{
  "pkg": {
    "scripts": [
      "index.js",
      "src/**/*.js"
    ],
    "assets": [
      "templates/**/*",
      "config/**/*",
      "public/**/*"
    ],
    "targets": [
      "node18-linux-x64"
    ],
    "outputPath": "dist"
  }
}
```

---

### Option 3: Docker Image

#### Standard Docker Build

```bash
# Build the image
docker build -t grc-suite:1.0.0 .
docker tag grc-suite:1.0.0 grc-suite:latest

# Test the image
docker run -p 8080:8080 grc-suite:latest

# Save image for offline transfer
docker save grc-suite:latest | gzip > grc-suite-docker-1.0.0.tar.gz

# On target machine:
gunzip grc-suite-docker-1.0.0.tar.gz
docker load < grc-suite-docker-1.0.0.tar
```

#### Multi-stage Build (Optimized)

The included Dockerfile already uses multi-stage builds for minimal size.

```bash
# Build with BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t grc-suite:latest .

# Build with specific platform
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t grc-suite:latest \
  --push \
  .
```

---

## Build Automation

### Using Makefile

Create a `Makefile` for simplified building:

```makefile
.PHONY: all build-binary build-docker clean install test

VERSION := 1.0.0
BINARY_NAME := grc-suite

all: clean install build-binary

install:
	@echo "Installing dependencies..."
	npm install
	cd frontend && npm install

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

build-binary: build-frontend
	@echo "Building binary..."
	pkg . --targets node18-linux-x64 --output $(BINARY_NAME)
	chmod +x $(BINARY_NAME)
	@echo "✓ Binary built: ./$(BINARY_NAME)"

build-docker:
	@echo "Building Docker image..."
	docker build -t grc-suite:$(VERSION) .
	docker tag grc-suite:$(VERSION) grc-suite:latest
	@echo "✓ Docker image built: grc-suite:latest"

build-docker-save: build-docker
	@echo "Saving Docker image..."
	docker save grc-suite:latest | gzip > grc-suite-docker-$(VERSION).tar.gz
	@echo "✓ Docker image saved: grc-suite-docker-$(VERSION).tar.gz"

test:
	@echo "Running tests..."
	npm test

clean:
	@echo "Cleaning build artifacts..."
	rm -f $(BINARY_NAME)
	rm -f grc-suite-docker-*.tar.gz
	rm -rf dist/
	rm -rf node_modules/
	rm -rf frontend/node_modules/
	rm -rf frontend/dist/

package: build-binary
	@echo "Creating distribution package..."
	mkdir -p dist/grc-suite-$(VERSION)
	cp $(BINARY_NAME) dist/grc-suite-$(VERSION)/
	cp -r templates dist/grc-suite-$(VERSION)/
	cp -r config dist/grc-suite-$(VERSION)/
	cp README.md dist/grc-suite-$(VERSION)/
	cp DEPLOYMENT.md dist/grc-suite-$(VERSION)/
	cp start.sh dist/grc-suite-$(VERSION)/
	cp stop.sh dist/grc-suite-$(VERSION)/
	cp .env.example dist/grc-suite-$(VERSION)/
	chmod +x dist/grc-suite-$(VERSION)/start.sh
	chmod +x dist/grc-suite-$(VERSION)/stop.sh
	cd dist && tar -czf grc-suite-$(VERSION).tar.gz grc-suite-$(VERSION)
	@echo "✓ Package created: dist/grc-suite-$(VERSION).tar.gz"

docker-compose:
	@echo "Starting with Docker Compose..."
	docker-compose up -d

docker-compose-down:
	@echo "Stopping Docker Compose..."
	docker-compose down

help:
	@echo "GRC Suite - Build System"
	@echo ""
	@echo "Usage:"
	@echo "  make                 Build binary (default)"
	@echo "  make build-binary    Build portable Linux binary"
	@echo "  make build-docker    Build Docker image"
	@echo "  make package         Create distribution package"
	@echo "  make clean          Clean build artifacts"
	@echo "  make test           Run tests"
	@echo "  make help           Show this help message"
```

Usage:
```bash
# Build everything
make

# Build only Docker
make build-docker

# Create distribution package
make package

# Clean and rebuild
make clean && make
```

---

## Build Scripts

### build.sh - Automated Build Script

Create `build.sh`:

```bash
#!/bin/bash

set -e

VERSION="1.0.0"
BUILD_DATE=$(date +"%Y-%m-%d")
BUILD_DIR="dist"
PACKAGE_NAME="grc-suite-${VERSION}"

echo "╔════════════════════════════════════════╗"
echo "║   GRC Suite - Build Script v${VERSION}  ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Clean previous builds
echo -e "${BLUE}Cleaning previous builds...${NC}"
rm -rf ${BUILD_DIR}
mkdir -p ${BUILD_DIR}/${PACKAGE_NAME}

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Build frontend
echo -e "${BLUE}Building frontend...${NC}"
cd frontend
npm install
npm run build
cd ..

# Build binary
echo -e "${BLUE}Building binary...${NC}"
pkg . --targets node18-linux-x64 --output ${BUILD_DIR}/${PACKAGE_NAME}/grc-suite

# Copy necessary files
echo -e "${BLUE}Copying files...${NC}"
cp -r templates ${BUILD_DIR}/${PACKAGE_NAME}/
cp -r config ${BUILD_DIR}/${PACKAGE_NAME}/
cp README.md ${BUILD_DIR}/${PACKAGE_NAME}/
cp DEPLOYMENT.md ${BUILD_DIR}/${PACKAGE_NAME}/
cp start.sh ${BUILD_DIR}/${PACKAGE_NAME}/
cp stop.sh ${BUILD_DIR}/${PACKAGE_NAME}/
cp .env.example ${BUILD_DIR}/${PACKAGE_NAME}/
cp Dockerfile ${BUILD_DIR}/${PACKAGE_NAME}/
cp docker-compose.yml ${BUILD_DIR}/${PACKAGE_NAME}/

# Set permissions
chmod +x ${BUILD_DIR}/${PACKAGE_NAME}/grc-suite
chmod +x ${BUILD_DIR}/${PACKAGE_NAME}/start.sh
chmod +x ${BUILD_DIR}/${PACKAGE_NAME}/stop.sh

# Create archive
echo -e "${BLUE}Creating package...${NC}"
cd ${BUILD_DIR}
tar -czf ${PACKAGE_NAME}.tar.gz ${PACKAGE_NAME}
zip -r ${PACKAGE_NAME}.zip ${PACKAGE_NAME}
cd ..

# Calculate checksums
echo -e "${BLUE}Generating checksums...${NC}"
cd ${BUILD_DIR}
sha256sum ${PACKAGE_NAME}.tar.gz > ${PACKAGE_NAME}.tar.gz.sha256
sha256sum ${PACKAGE_NAME}.zip > ${PACKAGE_NAME}.zip.sha256
cd ..

# Build info
echo ""
echo -e "${GREEN}═════════════════════════════════════════${NC}"
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}═════════════════════════════════════════${NC}"
echo ""
echo "Version:      ${VERSION}"
echo "Build Date:   ${BUILD_DATE}"
echo "Output:       ${BUILD_DIR}/${PACKAGE_NAME}.tar.gz"
echo "              ${BUILD_DIR}/${PACKAGE_NAME}.zip"
echo ""
echo "Checksums:"
cat ${BUILD_DIR}/${PACKAGE_NAME}.tar.gz.sha256
cat ${BUILD_DIR}/${PACKAGE_NAME}.zip.sha256
echo ""
```

Make it executable:
```bash
chmod +x build.sh
./build.sh
```

---

## Testing the Build

### Test Binary

```bash
cd dist/grc-suite-1.0.0
./start.sh

# In another terminal
curl http://localhost:8080/health

# Should return: {"status":"healthy","version":"1.0.0"}

./stop.sh
```

### Test Docker

```bash
docker build -t grc-suite:test .
docker run -d -p 8080:8080 --name grc-test grc-suite:test
curl http://localhost:8080/health
docker stop grc-test && docker rm grc-test
```

---

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build GRC Suite

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build binary
        run: |
          npm install -g pkg
          pkg . --targets node18-linux-x64 --output grc-suite
      
      - name: Create package
        run: |
          mkdir -p dist/grc-suite
          cp grc-suite dist/grc-suite/
          cp -r templates config dist/grc-suite/
          cp README.md DEPLOYMENT.md dist/grc-suite/
          tar -czf grc-suite-${{ github.ref_name }}.tar.gz -C dist grc-suite
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: grc-suite-${{ github.ref_name }}.tar.gz
```

---

## Troubleshooting Build Issues

### pkg issues

```bash
# If pkg fails with "Cannot find module"
npm install --save-dev @vercel/ncc
ncc build index.js -o dist

# Then use the bundled file
pkg dist/index.js --targets node18-linux-x64
```

### Docker build issues

```bash
# Clear Docker cache
docker builder prune -a

# Build without cache
docker build --no-cache -t grc-suite:latest .
```

### Permission issues

```bash
# Fix file permissions
chmod +x grc-suite
chmod +x start.sh stop.sh

# Fix ownership
chown -R $USER:$USER .
```

---

## Distribution Checklist

Before distributing the build:

- [ ] Version number updated in all files
- [ ] README.md and DEPLOYMENT.md reviewed
- [ ] Templates and config files included
- [ ] Binary tested on clean Linux system
- [ ] Docker image tested
- [ ] Checksums generated
- [ ] Release notes prepared
- [ ] Default credentials documented
- [ ] License file included

---

**Build Date:** November 21, 2025  
**Version:** 1.0.0  
**Builder:** GRC Suite Team

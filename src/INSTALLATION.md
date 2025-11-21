# GRC Suite - Installation & Deployment Guide

## 📦 Quick Start

This GRC Suite is a browser-based application that runs entirely in your web browser. No complex installation required!

## 🌐 Access the Application

### Current Environment
The application is already running in your Figma Make environment. Simply:
1. Look at the preview/output window
2. Login with default credentials (admin/admin123)
3. Start using the platform immediately

## 🏗️ Local Development Setup

If you want to run this locally on your machine:

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation Steps

```bash
# 1. Clone or download the project
# (If you have the source code)

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

## 📤 Building for Production

### Create Production Build

```bash
# Build optimized production files
npm run build

# Output will be in /dist folder
```

### What Gets Built
- Minified JavaScript bundles
- Optimized CSS
- Static HTML
- All assets compressed

## 🚀 Deployment Options

### Option 1: Static Web Hosting (Recommended)

Deploy the `/dist` folder to any static hosting service:

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages
```bash
# Build
npm run build

# Copy dist contents to gh-pages branch
# Enable GitHub Pages in repository settings
```

#### AWS S3 + CloudFront
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Configure CloudFront distribution
```

#### Azure Static Web Apps
```bash
# Build
npm run build

# Deploy via Azure CLI or GitHub Actions
```

### Option 2: Self-Hosted Web Server

#### Apache
```bash
# 1. Build application
npm run build

# 2. Copy to Apache web root
sudo cp -r dist/* /var/www/html/grc-suite/

# 3. Configure Apache
sudo nano /etc/apache2/sites-available/grc-suite.conf
```

Apache config:
```apache
<VirtualHost *:80>
    ServerName grc.yourdomain.com
    DocumentRoot /var/www/html/grc-suite
    
    <Directory /var/www/html/grc-suite>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

#### Nginx
```bash
# 1. Build application
npm run build

# 2. Copy to Nginx web root
sudo cp -r dist/* /usr/share/nginx/html/grc-suite/

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/grc-suite
```

Nginx config:
```nginx
server {
    listen 80;
    server_name grc.yourdomain.com;
    root /usr/share/nginx/html/grc-suite;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Option 3: Docker Container

#### Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Create nginx.conf
```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build and Run Docker Image
```bash
# Build image
docker build -t grc-suite:latest .

# Run container
docker run -d -p 8080:80 --name grc-suite grc-suite:latest

# With volume for data persistence
docker run -d -p 8080:80 \
  -v grc-data:/usr/share/nginx/html/data \
  --name grc-suite grc-suite:latest

# Access at http://localhost:8080
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  grc-suite:
    build: .
    ports:
      - "8080:80"
    volumes:
      - grc-data:/usr/share/nginx/html/data
    restart: unless-stopped
    environment:
      - TZ=UTC

volumes:
  grc-data:
```

Run with:
```bash
docker-compose up -d
```

### Option 4: Linux Portable Executable (Future)

For true portable Linux binary, you would need to:
1. Use Electron or Tauri to wrap the application
2. Bundle with system dependencies
3. Create self-extracting archive

Example with Tauri:
```bash
# Install Tauri CLI
npm install -g @tauri-apps/cli

# Build for Linux
npm run tauri build

# Output: src-tauri/target/release/bundle/
```

## 🔧 Configuration

### Environment Variables
Create `.env` file for customization:

```env
# Application Settings
VITE_APP_NAME="GRC Suite"
VITE_APP_VERSION="1.0.0"

# Default Admin Credentials (change these!)
VITE_DEFAULT_ADMIN_USER="admin"
VITE_DEFAULT_ADMIN_PASS="admin123"

# Storage Settings
VITE_STORAGE_NAME="GRC_Suite"
VITE_STORAGE_VERSION="1"

# Optional: Default AI Provider
VITE_AI_PROVIDER="openai"
```

### Customizing Templates
Edit `/lib/templates.ts` to add or modify:
- Compliance frameworks
- Vendor questionnaires
- Default settings

### Branding
Update in application Settings or edit `/lib/db.ts`:
```typescript
const defaultSettings: Settings = {
  id: 'settings-001',
  companyName: 'Your Company Name',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
};
```

## 🔐 Security Considerations

### Production Deployment
1. **HTTPS**: Always use HTTPS in production
2. **Headers**: Set security headers
3. **CSP**: Configure Content Security Policy
4. **Authentication**: Change default admin password immediately

### Recommended Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### Content Security Policy
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.anthropic.com" always;
```

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Use production build
npm run build

# Enable compression on server
```

### Browser Caching
Configure server to cache static assets:
- JS/CSS: 1 year
- Images: 1 year
- HTML: No cache

### Service Worker (PWA)
The app can be enhanced with service worker for:
- Offline functionality
- Background sync
- Push notifications

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use
```bash
# Change port in vite.config.ts
export default defineConfig({
  server: {
    port: 3000 // Change this
  }
})
```

### Memory Issues
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## 📱 Mobile & Tablet Access

The application is responsive and works on:
- Desktop browsers
- Tablets (iPad, Android tablets)
- Mobile phones (iOS, Android)

### Progressive Web App (PWA)
Add to home screen for app-like experience:
1. Open in mobile browser
2. Tap "Add to Home Screen"
3. Launch like native app

## 🔄 Updates & Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild
npm install
npm run build

# Redeploy
```

### Database Migrations
Data is stored in browser's IndexedDB. To migrate:
1. Export data from old version
2. Update application
3. Import data if needed

### Backup Procedures
Users should regularly:
1. Export compliance data to CSV
2. Export VAPT reports to PDF
3. Save vendor assessments
4. Backup browser storage if possible

## 💾 System Requirements

### Server Requirements (if self-hosting)
- **OS**: Linux, Windows, macOS
- **Web Server**: Apache 2.4+, Nginx 1.18+, or any static server
- **Disk Space**: ~50MB for application
- **Memory**: Minimal (static files only)

### Client Requirements (Browser)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Storage**: 50-100MB IndexedDB quota
- **JavaScript**: Must be enabled
- **Cookies**: Session cookies for auth

## 📞 Support

### Common Issues

1. **Data not saving**: Check browser storage settings
2. **Slow performance**: Clear browser cache
3. **Export not working**: Enable pop-ups
4. **AI not responding**: Check API key and internet

### Getting Help
- Check README.md for user guide
- Review browser console for errors
- Test in different browser if issues persist

## 🎯 Next Steps

After installation:
1. ✅ Access application
2. ✅ Login with default credentials
3. ✅ Change admin password
4. ✅ Configure settings
5. ✅ Load compliance frameworks
6. ✅ Create users
7. ✅ Start using!

---

**Ready to deploy? Follow the option that best fits your needs!**

*Questions? Issues? Check the README.md for detailed usage guide.*

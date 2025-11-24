# GRC Suite - Deployment Guide

## 📦 Package Contents

```
grc-suite/
├── grc-suite                 # Linux executable
├── Dockerfile               # Docker build file
├── docker-compose.yml       # Docker Compose configuration
├── package.json            # Node.js dependencies
├── templates/              # Compliance templates
│   ├── iso27001.json
│   ├── iso27017.json
│   ├── iso27018.json
│   ├── rbi-it.json
│   └── vapt-template.json
├── config/                 # Configuration files
│   └── default.json
├── data/                   # Data directory (auto-created)
├── backups/                # Backup directory (auto-created)
├── logs/                   # Log directory (auto-created)
├── DEPLOYMENT.md           # This file
├── README.md               # Quick start guide
└── SOP.pdf                 # Complete user manual

```

## 🚀 Deployment Options

### Option 1: Portable Linux Binary (Recommended for Quick Start)

#### System Requirements
- **OS:** Linux (Ubuntu 20.04+, Debian 10+, RHEL 8+, or any modern Linux)
- **RAM:** 2 GB minimum, 4 GB recommended
- **Disk:** 500 MB minimum, 2 GB recommended
- **Ports:** 8080 (default, configurable)

#### Installation Steps

```bash
# 1. Extract the package
unzip grc-suite.zip
cd grc-suite

# 2. Make executable
chmod +x grc-suite

# 3. Run the application
./grc-suite

# 4. Access in browser
# Open: http://localhost:8080
# Default credentials: admin / admin (CHANGE IMMEDIATELY)
```

#### Custom Port

```bash
# Run on port 9000
./grc-suite --port 9000
```

#### Background Execution

```bash
# Run in background
nohup ./grc-suite > logs/app.log 2>&1 &

# View logs
tail -f logs/app.log

# Stop application
pkill grc-suite
```

#### Systemd Service (Auto-start on boot)

```bash
# Create service file
sudo nano /etc/systemd/system/grc-suite.service
```

```ini
[Unit]
Description=GRC Suite Application
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/grc-suite
ExecStart=/path/to/grc-suite/grc-suite
Restart=always
RestartSec=10
StandardOutput=append:/path/to/grc-suite/logs/app.log
StandardError=append:/path/to/grc-suite/logs/error.log

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable grc-suite
sudo systemctl start grc-suite

# Check status
sudo systemctl status grc-suite

# View logs
sudo journalctl -u grc-suite -f
```

---

### Option 2: Docker Deployment (Recommended for Production)

#### Prerequisites
- Docker 20.10+ installed
- Docker Compose 2.0+ installed (optional but recommended)

#### Quick Start with Docker

```bash
# Build the image
docker build -t grc-suite:latest .

# Run container
docker run -d \
  --name grc-suite \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/backups:/app/backups \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  grc-suite:latest

# Check status
docker ps

# View logs
docker logs -f grc-suite

# Access application
# Open: http://localhost:8080
```

#### Docker Compose (Recommended)

```bash
# Start application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Update to new version
docker-compose pull
docker-compose up -d
```

#### Offline Docker Deployment

```bash
# On machine with internet:
# Build and save image
docker build -t grc-suite:latest .
docker save grc-suite:latest > grc-suite.tar
gzip grc-suite.tar

# Transfer grc-suite.tar.gz to offline machine

# On offline machine:
gunzip grc-suite.tar.gz
docker load < grc-suite.tar

# Run the container
docker run -d \
  --name grc-suite \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/backups:/app/backups \
  --restart unless-stopped \
  grc-suite:latest
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the application directory:

```bash
# Application
PORT=8080
NODE_ENV=production

# Database
DB_TYPE=sqlite
DB_PATH=./data/grc.db

# Backups
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30

# Security
SESSION_TIMEOUT=30  # minutes
JWT_SECRET=change-this-secret-key

# AI Integration (Optional)
AI_PROVIDER=none  # none, openai, anthropic, local
AI_API_KEY=
AI_MODEL=gpt-4
AI_ENDPOINT=  # For local LLM

# Email Notifications (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### Configuration File

Edit `config/default.json`:

```json
{
  "app": {
    "name": "GRC Suite",
    "version": "1.0.0",
    "port": 8080
  },
  "database": {
    "type": "sqlite",
    "path": "./data/grc.db"
  },
  "security": {
    "sessionTimeout": 30,
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSpecialChars": true
    },
    "twoFactorAuth": false
  },
  "features": {
    "bulkUpload": true,
    "aiAssistance": false,
    "multiCompany": false,
    "emailNotifications": false
  }
}
```

---

## 🔒 Security

### Initial Setup

1. **Change Default Password**
   ```
   Login: admin / admin
   Navigate to: Settings → Security
   Change admin password immediately
   ```

2. **Create Users**
   ```
   Navigate to: User Management
   Create individual user accounts
   Assign appropriate roles
   Delete or disable default admin account (after creating new admin)
   ```

3. **Configure RBAC**
   ```
   Navigate to: User Management → Roles & Permissions
   Review and adjust permissions for each role
   Follow principle of least privilege
   ```

### SSL/TLS (HTTPS)

#### Using Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/grc-suite
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/grc-suite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate (using Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Block direct access to application port (if using reverse proxy)
sudo ufw deny 8080/tcp
```

---

## 💾 Backup & Recovery

### Automatic Backups

Backups are created automatically if enabled in configuration:

```bash
# Backup location
./backups/

# Backup naming
grc-backup-YYYYMMDD-HHMMSS.tar.gz
```

### Manual Backup

```bash
# Stop application
sudo systemctl stop grc-suite  # or: docker stop grc-suite

# Create backup
tar -czf backups/manual-backup-$(date +%Y%m%d).tar.gz data/

# Restart application
sudo systemctl start grc-suite  # or: docker start grc-suite
```

### Restore from Backup

```bash
# Stop application
sudo systemctl stop grc-suite

# Backup current data
mv data data.old

# Extract backup
tar -xzf backups/grc-backup-20251121.tar.gz

# Restart application
sudo systemctl start grc-suite

# Verify restoration
# Check application logs and test functionality
```

### Offsite Backup

```bash
# Sync backups to remote server
rsync -avz --delete ./backups/ user@remote-server:/path/to/backups/

# Or use cloud storage
# aws s3 sync ./backups/ s3://your-bucket/grc-backups/
# rclone sync ./backups/ remote:grc-backups/
```

---

## 📊 Monitoring

### Health Check

```bash
# Check application health
curl http://localhost:8080/health

# Expected response:
# {"status":"healthy","version":"1.0.0","uptime":3600}
```

### Log Monitoring

```bash
# View real-time logs
tail -f logs/app.log

# Search for errors
grep ERROR logs/app.log

# View last 100 lines
tail -n 100 logs/app.log

# Log rotation (configure in /etc/logrotate.d/grc-suite)
```

### Performance Monitoring

```bash
# Check resource usage (Binary)
ps aux | grep grc-suite

# Check resource usage (Docker)
docker stats grc-suite

# Database size
du -sh data/grc.db

# Disk space
df -h
```

---

## 🔄 Updates

### Update Portable Binary

```bash
# Stop application
sudo systemctl stop grc-suite

# Backup data
tar -czf backups/pre-update-$(date +%Y%m%d).tar.gz data/

# Replace binary
chmod +x grc-suite-new
mv grc-suite grc-suite-old
mv grc-suite-new grc-suite

# Start application
sudo systemctl start grc-suite

# Verify
curl http://localhost:8080/health
```

### Update Docker Image

```bash
# Pull new image
docker pull grc-suite:latest

# Stop and remove old container
docker stop grc-suite
docker rm grc-suite

# Start new container (data persists in volumes)
docker run -d \
  --name grc-suite \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/backups:/app/backups \
  --restart unless-stopped \
  grc-suite:latest

# Or use docker-compose
docker-compose pull
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check if port is in use
sudo lsof -i :8080
sudo netstat -tlnp | grep 8080

# Kill process using port
sudo kill -9 <PID>

# Check permissions
ls -la grc-suite
chmod +x grc-suite

# Check logs
tail -f logs/app.log
```

### Database Issues

```bash
# Check database integrity
sqlite3 data/grc.db "PRAGMA integrity_check;"

# Restore from backup
cp data/grc.db data/grc.db.broken
cp backups/latest/grc.db data/grc.db

# Reset database (DANGER: All data lost)
rm data/grc.db
# Application will create fresh database on next start
```

### Docker Issues

```bash
# View container logs
docker logs -f grc-suite

# Access container shell
docker exec -it grc-suite sh

# Check volumes
docker volume ls
docker volume inspect <volume-name>

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Performance Issues

```bash
# Check disk space
df -h

# Check memory
free -h

# Check database size
du -sh data/

# Vacuum database (reduce size)
sqlite3 data/grc.db "VACUUM;"

# Clear old logs
find logs/ -name "*.log" -mtime +30 -delete
```

---

## 📝 Maintenance

### Regular Maintenance Tasks

#### Daily
- [ ] Check application is running
- [ ] Monitor disk space
- [ ] Review error logs

#### Weekly
- [ ] Review backup success
- [ ] Check database size
- [ ] Review user activity logs

#### Monthly
- [ ] Test backup restoration
- [ ] Review security logs
- [ ] Update application (if new version available)
- [ ] Clean old logs and backups
- [ ] Review and update user permissions

### Maintenance Commands

```bash
# Clean old logs (keep last 30 days)
find logs/ -name "*.log" -mtime +30 -delete

# Clean old backups (keep last 60 days)
find backups/ -name "*.tar.gz" -mtime +60 -delete

# Optimize database
sqlite3 data/grc.db "VACUUM; ANALYZE;"

# Check application version
curl http://localhost:8080/api/version
```

---

## 🌐 Network Configuration

### Internal Network Only

```bash
# Bind to localhost only (no external access)
./grc-suite --host 127.0.0.1 --port 8080
```

### Allow Specific IP Ranges

```bash
# Using firewall
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

### VPN Access

```bash
# Install WireGuard or OpenVPN
# Configure VPN server
# Connect clients through VPN to access GRC Suite
```

---

## 📞 Support

### Log Collection

```bash
# Collect logs for support
tar -czf grc-support-$(date +%Y%m%d).tar.gz \
  logs/ \
  config/default.json \
  docker-compose.yml \
  .env

# Sanitize sensitive information before sharing
```

### System Information

```bash
# Collect system info
uname -a > system-info.txt
free -h >> system-info.txt
df -h >> system-info.txt
docker version >> system-info.txt 2>&1
```

---

## 📚 Additional Resources

- **Complete SOP:** See `SOP.pdf` or in-app guide
- **API Documentation:** http://localhost:8080/api/docs
- **Templates:** `./templates/` directory
- **Configuration Examples:** `./config/` directory

---

**Version:** 1.0.0  
**Last Updated:** November 21, 2025  
**License:** Proprietary

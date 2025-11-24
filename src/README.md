# 🛡️ GRC Suite - Portable Edition

A comprehensive, offline-capable Governance, Risk, and Compliance (GRC) platform designed for Linux systems. Manage compliance, vendor risk, VAPT reporting, privacy, and more—all without requiring internet connectivity.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Platform](https://img.shields.io/badge/platform-Linux-green.svg)

## ✨ Features

### Core Modules
- **📊 GRC Dashboard** - Real-time compliance and risk metrics
- **👥 Vendor Risk Assessment** - Third-party security evaluation
- **🛡️ Compliance Manager** - ISO 27001/17/18, RBI, DL SAR frameworks
- **🐛 VAPT Reporting** - Professional vulnerability reports
- **🔒 Privacy & GDPR** - ROPA, DPIA, DSAR, Consent management

### Key Capabilities
- ✅ **100% Offline Operation** - No internet required
- ✅ **No-Code Control Panel** - Modify everything without coding
- ✅ **Bulk Operations** - Import/export thousands of records
- ✅ **AI Integration** - Optional AI assistance (OpenAI, Anthropic, Local LLM)
- ✅ **Professional Reports** - Branded PDF exports
- ✅ **RBAC** - Role-based access control
- ✅ **Multi-Company** - Support for multiple organizations
- ✅ **Portable** - Single binary or Docker deployment

## 🚀 Quick Start

### Option 1: Run the Binary

```bash
# Extract the package
unzip grc-suite.zip
cd grc-suite

# Make executable and run
chmod +x grc-suite
./grc-suite

# Access in browser
open http://localhost:8080
```

**Default credentials:** `admin` / `admin` (⚠️ Change immediately!)

### Option 2: Docker

```bash
# Using Docker Compose (Recommended)
docker-compose up -d

# Or using Docker directly
docker build -t grc-suite:latest .
docker run -d -p 8080:8080 -v $(pwd)/data:/app/data grc-suite:latest

# Access in browser
open http://localhost:8080
```

## 📦 What's Included

```
grc-suite/
├── grc-suite              # Linux executable
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── templates/             # Compliance frameworks
│   ├── iso27001.json     # ISO 27001 controls (167)
│   ├── iso27017.json     # ISO 27017 controls (112)
│   ├── iso27018.json     # ISO 27018 controls (95)
│   ├── rbi-it.json       # RBI IT Outsourcing (78)
│   └── vapt-template.json # VAPT report template
├── data/                  # Application data (auto-created)
├── backups/               # Automatic backups
├── logs/                  # Application logs
├── config/                # Configuration files
├── DEPLOYMENT.md          # Detailed deployment guide
├── README.md              # This file
└── SOP.pdf               # Complete user manual
```

## 🎯 Use Cases

### Compliance Teams
- Track ISO 27001/27017/27018 implementation
- Manage RBI IT Outsourcing compliance
- Generate audit-ready reports
- Bulk import controls from Excel

### Security Teams
- Create professional VAPT reports
- Track vulnerability remediation
- Risk scoring and analysis
- Evidence management

### Privacy Officers
- Maintain ROPA (Records of Processing Activities)
- Conduct DPIAs (Data Privacy Impact Assessments)
- Track DSAR (Data Subject Access Requests)
- Manage consent records

### Vendor Management
- Assess third-party security posture
- Create custom questionnaires
- Generate public submission forms
- Track vendor risk over time

## 🎨 Control Panel Features

**No coding required!** The built-in Control Panel allows you to:

- ✅ Enable/disable features with toggle switches
- ✅ Add custom features and modules
- ✅ Import/export templates (JSON, Excel)
- ✅ Configure AI integration
- ✅ Customize branding and theming
- ✅ Manage database and backups
- ✅ Configure security settings

Access: **Control Panel** in the main navigation menu

## 📤 Bulk Upload

Import hundreds or thousands of records at once:

1. Navigate to **Bulk Upload** module
2. Select upload type (Controls, Vendors, Findings, Users, etc.)
3. Download the Excel/CSV template
4. Fill in your data
5. Upload and review results

Supported formats: Excel (`.xlsx`, `.xls`), CSV (`.csv`), JSON (`.json`)

## 🤖 AI Integration (Optional)

Enable AI for automated report generation and insights:

### Supported Providers
- **OpenAI** (GPT-4, GPT-3.5 Turbo) - Requires internet
- **Anthropic** (Claude 3 Opus, Sonnet) - Requires internet  
- **Local LLM** (Ollama: llama2, mistral, etc.) - 100% offline

### Setup
1. Navigate to **Settings → Integrations**
2. Select AI provider
3. Enter API key (or configure local LLM endpoint)
4. Choose model
5. Save settings

AI will assist with:
- VAPT remediation recommendations
- Compliance control guidance
- Executive summary generation
- Risk analysis

## 🔐 Security

- **Encrypted Storage** - All sensitive data encrypted at rest
- **RBAC** - Granular role-based access control
- **Audit Logs** - Complete activity logging
- **Session Management** - Configurable timeouts
- **2FA Support** - Two-factor authentication (optional)
- **Password Policies** - Enforced strong passwords

## 💾 Backup & Recovery

### Automatic Backups
- Daily backups at 2:00 AM (configurable)
- Stored in `./backups/` directory
- 30-day retention (configurable)

### Manual Backup
```bash
# Create backup
tar -czf backups/manual-$(date +%Y%m%d).tar.gz data/

# Restore from backup
tar -xzf backups/grc-backup-20251121.tar.gz
```

## 📊 System Requirements

### Minimum
- **OS:** Linux (Ubuntu 20.04+, Debian 10+, RHEL 8+)
- **RAM:** 2 GB
- **Disk:** 500 MB
- **CPU:** 1 core

### Recommended
- **OS:** Linux (Latest LTS)
- **RAM:** 4 GB
- **Disk:** 2 GB (SSD preferred)
- **CPU:** 2+ cores

## 🌐 Network Options

### Localhost Only (Most Secure)
```bash
./grc-suite --host 127.0.0.1
```

### LAN Access
```bash
./grc-suite --host 0.0.0.0
# Access from network: http://your-ip:8080
```

### With SSL (via Nginx)
See `DEPLOYMENT.md` for SSL configuration guide

## 📖 Documentation

- **In-App SOP:** Navigate to **User Guide (SOP)** in the menu
- **Deployment Guide:** See `DEPLOYMENT.md`
- **Complete Manual:** See `SOP.pdf`
- **API Documentation:** http://localhost:8080/api/docs

## 🔄 Updates

### Update Binary
```bash
# Backup data
tar -czf backups/pre-update.tar.gz data/

# Replace binary
chmod +x grc-suite-new
mv grc-suite grc-suite-old
mv grc-suite-new grc-suite

# Restart
./grc-suite
```

### Update Docker
```bash
docker-compose pull
docker-compose up -d
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 8080
sudo lsof -i :8080

# Run on different port
./grc-suite --port 9000
```

### Application Won't Start
```bash
# Check logs
tail -f logs/app.log

# Check permissions
chmod +x grc-suite

# Check disk space
df -h
```

### Bulk Upload Fails
- ✅ Use the downloaded template
- ✅ Remove empty rows at end of Excel file
- ✅ Verify date format (YYYY-MM-DD)
- ✅ Check all required fields are filled
- ✅ Ensure file size < 10MB

See `DEPLOYMENT.md` for complete troubleshooting guide.

## 🛠️ Configuration

### Environment Variables
Create `.env` file:
```env
PORT=8080
DB_PATH=./data/grc.db
BACKUP_ENABLED=true
AI_PROVIDER=none
LOG_LEVEL=info
```

### Configuration File
Edit `config/default.json`:
```json
{
  "app": {
    "port": 8080
  },
  "database": {
    "type": "sqlite",
    "path": "./data/grc.db"
  },
  "features": {
    "bulkUpload": true,
    "aiAssistance": false,
    "multiCompany": false
  }
}
```

## 📝 Available Templates

Pre-loaded compliance frameworks:

| Framework | Controls | Description |
|-----------|----------|-------------|
| **ISO 27001** | 167 | Information Security Management |
| **ISO 27017** | 112 | Cloud Security |
| **ISO 27018** | 95 | Cloud Privacy |
| **RBI IT Outsourcing** | 78 | Reserve Bank of India Guidelines |
| **DL SAR & IT RA** | 45 | Digital Lending Security Assessment |

All templates support:
- ✅ Bulk import/export
- ✅ Custom fields
- ✅ Evidence attachments
- ✅ PDF/Excel reports

## 🔧 Maintenance

### Daily
```bash
# Check application status
curl http://localhost:8080/health
```

### Weekly
```bash
# Check disk space
df -h

# Review logs
tail -n 100 logs/app.log | grep ERROR
```

### Monthly
```bash
# Test backup restoration
# Clean old logs
find logs/ -mtime +30 -delete

# Optimize database
sqlite3 data/grc.db "VACUUM; ANALYZE;"
```

## 🎓 Training Resources

### Getting Started (15 mins)
1. Watch in-app tutorial
2. Import sample data
3. Create your first control
4. Generate a report

### Control Panel Training (30 mins)
1. Feature management
2. Template import
3. Bulk upload workflow
4. Settings configuration

### Complete Course (2 hours)
- All modules walkthrough
- Best practices
- Advanced configurations
- Integration setup

Access training: **User Guide (SOP)** → Video Tutorials

## 📞 Support

### Self-Help
1. Check **User Guide (SOP)** in the app
2. Review `DEPLOYMENT.md`
3. Search logs: `grep ERROR logs/app.log`

### Log Collection
```bash
# Create support package
tar -czf support-$(date +%Y%m%d).tar.gz \
  logs/ \
  config/ \
  docker-compose.yml
```

## 🚦 Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Online | Application running normally |
| 🟡 Warning | Minor issues detected |
| 🔴 Offline | Application stopped |
| 🔵 Maintenance | Maintenance mode active |

## 📊 Performance Tips

- ✅ Use SSD for data directory
- ✅ Regularly vacuum database (monthly)
- ✅ Enable automatic backups
- ✅ Monitor disk space (keep 20% free)
- ✅ Clean old logs (keep 30 days)
- ✅ Use bulk upload for >50 records
- ✅ Enable compression for backups

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Mobile-responsive design
- [ ] Additional compliance frameworks (SOC 2, NIST)
- [ ] Advanced reporting engine
- [ ] API integrations

### Version 1.2 (Planned)
- [ ] Workflow automation
- [ ] Custom dashboards
- [ ] Advanced analytics
- [ ] Multi-language support

## 📄 License

Proprietary. See LICENSE file for details.

## 🙏 Credits

Built with:
- React + TypeScript
- Tailwind CSS
- Recharts
- SQLite
- Node.js

## 📞 Contact

For enterprise support and customization:
- Email: support@grcsuite.com
- Documentation: https://docs.grcsuite.com

---

**Version:** 1.0.0  
**Release Date:** November 21, 2025  
**Build:** Production

🛡️ **Keep Your Organization Secure and Compliant**

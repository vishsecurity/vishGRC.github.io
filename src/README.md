# GRC Suite - Offline-Capable Governance, Risk & Compliance Platform

## 🚀 Overview

A comprehensive, browser-based GRC platform that runs 100% offline with no server required. Built with React, TypeScript, and IndexedDB for complete data privacy and portability.

## ✨ Features

### Core Modules

1. **Dashboard**
   - Real-time metrics and KPIs
   - Compliance rate visualization
   - Risk assessment overview
   - Quick actions and insights

2. **User Management**
   - Role-based access control (RBAC)
   - Four user roles: Admin, Auditor, Analyst, Viewer
   - Granular permissions per module (Read/Write/Execute)
   - User activity tracking

3. **Vendor Risk Assessment**
   - Custom security questionnaires
   - Automated risk scoring
   - Vendor status tracking (Pending/In Review/Approved/Rejected)
   - Public submission links
   - CSV/Excel export

4. **Compliance Management**
   - Pre-loaded frameworks:
     - ISO 27001:2022
     - ISO 27017:2015
     - ISO 27018:2019
     - RBI IT Outsourcing
     - DPDP Act - SAR & IT RA
   - Bulk load/delete controls
   - Status tracking (Compliant/Partial/Non-Compliant/Not Applicable)
   - Evidence and notes management
   - AI-powered compliance summaries
   - PDF and Excel export

5. **VAPT (Vulnerability Assessment & Penetration Testing) Reporting**
   - Professional vulnerability reports
   - Severity classification (Critical/High/Medium/Low/Info)
   - CVSS scoring
   - Detailed findings with evidence
   - AI-generated remediation steps
   - Executive summary generation
   - PDF export with branding

6. **Privacy Management**
   - **ROPA** (Records of Processing Activities)
   - **PII Inventory** (Personal Information tracking)
   - **DPIA** (Data Protection Impact Assessments)
   - **Consent Management** (Consent tracking)
   - **DSAR** (Data Subject Access Requests)
   - Multi-company support

7. **AI Integration**
   - OpenAI (GPT-4) support
   - Anthropic (Claude) support
   - Local AI support (Ollama/LM Studio)
   - Features:
     - Generate compliance summaries
     - Write remediation steps
     - Create VAPT executive summaries
     - Enhance risk descriptions

8. **Brand Customization**
   - Upload client and auditor logos
   - Custom primary and secondary colors
   - Company name configuration
   - Branded PDF exports

## 🔧 Technical Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4.0
- **Storage**: IndexedDB (Browser Local Storage)
- **Offline**: Service Workers (Progressive Web App capable)
- **Export**: PDF (via browser print), CSV/Excel

### Data Storage
- All data stored in browser's IndexedDB
- No server required
- Completely offline-capable
- Data persists across sessions
- Multi-company support

## 🏃 Getting Started

### Default Login Credentials
```
Username: admin
Password: admin123
```

### First Time Setup

1. **Login** with default credentials
2. **Configure Settings**:
   - Navigate to Settings
   - Add your company name
   - Upload logos (optional)
   - Configure AI provider (optional)
   - Set brand colors (optional)

3. **Create Users**:
   - Go to User Management
   - Add team members with appropriate roles
   - Configure permissions per user

4. **Load Compliance Frameworks**:
   - Navigate to Compliance
   - Click "Load Framework"
   - Select desired framework(s)
   - Start updating control status

5. **Start Assessments**:
   - Create vendor assessments
   - Generate VAPT reports
   - Track privacy records

## 📖 User Guide

### User Roles & Permissions

| Role | Description | Default Permissions |
|------|-------------|---------------------|
| **Admin** | Full system access | All modules: Read/Write/Execute |
| **Auditor** | Compliance and assessment focus | All modules: Read/Write |
| **Analyst** | Data analysis and reporting | All modules: Read, Limited Write |
| **Viewer** | Read-only access | All modules: Read only |

### Vendor Risk Assessment Workflow

1. **Create Assessment**: Click "New Assessment"
2. **Fill Questionnaire**: Complete security questions
3. **Submit**: System auto-calculates risk score
4. **Review**: Change status based on assessment
5. **Export**: Generate report for stakeholders

### Compliance Management Workflow

1. **Load Framework**: Select ISO 27001, ISO 27017, etc.
2. **Update Status**: Mark controls as Compliant/Partial/Non-Compliant
3. **Add Evidence**: Document proof of compliance
4. **Generate Report**: Export PDF with compliance status
5. **AI Summary**: Generate executive summary

### VAPT Reporting Workflow

1. **Create Report**: New VAPT Report
2. **Add Findings**: Document vulnerabilities
3. **Set Severity**: Classify each finding
4. **Add Evidence**: Include proof of concept
5. **Generate Remediation**: Use AI or manual entry
6. **Export PDF**: Professional branded report

### Privacy Management Workflow

1. **Select Module**: ROPA, PII, DPIA, Consent, or DSAR
2. **Add Record**: Fill required fields
3. **Track Status**: Monitor compliance
4. **Export Data**: Generate reports as needed

## 🤖 AI Integration Setup

### OpenAI Configuration
1. Go to Settings → AI Integration
2. Select "OpenAI (GPT-4)"
3. Enter API key from [platform.openai.com](https://platform.openai.com)
4. Save settings
5. Use AI features in Compliance and VAPT modules

### Anthropic Configuration
1. Go to Settings → AI Integration
2. Select "Anthropic (Claude)"
3. Enter API key from [console.anthropic.com](https://console.anthropic.com)
4. Save settings

### Local AI Configuration
1. Install [Ollama](https://ollama.ai) or [LM Studio](https://lmstudio.ai)
2. Run a local model
3. Select "Local AI" in Settings
4. Configure endpoint if needed

## 📤 Export & Reporting

### PDF Export
- **VAPT Reports**: Full professional reports with branding
- **Compliance Reports**: Framework assessment with statistics
- **Custom Branding**: Includes uploaded logos and colors

### CSV/Excel Export
- **Vendor List**: All vendor assessments
- **Compliance Controls**: Detailed control status
- **Any Data Table**: Export for external analysis

## 🔒 Security & Privacy

### Data Privacy
- **100% Local Storage**: No data sent to external servers
- **Offline First**: Works without internet
- **Browser Isolation**: Data stays in your browser
- **No Tracking**: Zero analytics or telemetry

### Backup & Migration
To backup your data:
1. Use browser's export functionality
2. Save IndexedDB data via DevTools
3. Export individual modules to CSV

### Multi-Device
- Data is device-specific
- Not synced across devices (by design)
- Export/import for data transfer

## 🚢 Deployment Options

### Option 1: Static File Hosting
1. Build the application: `npm run build`
2. Deploy `dist/` folder to any web server
3. Access via browser
4. Works offline after first load

### Option 2: Local File System
1. Build the application
2. Open `index.html` directly in browser
3. May have CORS limitations

### Option 3: Docker (Future Enhancement)
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

### Option 4: Electron/Tauri (Future Enhancement)
- Package as desktop application
- Native file system access
- Better offline experience

## 📋 Pre-loaded Templates

### Compliance Frameworks
- **ISO 27001:2022**: 10 key controls
- **ISO 27017:2015**: 5 cloud security controls
- **ISO 27018:2019**: 5 privacy controls
- **RBI IT Outsourcing**: 7 outsourcing controls
- **DPDP Act SAR**: 5 subject access controls
- **DPDP Act IT RA**: 5 risk assessment controls

### Vendor Questionnaire
- Company Information (3 questions)
- Information Security (4 questions)
- Data Privacy (3 questions)
- Business Continuity (3 questions)

## 🛠️ Troubleshooting

### Data Not Persisting
- Check browser storage settings
- Ensure IndexedDB is enabled
- Clear cache if corrupted

### AI Not Working
- Verify API key is correct
- Check internet connection (for cloud AI)
- Ensure sufficient API credits

### Export Issues
- Enable pop-ups for PDF export
- Check browser print settings
- Try different browser if issues persist

## 📞 Support & Contribution

### Known Limitations
- No multi-device sync (by design)
- Browser storage limits (~50MB typical)
- PDF export requires modern browser
- AI requires internet (except local AI)

### Future Enhancements
- Real backend integration option
- Advanced reporting templates
- Workflow automation
- Email notifications
- Document management
- Risk register
- Incident management

## 📄 License

This is a demonstration GRC platform. Customize and extend as needed for your organization.

## 🎯 Best Practices

1. **Regular Exports**: Export data regularly as backup
2. **User Training**: Train team on RBAC and workflows
3. **Framework Updates**: Keep compliance templates current
4. **AI Usage**: Review AI-generated content before use
5. **Brand Consistency**: Set logos and colors early
6. **Access Control**: Use principle of least privilege

## 🔄 Updates & Maintenance

### Version History
- **v1.0.0**: Initial release with core modules

### Updating Templates
To add new compliance frameworks:
1. Edit `/lib/templates.ts`
2. Add framework controls
3. Reload application

### Customization
All components are in `/components/`
Styling in `/styles/globals.css`
Database schema in `/lib/db.ts`

---

**Built with ❤️ for GRC professionals**

*Offline-first • Privacy-focused • Zero dependencies*

import { useState } from 'react';
import { BookOpen, Download, Play, Settings, Upload, Users, Shield, Bug, Lock, Database, Code, Terminal } from 'lucide-react';

export function SOPViewer() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Overview & Quick Start', icon: Play },
    { id: 'installation', name: 'Installation Guide', icon: Terminal },
    { id: 'docker', name: 'Docker Deployment', icon: Database },
    { id: 'control-panel', name: 'Using Control Panel', icon: Settings },
    { id: 'bulk-upload', name: 'Bulk Upload Guide', icon: Upload },
    { id: 'modules', name: 'Module Documentation', icon: Shield },
    { id: 'ai-integration', name: 'AI Integration', icon: Code },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: Bug },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'installation':
        return <InstallationSection />;
      case 'docker':
        return <DockerSection />;
      case 'control-panel':
        return <ControlPanelSection />;
      case 'bulk-upload':
        return <BulkUploadSection />;
      case 'modules':
        return <ModulesSection />;
      case 'ai-integration':
        return <AIIntegrationSection />;
      case 'troubleshooting':
        return <TroubleshootingSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-3">
          <BookOpen className="w-12 h-12" />
          <div>
            <h2 className="text-3xl mb-1">Standard Operating Procedures</h2>
            <p className="text-indigo-100">Complete user guide and documentation</p>
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download Complete SOP (PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden sticky top-6">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-slate-900">Table of Contents</h3>
            </div>
            <nav className="p-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2 className="text-slate-900 mb-4">GRC Suite - Portable Edition</h2>
      <p className="text-slate-700 mb-6">
        Welcome to the GRC Suite, a comprehensive Governance, Risk, and Compliance platform designed to run entirely offline 
        on Linux systems. This tool provides enterprise-grade GRC capabilities with zero internet dependency.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="text-blue-900 mb-3">🎯 Key Features</h3>
        <ul className="space-y-2 text-blue-800">
          <li><strong>100% Offline Capable</strong> - Works without internet connection</li>
          <li><strong>Portable Execution</strong> - Single binary or Docker deployment</li>
          <li><strong>No-Code Control Panel</strong> - Modify everything without coding</li>
          <li><strong>Bulk Operations</strong> - Import/export thousands of records at once</li>
          <li><strong>Multi-Module</strong> - GRC, Vendor Risk, VAPT, Privacy, Compliance</li>
          <li><strong>AI Integration</strong> - Optional AI assistance for reports</li>
          <li><strong>Professional Exports</strong> - Generate branded PDF reports</li>
        </ul>
      </div>

      <h3 className="text-slate-900 mb-3">🚀 Quick Start (3 Steps)</h3>
      <div className="space-y-4 mb-6">
        <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">1</div>
          <div>
            <h4 className="text-slate-900 mb-1">Download & Extract</h4>
            <p className="text-slate-600 text-sm">Extract the grc-suite.zip file to your preferred directory</p>
          </div>
        </div>
        <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">2</div>
          <div>
            <h4 className="text-slate-900 mb-1">Run the Application</h4>
            <p className="text-slate-600 text-sm">Execute: <code className="bg-slate-200 px-2 py-1 rounded">./grc-suite</code> or use Docker</p>
          </div>
        </div>
        <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">3</div>
          <div>
            <h4 className="text-slate-900 mb-1">Access the Dashboard</h4>
            <p className="text-slate-600 text-sm">Open browser to: <code className="bg-slate-200 px-2 py-1 rounded">http://localhost:8080</code></p>
          </div>
        </div>
      </div>

      <h3 className="text-slate-900 mb-3">📦 What's Included</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">✓ Application Files</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• grc-suite (executable)</li>
            <li>• Dockerfile</li>
            <li>• docker-compose.yml</li>
            <li>• Configuration files</li>
          </ul>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">✓ Templates</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• ISO 27001/17/18 checklists</li>
            <li>• RBI IT Outsourcing</li>
            <li>• VAPT report templates</li>
            <li>• Bulk upload templates</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="text-yellow-900 mb-2">⚠️ Important Notes</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Default credentials: admin / admin (change immediately)</li>
          <li>• Data stored in: ./data/grc directory</li>
          <li>• Backups created in: ./backups directory</li>
          <li>• Logs available in: ./logs directory</li>
        </ul>
      </div>
    </div>
  );
}

function InstallationSection() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2 className="text-slate-900 mb-4">Installation Guide</h2>

      <h3 className="text-slate-900 mb-3">Option A: Portable Linux Binary</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm overflow-x-auto">
{`# 1. Make the binary executable
chmod +x grc-suite

# 2. Create data directories (auto-created if not exists)
mkdir -p ./data/grc ./backups ./logs

# 3. Run the application
./grc-suite

# 4. Access in browser
# Open: http://localhost:8080

# 5. Run on custom port
./grc-suite --port 9000

# 6. Run in background
nohup ./grc-suite > logs/app.log 2>&1 &`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">System Requirements</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="text-slate-800 mb-2">Minimum</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• Linux (Ubuntu 20.04+, Debian 10+, RHEL 8+)</li>
            <li>• 2 GB RAM</li>
            <li>• 500 MB disk space</li>
            <li>• Port 8080 available</li>
          </ul>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="text-slate-800 mb-2">Recommended</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• Linux (Latest LTS)</li>
            <li>• 4 GB RAM</li>
            <li>• 2 GB disk space</li>
            <li>• SSD storage</li>
          </ul>
        </div>
      </div>

      <h3 className="text-slate-900 mb-3">Verification</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm">
{`# Check if application is running
curl http://localhost:8080/health

# Expected response:
# {"status": "healthy", "version": "1.0.0"}

# View logs
tail -f logs/app.log`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">Startup Script</h3>
      <p className="text-slate-700 mb-3">Create a systemd service for automatic startup:</p>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm overflow-x-auto">
{`# Create service file
sudo nano /etc/systemd/system/grc-suite.service

# Add the following content:
[Unit]
Description=GRC Suite Application
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/grc-suite
ExecStart=/path/to/grc-suite/grc-suite
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable grc-suite
sudo systemctl start grc-suite
sudo systemctl status grc-suite`}
        </pre>
      </div>
    </div>
  );
}

function DockerSection() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2 className="text-slate-900 mb-4">Docker Deployment</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <p className="text-blue-800 text-sm">
          Docker deployment provides complete isolation and simplified management. Perfect for production environments.
        </p>
      </div>

      <h3 className="text-slate-900 mb-3">Quick Start with Docker</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm overflow-x-auto">
{`# Build the Docker image
docker build -t grc-suite:latest .

# Run the container
docker run -d \\
  --name grc-suite \\
  -p 8080:8080 \\
  -v $(pwd)/data:/app/data \\
  -v $(pwd)/backups:/app/backups \\
  grc-suite:latest

# Access the application
# Open: http://localhost:8080`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">Docker Compose (Recommended)</h3>
      <p className="text-slate-700 mb-3">Use docker-compose.yml for easier management:</p>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm overflow-x-auto">
{`version: '3.8'

services:
  grc-suite:
    image: grc-suite:latest
    container_name: grc-suite
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
      - ./backups:/app/backups
      - ./logs:/app/logs
      - ./config:/app/config
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DB_PATH=/app/data/grc.db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">Dockerfile</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm overflow-x-auto">
{`FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Create directories
RUN mkdir -p /app/data /app/backups /app/logs /app/config

# Copy from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy templates and configs
COPY templates ./templates
COPY config ./config

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \\
  CMD node healthcheck.js || exit 1

CMD ["node", "dist/server.js"]`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">Offline Image Export/Import</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm">
{`# Save Docker image to file (for offline transfer)
docker save grc-suite:latest > grc-suite.tar

# Transfer grc-suite.tar to offline machine, then load:
docker load < grc-suite.tar

# Run on offline machine
docker run -d -p 8080:8080 --name grc-suite grc-suite:latest`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">Docker Management Commands</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl">
        <pre className="text-sm overflow-x-auto">
{`# View running containers
docker ps

# View logs
docker logs -f grc-suite

# Access container shell
docker exec -it grc-suite sh

# Restart container
docker restart grc-suite

# Stop and remove
docker stop grc-suite
docker rm grc-suite

# Backup data
docker exec grc-suite tar czf /app/backups/backup-$(date +%Y%m%d).tar.gz /app/data

# Update to new version
docker pull grc-suite:latest
docker-compose up -d`}
        </pre>
      </div>
    </div>
  );
}

function ControlPanelSection() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2 className="text-slate-900 mb-4">Control Panel Usage</h2>
      <p className="text-slate-700 mb-6">
        The Control Panel allows non-technical users to modify all aspects of the application without writing code.
      </p>

      <h3 className="text-slate-900 mb-3">Feature Management</h3>
      <div className="space-y-4 mb-6">
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">Enable/Disable Features</h4>
          <ol className="text-slate-600 text-sm space-y-1 ml-4">
            <li>1. Navigate to Control Panel → Feature Management</li>
            <li>2. Toggle the switch next to any feature to enable/disable</li>
            <li>3. Changes take effect immediately (no restart required)</li>
          </ol>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">Add Custom Features</h4>
          <ol className="text-slate-600 text-sm space-y-1 ml-4">
            <li>1. Click "Add New Feature" button</li>
            <li>2. Enter feature name and category</li>
            <li>3. Click "Add Feature" to save</li>
            <li>4. Feature appears in the list and can be toggled</li>
          </ol>
        </div>
      </div>

      <h3 className="text-slate-900 mb-3">Module Configuration</h3>
      <div className="p-4 bg-slate-50 rounded-lg mb-6">
        <p className="text-slate-700 mb-3">Configure settings for each module:</p>
        <ul className="text-slate-600 text-sm space-y-2">
          <li><strong>Dashboard:</strong> Enable/disable charts, auto-refresh, export options</li>
          <li><strong>Vendor Risk:</strong> Public form settings, auto-scoring, notifications</li>
          <li><strong>Compliance:</strong> Bulk operations, report formats</li>
          <li><strong>VAPT:</strong> AI suggestions, template customization</li>
          <li><strong>Privacy:</strong> DSAR automation, multi-company support</li>
        </ul>
      </div>

      <h3 className="text-slate-900 mb-3">Template Management</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm">
{`# Templates are stored in:
./templates/

# Folder structure:
templates/
├── compliance/
│   ├── iso27001.json
│   ├── iso27017.json
│   └── iso27018.json
├── vendor/
│   └── questionnaire.json
└── reports/
    └── vapt-template.json

# To add a new template:
# 1. Create JSON file in appropriate folder
# 2. Import via Control Panel → Templates → Import
# 3. Template appears in dropdown menus`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">Advanced Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">Database Config</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• Switch between SQLite/PostgreSQL/Supabase</li>
            <li>• Set custom data directory</li>
            <li>• Configure backup schedule</li>
          </ul>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">API Configuration</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• Select AI provider (OpenAI/Anthropic/Local)</li>
            <li>• Enter API keys securely</li>
            <li>• Choose AI model</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function BulkUploadSection() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2 className="text-slate-900 mb-4">Bulk Upload Guide</h2>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <p className="text-green-800">
          <strong>Bulk Upload</strong> allows you to import hundreds or thousands of records at once using Excel, CSV, or JSON files.
        </p>
      </div>

      <h3 className="text-slate-900 mb-3">Step-by-Step Process</h3>
      <div className="space-y-4 mb-6">
        {[
          { step: 1, title: 'Select Upload Type', desc: 'Choose what you want to upload (Controls, Vendors, Findings, etc.)' },
          { step: 2, title: 'Download Template', desc: 'Click "Download Template" to get pre-formatted file with correct headers' },
          { step: 3, title: 'Fill in Data', desc: 'Open template in Excel/CSV editor and add your data' },
          { step: 4, title: 'Upload File', desc: 'Drag & drop or select your completed file' },
          { step: 5, title: 'Review Results', desc: 'Check upload summary and fix any errors' },
        ].map((item) => (
          <div key={item.step} className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-sm">
              {item.step}
            </div>
            <div>
              <h4 className="text-slate-900 mb-1">{item.title}</h4>
              <p className="text-slate-600 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-slate-900 mb-3">Upload Types</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">Compliance Controls</h4>
          <p className="text-slate-600 text-sm mb-2">Upload multiple compliance controls:</p>
          <ul className="text-slate-600 text-xs space-y-1">
            <li>• Control ID, Name, Description</li>
            <li>• Status, Risk Level, Owner</li>
            <li>• Implementation Date</li>
          </ul>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">Vendor List</h4>
          <p className="text-slate-600 text-sm mb-2">Import vendor information:</p>
          <ul className="text-slate-600 text-xs space-y-1">
            <li>• Vendor Name, Contact</li>
            <li>• Risk Score, Status</li>
            <li>• Assessment Date</li>
          </ul>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">VAPT Findings</h4>
          <p className="text-slate-600 text-sm mb-2">Bulk import vulnerabilities:</p>
          <ul className="text-slate-600 text-xs space-y-1">
            <li>• Finding Title, Description</li>
            <li>• Severity, CVSS Score</li>
            <li>• Status, Remediation</li>
          </ul>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">User Accounts</h4>
          <p className="text-slate-600 text-sm mb-2">Create multiple users:</p>
          <ul className="text-slate-600 text-xs space-y-1">
            <li>• Name, Email, Role</li>
            <li>• Permissions</li>
            <li>• Status</li>
          </ul>
        </div>
      </div>

      <h3 className="text-slate-900 mb-3">Excel Template Format</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm overflow-x-auto">
{`Example: Compliance Controls Template

| Control ID | Control Name              | Status          | Risk   | Owner      | Date       |
|------------|---------------------------|-----------------|--------|------------|------------|
| A.5.1.1    | Information security...   | Implemented     | Low    | CISO       | 2025-11-01 |
| A.5.1.2    | Review of policies...     | Partial         | Medium | CISO       | 2025-10-15 |
| A.6.1.1    | Roles & responsibilities  | Not Implemented | High   | HR Manager | 2025-09-20 |

Required Fields (marked with * in template):
- Control ID*
- Control Name*
- Status*

Optional Fields:
- Risk, Owner, Date, Description, Evidence`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">Error Handling</h3>
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
        <h4 className="text-yellow-900 mb-2">Common Errors & Solutions</h4>
        <ul className="text-yellow-800 text-sm space-y-2">
          <li><strong>Missing Required Field:</strong> Ensure all fields marked with * are filled</li>
          <li><strong>Invalid Format:</strong> Use exact column headers from template</li>
          <li><strong>Duplicate ID:</strong> Each ID must be unique</li>
          <li><strong>Invalid Date:</strong> Use YYYY-MM-DD format (e.g., 2025-11-21)</li>
          <li><strong>Invalid Status:</strong> Use only: Implemented, Partial, Not Implemented</li>
        </ul>
      </div>

      <h3 className="text-slate-900 mb-3">Best Practices</h3>
      <ul className="text-slate-700 space-y-2">
        <li>✓ Always download and use the latest template</li>
        <li>✓ Test with small batch (10-20 records) first</li>
        <li>✓ Remove empty rows at the end of Excel file</li>
        <li>✓ Keep file size under 10MB for best performance</li>
        <li>✓ Backup existing data before bulk upload</li>
        <li>✓ Review upload summary and fix errors before confirming</li>
      </ul>
    </div>
  );
}

function ModulesSection() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2 className="text-slate-900 mb-4">Module Documentation</h2>

      <div className="space-y-6">
        {[
          {
            name: 'Dashboard',
            icon: '📊',
            desc: 'Real-time overview of compliance, risk, and security metrics',
            features: ['Compliance score tracking', 'Risk distribution charts', '6-month trend analysis', 'Recent activity feed'],
          },
          {
            name: 'Vendor Risk Assessment',
            icon: '👥',
            desc: 'Manage third-party vendor security and compliance',
            features: ['Vendor onboarding', 'Risk scoring', 'Custom questionnaires', 'Public submission forms', 'Assessment tracking'],
          },
          {
            name: 'Compliance Manager',
            icon: '🛡️',
            desc: 'Track compliance with ISO, RBI, and other frameworks',
            features: ['Multiple frameworks (ISO 27001/17/18, RBI, DL SAR)', 'Control tracking', 'Bulk operations', 'PDF/Excel export', 'Progress monitoring'],
          },
          {
            name: 'VAPT Reporting',
            icon: '🐛',
            desc: 'Create professional vulnerability assessment reports',
            features: ['Finding management', 'CVSS scoring', 'Evidence upload', 'AI-powered remediation', 'Professional PDF export'],
          },
          {
            name: 'Privacy & GDPR',
            icon: '🔒',
            desc: 'Comprehensive privacy and data protection management',
            features: ['ROPA (Records of Processing)', 'PII Inventory', 'DPIA (Privacy Impact Assessment)', 'DSAR Tracker', 'Consent Management'],
          },
        ].map((module) => (
          <div key={module.name} className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">{module.icon}</span>
              {module.name}
            </h3>
            <p className="text-slate-700 mb-4">{module.desc}</p>
            <h4 className="text-slate-800 mb-2 text-sm">Key Features:</h4>
            <ul className="text-slate-600 text-sm space-y-1">
              {module.features.map((feature, idx) => (
                <li key={idx}>• {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIIntegrationSection() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2 className="text-slate-900 mb-4">AI Integration Guide</h2>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
        <p className="text-purple-800">
          AI integration is <strong>optional</strong>. The application works fully offline without AI. 
          Enable AI for automated report generation, remediation suggestions, and compliance summaries.
        </p>
      </div>

      <h3 className="text-slate-900 mb-3">Supported AI Providers</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">OpenAI</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• GPT-4, GPT-3.5 Turbo</li>
            <li>• Requires internet</li>
            <li>• Best quality</li>
          </ul>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">Anthropic</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• Claude 3 Opus, Sonnet</li>
            <li>• Requires internet</li>
            <li>• Strong reasoning</li>
          </ul>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg">
          <h4 className="text-slate-800 mb-2">Local LLM</h4>
          <ul className="text-slate-600 text-sm space-y-1">
            <li>• Ollama (llama2, mistral)</li>
            <li>• 100% offline</li>
            <li>• No API costs</li>
          </ul>
        </div>
      </div>

      <h3 className="text-slate-900 mb-3">Setup: OpenAI</h3>
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <ol className="text-slate-700 space-y-2">
            <li>1. Get API key from: <a href="#" className="text-blue-600">https://platform.openai.com</a></li>
            <li>2. Navigate to: Settings → Integrations → AI Integration</li>
            <li>3. Select "OpenAI" as provider</li>
            <li>4. Enter your API key (starts with sk-)</li>
            <li>5. Choose model (gpt-4 recommended)</li>
            <li>6. Click "Save Integration Settings"</li>
          </ol>
        </div>
      </div>

      <h3 className="text-slate-900 mb-3">Setup: Local LLM (Offline)</h3>
      <div className="bg-slate-900 text-green-400 p-6 rounded-xl mb-6">
        <pre className="text-sm overflow-x-auto">
{`# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download a model
ollama pull llama2

# Start Ollama server
ollama serve

# In GRC Suite Settings:
# 1. Select "Local LLM" as provider
# 2. Enter endpoint: http://localhost:11434
# 3. Enter model name: llama2
# 4. Save settings`}
        </pre>
      </div>

      <h3 className="text-slate-900 mb-3">AI Features</h3>
      <ul className="text-slate-700 space-y-2 mb-6">
        <li><strong>VAPT Reports:</strong> Auto-generate remediation steps and risk analysis</li>
        <li><strong>Compliance:</strong> AI-suggested control implementations</li>
        <li><strong>Vendor Risk:</strong> Automated questionnaire analysis</li>
        <li><strong>Privacy:</strong> DPIA risk assessment assistance</li>
      </ul>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="text-yellow-900 mb-2">⚠️ Security Notes</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• API keys are stored encrypted locally</li>
          <li>• No data is sent to AI providers without explicit user action</li>
          <li>• Review AI-generated content before using in production</li>
          <li>• For maximum security, use Local LLM (offline)</li>
        </ul>
      </div>
    </div>
  );
}

function TroubleshootingSection() {
  return (
    <div className="prose prose-slate max-w-none">
      <h2 className="text-slate-900 mb-4">Troubleshooting</h2>

      <div className="space-y-6">
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-slate-900 mb-3">Application won't start</h3>
          <div className="space-y-3 text-slate-700">
            <div>
              <p className="mb-2"><strong>Check if port is already in use:</strong></p>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
                <pre>sudo lsof -i :8080</pre>
              </div>
            </div>
            <div>
              <p className="mb-2"><strong>Run on different port:</strong></p>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
                <pre>./grc-suite --port 9000</pre>
              </div>
            </div>
            <div>
              <p className="mb-2"><strong>Check permissions:</strong></p>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
                <pre>chmod +x grc-suite</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-slate-900 mb-3">Bulk upload fails</h3>
          <ul className="text-slate-700 space-y-2">
            <li>✓ Verify Excel file has correct column headers (use template)</li>
            <li>✓ Check for empty rows at the end of file</li>
            <li>✓ Ensure all required fields (marked with *) are filled</li>
            <li>✓ Verify date format is YYYY-MM-DD</li>
            <li>✓ Check file size is under 10MB</li>
            <li>✓ Remove special characters from Control IDs</li>
          </ul>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-slate-900 mb-3">Docker container issues</h3>
          <div className="space-y-3 text-slate-700">
            <div>
              <p className="mb-2"><strong>View container logs:</strong></p>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
                <pre>docker logs -f grc-suite</pre>
              </div>
            </div>
            <div>
              <p className="mb-2"><strong>Restart container:</strong></p>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
                <pre>docker restart grc-suite</pre>
              </div>
            </div>
            <div>
              <p className="mb-2"><strong>Check volume permissions:</strong></p>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
                <pre>sudo chown -R 1000:1000 ./data ./backups</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-slate-900 mb-3">AI integration not working</h3>
          <ul className="text-slate-700 space-y-2">
            <li>✓ Verify API key is correct and active</li>
            <li>✓ Check internet connection (for OpenAI/Anthropic)</li>
            <li>✓ Ensure API provider has sufficient credits</li>
            <li>✓ For Local LLM: Check Ollama is running (curl http://localhost:11434)</li>
            <li>✓ Review logs for detailed error messages</li>
          </ul>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-slate-900 mb-3">Database corruption</h3>
          <div className="bg-slate-900 text-green-400 p-6 rounded-lg mb-4">
            <pre className="text-sm">
{`# Stop the application
sudo systemctl stop grc-suite  # or docker stop grc-suite

# Restore from backup
cp backups/latest-backup.db data/grc.db

# Restart application
sudo systemctl start grc-suite  # or docker start grc-suite`}
            </pre>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-blue-900 mb-3">📞 Getting Help</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Check logs in: ./logs/app.log</li>
            <li>• Review error messages in browser console (F12)</li>
            <li>• Export logs: Settings → Advanced → Export Logs</li>
            <li>• Create backup before making changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

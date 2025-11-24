import { useState } from 'react';
import { Upload, Save, Palette, Globe, Database, Key } from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('branding');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Settings & Configuration</h2>
        <p className="text-slate-300">
          Customize branding, integrations, and system preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'branding', name: 'Branding', icon: Palette },
            { id: 'integrations', name: 'Integrations', icon: Globe },
            { id: 'database', name: 'Database', icon: Database },
            { id: 'security', name: 'Security', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-50 text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'branding' && <BrandingSettings />}
          {activeTab === 'integrations' && <IntegrationSettings />}
          {activeTab === 'database' && <DatabaseSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

function BrandingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-slate-900 mb-4">Company Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-700 text-sm mb-2">Company Logo</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm mb-2">Upload Company Logo</p>
              <p className="text-slate-400 text-xs">PNG, JPG, SVG (Max 2MB)</p>
            </div>
          </div>
          <div>
            <label className="block text-slate-700 text-sm mb-2">Auditor Logo</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-400 transition-colors">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm mb-2">Upload Auditor Logo</p>
              <p className="text-slate-400 text-xs">PNG, JPG, SVG (Max 2MB)</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-slate-700 text-sm mb-2">Company Name</label>
        <input
          type="text"
          placeholder="Your Company Name"
          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      <div>
        <h4 className="text-slate-900 mb-3">Theme Customization</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-700 text-sm mb-2">Primary Color</label>
            <input
              type="color"
              defaultValue="#0891b2"
              className="w-full h-12 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-slate-700 text-sm mb-2">Secondary Color</label>
            <input
              type="color"
              defaultValue="#3b82f6"
              className="w-full h-12 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-slate-700 text-sm mb-2">Accent Color</label>
            <input
              type="color"
              defaultValue="#8b5cf6"
              className="w-full h-12 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-slate-700 text-sm mb-2">Background</label>
            <input
              type="color"
              defaultValue="#f8fafc"
              className="w-full h-12 rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <button className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        Save Branding Settings
      </button>
    </div>
  );
}

function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-5 border border-slate-200 rounded-xl">
          <h4 className="text-slate-900 mb-3">AI Integration</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 text-sm mb-2">AI Provider</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500">
                <option>OpenAI</option>
                <option>Anthropic (Claude)</option>
                <option>Local LLM (Ollama)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-sm mb-2">API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm mb-2">Model</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500">
                <option>gpt-4</option>
                <option>gpt-3.5-turbo</option>
                <option>claude-3-opus</option>
                <option>claude-3-sonnet</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 border border-slate-200 rounded-xl">
          <h4 className="text-slate-900 mb-3">Email Notifications</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 text-sm mb-2">SMTP Server</label>
              <input
                type="text"
                placeholder="smtp.example.com"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 text-sm mb-2">Port</label>
                <input
                  type="text"
                  placeholder="587"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm mb-2">Username</label>
                <input
                  type="text"
                  placeholder="notifications@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        Save Integration Settings
      </button>
    </div>
  );
}

function DatabaseSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <p className="text-orange-800 text-sm">
          ⚠️ Changing database settings requires application restart
        </p>
      </div>

      <div>
        <label className="block text-slate-700 text-sm mb-2">Database Type</label>
        <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500">
          <option>SQLite (Local File)</option>
          <option>PostgreSQL</option>
          <option>Supabase</option>
          <option>MySQL</option>
        </select>
      </div>

      <div>
        <label className="block text-slate-700 text-sm mb-2">Data Directory</label>
        <input
          type="text"
          defaultValue="./data/grc"
          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      <div className="p-5 border border-slate-200 rounded-xl">
        <h4 className="text-slate-900 mb-3">Backup Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded" />
            <span className="text-slate-700">Enable automatic backups</span>
          </label>
          <div>
            <label className="block text-slate-700 text-sm mb-2">Backup Frequency</label>
            <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 text-sm mb-2">Backup Location</label>
            <input
              type="text"
              defaultValue="./backups"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>

      <button className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        Save Database Settings
      </button>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="p-5 border border-slate-200 rounded-xl">
        <h4 className="text-slate-900 mb-3">Authentication</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded" />
            <span className="text-slate-700">Require strong passwords</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded" />
            <span className="text-slate-700">Enable two-factor authentication</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-slate-600 rounded" />
            <span className="text-slate-700">Force password change every 90 days</span>
          </label>
        </div>
      </div>

      <div className="p-5 border border-slate-200 rounded-xl">
        <h4 className="text-slate-900 mb-3">Session Management</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-slate-700 text-sm mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              defaultValue="30"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded" />
            <span className="text-slate-700">Automatic logout on browser close</span>
          </label>
        </div>
      </div>

      <div className="p-5 border border-slate-200 rounded-xl">
        <h4 className="text-slate-900 mb-3">Audit Logging</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded" />
            <span className="text-slate-700">Log all user actions</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded" />
            <span className="text-slate-700">Log data access and modifications</span>
          </label>
          <div>
            <label className="block text-slate-700 text-sm mb-2">Log Retention (days)</label>
            <input
              type="number"
              defaultValue="365"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>

      <button className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        Save Security Settings
      </button>
    </div>
  );
}

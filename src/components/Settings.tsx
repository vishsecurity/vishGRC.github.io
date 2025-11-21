import { useState, useEffect } from 'react';
import { db, Settings as SettingsType } from '../lib/db';
import { Settings as SettingsIcon, Upload, Save, Sparkles } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const allSettings = await db.getAll<SettingsType>('settings');
    if (allSettings.length > 0) {
      setSettings(allSettings[0]);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    await db.put('settings', settings);
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleLogoUpload = (type: 'client' | 'auditor') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (type === 'client') {
            setSettings({ ...settings!, clientLogo: dataUrl });
          } else {
            setSettings({ ...settings!, auditorLogo: dataUrl });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure branding, AI integration, and system preferences</p>
      </div>

      {/* Brand Customization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">Brand Customization</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={settings.companyName || ''}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Logo */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Client Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {settings.clientLogo ? (
                  <div className="space-y-3">
                    <img
                      src={settings.clientLogo}
                      alt="Client Logo"
                      className="max-h-32 mx-auto"
                    />
                    <button
                      onClick={() => handleLogoUpload('client')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Change Logo
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleLogoUpload('client')}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Upload Client Logo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Auditor Logo */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Auditor Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {settings.auditorLogo ? (
                  <div className="space-y-3">
                    <img
                      src={settings.auditorLogo}
                      alt="Auditor Logo"
                      className="max-h-32 mx-auto"
                    />
                    <button
                      onClick={() => handleLogoUpload('auditor')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Change Logo
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleLogoUpload('auditor')}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Upload Auditor Logo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Primary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.primaryColor || '#3b82f6'}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor || '#3b82f6'}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Secondary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.secondaryColor || '#8b5cf6'}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondaryColor || '#8b5cf6'}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Integration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-gray-900">AI Integration</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Configure AI providers for generating summaries, remediation steps, and compliance documentation.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">AI Provider</label>
            <select
              value={settings.aiProvider || ''}
              onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Provider...</option>
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="local">Local AI (Ollama/LM Studio)</option>
            </select>
          </div>

          {settings.aiProvider && settings.aiProvider !== 'local' && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                value={settings.aiApiKey || ''}
                onChange={(e) => setSettings({ ...settings, aiApiKey: e.target.value })}
                placeholder="Enter your API key..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                {settings.aiProvider === 'openai' && 'Get your API key from platform.openai.com'}
                {settings.aiProvider === 'anthropic' && 'Get your API key from console.anthropic.com'}
              </p>
            </div>
          )}

          {settings.aiProvider === 'local' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Local AI Setup:</strong><br />
                Install Ollama or LM Studio and run a model locally. Configure the endpoint URL in your environment if needed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Storage Type</p>
            <p className="text-gray-900">IndexedDB (Browser Local Storage)</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Offline Support</p>
            <p className="text-gray-900">✓ Fully Offline Capable</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Data Location</p>
            <p className="text-gray-900">Browser Local Storage</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Version</p>
            <p className="text-gray-900">1.0.0</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

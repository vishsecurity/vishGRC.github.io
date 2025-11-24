import { useState } from 'react';
import { Save, Plus, Trash2, Edit2, Database, Code, Sliders, Sparkles } from 'lucide-react';

export function ControlPanel() {
  const [activeTab, setActiveTab] = useState('features');

  const tabs = [
    { id: 'features', name: 'Feature Management', icon: Sparkles },
    { id: 'modules', name: 'Module Config', icon: Sliders },
    { id: 'templates', name: 'Templates', icon: Database },
    { id: 'advanced', name: 'Advanced', icon: Code },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Control Panel</h2>
        <p className="text-purple-100">
          Manage features, modules, templates, and configurations without coding
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
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
          {activeTab === 'features' && <FeatureManagement />}
          {activeTab === 'modules' && <ModuleConfig />}
          {activeTab === 'templates' && <TemplateManager />}
          {activeTab === 'advanced' && <AdvancedSettings />}
        </div>
      </div>
    </div>
  );
}

function FeatureManagement() {
  const [features, setFeatures] = useState([
    { id: 1, name: 'AI-Powered Report Generation', enabled: true, category: 'AI' },
    { id: 2, name: 'Vendor Risk Scoring', enabled: true, category: 'Vendor' },
    { id: 3, name: 'Automated Compliance Checks', enabled: true, category: 'Compliance' },
    { id: 4, name: 'VAPT Finding Tracker', enabled: true, category: 'VAPT' },
    { id: 5, name: 'Privacy Impact Assessment', enabled: true, category: 'Privacy' },
    { id: 6, name: 'Multi-Company Support', enabled: false, category: 'Advanced' },
  ]);

  const [newFeature, setNewFeature] = useState({ name: '', category: '' });

  const toggleFeature = (id: number) => {
    setFeatures(features.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const addFeature = () => {
    if (newFeature.name && newFeature.category) {
      setFeatures([...features, { id: Date.now(), ...newFeature, enabled: true }]);
      setNewFeature({ name: '', category: '' });
    }
  };

  const deleteFeature = (id: number) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          Enable or disable features without editing code. Add custom features to extend functionality.
        </p>
      </div>

      {/* Add New Feature */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h4 className="text-slate-800 mb-3 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Feature
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Feature name"
            value={newFeature.name}
            onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Category"
            value={newFeature.category}
            onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addFeature}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Add Feature
          </button>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleFeature(feature.id)}
                className={`w-12 h-6 rounded-full transition-all ${
                  feature.enabled ? 'bg-green-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    feature.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <div>
                <p className="text-slate-800">{feature.name}</p>
                <p className="text-slate-500 text-sm">{feature.category}</p>
              </div>
            </div>
            <button
              onClick={() => deleteFeature(feature.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleConfig() {
  const modules = [
    { name: 'Dashboard', settings: ['Show charts', 'Auto-refresh', 'Export enabled'] },
    { name: 'Vendor Risk', settings: ['Public submission form', 'Auto-scoring', 'Email notifications'] },
    { name: 'Compliance', settings: ['Bulk operations', 'PDF export', 'Excel export'] },
    { name: 'VAPT Reporting', settings: ['AI suggestions', 'Custom templates', 'Evidence upload'] },
    { name: 'Privacy & GDPR', settings: ['DSAR automation', 'Consent tracking', 'Multi-company'] },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-purple-800 text-sm">
          Configure module-specific settings and behaviors
        </p>
      </div>

      {modules.map((module, index) => (
        <div key={index} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="text-slate-800 mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            {module.name}
          </h4>
          <div className="space-y-2">
            {module.settings.map((setting, idx) => (
              <label key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-slate-700">{setting}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        Save All Module Configurations
      </button>
    </div>
  );
}

function TemplateManager() {
  const templates = [
    { name: 'ISO 27001 Checklist', type: 'Compliance', controls: 167 },
    { name: 'ISO 27017 Checklist', type: 'Compliance', controls: 112 },
    { name: 'ISO 27018 Checklist', type: 'Compliance', controls: 95 },
    { name: 'RBI IT Outsourcing', type: 'Compliance', controls: 78 },
    { name: 'VAPT Report Template', type: 'Report', controls: 0 },
    { name: 'Vendor Questionnaire', type: 'Vendor', controls: 45 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-800 text-sm">
          Manage compliance templates, report formats, and questionnaires
        </p>
      </div>

      <button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        Import New Template (JSON/Excel)
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-slate-800">{template.name}</h4>
                <p className="text-slate-500 text-sm">{template.type}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {template.controls > 0 ? `${template.controls} controls` : 'Template'}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                Export
              </button>
              <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <p className="text-orange-800 text-sm">
          Advanced configuration for developers and power users
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h4 className="text-slate-800 mb-3">Database Configuration</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 text-sm mb-1">Database Type</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>SQLite (Local)</option>
                <option>PostgreSQL</option>
                <option>Supabase</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 text-sm mb-1">Data Directory</label>
              <input
                type="text"
                defaultValue="./data/grc"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h4 className="text-slate-800 mb-3">API Configuration</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 text-sm mb-1">AI Provider</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Local LLM</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 text-sm mb-1">API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h4 className="text-slate-800 mb-3">Export Configuration</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-slate-700">Enable JSON export</span>
            </label>
            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-slate-700">Enable Excel export</span>
            </label>
            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-slate-700">Enable PDF export</span>
            </label>
          </div>
        </div>
      </div>

      <button className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        Save Advanced Settings
      </button>
    </div>
  );
}

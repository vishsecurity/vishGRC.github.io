import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { VendorRisk } from './components/VendorRisk';
import { ComplianceManager } from './components/ComplianceManager';
import { VAPTReporting } from './components/VAPTReporting';
import { PrivacyManagement } from './components/PrivacyManagement';
import { ControlPanel } from './components/ControlPanel';
import { UserManagement } from './components/UserManagement';
import { Settings } from './components/Settings';
import { SOPViewer } from './components/SOPViewer';
import { BulkUpload } from './components/BulkUpload';
import { EvidenceManagement } from './components/EvidenceManagement';
import { Toaster } from 'sonner@2.0.3';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileCheck, 
  Bug, 
  Lock, 
  Settings as SettingsIcon,
  Sliders,
  Upload,
  BookOpen,
  Menu,
  X,
  Paperclip
} from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendor-risk', name: 'Vendor Risk', icon: Users },
    { id: 'compliance', name: 'Compliance', icon: Shield },
    { id: 'vapt', name: 'VAPT Reporting', icon: Bug },
    { id: 'privacy', name: 'Privacy & GDPR', icon: Lock },
    { id: 'evidence', name: 'Evidence Manager', icon: Paperclip },
    { id: 'bulk-upload', name: 'Bulk Upload', icon: Upload },
    { id: 'user-management', name: 'User Management', icon: FileCheck },
    { id: 'control-panel', name: 'Control Panel', icon: Sliders },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
    { id: 'sop', name: 'User Guide (SOP)', icon: BookOpen },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'vendor-risk':
        return <VendorRisk />;
      case 'compliance':
        return <ComplianceManager />;
      case 'vapt':
        return <VAPTReporting />;
      case 'privacy':
        return <PrivacyManagement />;
      case 'evidence':
        return <EvidenceManagement />;
      case 'bulk-upload':
        return <BulkUpload />;
      case 'user-management':
        return <UserManagement />;
      case 'control-panel':
        return <ControlPanel />;
      case 'settings':
        return <Settings />;
      case 'sop':
        return <SOPViewer />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Toaster position="top-right" richColors />
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl overflow-hidden`}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl tracking-tight">GRC Suite</h1>
              <p className="text-xs text-slate-400">Portable Edition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
                  activeModule === module.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{module.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
          <p>Version 1.0.0</p>
          <p>Offline Mode: Active</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-slate-800">
                {modules.find((m) => m.id === activeModule)?.name}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                ● Online
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Lock, FileText, Users, Shield, AlertCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export function PrivacyManagement() {
  const [activeModule, setActiveModule] = useState('ropa');

  const modules = [
    { id: 'ropa', name: 'ROPA (Records of Processing)', icon: FileText },
    { id: 'pii', name: 'PII Inventory', icon: Shield },
    { id: 'dpia', name: 'DPIA (Privacy Impact)', icon: AlertCircle },
    { id: 'dsar', name: 'DSAR Tracker', icon: Users },
    { id: 'consent', name: 'Consent Management', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Privacy & GDPR Management</h2>
        <p className="text-green-100">
          Manage data privacy, GDPR compliance, and data subject requests
        </p>
      </div>

      {/* Module Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all whitespace-nowrap ${
                  activeModule === module.id
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{module.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Module Content */}
      {activeModule === 'ropa' && <ROPAModule />}
      {activeModule === 'pii' && <PIIInventory />}
      {activeModule === 'dpia' && <DPIAModule />}
      {activeModule === 'dsar' && <DSARTracker />}
      {activeModule === 'consent' && <ConsentManagement />}
    </div>
  );
}

function ROPAModule() {
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  
  const records = [
    { id: 1, activity: 'Customer Data Processing', purpose: 'Service Delivery', dataCategories: 'Name, Email, Phone', retention: '5 years' },
    { id: 2, activity: 'Employee Records Management', purpose: 'HR Administration', dataCategories: 'Personal Info, Employment', retention: '7 years' },
    { id: 3, activity: 'Marketing Communications', purpose: 'Marketing', dataCategories: 'Email, Preferences', retention: '2 years' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
        <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
          <DialogTrigger asChild>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Processing Activity
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Processing Activity (ROPA)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Processing Activity Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Customer Data Processing"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Purpose of Processing</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the purpose..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Data Categories</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Name, Email, Address"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Retention Period</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Legal Basis</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Consent</option>
                  <option>Contract</option>
                  <option>Legal Obligation</option>
                  <option>Legitimate Interest</option>
                  <option>Vital Interest</option>
                  <option>Public Task</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Add Activity
                </button>
                <button 
                  onClick={() => setAddActivityOpen(false)}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-slate-700">Processing Activity</th>
              <th className="px-6 py-4 text-left text-slate-700">Purpose</th>
              <th className="px-6 py-4 text-left text-slate-700">Data Categories</th>
              <th className="px-6 py-4 text-left text-slate-700">Retention Period</th>
              <th className="px-6 py-4 text-left text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-800">{record.activity}</td>
                <td className="px-6 py-4 text-slate-600">{record.purpose}</td>
                <td className="px-6 py-4 text-slate-600">{record.dataCategories}</td>
                <td className="px-6 py-4 text-slate-600">{record.retention}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PIIInventory() {
  const [addPIIOpen, setAddPIIOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4">PII Data Inventory</h3>
        <p className="text-slate-600 mb-4">
          Track and categorize all personally identifiable information across systems
        </p>
        <Dialog open={addPIIOpen} onOpenChange={setAddPIIOpen}>
          <DialogTrigger asChild>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add PII Category
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add PII Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Category Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Customer PII"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Storage Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Database Server A"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Encryption Method</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>AES-256</option>
                  <option>AES-128</option>
                  <option>RSA</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Access Controls</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Role-based"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Add Category
                </button>
                <button 
                  onClick={() => setAddPIIOpen(false)}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['Customer PII', 'Employee PII', 'Vendor PII', 'Sensitive Data'].map((category, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h4 className="text-slate-800 mb-3">{category}</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Storage Location: Database Server A</p>
              <p>• Encryption: AES-256</p>
              <p>• Access Controls: Role-based</p>
              <p>• Last Reviewed: 2025-11-01</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DPIAModule() {
  const [newDPIAOpen, setNewDPIAOpen] = useState(false);
  
  const assessments = [
    { id: 1, project: 'New CRM System', risk: 'Medium', status: 'In Progress', date: '2025-11-10' },
    { id: 2, project: 'Mobile App Launch', risk: 'High', status: 'Completed', date: '2025-10-15' },
    { id: 3, project: 'AI Chatbot', risk: 'High', status: 'Pending', date: '2025-11-20' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
        <Dialog open={newDPIAOpen} onOpenChange={setNewDPIAOpen}>
          <DialogTrigger asChild>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Start New DPIA
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start New Data Privacy Impact Assessment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Project Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., New CRM System"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the project and data processing..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Initial Risk Level</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Assessment Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Start Assessment
                </button>
                <button 
                  onClick={() => setNewDPIAOpen(false)}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-slate-900 mb-2">{assessment.project}</h4>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    assessment.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {assessment.risk} Risk
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    assessment.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {assessment.status}
                  </span>
                  <span className="text-slate-500 text-sm">{assessment.date}</span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DSARTracker() {
  const [newDSAROpen, setNewDSAROpen] = useState(false);
  
  const requests = [
    { id: 1, type: 'Access Request', subject: 'john.doe@example.com', status: 'In Progress', deadline: '2025-11-25' },
    { id: 2, type: 'Deletion Request', subject: 'jane.smith@example.com', status: 'Completed', deadline: '2025-11-20' },
    { id: 3, type: 'Rectification', subject: 'bob.jones@example.com', status: 'Pending', deadline: '2025-11-28' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
        <Dialog open={newDSAROpen} onOpenChange={setNewDSAROpen}>
          <DialogTrigger asChild>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New DSAR Request
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Data Subject Access Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Request Type</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Access Request</option>
                  <option>Deletion Request</option>
                  <option>Rectification Request</option>
                  <option>Portability Request</option>
                  <option>Objection to Processing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Data Subject Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="subject@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Request Details</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the request..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Deadline (30 days from receipt)</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Create Request
                </button>
                <button 
                  onClick={() => setNewDSAROpen(false)}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-slate-700">Request Type</th>
              <th className="px-6 py-4 text-left text-slate-700">Data Subject</th>
              <th className="px-6 py-4 text-left text-slate-700">Status</th>
              <th className="px-6 py-4 text-left text-slate-700">Deadline</th>
              <th className="px-6 py-4 text-left text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-800">{request.type}</td>
                <td className="px-6 py-4 text-slate-600">{request.subject}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    request.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    request.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{request.deadline}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConsentManagement() {
  const [manageConsentOpen, setManageConsentOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4">Consent Management Dashboard</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-green-700 text-sm mb-1">Active Consents</p>
            <p className="text-3xl text-green-800">1,234</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-yellow-700 text-sm mb-1">Pending Review</p>
            <p className="text-3xl text-yellow-800">45</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-red-700 text-sm mb-1">Withdrawn</p>
            <p className="text-3xl text-red-800">23</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4">Consent Categories</h3>
        <div className="space-y-3">
          {['Marketing Communications', 'Analytics & Cookies', 'Third-Party Sharing', 'Profiling'].map((category, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-800">{category}</span>
              <button 
                onClick={() => {
                  setSelectedCategory(category);
                  setManageConsentOpen(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Manage
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Consent Modal */}
      <Dialog open={manageConsentOpen} onOpenChange={setManageConsentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Consent - {selectedCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                Configure consent settings, templates, and tracking for {selectedCategory}
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Consent Template</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                defaultValue={`We would like your consent to use your personal data for ${selectedCategory}.`}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-2">Consent Method</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Opt-In (Explicit)</option>
                <option>Opt-Out</option>
                <option>Soft Opt-In</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                <span className="text-sm text-slate-700">Require re-confirmation every 12 months</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                <span className="text-sm text-slate-700">Log all consent changes</span>
              </label>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm text-slate-700 mb-3">Active Consents</h4>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded flex justify-between items-center">
                  <span className="text-slate-700 text-sm">user@example.com</span>
                  <span className="text-green-600 text-xs">Consented 2025-11-15</span>
                </div>
                <div className="p-3 bg-slate-50 rounded flex justify-between items-center">
                  <span className="text-slate-700 text-sm">another@example.com</span>
                  <span className="text-green-600 text-xs">Consented 2025-11-10</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => {
                  alert('Consent settings updated successfully!');
                  setManageConsentOpen(false);
                }}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Settings
              </button>
              <button 
                onClick={() => setManageConsentOpen(false)}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
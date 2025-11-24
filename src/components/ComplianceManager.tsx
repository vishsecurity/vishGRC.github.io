import { useState } from 'react';
import { Shield, Download, Upload, FileText, CheckCircle, XCircle, Paperclip } from 'lucide-react';
import { EvidenceUpload } from './EvidenceUpload';

export function ComplianceManager() {
  const [selectedFramework, setSelectedFramework] = useState('iso27001');
  const [selectedControl, setSelectedControl] = useState<string | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  const frameworks = [
    { id: 'iso27001', name: 'ISO 27001', total: 167, completed: 145 },
    { id: 'iso27017', name: 'ISO 27017', total: 112, completed: 89 },
    { id: 'iso27018', name: 'ISO 27018', total: 95, completed: 72 },
    { id: 'rbi', name: 'RBI IT Outsourcing', total: 78, completed: 56 },
    { id: 'dlsar', name: 'DL SAR & IT RA', total: 45, completed: 34 },
  ];

  const controls = [
    { id: 'A.5.1.1', name: 'Information security policies', status: 'Implemented', risk: 'Low', owner: 'CISO' },
    { id: 'A.5.1.2', name: 'Review of information security policies', status: 'Implemented', risk: 'Low', owner: 'CISO' },
    { id: 'A.6.1.1', name: 'Information security roles and responsibilities', status: 'Partial', risk: 'Medium', owner: 'HR' },
    { id: 'A.6.1.2', name: 'Segregation of duties', status: 'Not Implemented', risk: 'High', owner: 'IT Manager' },
    { id: 'A.6.1.3', name: 'Contact with authorities', status: 'Implemented', risk: 'Low', owner: 'Legal' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Implemented':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Partial':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'Not Implemented':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <XCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-700 bg-green-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'High': return 'text-red-700 bg-red-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  const currentFramework = frameworks.find(f => f.id === selectedFramework);
  const progress = currentFramework ? Math.round((currentFramework.completed / currentFramework.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Compliance Management</h2>
        <p className="text-blue-100">
          Manage compliance frameworks and track control implementation
        </p>
      </div>

      {/* Framework Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4">Select Compliance Framework</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {frameworks.map((framework) => (
            <button
              key={framework.id}
              onClick={() => setSelectedFramework(framework.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedFramework === framework.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Shield className={`w-6 h-6 mb-2 ${selectedFramework === framework.id ? 'text-blue-600' : 'text-slate-400'}`} />
              <p className="text-slate-800 text-sm mb-2">{framework.name}</p>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${(framework.completed / framework.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {framework.completed}/{framework.total}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            {currentFramework?.name} - Progress Overview
          </h3>
          <span className="text-2xl text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-green-700 text-sm">Implemented</p>
            <p className="text-2xl text-green-800">{currentFramework?.completed}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-yellow-700 text-sm">Partial</p>
            <p className="text-2xl text-yellow-800">12</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-red-700 text-sm">Not Implemented</p>
            <p className="text-2xl text-red-800">{currentFramework ? currentFramework.total - currentFramework.completed - 12 : 0}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report (PDF)
          </button>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Update Controls
          </button>
        </div>
      </div>

      {/* Controls Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-slate-900">Control Details</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-slate-700">Control ID</th>
              <th className="px-6 py-4 text-left text-slate-700">Control Name</th>
              <th className="px-6 py-4 text-left text-slate-700">Status</th>
              <th className="px-6 py-4 text-left text-slate-700">Risk</th>
              <th className="px-6 py-4 text-left text-slate-700">Owner</th>
              <th className="px-6 py-4 text-left text-slate-700">Evidence</th>
              <th className="px-6 py-4 text-left text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr key={control.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-700">{control.id}</td>
                <td className="px-6 py-4 text-slate-800">{control.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(control.status)}
                    <span className="text-slate-700 text-sm">{control.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(control.risk)}`}>
                    {control.risk}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{control.owner}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedControl(control.id);
                      setShowEvidenceModal(true);
                    }}
                    className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                  >
                    <Paperclip className="w-4 h-4" />
                    Add Evidence
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-blue-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Bulk Operations Available
        </h4>
        <ul className="text-blue-700 text-sm space-y-2">
          <li>• Add multiple controls at once using Excel template</li>
          <li>• Update control statuses in bulk</li>
          <li>• Delete multiple controls (with confirmation)</li>
          <li>• Export filtered controls to PDF or Excel</li>
        </ul>
      </div>

      {/* Evidence Upload Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-slate-900">
                Upload Evidence for Control {selectedControl}
              </h3>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <EvidenceUpload
                category="compliance"
                entityId={selectedControl || undefined}
                onUploadComplete={() => {}}
              />
            </div>
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
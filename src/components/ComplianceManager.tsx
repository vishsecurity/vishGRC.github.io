import { useState, useEffect } from 'react';
import { db, ComplianceControl } from '../lib/db';
import { AuthService } from '../lib/auth';
import { complianceTemplates } from '../lib/templates';
import { FileCheck, Plus, Download, Sparkles, Filter } from 'lucide-react';
import { ExportService } from '../lib/export';
import { AIService } from '../lib/ai';

export function ComplianceManager() {
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [selectedFramework, setSelectedFramework] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [editingControl, setEditingControl] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    loadControls();
  }, []);

  const loadControls = async () => {
    const allControls = await db.getAll<ComplianceControl>('compliance');
    setControls(allControls);
  };

  const handleBulkAdd = async (framework: string) => {
    const template = complianceTemplates.find(t => t.framework === framework);
    if (!template) return;

    const newControls: ComplianceControl[] = template.controls.map(control => ({
      id: `control-${Date.now()}-${Math.random()}`,
      framework: template.framework,
      controlId: control.controlId,
      title: control.title,
      description: control.description,
      status: 'non-compliant' as const,
      evidence: '',
      notes: '',
      companyId: 'company-001',
      updatedAt: new Date().toISOString(),
    }));

    for (const control of newControls) {
      await db.add('compliance', control);
    }

    setShowBulkAdd(false);
    loadControls();
  };

  const handleBulkDelete = async (framework: string) => {
    if (!confirm(`Delete all ${framework} controls?`)) return;

    const frameworkControls = controls.filter(c => c.framework === framework);
    for (const control of frameworkControls) {
      await db.delete('compliance', control.id);
    }
    loadControls();
  };

  const handleUpdateControl = async (controlId: string, updates: Partial<ComplianceControl>) => {
    const control = controls.find(c => c.id === controlId);
    if (!control) return;

    await db.put('compliance', {
      ...control,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    loadControls();
    setEditingControl(null);
  };

  const handleGenerateSummary = async () => {
    if (controls.length === 0) {
      alert('No controls to generate summary for');
      return;
    }

    setGeneratingSummary(true);
    const frameworkControls = selectedFramework 
      ? controls.filter(c => c.framework === selectedFramework)
      : controls;
    
    const summary = await AIService.generateComplianceSummary(
      selectedFramework || 'All Frameworks',
      frameworkControls
    );
    
    setAiSummary(summary);
    setGeneratingSummary(false);
  };

  const handleExportPDF = async () => {
    const frameworkControls = selectedFramework 
      ? controls.filter(c => c.framework === selectedFramework)
      : controls;

    const settings = await db.getAll('settings');
    await ExportService.generateComplianceReportPDF(
      selectedFramework || 'All Frameworks',
      frameworkControls,
      settings[0]
    );
  };

  const handleExportExcel = () => {
    const frameworkControls = selectedFramework 
      ? controls.filter(c => c.framework === selectedFramework)
      : controls;

    const exportData = frameworkControls.map(c => ({
      Framework: c.framework,
      'Control ID': c.controlId,
      Title: c.title,
      Status: c.status,
      Evidence: c.evidence,
      Notes: c.notes,
      'Last Updated': new Date(c.updatedAt).toLocaleDateString(),
    }));

    ExportService.exportToExcel(exportData, 'compliance_controls');
  };

  const canWrite = AuthService.hasPermission('compliance', 'write');

  const frameworks = Array.from(new Set(controls.map(c => c.framework)));
  const displayControls = controls
    .filter(c => !selectedFramework || c.framework === selectedFramework)
    .filter(c => filterStatus === 'all' || c.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700';
      case 'partial': return 'bg-yellow-100 text-yellow-700';
      case 'non-compliant': return 'bg-red-100 text-red-700';
      case 'not-applicable': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Compliance Management</h1>
          <p className="text-gray-600">Manage compliance controls across multiple frameworks</p>
        </div>
        <button
          onClick={() => setShowBulkAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Load Framework
        </button>
      </div>

      {showBulkAdd && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Load Compliance Framework</h2>
          <p className="text-gray-600 mb-4">Select a framework to load all its controls:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceTemplates.map((template) => (
              <div key={template.framework} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-gray-900 mb-2">{template.framework}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {template.controls.length} controls • Version {template.version}
                </p>
                <button
                  onClick={() => handleBulkAdd(template.framework)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Load Framework
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowBulkAdd(false)}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Framework</label>
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Frameworks</option>
                {frameworks.map(fw => (
                  <option key={fw} value={fw}>{fw}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Status Filter</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="partial">Partially Compliant</option>
                <option value="non-compliant">Non-Compliant</option>
                <option value="not-applicable">Not Applicable</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
            >
              <Sparkles className="w-4 h-4" />
              {generatingSummary ? 'Generating...' : 'AI Summary'}
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        {aiSummary && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-gray-900 mb-2">AI-Generated Summary</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{aiSummary}</p>
          </div>
        )}

        {selectedFramework && canWrite && (
          <div className="mt-4">
            <button
              onClick={() => handleBulkDelete(selectedFramework)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Delete all {selectedFramework} controls
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 text-sm">Framework</th>
                <th className="px-6 py-3 text-left text-gray-700 text-sm">Control ID</th>
                <th className="px-6 py-3 text-left text-gray-700 text-sm">Title</th>
                <th className="px-6 py-3 text-left text-gray-700 text-sm">Status</th>
                <th className="px-6 py-3 text-left text-gray-700 text-sm">Evidence</th>
                <th className="px-6 py-3 text-left text-gray-700 text-sm">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayControls.map((control) => (
                <tr key={control.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{control.framework}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{control.controlId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{control.title}</td>
                  <td className="px-6 py-4">
                    {editingControl === control.id && canWrite ? (
                      <select
                        value={control.status}
                        onChange={(e) => handleUpdateControl(control.id, { status: e.target.value as any })}
                        onBlur={() => setEditingControl(null)}
                        autoFocus
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="compliant">Compliant</option>
                        <option value="partial">Partially Compliant</option>
                        <option value="non-compliant">Non-Compliant</option>
                        <option value="not-applicable">Not Applicable</option>
                      </select>
                    ) : (
                      <span
                        onClick={() => canWrite && setEditingControl(control.id)}
                        className={`px-2 py-1 text-xs rounded cursor-pointer ${getStatusColor(control.status)}`}
                      >
                        {control.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {canWrite ? (
                      <input
                        type="text"
                        value={control.evidence}
                        onChange={(e) => handleUpdateControl(control.id, { evidence: e.target.value })}
                        placeholder="Add evidence..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{control.evidence || '-'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {canWrite ? (
                      <input
                        type="text"
                        value={control.notes}
                        onChange={(e) => handleUpdateControl(control.id, { notes: e.target.value })}
                        placeholder="Add notes..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{control.notes || '-'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

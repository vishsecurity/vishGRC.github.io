import { useState, useEffect } from 'react';
import { db, VAPTReport } from '../lib/db';
import { AuthService } from '../lib/auth';
import { Shield, Plus, Edit2, Trash2, Download, Sparkles, Eye } from 'lucide-react';
import { ExportService } from '../lib/export';
import { AIService } from '../lib/ai';

export function VAPTReporting() {
  const [reports, setReports] = useState<VAPTReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<VAPTReport | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFinding, setEditingFinding] = useState<number | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const allReports = await db.getAll<VAPTReport>('vapt');
    setReports(allReports);
  };

  const handleCreateReport = async () => {
    const newReport: VAPTReport = {
      id: `vapt-${Date.now()}`,
      title: 'New VAPT Report',
      clientName: 'Client Name',
      summary: '',
      findings: [],
      status: 'draft',
      companyId: 'company-001',
      createdAt: new Date().toISOString(),
    };

    await db.add('vapt', newReport);
    setReports([...reports, newReport]);
    setSelectedReport(newReport);
    setShowForm(false);
  };

  const handleUpdateReport = async (updates: Partial<VAPTReport>) => {
    if (!selectedReport) return;

    const updated = { ...selectedReport, ...updates };
    await db.put('vapt', updated);
    setSelectedReport(updated);
    loadReports();
  };

  const handleAddFinding = () => {
    if (!selectedReport) return;

    const newFinding = {
      id: `finding-${Date.now()}`,
      title: 'New Finding',
      severity: 'medium' as const,
      description: '',
      evidence: '',
      remediation: '',
      cvss: 0,
    };

    handleUpdateReport({
      findings: [...selectedReport.findings, newFinding],
    });
  };

  const handleUpdateFinding = (index: number, updates: any) => {
    if (!selectedReport) return;

    const updatedFindings = [...selectedReport.findings];
    updatedFindings[index] = { ...updatedFindings[index], ...updates };
    handleUpdateReport({ findings: updatedFindings });
  };

  const handleDeleteFinding = (index: number) => {
    if (!selectedReport) return;
    if (!confirm('Delete this finding?')) return;

    const updatedFindings = selectedReport.findings.filter((_, i) => i !== index);
    handleUpdateReport({ findings: updatedFindings });
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Delete this report?')) return;

    await db.delete('vapt', id);
    if (selectedReport?.id === id) {
      setSelectedReport(null);
    }
    loadReports();
  };

  const handleGenerateSummary = async () => {
    if (!selectedReport) return;

    const summary = await AIService.generateVAPTSummary(selectedReport.findings);
    handleUpdateReport({ summary });
  };

  const handleGenerateRemediation = async (index: number) => {
    if (!selectedReport) return;

    const finding = selectedReport.findings[index];
    const remediation = await AIService.generateRemediationSteps(
      finding.title,
      finding.severity
    );

    handleUpdateFinding(index, { remediation });
  };

  const handleExportPDF = async () => {
    if (!selectedReport) return;

    const settings = await db.getAll('settings');
    await ExportService.generateVAPTReportPDF(selectedReport, settings[0]);
  };

  const canWrite = AuthService.hasPermission('vapt', 'write');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      case 'info': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">VAPT Reporting</h1>
          <p className="text-gray-600">Create and manage vulnerability assessment reports</p>
        </div>
        {canWrite && (
          <button
            onClick={handleCreateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-gray-900 mb-4">Reports</h2>
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-3 rounded-lg cursor-pointer border ${
                  selectedReport?.id === report.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-900 truncate">{report.title}</p>
                  {canWrite && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReport(report.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">{report.clientName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {report.findings.length} findings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-900">Report Details</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Report Title</label>
                    <input
                      type="text"
                      value={selectedReport.title}
                      onChange={(e) => handleUpdateReport({ title: e.target.value })}
                      disabled={!canWrite}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Client Name</label>
                    <input
                      type="text"
                      value={selectedReport.clientName}
                      onChange={(e) => handleUpdateReport({ clientName: e.target.value })}
                      disabled={!canWrite}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedReport.status}
                      onChange={(e) => handleUpdateReport({ status: e.target.value as any })}
                      disabled={!canWrite}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-gray-700">Executive Summary</label>
                      {canWrite && (
                        <button
                          onClick={handleGenerateSummary}
                          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI Generate
                        </button>
                      )}
                    </div>
                    <textarea
                      value={selectedReport.summary}
                      onChange={(e) => handleUpdateReport({ summary: e.target.value })}
                      disabled={!canWrite}
                      rows={4}
                      placeholder="Executive summary of the assessment..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-900">Findings</h2>
                  {canWrite && (
                    <button
                      onClick={handleAddFinding}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Finding
                    </button>
                  )}
                </div>

                {selectedReport.findings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No findings yet. Add your first finding to get started.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedReport.findings.map((finding, index) => (
                      <div key={finding.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={finding.title}
                              onChange={(e) => handleUpdateFinding(index, { title: e.target.value })}
                              disabled={!canWrite}
                              className="w-full text-gray-900 mb-2 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2 items-center">
                              <select
                                value={finding.severity}
                                onChange={(e) => handleUpdateFinding(index, { severity: e.target.value })}
                                disabled={!canWrite}
                                className={`px-2 py-1 text-xs rounded ${getSeverityColor(finding.severity)}`}
                              >
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                                <option value="info">Informational</option>
                              </select>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={finding.cvss}
                                onChange={(e) => handleUpdateFinding(index, { cvss: parseFloat(e.target.value) })}
                                disabled={!canWrite}
                                placeholder="CVSS Score"
                                className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            </div>
                          </div>
                          {canWrite && (
                            <button
                              onClick={() => handleDeleteFinding(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Description</label>
                            <textarea
                              value={finding.description}
                              onChange={(e) => handleUpdateFinding(index, { description: e.target.value })}
                              disabled={!canWrite}
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-700 mb-1">Evidence</label>
                            <textarea
                              value={finding.evidence}
                              onChange={(e) => handleUpdateFinding(index, { evidence: e.target.value })}
                              disabled={!canWrite}
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs text-gray-700">Remediation</label>
                              {canWrite && (
                                <button
                                  onClick={() => handleGenerateRemediation(index)}
                                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  AI Generate
                                </button>
                              )}
                            </div>
                            <textarea
                              value={finding.remediation}
                              onChange={(e) => handleUpdateFinding(index, { remediation: e.target.value })}
                              disabled={!canWrite}
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a report to view details or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

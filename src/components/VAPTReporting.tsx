import { useState } from 'react';
import { Bug, Plus, Download, Image, FileText, AlertTriangle } from 'lucide-react';

export function VAPTReporting() {
  const [reports, setReports] = useState([
    { id: 1, name: 'Q4 2025 Production Environment', date: '2025-11-15', findings: 17, critical: 2, high: 5 },
    { id: 2, name: 'Q3 2025 Web Application', date: '2025-08-20', findings: 12, critical: 1, high: 3 },
    { id: 3, name: 'Q2 2025 Infrastructure', date: '2025-05-10', findings: 23, critical: 3, high: 8 },
  ]);

  const [showCreateReport, setShowCreateReport] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">VAPT Reporting</h2>
        <p className="text-orange-100">
          Create professional vulnerability assessment and penetration testing reports
        </p>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateReport(!showCreateReport)}
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New VAPT Report
          </button>
        </div>
      </div>

      {/* Create Report Form */}
      {showCreateReport && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-slate-900 mb-4">New VAPT Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm mb-2">Report Title</label>
              <input
                type="text"
                placeholder="e.g., Q4 2025 Infrastructure Assessment"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm mb-2">Assessment Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm mb-2">Target Environment</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Production</option>
                <option>Staging</option>
                <option>Development</option>
                <option>Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-sm mb-2">Assessment Type</label>
              <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Full VAPT</option>
                <option>Vulnerability Assessment</option>
                <option>Penetration Testing</option>
                <option>Web Application</option>
                <option>Network Assessment</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-slate-700 text-sm mb-2">Executive Summary</label>
            <textarea
              rows={4}
              placeholder="Provide a high-level overview of the assessment..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Create Report
            </button>
            <button
              onClick={() => setShowCreateReport(false)}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Reports */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-slate-900">Recent VAPT Reports</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-slate-900 mb-1">{report.name}</h4>
                  <p className="text-slate-500 text-sm">{report.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                    Edit
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-xs mb-1">Total Findings</p>
                  <p className="text-slate-900 text-xl">{report.findings}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-red-600 text-xs mb-1">Critical</p>
                  <p className="text-red-800 text-xl">{report.critical}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-orange-600 text-xs mb-1">High</p>
                  <p className="text-orange-800 text-xl">{report.high}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-green-600 text-xs mb-1">Status</p>
                  <p className="text-green-800 text-sm">Completed</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Builder Guide */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          VAPT Report Builder Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-slate-800 mb-2">✓ Add Findings</h4>
            <p className="text-slate-600 text-sm">Categorize by severity, add descriptions, and CVSS scores</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-slate-800 mb-2">✓ Upload Evidence</h4>
            <p className="text-slate-600 text-sm">Attach screenshots and proof-of-concept files</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-slate-800 mb-2">✓ AI Assistance</h4>
            <p className="text-slate-600 text-sm">Generate remediation recommendations automatically</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-slate-800 mb-2">✓ Professional Export</h4>
            <p className="text-slate-600 text-sm">Export branded PDF reports with custom logos</p>
          </div>
        </div>
      </div>

      {/* AI Integration */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Bug className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-slate-900 mb-2">AI-Powered Report Generation</h4>
            <p className="text-slate-700 text-sm mb-3">
              Enable AI assistance to automatically generate remediation steps, risk assessments, and executive summaries based on your findings.
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              Configure AI Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

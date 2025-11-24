import { useState } from 'react';
import { Users, Plus, Search, Filter, ExternalLink, AlertTriangle } from 'lucide-react';

export function VendorRisk() {
  const [vendors, setVendors] = useState([
    { id: 1, name: 'TechCorp Solutions', risk: 'Low', score: 85, status: 'Approved', lastAssessment: '2025-10-15' },
    { id: 2, name: 'CloudServe Inc', risk: 'Medium', score: 68, status: 'Under Review', lastAssessment: '2025-11-01' },
    { id: 3, name: 'DataSafe Systems', risk: 'High', score: 45, status: 'Action Required', lastAssessment: '2025-09-20' },
    { id: 4, name: 'SecureNet Ltd', risk: 'Low', score: 92, status: 'Approved', lastAssessment: '2025-11-10' },
  ]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-700 bg-green-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'High': return 'text-red-700 bg-red-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-700 bg-green-100';
      case 'Under Review': return 'text-blue-700 bg-blue-100';
      case 'Action Required': return 'text-red-700 bg-red-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Vendor Risk Assessment</h2>
        <p className="text-purple-100">
          Manage and assess third-party vendor security and compliance
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Vendor
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Generate Public Form
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-[200px]">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      {/* Vendor List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-slate-700">Vendor Name</th>
              <th className="px-6 py-4 text-left text-slate-700">Risk Level</th>
              <th className="px-6 py-4 text-left text-slate-700">Score</th>
              <th className="px-6 py-4 text-left text-slate-700">Status</th>
              <th className="px-6 py-4 text-left text-slate-700">Last Assessment</th>
              <th className="px-6 py-4 text-left text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
                      {vendor.name.charAt(0)}
                    </div>
                    <span className="text-slate-800">{vendor.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(vendor.risk)}`}>
                    {vendor.risk}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          vendor.score >= 80 ? 'bg-green-500' : vendor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${vendor.score}%` }}
                      />
                    </div>
                    <span className="text-slate-700 text-sm">{vendor.score}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{vendor.lastAssessment}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Questionnaire Builder */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-purple-600" />
          Custom Questionnaire Builder
        </h3>
        <p className="text-slate-600 mb-4">
          Create custom security questionnaires for vendors to complete
        </p>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Create New Questionnaire
        </button>
      </div>
    </div>
  );
}

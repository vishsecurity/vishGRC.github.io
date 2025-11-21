import { useState, useEffect } from 'react';
import { db, Vendor } from '../lib/db';
import { AuthService } from '../lib/auth';
import { vendorQuestionnaireTemplate } from '../lib/templates';
import { Building2, Plus, Eye, Trash2, ExternalLink, Download } from 'lucide-react';
import { ExportService } from '../lib/export';

export function VendorRisk() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    const allVendors = await db.getAll<Vendor>('vendors');
    setVendors(allVendors);
  };

  const handleCreateVendor = async () => {
    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: formData.company_name || 'Unnamed Vendor',
      status: 'pending',
      riskScore: calculateRiskScore(formData),
      responses: formData,
      questionnaire: 'default',
      companyId: 'company-001',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    await db.add('vendors', newVendor);
    setShowForm(false);
    setFormData({});
    loadVendors();
  };

  const calculateRiskScore = (responses: any): number => {
    let score = 100;
    
    // Reduce score based on negative responses
    if (responses.iso_certified === 'No') score -= 15;
    if (responses.security_policy === 'No') score -= 10;
    if (responses.incident_response === 'No') score -= 10;
    if (responses.encryption === 'No') score -= 15;
    if (responses.privacy_policy === 'No') score -= 10;
    if (responses.gdpr_compliance === 'No') score -= 10;
    if (responses.bc_plan === 'No') score -= 15;
    if (responses.backup_frequency === 'No regular backups') score -= 15;
    
    return Math.max(0, score);
  };

  const handleUpdateStatus = async (vendorId: string, newStatus: Vendor['status']) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      await db.put('vendors', { ...vendor, status: newStatus });
      loadVendors();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      await db.delete('vendors', id);
      loadVendors();
    }
  };

  const generatePublicLink = (vendorId: string) => {
    const link = `${window.location.origin}/vendor-form?id=${vendorId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const exportVendors = () => {
    const exportData = vendors.map(v => ({
      Name: v.name,
      Status: v.status,
      'Risk Score': v.riskScore,
      'Submitted At': v.submittedAt ? new Date(v.submittedAt).toLocaleDateString() : 'N/A',
    }));
    ExportService.exportToCSV(exportData, 'vendor_risk_assessment');
  };

  const canWrite = AuthService.hasPermission('vendors', 'write');

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'in-review': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Vendor Risk Assessment</h1>
          <p className="text-gray-600">Manage vendor security questionnaires and risk assessments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportVendors}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          {canWrite && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Assessment
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Vendor Security Questionnaire</h2>
          <div className="space-y-6">
            {vendorQuestionnaireTemplate.sections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-gray-900 mb-4">{section.title}</h3>
                <div className="space-y-4">
                  {section.questions.map((question) => (
                    <div key={question.id}>
                      <label className="block text-gray-700 mb-2 text-sm">
                        {question.question}
                        {question.required && <span className="text-red-500"> *</span>}
                      </label>
                      {question.type === 'text' && (
                        <input
                          type="text"
                          value={formData[question.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={question.required}
                        />
                      )}
                      {question.type === 'textarea' && (
                        <textarea
                          value={formData[question.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          required={question.required}
                        />
                      )}
                      {question.type === 'number' && (
                        <input
                          type="number"
                          value={formData[question.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={question.required}
                        />
                      )}
                      {question.type === 'radio' && (
                        <div className="space-y-2">
                          {question.options?.map((option) => (
                            <label key={option} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={formData[question.id] === option}
                                onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                                className="w-4 h-4 text-blue-600"
                                required={question.required}
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {question.type === 'select' && (
                        <select
                          value={formData[question.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={question.required}
                        >
                          <option value="">Select...</option>
                          {question.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreateVendor}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Assessment
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({});
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {viewingVendor && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900">{viewingVendor.name}</h2>
            <button
              onClick={() => setViewingVendor(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Risk Score</p>
              <p className={`text-2xl mt-1 px-3 py-1 rounded inline-block ${getRiskColor(viewingVendor.riskScore)}`}>
                {viewingVendor.riskScore}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <select
                value={viewingVendor.status}
                onChange={(e) => handleUpdateStatus(viewingVendor.id, e.target.value as any)}
                disabled={!canWrite}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <h3 className="text-gray-900 mb-3">Responses</h3>
            <div className="space-y-3">
              {Object.entries(viewingVendor.responses).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-gray-900 text-sm">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 text-sm">Vendor Name</th>
              <th className="px-6 py-3 text-left text-gray-700 text-sm">Risk Score</th>
              <th className="px-6 py-3 text-left text-gray-700 text-sm">Status</th>
              <th className="px-6 py-3 text-left text-gray-700 text-sm">Submitted</th>
              <th className="px-6 py-3 text-right text-gray-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{vendor.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${getRiskColor(vendor.riskScore)}`}>
                    {vendor.riskScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {vendor.submittedAt ? new Date(vendor.submittedAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setViewingVendor(vendor)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => generatePublicLink(vendor.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Copy Public Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    {canWrite && (
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

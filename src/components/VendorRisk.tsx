import { useState } from 'react';
import { Users, Plus, Search, Filter, ExternalLink, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export function VendorRisk() {
  const [vendors, setVendors] = useState([
    { id: 1, name: 'TechCorp Solutions', risk: 'Low', score: 85, status: 'Approved', lastAssessment: '2025-10-15' },
    { id: 2, name: 'CloudServe Inc', risk: 'Medium', score: 68, status: 'Under Review', lastAssessment: '2025-11-01' },
    { id: 3, name: 'DataSafe Systems', risk: 'High', score: 45, status: 'Action Required', lastAssessment: '2025-09-20' },
    { id: 4, name: 'SecureNet Ltd', risk: 'Low', score: 92, status: 'Approved', lastAssessment: '2025-11-10' },
  ]);
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [newQuestionnaireOpen, setNewQuestionnaireOpen] = useState(false);
  const [publicFormOpen, setPublicFormOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

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
          <Dialog open={addVendorOpen} onOpenChange={setAddVendorOpen}>
            <DialogTrigger asChild>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Vendor
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Vendor Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="vendor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Industry</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Consulting</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Service Category</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Cloud Services</option>
                    <option>Data Processing</option>
                    <option>Software Development</option>
                    <option>Security Services</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                    Create Vendor
                  </button>
                  <button 
                    onClick={() => setAddVendorOpen(false)}
                    className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={publicFormOpen} onOpenChange={setPublicFormOpen}>
            <DialogTrigger asChild>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Generate Public Form
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Public Vendor Form</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-slate-600">
                  Generate a public link that vendors can use to submit their information and assessment questionnaires.
                </p>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Form Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Q4 2025 Vendor Assessment"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Expiration Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700 mb-2">Generated Link:</p>
                  <code className="text-xs text-blue-600 break-all">
                    https://grc.example.com/vendor-form/abc123xyz
                  </code>
                </div>
                <button className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Generate & Copy Link
                </button>
              </div>
            </DialogContent>
          </Dialog>

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
                  <button 
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setViewDetailsOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
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
        <Dialog open={newQuestionnaireOpen} onOpenChange={setNewQuestionnaireOpen}>
          <DialogTrigger asChild>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Create New Questionnaire
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Security Questionnaire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Questionnaire Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Cloud Service Provider Security Assessment"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe the purpose of this questionnaire..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Template</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>Blank Questionnaire</option>
                  <option>ISO 27001 Vendor Assessment</option>
                  <option>Cloud Security Assessment</option>
                  <option>Data Privacy Assessment</option>
                  <option>SOC 2 Vendor Review</option>
                </select>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm text-slate-700 mb-3">Add Questions</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded border border-slate-300 mb-2"
                      placeholder="Question 1"
                    />
                    <select className="w-full px-3 py-2 rounded border border-slate-300">
                      <option>Multiple Choice</option>
                      <option>Yes/No</option>
                      <option>Text Response</option>
                      <option>File Upload</option>
                    </select>
                  </div>
                </div>
                <button className="mt-3 text-purple-600 text-sm hover:text-purple-700">
                  + Add Another Question
                </button>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    alert('Questionnaire created successfully!');
                    setNewQuestionnaireOpen(false);
                  }}
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Questionnaire
                </button>
                <button 
                  onClick={() => setNewQuestionnaireOpen(false)}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendor Details Modal */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vendor Details - {selectedVendor?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Risk Level</p>
                <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(selectedVendor?.risk)}`}>
                  {selectedVendor?.risk}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedVendor?.status)}`}>
                  {selectedVendor?.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Risk Score</p>
                <p className="text-2xl text-slate-900">{selectedVendor?.score}/100</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Last Assessment</p>
                <p className="text-slate-900">{selectedVendor?.lastAssessment}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-slate-800 mb-3">Assessment History</h4>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="text-slate-700">Security Assessment 2025</span>
                  <span className="text-green-600 text-sm">Passed</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="text-slate-700">Data Privacy Review</span>
                  <span className="text-green-600 text-sm">Completed</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Initiate New Assessment
              </button>
              <button className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                Download Report
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
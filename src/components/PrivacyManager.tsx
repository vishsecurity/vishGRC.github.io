import { useState, useEffect } from 'react';
import { db, PrivacyRecord } from '../lib/db';
import { AuthService } from '../lib/auth';
import { Lock, Plus, Trash2, FileText, Shield, Clock, CheckCircle } from 'lucide-react';

type PrivacyType = 'ropa' | 'pii' | 'dpia' | 'consent' | 'dsar';

export function PrivacyManager() {
  const [records, setRecords] = useState<PrivacyRecord[]>([]);
  const [activeTab, setActiveTab] = useState<PrivacyType>('ropa');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const allRecords = await db.getAll<PrivacyRecord>('privacy');
    setRecords(allRecords);
  };

  const handleCreate = async () => {
    const newRecord: PrivacyRecord = {
      id: `privacy-${Date.now()}`,
      type: activeTab,
      data: formData,
      companyId: 'company-001',
      createdAt: new Date().toISOString(),
    };

    await db.add('privacy', newRecord);
    setShowForm(false);
    setFormData({});
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this record?')) {
      await db.delete('privacy', id);
      loadRecords();
    }
  };

  const canWrite = AuthService.hasPermission('privacy', 'write');

  const tabs = [
    { id: 'ropa' as PrivacyType, label: 'ROPA', icon: FileText, description: 'Records of Processing Activities' },
    { id: 'pii' as PrivacyType, label: 'PII Inventory', icon: Lock, description: 'Personal Information Inventory' },
    { id: 'dpia' as PrivacyType, label: 'DPIA', icon: Shield, description: 'Data Protection Impact Assessments' },
    { id: 'consent' as PrivacyType, label: 'Consent', icon: CheckCircle, description: 'Consent Management' },
    { id: 'dsar' as PrivacyType, label: 'DSAR', icon: Clock, description: 'Data Subject Access Requests' },
  ];

  const filteredRecords = records.filter(r => r.type === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Privacy Management</h1>
        <p className="text-gray-600">Manage GDPR and privacy compliance records</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowForm(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Tab Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 mb-1">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <p className="text-sm text-gray-600">{tabs.find(t => t.id === activeTab)?.description}</p>
          </div>
          {canWrite && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          )}
        </div>
      </div>

      {/* Forms */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-900 mb-4">New {tabs.find(t => t.id === activeTab)?.label} Record</h3>
          
          {activeTab === 'ropa' && <ROPAForm formData={formData} setFormData={setFormData} />}
          {activeTab === 'pii' && <PIIForm formData={formData} setFormData={setFormData} />}
          {activeTab === 'dpia' && <DPIAForm formData={formData} setFormData={setFormData} />}
          {activeTab === 'consent' && <ConsentForm formData={formData} setFormData={setFormData} />}
          {activeTab === 'dsar' && <DSARForm formData={formData} setFormData={setFormData} />}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Record
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

      {/* Records List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No records found. Create your first record to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {activeTab === 'ropa' && (
                    <>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Processing Activity</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Purpose</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Data Categories</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Legal Basis</th>
                    </>
                  )}
                  {activeTab === 'pii' && (
                    <>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Data Element</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Category</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Storage Location</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Retention Period</th>
                    </>
                  )}
                  {activeTab === 'dpia' && (
                    <>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Project Name</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Risk Level</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Completion Date</th>
                    </>
                  )}
                  {activeTab === 'consent' && (
                    <>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Data Subject</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Purpose</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Consent Given</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Date</th>
                    </>
                  )}
                  {activeTab === 'dsar' && (
                    <>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Request ID</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Type</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700 text-sm">Due Date</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-right text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {activeTab === 'ropa' && (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.data.activity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.purpose}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.dataCategories}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.legalBasis}</td>
                      </>
                    )}
                    {activeTab === 'pii' && (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.data.dataElement}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.storageLocation}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.retentionPeriod}</td>
                      </>
                    )}
                    {activeTab === 'dpia' && (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.data.projectName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            record.data.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                            record.data.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {record.data.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.status}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.completionDate}</td>
                      </>
                    )}
                    {activeTab === 'consent' && (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.data.dataSubject}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.purpose}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            record.data.consentGiven ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {record.data.consentGiven ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.date}</td>
                      </>
                    )}
                    {activeTab === 'dsar' && (
                      <>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.data.requestId}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.type}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            record.data.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            record.data.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {record.data.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.data.dueDate}</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      {canWrite && (
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Form Components
function ROPAForm({ formData, setFormData }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-700 mb-2">Processing Activity</label>
        <input
          type="text"
          value={formData.activity || ''}
          onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Purpose</label>
        <input
          type="text"
          value={formData.purpose || ''}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Data Categories</label>
        <input
          type="text"
          value={formData.dataCategories || ''}
          onChange={(e) => setFormData({ ...formData, dataCategories: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Legal Basis</label>
        <select
          value={formData.legalBasis || ''}
          onChange={(e) => setFormData({ ...formData, legalBasis: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="Consent">Consent</option>
          <option value="Contract">Contract</option>
          <option value="Legal Obligation">Legal Obligation</option>
          <option value="Vital Interests">Vital Interests</option>
          <option value="Public Task">Public Task</option>
          <option value="Legitimate Interests">Legitimate Interests</option>
        </select>
      </div>
    </div>
  );
}

function PIIForm({ formData, setFormData }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-700 mb-2">Data Element</label>
        <input
          type="text"
          value={formData.dataElement || ''}
          onChange={(e) => setFormData({ ...formData, dataElement: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Category</label>
        <select
          value={formData.category || ''}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="Name">Name</option>
          <option value="Contact">Contact</option>
          <option value="Financial">Financial</option>
          <option value="Health">Health</option>
          <option value="Biometric">Biometric</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Storage Location</label>
        <input
          type="text"
          value={formData.storageLocation || ''}
          onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Retention Period</label>
        <input
          type="text"
          value={formData.retentionPeriod || ''}
          onChange={(e) => setFormData({ ...formData, retentionPeriod: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function DPIAForm({ formData, setFormData }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-700 mb-2">Project Name</label>
        <input
          type="text"
          value={formData.projectName || ''}
          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Risk Level</label>
        <select
          value={formData.riskLevel || ''}
          onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Status</label>
        <select
          value={formData.status || ''}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Completion Date</label>
        <input
          type="date"
          value={formData.completionDate || ''}
          onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function ConsentForm({ formData, setFormData }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-700 mb-2">Data Subject</label>
        <input
          type="text"
          value={formData.dataSubject || ''}
          onChange={(e) => setFormData({ ...formData, dataSubject: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Purpose</label>
        <input
          type="text"
          value={formData.purpose || ''}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Consent Given</label>
        <select
          value={formData.consentGiven || ''}
          onChange={(e) => setFormData({ ...formData, consentGiven: e.target.value === 'true' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Date</label>
        <input
          type="date"
          value={formData.date || ''}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function DSARForm({ formData, setFormData }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-700 mb-2">Request ID</label>
        <input
          type="text"
          value={formData.requestId || ''}
          onChange={(e) => setFormData({ ...formData, requestId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Type</label>
        <select
          value={formData.type || ''}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="Access">Access</option>
          <option value="Rectification">Rectification</option>
          <option value="Erasure">Erasure</option>
          <option value="Restriction">Restriction</option>
          <option value="Portability">Portability</option>
          <option value="Objection">Objection</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Status</label>
        <select
          value={formData.status || ''}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Due Date</label>
        <input
          type="date"
          value={formData.dueDate || ''}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

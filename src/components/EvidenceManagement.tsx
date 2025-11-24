import { useState } from 'react';
import { FileText, Search, Filter, Download, Trash2, Eye, Calendar, User, Tag } from 'lucide-react';
import { EvidenceUpload } from './EvidenceUpload';
import { useEvidence, Evidence } from '../utils/useEvidence';

export function EvidenceManagement() {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { evidence: allEvidence, stats, downloadEvidence, deleteEvidence } = useEvidence(selectedCategory === 'all' ? undefined : selectedCategory);

  const categories = [
    { id: 'all', name: 'All Evidence', count: allEvidence.length },
    { id: 'compliance', name: 'Compliance', count: allEvidence.filter(e => e.category === 'compliance').length },
    { id: 'vapt', name: 'VAPT', count: allEvidence.filter(e => e.category === 'vapt').length },
    { id: 'vendor', name: 'Vendor Risk', count: allEvidence.filter(e => e.category === 'vendor').length },
    { id: 'privacy', name: 'Privacy', count: allEvidence.filter(e => e.category === 'privacy').length },
    { id: 'audit', name: 'Audit', count: allEvidence.filter(e => e.category === 'audit').length },
  ];

  const handleUploadComplete = () => {
    // Evidence will automatically refresh via the useEvidence hook
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip')) return '🗜️';
    return '📎';
  };

  const filteredEvidence = allEvidence.filter(evidence => {
    const matchesSearch = evidence.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evidence.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || evidence.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSize = allEvidence.reduce((acc, e) => acc + e.fileSize, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Evidence Management</h2>
        <p className="text-purple-100">
          Upload, organize, and manage all compliance and audit evidence
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Evidence</p>
              <p className="text-3xl text-purple-600">{allEvidence.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Size</p>
              <p className="text-3xl text-blue-600">{formatFileSize(totalSize)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">This Month</p>
              <p className="text-3xl text-green-600">
                {allEvidence.filter(e => {
                  const now = new Date();
                  const uploadDate = new Date(e.uploadDate);
                  return uploadDate.getMonth() === now.getMonth() &&
                         uploadDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Categories</p>
              <p className="text-3xl text-orange-600">
                {new Set(allEvidence.map(e => e.category)).size}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-4 transition-colors ${
              activeTab === 'upload'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Upload Evidence
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 px-6 py-4 transition-colors ${
              activeTab === 'manage'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Manage Evidence ({allEvidence.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'upload' ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm text-slate-700 mb-2">
                  Evidence Category
                </label>
                <select 
                  value={selectedCategory === 'all' ? 'compliance' : selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="compliance">Compliance</option>
                  <option value="vapt">VAPT</option>
                  <option value="vendor">Vendor Risk</option>
                  <option value="privacy">Privacy</option>
                  <option value="audit">Audit</option>
                </select>
              </div>

              <EvidenceUpload
                category={selectedCategory === 'all' ? 'compliance' : selectedCategory}
                onUploadComplete={handleUploadComplete}
                existingEvidence={[]}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search evidence by filename or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Evidence Grid */}
              {filteredEvidence.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvidence.map((evidence) => (
                    <div
                      key={evidence.id}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{getFileIcon(evidence.fileType)}</div>
                        <div className="flex gap-1">
                          <button
                            className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-green-100 text-green-600 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-slate-800 mb-2 line-clamp-1">{evidence.fileName}</h4>
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                        {evidence.description}
                      </p>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Tag className="w-3 h-3" />
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {evidence.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(evidence.uploadDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <User className="w-3 h-3" />
                          <span>{evidence.uploadedBy}</span>
                        </div>
                        <div className="text-slate-500">
                          {formatFileSize(evidence.fileSize)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-slate-800 mb-2">No Evidence Found</h3>
                  <p className="text-slate-600 text-sm">
                    {searchTerm
                      ? 'Try adjusting your search or filters'
                      : 'Upload evidence files to get started'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
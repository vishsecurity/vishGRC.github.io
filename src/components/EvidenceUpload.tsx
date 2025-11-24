import { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File, Download, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useEvidence, Evidence } from '../utils/useEvidence';

interface EvidenceUploadProps {
  category: string; // e.g., "compliance", "vapt", "vendor"
  entityId?: string; // ID of the control, finding, vendor, etc.
  onUploadComplete?: (evidence: Evidence) => void;
  existingEvidence?: Evidence[];
}

export function EvidenceUpload({ 
  category, 
  entityId, 
  onUploadComplete,
  existingEvidence = [] 
}: EvidenceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const { evidence: uploadedFiles, uploadEvidence, downloadEvidence, deleteEvidence } = useEvidence(category, entityId);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
    return <File className="w-5 h-5 text-slate-600" />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    
    for (const file of files) {
      const result = await uploadEvidence(file, category, description || 'No description provided', entityId);
      if (result && onUploadComplete) {
        onUploadComplete(result);
      }
    }

    setDescription('');
    setUploading(false);
  };

  const handleDelete = async (evidence: Evidence) => {
    await deleteEvidence(evidence);
  };

  const handleDownload = async (evidence: Evidence) => {
    await downloadEvidence(evidence);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`transition-colors ${
            isDragging ? 'bg-blue-50 border-blue-400' : 'bg-white'
          }`}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-blue-100">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-slate-800 mb-2">Upload Evidence Files</h3>
            <p className="text-sm text-slate-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip"
              />
              <span className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Select Files
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-3">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, ZIP (Max 50MB)
            </p>
          </div>

          {/* Description Field */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <label className="block text-sm text-slate-700 mb-2">
              Evidence Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or notes about this evidence..."
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {uploading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-slate-800 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Uploaded Evidence ({uploadedFiles.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {uploadedFiles.map((evidence) => (
              <div
                key={evidence.id}
                className="px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(evidence.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 truncate">{evidence.fileName}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span>{formatFileSize(evidence.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(evidence.uploadDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{evidence.uploadedBy}</span>
                      </div>
                      {evidence.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          {evidence.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(evidence)}
                      className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(evidence)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-slate-600 mb-1">Total Files</p>
            <p className="text-2xl text-blue-600">{uploadedFiles.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-slate-600 mb-1">Total Size</p>
            <p className="text-2xl text-green-600">
              {formatFileSize(uploadedFiles.reduce((acc, f) => acc + f.fileSize, 0))}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-slate-600 mb-1">Categories</p>
            <p className="text-2xl text-purple-600">
              {new Set(uploadedFiles.map(f => f.category)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
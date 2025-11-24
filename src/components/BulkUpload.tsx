import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

export function BulkUpload() {
  const [uploadType, setUploadType] = useState('controls');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadResults, setUploadResults] = useState<any>(null);

  const uploadTypes = [
    { id: 'controls', name: 'Compliance Controls', format: 'Excel/CSV' },
    { id: 'vendors', name: 'Vendor List', format: 'Excel/CSV' },
    { id: 'findings', name: 'VAPT Findings', format: 'Excel/CSV' },
    { id: 'users', name: 'User Accounts', format: 'Excel/CSV' },
    { id: 'assets', name: 'Asset Inventory', format: 'Excel/CSV' },
    { id: 'policies', name: 'Policy Documents', format: 'PDF/Word' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('processing');

    // Simulate processing
    setTimeout(() => {
      setUploadStatus('success');
      setUploadResults({
        total: 150,
        successful: 145,
        failed: 5,
        warnings: 12,
      });
    }, 2000);
  };

  const downloadTemplate = () => {
    // This would download a template file
    alert(`Downloading ${uploadType} template...`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Bulk Upload Manager</h2>
        <p className="text-indigo-100">
          Import multiple records at once using Excel, CSV, or JSON files
        </p>
      </div>

      {/* Upload Type Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4">Select Upload Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {uploadTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setUploadType(type.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                uploadType === type.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <FileText className={`w-6 h-6 mb-2 ${uploadType === type.id ? 'text-indigo-600' : 'text-slate-400'}`} />
              <p className="text-slate-800">{type.name}</p>
              <p className="text-slate-500 text-sm mt-1">{type.format}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Download className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-blue-900 mb-2">Download Template</h4>
            <p className="text-blue-700 text-sm mb-4">
              Download a pre-formatted template with sample data and column headers to ensure successful import.
            </p>
            <button
              onClick={downloadTemplate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download {uploadTypes.find(t => t.id === uploadType)?.name} Template
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors">
          <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-slate-800 mb-2">Drag and drop your file here</h3>
          <p className="text-slate-500 mb-6">or click to browse</p>
          
          <label className="inline-block">
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv,.json"
              onChange={handleFileUpload}
            />
            <span className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg cursor-pointer hover:shadow-lg transition-all inline-block">
              Select File
            </span>
          </label>

          <p className="text-slate-400 text-sm mt-4">
            Supported formats: Excel (.xlsx, .xls), CSV (.csv), JSON (.json)
          </p>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus !== 'idle' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-slate-900 mb-4">Upload Status</h3>
          
          {uploadStatus === 'processing' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-800">Processing your file...</p>
            </div>
          )}

          {uploadStatus === 'success' && uploadResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-green-800">Upload completed successfully!</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 text-sm mb-1">Total Records</p>
                  <p className="text-2xl text-slate-900">{uploadResults.total}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-600 text-sm mb-1">Successful</p>
                  <p className="text-2xl text-green-700">{uploadResults.successful}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-red-600 text-sm mb-1">Failed</p>
                  <p className="text-2xl text-red-700">{uploadResults.failed}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-600 text-sm mb-1">Warnings</p>
                  <p className="text-2xl text-yellow-700">{uploadResults.warnings}</p>
                </div>
              </div>

              {uploadResults.failed > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-900 mb-2">Failed Records</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>Row 15: Missing required field "Control ID"</li>
                        <li>Row 32: Invalid format for "Implementation Date"</li>
                        <li>Row 48: Duplicate control ID detected</li>
                        <li>Row 89: Status value not recognized</li>
                        <li>Row 102: Invalid risk level</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {uploadResults.warnings > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-900 mb-2">Warnings</h4>
                      <p className="text-yellow-700 text-sm">
                        12 records imported with warnings. Some optional fields were empty.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setUploadStatus('idle')}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Upload Another File
              </button>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-800">Upload failed. Please check your file format and try again.</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4">Upload Guidelines</h3>
        <div className="space-y-3 text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Use the downloaded template to ensure correct column headers and format</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Maximum file size: 10MB for Excel/CSV, 50MB for bulk JSON</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Date format: YYYY-MM-DD (e.g., 2025-11-21)</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Remove any empty rows at the end of your file</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Ensure all required fields are filled in (marked with * in template)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

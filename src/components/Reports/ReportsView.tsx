import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Upload, Download, Calendar, Filter, Search, Eye } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  report_type: string;
  file_path: string;
  file_type: string;
  file_size: number;
  report_date: string;
  description: string | null;
  vital_type_id: string | null;
  created_at: string;
}

interface VitalType {
  id: string;
  name: string;
}

const REPORT_TYPES = [
  'Blood Test',
  'X-Ray',
  'MRI',
  'CT Scan',
  'Ultrasound',
  'ECG',
  'Prescription',
  'Vaccination',
  'Other',
];

export function ReportsView() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [vitalTypes, setVitalTypes] = useState<VitalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    report_type: '',
    report_date: new Date().toISOString().slice(0, 10),
    description: '',
    vital_type_id: '',
    file: null as File | null,
  });

  useEffect(() => {
    loadVitalTypes();
    loadReports();
  }, [user, filterType, filterStartDate, filterEndDate]);

  const loadVitalTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('vital_types')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setVitalTypes(data || []);
    } catch (error) {
      console.error('Error loading vital types:', error);
    }
  };

  const loadReports = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('report_date', { ascending: false });

      if (filterType) {
        query = query.eq('report_type', filterType);
      }

      if (filterStartDate) {
        query = query.gte('report_date', filterStartDate);
      }

      if (filterEndDate) {
        query = query.lte('report_date', filterEndDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF and image files (JPEG, PNG) are allowed');
        return;
      }

      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.file) return;

    setUploading(true);

    try {
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('health-reports')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('reports').insert([
        {
          user_id: user.id,
          title: formData.title,
          report_type: formData.report_type,
          file_path: fileName,
          file_type: formData.file.type,
          file_size: formData.file.size,
          report_date: formData.report_date,
          description: formData.description || null,
          vital_type_id: formData.vital_type_id || null,
        },
      ]);

      if (insertError) throw insertError;

      setFormData({
        title: '',
        report_type: '',
        report_date: new Date().toISOString().slice(0, 10),
        description: '',
        vital_type_id: '',
        file: null,
      });
      setShowUploadForm(false);
      loadReports();
    } catch (error: any) {
      alert(error.message || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('health-reports')
        .download(report.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.${report.file_path.split('.').pop()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to download report');
    }
  };

  const handleView = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('health-reports')
        .createSignedUrl(report.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to view report');
    }
  };

  const filteredReports = reports.filter((report) =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Reports</h1>
            <p className="text-gray-600 mt-1">Upload and manage your medical reports</p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Upload size={20} />
          <span>Upload Report</span>
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Report</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Annual Blood Test Results"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={formData.report_type}
                  onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select report type</option>
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Date
                </label>
                <input
                  type="date"
                  value={formData.report_date}
                  onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associated Vital (Optional)
                </label>
                <select
                  value={formData.vital_type_id}
                  onChange={(e) => setFormData({ ...formData, vital_type_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  {vitalTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any additional notes about this report"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File (PDF or Image, max 10MB)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {formData.file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Report'}
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-2">
            <Search size={20} className="text-gray-600" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              placeholder="Start Date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              placeholder="End Date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            {(filterType || filterStartDate || filterEndDate || searchTerm) && (
              <button
                onClick={() => {
                  setFilterType('');
                  setFilterStartDate('');
                  setFilterEndDate('');
                  setSearchTerm('');
                }}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            {searchTerm || filterType || filterStartDate || filterEndDate
              ? 'No reports match your filters'
              : 'No reports uploaded yet. Upload your first health report!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.report_type}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                    {report.file_type.includes('pdf') ? 'PDF' : 'Image'}
                  </span>
                </div>

                {report.description && (
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <Calendar size={14} />
                  <span>{new Date(report.report_date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{formatFileSize(report.file_size)}</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(report)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDownload(report)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

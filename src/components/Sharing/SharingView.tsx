import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Share2, Users, Trash2, Clock, UserPlus, FileText } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  report_type: string;
  report_date: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

interface Share {
  id: string;
  report_id: string;
  shared_with_id: string;
  access_level: string;
  shared_at: string;
  expires_at: string | null;
  report: Report;
  shared_with: Profile;
}

export function SharingView() {
  const { user } = useAuth();
  const [shares, setShares] = useState<Share[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareForm, setShowShareForm] = useState(false);
  const [formData, setFormData] = useState({
    report_id: '',
    email: '',
    expires_at: '',
  });

  useEffect(() => {
    loadReports();
    loadShares();
  }, [user]);

  const loadReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id, title, report_type, report_date')
        .eq('user_id', user.id)
        .order('report_date', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadShares = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('report_shares')
        .select(`
          id,
          report_id,
          shared_with_id,
          access_level,
          shared_at,
          expires_at,
          reports (id, title, report_type, report_date),
          profiles!report_shares_shared_with_id_fkey (id, email, full_name)
        `)
        .eq('owner_id', user.id)
        .order('shared_at', { ascending: false });

      if (error) throw error;

      setShares(
        (data || []).map((share: any) => ({
          id: share.id,
          report_id: share.report_id,
          shared_with_id: share.shared_with_id,
          access_level: share.access_level,
          shared_at: share.shared_at,
          expires_at: share.expires_at,
          report: share.reports,
          shared_with: share.profiles,
        }))
      );
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        alert('No user found with that email address');
        return;
      }

      if (profileData.id === user.id) {
        alert('You cannot share a report with yourself');
        return;
      }

      const { error } = await supabase.from('report_shares').insert([
        {
          report_id: formData.report_id,
          owner_id: user.id,
          shared_with_id: profileData.id,
          access_level: 'viewer',
          expires_at: formData.expires_at || null,
        },
      ]);

      if (error) {
        if (error.code === '23505') {
          alert('This report is already shared with that user');
        } else {
          throw error;
        }
        return;
      }

      setFormData({
        report_id: '',
        email: '',
        expires_at: '',
      });
      setShowShareForm(false);
      loadShares();
    } catch (error: any) {
      alert(error.message || 'Failed to share report');
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to revoke this access?')) return;

    try {
      const { error } = await supabase
        .from('report_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      loadShares();
    } catch (error: any) {
      alert(error.message || 'Failed to delete share');
    }
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
          <Share2 className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Sharing</h1>
            <p className="text-gray-600 mt-1">Manage access to your health reports</p>
          </div>
        </div>
        <button
          onClick={() => setShowShareForm(!showShareForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={20} />
          <span>Share Report</span>
        </button>
      </div>

      {showShareForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Report with Someone</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Report
              </label>
              <select
                value={formData.report_id}
                onChange={(e) => setFormData({ ...formData, report_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a report to share</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.title} ({report.report_type}) - {new Date(report.report_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="doctor@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                They must have an account to view the report
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for permanent access
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                Share Report
              </button>
              <button
                type="button"
                onClick={() => setShowShareForm(false)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Active Shares</h2>
        </div>

        {shares.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            No reports shared yet. Share a report to grant others access to your health data.
          </p>
        ) : (
          <div className="space-y-4">
            {shares.map((share) => {
              const isExpired = share.expires_at && new Date(share.expires_at) < new Date();
              return (
                <div
                  key={share.id}
                  className={`p-4 border rounded-lg ${
                    isExpired ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText size={18} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{share.report.title}</h3>
                        {isExpired && (
                          <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded font-medium">
                            Expired
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Report Type:</span> {share.report.report_type}
                        </p>
                        <p>
                          <span className="font-medium">Shared with:</span> {share.shared_with.full_name} ({share.shared_with.email})
                        </p>
                        <p>
                          <span className="font-medium">Access Level:</span> {share.access_level}
                        </p>
                        <div className="flex items-center space-x-4">
                          <p className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            Shared on {new Date(share.shared_at).toLocaleDateString()}
                          </p>
                          {share.expires_at && (
                            <p className={isExpired ? 'text-red-600 font-medium' : ''}>
                              {isExpired ? 'Expired' : 'Expires'} on {new Date(share.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteShare(share.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Revoke access"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

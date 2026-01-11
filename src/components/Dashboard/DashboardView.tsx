import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, FileText, TrendingUp, Users } from 'lucide-react';

interface DashboardStats {
  totalVitals: number;
  totalReports: number;
  sharedReports: number;
  recentVitals: Array<{
    id: string;
    value: number;
    measured_at: string;
    vital_type: { name: string; unit: string };
  }>;
}

export function DashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalVitals: 0,
    totalReports: 0,
    sharedReports: 0,
    recentVitals: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [vitalsRes, reportsRes, sharesRes, recentVitalsRes] = await Promise.all([
        supabase.from('vitals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('report_shares').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
        supabase
          .from('vitals')
          .select('id, value, measured_at, vital_types(name, unit)')
          .eq('user_id', user.id)
          .order('measured_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalVitals: vitalsRes.count || 0,
        totalReports: reportsRes.count || 0,
        sharedReports: sharesRes.count || 0,
        recentVitals: (recentVitalsRes.data || []).map((v: any) => ({
          id: v.id,
          value: v.value,
          measured_at: v.measured_at,
          vital_type: v.vital_types,
        })),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vitals',
      value: stats.totalVitals,
      icon: Activity,
      color: 'bg-blue-500',
    },
    {
      title: 'Health Reports',
      value: stats.totalReports,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Shared Reports',
      value: stats.sharedReports,
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your health wallet overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Recent Vitals</h2>
        </div>

        {stats.recentVitals.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No vitals recorded yet. Start tracking your health!</p>
        ) : (
          <div className="space-y-4">
            {stats.recentVitals.map((vital) => (
              <div key={vital.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{vital.vital_type.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(vital.measured_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {vital.value} {vital.vital_type.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

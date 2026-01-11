import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Plus, TrendingUp, Calendar, Filter } from 'lucide-react';

interface VitalType {
  id: string;
  name: string;
  unit: string;
  normal_range_min: number | null;
  normal_range_max: number | null;
}

interface Vital {
  id: string;
  value: number;
  measured_at: string;
  notes: string | null;
  vital_type: VitalType;
}

export function VitalsView() {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [vitalTypes, setVitalTypes] = useState<VitalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVitalType, setSelectedVitalType] = useState('');
  const [filterVitalType, setFilterVitalType] = useState('');
  const [formData, setFormData] = useState({
    vital_type_id: '',
    value: '',
    measured_at: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  useEffect(() => {
    loadVitalTypes();
    loadVitals();
  }, [user, filterVitalType]);

  const loadVitalTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('vital_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setVitalTypes(data || []);
    } catch (error) {
      console.error('Error loading vital types:', error);
    }
  };

  const loadVitals = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('vitals')
        .select('*, vital_types(*)')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false });

      if (filterVitalType) {
        query = query.eq('vital_type_id', filterVitalType);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVitals(
        (data || []).map((v: any) => ({
          id: v.id,
          value: v.value,
          measured_at: v.measured_at,
          notes: v.notes,
          vital_type: v.vital_types,
        }))
      );
    } catch (error) {
      console.error('Error loading vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('vitals').insert([
        {
          user_id: user.id,
          vital_type_id: formData.vital_type_id,
          value: parseFloat(formData.value),
          measured_at: new Date(formData.measured_at).toISOString(),
          notes: formData.notes || null,
        },
      ]);

      if (error) throw error;

      setFormData({
        vital_type_id: '',
        value: '',
        measured_at: new Date().toISOString().slice(0, 16),
        notes: '',
      });
      setShowAddForm(false);
      loadVitals();
    } catch (error: any) {
      alert(error.message || 'Failed to add vital');
    }
  };

  const getVitalStatus = (value: number, vitalType: VitalType) => {
    if (!vitalType.normal_range_min || !vitalType.normal_range_max) return 'neutral';

    if (value < vitalType.normal_range_min || value > vitalType.normal_range_max) {
      return 'warning';
    }
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <Activity className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vitals Tracking</h1>
            <p className="text-gray-600 mt-1">Monitor your health metrics over time</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Add Vital</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Record New Vital</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vital Type
                </label>
                <select
                  value={formData.vital_type_id}
                  onChange={(e) =>
                    setFormData({ ...formData, vital_type_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select vital type</option>
                  {vitalTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Measured At
                </label>
                <input
                  type="datetime-local"
                  value={formData.measured_at}
                  onChange={(e) =>
                    setFormData({ ...formData, measured_at: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                Save Vital
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Your Vitals History</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterVitalType}
              onChange={(e) => setFilterVitalType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Vitals</option>
              {vitalTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {vitals.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            No vitals recorded yet. Start tracking your health by adding your first vital!
          </p>
        ) : (
          <div className="space-y-3">
            {vitals.map((vital) => {
              const status = getVitalStatus(vital.value, vital.vital_type);
              return (
                <div
                  key={vital.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{vital.vital_type.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                        {status === 'normal' ? 'Normal' : status === 'warning' ? 'Out of Range' : 'Recorded'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(vital.measured_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {vital.notes && (
                        <p className="text-sm text-gray-600">Note: {vital.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {vital.value} {vital.vital_type.unit}
                    </p>
                    {vital.vital_type.normal_range_min && vital.vital_type.normal_range_max && (
                      <p className="text-xs text-gray-500">
                        Normal: {vital.vital_type.normal_range_min}-{vital.vital_type.normal_range_max}
                      </p>
                    )}
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

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Clock, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Activity {
  id: string;
  name: string;
  type: 'irrigation' | 'fertilization' | 'pesticide' | 'harvesting' | 'planting' | 'weeding' | 'other';
  date: string;
  time: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  farmId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivitySchedulerProps {
  farmId?: string;
}

const ActivityScheduler: React.FC<ActivitySchedulerProps> = ({ farmId }) => {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'irrigation' as Activity['type'],
    date: '',
    time: '',
    description: '',
    priority: 'medium' as Activity['priority'],
    status: 'pending' as Activity['status'],
  });

  useEffect(() => {
    loadActivities();
  }, [farmId]);

  const loadActivities = () => {
    const savedActivities = localStorage.getItem(`activities_${farmId || 'default'}`);
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    } else {
      // Sample activities
      const sampleActivities: Activity[] = [
        {
          id: '1',
          name: 'Morning Irrigation',
          type: 'irrigation',
          date: new Date().toISOString().split('T')[0],
          time: '06:00',
          description: 'Water the crops in the morning for optimal absorption',
          priority: 'high',
          status: 'pending',
          farmId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Fertilizer Application',
          type: 'fertilization',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '08:00',
          description: 'Apply NPK fertilizer to boost crop growth',
          priority: 'medium',
          status: 'pending',
          farmId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Pest Control Spray',
          type: 'pesticide',
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          time: '17:00',
          description: 'Apply organic pesticide to prevent pest infestation',
          priority: 'high',
          status: 'pending',
          farmId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setActivities(sampleActivities);
      saveActivities(sampleActivities);
    }
  };

  const saveActivities = (activitiesToSave: Activity[]) => {
    localStorage.setItem(`activities_${farmId || 'default'}`, JSON.stringify(activitiesToSave));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const activity: Activity = {
      id: editingActivity?.id || Date.now().toString(),
      ...formData,
      farmId,
      createdAt: editingActivity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedActivities;
    if (editingActivity) {
      updatedActivities = activities.map(a => a.id === editingActivity.id ? activity : a);
    } else {
      updatedActivities = [...activities, activity];
    }

    setActivities(updatedActivities);
    saveActivities(updatedActivities);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'irrigation',
      date: '',
      time: '',
      description: '',
      priority: 'medium',
      status: 'pending',
    });
    setEditingActivity(null);
    setShowModal(false);
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      name: activity.name,
      type: activity.type,
      date: activity.date,
      time: activity.time,
      description: activity.description,
      priority: activity.priority,
      status: activity.status,
    });
    setEditingActivity(activity);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    const updatedActivities = activities.filter(a => a.id !== id);
    setActivities(updatedActivities);
    saveActivities(updatedActivities);
  };

  const handleStatusChange = (id: string, status: Activity['status']) => {
    const updatedActivities = activities.map(a => 
      a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a
    );
    setActivities(updatedActivities);
    saveActivities(updatedActivities);
  };

  const getFilteredActivities = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'today':
        return activities.filter(a => a.date === today);
      case 'upcoming':
        return activities.filter(a => a.date > today && a.status !== 'completed');
      case 'completed':
        return activities.filter(a => a.status === 'completed');
      default:
        return activities;
    }
  };

  const getActivityTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'irrigation': return '💧';
      case 'fertilization': return '🌱';
      case 'pesticide': return '🛡️';
      case 'harvesting': return '🌾';
      case 'planting': return '🌱';
      case 'weeding': return '🌿';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-800';
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'in-progress': return 'text-blue-400 bg-blue-900/20 border-blue-800';
      case 'cancelled': return 'text-red-400 bg-red-900/20 border-red-800';
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{t('title')}</h3>
            <p className="text-zinc-400 text-sm">
              {filteredActivities.length} activities
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addActivity')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'today', label: t('today') },
          { key: 'upcoming', label: t('upcoming') },
          { key: 'completed', label: t('completed') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-400 mb-2">No activities found</p>
            <p className="text-zinc-500 text-sm">Add your first activity to get started</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">{getActivityTypeIcon(activity.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-medium">{activity.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activity.time}
                      </div>
                      <div className="capitalize">
                        {activity.type.replace('-', ' ')}
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-zinc-300 text-sm">{activity.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activity.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(activity.id, 'completed')}
                      className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(activity)}
                    className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-800">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingActivity ? t('editActivity') : t('addActivity')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  {t('activityName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  {t('activityType')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Activity['type'] })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="irrigation">Irrigation</option>
                  <option value="fertilization">Fertilization</option>
                  <option value="pesticide">Pesticide</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="planting">Planting</option>
                  <option value="weeding">Weeding</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('date')}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('time')}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  {t('priority')}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Activity['priority'] })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityScheduler;
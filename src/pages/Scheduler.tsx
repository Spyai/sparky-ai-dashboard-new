import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserFarms } from '../lib/supabase';
import { Farm } from '../types';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import FarmSelector from '../components/Dashboard/FarmSelector';
import ActivityScheduler from '../components/Scheduler/ActivityScheduler';

const Scheduler: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, [user?.phone]);

  const fetchFarms = async () => {
    if (!user?.phone) return;

    try {
      const { data, error } = await getUserFarms(user.phone);
      if (error) throw error;
      
      setFarms(data || []);
      if (data && data.length > 0) {
        setSelectedFarm(data[0]);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarm = () => {
    window.location.href = '/farm-setup';
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-black'>
        <img src="https://www.sparkyai.in/lovable-uploads/5422e3a0-c113-4836-83dc-61eb88a401d4.png" alt="" className='h-24 animate-pulse' />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mx-auto space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
              <FarmSelector
                farms={farms}
                selectedFarm={selectedFarm}
                onSelectFarm={setSelectedFarm}
                onAddFarm={handleAddFarm}
              />
            </div>

            {selectedFarm ? (
              <ActivityScheduler farmId={selectedFarm.id} />
            ) : (
              <div className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                <p className="mb-2 text-zinc-400">{t('dashboard.noFarms')}</p>
                <button
                  onClick={handleAddFarm}
                  className="px-6 py-3 font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
                >
                  {t('dashboard.createFarm')}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Scheduler;
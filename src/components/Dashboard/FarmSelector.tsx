import React, { useState } from 'react';
import { ChevronDown, Plus, MapPin } from 'lucide-react';
import { Farm } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface FarmSelectorProps {
  farms: Farm[];
  selectedFarm: Farm | null;
  onSelectFarm: (farm: Farm) => void;
  onAddFarm: () => void;
}

const FarmSelector: React.FC<FarmSelectorProps> = ({
  farms,
  selectedFarm,
  onSelectFarm,
  onAddFarm,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors border rounded-lg sm:gap-3 sm:px-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 sm:text-base"
      >
        <MapPin className="flex-shrink-0 w-4 h-4" />
        <span className="font-medium truncate max-w-[120px] sm:max-w-none">
          {selectedFarm ? selectedFarm.farm_name : t('dashboard.selectFarm')}
        </span>
        <ChevronDown className="flex-shrink-0 w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-64 mt-2 border rounded-lg shadow-lg sm:left-0 top-full bg-zinc-800 border-zinc-700">
          <div className="p-2">
            {farms.map((farm) => (
              <button
                key={farm.id}
                onClick={() => {
                  onSelectFarm(farm);
                  setIsOpen(false);
                }}
                className="flex items-center w-full gap-3 p-3 text-left transition-colors rounded-lg hover:bg-zinc-700"
              >
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-500 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{farm.farm_name}</p>
                  <p className="text-sm truncate text-zinc-400">{farm.location}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-zinc-700">
            <button
              onClick={() => alert(t('Upcoming feature: Add Farm'))}
              className="flex items-center w-full gap-3 p-3 text-left text-green-500 transition-colors rounded-lg hover:bg-zinc-700"
            >
              <div>
                Feature coming soon!
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmSelector;
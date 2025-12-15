import type { Backend } from '../types';

interface BackendSelectorProps {
  selected: Backend;
  onSelect: (backend: Backend) => void;
}

export function BackendSelector({ selected, onSelect }: BackendSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
        Step 1: Choose Your Backend
      </h2>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => onSelect('supabase')}
          className={`flex-1 p-4 sm:p-6 rounded-lg border-2 transition-all ${
            selected === 'supabase'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold text-gray-900">Supabase</div>
          <div className="text-sm text-gray-500 mt-1">PostgreSQL + Auth</div>
        </button>
        <button
          onClick={() => onSelect('firebase')}
          className={`flex-1 p-4 sm:p-6 rounded-lg border-2 transition-all ${
            selected === 'firebase'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xl sm:text-2xl font-bold text-gray-900">Firebase</div>
          <div className="text-sm text-gray-500 mt-1">Firestore + Auth</div>
        </button>
      </div>
    </div>
  );
}

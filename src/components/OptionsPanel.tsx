import type { GeneratorOptions } from '../types';

interface OptionsPanelProps {
  options: GeneratorOptions;
  onChange: (options: GeneratorOptions) => void;
}

export function OptionsPanel({ options, onChange }: OptionsPanelProps) {
  const toggle = (key: keyof Omit<GeneratorOptions, 'backend'>) => {
    onChange({ ...options, [key]: !options[key] });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
        Step 2: Select Options
      </h2>
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeSessionTracking}
            onChange={() => toggle('includeSessionTracking')}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="text-gray-700">
            Session tracking (first login, last login, count)
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeEnvExample}
            onChange={() => toggle('includeEnvExample')}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="text-gray-700">Include .env.example file</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeSchema}
            onChange={() => toggle('includeSchema')}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="text-gray-700">Include database schema</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeLoginButton}
            onChange={() => toggle('includeLoginButton')}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="text-gray-700">Include styled Google login button</span>
        </label>
      </div>
    </div>
  );
}

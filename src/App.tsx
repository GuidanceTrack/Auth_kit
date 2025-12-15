import { useState } from 'react';
import { Header } from './components/Header';
import { BackendSelector } from './components/BackendSelector';
import { OptionsPanel } from './components/OptionsPanel';
import { FilePreview } from './components/FilePreview';
import { DownloadButton } from './components/DownloadButton';
import { Instructions } from './components/Instructions';
import type { GeneratorOptions } from './types';

function App() {
  const [options, setOptions] = useState<GeneratorOptions>({
    backend: 'supabase',
    includeSessionTracking: true,
    includeEnvExample: true,
    includeSchema: true,
    includeLoginButton: true,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Header />

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-6 sm:space-y-8">
          <BackendSelector
            selected={options.backend}
            onSelect={(backend) => setOptions({ ...options, backend })}
          />

          <OptionsPanel options={options} onChange={setOptions} />

          <DownloadButton options={options} />

          <hr className="border-gray-200" />

          <FilePreview options={options} />

          <hr className="border-gray-200" />

          <Instructions backend={options.backend} />
        </div>
      </div>
    </div>
  );
}

export default App

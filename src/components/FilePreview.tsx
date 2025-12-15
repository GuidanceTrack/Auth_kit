import type { GeneratorOptions } from '../types';

interface FilePreviewProps {
  options: GeneratorOptions;
}

export function FilePreview({ options }: FilePreviewProps) {
  const files = [
    'AuthProvider.tsx',
    'useAuth.ts',
    options.includeLoginButton && 'GoogleLoginButton.tsx',
    'client.ts',
    options.includeSessionTracking && 'sessionTracker.ts',
    'types.ts',
    options.includeEnvExample && '.env.example',
    options.includeSchema &&
      (options.backend === 'supabase' ? 'schema.sql' : 'firestore-rules.txt'),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
        Preview: Files included in your download
      </h2>
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
        <div className="text-gray-600">📁 auth/</div>
        {files.map((file) => (
          <div key={file} className="text-gray-700 ml-6">
            ├── {file}
          </div>
        ))}
      </div>
    </div>
  );
}

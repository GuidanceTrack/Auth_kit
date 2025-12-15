import type { Backend } from '../types';

interface InstructionsProps {
  backend: Backend;
}

export function Instructions({ backend }: InstructionsProps) {
  const dependency =
    backend === 'supabase' ? '@supabase/supabase-js' : 'firebase';

  return (
    <div className="space-y-4 text-gray-700">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
        After downloading:
      </h2>
      <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base">
        <li>Extract the ZIP to your project's src/auth/ folder</li>
        <li className="break-words">
          Install the dependency:{' '}
          <code className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm break-all">
            npm install {dependency}
          </code>
        </li>
        <li>Copy .env.example to .env and fill in your credentials</li>
        {backend === 'supabase' && (
          <li>Run schema.sql in your Supabase SQL Editor</li>
        )}
        {backend === 'firebase' && (
          <li>Apply firestore-rules.txt in Firebase Console</li>
        )}
        <li>Wrap your app with AuthProvider</li>
        <li>Use the useAuth hook in your components</li>
      </ol>
    </div>
  );
}

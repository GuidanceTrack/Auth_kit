import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { GeneratorOptions } from '../types';
import { getSupabaseTemplates } from '../templates/supabase';
import { getFirebaseTemplates } from '../templates/firebase';

export async function generateZip(options: GeneratorOptions): Promise<void> {
  const zip = new JSZip();
  const authFolder = zip.folder('auth');

  if (!authFolder) {
    throw new Error('Failed to create auth folder in ZIP');
  }

  const templates =
    options.backend === 'supabase'
      ? getSupabaseTemplates(options)
      : getFirebaseTemplates(options);

  for (const file of templates) {
    authFolder.file(file.name, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `auth-${options.backend}.zip`);
}

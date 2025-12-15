export type Backend = 'supabase' | 'firebase';

export interface GeneratorOptions {
  backend: Backend;
  includeSessionTracking: boolean;
  includeEnvExample: boolean;
  includeSchema: boolean;
  includeLoginButton: boolean;
}

export interface GeneratedFile {
  name: string;
  content: string;
}

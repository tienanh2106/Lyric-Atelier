import { defineConfig } from 'orval';
import { loadEnv } from 'vite';

const env = loadEnv('development', '.', '');

export default defineConfig({
  'lyric-atelier': {
    input: {
      target: `${env.VITE_API_BASE_URL}/api/docs-json`,
    },
    output: {
      target: './src/services/endpoints',
      schemas: './src/services/models',
      client: 'react-query',
      mode: 'tags',
      override: {
        mutator: {
          path: './src/services/custom-instance.ts',
          name: 'axiosInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
});

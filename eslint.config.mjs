import { defineConfig, globalIgnores } from 'eslint/config';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';

// ESLint: aturan Next.js dan React Hooks dipakai langsung tanpa plugin yang tertinggal peer dependency.
export default defineConfig([
  nextPlugin.configs['core-web-vitals'],
  reactHooks.configs.flat.recommended,
  {
    rules: {
      // Media lokal, upload Member, SVG, GIF, dan poster memakai elemen img native.
      '@next/next/no-img-element': 'off',
      // Font root App Router dimuat satu kali melalui layout.
      '@next/next/no-page-custom-font': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**']),
]);

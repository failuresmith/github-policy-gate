import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/action-entry.ts',
  },
  bundle: true,
  clean: false,
  dts: false,
  format: ['cjs'],
  noExternal: [/^@actions\//],
  outDir: 'dist',
  platform: 'node',
  sourcemap: false,
  splitting: false,
  target: 'node20',
});

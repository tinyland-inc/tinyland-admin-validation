import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'tinyland-admin-validation',
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});

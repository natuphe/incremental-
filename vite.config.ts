import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages 公開時のみリポジトリ名付きパスを使う
  base: process.env.GITHUB_PAGES === 'true' ? '/incremental-/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})

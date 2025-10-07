import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',  // 👈 关键点：让 /assets/ 变成 ./assets/
  build: {
    outDir: 'dist'
  },
  plugins: [vue(),tailwindcss(),],
})

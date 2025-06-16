import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8064,
    host: true,
    proxy: {
      '/api-uaa': {
        target: 'http://127.0.0.1:9900',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('代理转发 /api-uaa:', path, '→', path)
          return path
        }
      },
      '/api/multi-table': {
        target: 'http://127.0.0.1:9900',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/multi-table/, '/multi-table-service')
      },
      '/api': {
        target: 'http://127.0.0.1:9900',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/store': resolve(__dirname, 'src/store'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/assets': resolve(__dirname, 'src/assets'),
      '@/pages': resolve(__dirname, 'src/pages')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          vtable: ['@visactor/vtable'],
          utils: ['lodash-es', 'dayjs']
        }
      }
    }
  },
  optimizeDeps: {
          include: ['@visactor/vtable']
  }
}) 
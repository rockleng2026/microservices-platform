import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      '/mall-center': {
        target: 'http://localhost:9900',
        changeOrigin: true,
        secure: false,
        headers: {
          'x-tenant-header': 'default'
        }
      }
    }
  }
})

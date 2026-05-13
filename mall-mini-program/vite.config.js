import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      // 代理 mall-center API 请求到网关（网关端口9900）
      '/mall-center': {
        target: 'http://localhost:9900',
        changeOrigin: true,
        secure: false
      },
      // 代理 api-mall 请求（如果使用）
      '/api-mall': {
        target: 'http://localhost:9900',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
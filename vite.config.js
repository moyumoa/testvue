import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'
import { resolve } from 'path'
// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 设置 `@` 指向 `src` 目录
      comps: resolve(__dirname, 'src/components') // 设置 `comps` 指向 `src` 目录
    }
  },
  css: {
    // css预处理
    preprocessorOptions: {
      scss: {
        /*
  			引入var.scss全局预定义变量，
  			如果引入多个文件，
  			可以使用
  			'@import "@/assets/scss/globalVariable1.scss";@import "@/assets/scss/globalVariable2.scss";'
  			这种格式
  			 */
        additionalData: `@use "@/styles/global.scss" as *;`
      }
    }
  },
  plugins: [
    vue(),
    eslintPlugin({
      include: ['src/**/*.vue', 'src/**/*.js'], // 检查的文件
      cache: false
    })
    // AutoImport({
    //   resolvers: [ElementPlusResolver()]
    // }),
    // Components({
    //   resolvers: [ElementPlusResolver()]
    // })
    // ElementPlus({
    //   useSource: true
    // })
  ],
  server: {
    open: true,
    proxy: {
      '/api': {
        // 测试
        target: 'http://175.178.68.193:30006'
        // 生产
        // target: 'http://114.132.216.157:30006'
        // 开发
        // target: 'http://192.168.99.6:30006'
        // target:'http://dev.tagvv.com/'
        // rewrite: path => path.replace(/^\/api/, '')
      },
      '/ws': {
        // 测试
        target: 'ws://175.178.68.193:30006',
        ws: true,
        secure: false,
        changeOrigin: true
      }
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境时移除console
        // drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    }
  }
})

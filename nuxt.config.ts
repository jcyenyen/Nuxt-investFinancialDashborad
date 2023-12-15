// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/style/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    '@element-plus/nuxt',
    'dayjs-nuxt',
    '@pinia/nuxt',
  ],
  plugins: [
    { src: '~/plugins/nprogress.client.js', mode: 'client' } // 指定為client插件
  ],
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/Nuxt-investFinancialDashborad/' : '/',
    buildAssetsDir: '/static/'
  }
})

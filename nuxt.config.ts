// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    // Simple usage
    'nuxt-highcharts',

    // With options
    ['nuxt-highcharts', { /* module options */ }]
  ],
  highcharts: {
    /* module options */
  }
})

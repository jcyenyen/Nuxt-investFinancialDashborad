import HighchartsVue from 'highcharts-vue'
import StockModule from "highcharts/modules/stock";
import Highcharts from "highcharts";
import axios from 'axios'
import VueAxios from 'vue-axios'
import SimpleTypeahead from 'vue3-simple-typeahead';
// import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'; 

export default defineNuxtPlugin((nuxtApp) => {
  // 股票模組化
  StockModule(Highcharts);
  // 這裡就是你提到的 use
  nuxtApp.vueApp.use(HighchartsVue)
                .use(VueAxios, axios)
                // .provide('axios', nuxtApp.vueApp.config.globalProperties.axios)  // provide 'axios'
                .provide('axios', axios)  // provide 'axios'
                .use(SimpleTypeahead)
})
import HighchartsVue from 'highcharts-vue'
import StockModule from "highcharts/modules/stock";
import Highcharts from "highcharts";
import axios from 'axios'
import VueAxios from 'vue-axios'
import SimpleTypeahead from 'vue3-simple-typeahead';

import indicators from 'highcharts/indicators/indicators';
import pc from "highcharts/indicators/price-channel";
import vwap from "highcharts/indicators/vwap";
import pe from "highcharts/indicators/price-envelopes";
import regressions from "highcharts/indicators/regressions";
import pivotpoints from "highcharts/indicators/pivot-points";
import vbp from "highcharts/indicators/volume-by-price";
import wma from "highcharts/indicators/wma";

import macd from 'highcharts/indicators/macd';
import ao from "highcharts/indicators/ao";
import atr from "highcharts/indicators/atr";
import cci from "highcharts/indicators/cci";
import disparityIndex from "highcharts/indicators/disparity-index";
import dmi from "highcharts/indicators/dmi";
import mfi from "highcharts/indicators/mfi";
import rsi from "highcharts/indicators/rsi";

// import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'; 

export default defineNuxtPlugin((nuxtApp) => {
  // 股票模組化
  StockModule(Highcharts)
  indicators(Highcharts)
  pc(Highcharts)
  vwap(Highcharts)
  pe(Highcharts)
  regressions(Highcharts)
  pivotpoints(Highcharts)
  vbp(Highcharts)
  wma(Highcharts)

  macd(Highcharts)
  ao(Highcharts)
  atr(Highcharts)
  cci(Highcharts)
  disparityIndex(Highcharts)
  dmi(Highcharts)
  mfi(Highcharts)
  rsi(Highcharts)

  // 這裡就是你提到的 use
  nuxtApp.vueApp.use(HighchartsVue)
    .use(VueAxios, axios)
    // .provide('axios', nuxtApp.vueApp.config.globalProperties.axios)  // provide 'axios'
    .provide('axios', axios)  // provide 'axios'
    .use(SimpleTypeahead)
})
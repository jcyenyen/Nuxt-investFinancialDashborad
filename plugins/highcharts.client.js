import HighchartsVue from 'highcharts-vue'
import StockModule from "highcharts/modules/stock";
import Highcharts from "highcharts";
import axios from 'axios'
import VueAxios from 'vue-axios'
import SimpleTypeahead from 'vue3-simple-typeahead';

// indicators indicators-all
import indicators from 'highcharts/indicators/indicators';
import indicatorsAll from 'highcharts/indicators/indicators-all';
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

// treemap
import treemap from "highcharts/modules/treemap";
import coloraxis from "highcharts/modules/coloraxis";
import heikinashi from "highcharts/modules/heikinashi";
import hollowcandlestick from "highcharts/modules/hollowcandlestick";

// gui
import stockTools from "highcharts/modules/stock-tools";
import "highcharts/css/stocktools/gui.css";
import annotations from "highcharts/modules/annotations";
import annotationsAdvanced from "highcharts/modules/annotations-advanced";
import dragPanes from "highcharts/modules/drag-panes";
import fullScreen from "highcharts/modules/full-screen";
import priceIndicator from "highcharts/modules/price-indicator";
import exportData from "highcharts/modules/export-data";
import exporting from "highcharts/modules/exporting";

// hollowcandlestick heikinashi

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faUserSecret,faCirclePlus,faCircleMinus,faMinus} from '@fortawesome/free-solid-svg-icons'

import { faSquareMinus,faSquarePlus } from '@fortawesome/free-regular-svg-icons'

// import 'vue3-simple-typeahead/dist/vue3-simple-typeahead.css'; 

export default defineNuxtPlugin((nuxtApp) => {
  // 股票模組化
  StockModule(Highcharts)
  indicators(Highcharts)
  indicatorsAll(Highcharts)
  // pc(Highcharts)
  // vwap(Highcharts)
  // pe(Highcharts)
  // regressions(Highcharts)
  // pivotpoints(Highcharts)
  // vbp(Highcharts)
  // wma(Highcharts)

  // macd(Highcharts)
  // ao(Highcharts)
  // atr(Highcharts)
  // cci(Highcharts)
  // disparityIndex(Highcharts)
  // dmi(Highcharts)
  // mfi(Highcharts)
  // rsi(Highcharts)

  heikinashi(Highcharts)
  hollowcandlestick(Highcharts)

  treemap(Highcharts)
  coloraxis(Highcharts)
  
  stockTools(Highcharts)
  annotations(Highcharts)
  annotationsAdvanced(Highcharts)
  dragPanes(Highcharts)
  fullScreen(Highcharts)
  priceIndicator(Highcharts)
  exportData(Highcharts)
  exporting(Highcharts)

  /* add icons to the library */
  library.add(faUserSecret,faCirclePlus,faCircleMinus,faMinus,faSquareMinus, faSquarePlus)

  // 這裡就是你提到的 use
  nuxtApp.vueApp
    .use(HighchartsVue)
    .use(VueAxios, axios)
    // .provide('axios', nuxtApp.vueApp.config.globalProperties.axios)  // provide 'axios'
    .provide('axios', axios)  // provide 'axios'
    .use(SimpleTypeahead)
    .component('font-awesome-icon', FontAwesomeIcon)
})
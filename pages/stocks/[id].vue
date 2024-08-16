<template>
  <NuxtLayout name="header">
    <template v-if="ohlc" #main>
      <article
        v-if="ohlc.length !== 0"
        class="w-[95%] mt-3 mx-auto flex justify-between"
      >
        <section class="w-[65%] h-[50%] rounded">
          <div class="flex justify-between w-[95%] mx-auto mt-4">
            <div class="my-1 w-[47%]">
              <label for="overlays" class="font-bold">覆蓋指標</label>
              <select
                class="border border-solid border-[#bebebe] rounded ms-2 w-[84%]"
                id="overlays"
                @change="chooseOverlays"
              >
                <option
                  v-for="(option, index) in overlaysOptions"
                  :key="index"
                  :value="option.value"
                  :selected="option.selected"
                >
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="my-1 w-[47%]">
              <label for="oscillators" class="font-bold">振蕩指標</label>
              <select
                class="border border-solid border-[#bebebe] rounded ms-2 w-[84%]"
                id="oscillators"
                @change="chooseOscillator"
              >
                <option
                  v-for="(option, index) in oscillatorOptions"
                  :key="index"
                  :value="option.value"
                  :selected="option.selected"
                >
                  {{ option.text }}
                </option>
              </select>
            </div>
          </div>
          <ClientOnly>
            <highcharts
              class="w-[95%] mx-auto my-10"
              :constructor-type="'stockChart'"
              :options="chartOptions"
              :callback="afterChartInit"
            />
          </ClientOnly>
        </section>
        <section class="w-[33%] flex flex-wrap">
          <ul
            v-for="(value, key) in filtedStockDetail"
            :key="key"
            class="w-[25%] mt-5"
          >
            <li
              class="flex items-center font-bold text-base italic min-h-[30px] stockborder"
            >
              {{ translateDetail(key) }}
            </li>
            <li
              class="flex items-start font-normal text-xs min-h-[60px] max-w-[90px] break-all"
            >
              {{ value }}
            </li>
          </ul>
        </section>
      </article>
      <article
        v-if="comparedStockChart.length !== 0"
        class="w-[95%] mx-auto mt-3 flex items-start justify-between"
      >
        <ClientOnly>
          <section class="w-[27%] border-0 border-y border-solid py-3">
            <div class="flex items-center">
              <figure
                class="p-1 flex items-center h-[70px] w-[43%] cursor-pointer"
              >
                <font-awesome-icon
                  :icon="['far', 'square-plus']"
                  size="2xl"
                  fade
                  style="color: black"
                  class="mx-2"
                  @click="toggleSearch"
                />
                <label
                  for="typeahead_chart"
                  @click="toggleSearch"
                  class="ms-1 text-[18px] w-[80%] font-bold cursor-pointer"
                  >股票績效比較</label
                >
              </figure>
              <vue3-simple-typeahead
                ref="inputRef"
                id="typeahead_chart"
                placeholder="搜尋股票..."
                v-if="isSearch"
                class="w-[98%] p-1 bg-white rounded shadow :active:border-white"
                :items="checkData"
                :minInputLength="1"
                v-model="searchAddStock"
                @onInput="updateCheckData"
                @keydown.native.enter="addChart"
                @selectItem="selectToAddChart"
              >
                <template #list-item-text="slot">
                  <div class="">
                    <span
                      v-html="
                        slot.boldMatchText(slot.itemProjection(slot.item))
                      "
                    ></span>
                  </div>
                </template>
              </vue3-simple-typeahead>
            </div>
            <div>
              <ul>
                <li
                  v-for="stock in multiComparedStockChart"
                  class="w-[75%] ms-[30px] flex items-center my-1 cursor-pointer"
                >
                  <div class="p-1">
                    <font-awesome-icon
                      :icon="['far', 'square-minus']"
                      style="color: black"
                      class="inline-block"
                      @click="removeChart(stock.name)"
                    />
                  </div>
                  <figure class="flex">
                    <img
                      :src="`https://financialmodelingprep.com/image-stock/${stock.name}.png`"
                      class="inline-block w-[20px] h-[20px] aspect-square mx-2"
                      :class="isAppleIcon(stock.name)"
                      @error="onError"
                    />
                    <figcaption>{{ stock.name }}</figcaption>
                  </figure>
                </li>
              </ul>
            </div>
          </section>
          <highcharts
            class="mb-10 w-[70%]"
            :constructor-type="'stockChart'"
            :options="multiChartOptions"
          />
        </ClientOnly>
      </article>
    </template>
  </NuxtLayout>
</template>
<script setup>
import { usePathStore } from '../stores/navBar.js'
import { storeToRefs } from 'pinia'
import {
  getStockFundamental,
  getStockTrend,
  searchStock,
} from '~/utils/apis/modules/stocks.js'

const dayjs = useDayjs()

// 所在頁面 header按鈕顯示顏色
const pathStore = usePathStore()
const { path } = storeToRefs(pathStore)
const route = useRoute()
path.value = route.name

const id = route.params.id

const stockDetail = ref()
const stockChart = ref()

const filtedStockDetail = computed(() => {
  stockDetail.value = stockDetail.value.map(
    ({
      exchange,
      description,
      zip,
      dcfDiff,
      dcf,
      image,
      defaultImage,
      isEtf,
      isActivelyTrading,
      isAdr,
      isFund,
      ipoDate,
      ...rest
    }) => rest
  )
  return stockDetail.value ? stockDetail.value[0] : []
})

const sortedStockChart = computed(() =>
  stockChart.value ? stockChart.value.reverse() : []
)

const ohlc = computed(() => {
  const data = sortedStockChart.value
    ? sortedStockChart.value.map((stock) => {
        const timeStamp = +dayjs(stock.date)
        const { open, high, low, close } = stock
        return [timeStamp, open, high, low, close]
      })
    : undefined
  return data
})

const volume = computed(() => {
  const data = sortedStockChart.value
    ? sortedStockChart.value.map((stock) => {
        const timeStamp = +dayjs(stock.date)
        return [timeStamp, stock.volume]
      })
    : []
  return data
})

const getData = async () => {
  const stockFundamental = await getStockFundamental(id)
  const stockTrend = await getStockTrend(id)
  stockDetail.value = stockFundamental
  stockChart.value = stockTrend.historical
}

onMounted(() => {
  getData()
})

// 技術線圖設定
const chartOptions = computed(() => {
  return {
    chart: {
      height: 600,
    },
    title: {
      text: `${id} 歷史資料`,
    },
    subtitle: {
      text: '所有指標',
    },
    // 無障礙模組
    accessibility: {
      enabled: false,
    },
    // 下方圓點圖例
    legend: {
      enabled: true,
    },
    rangeSelector: {
      // 預設第幾個:索引
      selected: 2,
    },
    yAxis: [
      {
        height: '60%',
      },
      {
        top: '60%',
        height: '20%',
      },
      {
        top: '80%',
        height: '20%',
      },
    ],
    plotOptions: {
      series: {
        showInLegend: true,
      },
    },
    stockTools: {
      gui: {
        enabled: true, // 啟用 GUI
        buttons: [
          'separator',
          'simpleShapes',
          'lines',
          'crookedLines',
          'measure',
          'advanced',
          'toggleAnnotations',
          'separator',
          'verticalLabels',
          'separator',
          'zoomChange',
          'fullScreen',
          'typeChange',
          'separator',
          'currentPriceIndicator',
        ],
      },
    },
    series: [
      {
        type: 'candlestick',
        id: `${id}`,
        name: `${id}`,
        data: ohlc.value,
      },
      {
        type: 'column',
        id: 'volume',
        name: '交易量',
        data: volume.value,
        yAxis: 1,
      },
      {
        type: 'pc',
        id: 'overlay',
        linkedTo: `${id}`, //主要指標基於的資料id
        yAxis: 0,
      },
      {
        type: 'macd',
        id: 'oscillator',
        linkedTo: `${id}`,
        yAxis: 2,
      },
    ],
  }
})

const chooseOverlays = ref()
const overlaysOptions = ref([
  { value: 'ema', text: 'EMA (Exponential Moving Average)' },
  { value: 'linearRegression', text: 'Linear Regression' },
  { value: 'pivotpoints', text: 'Pivot Points' },
  { value: 'pc', text: 'Price Channel', selected: true },
  { value: 'priceenvelopes', text: 'Price Envelopes' },
  { value: 'sma', text: 'SMA (Simple Moving Average)' },
  { value: 'vbp', text: 'VbP (Volume by Price)' },
  { value: 'wma', text: 'WMA (Weighted Moving Average)' },
  { value: 'vwap', text: 'VWAP (Volume Weighted Average Price)' },
])
const chooseOscillator = ref()
const oscillatorOptions = ref([
  { value: 'atr', text: 'ATR (Average True Range)' },
  { value: 'ao', text: 'Awesome oscillator' },
  { value: 'cci', text: 'CCI (Commodity Channel Index)' },
  { value: 'disparityindex', text: 'Disparity Index' },
  { value: 'dmi', text: 'DMI (Directional Movement Index)' },
  {
    value: 'macd',
    text: 'MACD (Moving Average Convergence Divergence)',
    selected: true,
  },
  { value: 'mfi', text: 'MFI (Money Flow Index)' },
  { value: 'rsi', text: 'RSI (Relative Strength Index)' },
])

// 取出highChartStock元件方法
const afterChartInit = (chart) => {
  // 更換覆蓋指標
  const overlays = (e) => {
    let series = chart.get('overlay')
    if (series) {
      series.remove(false)
      chart.addSeries({
        type: e.target.value,
        linkedTo: `${id}`,
        id: 'overlay',
      })
    }
  }

  // 更換技術指標
  const oscillator = (e) => {
    let series = chart.get('oscillator')
    if (series) {
      series.remove(false)
      chart.addSeries({
        type: e.target.value,
        linkedTo: `${id}`,
        id: 'oscillator',
        yAxis: 2,
      })
    }
  }
  chooseOverlays.value = overlays
  chooseOscillator.value = oscillator
}

// 股票績效比較
const comparedStockChart = computed(() => {
  const data = sortedStockChart.value
    ? sortedStockChart.value.map((stock) => {
        const timeStamp = +dayjs(stock.date)
        return [timeStamp, stock.close]
      })
    : []
  return data
})

const isSearch = ref(false)
const checkData = ref([])
const searchAddStock = ref('')

const multiComparedStockChart = ref([])

watchEffect(() => {
  multiComparedStockChart.value = comparedStockChart
    ? [
        {
          name: `${id.toUpperCase()}`,
          data: comparedStockChart.value,
        },
      ]
    : []
})

const inputRef = ref(null)
const selectToAddChart = (item) => {
  searchAddStock.value = item
  addChart()
  inputRef.value.clearInput()
}

const updateCheckData = async () => {
  const res = await searchStock(searchAddStock.value)
  checkData.value = res.map((stock) => stock.symbol)
}

const toggleSearch = async () => {
  isSearch.value = !isSearch.value
  //取消搜尋框enter預設
  await nextTick()
  inputRef.value.selectCurrentSelection = () => {}
}

const addChart = async () => {
  const res = await getStockTrend(searchAddStock.value);
  const newChart = res.historical?.reverse().map((v) => [+dayjs(v.date), v.close]);
  if (newChart?.length) {
    multiComparedStockChart.value.push({
      name: searchAddStock.value.toUpperCase(),
      data: newChart,
    });
  } else {
    ElMessageBox.confirm('無此檔股票,請重新搜尋', '提示', {
      showCancelButton: false,
      confirmButtonText: '確定',
      type: 'success',
    });
  }

  inputRef.value.clearInput();
};

const removeChart = (stock) => {
  multiComparedStockChart.value = multiComparedStockChart.value.filter(
    (item) => item.name !== stock
  );
};

// 績效圖表
const multiChartOptions = computed(() => {
  return {
    accessibility: {
      enabled: false,
    },
    chart: {
      height: 500,
    },
    // 預設選第五個選擇器(1y)
    rangeSelector: {
      selected: 4,
    },
    yAxis: {
      // y軸樣式
      labels: {
        format: '{#if (gt value 0)}+{/if}{value}%',
      },
      // 橫跨圖表的線
      plotLines: [
        {
          value: 0,
          width: 2,
          color: 'silver',
        },
      ],
    },
    stockTools: {
      gui: {
        enabled: false, // 啟用 GUI
      },
    },
    // 下方圓點圖例
    legend: {
      enabled: true,
    },
    plotOptions: {
      series: {
        //數值或是%數比較
        compare: 'percent',
        //圖是否秀在導航列
        showInNavigator: true,
      },
    },
    tooltip: {
      // 提示框的樣式
      pointFormat:
        '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
      // Y值小數點幾位
      valueDecimals: 2,
      // 提示框同時顯示
      split: true,
    },
    stockTools: {
      gui: {
        enabled: true, // 啟用 GUI
        buttons: [
          'indicators',
          'separator',
          'simpleShapes',
          'lines',
          'crookedLines',
          'measure',
          'advanced',
          'toggleAnnotations',
          'separator',
          'verticalLabels',
          'flags',
          'separator',
          'zoomChange',
          'fullScreen',
          'typeChange',
          'separator',
          'currentPriceIndicator',
          'saveChart',
        ],
      },
    },
    series: multiComparedStockChart.value,
  }
})

const translateDetail = (key) => {
  const translations = {
    symbol: '代號',
    price: '價格',
    beta: '貝塔值',
    volAvg: '平均成交量',
    mktCap: '市值',
    lastDiv: '股息',
    range: '範圍',
    changes: '變化',
    companyName: '公司名稱',
    currency: '幣別',
    cik: 'CIK',
    isin: 'ISIN',
    cusip: 'CUSIP',
    exchange: '交易所',
    exchangeShortName: '交易所',
    industry: '行業',
    website: '網站',
    description: '描述',
    ceo: '執行長',
    sector: '部門',
    country: '國家',
    fullTimeEmployees: '員工數',
    phone: '電話',
    address: '地址',
    city: '城市',
    state: '州',
    zip: '郵政編碼',
    dcfDiff: 'DCF差異',
    dcf: 'DCF',
    image: '圖像',
    ipoDate: '首次公開募股日期',
    defaultImage: '預設圖像',
    isEtf: '是交易所交易基金',
    isActivelyTrading: '正在積極交易',
    isAdr: '是美國存託憑證',
    isFund: '是基金',
  }
  return translations[key] || key
}

const isAppleIcon = (name) =>
  name == 'AAPL' ? 'bg-black p-1 rounded-[50%]' : ''



progressDone(ohlc)
</script>
<style lang="scss" scoped>
.stockborder {
  border-top: 1px solid black;
}
.testcolor {
  background-color: #f4ede2;
  background-color: #daeff2;
  background-color: #99d3e6;
  background-color: #6a8c94;
  background-color: #d5d8d4;
}

:deep(.simple-typeahead) {
  width: 60%;
}

:deep(.simple-typeahead-list) {
  width: 98% !important;
  border: 0.1rem solid black !important;
}

// :deep(.simple-typeahead-list-item-text) {
//     color: red;
//     font-size: 30px !important;
// }

:deep(.simple-typeahead-list-item) {
  background-color: white !important;
}
</style>

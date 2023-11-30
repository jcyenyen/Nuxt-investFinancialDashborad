<template>
  <NuxtLayout name="header">
    <template v-if="ohlc" #main>
      <div
        v-if="ohlc.length !== 0"
        class="w-[95%] mt-3 mx-auto flex justify-between"
      >
        <div class="w-[65%] h-[50%] rounded">
          <div class="flex justify-between w-[95%] mx-auto mt-4">
            <div class="my-1 w-[47%]">
              <label for="overlays" class="font-bold">覆蓋指標</label>
              <select
                class="border border-solid border-[#bebebe] rounded ms-2 w-[84%]"
                id="overlays"
                @change="overlaysChoose"
              >
                <option value="ema">EMA (Exponential Moving Average)</option>
                <option value="linearRegression">Linear Regression</option>
                <option value="pivotpoints">Pivot Points</option>
                <option value="pc" selected="selected">Price Channel</option>
                <option value="priceenvelopes">Price Envelopes</option>
                <option value="sma">SMA (Simple Moving Average)</option>
                <option value="vbp">VbP (Volume by Price)</option>
                <option value="wma">WMA (Weighted Moving Average)</option>
                <option value="vwap">
                  VWAP (Volume Weighted Average Price)
                </option>
              </select>
            </div>
            <div class="my-1 w-[47%]">
              <label for="oscillators" class="font-bold">振蕩指標</label>
              <select
                class="border border-solid border-[#bebebe] rounded ms-2 w-[84%]"
                id="oscillators"
                @change="OscillatorChoose"
              >
                <option value="atr">ATR (Average True Range)</option>
                <option value="ao">Awesome oscillator</option>
                <option value="cci">CCI (Commodity Channel Index)</option>
                <option value="disparityindex">Disparity Index</option>
                <option value="dmi">DMI (Directional Movement Index)</option>
                <option value="macd" selected="selected">
                  MACD (Moving Average Convergence Divergence)
                </option>
                <option value="mfi">MFI (Money Flow Index)</option>
                <option value="rsi">RSI (Relative Strength Index)</option>
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
        </div>
        <div class="w-[33%] flex flex-wrap">
          <div
            v-for="(value, key) in stockData"
            :key="key"
            class="w-[25%] mt-5"
          >
            <div
              class="flex items-center font-bold text-base italic min-h-[30px] stockborder"
            >
              {{ translateKey(key) }}
            </div>
            <div class="flex items-start font-normal text-xs min-h-[60px] max-w-[90px] break-all ">
              {{ value }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="stockChartFix.length !== 0"
        class="w-[95%] mx-auto mt-3 flex items-start justify-between"
      >
        <ClientOnly>
          <div
            class="w-[27%] border-0 border-y border-solid py-3 "
          >
            <div class="flex items-center">
              <div class="p-1 flex items-center h-[70px] w-[43%] cursor-pointer">
                <font-awesome-icon
                  :icon="['far', 'square-plus']"
                  size="2xl"
                  fade
                  style="color: black"
                  class="mx-2"
                  @click="cancelsel"
                />
                <label
                  for="typeahead_add"
                  @click="searchAdd = !searchAdd"
                  class="ms-1 text-[18px] w-[80%] font-bold cursor-pointer"
                  >股票績效比較</label
                >
              </div>
              <vue3-simple-typeahead
                ref="inputRef"
                id="typeahead_add"
                placeholder="搜尋股票..."
                v-if="searchAdd"
                class="w-[98%] p-1 bg-white rounded shadow :active:border-white"
                :items="checkData"
                :minInputLength="1"
                v-model="searchAddStock"
                @onInput="onInputEventHandler"
                @keydown.native.enter="changeChart('add')"
                @selectItem="selectAddtItem"
              >
                <template #list-item-text="slot">
                  <div  class="">
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
                <li v-for="v in MultiChart" class="w-[75%] ms-[30px] flex items-center my-1 cursor-pointer">
                  <div class="p-1">
                    <font-awesome-icon
                      :icon="['far', 'square-minus']"
                      style="color: black"
                      class="inline-block"
                      @click="changeChart('remove',v.name)"
                    />
                  </div>
                  <img
                    :src="`https://financialmodelingprep.com/image-stock/${v.name}.png`"
                    class="inline-block w-[20px] h-[20px] aspect-square mx-2"
                    :class="
                      v.name == 'AAPL' ? 'bg-black p-1 rounded-[50%]' : ''
                    "
                    @error="onError"
                  />
                  <p>{{ v.name }}</p>
                </li>
              </ul>
            </div>
          </div>
        </ClientOnly>
        <ClientOnly>
          <highcharts
            class="mb-10 w-[70%]"
            :constructor-type="'stockChart'"
            :options="chartOptionsMulti"
          />
        </ClientOnly>
      </div>
    </template>
  </NuxtLayout>
</template>
<script setup>
import axios from 'axios'
import { usePathStore } from '../stores/stock.js'
import { storeToRefs } from 'pinia'

const dayjs = useDayjs()

// 所在頁面 header按鈕顯示顏色
const pathStore = usePathStore()
const { path } = storeToRefs(pathStore)

const route = useRoute()
path.value = route.name

const id = route.params.id



// key
const fmp = import.meta.env.VITE_KEY_FMP

// API
const stockFundamentalApi = `https://financialmodelingprep.com/api/v3/profile/${id}?apikey=${fmp}`
const stockChartApi = `https://financialmodelingprep.com/api/v3/historical-price-full/${id}?timeseries=365&apikey=${fmp}`

const getDataApi = ()=>{
  const getStockFundamental = axios.get(stockFundamentalApi)
  const getFirstChart = axios.get(stockChartApi)
 return [getFirstChart,getStockFundamental]
}

// 股票基本資料
const stockData = ref()

// 股票技術線圖
const stockChart = ref()

const stockChartRev = computed(() =>
  stockChart.value ? stockChart.value.reverse() : []
)

const ohlc = computed(() => {
  const data = stockChartRev.value
    ? stockChartRev.value.map((v) => {
        const timeStamp = +dayjs(v.date) 
        return [timeStamp, v.open, v.high, v.low, v.close]
      })
    : undefined
  return data
})

const volume = computed(() => {
  const data = stockChartRev.value
    ? stockChartRev.value.map((v) => {
        const timeStamp = +dayjs(v.date) 
        return [timeStamp, v.volume]
      })
    : []
  return data
})

const getData = () => {
  Promise.all(getDataApi())
    .then((res) => {
      stockChart.value = res[0].data.historical
      stockData.value = res[1].data.map(
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
      stockData.value = stockData.value[0]
    })
    .catch((rej) => {
      console.log(rej)
    })
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
    // 範圍選擇器
    rangeSelector: {
      // 預設第幾個:索引
      selected: 2,
    },
    yAxis: [
      {
        height: '60%',
      },
      {
        // 離頂部距離
        top: '60%',
        // 圖高度
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

// 技術指標方法
const overlaysChoose = ref()
const OscillatorChoose = ref()

// 取出highChartStock元件方法
const afterChartInit = (chart) => {
  // 更換覆蓋指標
  const overlays = (e) => {
    var series = chart.get('overlay')
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
    var series = chart.get('oscillator')
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
  overlaysChoose.value = overlays
  OscillatorChoose.value = oscillator
}

// 股票績效比較

const fix = (stock) => {
  const data = stock
    ? stock.map((v) => {
        const timeStamp = +dayjs(v.date) 
        return [timeStamp, v.close]
      })
    : []
  return data
}

const stockChartFix = computed(() => {
  return fix(stockChartRev.value)
})

// 股票績效相關

const searchAdd = ref(false)
const checkData = ref([])
const searchAddStock = ref('')
const searchRemoveStock = ref('')

const MultiChart = ref([])

watchEffect(() => {
  MultiChart.value = stockChartFix
    ? [
        {
          name: `${id.toUpperCase()}`,
          data: stockChartFix.value,
        },
      ]
    : []
})

// 預先輸入框資料10筆

const searchApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/search?query=${searchAddStock.value}&limit=10&exchange=NASDAQ&apikey=${fmp}`
})

// 新增績效股票api
const addChartApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/historical-price-full/${searchAddStock.value}?timeseries=365&apikey=${fmp}`
})

// 點選預選框新增股票
const selectAddtItem = (item) => {
  searchAddStock.value = item
  changeChart('add')
}

// 輸入文字時提供預選框data
const onInputEventHandler = async() => {
  const res = await axios.get(searchApi.value)
  checkData.value = res.data.map((v) => v.symbol)
}

//取消搜尋框enter預設

const inputRef = ref()
const cancelsel = async () =>{
  searchAdd.value = !searchAdd.value
  await nextTick()
  inputRef.value.selectCurrentSelection =()=>{}
}

//增加&刪減股票

const changeChart = async (change, stock) => {
  if (change === 'add') {
    let newChart = []
    const res = await axios.get(addChartApi.value)
    newChart = res.data.historical
    if(newChart !== undefined){
    newChart = newChart.reverse().map((v) => {
      const timeStamp = +dayjs(v.date) 
      return [timeStamp, v.close]
    })
    MultiChart.value.push({
      name: searchAddStock.value.toUpperCase(),
      data: newChart,
    })}else{
      ElMessageBox.confirm('無此檔股票,請重新搜尋', '提示', {
      showCancelButton: false,
      confirmButtonText: '確定',
      type: 'success',
    })
    }
  } else if (change === 'remove') {
    searchRemoveStock.value = stock
    MultiChart.value = MultiChart.value.filter(
      (item) => item.name !== searchRemoveStock.value
    )
  }
}

// 績效圖表
const chartOptionsMulti = computed(() => {
  return {
    accessibility:{
          enabled:false
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
    series: MultiChart.value,
  }
})

// 翻譯
const translateKey = (key) => {
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

:deep(.simple-typeahead){
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

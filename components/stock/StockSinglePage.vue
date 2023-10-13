<template>
    <NuxtLayout name="header">
      <template #main>
        <div
          v-if="ohlc.length !== 0"
          class="w-[95%] mt-3 mx-auto flex justify-between"
        >
          <div class="w-[65%] h-[50%] rounded">
            <div class="flex w-[90%] mx-auto mt-4">
              <div class="my-1 w-[50%]">
                <label for="overlays" class="font-bold">覆蓋指標:</label>
                <select
                  class="border border-solid border-[#bebebe] rounded shadow ms-2 w-[70%]"
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
              <div class="my-1 w-[50%]">
                <label for="oscillators" class="font-bold">振蕩指標:</label>
                <select
                  class="border border-solid border-[#bebebe] rounded shadow ms-2 w-[80%]"
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
            <!-- <div class="w-[100%] ">
                <h3 class="rounded-full border border-solid border-[#bebebe] box-border inline-block w-[100px] h-[25px] text-center leading-[25px] font-normal mt-5 mb-3">股票概述</h3>
            </div> -->
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
              <div class="flex items-start font-normal text-xs min-h-[60px]">
                {{ value }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="stockChartFix.length !== 0" class="w-[70%] mx-auto mt-3">
          <ClientOnly>
            <div class="flex items-center">
              <font-awesome-icon
                :icon="['fas', 'circle-plus']"
                size="xl"
                style="color: #157d7f"
                @click="searchAdd = !searchAdd"
                class="mb-2"
              />
              <vue3-simple-typeahead
                id="typeahead_add"
                placeholder="搜尋股票..."
                v-if="searchAdd"
                class="w-[300px] m-4 p-1 bg-white rounded shadow :active:border-white"
                :items="checkData"
                :minInputLength="1"
                v-model="searchAddStock"
                @onInput="onInputEventHandler"
                @keydown.native.enter="changeChart('add')"
                @selectItem="selecAddtItem"
              >
                <template #list-item-text="slot">
                  <div class="">
                    <span
                      class="inline-block w-[300px] bg-white rounded shadow ms-4 mb-1"
                      v-html="slot.boldMatchText(slot.itemProjection(slot.item))"
                    ></span>
                  </div>
                </template>
              </vue3-simple-typeahead>
            </div>
            <div class="flex items-center">
              <font-awesome-icon
                :icon="['fas', 'circle-minus']"
                size="xl"
                style="color: #157d7f"
                class="inline-block"
                @click="searchRemove = !searchRemove"
              />
              <vue3-simple-typeahead
                id="typeahead_remove"
                placeholder="搜尋股票..."
                v-if="searchRemove"
                class="w-[300px] m-4 p-1 bg-white rounded shadow :active:border-white"
                :items="checkData"
                :minInputLength="1"
                v-model="searchRemoveStock"
                @onInput="onInputEventHandler"
                @keydown.native.enter="changeChart('remove')"
                @selectItem="selectRemoveItem"
              >
                <template #list-item-text="slot">
                  <div class="">
                    <span
                      class="inline-block w-[300px] bg-white rounded shadow ms-4 mb-1"
                      v-html="slot.boldMatchText(slot.itemProjection(slot.item))"
                    ></span>
                  </div>
                </template>
              </vue3-simple-typeahead>
            </div>
          </ClientOnly>
          <ClientOnly>
            <highcharts
              class="w-[1000px] mx-auto my-10"
              :constructor-type="'stockChart'"
              :options="chartOptionsMulti"
            />
          </ClientOnly>
          <draggable          
            :list="arr"
            group="testtt"
            itemKey="id"
            ghost-class="opacity-30"
          >
            <template #item="{ element }">
              <TestCom />
            </template>
          </draggable>
          
        </div>
      </template>
    </NuxtLayout>
  </template>
  <script setup>
  import axios from 'axios'
  import draggable from 'vuedraggable'
  
  const route = useRoute()
  const id = route.params.id
  
  const arr = [
    {test:19,id:'1'},
    {test:29,id:'2'},
    {test:39,id:'3'},
  ]
  
  // key
  const fmp = import.meta.env.VITE_KEY_FMP
  
  // API
  const stockFundamentalApi = `https://financialmodelingprep.com/api/v3/profile/${id}?apikey=${fmp}`
  const stockChartApi = `https://financialmodelingprep.com/api/v3/historical-price-full/${id}?timeseries=365&apikey=${fmp}`
  
  const getStockFundamental = axios.get(stockFundamentalApi)
  const getFirstChart = axios.get(stockChartApi)
  
  // 股票基本資料
  const stockData = ref()
  const wantDelete = [
    'exchange',
    'zip',
    'dcfDiff',
    'dcf',
    'image',
    'defaultImage',
    'isEtf',
    'isActivelyTrading',
    'isAdr',
    'isFund',
  ]
  
  // 股票圖表資料
  const stockChart = ref()
  
  const stockChartRev = computed(() =>
    stockChart.value ? stockChart.value.reverse() : []
  )
  
  const ohlc = computed(() => {
    const data = stockChartRev.value
      ? stockChartRev.value.map((v) => {
          const dateTimeString = v.date // 日期
          let milliseconds // 換算後的時間
          const dateObject = new Date(dateTimeString)
          milliseconds = dateObject.getTime()
          return [milliseconds, v.open, v.high, v.low, v.close]
        })
      : []
    return data
  })
  
  const volume = computed(() => {
    const data = stockChartRev.value
      ? stockChartRev.value.map((v) => {
          const dateTimeString = v.date // 日期
          let milliseconds // 換算後的時間
          const dateObject = new Date(dateTimeString)
          milliseconds = dateObject.getTime()
          return [milliseconds, v.volume]
        })
      : []
    return data
  })
  
  const getData = async () => {
    await Promise.all([getFirstChart, getStockFundamental])
      .then((res) => {
        stockChart.value = res[0].data.historical
        stockData.value = res[1].data[0]
        console.log(stockData.value)
      })
      .catch((rej) => {
        console.log(rej)
      })
  }
  
  onMounted(() => {
    getData()
  })
  
  // 單支股票
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
          ], // 這是預設的按鈕列表，你可以根據需要進行調整
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
  
  // 技術指標
  const overlaysChoose = ref()
  const OscillatorChoose = ref()
  
  // 股票圖表建立後可用的內建function
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
  
  // 多支股票
  const fix = (stock) => {
    const data = stock
      ? stock.map((v) => {
          const dateTimeString = v.date // 日期
          let milliseconds // 換算後的時間
          const dateObject = new Date(dateTimeString)
          milliseconds = dateObject.getTime()
          return [milliseconds, v.close]
        })
      : []
    return data
  }
  
  const stockChartFix = computed(() => {
    return fix(stockChartRev.value)
  })
  
  // 增加&刪減股票
  
  const searchAdd = ref(false)
  const searchRemove = ref(false)
  const checkData = ref([])
  const searchAddStock = ref('')
  const searchRemoveStock = ref('')
  
  const MultiChart = ref([])
  
  watchEffect(() => {
    MultiChart.value = stockChartFix
      ? [
          {
            name: `${id}`,
            data: stockChartFix.value,
          },
        ]
      : []
    // if(stockData.value.symbol){
    //   let {exchange,zip,dcfDiff,dcf,image,defaultImage,isEtf,isActivelyTrading,isAdr,isFund, ...desiredObject} = stockData.value
    //   stockData.value = desiredObject
    // }
  })
  
  const searchApi = computed(() => {
    return `https://financialmodelingprep.com/api/v3/search?query=${searchAddStock.value}&limit=10&exchange=NASDAQ&apikey=${fmp}`
  })
  
  const addChartApi = computed(() => {
    return `https://financialmodelingprep.com/api/v3/historical-price-full/${searchAddStock.value}?timeseries=365&apikey=${fmp}`
  })
  
  const selecAddtItem = (item) => {
    searchAddStock.value = item
  }
  
  const selectRemoveItem = (item) => {
    searchRemoveStock.value = item
  }
  
  const onInputEventHandler = () => {
    axios.get(searchApi.value).then((res) => {
      checkData.value = res.data.map((v) => v.symbol)
    })
  }
  
  const changeChart = async (change) => {
    console.log(change)
    if (change === 'add') {
      let newChart = []
      await axios
        .get(addChartApi.value)
        .then((res) => {
          console.log(res.data.historical)
          newChart = res.data.historical
        })
        .catch((rej) => {
          console.log(rej)
        })
      newChart = newChart.reverse().map((v) => {
        const dateTimeString = v.date // 日期
        let milliseconds // 換算後的時間
        const dateObject = new Date(dateTimeString)
        milliseconds = dateObject.getTime()
        return [milliseconds, v.close]
      })
      MultiChart.value.push({ name: searchAddStock.value, data: newChart })
    } else if (change === 'remove') {
      MultiChart.value = MultiChart.value.filter(
        (item) => item.name !== searchRemoveStock.value
      )
    }
  }
  
  // 績效圖表
  const chartOptionsMulti = computed(() => {
    return {
      chart: {
        height: 1000,
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
          ], // 這是預設的按鈕列表，你可以根據需要進行調整
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
  </script>
  <style lang="scss" scoped>
  .stockborder {
    border-top: 1px solid #b61f1f;
  }
  </style>
  
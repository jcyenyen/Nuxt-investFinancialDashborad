<template>
  <div class="w-[70%] mx-auto mt-3">
    <ClientOnly>
      <highcharts
        v-if="ohlc.length !== 0"
        class="w-[1000px] mx-auto my-10"
        :constructor-type="'stockChart'"
        :options="chartOptions"
      />
    </ClientOnly>
    <button @click="test">test</button>
  </div>
  <div class="w-[70%] mx-auto mt-3">
    <div v-for="(value, key) in stockData" :key="key" class="flex items-center">
      <div
        class="flex items-center justify-center w-[30%] text-base bg-[#5B759B1A] min-h-[50px] mx-3 stockborder"
      >
        {{ translateKey(key) }}
      </div>
      <div
        class="flex items-center justify-center w-[60%] text-xs min-h-[50px] stockborder"
      >
        {{ value }}
      </div>
    </div>
  </div>
</template>
<script setup>
import axios from 'axios'

const route = useRoute()
const id = route.params.id

// key
const fmp = import.meta.env.VITE_KEY_FMP

// API
const stockFundamentalApi = `https://financialmodelingprep.com/api/v3/profile/${id}?apikey=${fmp}`
const stockChartApi = `https://financialmodelingprep.com/api/v3/historical-price-full/${id}?timeseries=365&apikey=${fmp}`

// 股票基本資料
const stockData = ref()

// 股票圖表資料
const stockChart = ref()
const ohlc = computed(() => {
  const data = stockChart.value
    ? stockChart.value.reverse().map((v) => {
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
  const data = stockChart.value
    ? stockChart.value.map((v) => {
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
  await axios
    .get(stockFundamentalApi)
    .then((res) => {
      stockData.value = res.data[0]
    })
    .catch((rej) => {
      console.log(rej)
    })
  await axios
    .get(stockChartApi)
    .then((res) => {
      stockChart.value = res.data.historical
      console.log(stockChart.value)
    })
    .catch((rej) => {
      console.log(rej)
    })
}

const test = () => {
  console.log(volume.value)
}

onMounted(() => {
  getData()
})

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
    accessibility: {
      series: {
        descriptionFormat: '{seriesDescription}.',
      },
      description:
        'Use the dropdown menus above to display different indicator series on the chart.',
      screenReaderSection: {
        beforeChartFormat:
          '<{headingTagName}>{chartTitle}</{headingTagName}><div>{typeDescription}</div><div>{chartSubtitle}</div><div>{chartLongdesc}</div>',
      },
    },
    legend: {
      enabled: true,
    },
    rangeSelector: {
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
        accessibility: {
          exposeAsGroupOnly: true,
        },
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
        id: '交易量',
        name: '交易量',
        data: volume.value,
        yAxis: 1,
      }
    ]
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
    lastDiv: '最後的股息',
    range: '範圍',
    changes: '變化',
    companyName: '公司名稱',
    currency: '貨幣',
    cik: 'CIK',
    isin: 'ISIN',
    cusip: 'CUSIP',
    exchange: '交易所',
    exchangeShortName: '交易所簡稱',
    industry: '行業',
    website: '網站',
    description: '描述',
    ceo: '首席執行官',
    sector: '部門',
    country: '國家',
    fullTimeEmployees: '全職員工',
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
  border-bottom: 1px solid #bebebe;
}
</style>

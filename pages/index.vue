<template>
  <NuxtLayout name="header">
    <template #main>
      <div class="box">
        <!-- <RouterLink :to="`/stocks/${id}`" class="nav-a shadow">首頁</RouterLink>
        <button @click="test">test</button> -->
        <ClientOnly>
          <vue3-simple-typeahead
            id="typeahead_id"
            placeholder="搜尋股票..."
            class="w-[300px] m-4 p-1 bg-white rounded shadow :active:border-white"
            :items="checkData"
            v-model="searchStock"
            :minInputLength="1"
            @onInput="onInputEventHandler"
            @keydown.native.enter="searchToStock"
            @selectItem="selectItemEventHandler"
          >
            <template #list-item-text="slot"
              >
              <div class="">
                <span
                class="inline-block w-[300px]  bg-white rounded shadow ms-4 mb-1 "
                v-html="slot.boldMatchText(slot.itemProjection(slot.item))"
                ></span>
              </div>
            </template>
          </vue3-simple-typeahead>
        </ClientOnly>
        <button class="btn-primary shadow sticky z-10" @click="getData('AAPL')">
          Apple
        </button>
        <button class="btn-primary shadow z-10" @click="getData('GOOGL')">
          Google
        </button>
        <button class="btn-primary shadow z-10" @click="getData('META')">
          META
        </button>
        <button class="btn-primary shadow z-10" @click="getData('TSLA')">
          Tesla
        </button>

      </div>
      <ClientOnly>
        <highcharts
          v-if="realTimeOffer"
          class="w-[1000px] mx-auto my-10"
          :constructor-type="'stockChart'"
          :options="chartOptions"
        />
      </ClientOnly>
      <div v-if="gainRankingOnTheDay" class="flex justify-around mb-5">
        <ul>
          <li>
            <h3 class="text-center font-bold text-xl">當日上漲股票排名</h3>
          </li>
          <li
            v-for="(v, i) in gainRankingOnTheDay"
            class="presence shadow-xl mb-6"
          >
            <h4 class="text-xs text-center">{{ v.name }}</h4>
            <div class="flex items-end justify-center mt-3 text-[#56a556]">
              <p class="text-3xl font-bold me-1">{{ v.price }}</p>
              <p class="text-[#56a556] font-thin">
                {{ `+${v.changesPercentage}%` }}
              </p>
            </div>
          </li>
        </ul>
        <ul>
          <li>
            <h3 class="text-center font-bold text-xl">當日下跌股票排名</h3>
          </li>
          <li
            v-for="(v, i) in loseRankingOnThatDay"
            class="presence shadow-xl mb-6"
          >
            <h4 class="text-xs text-center">{{ v.name }}</h4>
            <div class="flex items-end justify-center mt-3 text-[#ff0000]">
              <p class="text-3xl font-bold me-1">{{ v.price }}</p>
              <p class="text-[#ff0000] font-thin">
                {{ `${v.changesPercentage}%` }}
              </p>
            </div>
          </li>
        </ul>
        <ul>
          <li>
            <h3 class="text-center font-bold text-xl">當日活躍股票排名</h3>
          </li>
          <li
            v-for="(v, i) in activeRankingOnThatDay"
            class="presence shadow-xl mb-6"
          >
            <h4 class="text-xs text-center">{{ v.name }}</h4>
            <div class="flex items-end justify-center mt-3 text-zinc-700">
              <p class="text-3xl font-bold me-1">{{ v.price }}</p>
              <p class="font-thin">{{ `${v.changesPercentage}%` }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div v-if="news" class="flex flex-wrap justify-around">
        <a
          :href="v.url"
          v-for="(v, i) in news"
          class="inline-block box-border p-5 w-[300px] border border-solid border-black rounded shadow-2xl flex flex-col justify-around my-2"
        >
          <img :src="v.banner_image" alt="" />
          <div>
            <h3 class="py-1">{{ v.title }}</h3>
            <p v-for="author in v.authors" class="text-xs">
              {{ author }}
            </p>
          </div>
        </a>
      </div>
    </template>
  </NuxtLayout>
</template>
<script setup>
import charts from 'highcharts'
import { useRouter } from 'vue-router'


const axios = inject('axios')
definePageMeta({
  layout: false,
})
const router = useRouter()
const id = '998'
const route = useRoute()

const test = () => {
  router.push(`/stocks/${id}`)
}

console.log(route)

// 股票資料
const data = ref()
const designatedStock = ref('AAPL')

// 新聞資料
const news = ref()

watchEffect(() => {
  news.value
    ? news.value.forEach((v) => {
        v.authors.reverse()
      })
    : []
})

// 當日股票排名
const presenceStock = ref()

// KEY
const alpha = import.meta.env.VITE_KEY_ALPHA
const fmp = import.meta.env.VITE_KEY_FMP

// API
const dataApi = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${designatedStock.value}&interval=1min&outputsize=full&apikey=${alpha}`
const newsApi = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${alpha}`

const gainersStockApi = `https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${fmp}`
const losersStockApi = `https://financialmodelingprep.com/api/v3/stock_market/losers?apikey=${fmp}`
const activesStockApi = `https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${fmp}`


const checkData = ref([])
const searchStock = ref('')
const searchApi = computed(()=>{return `https://financialmodelingprep.com/api/v3/search?query=${searchStock.value}&limit=10&exchange=NASDAQ&apikey=${fmp}`})

const selectItemEventHandler = (item) => {
  console.log(item)
  searchToStock()
}

const onInputEventHandler = (event) => {
  console.log(event)
  axios.get(searchApi.value).then((res)=>{
      console.log(res)
      checkData.value = res.data.map((v)=>v.symbol)
    })
}

// const onInputEventHandler = async(event) => {
//   await axios.get(searchApi)
//         .then((res)=>{console.log(res)})
//   console.log(event.input)
// }

const onFocusEventHandler = (event) => {
  console.log(event.input)
}

const onBlurEventHandler = async(event) => {
    axios.get(searchApi.value).then((res)=>{
      console.log(res)
      checkData.value = res.data.map((v)=>v.symbol)
    })
    
}

const itemProjectionFunction = (word) => {
  console.log(word)
  return word
}

const searchToStock = () => {
  router.push(`/stocks/${searchStock.value}`)
}

// 取得資料
const getData = (stock = 'AAPL') => {
  axios
    .get(dataApi)
    .then((res) => {
      data.value = Object.entries(res.data['Time Series (1min)']).map(
        ([date, values]) => ({ date, ...values })
      )
      stockName.value = stock
      return Promise.all([
        axios.get(gainersStockApi),
        axios.get(losersStockApi),
        axios.get(activesStockApi),
      ])
    })
    .then((res) => {
      presenceStock.value = res
      return axios.get(newsApi)
    })
    .then((res) => {
      news.value = res.data.feed
      news.value.length = 20
    })
    .catch((err) => {
      console.log(err)
    })
}

onMounted(() => {
  getData()
})

// 將資料轉換成[時間,股價]
const realTimeOffer = computed(() => {
  return data.value
    ? data.value.reverse().map((v, i) => {
        const dateTimeString = v.date // 日期
        let milliseconds // 換算後的時間
        const dateObject = new Date(dateTimeString)
        milliseconds = dateObject.getTime()
        return [milliseconds, parseFloat(v['2. high'])]
      })
    : undefined
})

// 漲跌幅顏色
const colorsOfUpsAndDowns = computed(() => {
  return (
    realTimeOffer.value[0][1] >
    realTimeOffer.value[realTimeOffer.value.length - 1][1]
  )
})

// 股票名稱
const stockName = ref('')

// 股票走勢設定
const chartOptions = computed(() => {
  return {
    title: {
      text: stockName.value,
    },
    xAxis: {
      gapGridLineWidth: 0,
    },
    yAxis: {
      // floor: 4300,
      // ceiling: 4500
    },
    rangeSelector: {
      buttons: [
        {
          type: 'hour',
          count: 1,
          text: '1小時',
        },
        {
          type: 'day',
          count: 1,
          text: '1天',
        },
        {
          type: 'all',
          count: 1,
          text: '全部',
        },
      ],
      selected: 1,
      inputEnabled: false,
    },

    series: [
      {
        name: 'test',
        type: 'area',
        data: realTimeOffer.value,
        color: colorsOfUpsAndDowns.value ? '#ff0000' : '#56a556',
        // colorByPoint: true,         // 是否要用colors設定數據點顏色
        // colors: ["pink", "gray"],
        gapSize: 5,
        tooltip: {
          valueDecimals: 2,
        },
        showInLegend: true,
        // lineWidth:5,
        // dashStyle:'shortdash',
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, colorsOfUpsAndDowns.value ? '#ff0000' : '#56a556'],
            [
              1,
              charts
                .color(colorsOfUpsAndDowns.value ? '#ff0000' : '#56a556')
                .setOpacity(0)
                .get('rgba'),
            ],
            // [0, charts.getOptions().colors[3]],
            // [1, charts.color(charts.getOptions().colors[3]).setOpacity(0).get('rgba')]
          ],
        },
        threshold: null,
      },
    ],
  }
})

// 上漲前5
const gainRankingOnTheDay = computed(() => {
  const gainers = presenceStock.value ? presenceStock.value[0].data : []
  gainers.length = 5
  return presenceStock.value ? gainers : undefined
})

// 下跌前5
const loseRankingOnThatDay = computed(() => {
  const losers = presenceStock.value ? presenceStock.value[1].data : []
  losers.length = 5
  return losers
})

// 活躍前5
const activeRankingOnThatDay = computed(() => {
  const actives = presenceStock.value ? presenceStock.value[2].data : []
  actives.length = 5
  return actives
})
</script>
<style lang="scss" scoped>
.box1 {
  background-color: #ff0000;
}
</style>

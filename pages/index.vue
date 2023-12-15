<template>
  <NuxtLayout name="header">
    <template v-if="realTimeOffer" #main>
      <div class="flex mx-auto my-4 p-6">
        <button
          v-for="v in buttons"
          class="flex items-center btn-primary shadows sticky w-[24%]"
          @click="changeStock(v.symbol, v.name)"
        >
          <img
            :src="`https://financialmodelingprep.com/image-stock/${v.symbol.toUpperCase()}.png`"
            class="inline-block w-[15%] h-[45px] aspect-square me-3"
            :class="v.symbol == 'AAPL' ? 'bg-black p-3 rounded-[50%]' : ''"
          />
          <div>
            <nuxt-link
              :to="`/stocks/${v.symbol}`"
              class="text-[24px] font-bold hover:text-[#4279af]"
              @click.self="router.push(`/stocks/${v.symbol}`)"
            >
              {{ v.name }}
            </nuxt-link>
            <div class="flex items-center">
              <p class="font-[600]">
                {{ v.price }}<span class="text-[12px]">USD</span>
              </p>
              <p
                class="ms-3"
                :class="
                  v.changesPercentage > 0 ? 'text-[#56a556]' : 'text-[#ff0000]'
                "
              >
                {{
                  v.changesPercentage > 0
                    ? `+${twoAfterDecimal(v.changesPercentage)}`
                    : `${twoAfterDecimal(v.changesPercentage)}`
                }}%
              </p>
            </div>
          </div>
        </button>
      </div>
      <ClientOnly>
        <highcharts
          v-if="realTimeOffer"
          class="h-[600px] w-[90%] mx-auto my-10"
          :constructor-type="'stockChart'"
          :options="chartOptions"
        />
      </ClientOnly>
      <template v-if="presenceStock">
        <div v-for="Ranking in presenceStock" class="py-10">
          <h3 class="text-center font-bold text-2xl mb-[40px]">
            {{ rankingJudge(Ranking.config.url) }}
          </h3>
          <ul class="flex flex-wrap justify-between w-[95%] mx-auto">
            <li v-for="v in Ranking.data" :key="v.name" class="racebox">
              <div class="flex items-center">
                <img
                  :src="`https://financialmodelingprep.com/image-stock/${v.symbol}.png`"
                  class="inline-block w-[35px] h-[35px] aspect-square me-3"
                  :class="v.name == 'AAPL' ? 'bg-black p-1 rounded-[50%]' : ''"
                  @error="onError"
                />
                <nuxt-link
                  :to="`/stocks/${v.symbol}`"
                  class="hover:text-[#4279af]"
                >
                  <h4 class="text-[16px] font-bold">{{ v.name }}</h4>
                  <p>{{ v.symbol }}</p>
                </nuxt-link>
              </div>
              <div class="flex items-center">
                <p class="font-bold me-5">
                  {{ `${twoAfterDecimal(v.price)}`
                  }}<span class="font-normal text-[10px] ms-1">USD</span>
                </p>
                <p
                  class="percent text-center"
                  :class="rankingJudge(Ranking.config.url, 'color')"
                >
                  {{
                    v.changesPercentage < 0
                      ? `${twoAfterDecimal(v.changesPercentage)}%`
                      : `+${twoAfterDecimal(v.changesPercentage)}%`
                  }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </template>
      <div class="flex w-[95%] mt-10 mx-auto mb-[100px]">
        <div
          class="w-[20%] h-[850px] p-5 border border-solid border-black rounded box-border mt-2"
        >
          <label for="news" class="font-bold text-[18px]">股票代號搜尋</label>
          <input
            id="news"
            type="text"
            placeholder="格式(代號 代號)"
            class="w-[100%] mb-4 mt-1 p-1 bg-white border border-solid border-black rounded shadow :active:border-white text-[14px]"
            v-model="stockToNews"
            @keydown.native.enter="chooseNews"
          />
          <div>
            <label class="font-bold text-[18px]">新聞發佈時間</label>
            <label for="start" class="block text-[14px] font-bold mt-1"
              >從</label
            >
            <input
              type="date"
              id="start"
              v-model="timeStart"
              class="text-[14px] w-[100%] mb-4 mt-1 p-1 bg-white border border-solid border-black rounded shadow"
            />
            <label for="end" class="block text-[14px] font-bold">到</label>
            <input
              type="date"
              id="end"
              v-model="timeEnd"
              class="text-[14px] w-[100%] mb-4 mt-1 p-1 bg-white border border-solid border-black rounded shadow"
            />
          </div>
          <label class="font-bold text-[18px]">主題</label>
          <div v-for="(zh, eng) in newsFilter" :key="eng" class="mt-1">
            <input type="checkbox" :value="eng" v-model="checkedNews" />
            <label class="font-bold text-[14px] m-2 py-2">{{ zh }}</label>
          </div>
          <button
            @click="chooseNews"
            class="bg-[#4f46e5] py-1 px-2 mt-3 rounded text-white font-bold"
          >
            新聞篩選
          </button>
        </div>
        <div
          v-if="news !== undefined"
          class="flex flex-wrap justify-around w-[80%]"
        >
          <a
            :href="v.url"
            v-for="v in news"
            :key="v.overall_sentiment_score"
            class="news"
          >
            <img
              :src="v.banner_image ? v.banner_image : '~/assets/img/FTNT.png'"
              class="w-[30%] aspect-square object-contain me-3"
              alt=""
              @error="onError"
            />
            <div>
              <h3 class="py-1 text-ellipsis overflow-hidden">
                {{ v.title }}
              </h3>
              <p v-for="author in v.authors" class="text-xs">
                {{ author }}
              </p>
            </div>
          </a>
        </div>
        <div v-else class="w-[80%] text-center text-2xl mt-[200px]">
          <h3>交叉比對無資料,請重新搜尋..</h3>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>
<script setup>
import axios from 'axios'
import charts from 'highcharts'
import { useRouter } from 'vue-router'
import { usePathStore } from '../stores/stock.js'
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: false,
})

const router = useRouter()
const dayjs = useDayjs()

// 所在頁面 header按鈕顯示顏色
const pathStore = usePathStore()
const { path } = storeToRefs(pathStore)

const route = useRoute()
path.value = route.name

// 股票資料
const data = ref()
const dataTidy = computed(() => {
  const tidy = data.value
    ? Object.entries(data.value['Time Series (1min)']).map(
        ([date, values]) => ({ date, ...values })
      )
    : undefined
  return tidy
})
const designatedStock = ref('AAPL')
const buttons = ref()

// 新聞資料
const news = ref()
const checkedNews = ref([])
const checkedNewsString = computed(() => checkedNews.value.join(','))
const newsFilter = ref({
  blockchain: '區塊鏈',
  earnings: '收益',
  ipo: 'IPO',
  mergers_and_acquisitions: '併購',
  financial_markets: '金融市場',
  economy_fiscal: '財政政策（稅改、政府支出）',
  economy_monetary: '貨幣政策（利率、通貨膨脹）',
  economy_macro: '總體經濟',
  energy_transportation: '能源與運輸',
  finance: '金融',
  life_sciences: '生命科學',
  manufacturing: '製造業',
  real_estate: '房地產',
  retail_wholesale: '零售批發',
  technology: '科技',
})

// 股票代號搜尋新聞

const stockToNews = ref('')
const checkStockToNews = computed(() => {
  const stockToNewsArr = stockToNews.value
    .split(' ')
    .map((v) => `&tickers=${v}`)
  const stockToNewsString = stockToNewsArr.join(',')
  return stockToNewsString || ''
})

// 日期搜尋新聞

const timeStart = ref('')
const timeEnd = ref('')
const timeStartStr = computed(() => {
  timeStart.value = timeStart.value
    ? dayjs(timeStart.value).minute(0).hour(0).format('YYYYMMDD[T]HHmm')
    : ''

  return timeStart.value
})

const timeEndStr = computed(() => {
  timeEnd.value = timeEnd.value
    ? dayjs(timeEnd.value).minute(59).hour(23).format('YYYYMMDD[T]HHmm')
    : ''
  return timeEnd.value
})

watchEffect(() => {
  news.value
    ? news.value.forEach((v) => {
        v.authors.reverse()
      })
    : []
})

// 當日股票排名
const presenceStock = ref([])

// KEY
const alpha = import.meta.env.VITE_KEY_ALPHA
const fmp = import.meta.env.VITE_KEY_FMP

// API
const stockDataApi = computed(() => {
  return `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${designatedStock.value}&interval=1min&outputsize=full&apikey=${alpha}`
})
const newsApi = computed(
  () =>
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${checkedNewsString.value}${checkStockToNews.value}&time_from=${timeStartStr.value}&time_to=${timeEndStr.value}&apikey=${alpha}`
)

const gainersStockApi = `https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${fmp}`
const losersStockApi = `https://financialmodelingprep.com/api/v3/stock_market/losers?apikey=${fmp}`
const activesStockApi = `https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${fmp}`

const buttonApi = `https://financialmodelingprep.com/api/v3/quote-order/AAPL,GOOGL,META,TSLA?apikey=${fmp}`

const getDataApi = () => {
  const getButton = axios.get(buttonApi)
  const getStockData = axios.get(stockDataApi.value)
  const getGainersStock = axios.get(gainersStockApi)
  const getlosersStock = axios.get(losersStockApi)
  const getActivesStock = axios.get(activesStockApi)
  const getNews = axios.get(newsApi.value)
  return [
    getButton,
    getStockData,
    getGainersStock,
    getlosersStock,
    getActivesStock,
    getNews,
  ]
}

const getData = (stock = 'AAPL', company = 'Apple Inc.') => {
  // 按鈕更換股票
  designatedStock.value = stock
  Promise.all(getDataApi()).then((res) => {
    buttons.value = res[0].data
    data.value = res[1].data
    stockName.value = company
    res.forEach((v, i) => {
      if (i >= 2 && i <= 4) {
        v.data.length = 5
        presenceStock.value.push(v)
      }
    })
    news.value = res[5].data.feed
    news.value.length = 20
  })
}

onMounted(() => {
  getData()
})

const changeStock = async (stock, company) => {
  designatedStock.value = stock
  const [, getStockData] = getDataApi()
  const res = await getStockData
  data.value = res.data
  stockName.value = company
}

// 將資料轉換成[時間,股價]
const realTimeOffer = computed(() => {
  return dataTidy.value
    ? dataTidy.value.reverse().map((v) => {
        const timeStamp = +dayjs(v.date)
        return [timeStamp, parseFloat(v['2. high'])]
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

// 股票圖表名稱
const stockName = ref('')

// 股票走勢設定
const chartOptions = computed(() => {
  return {
    title: {
      useHTML: true,
      text: `<span class='text-[21px]'>${stockName.value}</span>`,
    },
    xAxis: {
      gapGridLineWidth: 0,
    },
    yAxis: {
      gridLineColor: '#ffffff',
    },
    navigator: {
      enabled: false,
    },
    rangeSelector: {
      buttonTheme: {
        // styles for the buttons
        fill: 'none',
        stroke: 'none',
        r: 3,
        width: 50,
        height: 30,
        style: {
          color: '#284a6b',
          fontWeight: 'bold',
          lineWidth: 5,
          fontSize: '16px',
        },
        states: {
          hover: {},
          select: {
            fill: '#284a6b',
            style: {
              color: 'white',
            },
          },
          // disabled: { ... }
        },
      },
      buttons: [
        {
          type: 'minute',
          count: 5,
          text: '5分',
        },
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
          type: 'week',
          count: 1,
          text: '1週',
        },
        {
          type: 'all',
          count: 1,
          text: '全部',
        },
      ],
      buttonPosition: {
        align: 'left',
        x: -15,
        y: -45,
      },
      labelStyle: {
        color: 'white',
      },
      selected: 2,
      inputEnabled: false,
    },
    accessibility: {
      enabled: false,
    },
    stockTools: {
      gui: {
        enabled: false, // 關閉 GUI
      },
    },
    series: [
      {
        name: `${stockName.value}`,
        type: 'area',
        data: realTimeOffer.value,
        color: colorsOfUpsAndDowns.value ? '#ff0000' : '#56a556',
        lineWidth: 2,
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
            [0, colorsOfUpsAndDowns.value ? '#ff000044' : '#56a55644'],
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

// 判斷上漲下跌活躍標題跟顏色

const rankingJudge = (kind, type) => {
  if (kind.includes('gainer')) {
    return type === 'color' ? '' : '當日上漲股票排名'
  } else if (kind.includes('loser')) {
    return type === 'color' ? 'bg-[#ff0000]' : '當日下跌股票排名'
  } else if (kind.includes('active')) {
    return type === 'color' ? 'bg-zinc-700' : '當日活躍股票排名'
  }
}

// 選擇新聞類型

const chooseNews = async () => {
  const [, , , , , getNews] = getDataApi()
  const res = await getNews
  news.value = res.data.feed.length !== 0 ? res.data.feed : undefined
  if (news.value !== undefined) news.value.length = 20
}

progressDone(realTimeOffer)
</script>
<style lang="scss" scoped>
.racebox:nth-child(2) {
  width: 45%;
}
.racebox:nth-child(1) {
  width: 45%;
}
.racebox:nth-child(4) {
  width: 29%;
}
.racebox:nth-child(5) {
  width: 29%;
}
.racebox:nth-child(3) {
  width: 29%;
}

.highcharts-title {
  fill: #284a6b;
  font-weight: bold;
  letter-spacing: 0.3em;
  font-size: 3em;
}

.testtt {
  background-color: #16b7a5;
  background-color: #4279af;
}
</style>

<template>
  <NuxtLayout name="header">
    <template #main>
      <div>
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
            <template #list-item-text="slot">
              <div class="">
                <span
                  class="inline-block w-[300px] bg-white rounded shadow ms-4 mb-1"
                  v-html="slot.boldMatchText(slot.itemProjection(slot.item))"
                ></span>
              </div>
            </template>
          </vue3-simple-typeahead>
        </ClientOnly>
      </div>
      <div class="box">
        <div
          v-for="v in buttons"
          class="flex items-center btn-primary shadows sticky w-[24%]"
          @click="getData(v.symbol, v.name)"
        >
          <img
            :src="`https://financialmodelingprep.com/image-stock/${v.symbol.toUpperCase()}.png`"
            class="inline-block w-[15%] h-[45px] aspect-square me-3"
            :class="v.symbol == 'AAPL' ? 'bg-black p-3 rounded-[50%]' : ''"
          />
          <div>
            <h3
              class="text-[24px] font-bold"
              @click.self="router.push(`/stocks/${v.symbol}`)"
            >
              {{ v.name }}
            </h3>
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
        </div>
      </div>
      <ClientOnly>
        <highcharts
          v-if="realTimeOffer"
          class="h-[600px] w-[90%] mx-auto my-10"
          :constructor-type="'stockChart'"
          :options="chartOptions"
        />
      </ClientOnly>
      <div v-if="gainRankingOnTheDay" class="py-20">
        <h3 class="text-center font-bold text-2xl mb-[20px]">
          當日上漲股票排名
        </h3>
        <ul class="flex flex-wrap justify-around">
          <li v-for="v in gainRankingOnTheDay" :key="v.name" class="racebox">
            <div class="flex items-center">
                <img
                  :src="`https://financialmodelingprep.com/image-stock/${v.symbol}.png`"
                  class="inline-block w-[35px] h-[35px] aspect-square me-2"
                  :class="v.name == 'AAPL' ? 'bg-black p-1 rounded-[50%]' : ''"
                  @error="onError"
                />
              <div>
                <h4 class="text-[16px] font-bold">{{ v.name }}</h4>
                <p>{{ v.symbol }}</p>
              </div>
            </div>
            <div class="flex items-center">
              <p class="font-bold me-5">
                {{ `${twoAfterDecimal(v.price)}`
                }}<span class="font-normal text-[10px] ms-1">USD</span>
              </p>
              <p class="percent w-[80px] text-center">
                {{ `+${twoAfterDecimal(v.changesPercentage)}%` }}
              </p>
            </div>
          </li>
        </ul>
        <h3 class="text-center font-bold text-2xl mb-[20px]">
          當日下跌股票排名
        </h3>
        <ul class="flex flex-wrap justify-around">
          <li v-for="v in loseRankingOnThatDay" class="racebox">
            <div>
              <h4 class="text-[16px] font-bold">{{ v.name }}</h4>
              <p>{{ v.symbol }}</p>
            </div>
            <div class="flex items-center">
              <p class="font-bold me-5">
                {{ v.price
                }}<span class="font-normal text-[10px] ms-1">USD</span>
              </p>
              <p class="percent bg-[#ff0000]">
                {{ `${twoAfterDecimal(v.changesPercentage)}%` }}
              </p>
            </div>
          </li>
        </ul>
        <h3 class="text-center font-bold text-2xl mb-[20px]">
          當日活躍股票排名
        </h3>
        <ul class="flex flex-wrap justify-around">
          <li v-for="v in activeRankingOnThatDay" :key="v.name" class="racebox">
            <div>
              <h4 class="text-[16px] font-bold">{{ v.name }}</h4>
              <p>{{ v.symbol }}</p>
            </div>
            <div class="flex items-center">
              <p class="font-bold me-5">
                {{ v.price
                }}<span class="font-normal text-[10px] ms-1">USD</span>
              </p>
              <p class="percent bg-zinc-700">
                <span v-if="v.changesPercentage > 0">+</span
                >{{ `${twoAfterDecimal(v.changesPercentage)}%` }}
              </p>
            </div>
          </li>
        </ul>
      </div>
      <div class="flex w-[95%] mx-auto mb-[100px]">
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
          <div v-for="(v, name) in items" :key="v" class="mt-1">
            <input type="checkbox" :value="name" v-model="checkedNews" />
            <label class="font-bold text-[14px] m-2 py-2">{{ v }}</label>
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
              :src="v.banner_image"
              class="w-[30%] aspect-square object-contain me-3"
              alt=""
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
import charts from 'highcharts'
import { useRouter } from 'vue-router'

const axios = inject('axios')
definePageMeta({
  layout: false,
})

const router = useRouter()

// 股票資料
const data = ref()
const designatedStock = ref('AAPL')
const buttons = ref()

// 新聞資料
const news = ref()
const checkedNews = ref([])
const checkedNewsString = computed(() => checkedNews.value.join(','))
const items = ref({
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
    ? timeStart.value.replace(/-/g, '') + 'T0000'
    : ''
  return timeStart.value
})

const timeEndStr = computed(() => {
  timeEnd.value = timeEnd.value ? timeEnd.value.replace(/-/g, '') + 'T2359' : ''
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
const presenceStock = ref()

// 搜尋
const checkData = ref([])
const searchStock = ref('')

// KEY
const alpha = import.meta.env.VITE_KEY_ALPHA
const fmp = import.meta.env.VITE_KEY_FMP

// API
const dataApi = computed(() => {
  return `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${designatedStock.value}&interval=1min&outputsize=full&apikey=${alpha}`
})
const newsApi = computed(
  () =>
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${checkedNewsString.value}${checkStockToNews.value}&time_from=${timeStartStr.value}&time_to=${timeEndStr.value}&apikey=${alpha}`
)

const gainersStockApi = `https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${fmp}`
const losersStockApi = `https://financialmodelingprep.com/api/v3/stock_market/losers?apikey=${fmp}`
const activesStockApi = `https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${fmp}`
const searchApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/search?query=${searchStock.value}&limit=10&exchange=NASDAQ&apikey=${fmp}`
})

const buttonApi = `https://financialmodelingprep.com/api/v3/quote-order/AAPL,GOOGL,META,TSLA?apikey=${fmp}`

// 取得資料
const getData = (stock = 'AAPL', company = 'Apple Inc.') => {
  // 按鈕更換股票
  designatedStock.value = stock
  axios
    .get(buttonApi)
    .then((res) => {
      console.log(res.data)
      buttons.value = res.data
      return axios.get(dataApi.value)
    })
    .then((res) => {
      data.value = Object.entries(res.data['Time Series (1min)']).map(
        ([date, values]) => ({ date, ...values })
      )
      console.log(res)
      stockName.value = company
      return Promise.all([
        axios.get(gainersStockApi),
        axios.get(losersStockApi),
        axios.get(activesStockApi),
      ])
    })
    .then((res) => {
      presenceStock.value = res
      console.log(res[0])
      return axios.get(newsApi.value)
    })
    .then((res) => {
      news.value = res.data.feed
      news.value.length = 20
    })
    .catch((err) => {
      console.log(err)
    })
  console.log(stock)
}

onMounted(() => {
  getData()
})

const test = new Date('2023-09-29').getTime()
console.log(test)
// 將資料轉換成[時間,股價]
const realTimeOffer = computed(() => {
  return data.value
    ? data.value.reverse().map((v, i) => {
        const milliseconds = +new Date(v.date) // 換算後的時間
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
        strokeWidth: 0,
        r: 3,
        width: 50, // 设置按钮的宽度
        height: 30, // 设置按钮的高度
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

// 預先輸入功能

const selectItemEventHandler = (item) => {
  searchStock.value = item
  searchToStock()
}

const onInputEventHandler = () => {
  axios.get(searchApi.value).then((res) => {
    checkData.value = res.data.map((v) => v.symbol)
  })
}

const searchToStock = () => {
  router.push(`/stocks/${searchStock.value}`)
}

// 選擇新聞類型

const chooseNews = () => {
  console.log(realTimeOffer.value)
  axios
    .get(newsApi.value)
    .then((res) => {
      console.log(res)
      news.value = res.data.feed.length !== 0 ? res.data.feed : undefined
      if (news.value !== undefined) news.value.length = 20
    })
    .catch((err) => {
      console.log(err)
    })
}

// 取到小數後兩位

const twoAfterDecimal = (num) => {
  num = Math.round(num * 100) / 100
  return num
}

// 死圖

const onError = (event) => {
  // 當圖片加載失敗時，可以把 src 設為空或者預設的佔位圖片
  // event.target.style.display = 'none';
  event.target.src = '/FTNT.png'
}
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
</style>

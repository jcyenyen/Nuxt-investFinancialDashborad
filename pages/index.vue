<template>
  <NuxtLayout name="header">
    <template v-if="realTimeOffer" #main>
      <article>
        <section class="flex mx-auto my-4 p-6">
          <button
            v-for="stock in buttons"
            class="flex items-center btn-primary shadows sticky w-[24%]"
            @click="changeStockChart(stock.symbol, stock.name)"
          >
            <img
              :src="`https://financialmodelingprep.com/image-stock/${stock.symbol.toUpperCase()}.png`"
              class="inline-block w-[15%] h-[45px] aspect-square me-3"
              :class="isAppleIcon(stock.symbol)"
            />
            <div>
              <nuxt-link
                :to="`/stocks/${stock.symbol}`"
                class="text-[24px] font-bold hover:text-[#4279af]"
                @click.self="router.push(`/stocks/${stock.symbol}`)"
              >
                {{ stock.name }}
              </nuxt-link>
              <div class="flex items-center">
                <p class="font-[600]">
                  {{ stock.price }}<span class="text-[12px]">USD</span>
                </p>
                <p
                  class="ms-3"
                  :class="isStockRiseColor(stock.changesPercentage)"
                >
                  {{ isStockRise(stock.changesPercentage) }}%
                </p>
              </div>
            </div>
          </button>
        </section>
        <ClientOnly>
          <highcharts
            v-if="realTimeOffer"
            class="h-[600px] w-[90%] mx-auto my-10"
            :constructor-type="'stockChart'"
            :options="chartOptions"
          />
        </ClientOnly>
      </article>
      <template v-if="stockRanking">
        <article v-for="(Ranking, index) in stockRanking" class="py-10">
          <h3 class="text-center font-bold text-2xl mb-[40px]">
            {{ rankingName(index) }}
          </h3>
          <ul class="flex flex-wrap justify-between w-[95%] mx-auto">
            <li v-for="stock in Ranking" :key="stock.name" class="racebox">
              <figure class="flex items-center">
                <img
                  :src="`https://financialmodelingprep.com/image-stock/${stock.symbol}.png`"
                  class="inline-block w-[35px] h-[35px] aspect-square me-3"
                  :class="
                    stock.name == 'AAPL' ? 'bg-black p-1 rounded-[50%]' : ''
                  "
                  @error="onError"
                />
                <nuxt-link
                  :to="`/stocks/${stock.symbol}`"
                  class="hover:text-[#4279af]"
                >
                  <h4 class="text-[16px] font-bold">{{ stock.name }}</h4>
                  <p>{{ stock.symbol }}</p>
                </nuxt-link>
              </figure>
              <div class="flex items-center">
                <p class="font-bold me-5">
                  {{ `${twoAfterDecimal(stock.price)}`
                  }}<span class="font-normal text-[10px] ms-1">USD</span>
                </p>
                <p class="percent text-center" :class="rankingColor(index)">
                  {{ isStockRise(stock.changesPercentage) }}%
                </p>
              </div>
            </li>
          </ul>
        </article>
      </template>
      <article class="flex w-[95%] mt-10 mx-auto mb-[100px]">
        <aside
          class="w-[20%] h-[850px] p-5 border border-solid border-black rounded box-border mt-2"
        >
          <label for="news" class="font-bold text-[18px]">股票代號搜尋</label>
          <input
            id="news"
            type="text"
            placeholder="格式(代號 代號)"
            class="w-[100%] mb-4 mt-1 p-1 bg-white border border-solid border-black rounded shadow :active:border-white text-[14px]"
            v-model="searchNewsByStock"
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
              v-model="startTime"
              class="text-[14px] w-[100%] mb-4 mt-1 p-1 bg-white border border-solid border-black rounded shadow"
            />
            <label for="end" class="block text-[14px] font-bold">到</label>
            <input
              type="date"
              id="end"
              v-model="endTime"
              class="text-[14px] w-[100%] mb-4 mt-1 p-1 bg-white border border-solid border-black rounded shadow"
            />
          </div>
          <label class="font-bold text-[18px]">主題</label>
          <div
            v-for="(topic, englishTopic) in newsFilter"
            :key="englishTopic"
            class="mt-1"
          >
            <input
              type="checkbox"
              :value="englishTopic"
              v-model="searchTopic"
            />
            <label class="font-bold text-[14px] m-2 py-2">{{ topic }}</label>
          </div>
          <button
            @click="chooseNews"
            class="bg-[#4f46e5] py-1 px-2 mt-3 rounded text-white font-bold"
          >
            新聞篩選
          </button>
        </aside>
        <section
          v-if="news !== undefined"
          class="flex flex-wrap justify-around w-[80%]"
        >
          <a
            :href="stock.url"
            v-for="stock in news"
            :key="stock.overall_sentiment_score"
            class="news"
          >
            <img
              :src="isBannerNull(stock.banner_image)"
              loading="lazy"
              class="w-[30%] aspect-square object-contain me-3"
              alt=""
              @error="onError"
            />
            <div>
              <h3 class="py-1 text-ellipsis overflow-hidden">
                {{ stock.title }}
              </h3>
              <p v-for="author in stock.authors" class="text-xs">
                {{ author }}
              </p>
            </div>
          </a>
        </section>
        <div v-else class="w-[80%] text-center text-2xl mt-[200px]">
          <h3>交叉比對無資料,請重新搜尋..</h3>
        </div>
      </article>
    </template>
  </NuxtLayout>
</template>
<script setup>
import charts from 'highcharts'
import { useRouter } from 'vue-router'
import { usePathStore } from '../stores/navBar.js'
import { storeToRefs } from 'pinia'
import {
  getStockButton,
  getStockData,
  getNews,
  risingStockRanking,
  losingStockRanking,
  activedStockRanking,
} from '~/utils/apis/modules/index.js'

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
const stockData = ref()
const sortedStockData = computed(() => {
  return stockData.value
    ? Object.entries(stockData.value['Time Series (1min)']).map(
        ([date, values]) => ({ date, ...values })
      )
    : undefined
})
const selectedStock = ref('AAPL')
const buttons = ref()

const news = ref()
const searchTopic = ref([])
const sortedSearchTopic = computed(() => searchTopic.value.join(','))
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

const searchNewsByStock = ref('')
const startTime = ref('')
const endTime = ref('')
const sortedStartTime = computed(() => {
  startTime.value = startTime.value
    ? dayjs(startTime.value).minute(0).hour(0).format('YYYYMMDD[T]HHmm')
    : ''

  return startTime.value
})

const sortedEndTime = computed(() => {
  endTime.value = endTime.value
    ? dayjs(endTime.value).minute(59).hour(23).format('YYYYMMDD[T]HHmm')
    : ''
  return endTime.value
})

watchEffect(() => {
  news.value
    ? news.value.forEach((news) => {
        news.authors.reverse()
      })
    : []
})

const stockRanking = ref([])

const getData = async (stock = 'AAPL', company = 'Apple Inc.') => {
  selectedStock.value = stock;
  
  const [
    stockButtonRes,
    stockDataRes,
    risingStockRankingRes,
    losingStockRankingRes,
    activedStockRankingRes,
    newsRes
  ] = await Promise.all([
    getStockButton(),
    getStockData(selectedStock.value),
    risingStockRanking(),
    losingStockRanking(),
    activedStockRanking(),
    getNews(
      sortedSearchTopic.value,
      searchNewsByStock.value,
      sortedStartTime.value,
      sortedEndTime.value
    )
  ]);

  buttons.value = stockButtonRes;
  stockData.value = stockDataRes;
  stockChartName.value = company;

  stockRanking.value = [
    risingStockRankingRes.slice(0, 5),
    losingStockRankingRes.slice(0, 5),
    activedStockRankingRes.slice(0, 5)
  ];

  news.value = newsRes.feed?.slice(0, 20) || [];
};


onMounted(() => {
  getData()
})

const changeStockChart = async (stock, company) => {
  selectedStock.value = stock
  const stockDataRes = await getStockData(selectedStock.value)
  stockData.value = stockDataRes
  stockChartName.value = company
}

// 將資料轉換成[時間,股價]
const realTimeOffer = computed(() => {
  if (!sortedStockData.value) return undefined
  return sortedStockData.value.reverse().map((stock) => {
    const timeStamp = +dayjs(stock.date)
    return [timeStamp, parseFloat(stock['2. high'])]
  })
})

const isStockRises = computed(() => {
  return (
    realTimeOffer.value[0][1] >
    realTimeOffer.value[realTimeOffer.value.length - 1][1]
  )
})

const stockChartName = ref('')

// 股票走勢設定
const chartOptions = computed(() => {
  return {
    title: {
      useHTML: true,
      text: `<span class='text-[21px]'>${stockChartName.value}</span>`,
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
        name: `${stockChartName.value}`,
        type: 'area',
        data: realTimeOffer.value,
        color: isStockRises.value ? '#ff0000' : '#56a556',
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
            [0, isStockRises.value ? '#ff000044' : '#56a55644'],
            [
              1,
              charts
                .color(isStockRises.value ? '#ff0000' : '#56a556')
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

const rankingName = (index) => {
  if (index === 0) {
    return '當日上漲股票排名'
  } else if (index === 1) {
    return '當日下跌股票排名'
  } else if (index === 2) {
    return '當日活躍股票排名'
  }
}

const rankingColor = (index) => {
  if (index === 0) {
    return ''
  } else if (index === 1) {
    return 'bg-[#ff0000]'
  } else if (index === 2) {
    return 'bg-zinc-700'
  }
}

const chooseNews = async () => {
  const newsRes = await getNews(
    sortedSearchTopic.value,
    searchNewsByStock.value,
    sortedStartTime.value,
    sortedEndTime.value
  );

  if (newsRes.feed?.length) {
    news.value = newsRes.feed.slice(0, 20);
  } else {
    news.value = undefined;
  }
};

const isAppleIcon = (name) =>
  name == 'AAPL' ? 'bg-black p-3 rounded-[50%]' : ''

const isStockRiseColor = (changesPercentage) =>
  changesPercentage > 0 ? 'text-[#56a556]' : 'text-[#ff0000]'

const isStockRise = (changesPercentage) =>
  changesPercentage > 0
    ? `+${twoAfterDecimal(changesPercentage)}`
    : `${twoAfterDecimal(changesPercentage)}`

const isBannerNull = (banner) => (banner ? banner : '~/assets/img/FTNT.png')

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

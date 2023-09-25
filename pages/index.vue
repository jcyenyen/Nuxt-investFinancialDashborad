<template>
  <NuxtLayout name="header">
    <template #main>
      <div class="box">
        <button class="btn-primary shadow" @click="getData('AAPL')">Apple</button>
        <button class="btn-primary shadow" @click="getData('GOOGL')">Google</button>
        <button class="btn-primary shadow" @click="getData('META')">META</button>
        <button class="btn-primary shadow" @click="getData('TSLA')">Tesla</button>
      </div>
      <ClientOnly>
        <highcharts
          v-if="realTimeOffer"
          class="w-[1000px] mx-auto my-10"
          :constructor-type="'stockChart'"
          :options="chartOptions"
        />
      </ClientOnly>
      <div class="flex flex-wrap justify-around">
        <a :href="v.url" v-for="(v, i) in news" class="inline-block box-border p-5 w-[300px] border border-solid border-black rounded shadow-2xl flex flex-col justify-around my-2">
          <img :src="v.banner_image" alt="">
          <div>
            <h3 class="py-1">{{ v.title }}</h3>
            <p v-for="(data) in v.authors.reverse()" class="text-xs">{{ data }}</p>
          </div> 
        </a>
      </div>
    </template>
  </NuxtLayout>
</template>
<script setup>
import charts from 'highcharts'
// SX2XVYCP8Z7I25DJ
// 3ec51f1b30948ec05697da301727451c
// 'https://financialmodelingprep.com/api/v3/historical-chart/1min/%5EGSPC?apikey=3ec51f1b30948ec05697da301727451c'
const axios = inject('axios')
definePageMeta({
  layout: false,
})

// const test = ($event) => {
//   console.log($event)
// }

// 股票資料
const data = ref()

// 新聞資料
const news = ref()

const getData = (stock = 'AAPL') => {
  axios
    .get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stock}&interval=1min&outputsize=full&apikey=SX2XVYCP8Z7I25DJ`
    )
    .then((res) => {
      data.value = Object.entries(res.data['Time Series (1min)']).map(
        ([date, values]) => ({ date, ...values })
      )
      stockName.value = stock
    })
    .catch((err) => {
      console.log(err)
    })
  axios
    .get(
      'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=SX2XVYCP8Z7I25DJ'
    )
    .then((res) => {
      console.log(res.data.feed)
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
</script>
<style lang="scss" scoped>
.box1 {
  background-color: #ff0000;
}
</style>

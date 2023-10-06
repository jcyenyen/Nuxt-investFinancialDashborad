<template>
  <NuxtLayout name="header">
    <template #main>
      <div>
        <ClientOnly>
          <highcharts
            v-if="chartOptions"
            class="w-[1000px] mx-auto my-10"
            :constructor-type="'chart'"
            :options="chartOptions"
          />
        </ClientOnly>
      </div>
      <button @click="test">123</button>
    </template>
  </NuxtLayout>
</template>
<script setup>
import charts from 'highcharts'
const axios = inject('axios')
definePageMeta({
  layout: false,
})

// key
const fmp = import.meta.env.VITE_KEY_FMP

// api

const softwareApi = `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=1000000000&volumeMoreThan=50000&sector=Technology&industry=Infrastructure&dividendMoreThan=0&betaLowerThan=1.5&limit=10&apikey=${fmp}`

const stockData = ref()

const getData = async () => {
  await axios
    .get(softwareApi)
    .then((res) => {
      stockData.value = res.data
    })
    .catch((rej) => {
      console.log(rej)
    })
}

const stockName = computed(() => {
  const data = stockData.value
    ? stockData.value.map((v) => v.symbol).join(',')
    : undefined
  return data
})

onMounted(() => {
  getData()
})

const stockByVolumeApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/quote/${stockName.value}?apikey=${fmp}`
})

const stockByVolume = ref()

const chartData = computed(() => {
  const data = stockByVolume.value
    ? stockByVolume.value.map((v,i) => {
        return {
          id: v.name,
          name: v.symbol,
          colorValue:v.changesPercentage,
          parent: 'Technology',
          value: v.volume,
        }
      })
    : undefined
  const fullData =data? [
    {
      id: 'Technology',
      name: 'Technology',
      color: '#f1f5f1',
    },
    ...data,
  ]:undefined
  return fullData
})

watchEffect(async () => {
  if (stockName.value) {
    await axios
      .get(stockByVolumeApi.value)
      .then((res) => {
        console.log(res)
        stockByVolume.value = res.data
      })
      .catch((rej) => {
        console.log(rej)
      })
  }
})

const check = ref(false)
const test = async () => {
  console.log(chartData.value)
  check.value = !check.value
}

const testdata = [
        {
          id: '1',
          name: 'test1',
          colorValue:5,
          parent: 'Technology',
          value: 100,
        },
        {
          id: '2',
          name: 'test2',
          colorValue:10,
          parent: 'Technology',
          value: 200,
        },
        {
          id: '3',
          name: 'test3',
          colorValue:15,
          parent: 'Technology',
          value: 300,
        }
]

const chartOptions = computed(() => {
  return chartData.value?{
    colorAxis : {
      minColor: '#F63538',
      maxColor: '#30cc5a',
    },
    series: [
      {
        name: 'Tech',
        type: 'treemap',
        layoutAlgorithm: 'squarified',
        allowDrillToNode: true,
        animationLimit: 1000,
        dataLabels: {
          enabled: true,
        },
        // colorAxis: {
        //   min: 0,
        //   max: 100
        // },
        levels: [
          {
            level: 1,
            //第一層標籤
            dataLabels: {
              enabled: false,
            },
            borderWidth: 1,
            borderColor:'#363a46',
            levelIsConstant: false,
          },
          {
            level: 1,
            dataLabels: {
              style: {
                fontSize: '14px',
              },
            },
          },
        ],
        // label:{
        //   enabled:true
        // },
        accessibility: {
          exposeAsGroupOnly: false,
        },
        data: chartData.value
      },
    ],
    subtitle: {
      text: 'Software—Infrastructure',
      align: 'left',
    },
    title: {
      text: '股票熱區地圖',
      align: 'left',
    },
  }:undefined
})
</script>
<style lang="scss" scoped>
.box1 {
  background-color:  #363a46;
}
.label_text {
  @apply text-white
}
</style>

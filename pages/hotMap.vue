<template>
  <NuxtLayout name="header">
    <template #main>
      <article class="mx-auto">
        <ClientOnly>
          <highcharts
            v-if="chartOptions"
            class="w-[92%] mx-auto my-10"
            :constructor-type="'chart'"
            :options="chartOptions"
          />
        </ClientOnly>
      </article>
    </template>
  </NuxtLayout>
</template>
<script setup>
import axios from 'axios'
import { usePathStore } from '../stores/navBar.js'
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: false,
})

// 所在頁面 header按鈕顯示顏色
const pathStore = usePathStore()
const { path } = storeToRefs(pathStore)

const route = useRoute()
path.value = route.name

// key
const fmp = import.meta.env.VITE_KEY_FMP

// api

const softwareApi = `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=10000000000&volumeMoreThan=50000&sector=Technology&dividendMoreThan=0&betaLowerThan=1.5&limit=500&apikey=${fmp}`

// &industry=Infrastructure

const sectors = [
  'Consumer Electronics',
  'Software—Infrastructure',
  'Semiconductors',
  'Semiconductor Equipment & Materials',
  'Communication Equipment',
  'Software—Application',
  'Information Technology Services',
  'Solar',
  'Scientific & Technical Instruments',
  'Computer Hardware',
  'Electronic Components',
]

const stockData = ref()

const filteredStockBySector = (sector) => {
  if (!stockData.value) return [];

  return stockData.value
    .filter((stock) => stock.industry === sector)
    .slice(0, 10);
};


const technologyStock = computed(() => {
  return sectors.reduce((total, sector) => {
    return total.concat(filteredStockBySector(sector))
  }, [])
})

// 篩選後股票代號連接成字串
const stockName = computed(() => {
  const data =
    technologyStock.value.length !== 0
      ? technologyStock.value.map((stock) => stock.symbol).join(',')
      : undefined
  return data
})

const getData = async () => {
  const res = await axios.get(softwareApi)
  stockData.value = res.data
}

onMounted(() => {
  getData()
})

// 做圖表所需股票資料的api
const stockByVolumeApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/quote/${stockName.value}?apikey=${fmp}`
})

const stockByVolume = ref([])

// 加入行業產業
const completeStockData = computed(() => {
  if (!stockByVolume.value.length) return undefined

  return stockByVolume.value.map((volume) => {
    const matchSymbol = technologyStock.value.find(
      (stock) => stock.symbol === volume.symbol
    )
    if (matchSymbol) {
      volume.sector = matchSymbol.sector
      volume.industry = matchSymbol.industry
    }
    return volume
  })
})

const chartData = computed(() => {
  if (!completeStockData.value) return undefined

  const data = completeStockData.value.map((stock) => ({
    id: stock.name,
    name: `<h3 style="font-size:48px;">${
      stock.symbol
    }</h3><h4 style="font-size:24px;text-align:center;">${twoAfterDecimal(
      stock.changesPercentage
    )} %</h4>`,
    colorValue: stock.changesPercentage,
    parent: stock.industry,
    value: stock.volume,
  }))

  const industrySet = new Set(completeStockData.value.map((stock) => stock.industry))
  const sectorSet = new Set(completeStockData.value.map((stock) => stock.sector))

  const level1 = [...sectorSet].map((sector) => ({
    id: sector,
    name: sector,
    color: 'transparent',
  }))

  const level2 = [...industrySet].map((industry) => ({
    id: industry,
    name: `<div style="background-color: #000000;width:100px;word-break: break-all;overflow-wrap: break-word;textOverflow: ellipsis;"><h3>${industry}</h3></div>`,
    parent: 'Technology',
    color: 'transparent',
  }))

  return [...level1, ...level2, ...data]
})

watchEffect(async () => {
  if (stockName.value) {
    const res = await axios.get(stockByVolumeApi.value)
    stockByVolume.value = res.data
  }
})

// 熱區地圖
const chartOptions = computed(() => {
  return chartData.value
    ? {
        accessibility: {
          enabled: false,
        },
        chart: {
          height: '65%',
          width: '1400',
        },
        colorAxis: {
          // minColor: '#F63538',
          // maxColor: '#30cc5a',
          max: 3,
          min: -3,
          stops: [
            [0, '#F63538'],
            [0.16, '#bf4045'],
            [0.33, '#8b444e'],
            [0.5, '#414554'],
            [0.66, '#35764e'],
            [0.82, '#2f9e4f'],
            [1, '#30cc5a'],
          ],
        },
        stockTools: {
          gui: {
            enabled: false, // 啟用 GUI
          },
        },
        plotOptions: {
          treemap: {
            states: {
              hover: {
                enabled: false, // 關閉 hover 效果
                brightness: 0, // 確保沒有亮度變化
                borderColor: 'transparent', // 設定邊框顏色為透明
              },
            },
            // dataLabels: {
            //   align: 'left', // 左對齊
            //   verticalAlign: 'top', // 置於區塊的最上方
            //   style: {
            //     width: '100%', // 設定寬度為 100%
            //     textOverflow: 'ellipsis', // 如果文本超出，則使用省略號
            //   },
            // },
          },
        },
        series: [
          {
            name: 'Tech',
            type: 'treemap',
            layoutAlgorithm: 'squarified',
            allowDrillToNode: true,
            animationLimit: 1000,
            // borderWidth: 3,
            // borderColor: '#fff',
            // dataLabels: {
            //   enabled: true,
            // },
            levels: [
              {
                level: 1,
                //第一層標籤
                dataLabels: {
                  enabled: false,
                  align: 'left', // 左對齊
                  verticalAlign: 'top', // 置於區塊的最上方
                  fontSize: '14px',
                  textOutline: false,
                  borderWidth: 5,
                  backgroundColor: 'black',
                  style: {
                    fontSize: '12px',
                    textOutline: false,
                    color: 'white',
                    textOverflow: 'pre-wrap',
                    whiteSpace: 'nowrap',
                    width: '100%', // 設定寬度為 100%
                    textOverflow: 'ellipsis', // 如果文本超出，則使用省略號
                  },
                  width: '100%',
                },
                color: 'transparent',
                borderWidth: 8,
                borderColor: '#363a46',
                levelIsConstant: true,
                tooltip: {
                  enabled: false,
                },
              },
              {
                level: 2,
                dataLabels: {
                  align: 'left', // 左對齊
                  verticalAlign: 'top', // 置於區塊的最上方
                  enabled: true,
                  style: {
                    fontSize: '12px',
                    textOutline: false,
                    color: 'white',
                    textOverflow: 'pre-wrap',
                  },
                },
                color: 'transparent',
                borderWidth: 5,
                borderColor: '#363a46',
              },
              {
                level: 3,
                dataLabels: {
                  useHTML: true,
                  formatter: function () {
                    // 檢查框框的面積
                    if (
                      this.point.shapeArgs.width / this.point.shapeArgs.height >
                        20 ||
                      this.point.shapeArgs.height / this.point.shapeArgs.width >
                        20 ||
                      this.point.shapeArgs.width < 40 ||
                      this.point.shapeArgs.height < 35
                    ) {
                      return null
                    }
                    if (
                      this.point.shapeArgs.width * this.point.shapeArgs.height >
                      200000
                    ) {
                      return this.point.name
                    } else if (
                      this.point.shapeArgs.width * this.point.shapeArgs.height >
                      40000
                    ) {
                      return this.point.name
                        .replace(
                          '<h3 style="font-size:48px;">',
                          '<h3 style="font-size:36px;text-align:center;">'
                        )
                        .replace(
                          '<h4 style="font-size:24px;text-align:center;">',
                          '<h4 style="font-size:18px;text-align:center;">'
                        )
                    } else if (
                      this.point.shapeArgs.width * this.point.shapeArgs.height >
                      15000
                    ) {
                      return this.point.name
                        .replace(
                          '<h3 style="font-size:48px;">',
                          '<h3 style="font-size:24px;text-align:center;">'
                        )
                        .replace(
                          '<h4 style="font-size:24px;text-align:center;">',
                          '<h4 style="font-size:12px;text-align:center;">'
                        )
                    } else if (
                      this.point.shapeArgs.width * this.point.shapeArgs.height >
                      7500
                    ) {
                      return this.point.name
                        .replace(
                          '<h3 style="font-size:48px;">',
                          '<h3 style="font-size:16px;text-align:center;">'
                        )
                        .replace(
                          '<h4 style="font-size:24px;text-align:center;">',
                          '<h4 style="font-size:12px;text-align:center;">'
                        )
                    } else if (
                      this.point.shapeArgs.width * this.point.shapeArgs.height >
                      4000
                    ) {
                      return this.point.name
                        .replace(
                          '<h3 style="font-size:48px;">',
                          '<h3 style="font-size:12px;text-align:center;">'
                        )
                        .replace(
                          '<h4 style="font-size:24px;text-align:center;">',
                          '<h4 style="font-size:8px;text-align:center;display:none;">'
                        )
                    } else {
                      return null // 不顯示 dataLabel
                    }
                  },
                  enabled: true,
                  align: 'center', // 左對齊
                  verticalAlign: 'middle', // 置於區塊的最上方
                  style: {
                    fontSize: '12px',
                    textOutline: false,
                    color: 'white',
                    textOverflow: 'pre-wrap',
                  },
                },
                borderWidth: 1,
                borderColor: '#363a46',
                color: 'transparent',
              },
            ],
            // label:{
            //   enabled:true
            // },
            accessibility: {
              exposeAsGroupOnly: false,
            },
            data: chartData.value,
          },
        ],
        subtitle: {
          text: 'Technology',
          align: 'left',
        },
        title: {
          text: '股票熱區地圖',
          align: 'left',
        },
        tooltip: {
          enabled: false,
        },
      }
    : undefined
})

progressDone(chartOptions)
</script>
<style lang="scss" scoped>
.box1 {
  background-color: #000000;
}
</style>

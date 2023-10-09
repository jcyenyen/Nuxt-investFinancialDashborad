<template>
  <NuxtLayout name="header">
    <template #main>
      <div>
        <ClientOnly>
          <highcharts
            v-if="chartOptions"
            class="w-[90%] mx-auto my-10"
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

const softwareApi = `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=10000000000&volumeMoreThan=50000&sector=Technology&dividendMoreThan=0&betaLowerThan=1.5&limit=500&apikey=${fmp}`

// &industry=Infrastructure
// 'Consumer Electronics' 'Software—Infrastructure' 'Semiconductors' 'Semiconductor Equipment & Materials' 'Communication Equipment' 'Software—Application' 'Information Technology Services' 'Solar' 'Scientific & Technical Instruments' 'Computer Hardware' 'Electronic Components'

const stockData = ref()

const ConsumerElectronics = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Consumer Electronics'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const SoftwareInfrastructure = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Software—Infrastructure'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const Semiconductors = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Semiconductors'
      })
    : []
  data.length = data.length <= 10 ? data.length : 10
  return data
})

const SemiconductorEquipmentMaterials = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Semiconductor Equipment & Materials'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})
const CommunicationEquipment = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Communication Equipment'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const SoftwareApplication = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Software—Application'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const InformationTechnologyServices = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Information Technology Services'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const Solar = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Solar'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const ScientificTechnicalInstruments = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Scientific & Technical Instruments'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const ComputerHardware = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Computer Hardware'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const ElectronicComponents = computed(() => {
  const data = stockData.value
    ? stockData.value.filter((v) => {
        return v.industry === 'Electronic Components'
      })
    : []

  data.length = data.length <= 10 ? data.length : 10
  return data
})

const technologyStock = computed(() => {
  let data = []
  data.push(
    ...ConsumerElectronics.value,
    ...SoftwareInfrastructure.value,
    ...Semiconductors.value,
    ...SemiconductorEquipmentMaterials.value,
    ...CommunicationEquipment.value,
    ...SoftwareApplication.value,
    ...InformationTechnologyServices.value,
    ...Solar.value,
    ...ScientificTechnicalInstruments.value,
    ...ComputerHardware.value,
    ...ElectronicComponents.value
  )
  data = data.length ? data : []
  return data
})

const getData = async () => {
  await axios
    .get(softwareApi)
    .then((res) => {
      console.log(res.data)
      stockData.value = res.data
    })
    .catch((rej) => {
      console.log(rej)
    })
}

const stockName = computed(() => {
  const data =
    technologyStock.value.length !== 0
      ? technologyStock.value.map((v) => v.symbol).join(',')
      : undefined
  return data
})

onMounted(() => {
  getData()
})

const stockByVolumeApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/quote/${stockName.value}?apikey=${fmp}`
})

const stockByVolume = ref([])

const stockFullData = computed(() => {
  const data =
    stockByVolume.value.length !== 0
      ? stockByVolume.value.map((volume) => {
          let matchSymbol = technologyStock.value.find(
            (v) => v.symbol === volume.symbol
          )
          if (matchSymbol) {
            volume.sector = matchSymbol.sector
            volume.industry = matchSymbol.industry
          }
          return volume
        })
      : undefined
  return data
})

const chartData = computed(() => {
  const data = stockFullData.value
    ? stockFullData.value.map((v) => {
        return {
          id: v.name,
          name: `${v.symbol} ${v.changesPercentage} %`,
          colorValue: v.changesPercentage,
          parent: v.industry,
          value: v.volume,
        }
      })
    : undefined
  const industry = stockFullData.value
    ? new Set(
        stockFullData.value.map((v) => {
          return v.industry
        })
      )
    : undefined
  const sector = stockFullData.value
    ? new Set(
        stockFullData.value.map((v) => {
          return v.sector
        })
      )
    : undefined

  const level1 = sector
    ? [...sector].map((v) => {
        const data = {
          id: v,
          name: v,
          color: 'transparent',
        }
        return data
      })
    : undefined

  const level2 = industry
    ? [...industry].map((v) => {
        const data = {
          id: v,
          name: v,
          parent: 'Technology',
          color: 'transparent',
        }
        return data
      })
    : undefined
  console.log(level2)
  const fullData = data ? [...level1, ...level2, ...data] : undefined
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
    colorValue: 5,
    parent: 'Technology',
    value: 100,
  },
  {
    id: '2',
    name: 'test2',
    colorValue: 10,
    parent: 'Technology',
    value: 200,
  },
  {
    id: '3',
    name: 'test3',
    colorValue: 15,
    parent: 'Technology',
    value: 300,
  },
]

const chartOptions = computed(() => {
  return chartData.value
    ? {
        chart: {
          height: '800px',
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
            // dataLabels: {
            //   enabled: true,
            // },
            levels: [
              {
                level: 1,
                //第一層標籤
                dataLabels: {
                  enabled: true,
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
                borderWidth: 1,
                borderColor: '#363a46',
                levelIsConstant: false,
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
                borderColor: '#363a46',
              },
              {
                level: 3,
                dataLabels: {
                  useHTML: true,
                  formatter: function () {
                    // 檢查框框的面積
                    if (
                      this.point.shapeArgs.width * this.point.shapeArgs.height <
                      3000
                    ) {
                      // 這裡的 5000 是一個示例值，你可以根據需要調整
                      return null // 不顯示 dataLabel
                    }
                    return this.point.name
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
          text: 'Software—Infrastructure',
          align: 'left',
        },
        title: {
          text: '股票熱區地圖',
          align: 'left',
        },
      }
    : undefined
})
</script>
<style lang="scss" scoped>
.box1 {
  background-color: #4a4c52;
}
.label_text {
  @apply text-white;
}
</style>

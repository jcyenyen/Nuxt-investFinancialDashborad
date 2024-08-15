<template>
  <NuxtLayout name="header">
    <template v-if="sortedStockData" #main>
      <section class="w-[100%] mx-auto mt-5 mb-10 py-10 flex flex-wrap">
        <div
          v-for="(kind, index) in stockOptions"
          :key="index"
          class="my-1 w-[24%] flex justify-end items-center"
        >
          <label :for="kind.id" class="font-bold text-[16px]">{{
            kind.label
          }}</label>
          <select :id="kind.id" v-model="kind.model" @change="handleSelect">
            <option value="" key="none" label="請選擇" />
            <option
              v-for="(option, index) in kind.options"
              :value="option.value || option.sector || option.industry"
              :key="option.ID || index"
              :label="option.label || option.sector || option.industry"
            />
          </select>
        </div>
      </section>
      <section class="w-[93%] mx-auto">
        <el-table
          :data="sortedStockData"
          style="width: 100%"
          :default-sort="{ prop: 'marketCap', order: 'descending' }"
        >
          <el-table-column
            prop="symbol"
            label="股票代號"
            sortable
            mid-width="100"
          >
            <template #default="scope">
              <div class="flex items-center">
                <img
                  :key="`${scope.row.symbol}`"
                  :src="`https://financialmodelingprep.com/image-stock/${scope.row.symbol}.png`"
                  class="inline-block w-[20px] h-[20px] aspect-square me-3"
                  :class="
                    scope.row.symbol == 'AAPL'
                      ? 'bg-black p-1 rounded-[50%]'
                      : ''
                  "
                  @error="onError"
                />
                <nuxt-link
                  :to="`/stocks/${scope.row.symbol}`"
                  class="text-cyan-500"
                  >{{ scope.row.symbol }}</nuxt-link
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="companyName"
            label="公司名稱"
            sortable
            width="200"
          >
            <template #default="scope">
              <p class="truncate">{{ scope.row.companyName }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="sector" label="產業" sortable />
          <el-table-column prop="industry" label="行業" width="200" sortable />
          <el-table-column prop="marketCap" label="市值" width="100" sortable>
            <template #default="scope">
              <p>
                {{ numberTranslate(scope.row.marketCap) }}
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="股價" width="100" sortable>
            <template #default="scope">
              <p
                class="font-bold"
                :class="
                  scope.row.changesPercentage < 0
                    ? 'text-[#ff0000]'
                    : 'text-[#56a556]'
                "
              >
                {{ twoAfterDecimal(scope.row.price)
                }}<span class="text-[#606266] font-normal text-[8px]">USD</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="changesPercentage" label="股價漲跌幅" sortable>
            <template #default="scope">
              <p
                v-if="scope.row.changesPercentage < 0"
                class="font-bold text-[#ff0000]"
              >
                {{ twoAfterDecimal(scope.row.changesPercentage) }}%
              </p>
              <p
                v-else-if="scope.row.changesPercentage === 0"
                class="font-bold"
              >
                {{ scope.row.changesPercentage }}%
              </p>
              <p v-else class="font-bold text-[#56a556]">
                +{{ twoAfterDecimal(scope.row.changesPercentage) }}%
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="volume" label="當日交易量" sortable>
            <template #default="scope">
              <p>
                {{ numberTranslate(scope.row.volume) }}
              </p>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex my-[30px] justify-end">
          <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="page"
            :page-count="pageTotal"
            :page-size="pageSize"
            :page-sizes="[10, 30, 50, 100]"
            :total="pageTotal"
            @current-change="handleCurrentPageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </section>
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

// 找相對的上限或下限
const matchOption = (stockOptions, limit, choose) => {
  const match = stockOptions.find((option) => option.value === choose)
  return match ? match[limit] : ''
}

// 篩選條件

const marketCap = ref('')
const marketCapMore = computed(() => {
  return matchOption(marketCapOption.value, 'more', marketCap.value)
})
const marketCapLower = computed(() => {
  return matchOption(marketCapOption.value, 'lower', marketCap.value)
})

const volume = ref('')
const volumeMore = computed(() => {
  return matchOption(volumeOption.value, 'more', volume.value)
})
const volumeLower = computed(() => {
  return matchOption(volumeOption.value, 'lower', volume.value)
})

const sector = ref('Technology')
const industry = ref('Software - Infrastructure')

const dividend = ref('')
const dividendMore = computed(() => {
  return matchOption(dividendOption.value, 'more', dividend.value)
})
const dividendLower = computed(() => {
  return matchOption(dividendOption.value, 'lower', dividend.value)
})

const beta = ref('')
const betaMore = computed(() => {
  return matchOption(betaOption.value, 'more', beta.value)
})
const betaLower = computed(() => {
  return matchOption(betaOption.value, 'lower', beta.value)
})

const price = ref('')
const priceMore = computed(() => {
  return matchOption(priceOption.value, 'more', price.value)
})
const priceLower = computed(() => {
  return matchOption(priceOption.value, 'lower', price.value)
})

// 篩選的option

const marketCapOption = ref([
  {
    label: '特大型(200億美元以上)',
    value: '20000000000',
    more: '20000000000',
    lower: '',
  },
  {
    label: '大型(10億美元至200億美元)',
    value: '1000000001',
    more: '1000000000',
    lower: '20000000000',
  },
  {
    label: '中型(2億美元至10億美元)',
    value: '200000001',
    more: '200000000',
    lower: '1000000000',
  },
  {
    label: '小型(300萬美元至2億美元)',
    value: '3000001',
    more: '3000000',
    lower: '200000000',
  },
  {
    label: '微型(50萬美元至300萬美元)',
    value: '500000',
    more: '500000',
    lower: '3000000',
  },
  { label: '超過5000萬美元', value: '50000000', more: '50000000', lower: '' },
  { label: '超過3億美元', value: '300000000', more: '300000000', lower: '' },
  { label: '超過20億美元', value: '2000000000', more: '2000000000', lower: '' },
  {
    label: '超過100億美元',
    value: '10000000000',
    more: '10000000000',
    lower: '',
  },
])
const volumeOption = ref([
  { label: '超過5萬', value: '5', more: '50000' },
  { label: '超過10萬', value: '10', more: '100000' },
  { label: '超過30萬', value: '30', more: '300000' },
  { label: '超過50萬', value: '50', more: '500000' },
  { label: '超過75萬', value: '75', more: '750000' },
  { label: '超過100萬', value: '100', more: '1000000' },
  { label: '少於5萬', value: '0', lower: '50000' },
  { label: '少於10萬', value: '1', lower: '100000' },
  { label: '少於30萬', value: '2', lower: '300000' },
  { label: '少於50萬', value: '3', lower: '500000' },
  { label: '少於75萬', value: '4', lower: '750000' },
  { label: '10萬至50萬', value: '1050', more: '100000', lower: '500000' },
  { label: '10萬至100萬', value: '10100', more: '100000', lower: '1000000' },
  { label: '50萬至100萬', value: '50100', more: '500000', lower: '1000000' },
])
const sectorOption = ref([])
const industryOption = ref([])
const dividendOption = ref([
  { label: '超過0美元', value: '0', more: '0', lower: '' },
  { label: '超過1美元', value: '5', more: '1', lower: '' },
  { label: '超過5美元', value: '2', more: '5', lower: '' },
  { label: '超過10美元', value: '1', more: '10', lower: '' },
  { label: '少於10美元', value: '3', more: '', lower: '10' },
  { label: '少於5美元', value: '4', more: '', lower: '5' },
  { label: '少於1美元', value: '7', more: '', lower: '1' },
])
const betaOption = ref([
  { label: '低於0.5', value: '1', more: '', lower: '0.5' },
  { label: '低於1', value: '2', more: '', lower: '1' },
  { label: '低於1.5', value: '3', more: '', lower: '1.5' },
  { label: '低於2', value: '4', more: '', lower: '2' },
  { label: '高於0.5', value: '5', more: '0.5', lower: '' },
  { label: '高於1', value: '6', more: '1', lower: '' },
  { label: '高於1.5', value: '7', more: '1.5', lower: '' },
  { label: '高於2', value: '8', more: '2', lower: '' },
  { label: '0.5 ~ 1', value: '9', more: '0.5', lower: '1' },
  { label: '0.5 ~ 1.5', value: '10', more: '0.5', lower: '1.5' },
  { label: '1 ~ 1.5', value: '11', more: '1', lower: '1.5' },
  { label: '1.5 ~ 2', value: '12', more: '1.5', lower: '2' },
])
const priceOption = ref([
  { label: '小於1美元', value: '1', more: '', lower: '1' },
  { label: '小於5美元', value: '2', more: '', lower: '5' },
  { label: '小於10美元', value: '3', more: '', lower: '10' },
  { label: '小於15美元', value: '4', more: '', lower: '15' },
  { label: '小於20美元', value: '5', more: '', lower: '20' },
  { label: '小於50美元', value: '6', more: '', lower: '50' },
  { label: '多於1美元', value: '7', more: '1', lower: '' },
  { label: '多於5美元', value: '8', more: '5', lower: '' },
  { label: '多於10美元', value: '9', more: '10', lower: '' },
  { label: '多於15美元', value: '10', more: '15', lower: '' },
  { label: '多於20美元', value: '11', more: '20', lower: '' },
  { label: '多於50美元', value: '12', more: '50', lower: '' },
  { label: '1~5美元', value: '13', more: '1', lower: '5' },
  { label: '1~10美元', value: '14', more: '1', lower: '10' },
  { label: '1~20美元', value: '15', more: '1', lower: '20' },
  { label: '5~20美元', value: '16', more: '5', lower: '20' },
  { label: '20~50美元', value: '17', more: '20', lower: '50' },
  { label: '50~100美元', value: '18', more: '50', lower: '100' },
])

const stockOptions = ref([
  {
    id: 'marketCap',
    label: '市值',
    model: marketCap,
    options: marketCapOption,
  },
  {
    id: 'volume',
    label: '目前成交量',
    model: volume,
    options: volumeOption,
  },
  {
    id: 'sector',
    label: '產業',
    model: sector,
    options: sectorOption,
  },
  {
    id: 'industry',
    label: '行業',
    model: industry,
    options: industryOption,
  },
  { id: 'beta', label: 'Beta值', model: beta, options: betaOption },
  {
    id: 'dividend',
    label: '股息',
    model: dividend,
    options: dividendOption,
  },
  {
    id: 'price',
    label: '股價',
    model: price,
    options: priceOption,
  },
])

// api
const stockApi = computed(
  () =>
    `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=${marketCapMore.value}&marketCapLowerThan=${marketCapLower.value}&volumeMoreThan=${volumeMore.value}&volumeLowerThan=${volumeLower.value}&sector=${sector.value}&industry=${industry.value}&dividendMoreThan=${dividendMore.value}&dividendLowerThan=${dividendLower.value}&betaMoreThan=${betaMore.value}&betaLowerThan=${betaLower.value}&priceMoreThan=${priceMore.value}&priceLowerThan=${priceLower.value}&limit=&apikey=${fmp}`
)

const sectorOptionApi = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${fmp}`

const industryOptionApi = `https://financialmodelingprep.com/api/v4/industry_price_earning_ratio?date=2023-10-10&exchange=NASDAQ&apikey=${fmp}`

const getDataApi = () => {
  const getStockApi = axios.get(stockApi.value)
  const getSectorApi = axios.get(sectorOptionApi)
  const getIndustryApi = axios.get(industryOptionApi)

  return [getStockApi, getSectorApi, getIndustryApi]
}

const stockData = ref([])

const page = ref(1)
const pageTotal = ref()
const pageSize = ref(30)

const getData = () => {
  Promise.all(getDataApi())
    .then((res) => {
      stockData.value = res[0].data
      sectorOption.value = res[1].data.map((stock) => {
        if (stock.sector === 'Information Technology') {
          stock.sector = 'Technology'
        }
        return stock
      })
      industryOption.value = res[2].data
    })
    .catch((rej) => {
      console.log(rej)
    })
}

onMounted(() => {
  getData()
})

watchEffect(() => {
  pageTotal.value = Math.ceil(stockData.value.length / pageSize.value)
})

const handleSelect = async () => {
  const [getStockApi, ,] = getDataApi()
  await getStockApi
    .then((res) => {
      stockData.value = res.data
    })
    .catch((rej) => {
      console.log(rej)
    })
}

const stockName = computed(() => {
  const data =
    stockData.value.length !== 0
      ? stockData.value.map((stock) => stock.symbol).join(',')
      : undefined
  return data
})

// 含漲跌幅的api
const stockByChangeApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/quote/${stockName.value}?apikey=${fmp}`
})

// 漲跌幅
const stockByChange = ref([])

watchEffect(async () => {
  if (stockName.value) {
    await axios
      .get(stockByChangeApi.value)
      .then((res) => {
        stockByChange.value = res.data
      })
      .catch((rej) => {
        console.log(rej)
      })
  }
})

// 篩選後股票(含漲跌幅)
const sortedStockData = computed(() => {
  if (!stockByChange.value.length) return undefined

  const data = stockData.value.map((stock) => {
    const matchSymbol = stockByChange.value.find(
      (change) => stock.symbol === change.symbol
    )
    return matchSymbol
      ? { ...stock, changesPercentage: matchSymbol.changesPercentage }
      : stock
  })

  return data.slice(
    (page.value - 1) * pageSize.value,
    page.value * pageSize.value
  )
})

// 數據加上 百萬或 兆的單位
const numberTranslate = (num) => {
  num = num.toString()
  const length = num.length
  const numberSlice = (start, middle, end) => {
    const integer = num.slice(start, middle)
    const decimal = num.slice(middle, end)
    return { integer, decimal }
  }
  if (length > 9) {
    const { integer, decimal } = numberSlice(0, length - 9, length - 7)
    num = `${integer}.${decimal}B`
  } else if (length > 6) {
    const { integer, decimal } = numberSlice(0, length - 6, length - 4)
    num = `${integer}.${decimal}M`
  } else if (length > 3) {
    const { integer, decimal } = numberSlice(0, length - 3, length)
    num = `${integer},${decimal}`
  }
  return num
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getData()
}

const handleCurrentPageChange = (val) => {
  page.value = val
  getData()
}

progressDone(sortedStockData)
</script>
<style lang="scss" scoped>
.box1 {
  background-color: #ffffff;
}
:deep(.el-table th) {
  background: #d3d3d3;
  padding: 15px 0;
  color: black;
}
:deep(.el-table td) {
  padding: 10px 0;
}
:deep(.el-table tr:nth-child(2n)) {
  background-color: #f4f4f4;
}
:deep(.el-table th .cell) {
  font-size: 18px;
}
</style>

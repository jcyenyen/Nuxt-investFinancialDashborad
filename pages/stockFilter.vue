<template>
  <NuxtLayout name="header">
    <template #main>
      <div class="w-[90%] mx-auto my-5">
        <div class="my-1 w-[50%]">
          <label for="marketCap" class="font-bold">市值超過:</label>
          <select
            class="border border-solid border-[#bebebe] rounded shadow ms-2 w-[70%]"
            id="marketCap"
            v-model="marketCap"
            @change="getData"
          >
            <option value="" key="none" label="請選擇" />
            <option
              v-for="(v,i) in marketCapOption"
              :value="v.value"
              :key="i"
              :label="v.label"
            />
          </select>
        </div>
        <div class="my-1 w-[50%]">
          <label for="volume" class="font-bold">目前成交量超過:</label>
          <select
            class="border border-solid border-[#bebebe] rounded shadow ms-2 w-[70%]"
            id="volume"
            v-model="volume"
            @change="getData"
          >
            <option value="" key="none" label="請選擇" />
            <option
              v-for="(v,i) in volumeOption"
              :value="v.value"
              :key="i"
              :label="v.label"
            />
          </select>
        </div>
        <div class="my-1 w-[50%]">
          <label for="sector" class="font-bold">產業版塊:</label>
          <select
            class="border border-solid border-[#bebebe] rounded shadow ms-2 w-[70%]"
            id="sector"
            v-model="sector"
            @change="getData"
          >
            <option value="" key="none" label="請選擇" />
            <option
              v-for="v in sectorOption"
              :value="v.sector"
              :key="v.ID"
              :label="v.sector"
            />
          </select>
        </div>
        <div class="my-1 w-[50%]">
          <label for="industry" class="font-bold">產業:</label>
          <select
            class="border border-solid border-[#bebebe] rounded shadow ms-2 w-[70%]"
            id="industry"
            v-model="industry"
            @change="getData"
          >
            <option value="" key="none" label="請選擇" />
            <option
              v-for="(v,i) in industryOption"
              :value="v.industry"
              :key="i"
              :label="v.industry"
            />
          </select>
        </div>
        <div class="my-1 w-[50%]">
          <label for="beta" class="font-bold">Beta值低於:</label>
          <select
            class="border border-solid border-[#bebebe] rounded shadow ms-2 w-[70%]"
            id="beta"
            v-model="beta"
            @change="getData"
          >
            <option value="" key="none" label="請選擇" />
            <option
              v-for="(v,i) in betaOption"
              :value="v.value"
              :key="i"
              :label="v.label"
            />
          </select>
        </div>
        <div class="my-1 w-[50%]">
          <label for="dividend" class="font-bold">股息:</label>
          <select
            class="border border-solid border-[#bebebe] rounded shadow ms-2 w-[70%]"
            id="dividend"
            v-model="dividend"
            @change="getData"
          >
            <option value="" key="none" label="請選擇" />
            <option
              v-for="(v,i) in dividendOption"
              :value="v.value"
              :key="i"
              :label="v.label"
            />
          </select>
        </div>
      </div>
      <div class="w-[90%] mx-auto">
        <el-table :data="stockResult" style="width: 100%">
          <el-table-column prop="symbol" label="股票代號" width="180" />
          <el-table-column prop="companyName" label="公司名稱" width="180" />
          <el-table-column prop="sector" label="產業" />
          <el-table-column prop="industry" label="行業" />
          <el-table-column prop="marketCap" label="市值" />
          <el-table-column prop="price" label="股價" />
          <el-table-column prop="changesPercentage" label="股價漲跌幅" />
          <el-table-column prop="volume" label="當日交易量" />
        </el-table>
        <div class="flex my-[30px] justify-end">
          <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
        </div>
      </div>
      <button @click="test">test</button>
    </template>
  </NuxtLayout>
</template>
<script setup>
const axios = inject('axios')
definePageMeta({
  layout: false,
})

// key
const fmp = import.meta.env.VITE_KEY_FMP

// api

const marketCap = ref('10000000000')
const volume = ref('50000')
const sector = ref('Technology')
const industry = ref('Software—Infrastructure')
const dividend = ref('0')
const beta = ref('1.5')

const marketCapOption = ref([
  {label:'超過5000萬美元',value:'50000000'},
  {label:'超過3億美元',value:'300000000'},
  {label:'超過20億美元',value:'2000000000'},
  {label:'超過100億美元',value:'10000000000'},
])
const volumeOption = ref([
  {label:'超過5萬',value:'50000'},
  {label:'超過10萬',value:'100000'},
  {label:'超過20萬',value:'200000'},
  {label:'超過30萬',value:'300000'},
  {label:'超過40萬',value:'400000'},
  {label:'超過50萬',value:'500000'},
  {label:'超過75萬',value:'750000'},
  {label:'超過100萬',value:'1000000'},
])
const sectorOption = ref([])
const industryOption = ref([])
const dividendOption = ref([
  {label:'超過0美元',value:'0'},
  {label:'超過10美元',value:'10'},
  {label:'超過50美元',value:'50'},
])
const betaOption = ref([
  {label:'低於0.5',value:'0.75'},
  {label:'低於1',value:'1'},
  {label:'低於1.25',value:'1.25'},
  {label:'低於1.5',value:'1.5'},
  {label:'低於2',value:'2'},
])

const stockApi =computed(()=>`https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=${marketCap.value}&volumeMoreThan=${volume.value}&sector=${sector.value}&industry=${industry.value}&dividendMoreThan=${dividend.value}&betaLowerThan=${beta.value}&limit=500&apikey=${fmp}`)

const sectorApi = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${fmp}`

const industryApi = `https://financialmodelingprep.com/api/v4/industry_price_earning_ratio?date=2023-10-10&exchange=NASDAQ&apikey=${fmp}`

// const getStockApi = axios.get(stockApi)
// const getSectorApi = axios.get(sectorApi)
// const getIndustryApi = axios.get(industryApi)

// Promise.all[getStockApi,getSectorApi,getIndustryApi]

// 股票

const stockData = ref([])

const getData = async () => {
  await axios
    .get(stockApi.value)
    .then((res) => {
      console.log(res.data)
      stockData.value = res.data
    })
    .catch((rej) => {
      console.log(rej)
    })
  await axios
    .get(sectorApi)
    .then((res) => {
      sectorOption.value = res.data.map((v) => {
        if (v.sector === 'Information Technology') {
          v.sector = 'Technology'
        }
        return v
      })
    })
    .catch((rej) => {
      console.log(rej)
    })
  await axios
    .get(industryApi)
    .then((res) => {
      industryOption.value = res.data
    })
    .catch((rej) => {
      console.log(rej)
    })
}

onMounted(() => {
  getData()
})

const stockName = computed(() => {
  const data =
    stockData.value.length !== 0
      ? stockData.value.map((v) => v.symbol).join(',')
      : undefined
  return data
})

const stockByChangeApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/quote/${stockName.value}?apikey=${fmp}`
})

const stockByChange = ref([])

const stockResult = computed(() => {
  const data = stockByChange.value.length
    ? stockData.value.map((v) => {
        let matchSymbol = stockByChange.value.find(
          (change) => v.symbol === change.symbol
        )
        if (matchSymbol) {
          v.changesPercentage = matchSymbol.changesPercentage
        }
        return v
      })
    : undefined
  return data
})

const test = async () => {
  console.log(stockResult.value)
}

watchEffect(async () => {
  if (stockName.value) {
    await axios
      .get(stockByChangeApi.value)
      .then((res) => {
        console.log(res)
        stockByChange.value = res.data
      })
      .catch((rej) => {
        console.log(rej)
      })
  }
})

// 頁籤

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)

// 分頁
const handleSizeChange = (val) => {
  pageSize.value = val
  getData()
}

// 修改頁面容量
const handleCurrentChange = (val) => {
  page.value = val
  getData()
}

</script>
<style lang="scss" scoped>
.box1 {
  background-color: #ff0000;
}
</style>

<template>
  <div class="w-[70%] mx-auto mt-3 ">
    <div v-for="(value, key) in stockData" :key="key" class="flex items-center ">
        <div class="flex items-center justify-center w-[30%]  text-base bg-[#5B759B1A] min-h-[50px] mx-3 stockborder">{{ translateKey(key) }}</div>
        <div class="flex items-center justify-center w-[60%] text-xs min-h-[50px] stockborder">{{ value }}</div>
    </div>
  </div>
</template>
<script setup>
import axios from 'axios'

const route = useRoute()

const fmp = import.meta.env.VITE_KEY_FMP
const stockFundamentalApi = `https://financialmodelingprep.com/api/v3/profile/${route.params.id}?apikey=${fmp}`

const stockData = ref()

const getData = () => {
  axios.get(stockFundamentalApi).then((res) => {
    console.log(res)
    stockData.value = res.data[0]
    console.log(stockData.value)
  })
}

getData()

const translateKey = (key) => {
  const translations = {
    symbol: '代號',
    price: '價格',
    beta: '貝塔值',
    volAvg: '平均成交量',
    mktCap: '市值',
    lastDiv: '最後的股息',
    range: '範圍',
    changes: '變化',
    companyName: '公司名稱',
    currency: '貨幣',
    cik: 'CIK',
    isin: 'ISIN',
    cusip: 'CUSIP',
    exchange: '交易所',
    exchangeShortName: '交易所簡稱',
    industry: '行業',
    website: '網站',
    description: '描述',
    ceo: '首席執行官',
    sector: '部門',
    country: '國家',
    fullTimeEmployees: '全職員工',
    phone: '電話',
    address: '地址',
    city: '城市',
    state: '州',
    zip: '郵政編碼',
    dcfDiff: 'DCF差異',
    dcf: 'DCF',
    image: '圖像',
    ipoDate: '首次公開募股日期',
    defaultImage: '預設圖像',
    isEtf: '是交易所交易基金',
    isActivelyTrading: '正在積極交易',
    isAdr: '是美國存託憑證',
    isFund: '是基金',
  }

  return translations[key] || key
}
</script>
<style lang="scss" scoped>
    .stockborder {
        border-bottom: 1px solid #BEBEBE;
    }
</style>

<template>
  <nav class="h-[85px] flex items-center justify-between">
    <nuxt-link to="/" class="logo ml-10 text-[28px]">Deeping Stock</nuxt-link>
    <ClientOnly>
      <vue3-simple-typeahead
        ref="inputRef"
        id="typeahead_add"
        placeholder="搜尋股票..."
        class="w-[98%] p-1 bg-white rounded shadow :active:border-white"
        :items="checkData"
        :minInputLength="1"
        v-model="searchStock"
        @onInput="updateCheckData"
        @keydown.native.prevent.enter="goToSearchStockPage"
        @selectItem="selectToSearchStockPage"
      >
        <template #list-item-text="slot">
          <div class="">
            <span
              v-html="slot.boldMatchText(slot.itemProjection(slot.item))"
            ></span>
          </div>
        </template>
      </vue3-simple-typeahead>
    </ClientOnly>
    <div>
      <nuxt-link
        v-for="(link, index) in navLinks"
        :key="index"
        :to="link.to"
        class="nav-a shadow"
        :class="showPageNow(link.page)"
      >
        {{ link.text }}
      </nuxt-link>
    </div>
  </nav>
  <slot name="main" />
</template>
<script setup>
import axios from 'axios'
import { usePathStore } from '../stores/stock.js'
import { storeToRefs } from 'pinia'

// nav目前頁面顏色
const pathStore = usePathStore()
const { path } = storeToRefs(pathStore)
const router = useRouter()

// key
const fmp = import.meta.env.VITE_KEY_FMP

// API
const searchApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/search?query=${searchStock.value}&limit=10&exchange=NASDAQ&apikey=${fmp}`
})

const navLinks = ref([
  { to: '/', text: '首頁', page: 'index' },
  { to: '/stockFilter', text: '股票篩選', page: 'stockFilter' },
  { to: '/hotMap', text: '股票熱區地圖', page: 'hotMap' },
])

const checkData = ref([])
const searchStock = ref('')
const inputRef = ref(null)

onMounted(async () => {
  //取消搜尋框enter預設功能
  await nextTick()
  inputRef.value.selectCurrentSelection = () => {}
})

const selectToSearchStockPage = (item) => {
  searchStock.value = item
  goToSearchStockPage()
}

const updateCheckData = () => {
  axios.get(searchApi.value).then((res) => {
    checkData.value = res.data.map((stock) => stock.symbol)
  })
}

const goToSearchStockPage = () => {
  router.push(`/stocks/${searchStock.value.toUpperCase()}`)
}

const showPageNow = (route) =>
  path.value === route ? 'bg-[#063a34] text-white' : ''
</script>
<style lang="scss" scoped>
nav {
  border-bottom: 1px solid rgb(214, 214, 214);
  box-shadow: 5px 5px 20px 10px rgba(181, 181, 181, 0.25);
}
.logo {
  color: #063a34;
  font-weight: 900;
  text-shadow: 2px 2px 0px #a2c8c4;
}

:deep(.simple-typeahead) {
  width: 30%;
}

:deep(.simple-typeahead-list) {
  background-color: yellow;
  width: 98% !important;
  border: 0.1rem solid black !important;
}

:deep(.simple-typeahead-list-item) {
  background-color: white !important;
}
</style>

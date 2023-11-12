<template>
  <div class="h-[85px] flex items-center justify-between nav">
    <h1 class="ml-10 text-[28px]">Deeping Stock</h1>
    <ClientOnly>
      <vue3-simple-typeahead
        ref="inputRef"
        id="typeahead_add"
        placeholder="搜尋股票..."
        class="w-[98%] p-1 bg-white rounded shadow :active:border-white"
        :items="checkData"
        :minInputLength="1"
        v-model="searchStock"
        @onInput="onInputEventHandler"
        @keydown.native.prevent.enter="searchToStock"
        @selectItem="selectAddtItem"
      >
        <template #list-item-text="slot">
          <div class="">
            <span
              @keydown.native.enter.prevent="dontDOit"
              v-html="slot.boldMatchText(slot.itemProjection(slot.item))"
            ></span>
          </div>
        </template>
      </vue3-simple-typeahead>
    </ClientOnly>
    <div>
      <RouterLink
        to="/"
        class="nav-a shadow focus:bg-[#063a34] focus:text-white"
        >首頁</RouterLink
      >
      <RouterLink
        to="/stockFilter"
        class="nav-a shadow focus:bg-[#063a34] focus:text-white"
        >股票篩選</RouterLink
      >
      <RouterLink
        to="/hotMap"
        class="nav-a shadow focus:bg-[#063a34] focus:text-white"
        >股票熱區地圖</RouterLink
      >
    </div>
  </div>
  <slot name="main" />
</template>
<script setup>

import axios from 'axios'

const router = useRouter()

// key
const fmp = import.meta.env.VITE_KEY_FMP

// API
const searchApi = computed(() => {
  return `https://financialmodelingprep.com/api/v3/search?query=${searchStock.value}&limit=10&exchange=NASDAQ&apikey=${fmp}`
})

// 股票搜尋

const checkData = ref([])
const searchStock = ref('')
const inputRef = ref()

//取消搜尋框enter預設

onMounted(async()=>{
  await nextTick()
  inputRef.value.selectCurrentSelection =()=>{}
})


const selectAddtItem = (item) => {
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


</script>
<style lang="scss" scoped>
.nav {
  // background: linear-gradient(180deg, #80A0C6 0%, #D8E1EC 100%);
  border-bottom: 1px solid rgb(214, 214, 214);
  box-shadow: 5px 5px 20px 10px rgba(181, 181, 181, 0.25);
}
h1 {
  color: #063a34;
  font-weight: 900;
  // text-shadow: 2px 2px 0px #a2c8c4;
  // text-shadow: 1px 1px 0px #063a34;
}
:deep(.simple-typeahead) {
  width: 30%;
}

:deep(.simple-typeahead-list) {
  background-color: yellow;
  width: 98% !important;
  border: 0.1rem solid black !important;
}

// :deep(.simple-typeahead-list-item-text) {
//     color: red;
//     font-size: 30px !important;
// }
:deep(.simple-typeahead-list-item) {
  background-color: white !important;
}
</style>

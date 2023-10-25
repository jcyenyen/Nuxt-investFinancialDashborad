<template>
  <div class="h-[85px] flex items-center justify-between nav">
    <h1 class="ml-10 text-[24px]">Deeping Stock</h1>
    <ClientOnly>
      <vue3-simple-typeahead
        id="typeahead_id"
        placeholder="搜尋股票..."
        class="w-[300px] m-4 p-1 bg-white rounded shadow :active:border-white"
        :items="test"
        :minInputLength="1"
        
        @selectItem="selectItemEventHandler"
        @onInput="onInputEventHandler"
      >
        <template #list-item-text="slot"
          ><span
            class="inline-block w-[300px] bg-white rounded shadow ms-4 mb-1"
            v-html="slot.boldMatchText(slot.itemProjection(slot.item))"
          ></span
        ></template>
      </vue3-simple-typeahead>
    </ClientOnly>
    <div>
      <RouterLink to="/" class="nav-a shadow">首頁</RouterLink>
      <RouterLink to="/stockFilter" class="nav-a shadow">股票篩選</RouterLink>
      <RouterLink to="/hotMap" class="nav-a shadow">股票熱區地圖</RouterLink>
    </div>
  </div>
  <slot name="main" />
</template>
<script setup>
const alpha = import.meta.env.VITE_KEY_ALPHA
const searchApi = `https://financialmodelingprep.com/api/v3/search?query=APple&limit=10&exchange=NASDAQ&apikey=${alpha}`
const test = ref(['1','2','3','11'])

const selectItemEventHandler = (item) => {
  alert(`Selected Item: ${item}`);
}

const onInputEventHandler = (event) => {
  console.log(event.input)
}

const onFocusEventHandler = () => {}

const onBlurEventHandler = () => {}

const itemProjectionFunction = (word) => {
  console.log(word)
  console.log(111)
  return word
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
</style>

<template>
  <NuxtLayout name="header">
    <template #main>
      <h2>股票篩選器</h2>
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


</script>
<style lang="scss" scoped>
.box1 {
  background-color: #ff0000;
}
</style>

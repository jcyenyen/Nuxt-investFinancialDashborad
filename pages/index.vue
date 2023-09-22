<template>
  <!-- <div class="box">
    <button
      class="btn-primary text-[25px]"
      @click="set"
    >
      測試用
    </button>
    
  </div> -->
  <ClientOnly>
    <highcharts v-if="realTimeOffer" class="w-[1000px] mx-auto my-10" :constructor-type="'stockChart'"   :options="chartOptions"  />
  </ClientOnly>
</template>
<script setup>
// ELNQ7UZEGF52W3CZ
// 3ec51f1b30948ec05697da301727451c

const axios = inject('axios')

const data = ref()

const getData = () => {
  axios
    .get('https://financialmodelingprep.com/api/v3/historical-chart/1min/%5EGSPC?apikey=3ec51f1b30948ec05697da301727451c')
    .then((res) => {
      console.log(res)
      data.value=res.data
    })
    .catch((err) => {
      console.log(err)
    })
}
onMounted(()=>{
  getData()
})

const realTimeOffer = computed(()=>{
  return data.value?data.value.reverse().map((v)=>{
    const dateTimeString = v.date; // 日期
    let milliseconds // 換算後的時間
    const dateObject = new Date(dateTimeString);
      milliseconds = dateObject.getTime();
    return [milliseconds,v.open]
  }) : undefined
})

const chartOptions = computed(()=>{return{
        title: {
          text: '歷史股價'
        },
        xAxis: {
            gapGridLineWidth: 0
        },
        // yAxis: {
        //   floor: 4300,
        //   ceiling: 4500
        // },
        // rangeSelector: {
        //     buttons: [{
        //         type: 'hour',
        //         count: 1,
        //         text: '1h'
        //     }, {
        //         type: 'day',
        //         count: 1,
        //         text: '1D'
        //     }, {
        //         type: 'all',
        //         count: 1,
        //         text: 'All'
        //     }],
        //     selected: 1,
        //     inputEnabled: false
        // },

        series: [{
            name: 'test',
            type: 'area',
            data: realTimeOffer.value,
            gapSize: 5,
            tooltip: {
                valueDecimals: 2
            },
            // fillColor: {
            //     linearGradient: {
            //         x1: 0,
            //         y1: 0,
            //         x2: 0,
            //         y2: 1
            //     },
            //     // stops: [
            //     //     [0, Highcharts.getOptions().colors[0]],
            //     //     [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            //     // ]
            // },
            // threshold: null
        }]
      }}) 

</script>
<style>
.box1 {
  background-color: #2d30ce;
}
</style>

<template>
  <div class="row">
    <div class="form-group m-4 w-60">
      <button class="btn btn-primary" @click="points.push(Math.random() * 10)">
        隨機生成
      </button>
    </div>
  </div>
  <highchart
      :options="chartOptions"
      :modules="['exporting']"
      :update="watchers"
      style="width:70%;"
      class="mx-auto"
    />
</template>

<script>
export default {
  data() {
    return {
      caption: '說明',
      title: '標題',
      subtitle: '小標',
      points: [21, 15, 20, 15, 18, 7, 14, 13],
      seriesColor: '#ce2d2d',
      animationDuration: 1000,
      chartType: '',
      colorInputIsSupported: null,
      chartTypes: [],
      durations: [0, 500, 1000, 2000],
      seriesName: '一週吃幾餐',
      yAxis: '餐數',
      watchers: ['options.title', 'options.series'],
      colors: [
        'Red',
        'Green',
        'Blue',
        'Pink',
        'Orange',
        'Brown',
        'Black',
        'Purple',
      ],
      lastPointClicked: {
        timestamp: '',
        x: '',
        y: '',
      },
      // 背景色
      sexy: false,
    }
  },
  computed: {
    /** @returns {import('@/lib/types').ChartOptions} */
    chartOptions() {
      const ctx = this
      return {
        accessibility: { enabled: false },
        caption: {
          text: this.caption,
          style: {
            // @ts-ignore
            color: this.sexy ? this.invertedColor(0) : '#black',
          },
        },
        chart: {
          backgroundColor: this.sexy
            ? {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, this.seriesColor],
                  [0.5, '#2d30ce'],
                  [1, this.seriesColor],
                ],
              }
            : '#ffffff',
          className: 'my-chart',
          type: this.chartType.toLowerCase(),
        },
        plotOptions: {
          series: {
            cursor: 'pointer',
            point: {
              events: {
                click() {
                  ctx.$emit('pointClicked', this)
                },
              },
            },
          },
        },
        yAxis: [
          {
            title: {
              text: this.yAxis,
              style: {
                color: '#000000',
              },
            },
          },
        ],
        title: {
          style: {
            // @ts-ignore
            color: this.sexy ? this.invertedColor(0) : '#black',
          },
          text:
            `${this.title} ` +
            (this.lastPointClicked.timestamp !== ''
              ? `(Point clicked: ${this.lastPointClicked.timestamp})`
              : ''),
        },
        subtitle: {
          style: {
            // @ts-ignore
            color: this.sexy ? this.invertedColor(0) : '#black',
          },
          text: `${this.subtitle}`,
        },
        legend: {
          itemStyle: {
            // @ts-ignore
            color: this.sexy ? this.invertedColor(0) : '#red',
          },
        },
        series: [
          {
            type: 'line',
            name: this.seriesName,
            data: Array.from(this.points),
            color: this.seriesColor,
          },
        ],
      }
    },
  },
}
</script>

<style scoped></style>

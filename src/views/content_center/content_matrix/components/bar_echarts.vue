<template>
  <div class="chart_box">
    <div ref="barEcharts" class="have_echart" style="width: 100%; height: 300px"></div>
    <div class="no_echart" v-if="props.data.length == 0 && !loading">
      <img src="@/assets/images/content_center/no_echart.png" alt="" />
      暂无数据
    </div>
  </div>
</template>
<script setup>
import { nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { wanSliceFormat } from '@/utils/tools.js'
import {
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features'
// 注意，新的接口中默认不再包含 Canvas 渲染器，需要显示引入，如果需要使用 SVG 渲染模式则使用 SVGRenderer
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([
  LegendComponent,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

const props = defineProps({
  id: { type: String, default: '' }, // 图表的ID
  color: { type: String, default: '' }, // 图表所需的色值
  areaColor: {
    type: Array,
    default() {
      return ['#6A8EFF', '#84B1FF']
    }
  }, // 图表所需的色值
  barBorderRadius: {
    type: Array,
    default() {
      return [5, 5, 0, 0]
    }
  },
  name: { type: String, default: '' }, // 图表对应的名称
  data: {
    type: Array,
    default() {
      return []
    }
  }, // 图表的数据
  gridInfo: {
    type: Object,
    default() {
      return {
        top: 30,
        bottom: 30,
        left: 28,
        right: 28
      }
    }
  }
})
// const loading = ref(false)
const barEcharts = ref(null)
//
function getBarChart() {
  // 初始化
  const barChart = echarts.init(barEcharts.value)
  // loading.value = false
  if (props.data.length === 0) return
  // loading.value = true
  const yData = []
  const xData = []
  props.data.forEach(x => {
    yData.push(x.yData)
    xData.push(x.xData)
  })
  const options = {
    color: props.color,
    grid: props.gridInfo,

    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(81,81,81,0.8)',
      padding: [5, 10],
      formatter: e => {
        let str = `<div style="color:#fff">${e[0].name}</div>`
        e.forEach(x => {
          str += `<div style="font-size:14px;color:#fff""><div style="display: inline-block;margin-right: 6px;background:
            ${props.color ? props.color : props.areaColor[0]}
            ;width:8px;height:8px;border-radius: 50%;" ></div>
          ${x.seriesName}
             ：${x.value.toLocaleString('en-US')}
            </div>`
        })
        return str
      }
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        axisLabel: {
          onZero: false,
          interval: 5,
          showMaxLabel: true,
          fontSize: 12,
          margin: 12,
          textStyle: {
            color: 'rgba(0,0,0,0.65)'
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e9e9e9',
            width: 2
          }
        },
        data: xData
      }
    ],
    yAxis: [
      {
        splitLine: {
          lineStyle: {
            type: 'dashed',
            width: 1
          }
        },
        axisTick: {
          show: false // 坐标轴刻度
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e9e9e9' // 轴线颜色
          }
        },
        axisLabel: {
          fontSize: 12,
          margin: 10,
          textStyle: {
            color: 'rgba(0,0,0,0.65)'
          },
          formatter: e => {
            return wanSliceFormat(e)
          }
        },
        nameTextStyle: {
          color: 'rgba(0,0,0,0.65)',
          fontSize: 14,
          padding: 8
        },
        type: 'value'
      }
    ],
    series: [
      {
        symbol: 'circle',
        symbolSize: 3, // 拐点的大小
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2
        },
        itemStyle: {
          // emphasis: {},
          normal: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: props.areaColor[0] // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: props.areaColor[1] // 100% 处的颜色
                }
              ],
              global: false // 缺省为 false
            },
            barBorderRadius: props.barBorderRadius
          }
        },

        name: props.name,
        type: 'bar',
        barWidth: 10, // 柱图宽度
        data: yData
      }
    ]
  }
  barChart.setOption(options)
}

nextTick(() => {
  getBarChart()
})
//
function onResize() {
  const barChart = echarts.init(barEcharts.value)
  // 自适应大小, 不用的话不会自适应大小。
  barChart.resize()
}
onMounted(() => {
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
watch(
  () => props.data,
  newValue => {
    console.log('bar-watch')
    getBarChart()
  },
  { deep: true }
)
</script>
<style lang="scss" scoped>
.lineChart {
  width: 100%;
  height: 100%;
}
.chart_box {
  width: 100%;
  height: 100%;
  position: relative;
  .have_echart,
  .no_echart {
    width: 100%;
    height: 100%;
    background: #ffffff;
  }
  .have_echart {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .no_echart {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    img {
      width: 200px;
      height: 200px;
      display: flex;
    }
  }
}
</style>

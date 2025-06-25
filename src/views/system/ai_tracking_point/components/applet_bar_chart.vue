<template>
  <div class="applet_bar_chart">
    <div class="top-title">小程序使用人次时间分布图</div>
    <div ref="chartRef" class="chart-container" id="bar-chart"></div>
    <el-empty class="position-empty" v-if="list.length === 0" description="暂无数据">
      <template #image>
        <img src="@/assets/images/content_center/no_echart.png" alt="" />
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { isEmpty, wanSliceFormat } from '@/utils/tools.js'

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
})
echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  LegendComponent
])

let myChart = null
const chartRef = ref(null)
let xData = []
let yData = []
const setChart = chartList => {
  if (isEmpty(chartList)) {
    chartList = props.list
  }
  if (!chartRef.value || isEmpty(chartList)) return
  myChart = echarts.init(chartRef.value)
  xData = []
  yData = []
  chartList.forEach(item => {
    xData.push(item.xData)
    yData.push(item.yData)
  })
  const options = {
    color: ['#5C78FF'],
    legend: {
      itemHeight: 12,
      itemWidth: 18,
      bottom: '0',
      left: 'center',
      itemStyle: {},
      itemGap: 20
    },
    grid: {
      top: 24,
      left: 0,
      bottom: 40,
      right: 24,
      containLabel: true
    },
    xAxis: {
      data: xData,
      axisLabel: {
        // interval: xData.length > 7 ? parseInt(xData.length / 7) : 0,
        showMaxLabel: true,
        fontSize: 12,
        margin: 20,
        lineHeight: 16
        // formatter: e => dayjs(e.replace(/'-'/g, '/')).format('M.D')
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#e9e9e9' // 轴线颜色
        }
      },
      name: '',
      axisLabel: {
        fontSize: 12,
        margin: 20,
        color: 'rgba(0,0,0,0.65)',
        formatter: e => {
          return wanSliceFormat(e || 0)
        }
      },
      axisTick: {
        show: false // 坐标轴刻度
      },
      boundaryGap: [0, '1%'],
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    splitLine: {
      // 网格线
      lineStyle: {
        type: 'dashed' // 设置网格线类型 dotted：虚线   solid:实线
      },
      show: false // 隐藏或显示
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      backgroundColor: 'rgba(81, 81, 81, 0.8)',
      borderColor: 'rgba(109, 109, 110, 1)',
      padding: [5, 10],
      color: '#ffffff',
      formatter: e => {
        let str = ''
        if (e.length > 0) {
          str = `<div style="color:#fff">${e[0].name}</div>`
          e.forEach(item => {
            str += `<div style="font-size:14px;color:#fff">
                    <div style="display: inline-block;margin-right: 6px;background:${
                      item.color
                    };width:8px;height:8px;border-radius: 50%;" ></div>
                    ${item.seriesName}：${wanSliceFormat(item.data || 0)}
                  </div>`
          })
        }
        return str
      }
    },
    series: {
      data: yData,
      name: '人次',
      type: 'bar',
      stack: 'x',
      barMaxWidth: 28, // 柱状宽度
      itemStyle: {
        borderRadius: [5, 5, 0, 0] // 这里设置圆角的大小
      }
    }
  }
  myChart.setOption(options)
}
const echartsResize = () => {
  myChart.resize()
}
onMounted(() => {
  window.addEventListener('resize', echartsResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', echartsResize)
})

defineExpose({
  setChart
})
</script>

<style lang="scss" scoped>
.applet_bar_chart {
  padding: 22px 20px;
  width: 100%;
  height: 384px;
  background: #ffffff;
  position: relative;

  .echarts-tooltip-dark {
    background-color: #000000;
    color: #ffffff;
  }

  .top-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #303133;
  }

  .chart-container {
    width: 100%;
    height: 293px;
  }

  .no_echart {
    width: 100%;
    height: 100%;
  }

  .position-empty {
    position: absolute;
    top: 30px;
    width: 100%;
    height: 293px;
  }
}
</style>

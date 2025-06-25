<template>
  <div class="pie-chart">
    <div class="subtitle" v-if="subtitle">{{ subtitle }}</div>
    <div ref="chartRef" class="chart-container" v-show="data.length > 0"></div>
    <el-empty v-if="data.length === 0" description="暂无数据" style="margin-top: 100px">
      <template #image>
        <img src="@/assets/images/content_center/no_echart.png" alt="" />
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
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
import { isEmpty, secondToDate } from '@/utils/tools'

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  LegendComponent
])
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  subtitle: String
})

const colorList = [
  '#5C78FF',
  '#FFB822',
  '#FD387A',
  '#36C723',
  '#933BD8',
  '#1EDDE5',
  '#FF7F41',
  '#F42727',
  '#933BD8',
  '#1EDDE5'
]
let myChart = null
const chartRef = ref(null)
let chartList = []
const setChart = params => {
  if (!chartRef.value) return
  chartList = isEmpty(params) ? props.data : params
  if (!chartRef.value || isEmpty(chartList)) return
  myChart = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function (e) {
        console.log(e)
        const str = `<div style="font-size:14px"><div style="display: inline-block;margin-right: 6px;background:
						${e.color}
						;width:8px;height:8px;border-radius: 50%;" ></div>
					${e.name} 
						 ：${secondToDate(e.value, 'm', false)}（${e.percent}%）

						</div>`
        return str
      }
    },
    legend: {
      icon: 'circle',
      itemHeight: 10,
      itemWidth: 10,
      bottom: '0',
      left: 'center',
      itemStyle: {},
      itemGap: 20,
      textStyle: {
        color: '#606266',
        fontsize: 14
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '55%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          color: '#606266',
          position: 'outside',
          formatter: function (item) {
            const data = item.data
            return `PV：${data.pv} UV：${data.uv}\n\n使用时间：${secondToDate(
              data.value,
              'm',
              false
            )}`
          }
        },
        labelLine: {
          show: true
        },
        itemStyle: {
          color: function (params) {
            return colorList[params.dataIndex]
          }
        },
        data: chartList
      }
    ]
  }
  myChart.setOption(option)
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
.pie-chart {
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
  height: 530px;
  overflow: hidden;
  position: relative;

  .subtitle {
    position: absolute;
    top: 56px;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
    text-align: left;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 25px;
  }

  .no_echart {
    width: 100%;
    height: 100%;
  }

  .chart-container {
    width: 100%;
    height: 92%;
  }
}
</style>

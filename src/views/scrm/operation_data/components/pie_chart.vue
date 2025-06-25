<template>
  <div class="pie-chart">
    <div class="title">{{ title }}</div>
    <div class="chart-container" :id="id" v-show="data.length > 0"></div>
    <el-empty v-if="data.length === 0" description="暂无数据">
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
import { isEmpty } from '@/utils/tools.js'

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
  id: {
    type: String,
    default: 'pieChart'
  },
  title: {
    type: String,
    default: '饼图'
  },
  data: {
    type: Array,
    default: () => []
  }
})
const { id, title, data } = toRefs(props)

const colorList = ['#5C78FF', '#FFB822', '#FD387A', '#36C723', '#933BD8']
const option = {
  tooltip: {
    trigger: 'item'
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
      // center:['0%','0%'],
      // left: 'center',
      // top: 'middle',
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%' // {b}指name {c}指value {d}百分比
      },
      labelLine: {
        show: true
      },
      itemStyle: {
        color: function (params) {
          return colorList[params.dataIndex]
        }
      },
      data: data.value
    }
  ]
}
let myChart = null
const setEcharts = () => {
  const element = document.getElementById(id.value)
  if (isEmpty(element)) return
  myChart = echarts.init(element)
  myChart.setOption(option)
}
onMounted(() => {
  setEcharts()
})
watch(
  () => data.value,
  value => {
    if (value.length > 0) {
      myChart.setOption(option)
    }
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.pie-chart {
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
  height: 530px;
  overflow: hidden;

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

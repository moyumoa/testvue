<template>
  <div class="chart_box">
    <div ref="pieEcharts" class="have_echart" style="width: 100%; height: 300px"></div>
    <div class="no_echart" v-if="props.data.length == 0 && !loading">
      <img src="@/assets/images/content_center/no_echart.png" alt="" />
      暂无数据
    </div>
  </div>
</template>
<script setup>
import { nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart, LineChart } from 'echarts/charts'
// import { secondToDate } from '@/utils/tools.js'
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
  PieChart,
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
  id: { type: String, default: '' },
  chartTitle: { type: String, default: '' }, // 图表的标题
  showLegend: {
    type: Boolean,
    default: false
  }, // 是否显示图例
  colorList: {
    type: Array,
    default() {
      return ['#769FFF', '#FF867F', '#FFAC6D', '#FFE869', '#8AE87E', '#9786DF', '#EE9DEF']
    }
  },
  data: {
    type: Array,
    default() {
      return []
    }
  },
  xName: {
    type: String,
    default: 'name'
  },
  pieUnit: {
    type: String,
    default: ''
  }
})
// const loading = ref(false)
const pieEcharts = ref(null)
//
function getPieChart() {
  // 初始化
  const pieChart = echarts.init(pieEcharts.value)
  // loading.value = false
  if (props.data.length === 0) return
  // loading.value = true
  const seriesData = []
  props.data.forEach((item, index) => {
    seriesData.push({
      value: item.yData,
      name: item.xData,
      label: {
        formatter: `{title|{b}}`,
        rich: {
          title: {
            color: props.colorList[index],
            fontSize: 14,
            fontWeight: 'bold',
            height: 36,
            lineHeight: 18,
            align: 'center'
          }
        }
      },
      itemStyle: {
        normal: {
          color: props.colorList[index]
        }
      }
    })
  })
  const options = {
    tooltip: {
      trigger: 'item',
      formatter: e => {
        const str = `<div style="font-size:14px"><div style="display: inline-block;margin-right: 6px;background:
						${e.color}
						;width:8px;height:8px;border-radius: 50%;" ></div>
					${e.name} 
						 ：${e.value}${props.pieUnit}
						</div>`
        return str
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 20,
      left: 'center',
      icon: 'circle',
      itemGap: 28,
      itemWidth: 18, // 设置图例宽度
      itemHeight: 8, // 设置图例高度
      textStyle: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.65)'
      },
      show: props.showLegend
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: ['40%', '60%'],

        label: {
          position: 'outer',
          alignTo: 'labelLine',
          padding: 0,
          bleedMargin: 0
        },
        minAngle: 30,
        // minShowLabelAngle:30,
        avoidLabelOverlap: true, // 对，就是这里avoidLabelOverlap
        data: seriesData,
        itemStyle: {
          borderRadius: 0,
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  pieChart.setOption(options)
}
nextTick(() => {
  getPieChart()
})
//
function onResize() {
  const pieChart = echarts.init(pieEcharts.value)
  // 自适应大小, 不用的话不会自适应大小。
  pieChart.resize()
}
onMounted(() => {
  window.addEventListener('resize', onResize)
})
watch(
  () => props.data,
  newValue => {
    console.log('pie-watch')
    getPieChart()
  },
  { deep: true }
)
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>
<style lang="scss" scoped>
.chart_box {
  width: 100%;
  height: 100%;
  position: relative;
  .have_echart,
  .no_echart {
    width: 100%;
    height: 100%;
  }
  .have_echart {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .no_echart {
    background: #ffffff;
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
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

<template>
  <div class="customer-line-chart">
    <div class="top-title">数据趋势</div>
    <div class="chart-container" id="line-chart" v-if="!showEmpty"></div>
    <el-empty v-if="chartList.length === 0" description="暂无数据">
      <template #image>
        <img src="@/assets/images/content_center/no_echart.png" alt="" />
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
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
import { wanSliceFormat } from '@/utils/tools.js'
import { getLineChartData } from '@/api/scrm/operation.js'

const props = defineProps({
  params: {
    type: Object,
    default: () => {
      return {
        deptIds: '',
        endTime: '',
        startTime: ''
      }
    }
  }
})
const { params } = toRefs(props)
echarts.use([
  LineChart,
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
const loading = ref(true)
const showEmpty = ref(false)
const chartLoading = () => {
  loading.value = true
  myChart.showLoading({
    text: '',
    color: '#364fcd',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    zlevel: 0,
    fontSize: 20,
    showSpinner: true,
    spinnerRadius: 16,
    lineWidth: 2
  })
}
const chartList = ref([])
let xData = []
let videoClientData = [] // 视频潜客
let imClientData = [] // 私信潜客
let liveRoomClientData = [] // 直播潜客

const setChart = () => {
  xData = []
  videoClientData = [] // 视频潜客
  imClientData = [] // 私信潜客
  liveRoomClientData = [] // 直播潜客
  // console.log(xData,clueData,clientIntentProbabilityData,clientUcntData)
  chartList.value.forEach(item => {
    xData.push(item.dateTime.slice(-5))
    videoClientData.push(item.videoClientCount)
    imClientData.push(item.imClientCount)
    liveRoomClientData.push(item.liveRoomClientCount)
  })
  myChart.setOption({
    legend: {
      icon: 'circle',
      // height:'100px',
      itemHeight: 10,
      itemWidth: 10,
      bottom: '0',
      left: 'center',
      itemStyle: {},
      itemGap: 20,
      selected: {
        // 新增留资客户: false,
        新增客户: false
      }
    },
    grid: {
      top: 24,
      left: 0,
      bottom: 40,
      right: 24,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false, // 坐标轴两边留白策略
      axisLabel: {
        interval: xData.length > 7 ? parseInt(xData.length / 7) : 0,
        showMaxLabel: true,
        fontSize: 12,
        margin: 20,
        lineHeight: 16,
        color: 'rgba(0,0,0,0.65)',
        formatter: e => {
          if (e.indexOf(' ') > -1) {
            const eLen = e.split(' ')
            const str = `${eLen[0]}\n${eLen[1]}`
            return str
          } else {
            return e
          }
        }
      },
      axisLine: {
        lineStyle: {
          color: '#e9e9e9',
          width: 2
        }
      },
      splitLine: {
        // 网格线
        lineStyle: {
          type: 'dashed' // 设置网格线类型 dotted：虚线   solid:实线
        },

        show: false // 隐藏或显示
      },
      data: xData
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
    tooltip: {
      trigger: 'axis',
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
    series: [
      {
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#ffb822' // 0% 处的颜色
              },
              {
                offset: 1,
                color: 'rgba(255, 255, 255, 0)' // 100% 处的颜色
              }
            ],
            global: false // 缺省为 false
          }
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6, // 拐点的大小
        showSymbol: !(xData.length > 1),
        lineStyle: {
          color: '#ffb822',
          width: 2
        },
        itemStyle: {
          color: '#ffb822',
          borderColor: '#fff',
          borderWidth: 1,
          borderType: 'solid'
        }, // 拐点的样式
        name: '视频潜客数',
        type: 'line',
        data: videoClientData
      },
      {
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#FD387A' // 0% 处的颜色
              },
              {
                offset: 1,
                color: 'rgba(255, 255, 255, 0)' // 100% 处的颜色
              }
            ],
            global: false // 缺省为 false
          }
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6, // 拐点的大小
        showSymbol: !(xData.length > 1),
        lineStyle: {
          color: '#FD387A',
          width: 2
        },
        itemStyle: {
          color: '#FD387A',
          borderColor: '#fff',
          borderWidth: 1,
          borderType: 'solid'
        }, // 拐点的样式
        name: '私信潜客数',
        type: 'line',
        data: imClientData
      },
      {
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#5C78FF' // 0% 处的颜色
              },
              {
                offset: 1,
                color: 'rgba(255, 255, 255, 0)' // 100% 处的颜色
              }
            ],
            global: false // 缺省为 false
          }
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6, // 拐点的大小
        showSymbol: !(xData.length > 1),
        lineStyle: {
          color: '#5C78FF',
          width: 2
        },
        itemStyle: {
          color: '#5C78FF',
          borderColor: '#fff',
          borderWidth: 1,
          borderType: 'solid'
        }, // 拐点的样式
        name: '直播潜客数',
        type: 'line',
        data: liveRoomClientData
      }
    ]
  })
}
// const loading = ref(true)
const getList = () => {
  chartLoading()
  getLineChartData(params.value).then(res => {
    if (res.code === 0) {
      chartList.value = res.data.datas || []
      showEmpty.value = chartList.value.length <= 0
      setChart()
      myChart.hideLoading()
    }
  })
}
onMounted(() => {
  myChart = echarts.init(document.getElementById('line-chart'))
  getList()
})

watch(
  () => params.value,
  value => {
    getList()
  }
)
</script>

<style lang="scss" scoped>
.customer-line-chart {
  padding: 22px 20px;
  width: 100%;
  height: 384px;
  background: #ffffff;

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
    height: 93%;
    //height: 500px;
  }

  .no_echart {
    width: 100%;
    height: 100%;
  }
}
</style>

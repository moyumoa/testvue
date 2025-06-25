<template>
  <div class="trend_chart g_bg" v-loading="loading">
    <div class="trend_chart_title">
      数据总览
      <div class="data-range-group">
        <div
          class="data-range-btn"
          :class="{ active: item.key === timeType }"
          v-for="item in dateList"
          :key="item.key"
          @click="chooseTime(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <div class="bar_chart" id="trend_barChart" ref="barChartRef"></div>
    <div class="line_chart" id="trend_lineChart" ref="lineChartRef"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
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

import dayjs from 'dayjs'
import { wanSliceFormat, isNotEmpty } from '@/utils/tools.js'
import {
  accountViewTrends,
  principalViewTrends,
  userViewTrends
} from '@/api/content_center/business_overview.js'

echarts.use([
  BarChart,
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
// console.log = ()=>{}

const props = defineProps({
  // 设置信息
  settings: {
    type: Object,
    default: () => {
      return {
        entityList: [],
        ratioList: [],
        isGroup: false
      }
    }
  },
  // 组织架构的参数
  groupId: String,
  tab: String
})
watch(
  () => props.groupId,
  () => {
    getList()
  }
)
const { settings } = toRefs(props)
const paramsPlatform = ref(0)
const dateList = ref([
  {
    key: 'week',
    label: '近7日' // 昨天
  },
  {
    key: 'month',
    label: '本月'
  },
  {
    key: 'year',
    label: '今年'
  }
])
const timeType = ref('week')
const startTime = ref(null)
const endTime = ref(null)
const chooseTime = item => {
  timeType.value = item.key
  if (item.key === 'week') {
    startTime.value = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
    endTime.value = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  } else if (item.key === 'month') {
    startTime.value = dayjs().startOf('month').format('YYYY-MM-DD')
    endTime.value = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  } else if (item.key === 'year') {
    startTime.value = dayjs().startOf('year').format('YYYY-MM-DD')
    endTime.value = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  }
  // 更新一下数据
  getList()
}

//
const otherParams = ref()
const resultList = ref([])
const loading = ref(false)
// 获取两个图表的值
const getList = async () => {
  loading.value = true
  await new Promise(resolve => {
    setTimeout(() => {
      resolve('success')
    }, 100)
  })
  let promiseRequest = null
  if (props.tab === 'account') {
    // 账号视角
    promiseRequest = accountViewTrends
  } else if (props.tab === 'member') {
    // 成员视角
    promiseRequest = userViewTrends
  } else {
    promiseRequest = principalViewTrends
  }
  let params = {
    groupIds: props.groupId ? [props.groupId] : [],
    endTime: endTime.value,
    startTime: startTime.value,
    principalType: ['account', 'member'].includes(props.tab) ? undefined : props.tab,
    platform: paramsPlatform.value
  }
  const businessTab = [2, 3, 4]
  if (businessTab.includes(Number(props.tab))) {
    params.groupModel = props?.settings?.isGroup ? 1 : 0
  }
  if (isNotEmpty(otherParams.value)) {
    params = { ...params, ...otherParams.value }
  }
  promiseRequest(params).then(res => {
    if (res.code === 0) {
      loading.value = false
      resultList.value = res.data || []
      setBarEcharts()
      setLineEcharts()
    }
  })
}

// 堆叠柱状图 与折线图
let barChart = null
let lineChart = null
// 设置 堆叠柱状图
const setBarEcharts = () => {
  const colorList = ['#5747CF', '#4E67E5', '#40B5F5', '#1AC9C7', '#6CE7A7']
  // 配置列表里面有的值
  let entityList = settings.value.entityList || []
  entityList = [...entityList]
  const barList =
    timeType.value === 'year' ? resultList.value.filter(item => item.isMonday) : resultList.value
  const sourceData = { xData: [] }
  sourceData.xData = barList.map(i => i.date)
  entityList.forEach(item => {
    sourceData[item.key] = barList.map(i => i[item.key])
  })
  // console.log('bar', sourceData)
  // 这里的顺序需要反 因为柱状图的顺序 与 矩阵经营漏斗图的顺序是相反的

  const series = entityList.reverse().map((item, index) => {
    // 只让最后一个有圆角
    const borderRadius = index >= entityList.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
    return {
      data: sourceData[item.key],
      name: item.label,
      type: 'bar',
      stack: 'x',
      barMaxWidth: 28, // 柱状宽度
      itemStyle: {
        // 柱状颜色和圆角
        borderRadius // （顺时针左上，右上，右下，左下）
      }
    }
  })
  // console.log('option', series)

  const option = {
    color: colorList.slice(-entityList.length),
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
      data: sourceData.xData,
      axisLabel: {
        interval: sourceData.xData.length > 7 ? parseInt(sourceData.xData.length / 7) : 0,
        showMaxLabel: true,
        fontSize: 12,
        margin: 20,
        lineHeight: 16,
        formatter: e => dayjs(e.replace(/'-'/g, '/')).format('M.D')
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
    series: series
  }
  // 堆叠柱状图
  barChart && barChart.setOption(option)
}
// 设置折线图
const setLineEcharts = () => {
  // 折线图最多四个颜色
  const colorList = ['#516DF1', '#FFB822', '#FD387A', '#36C723']
  const ratioList = settings.value.ratioList || []
  // 如果显示全年的 就只展示 每周 周一的数据
  // const lineList =
  //   timeType.value === 'year' ? resultList.value.filter(item => item.isMonday) : resultList.value
  // if (timeType.value === 'year') {
  //   resultList.value = list.filter(item => item.isMonday)
  // }
  // 放在echarts 的数据 处理成多个数组
  const sourceData = { xData: [] }
  // 处理接口返回的数据 resultList
  sourceData.xData = resultList.value.map(i => i.date)
  ratioList.forEach(item => {
    // console.log(item,item.key)
    sourceData[item.key] = resultList.value.map(i => i[item.key])
  })
  // console.log('处理后的值ratioList',ratioList)
  // console.log('处理后的值resultList',resultList.value)
  // console.log('处理后的值', sourceData)

  // 设置 echarts options 的 series 账号视角会有 3条折线 其余的是4条折线
  const series = ratioList.map((item, index) => {
    return {
      smooth: true,
      symbol: 'circle',
      symbolSize: 6, // 拐点的大小
      showSymbol: !(sourceData.xData.length > 1),
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
              color: colorList[index] // 0% 处的颜色
            },
            {
              offset: 1,
              color: 'rgba(255, 255, 255, 0)' // 100% 处的颜色
            }
          ],
          global: false // 缺省为 false
        }
      },
      lineStyle: {
        color: colorList[index],
        width: 2
      },
      itemStyle: {
        color: colorList[index],
        borderColor: '#fff',
        borderWidth: 1,
        borderType: 'solid'
      }, // 拐点的样式
      name: item.label,
      type: 'line',
      data: sourceData[item.key]
    }
  })
  const lineChartOption = {
    legend: {
      icon: 'circle',
      itemHeight: 10,
      itemWidth: 10,
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
      type: 'category',
      boundaryGap: false, // 坐标轴两边留白策略
      axisLabel: {
        interval: sourceData.xData.length > 7 ? parseInt(sourceData.xData.length / 7) : 0,
        showMaxLabel: true,
        fontSize: 12,
        margin: 20,
        lineHeight: 16,
        color: 'rgba(0,0,0,0.65)',
        formatter: e => dayjs(e.replace(/'-'/g, '/')).format('M.D')
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
      data: sourceData.xData
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
          return e + '%'
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
                    ${item.seriesName}：${item.data + '%'}
                  </div>`
          })
        }
        return str
      }
    },
    series
  }
  lineChart && lineChart.setOption(lineChartOption)
}
const barChartRef = ref(null)
const lineChartRef = ref(null)
//  初始化
const init = () => {
  // console.warn(barChartRef.value,lineChartRef.value)
  barChart = echarts.init(barChartRef.value)
  lineChart = echarts.init(lineChartRef.value)
  // 默认选中七天
  chooseTime({ key: 'week' })
}
// 重绘echarts
const resizeEcharts = () => {
  lineChart.resize()
  barChart.resize()
}

onMounted(() => {
  init()
  // getList()
  // 窗口重新绘制
  window.addEventListener('resize', resizeEcharts)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeEcharts)
  barChart = null
  lineChart = null
})

function platformChange(platform) {
  paramsPlatform.value = platform
  getList()
}
function paramChange(param) {
  otherParams.value = isNotEmpty(param) ? param : null
  getList()
}
defineExpose({ platformChange, paramChange })
</script>

<style lang="scss" scoped>
.trend_chart {
  .trend_chart_title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    //width: 72px;
    //height: 26px;
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 26px;
  }

  .data-range-group {
    .data-range-btn {
      position: relative;
      cursor: pointer;
      display: inline-block;
      width: 66px;
      height: 32px;
      color: #595959;
      font-size: 14px;
      font-weight: 400;
      font-family: PingFangSC-Regular, PingFang SC;
      text-align: center;
      line-height: 32px;
      border: 1px solid #d9d9d9;
    }

    .active {
      color: $theme_color;
      z-index: 10;
      background: rgba(54, 79, 205, 0.1);
      border: 1px solid #364fcd;
    }

    :not(:last-child) {
      margin-right: -1px;
    }

    :first-child {
      border-radius: 4px 0 0 4px;
    }

    :last-child {
      border-radius: 0 4px 4px 0;
    }
  }

  .bar_chart {
    width: 100%;
    height: 349px;
  }

  .line_chart {
    width: 100%;
    height: 349px;
  }
}
</style>

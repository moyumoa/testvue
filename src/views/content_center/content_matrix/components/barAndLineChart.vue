<template>
  <div class="barAndLineChart">
    <div ref="indexChart" class="echart_box"></div>
    <div class="no_echart" v-show="props.data.length == 0">
      <img
        src="@/assets/images/content_center/no_echart.png"
        alt=""
        style="width: 200px; height: 200px"
      />
      <div style="text-align: center">暂无数据</div>
    </div>
  </div>
</template>
<script setup>
import { nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import { dateFormat } from '@/utils/tools.js'
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
/**
 * twoYLineChart 折线图【两个Y轴】
 * @description 设置折线图【两个Y轴】（目前只用于内容中台）
 * @property {String} id  图表的ID
 * @property {String} chartTitle  图表的标题
 * @property {Boolean} showTitle  是否显示图表标题
 * @property {Array} colorList  图表所需的色值
 * @property {Array} typeList  图表y轴对应的名称
 * @property {Array} data  图表的数据 
 * @event {Function} chartLoading 图表加载的动画
 * @event {Function} setChart 设置图表，将数据填入进去
 * 示例：
 *    <twoYLineChart	ref="twoYLineChart"	:typeList="['星麦指数']"	:data="data"	id="echartLine"	chartTitle="星麦指数趋势图"	color="#FF9E46"	:areaColor="['rgba(255, 158, 70, 0.5)', 'rgba(255, 255, 255, 0)']"/>
      // 开始接口请求，需要显示加载动画
      this.$refs.twoYLineChart.chartLoading();
      // 请求接口，设置数据
      this.data=[]
 */
nextTick(() => {
  getBarChart()
})
const props = defineProps({
  colorList: {
    type: Array,
    default() {
      return ['#889CFF', '#FFB471', '#82D69B', '#BF98FC']
    }
  }, // 图表所需的色值
  typeList: {
    type: Array,
    default() {
      return ['播放数', '点赞数', '评论数', '分享数']
    }
  }, // 图表y轴对应的名称
  data: {
    type: Array,
    default() {
      return [20, 30]
    }
  }, // 图表的数据
  xDataName: {
    type: String,
    default: 'name'
  }, // x轴取的字段名
  yData1Name: {
    type: String,
    default: 'playCount'
  }, // y轴第一个取的字段名
  yData2Name: {
    type: String,
    default: 'diggCount'
  }, // y轴第二个取的字段名
  yData3Name: {
    type: String,
    default: 'commentCount'
  }, // y轴第三个取的字段名
  yData4Name: {
    type: String,
    default: 'shareCount'
  } // y轴第四个取的字段名
})
// const loading = ref(false)
// 最大
const getNumMax = e => {
  const x = parseInt(e) + ''
  const firstNum = x.substring(0, 1)
  const xLen = x.length
  let forNum = parseInt(firstNum) + 1
  for (let i = 1; i < xLen; i++) {
    forNum += '0'
  }
  return parseInt(forNum)
}
// 最小
const million = value => {
  // 过万处理
  let num
  if (value > 9999) {
    // 大于9999显示x.xx万

    num = (Math.floor(value / 100) / 100).toLocaleString('en-US') + 'w'
  } else if (value <= 9999 && value > -9999) {
    num = value.toLocaleString('en-US')
  } else if (value < -9999) {
    // 小于-9999显示-x.xx万
    num = -(Math.floor(Math.abs(value) / 1000) / 10) + 'w'
  }
  return num
}
//
const indexChart = ref(null)
function getBarChart() {
  // 初始化
  const barChart = echarts.init(indexChart.value)
  // barChartOptions 配置项，推荐放在外部引入。
  if (props.data.length === 0) return
  const data1 = []
  const data2 = []
  const data3 = []
  const data4 = []
  const xData = []
  props.data.forEach(x => {
    data1.push(x[props.yData1Name])
    data2.push(x[props.yData2Name])
    data3.push(x[props.yData3Name])
    data4.push(x[props.yData4Name])
    xData.push(x[props.xDataName])
  })

  // let yAxis = [],
  // 	series = [];
  const maxNum1 = getNumMax(Math.ceil(Math.max.apply(null, data1) / 5) * 5)
  const maxNum2 = getNumMax(
    Math.ceil(Math.max.apply(null, [].concat(...data2, data3, data4)) / 5) * 5
  )
  // option
  const options = {
    color: props.colorList,
    grid: {
      top: 48,
      bottom: 50,
      left: 77,
      right: 77
    },

    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(81,81,81,0.8)',
      padding: [5, 10],
      formatter: e => {
        const name = e[0].name.trim()
          ? dateFormat(new Date(e[0].name), 'YYYY-MM-DD hh:mm:ss')
          : '--'
        console.log('name', name, e[0].name, e[0])
        let str = `<div style="color:#ffffff">${name}</div>`
        e.forEach((x, i) => {
          str +=
            '<div style="font-size:14px;color:#ffffff"><div style="display: inline-block;margin-right: 6px;background:' +
            props.colorList[i] +
            ';width:8px;height:8px;border-radius: 50%;" ></div>' +
            x.seriesName +
            '：' +
            `${x.data.toLocaleString('en-US')}` +
            '</div>'
        })
        return str
      }
    },
    legend: {
      data: [
        {
          icon: 'recet',
          name: props.typeList[0],
          extStyle: {
            color: '#B6B9BE'
          }
        },
        {
          icon: 'circle',
          name: props.typeList[1]
        },
        {
          icon: 'circle',
          name: props.typeList[2]
        },
        {
          icon: 'circle',
          name: props.typeList[3]
        }
      ],
      left: 'center',
      top: 5,
      itemWidth: 18, // 设置图例宽度
      itemHeight: 8, // 设置图例高度
      itemGap: 28,
      textStyle: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.65)'
      }
    },
    xAxis: [
      {
        // boundaryGap: false, //坐标轴两边留白策略
        type: 'category',
        axisLabel: {
          onZero: false,
          interval: 0,
          showMaxLabel: true,
          fontSize: 12,
          margin: 12,
          lineHeight: 16,
          textStyle: {
            color: 'rgba(0,0,0,0.65)'
          },
          formatter: e => {
            const time = e ? dateFormat(new Date(e), 'YYYY-MM-DD hh:mm:ss') : ''
            return time ? `${time.split(' ')[0].substring(5)}\n${time.split(' ')[1]}` : '--'
            // return million(e);
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
          lineStyle: {
            color: '#e9e9e9',
            width: 1
          }
        },
        axisLabel: {
          fontSize: 12,
          margin: 10,
          textStyle: {
            color: 'rgba(0,0,0,0.65)'
          },
          formatter: e => {
            return million(e)
          }
        },
        name: props.typeList[0],
        nameTextStyle: {
          color: 'rgba(0,0,0,0.65)',
          fontSize: 14,
          padding: 10
        },
        type: 'value',
        min: 0,
        max: maxNum1,
        splitNumber: 5,
        interval: Math.ceil(maxNum1 / 5)
      },
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
          lineStyle: {
            color: '#e9e9e9',
            width: 1
          }
        },
        axisLabel: {
          fontSize: 12,
          margin: 10,
          textStyle: {
            color: 'rgba(0,0,0,0.65)'
          },
          formatter: e => {
            return million(e)
          }
        },
        name: props.typeList.slice(1).join('/'),
        nameTextStyle: {
          color: 'rgba(0,0,0,0.65)',
          fontSize: 14,
          padding: 10
        },
        type: 'value',
        min: 0,
        max: maxNum2,
        splitNumber: 5,
        interval: Math.ceil(maxNum2 / 5)
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
                  color: props.colorList[0] // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: '#84B1FF' // 100% 处的颜色
                }
              ],
              global: false // 缺省为 false
            }
          }
        },

        name: props.typeList[0],
        type: 'bar',
        barWidth: 18, // 柱图宽度
        // prettier-ignore
        data:data1
      },
      {
        symbol: 'circle',
        symbolSize: 3, // 拐点的大小
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderType: 'solid',
          color: props.colorList[1]
        },
        name: props.typeList[1],
        type: 'line',
        yAxisIndex: 1,
        // prettier-ignore
        data:data2
      },
      {
        symbol: 'circle',
        symbolSize: 3, // 拐点的大小
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderType: 'solid',
          color: props.colorList[2]
        },
        name: props.typeList[2],
        type: 'line',
        yAxisIndex: 1,
        // prettier-ignore
        data:data3
      },
      {
        symbol: 'circle',
        symbolSize: 3, // 拐点的大小
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          borderType: 'solid',
          color: props.colorList[3]
        },
        name: props.typeList[3],
        type: 'line',
        yAxisIndex: 1,
        // prettier-ignore
        data:data4
      }
    ]
  }
  barChart.setOption(options)
}
//
function onResize() {
  const barChart = echarts.init(indexChart.value)
  // 自适应大小, 不用的话不会自适应大小。
  barChart.resize()
}
onMounted(() => {
  window.addEventListener('resize', onResize)
})
watch(
  () => props.data,
  newValue => {
    console.log('bar-line-watch')
    getBarChart()
  },
  { deep: true }
)
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>
<style lang="scss" scoped>
.barAndLineChart {
  width: 100%;
  height: 100%;
  position: relative;
  .title {
    padding: 22px 0 0 24px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    line-height: 22px;
  }
  .echart_box {
    width: 100%;
    height: 100%;
  }
  .no_echart {
    background: #fff;
    width: 100%;
    height: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    text-align: center;
  }
}
</style>

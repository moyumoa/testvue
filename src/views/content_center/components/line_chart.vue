<template>
  <div class="lineChart chart_box" style="min-width: 500px">
    <div
      :id="id"
      class="have_echart"
      style="width: 100%; min-width: 500px"
      :style="{ height: height }"
    ></div>
    <div class="no_echart" v-if="data.length == 0 && !loading">
      <img src="@/assets/images/content_center/no_echart.png" alt="" />
      暂无数据
    </div>
  </div>
</template>
<script>
import { wanSliceFormat } from '@/utils/tools.js'
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
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features'
// 注意，新的接口中默认不再包含 Canvas 渲染器，需要显示引入，如果需要使用 SVG 渲染模式则使用 SVGRenderer
import { CanvasRenderer } from 'echarts/renderers'
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
export default {
  name: 'lineChart',
  props: {
    // 类型
    type: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: 'lineChart'
    },
    // 数据
    data: {
      type: Array,
      default: () => []
    },
    // 是否图表在页面中显示
    showLine: {
      type: Boolean,
      default: true
    },
    showLegend: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: '300px'
    },
    abscissaBase: {
      // 横坐标显示个数处理 true全部显示，false使用规则
      type: Boolean,
      default: false
    },
    // 大类型下的小类型，例如内容中台-矩阵罗盘-矩阵概览页面，点击新增播放数（大类型）后，图表上方会显示播放数、点赞数、评论数、分享数小类型，这个就是区分这个tab的
    chartTab: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 不显示在图表内，但是要显示在tooltip内的数据是一个数组
    tooltipData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  setup(props) {
    const chartName = toRef(props, 'id')
    const loading = ref(true)
    let myChart = ref()
    // 加载动画
    function chartLoading() {
      loading.value = true
      myChart.showLoading({
        text: '',
        color: '#364fcd',
        textColor: '#000',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0,
        // 字体大小。从 `v4.8.0` 开始支持。
        fontSize: 20,
        // 是否显示旋转动画（spinner）。从 `v4.8.0` 开始支持。
        showSpinner: true,
        // 旋转动画（spinner）的半径。从 `v4.8.0` 开始支持。
        spinnerRadius: 16,
        // 旋转动画（spinner）的线宽。从 `v4.8.0` 开始支持。
        lineWidth: 2
      })
    }
    // 绘制图表
    function setChart() {
      console.log('图表的数据', props.data)
      console.log('tooltipData', props.tooltipData)

      myChart.hideLoading()
      loading.value = false
      if (props.data.length === 0) return
      const xData = []
      const yData = []
      props.data.forEach(x => {
        xData.push(x.xData)
        yData.push(x.yData)
      })
      // 处理横坐标显示
      function xDataShow(_xData) {
        console.log('props.abscissaBase', props.abscissaBase)
        return props.abscissaBase ? 0 : _xData.length > 7 ? parseInt(_xData.length / 7) : 0
      }
      myChart.setOption({
        legend: {
          x: 'center',
          y: 'top',
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          show: props.showLegend
        },
        grid: {
          top: props.showLegend ? 40 : 24,
          left: 0,
          bottom: 24,
          right: 24,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false, // 坐标轴两边留白策略
          axisLabel: {
            // interval: xData.length > 7 ? parseInt(xData.length / 7) : 0,
            interval: xDataShow(xData),
            showMaxLabel: true,
            fontSize: 12,
            margin: 20,
            lineHeight: 16,
            textStyle: {
              color: 'rgba(0,0,0,0.65)'
            },
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
            textStyle: {
              color: 'rgba(0,0,0,0.65)'
            },
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
          backgroundColor: 'rgba(81,81,81,1)',

          padding: [5, 10],
          formatter: function (e) {
            if (
              chartName.value === 'dataOverviewLineChart' &&
              [
                'activeAccountCount',
                'videoNum',
                'playNum',
                'diggNum',
                'commentNum',
                'shareNum'
              ].includes(props.chartTab.key)
            ) {
              return dataOverviewLineChartFormatter(e)
            } else {
              let str = ''
              e.forEach(x => {
                str +=
                  '<div style="color:#fff">' +
                  x.name +
                  '</div><div style="font-size:14px;color:#fff"><div style="display: inline-block;margin-right: 6px;background:' +
                  x.color +
                  ';width:8px;height:8px;border-radius: 50%;" ></div>' +
                  x.seriesName +
                  '：' +
                  `${wanSliceFormat(x.data || 0)}` +
                  '</div>'
              })
              return str
            }
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
                    color: '#889CFF' // 0% 处的颜色
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
              color: '#889CFF',
              width: 2
            },
            itemStyle: {
              normal: {
                color: '#889CFF',
                borderColor: '#fff',
                borderWidth: 1,
                borderType: 'solid'
              }
            }, // 拐点的样式
            name: props.type || '',
            type: 'line',
            data: yData
          }
        ]
      })
    }
    watch(
      () => props.data,
      newValue => {
        console.log('line-watch')
        setChart()
      }
    )

    // 数据总览 鼠标移入显示具体平台
    function dataOverviewLineChartFormatter(e) {
      const index = e[0].dataIndex || 0
      const toolTipsData = props.tooltipData[index] || {}
      const toolTipsDataTotal = Object.values(toolTipsData).reduce((acc, curr) => acc + curr, 0)
      let str = ''
      e.forEach(x => {
        str += `
        <div style="padding: 8px 4px;" >
        <div
          style="
            font-size: 14px;
            font-family: Helvetica;
            color: #ffffff;
            line-height: 17px;
            color: rgba(255, 255, 255, 0.8);
          "
        >
          ${x.axisValue}
        </div>
        <div
          style="
            font-size: 14px;
            font-family: Helvetica;
            color: #ffffff;
            line-height: 17px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 6px;
          "
        >
          ${x.seriesName}：${toolTipsDataTotal}
        </div>
        <div style="margin-top: 8px; display: flex">
          <div
            style="
              height: 20px;
              display: flex;
              align-items: center;
              position: relative;
              margin-right: 12px;
            "
          >
            <div class="xm_platformIcon_1" style="left: 0"></div>
            <div
              style="
                text-indent: 24px;
                font-size: 16px;
                font-family: PingFangSC, PingFang SC;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
                line-height: 20px;
              "
            >
              ${toolTipsData.dyData || 0}
            </div>
          </div>
          <div
            style="
              height: 20px;
              display: flex;
              align-items: center;
              position: relative;
              margin-right: 12px;
            "
          >
            <div class="xm_platformIcon_3" style="left: 0"></div>
            <div
              style="
                text-indent: 24px;
                font-size: 16px;
                font-family: PingFangSC, PingFang SC;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
                line-height: 20px;
              "
            >
              ${toolTipsData.xhsData || 0}
            </div>
          </div>
          <div
            style="
              height: 20px;
              display: flex;
              align-items: center;
              position: relative;
              margin-right: 12px;
            "
          >
            <div class="xm_platformIcon_4" style="left: 0"></div>
            <div
              style="
                text-indent: 24px;
                font-size: 16px;
                font-family: PingFangSC, PingFang SC;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
                line-height: 20px;
              "
            >
              ${toolTipsData.ksData || 0}
            </div>
          </div>
          <div
            style="
              height: 20px;
              display: flex;
              align-items: center;
              position: relative;
              margin-right: 12px;
            "
          >
            <div class="xm_platformIcon_2" style="left: 0"></div>
            <div
              style="
                text-indent: 24px;
                font-size: 16px;
                font-family: PingFangSC, PingFang SC;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.8);
                line-height: 20px;
              "
            >
              ${toolTipsData.wxData || 0}
            </div>
          </div>
        </div>
      </div>`
      })

      return str
    }
    onMounted(() => {
      console.log('line-mounted')
      // 基于准备好的dom，初始化echarts实例
      myChart = echarts.init(document.getElementById(chartName.value))
      chartLoading()
      setChart()

      window.addEventListener('resize', () => {
        if (props.showLine) {
          myChart.resize()
        }
      })
    })
    return { chartName, loading, chartLoading }
  }
}
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
  }
  .have_echart {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .no_echart {
    background: #fff;
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

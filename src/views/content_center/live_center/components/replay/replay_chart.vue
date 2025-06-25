<template>
  <!-- <div class="check_chart" ref="lineCharts" :style="{'height': chartsHeight + 'px'}"></div> -->
  <div class="line-warpper" :style="{ height: chartsHeight + 'px' }">
    <div class="check_chart" ref="lineCharts" :style="{ height: chartsHeight + 'px' }"></div>
    <!-- <div class="no-charts" :style="{'height': chartsHeight + 'px'}" v-show="count === 0">
    <div class="no-line" v-for="item in 7" :key="`noline${item}`" :style="{'top': (item) * chartsHeight / 7 + 'px'}"></div>
  </div> -->
    <!-- <div class="line-loading" v-if="isLoading">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="30px"
        height="30px"
        viewBox="0 0 50 50"
        style="enable-background: new 0 0 50 50"
        xml:space="preserve"
      >
        <path
          fill="#6647ff"
          d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z"
          transform="rotate(275.098 25 25)"
        >
          <animateTransform
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.6s"
            repeatCount="indefinite"
          ></animateTransform>
        </path>
      </svg>
    </div> -->
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { wanSliceFormat } from '@/utils/tools'

export default {
  props: {
    chartsHeight: {
      type: Number,
      default: 250
    },
    chartsData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      lineEcharts: null,
      count: -1,
      // isLoading: true,
      colors: {
        jcrs: '#1966ff', // 进场人数
        zx: '#ff6666', // 在线
        zxrs: '#ff6666', // 在线
        zrll: '#FF66EB', // 转化率 // 自然流量
        zfl: '#FFDE66', // 转粉率
        hdl: '#A347FF', // 互动率
        // zrll: '#22CAFF', // 自然流量
        // ffll: '#FF4797', // 付费流量
        fkje: '#ffa666', // 付款金额
        uvjz: '#22CAFF', // uv价值
        rjkbsc: '#CF65F4', // 人均看播时长
        fkjs: '#0bd7f2',
        ffll: '#FF4797',
        xh: '#716CFF', // 消耗
        zbjgks: '#FF85CA',
        pjdjdw: '#66E2F8',
        zss: '#FF4EC3',
        zhs: '#EB76DB',
        djs: '#EB76B0',
        zbjcgyfzgks: '#E276EB',
        zbjgzs: '#EB7676',
        djl: '#EBE176',
        pjqczsfy: '#pjqczsfy',
        zjdjs: '#76EB95',
        zjdjl: '#76EBD3',
        zjdjcb: '#76BAEB',
        cb: '#768FEB'
      },
      rgbColors: {
        jcrs: 'rgba(15, 102, 255, .3)',
        zxrs: 'rgba(255, 102, 102, .3)',
        zx: 'rgba(255, 102, 102, .3)',
        zhl: 'rgba(255, 102, 235, .3)',
        zfl: 'rgba(255, 222, 102, .3)',
        hdl: 'rgba(163, 71, 255, .3)',
        zrll: 'rgba(255, 102, 235, .3)',
        ffll: 'rgba(255, 71, 151, .3)',
        fkje: 'rgba(255, 166, 102, .3)',
        uvjz: 'rgba(101, 244, 233, .3)',
        rjkbsc: 'rgba(207, 101, 244, .3)',
        fkjs: 'rgba(11, 215, 242, .3)',
        xh: 'rgba(113, 108, 255, .3)', // 消耗
        zbjgks: 'rgba(255, 133, 202, .3)',
        pjdjdw: 'rgba(102, 226, 248, .3)',
        zss: 'rgba(255, 78, 195, .3)',
        zhs: 'rgba(226, 118, 235, .3)',
        djs: 'rgba(235, 118, 219, .3)',
        zbjcgyfzgks: 'rgba(235, 118, 176, .3)',
        zbjgzs: 'rgba(235, 118, 118, .3)',
        djl: 'rgba(235, 225, 118, .3)',
        pjqczsfy: 'rgba(180, 235, 118, .3)',
        zjdjs: 'rgba(118, 235, 149, .3)',
        zjdjl: 'rgba(118, 235, 211, .3)',
        zjdjcb: 'rgba(118, 186, 235, .3)',
        cb: 'rgba(118, 143, 235, .3)',
        xzfss: 'rgba(101, 244, 138, .3)',
        // zbqjzfdds: 'rgba(11, 215, 242, .3)',
        dzs: 'rgba(53, 87, 76, .3)',
        cjje: 'rgba(255, 166, 102, .3)'
      }
    }
  },
  mounted() {
    // this.lineEcharts = echarts.init(this.$refs.lineCharts)
    // console.log('lineEcharts', this.lineEcharts)
  },
  methods: {
    handler(newVal) {
      if (!this.lineEcharts) {
        this.lineEcharts = echarts.init(this.$refs.lineCharts)
      }
      const option = {
        grid: {
          left: 68,
          right: 40,
          top: 12,
          bottom: 5
          // bottom: 30
        },
        xAxis: {
          boundaryGap: false,
          type: 'category',
          show: false,
          data: newVal.xData
        },
        tooltip: {
          triggerOn: 'none',
          show: true,
          trigger: 'axis',
          showContent: false
        },
        yAxis: [
          {
            type: 'value',
            name: 'left',
            show: true,
            axisLine: {
              lineStyle: {
                color: '#999'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#f2f2f2',
                type: 'dashed',
                dashOffset: 10
              }
            },
            axisLabel: {
              formatter(value, index) {
                return wanSliceFormat(value)
              }
            }
          },
          {
            type: 'value',
            name: 'right',
            show: true,
            axisLine: {
              lineStyle: {
                color: '#999'
              }
            },
            splitLine: {
              lineStyle: {
                color: '#f2f2f2',
                type: 'dashed',
                dashOffset: 10
              }
            },
            axisLabel: {
              formatter(value, index) {
                return wanSliceFormat(value)
              }
            }
          }
        ],
        series: []
      }
      newVal.left &&
        Object.keys(newVal.left).forEach(key => {
          option.series[option.series.length] = {
            type: 'line',
            showSymbol: false,
            yAxisIndex: 0,
            symbolSize: 6,
            name: 'left',
            smooth: true,
            data: newVal.left[key],
            lineStyle: {
              color: this.colors[key],
              width: 2
            },
            itemStyle: {
              color: this.colors[key]
            },
            emphasis: {
              scale: true,
              lineStyle: {
                width: 2 // hover时的折线宽度
              }
            },
            areaStyle: ['jcrs1'].includes(key)
              ? {}
              : {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: this.rgbColors[key] // 0% 处的颜色
                      },
                      {
                        offset: 1,
                        color: 'rgba(255, 255, 255, 0.05)' // 100% 处的颜色
                      }
                    ],
                    global: false // 缺省为 false
                  }
                }
          }
        })
      newVal.right &&
        Object.keys(newVal.right).forEach(key => {
          option.series[option.series.length] = {
            type: 'line',
            symbolSize: 6,
            showSymbol: false,
            name: 'right',
            smooth: true,
            yAxisIndex: 1,
            data: newVal.right[key],
            lineStyle: {
              color: this.colors[key],
              width: 2
            },
            itemStyle: {
              color: this.colors[key]
            },
            emphasis: {
              scale: true,
              lineStyle: {
                width: 2 // hover时的折线宽度
              }
            },
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
                    color: this.rgbColors[key] // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(255, 255, 255, 0.05)' // 100% 处的颜色
                  }
                ],
                global: false // 缺省为 false
              }
            }
          }
        })
      this.lineEcharts.setOption(option, true, false)
      // this.isLoading = false
    },
    updateEcharts() {
      const option = this.lineEcharts.getOption()
      this.lineEcharts.dispose()
      this.lineEcharts = echarts.init(this.$refs.lineCharts)
      this.lineEcharts.setOption(option)
    },
    hideTips() {
      if (this.lineEcharts) {
        this.lineEcharts.dispatchAction({
          type: 'hideTip'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.line-warpper {
  position: relative;
}
.check_chart {
  height: 250px;
  width: 100%;
  cursor: pointer;
  // overflow: hidden;
}
.no-charts {
  position: absolute;
  width: calc(100% - 68px);
  left: 68px;
  top: 10px;
  .no-line {
    position: absolute;
    width: 100%;
    height: 1px;
    background: #ccc;
    // border-bottom: 1px solid #f2f2f2;
  }
}
.line-loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
}
</style>

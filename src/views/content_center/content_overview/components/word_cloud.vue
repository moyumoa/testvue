<template>
  <div class="word_cloud">
    <div class="module_title">行业热词</div>
    <div ref="wordCloud" v-if="data.length > 0" class="echarts_word_cloud"></div>
    <div class="no_data" v-else>
      <el-empty
        :image-size="70"
        image="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/bb500557fe2e43cea32c45b68eca89dc_1685948431961.png"
        description="暂无数据"
      />
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { industryHotWordsList } from '@/api/content_center/content_overview.js'

let charts = null
const data = ref([])
const wordCloud = ref(null)
onMounted(() => {
  getList()
  wordCloud.value = document.getElementById('')
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
const onResize = () => {
  charts.resize()
}
const getList = () => {
  //
  industryHotWordsList().then(res => {
    if (res.code === 0) {
      const list = res.data || []
      data.value = list.map(item => {
        return {
          name: item,
          value: Math.floor(Math.random() * 50)
        }
      })
      nextTick(() => {
        setChart()
      })
    }
  })
}
const setChart = () => {
  if (wordCloud.value === null) return
  charts = echarts.init(wordCloud.value)
  charts.setOption({
    series: [
      {
        type: 'wordCloud',
        data: data.value,
        shape: function shapeSquare(theta) {
          return Math.min(1 / Math.abs(Math.cos(theta)), 1 / Math.abs(Math.sin(theta)))
        },
        // 下面就是位置的配置
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        right: null,
        bottom: null,
        // 词的大小，最小12px，最大60px，可以在这个范围调整词的大小
        sizeRange: [12, 28],
        // 每个词旋转的角度范围和旋转的步进
        rotationRange: [-90, 90],
        rotationStep: 90,
        // shape: 'triangle-forward', // 词云图显示排列为什么形状，默认 circle，cardioid 心形，diamond 菱形
        textStyle: {
          color() {
            // 颜色随机渐变
            const colors = ['#DB6452', '#E7C17F', '#E6B385', '#AAD888', '#78BDCD', '#6582BE']
            return colors[parseInt(Math.random() * 6)]
          },
          normal: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold'
          }
        }
      }
    ]
  })
  // 将鼠标移动到文字上 cursor 设为default
  charts.on('mousemove', function (params) {
    if (params.seriesIndex === 0) {
      charts.getZr().setCursorStyle('default')
    }
  })
}
</script>

<style lang="scss" scoped>
.word_cloud {
  background-color: #fff;
  border-radius: 4px;
  padding: 22px 24px;
  height: 280px;

  .module_title {
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 26px;
  }

  .echarts_word_cloud {
    //width: 360px;
    //height: 286px;
    margin-top: 10px;
    width: 100%;
    height: calc(100% - 30px);
  }
  .no_data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(100% - 50px);
  }
}
</style>

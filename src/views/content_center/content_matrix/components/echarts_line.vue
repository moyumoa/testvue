<template>
  <div class="echart_detail">
    <div class="rule_box">
      <div class="left_rule">
        <div
          @click="changeLeftRule(item.value)"
          class="one_rule"
          :class="item.value == leftIndex ? 'choose_rule' : ''"
          v-for="(item, index) in props.leftTabList"
          :key="index"
        >
          {{ item.label }}
        </div>
      </div>
      <!-- <div class="right_rule">
        <div
          @click="changeRightRule(item.name)"
          class="one_rule"
          :class="item.name == rightTab ? 'choose_rule' : ''"
          v-for="(item, index) in rightTabList"
          :key="index"
        >
          {{ item.label }}
        </div>
      </div> -->
    </div>
    <div class="echart_box">
      <lineChart
        v-if="ismounted"
        :id="'lineChart' + type"
        :type="props.leftTabList[leftIndex].label"
        :data="echartList"
      ></lineChart>
    </div>
  </div>
</template>
<script setup>
import lineChart from '../../components/line_chart.vue'
import { nextTick } from 'vue'

const ismounted = ref(false)
nextTick(() => {
  ismounted.value = true
})

const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  },
  leftTabList: {
    type: Array,
    default: () => [
      {
        value: 1,
        label: '播放量'
      }
    ],
    required: true
  },
  timeForm: {
    type: Object,
    default: () => {}
  },
  type: {
    type: String,
    default: ''
  }
})
// playList: [],
//   diggList: [],
//   commentList: [],
//   shareList: []
const type = toRef(props, 'type')
// const rightTabList = ref([
//   {
//     name: 'add',
//     label: '增量'
//   },
//   {
//     name: 'all',
//     label: '总量'
//   }
// ])
const leftIndex = ref(0)
const rightTab = ref('add')

const echartList = ref([])
const playList = ref([])
const diggList = ref([])
const commentList = ref([])
const shareList = ref([])
// 获取对应的折线图数据
function getEchartList(index, rightTab) {
  echartList.value = []
  if (index === 0) {
    playList.value = props.data.playList
    if (rightTab === 'add') {
      playList.value.forEach(item => {
        echartList.value.push({
          xData: item.xData,
          yData: item.yData1
        })
      })
    } else if (rightTab === 'all') {
      playList.value.forEach(item => {
        echartList.value.push({
          xData: item.xData,
          yData: item.yData2
        })
      })
    }
  }
  if (index === 1) {
    diggList.value = props.data.diggList
    if (rightTab === 'add') {
      diggList.value.forEach(item => {
        echartList.value.push({
          xData: item.xData,
          yData: item.yData1
        })
      })
    } else if (rightTab === 'all') {
      diggList.value.forEach(item => {
        echartList.value.push({
          xData: item.xData,
          yData: item.yData2
        })
      })
    }
  }
  if (index === 2) {
    commentList.value = props.data.commentList
    diggList.value = props.data.diggList
    if (rightTab === 'add') {
      commentList.value.forEach(item => {
        echartList.value.push({
          xData: item.xData,
          yData: item.yData1
        })
      })
    } else if (rightTab === 'all') {
      commentList.value.forEach(item => {
        echartList.value.push({
          xData: item.xData,
          yData: item.yData2
        })
      })
    }
  }
  if (index === 3) {
    shareList.value = props.data.shareList
    if (rightTab === 'add') {
      shareList.value.forEach(item => {
        echartList.value.push({
          xData: item.xData,
          yData: item.yData1
        })
      })
    } else if (rightTab === 'all') {
      shareList.value.forEach(item => {
        echartList.value.push({
          xData: item.xData,
          yData: item.yData2
        })
      })
    }
  }
}

// 点击左侧切换
function changeLeftRule(index) {
  leftIndex.value = index
  getEchartList(leftIndex.value, rightTab.value)
}
// 点击右侧切换
// function changeRightRule(name) {
//   rightTab.value = name
//   getEchartList(leftIndex.value, rightTab.value)
// }
//
getEchartList(leftIndex.value, rightTab.value)
// onMounted(() => {
//   getEchartList(leftIndex.value, rightTab.value)
// })
watch(
  () => props.data,
  newValue => {
    getEchartList(leftIndex.value, rightTab.value)
  },
  { deep: true }
)
</script>
<style lang="scss" scoped>
.echart_detail {
  padding-top: 24px;
}
.rule_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .one_rule {
    cursor: pointer;
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 600;
    color: #909399;
    line-height: 20px;
  }
  .one_rule + .one_rule {
    border-left: 1px solid #e8e8e8;
  }
  .choose_rule {
    color: $theme_color;
  }
  .left_rule {
    flex: 1;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_rule {
      padding-right: 8px;
    }
    .one_rule + .one_rule {
      padding-left: 8px;
    }
  }
  .right_rule {
    flex: 1;

    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .one_rule {
      padding-left: 8px;
    }
    .one_rule:first-child {
      padding-right: 8px;
    }
  }
}
.echart_box {
  margin: 20px 0 0;
  width: 100%;
  height: 300px;
}
</style>

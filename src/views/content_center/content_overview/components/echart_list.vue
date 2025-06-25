<template>
  <div class="all_echarts">
    <el-tabs v-model="chooseRule" @tab-click="changeTab">
      <el-tab-pane label="视频数据" name="video"></el-tab-pane>
      <el-tab-pane label="直播数据" name="live"></el-tab-pane>
      <el-tab-pane label="效果数据" name="effect"></el-tab-pane>
    </el-tabs>
    <div>
      <div class="echart_detail" style="margin-top: 9px" v-loading="loading">
        <div class="rule_box">
          <div class="left_rule">
            <div
              @click="changeRule(item.name, 'left')"
              :class="{ one_rule: true, choose_rule: item.name == chooseLeftTab }"
              v-for="(item, index) in leftTabList[chooseRule]"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div>
          <!-- <div class="right_rule" >
            <div
              @click="changeRule(item.name, 'right')"
              :class="{ one_rule: true, choose_rule: item.name == chooseRightTab }"
              v-for="(item, index) in rightTabList"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div> -->
        </div>
        <div class="echart_box">
          <lineChart
            ref="lineChartBox"
            id="lineChart"
            :type="lineType"
            :data="echartList"
          ></lineChart>
        </div>
      </div>
    </div>
    <div class="tab_slot">
      <div class="chooseTime_box">
        <div class="time_left">
          <!-- <div
            v-if="chooseRule != 'video'"
            :class="{ one_time: true, choose_time: timeForm.type == 1 }"
            @click="chooseTimeFun(1)"
          >
            24小时
          </div> -->
          <div
            :class="{ one_time: true, choose_time: timeForm.type == 7 }"
            @click="chooseTimeFun(7)"
          >
            7天
          </div>
          <div
            :class="{ one_time: true, choose_time: timeForm.type == 15 }"
            @click="chooseTimeFun(15)"
          >
            15天
          </div>
          <div
            :class="{ one_time: true, choose_time: timeForm.type == 30 }"
            @click="chooseTimeFun(30)"
          >
            30天
          </div>
        </div>
        <el-date-picker
          style="width: 250px"
          v-model="timeForm.timeLen"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          unlink-panels
          :disabled-date="
            time => {
              return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
            }
          "
          :clearable="false"
          :editable="false"
          @change="timeChange"
        ></el-date-picker>
      </div>
    </div>
  </div>
</template>
<script setup>
import lineChart from '../../components/line_chart.vue'
import { videoChart, liveChart, collectionChart } from '@/api/content_center/content_overview.js'
import { dateFormat, throttle, changeTwoDecimal } from '@/utils/tools.js'
import { useStore } from 'vuex'
defineComponent(lineChart)
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
// 当前平台
const activePlatform = computed(() => store.state.content_center.platform)
const timeForm = reactive({
  type: 7,
  timeLen: []
})
const loading = ref(true)

const leftTabList = reactive({
  video: [
    {
      name: 1,
      label: '播放数'
    },
    {
      name: 2,
      label: '点赞数'
    },
    {
      name: 3,
      label: '评论数'
    },
    {
      name: 4,
      label: '分享数'
    }
  ],
  live: [
    {
      name: 1,
      label: '观看人次'
    },
    {
      name: 2,
      label: '点赞数'
    },
    {
      name: 3,
      label: '涨粉数'
    }
  ],
  effect:
    brandViewMode.value === 1
      ? [
          {
            name: 1,
            label: '销售额'
          },
          {
            name: 2,
            label: '销售量'
          },
          {
            name: 3,
            label: '线索数'
          }
        ]
      : [
          {
            name: 3,
            label: '线索数'
          }
        ]
})
// const rightTabList = ref([
//   {
//     name: 'all',
//     label: '总量'
//   },
//   {
//     name: 'add',
//     label: '增量'
//   }
// ])
const chooseLeftTab = ref(1)
const chooseRightTab = ref('all')
const lineChartBox = ref(null)
const echartList = ref([])
const chooseRule = ref('video')
function changeTab(stu) {
  loading.value = true
  chooseLeftTab.value = chooseRule.value === 'effect' && brandViewMode.value === 2 ? 3 : 1
  if (stu === true) {
    timeForm.type = 7
    chooseTimeFun(7)
  } else {
    getAllChart()
  }
}

// 修改时间--tab
function chooseTimeFun(e) {
  timeForm.type = e
  const nowTime = new Date()
  const oldTime = new Date()
  nowTime.setTime(nowTime - 24 * 60 * 60 * 1000)
  oldTime.setTime(nowTime - (e - 1) * 24 * 60 * 60 * 1000)
  timeForm.timeLen = [oldTime, nowTime]
  timeForm.timeStrLen = JSON.parse(
    JSON.stringify([dateFormat(oldTime) + ' 00:00:00', dateFormat(nowTime) + ' 23:59:59'])
  )
  getAllChart()
}
// 修改时间--datepicker
function timeChange() {
  const nowTime = new Date()
  const oldTime1 = new Date()
  const oldTime2 = new Date()
  const oldTime3 = new Date()
  const oldTime4 = new Date()
  nowTime.setTime(nowTime - 24 * 60 * 60 * 1000)
  oldTime1.setTime(nowTime - 0 * 24 * 60 * 60 * 1000)
  oldTime2.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)
  oldTime3.setTime(nowTime - 14 * 24 * 60 * 60 * 1000)
  oldTime4.setTime(nowTime - 29 * 24 * 60 * 60 * 1000)
  if (timeForm.timeLen) {
    if (dateFormat(timeForm.timeLen[1]) === dateFormat(nowTime)) {
      if (dateFormat(timeForm.timeLen[0]) === dateFormat(oldTime1)) {
        timeForm.type = 1
      } else if (dateFormat(timeForm.timeLen[0]) === dateFormat(oldTime2)) {
        timeForm.type = 7
      } else if (dateFormat(timeForm.timeLen[0]) === dateFormat(oldTime3)) {
        timeForm.type = 15
      } else if (dateFormat(timeForm.timeLen[0]) === dateFormat(oldTime4)) {
        timeForm.type = 30
      } else {
        timeForm.type = null
      }
    } else {
      timeForm.type = null
    }
  }
  timeForm.timeStrLen = [
    dateFormat(timeForm.timeLen[0]) + ' 00:00:00',
    dateFormat(timeForm.timeLen[1]) + ' 23:59:59'
  ]
  getAllChart()
}
const allList = ref([])
// 获取视频数据图表
function getVideoChart() {
  videoChart({
    startDate: timeForm.timeStrLen[0],
    endDate: timeForm.timeStrLen[1],
    platform: activePlatform.value || null
  })
    .then(res => {
      if (res.code === 0) {
        allList.value = res.data || []
      } else {
        allList.value = []
      }
      loading.value = false
      changeRule(chooseLeftTab.value, 'left', true)
    })
    .catch(() => {
      loading.value = false
      allList.value = []
      changeRule(chooseLeftTab.value, 'left', true)
    })
}

// 获取直播数据图表
function getLiveChart() {
  liveChart({
    startDate: timeForm.timeStrLen[0],
    endDate: timeForm.timeStrLen[1],
    platform: activePlatform.value || null
  })
    .then(res => {
      if (res.code === 0) {
        allList.value = res.data || []
      } else {
        allList.value = []
      }
      loading.value = false
      changeRule(chooseLeftTab.value, 'left', true)
    })
    .catch(() => {
      loading.value = false
      allList.value = []
      changeRule(chooseLeftTab.value, 'left', true)
    })
}
// 获取效果数据图表
function getCollectionChart() {
  collectionChart({
    startDate: timeForm.timeStrLen[0],
    endDate: timeForm.timeStrLen[1],
    platform: activePlatform.value || null
  })
    .then(res => {
      if (res.code === 0) {
        allList.value = res.data || []
      } else {
        allList.value = []
      }
      loading.value = false
      changeRule(chooseLeftTab.value, 'left', true)
    })
    .catch(() => {
      loading.value = false
      allList.value = []
      changeRule(chooseLeftTab.value, 'left', true)
    })
}
function getAllChart() {
  loading.value = true
  allList.value = []
  if (chooseRule.value === 'video') {
    getVideoChart()
  } else if (chooseRule.value === 'live') {
    getLiveChart()
  } else if (chooseRule.value === 'effect') {
    getCollectionChart()
  }
}
// 切换规则
const changeRule = throttle((e, type, init = false) => {
  if (
    !init &&
    ((type === 'left' && chooseLeftTab.value === e) ||
      (type === 'right' && chooseRightTab.value === e))
  ) {
    return
  }

  lineChartBox.value.chartLoading()
  if (type === 'left') {
    chooseLeftTab.value = e
  } else {
    chooseRightTab.value = e
  }
  getOneList()
}, 300)
function getOneList() {
  if (chooseRule.value === 'video') {
    const list = []
    allList.value.forEach(x => {
      if (chooseLeftTab.value === 1) {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.playNumIncrement || 0 : x.playNum || 0
        })
      } else if (chooseLeftTab.value === 2) {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.diggNumIncrement || 0 : x.diggNum || 0
        })
      } else if (chooseLeftTab.value === 3) {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.commentNumIncrement || 0 : x.commentNum || 0
        })
      } else {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.shareNumIncrement || 0 : x.shareNum || 0
        })
      }
    })
    echartList.value = list
  } else if (chooseRule.value === 'live') {
    const list = []
    allList.value.forEach(x => {
      if (chooseLeftTab.value === 1) {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.watchTimesIncrement || 0 : x.watchTimes || 0
        })
      } else if (chooseLeftTab.value === 2) {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.diggNumIncrement || 0 : x.diggNum || 0
        })
      } else {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.fansAddNumIncrement || 0 : x.fansAddNum || 0
        })
      }
    })
    echartList.value = list
  } else {
    const list = []
    allList.value.forEach(x => {
      if (chooseLeftTab.value === 1) {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData:
            chooseRightTab.value === 'add'
              ? changeTwoDecimal(x.salesMoneyIncrement) || 0
              : changeTwoDecimal(x.salesMoney) || 0
        })
      } else if (chooseLeftTab.value === 2) {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.salesGoodsIncrement || 0 : x.salesGoods || 0
        })
      } else {
        list.push({
          xData: x.date ? x.date.substring(5, 16) : '',
          yData: chooseRightTab.value === 'add' ? x.relatedInfosIncrement || 0 : x.relatedInfos || 0
        })
      }
    })
    echartList.value = list
  }
}
onMounted(() => {
  changeTab(true)
})

const lineType = computed(() => {
  const leftTab = leftTabList[chooseRule.value]
  const filterTab = leftTab.filter(item => item.name === chooseLeftTab.value)
  return filterTab.length > 0 ? filterTab[0].label : leftTab[0].label
})
defineExpose({ getAllChart })
</script>
<style lang="scss" scoped>
@import '../../components/css/page.scss';
.all_echarts {
  width: 100%;
  padding: 30px 24px 0;
  background: #fff;
  margin-bottom: $content-margin;
  border-radius: $content-radius;
  position: relative;
  .tab_slot {
    width: 500px;
    height: 64px;
    position: absolute;
    right: 24px;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .chooseTime_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      .time_left {
        width: calc(100% - 254px);
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        margin-right: 16px;
        .one_time {
          cursor: pointer;
          width: 66px;
          height: 32px;
          border: 1px solid #d9d9d9;
          font-size: 14px;
          font-weight: 400;
          color: #595959;
          line-height: 20px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          &:first-child {
            border-radius: 4px 0px 0px 4px;
          }
          &:last-child {
            border-radius: 0px 4px 4px 0px;
          }
        }
        .choose_time {
          background: rgba(54, 79, 205, 0.1);
          border: 1px solid #364fcd;
          color: #364fcd;
        }
      }
    }
  }
}
</style>

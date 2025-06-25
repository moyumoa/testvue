<template>
  <div class="all_echarts">
    <div class="title">
      {{
        route.query.type == 1 ? '视频数据趋势' : route.query.type == 6 ? '数据趋势' : '直播数据趋势'
      }}
    </div>
    <div>
      <div class="echart_detail" style="margin-top: 9px" v-loading="loading">
        <div class="rule_box">
          <div class="left_rule">
            <div
              @click="changeRule(item.name, item.label)"
              :class="{ one_rule: true, choose_rule: item.name == tabName }"
              v-for="(item, index) in route.query.type == 1 || route.query.type == 6
                ? leftTabList1
                : leftTabList2"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        <div class="echart_box">
          <lineChart
            ref="lineChartBox"
            id="lineChart"
            :type="tabLabel"
            :data="echartList"
          ></lineChart>
        </div>
      </div>
    </div>
    <div class="tab_slot">
      <div class="chooseTime_box">
        <!-- <div class="time_left">
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
        </div>-->
        <el-date-picker
          style="width: 240px"
          v-model="timeForm.timeLen"
          type="daterange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          unlink-panels
          :clearable="false"
          :editable="false"
          @change="timeChange"
        ></el-date-picker>
      </div>
    </div>
  </div>
</template>
<script setup>
import lineChart from '../../../components/line_chart.vue'
import { dateFormat, throttle } from '@/utils/tools.js'
import { getDataAnalysisChart, getTaskInfoView } from '@/api/market/task.js'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
const route = useRoute()
const store = useStore()
defineComponent(lineChart)
const timeForm = reactive({
  type: 7,
  timeLen: []
})
const activePlatform = computed(() => store.state.market.platform)
const loading = ref(true)
const leftTabList1 = reactive([
  {
    name: 'play_count_target',
    label: '播放数'
  },
  {
    name: 'digg_count_target',
    label: '点赞数'
  },
  {
    name: 'comment_count_target',
    label: '评论数'
  },
  {
    name: 'share_count_target',
    label: '分享数'
  }
])
const leftTabList2 = reactive([
  {
    name: 'live_duration_target',
    label: '直播时长(分钟)'
  },
  {
    name: 'live_view_num_target',
    label: '直播观看人次'
  }
])
const tabName = ref(
  route.query.type === '1' || route.query.type === '6'
    ? 'play_count_target'
    : 'live_duration_target'
)
const tabLabel = ref(
  route.query.type === '1' || route.query.type === '6' ? '播放数' : '直播时长(分钟)'
)
const lineChartBox = ref(null)
const echartList = ref([])

// 修改时间--tab
function chooseTimeFun(e) {
  timeForm.type = e
  const nowTime = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const oldTime = new Date()
  // nowTime.setTime(nowTime - 24 * 60 * 60 * 1000)
  // oldTime.setTime(nowTime - (e - 1) * 24 * 60 * 60 * 1000)
  nowTime.setTime(nowTime - 0 * 60 * 60 * 1000)
  oldTime.setTime(nowTime - (e - 1) * 24 * 60 * 60 * 1000)
  timeForm.timeLen = [oldTime, nowTime]
  timeForm.timeStrLen = JSON.parse(
    JSON.stringify([dateFormat(oldTime) + ' 00:00:00', dateFormat(nowTime) + ' 23:59:59'])
  )
  dataAnalysisInfo()
}
// chooseTimeFun(7)
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
  dataAnalysisInfo()
}
function taskInfoView() {
  getTaskInfoView({ taskId: route.query.itemId }).then(res => {
    console.log(res)
    if (res.success) {
      if (route.query.pageSource && route.query.pageSource === 'growth') {
        chooseTimeFun(7)
      } else {
        // 默认选中任务开始时间 -> 任务结束时间后6天
        // let endTime = res.data.endTime ? new Date(res.data.endTime) : new Date()
        // endTime = new Date(endTime.setDate(endTime.getDate() + 5))
        // endTime = dateFormat(endTime) + ' 23:59:59'
        // timeForm.timeLen = [res.data.startTime, endTime]
        // timeForm.timeStrLen = [res.data.startTime, endTime]
        // dataAnalysisInfo()

        // 默认选中：任务开始时间 - 任务开始时间 + 6天， 不用管任务时间
        let showEndTime = res.data.startTime ? new Date(res.data.startTime) : new Date()
        showEndTime = new Date(showEndTime.setDate(showEndTime.getDate() + 6))
        showEndTime = dateFormat(showEndTime) + ' 23:59:59'
        timeForm.timeLen = [res.data.startTime, showEndTime]
        timeForm.timeStrLen = [res.data.startTime, showEndTime]
        dataAnalysisInfo()
      }
    }
  })
}
onMounted(() => {
  taskInfoView()
})
const allList = ref([])
// 获取视频数据图表
function dataAnalysisInfo() {
  lineChartBox.value.chartLoading()
  getDataAnalysisChart({
    startTime: timeForm.timeStrLen[0],
    endTime: timeForm.timeStrLen[1],
    target: tabName.value,
    taskId: route.query.itemId,
    taskType: route.query.type,
    platform: activePlatform.value || null
  })
    .then(res => {
      if (res.code === 0) {
        if (tabName.value === 'live_duration_target') {
          res.data.forEach(item => {
            item.count = item.count ? parseInt(item.count / 60000) : 0
          })
        }
        allList.value = res.data || []
      } else {
        allList.value = []
      }
      loading.value = false
      getOneList()
    })
    .catch(() => {
      loading.value = false
      allList.value = []
      getOneList()
    })
}
// 切换规则
const changeRule = throttle((name, label) => {
  tabName.value = name
  tabLabel.value = label
  dataAnalysisInfo()
}, 300)
function getOneList() {
  const list = []
  allList.value.forEach(x => {
    list.push({
      xData: x.dataDate,
      yData: x.count
    })
  })
  echartList.value = list
}
defineExpose({ dataAnalysisInfo })
</script>
<style lang="scss" scoped>
@import '@/views/content_center/components/css/page.scss';
.title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 22px;
}
.all_echarts {
  width: 100%;
  padding: 24px 24px 0;
  background: #fff;
  margin-top: $content-margin;
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
        margin-right: 24px;
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

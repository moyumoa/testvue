<template>
  <div>
    <div class="operate_part part">
      <div class="title_line">
        <div class="left_box">
          <div class="title">运营数据</div>
          <div class="time">实时</div>
        </div>
      </div>
      <div class="operate_data">
        <template v-for="(item, index) in headerInfo">
          <div class="data_item" :key="index" v-if="item.show">
            <div class="data_inner">
              <div class="name_tip">
                <div class="name">{{ item.name }}</div>
                <el-tooltip class="item" effect="dark" :content="item.content" placement="top">
                  <img src="@/assets/images/operate/tip_line.png" alt />
                </el-tooltip>
              </div>
              <div class="val">{{ item.val || 0 }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="core_part part">
      <div class="title_line">
        <div class="left_box">
          <div class="title">核心指标</div>
          <div class="time">数据更新时间：{{ coreUpdateTime || '--' }}</div>
        </div>
        <div class="chooseTime_box">
          <div class="time_left">
            <!-- <div
            v-if="chooseRule != 'video'"
            :class="{ one_time: true, choose_time: timeForm1.type == 1 }"
            @click="chooseTimeFun1(1)"
          >
            24小时
            </div>-->
            <div
              :class="{ one_time: true, choose_time: timeForm1.type == 7 }"
              @click="chooseTimeFun1(7)"
            >
              7天
            </div>
            <div
              :class="{ one_time: true, choose_time: timeForm1.type == 15 }"
              @click="chooseTimeFun1(15)"
            >
              15天
            </div>
            <div
              :class="{ one_time: true, choose_time: timeForm1.type == 30 }"
              @click="chooseTimeFun1(30)"
            >
              30天
            </div>
            <div
              :class="{ one_time: true, choose_time: timeForm1.type == 60 }"
              @click="chooseTimeFun1(60)"
            >
              60天
            </div>
          </div>
          <el-date-picker
            style="width: 240px"
            v-model="timeForm1.timeLen"
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
            @change="timeChange1"
          ></el-date-picker>
        </div>
      </div>
      <div class="core_data">
        <template v-for="(item, index) in coreData">
          <div
            v-if="item.show"
            :key="index"
            :class="{ core_data_item: true, actived: item.key == currentCoreTarget }"
            @click="chooseCoreData(item.key, item.title, 1)"
          >
            <div class="title">{{ item.title }}</div>
            <div class="val">{{ item.val }}</div>
          </div>
        </template>
      </div>
      <div class="chart_detail">
        <div class="chart_box_outer">
          <lineChart
            ref="lineChartBox"
            id="lineChartA"
            :type="currentCoreTitle"
            :data="echartListA"
          ></lineChart>
        </div>
        <sortInfo class="table_info" :data="coreRank" :name="currentCoreTitle"></sortInfo>
      </div>
    </div>
    <div class="core_part part">
      <div class="title_line">
        <div class="left_box">
          <div class="title">转化指标</div>
          <div class="time">数据更新时间：{{ transformUpdateTime || '--' }}</div>
        </div>
        <div class="chooseTime_box">
          <div class="time_left">
            <!-- <div
            v-if="chooseRule != 'video'"
            :class="{ one_time: true, choose_time: timeForm2.type == 1 }"
            @click="chooseTimeFun2(1)"
          >
            24小时
            </div>-->
            <div
              :class="{ one_time: true, choose_time: timeForm2.type == 7 }"
              @click="chooseTimeFun2(7)"
            >
              7天
            </div>
            <div
              :class="{ one_time: true, choose_time: timeForm2.type == 15 }"
              @click="chooseTimeFun2(15)"
            >
              15天
            </div>
            <div
              :class="{ one_time: true, choose_time: timeForm2.type == 30 }"
              @click="chooseTimeFun2(30)"
            >
              30天
            </div>
            <div
              :class="{ one_time: true, choose_time: timeForm2.type == 60 }"
              @click="chooseTimeFun2(60)"
            >
              60天
            </div>
          </div>
          <el-date-picker
            style="width: 240px"
            v-model="timeForm2.timeLen"
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
            @change="timeChange2"
          ></el-date-picker>
        </div>
      </div>
      <div class="core_data">
        <template v-for="(item, index) in transformData" :key="index">
          <div
            v-if="item.show"
            :class="{ core_data_item: true, actived: item.key == currentTransformTarget }"
            @click="chooseTransformData(item.key, item.title, 1)"
          >
            <div class="title">{{ item.title }}</div>
            <div class="val">{{ item.val }}</div>
          </div>
        </template>
      </div>
      <div class="chart_detail">
        <div class="chart_box_outer">
          <lineChart
            ref="lineChartBox"
            id="lineChartB"
            :type="currentTransformTitle"
            :data="echartListB"
          ></lineChart>
        </div>
        <sortInfo class="table_info" :data="transformRank" :name="currentTransformTitle"></sortInfo>
      </div>
    </div>
  </div>
</template>

<script setup>
import { dateFormat, throttle } from '@/utils/tools.js'
import lineChart from '../../components/line_chart.vue'
import sortInfo from './sort_info.vue'
import { getAllDataOverview, getCoreTargets } from '@/api/market/operate_analysis.js'
import { useStore } from 'vuex'
defineComponent(lineChart, sortInfo)
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const systemVersion = computed(() => store.state.user.systemVersion)

const headerInfo = ref([
  {
    name: '任务总数',
    content: '成功创建的任务数，含已删除任务',
    key: 'taskCount',
    val: 0,
    show: true
  },
  {
    name: '任务分发数',
    content: '营销任务分发到员工的次数，每人每接收一次任务记为1',
    key: 'taskDeliveryCount',
    val: 0,
    show: true
  },
  {
    name: '任务完成总数',
    content: '分发的任务数中，已完成的任务数',
    key: 'taskFinishCount',
    val: 0,
    show: true
  },
  {
    name: '任务视频数',
    content: '参与全员营销任务的视频数（已发到线上，含已删除的视频）',
    key: 'taskVideoCount',
    val: 0,
    show: true
  },
  {
    name: '任务直播场次数',
    content: '营销任务直播场次数，含质检不合格直播',
    key: 'taskLiveCount',
    val: 0,
    show: systemVersion.value !== 4
  },
  {
    name: '品牌曝光总数',
    content: '营销任务的视频曝光数加上营销任务的直播观看人次总和（视频数据每12小时更新一次）',
    key: 'taskPlayCount',
    val: 0,
    show: true
  },
  // {
  //   name: '线索总数',
  //   content: '通过营销任务产生的线索总数',
  //   key: 'taskLeaveCount',
  //   val: 0
  // },
  {
    name: '单场直播最高观看人数',
    content: '营销任务单场直播的最高观看人数',
    key: 'singleLiveMax',
    val: 0,
    show: systemVersion.value !== 4
  },
  {
    name: '单条视频最高播放数',
    content: '营销任务单条视频的最高播放数',
    key: 'singleVideoMax',
    val: 0,
    show: true
  }
])
getAllDataOverview({})
  .then(res => {
    if (res.code === 0) {
      headerInfo.value.forEach(item => {
        for (const key in res.data) {
          if (item.key === key) {
            item.val = res.data[key]
          }
        }
      })
    }
  })
  .catch()
  .finally()
const coreUpdateTime = ref('')
const transformUpdateTime = ref('')
const coreData = ref([
  {
    title: '视频播放数',
    key: 'cgp_play_count_target',
    val: 0,
    show: true
  },
  {
    title: '视频点赞数',
    key: 'cgp_digg_count_target',
    val: 0,
    show: true
  },
  {
    title: '视频评论数',
    key: 'cgp_comment_count_target',
    val: 0,
    show: true
  },
  {
    title: '视频分享数',
    key: 'cgp_share_count_target',
    val: 0,
    show: true
  },
  {
    title: '直播场次数',
    key: 'live_times_target',
    val: 0,
    show: systemVersion.value !== 4
  },
  {
    title: '直播观看人次',
    key: 'live_view_num_target',
    val: 0,
    show: systemVersion.value !== 4
  },
  {
    title: '直播时长（分钟）',
    key: 'live_duration_target',
    val: 0,
    show: systemVersion.value !== 4
  }
])
const transformData = ref([
  {
    title: '付款订单数',
    key: 'payment_order_count_target',
    val: 0,
    show: brandViewMode.value === 1
  },
  {
    title: '付款客户数',
    key: 'payers_num_target',
    val: 0,
    show: brandViewMode.value === 1
  },
  {
    title: '活动线索数',
    key: 'leaveinfo_num_target',
    val: 0,
    show: true
  },
  {
    title: '活动线索人数',
    key: 'leaveinfo_person_num_target',
    val: 0,
    show: true
  }
])
const timeForm1 = reactive({
  type: 7,
  timeLen: []
})
const timeForm2 = reactive({
  type: 7,
  timeLen: []
})
const currentCoreTarget = ref('cgp_play_count_target')
const currentTransformTarget = ref('payment_order_count_target')
const currentCoreTitle = ref('视频播放数')
const currentTransformTitle = ref('付款订单数')
if (brandViewMode.value === 1) {
  currentTransformTarget.value = 'payment_order_count_target'
  currentTransformTitle.value = '付款订单数'
} else {
  currentTransformTarget.value = 'leaveinfo_num_target'
  currentTransformTitle.value = '活动线索数'
}
const echartListA = ref([])
const echartListB = ref([])
const coreRank = ref([])
const transformRank = ref([])
// 修改时间--tab
function chooseTimeFun1(e) {
  timeForm1.type = e
  const nowTime = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const oldTime = new Date()
  oldTime.setTime(nowTime - (e - 1) * 24 * 60 * 60 * 1000)
  timeForm1.timeLen = [oldTime, nowTime]
  timeForm1.timeStrLen = JSON.parse(
    JSON.stringify([dateFormat(oldTime) + ' 00:00:00', dateFormat(nowTime) + ' 23:59:59'])
  )
  coreTargets(1)
}
chooseTimeFun1(7)
// 修改时间--tab
function chooseTimeFun2(e) {
  timeForm2.type = e
  const nowTime = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const oldTime = new Date()
  oldTime.setTime(nowTime - (e - 1) * 24 * 60 * 60 * 1000)
  timeForm2.timeLen = [oldTime, nowTime]
  timeForm2.timeStrLen = JSON.parse(
    JSON.stringify([dateFormat(oldTime) + ' 00:00:00', dateFormat(nowTime) + ' 23:59:59'])
  )
  coreTargets(2)
}
chooseTimeFun2(7)
// 修改时间--datepicker
function timeChange1() {
  const nowTime = new Date()
  const oldTime1 = new Date()
  const oldTime2 = new Date()
  const oldTime3 = new Date()
  const oldTime4 = new Date()
  oldTime1.setTime(nowTime - 0 * 24 * 60 * 60 * 1000)
  oldTime2.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)
  oldTime3.setTime(nowTime - 14 * 24 * 60 * 60 * 1000)
  oldTime4.setTime(nowTime - 29 * 24 * 60 * 60 * 1000)
  if (timeForm1.timeLen) {
    if (dateFormat(timeForm1.timeLen[1]) === dateFormat(nowTime)) {
      if (dateFormat(timeForm1.timeLen[0]) === dateFormat(oldTime1)) {
        timeForm1.type = 1
      } else if (dateFormat(timeForm1.timeLen[0]) === dateFormat(oldTime2)) {
        timeForm1.type = 7
      } else if (dateFormat(timeForm1.timeLen[0]) === dateFormat(oldTime3)) {
        timeForm1.type = 15
      } else if (dateFormat(timeForm1.timeLen[0]) === dateFormat(oldTime4)) {
        timeForm1.type = 30
      } else {
        timeForm1.type = null
      }
    } else {
      timeForm1.type = null
    }
  }
  timeForm1.timeStrLen = [
    dateFormat(timeForm1.timeLen[0]) + ' 00:00:00',
    dateFormat(timeForm1.timeLen[1]) + ' 23:59:59'
  ]
  coreTargets(1)
}
// 修改时间--datepicker
function timeChange2() {
  const nowTime = new Date()
  const oldTime1 = new Date()
  const oldTime2 = new Date()
  const oldTime3 = new Date()
  const oldTime4 = new Date()
  oldTime1.setTime(nowTime - 0 * 24 * 60 * 60 * 1000)
  oldTime2.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)
  oldTime3.setTime(nowTime - 14 * 24 * 60 * 60 * 1000)
  oldTime4.setTime(nowTime - 29 * 24 * 60 * 60 * 1000)
  if (timeForm2.timeLen) {
    if (dateFormat(timeForm2.timeLen[1]) === dateFormat(nowTime)) {
      if (dateFormat(timeForm2.timeLen[0]) === dateFormat(oldTime1)) {
        timeForm2.type = 1
      } else if (dateFormat(timeForm2.timeLen[0]) === dateFormat(oldTime2)) {
        timeForm2.type = 7
      } else if (dateFormat(timeForm2.timeLen[0]) === dateFormat(oldTime3)) {
        timeForm2.type = 15
      } else if (dateFormat(timeForm2.timeLen[0]) === dateFormat(oldTime4)) {
        timeForm2.type = 30
      } else {
        timeForm2.type = null
      }
    } else {
      timeForm2.type = null
    }
  }
  timeForm2.timeStrLen = [
    dateFormat(timeForm2.timeLen[0]) + ' 00:00:00',
    dateFormat(timeForm2.timeLen[1]) + ' 23:59:59'
  ]
  coreTargets(2)
}
const chooseCoreData = throttle((target, title, val) => {
  console.log('执行')
  currentCoreTitle.value = title
  currentCoreTarget.value = target
  coreTargets(1)
}, 300)
const chooseTransformData = throttle((target, title, val) => {
  currentTransformTitle.value = title
  currentTransformTarget.value = target
  coreTargets(2)
}, 300)

function coreTargets(type) {
  let time = []
  if (type === 1) {
    time = timeForm1.timeStrLen
  } else if (type === 2) {
    time = timeForm2.timeStrLen
  }
  getCoreTargets({
    target: type === 1 ? currentCoreTarget.value : currentTransformTarget.value,
    startTime: time[0],
    endTime: time[1]
  })
    .then(res => {
      if (res.code === 0) {
        if (type === 1) {
          coreUpdateTime.value = res.data.updateTime
          if (currentCoreTarget.value === 'live_duration_target') {
            res.data.chartDate.forEach(item => {
              item.cvalue = item.cvalue ? parseInt(item.cvalue / 60000) : 0
            })
          }
          echartListA.value = getOneList(res.data.chartDate)
          coreData.value.forEach(item => {
            let value = 0
            res.data.taskUserData.forEach(x => {
              if (item.key === x.ckey) {
                value = x.cvalue
                if (item.key === 'live_duration_target') {
                  value = x.cvalue ? parseInt(x.cvalue / 60000) : 0
                }
              }
            })
            item.val = value
          })
          if (res.data.rank && res.data.rank.length) {
            const bigData = res.data.rank[0].cvalue ? res.data.rank[0].cvalue : 1
            res.data.rank.forEach(item => {
              item.percent = ((item.cvalue / bigData) * 100).toFixed(2)
              if (currentCoreTarget.value === 'live_duration_target') {
                item.cvalue = item.cvalue ? parseInt(item.cvalue / 60000) : 0
              }
            })
            coreRank.value = res.data.rank
          } else {
            coreRank.value = []
          }
        }
        if (type === 2) {
          transformUpdateTime.value = res.data.updateTime
          echartListB.value = getOneList(res.data.chartDate)
          transformData.value.forEach(item => {
            res.data.taskUserData.forEach(x => {
              if (item.key === x.ckey) {
                item.val = x.cvalue
              }
            })
          })
          if (res.data.rank && res.data.rank.length) {
            const bigData = res.data.rank[0].cvalue ? res.data.rank[0].cvalue : 1
            res.data.rank.forEach(item => {
              item.percent = ((item.cvalue / bigData) * 100).toFixed(2)
            })
            transformRank.value = res.data.rank
          } else {
            transformRank.value = []
          }
        }
      }
    })
    .catch(() => {
      coreUpdateTime.value = ''
      echartListA.value = []
      coreRank.value = []
      coreData.value.forEach(item => {
        item.val = 0
      })
      transformUpdateTime.value = ''
      echartListB.value = []
      transformRank.value = []
      transformData.value.forEach(item => {
        item.val = 0
      })
    })
}
function getOneList(allList) {
  const list = []
  allList.forEach(x => {
    list.push({
      xData: x.ckey,
      yData: x.cvalue
    })
  })
  return list
}
</script>

<style lang="scss" scoped>
.part {
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
  .title_line {
    height: 72px;
    .left_box {
      height: 100%;
      display: flex;
      align-items: center;
      .title {
        font-size: 18px;
        color: #303133;
        font-weight: 600;
      }
      .time {
        margin-left: 24px;
        font-size: 14px;
        color: #909399;
      }
    }
  }
}
.operate_part {
  .title_line {
    padding: 0 24px;
  }
  .operate_data {
    padding: 0 20px 16px;
    display: flex;
    flex-wrap: wrap;
    .data_item {
      padding: 0 4px 8px;
      width: 20%;
      box-sizing: border-box;
      .data_inner {
        padding: 12px 0 0 24px;
        height: 85px;
        background: #f6f7f8;
        border-radius: 4px;
      }
      .name_tip {
        display: flex;
        align-items: center;
        .name {
          margin-right: 8px;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
        }
        img {
          width: 14px;
          height: 14px;
        }
      }
      .val {
        margin-top: 4px;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        line-height: 33px;
      }
    }
  }
}
.core_part {
  padding: 0 24px;
  .title_line {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #eceef5;
  }
  .chooseTime_box {
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
        font-family: PingFangSC-Regular, PingFang SC;
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
  .core_data {
    margin-top: 24px;
    display: flex;
    flex-wrap: wrap;
    .core_data_item {
      margin-right: 12px;
      margin-bottom: 8px;
      padding: 12px 0 0 16px;
      width: 172px;
      height: 85px;
      box-sizing: border-box;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      color: #303133;
      cursor: pointer;
      .title {
        font-size: 14px;
        line-height: 20px;
      }
      .val {
        margin-top: 4px;
        font-size: 24px;
        font-weight: 600;
        line-height: 33px;
      }
    }
    .actived {
      border: 1px solid #364fcd;
      background: #edf0ff;
      color: #364fcd;
    }
  }
  .chart_detail {
    margin-top: 24px;
    display: flex;
    // align-items: flex-end;
    .chart_box_outer {
      width: 60%;
      height: 476px !important;
      margin-top: 40px;
    }
    .table_info {
      width: 40%;
      padding-left: 48px;
      padding-bottom: 30px;
    }
  }
}
</style>

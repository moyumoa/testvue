<template>
  <div :class="{ fullScreenPage: isFullScreen }">
    <div :class="{ activity: true, activity_allHeight: isHideTopMenu }" ref="page">
      <div class="activity_left">
        <div class="calendar-container">
          <!-- 日历列表 -->
          <calendar-view
            :chooseActId="
              (rightShow == 'detailActivity' ||
                rightShow == 'dataActivity' ||
                (rightShow == 'createActivity' && openType == 'edit')) &&
              activityData.activityItem.id
                ? activityData.activityItem.id
                : null
            "
            :show-date="calendarData.showDate"
            :items="calendarData.items"
            :enable-date-selection="false"
            :selection-start="calendarData.selectionStart"
            :selection-end="calendarData.selectionEnd"
            :displayWeekNumbers="false"
            :itemTop="themeOptions.top"
            :itemContentHeight="themeOptions.height"
            :itemBorderHeight="themeOptions.border"
            :class="`theme-` + calendarData.theme"
            :currentPeriodLabel="themeOptions.currentPeriodLabel"
            class="holiday-us-traditional holiday-us-official"
            @click-item="clickLineActivity"
            @getCell="getCell"
          >
            <template #header="{ headerProps }">
              <calendar-view-header
                :header-props="headerProps"
                :previousYearLabel="themeOptions.previousYearLabel"
                :previousPeriodLabel="themeOptions.previousPeriodLabel"
                :nextPeriodLabel="themeOptions.nextPeriodLabel"
                :nextYearLabel="themeOptions.nextYearLabel"
                @input="setShowDate"
                @createActivity="cActivity"
                @changeFull="changeIsFullScreen"
              ></calendar-view-header>
            </template>
          </calendar-view>
        </div>
      </div>
      <div class="activity_right">
        <!-- 没有活动默认显示 -->
        <noActivity v-if="rightShow == 'noActivity'" />
        <!-- 新建活动         -->
        <createActivity
          v-if="rightShow == 'createActivity'"
          :time="choseTimeList"
          :type="openType"
          :activityItem="activityData.activityItem"
          :nowMouth="calendarData.showDate"
          @back="createBack"
          @createSuccess="getActivityList()"
          @choseTime="createChoseTime"
        />
        <!-- 活动列表 -->
        <listActivity
          v-if="rightShow == 'listActivity'"
          :activityList="activityList"
          @drag="listDrag"
          @changeSwitch="changeSwitch"
          @showDetail="showDetail"
        />
        <!-- 活动详情 -->
        <detailActivity
          :id="activityData.activityItem.id"
          v-if="rightShow == 'detailActivity'"
          @changeActivity="changeActivity"
          @back="detailActivityBack"
          @showData="showData"
        />
        <!-- 数据看板 -->
        <dataActivity
          v-if="rightShow == 'dataActivity'"
          :activityItem="activityData.activityItem"
          @back="rightShow = 'detailActivity'"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import noActivity from './activity_none.vue'
import createActivity from './activity_new_create.vue'
import listActivity from './activity_list.vue'
import detailActivity from './activity_detail.vue'
import dataActivity from './activity_data_board.vue'
import { activityCalendar, switchEnable, activitySort } from '@/api/market/calendar.js'
import calendarView from '../components/calender/CalendarView.vue'
import calendarViewHeader from '../components/calender/CalendarViewHeader.vue'
import { dateFormat, isNotEmpty } from '@/utils/tools.js'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
const store = useStore()
const route = useRoute()
const isHideTopMenu = store.getters.isHideTopMenu
const $message = inject('$message')
// 事件横条
const themeOptions = computed(() => {
  return {
    top: '3.65em', // 第一个距离父级顶部高度
    height: '2.15em', // 横条高度
    border: '0px'
    // previousYearLabel: '\uE5CB\uE5CB',
    // previousPeriodLabel: '\uE5CB',
    // nextPeriodLabel: '\uE5CC',
    // nextYearLabel: '\uE5CC\uE5CC',
    // currentPeriodLabel: 'Today'
  }
})

// 日历相关
const calendarData = reactive({
  showDate: new Date(),
  selectionStart: null,
  selectionEnd: null,
  theme: 'gcal',
  items: []
})
// 如果路由上有选中的活动时间请选择
const { activityStartTime, activityId } = route.query
if (isNotEmpty(activityStartTime)) {
  calendarData.showDate = new Date(activityStartTime.replace(/-/gi, '/'))
}
const activityFirstFlag = ref(true)
if (isNotEmpty(activityId)) {
  activityFirstFlag.value = true
}

// 显示月的 开始时间与结束时间
const getListTimeObj = reactive({})
// 是否全屏
const isFullScreen = ref(false)
// 右边显示控制
const rightShow = ref('noActivity')
// 选择的时间列表
const choseTimeList = ref([])
// 创建还是编辑
const openType = ref('create')
// 活动列表
const activityList = ref([])
// 活动相关
const activityData = reactive({
  activityItem: {} // 当前是哪个活动
})

// 获取从日历组件返回的 显示区域月的开始时间和结束时间
function getCell(ev) {
  getListTimeObj.start = dateFormat(ev.start, 'YYYY-MM-DD')
  getListTimeObj.end = dateFormat(ev.end, 'YYYY-MM-DD')
}
// 上下个月，今天的切换
async function setShowDate(d) {
  calendarData.showDate = d
  await getListTimeObj
  getActivityList()
}
// 全屏
function changeIsFullScreen(val) {
  isFullScreen.value = val
  if (val) {
    document.body.webkitRequestFullScreen()
  } else {
    document.webkitCancelFullScreen()
  }
}
// 点击某个活动
function clickLineActivity(activityInfo) {
  console.log('点击日历里的活动', activityInfo)
  activityData.activityItem = activityInfo
  rightShow.value = 'detailActivity'
}
// 处理事件事件为当前年-上个月-当前日
function getListTime(time) {
  const d = new Date(time)
  return Date.UTC(d.getUTCFullYear(), d.getMonth(), d.getDate())
}
// 获取传入日历的事件格式
function getRandomEvent(list) {
  // console.log('处理事件列表', list)
  if (!list || list.length === 0) return []
  // console.log(
  //   '看下排序有没有变化',
  //   list.map(item => {
  //     const { activityStartTime, activityEndTime } = item
  //     return {
  //       id: item.id,
  //       title: item.title,
  //       startDate: getListTime(activityStartTime),
  //       endDate: getListTime(activityEndTime)
  //     }
  //   })
  // )
  return list.map(item => {
    const { activityStartTime, activityEndTime } = item
    return {
      id: item.id,
      title: item.title,
      startDate: getListTime(activityStartTime),
      endDate: getListTime(activityEndTime)
    }
  })
}
// 从详情的 "数据" 进入
async function showData(id) {
  activityData.activityItem = await goActivityData(id)
  rightShow.value = 'dataActivity'
}
function goActivityData(id) {
  return (
    activityList.value.filter(item => {
      return item.id === id
    })[0] || {}
  )
}

// 创建活动
function cActivity() {
  choseTimeList.value = []
  if (openType.value === 'edit') {
    rightShow.value = null
  }
  nextTick(() => {
    openType.value = 'create'
    rightShow.value = 'createActivity'
  })
}

// 创建活动选择时间
function createChoseTime(time) {
  if (!time) return [null, null]
  const startTime = dateFormat(time[0], 'YYYY-MM-DD')
    ? dateFormat(time[0], 'YYYY-MM-DD') + ' ' + '00:00:00'
    : null
  const engTime = dateFormat(time[1], 'YYYY-MM-DD')
    ? dateFormat(time[1], 'YYYY-MM-DD') + ' ' + '23:59:59'
    : null
  choseTimeList.value = [startTime, engTime]
}

// 创建 修改的返回
function createBack() {
  if (openType.value === 'create') {
    getActivityList()
    rightShow.value = 'listActivity'
  }
  if (openType.value === 'edit') {
    rightShow.value = 'detailActivity'
  }
}
// 活动列表改变排序
function listDrag(newList) {
  // 调用接口
  // 列表的第一个元素就是顺序最高，以此类推，最后一个元素就是顺序最低
  newList = newList.map((item, index) => {
    return {
      ...item,
      priority: index + 1,
      isEnable: item.isEnable ? 1 : 0
    }
  })
  activitySort({ activityPriority: newList }).then(res => {
    if (res.code === 0) {
      // activityList.value = newList.map(item => {
      //   item = {
      //     ...item,
      //     isEnable: item.isEnable === 1
      //   }
      //   return item
      // })
      getActivityList()
    }
  })
}
// 活动列表开关
function changeSwitch(index, item) {
  switchEnable({
    id: item.id,
    isEnable: !item.isEnable ? 1 : 0,
    priority: item.priority
  }).then(res => {
    if (res.code === 0) {
      getActivityList()
    }
  })
}

// 活动详情点击修改活动
function changeActivity(item) {
  activityData.activityItem = item
  openType.value = 'edit'
  rightShow.value = 'createActivity'
}
// 去到活动详情
async function showDetail(id) {
  activityData.activityItem = await goActivityData(id)
  if (!activityData.activityItem.id) return $message.warning('无法进入活动详情')
  rightShow.value = 'detailActivity'
}
// 数据详情返回
function detailActivityBack(val) {
  rightShow.value = 'listActivity'
  if (val === 'true') {
    activityData.activityItem = {}
    getActivityList()
  }
}
// 获取活动列表
async function getActivityList() {
  // 绘制表格在这里调用
  await getListTimeObj
  const startTime = getListTimeObj.start + ' ' + '00:00:00'
  const endTime = getListTimeObj.end + ' ' + '23:59:59'
  activityCalendar({ startTime, endTime }).then(res => {
    // console.log('获取到活动日历返回res', res)
    if (res.code === 0) {
      const arr = []
      res.data.activities.forEach(item => {
        item = {
          ...item,
          isEnable: item.isEnable === 1
        }
        arr.push(item)
      })
      activityList.value = arr
      calendarData.items = getRandomEvent(arr)
      if (activityList.value.length > 0) {
        rightShow.value = 'listActivity'
      } else {
        rightShow.value = 'noActivity'
      }
      //  如果路由上有 活动Id 默认选中
      if (activityFirstFlag.value && activityId) {
        activityFirstFlag.value = false
        showDetail(activityId)
      }
    }
  })
}

getActivityList()
</script>

<style lang="scss">
.calendar-container {
  width: 100%;
  height: 100%;
  .timetable {
    margin-top: 16px;
    .tr {
      display: flex;
      width: 100%;
      .title {
        height: 56px;
        line-height: 56px;
        width: calc(100% / 7);
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #606266;
        text-indent: 20px;
      }
      .cell {
        height: 136px;
        width: calc(100% / 7);
        box-sizing: border-box;
        position: relative;
      }
      .show_day {
        display: inline-block;
        width: 28px;
        height: 28px;
        font-size: 18px;
        line-height: 28px;
        text-align: center;
        margin-top: 10px;
        margin-left: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #303133;
        white-space: nowrap;
      }
      .show_day_nowDay {
        width: 28px;
        height: 28px;
        background: #364fcd;
        border-radius: 2px;
        color: #fff;
        line-height: 28px;
        text-align: center;
        margin-top: 10px;
        margin-left: 14px;
      }
      .show_day_other_mouth {
        color: #8f939a;
      }
    }
    .title_tr {
      box-shadow: 0px 2px 6px 0px rgba(108, 108, 108, 0.15);
      .now_week {
        color: #364fcd;
      }
    }
  }

  // .selected {
  //   // background-color: #8294e7 !important;
  //   .show_day {
  //     color: #8294e7 !important;
  //   }
  // }
  .selected::after {
    content: '';
    display: block;
    width: 100%;
    height: 20px;
    box-sizing: border-box;
    // border: 1px solid #8294e7;
    background: #8294e7;
    position: absolute;
    top: 42px;
  }
}
</style>
<style lang="scss" scoped>
@import '../common/color.scss';
// --start
.activity {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  -moz-user-select: none;
  .activity_left {
    width: calc(100% - 435px);
    padding: 22px 24px;
    background: #fff;
    height: 746px;
    border-radius: 4px;
  }
  .activity_right {
    width: 423px;
    box-sizing: border-box;
    height: 746px;
    border-radius: 4px;
  }
}
.activity_allHeight {
  .activity_left,
  .activity_right {
    min-height: 746px;
    height: calc(100vh - 65px);
  }
}
.fullScreenPage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: #f6f8fa;
  padding: 16px;
  .activity {
    height: 100%;
  }
  .activity_left,
  .activity_right {
    height: 100%;
  }
}
// --end

div {
  box-sizing: border-box;
}
.calendar-container {
  .calendar_top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .top_year {
      font-size: 24px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #303133;
      line-height: 34px;
    }
  }
}
.oneLine {
  cursor: pointer;
  position: relative;
}
.has_line1,
.has_line2,
.has_line3 {
  width: 100%;
  height: 20px;
  background-color: #e9edfb;
  margin-top: 4px;
  line-height: 20px;
  box-sizing: border-box;
  .line_activity_tips {
    font-size: 12px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #8294e7;
    white-space: nowrap;
    margin-left: 12px;
    position: absolute;
    top: 0;
    z-index: 99;
  }
}
// 圆角
.isFirst {
  border-radius: 4px 0px 0px 4px;
  width: calc(100% - 8px);
  margin-left: 8px;
  // .activity_num_tips {
  //   .act_item {
  //     border-radius: 4px 0px 0px 4px;
  //     width: calc(100% - 8px);
  //     margin-left: 8px;
  //   }
  // }
}
.isEnd {
  border-radius: 0px 4px 4px 0px;
  width: calc(100% - 8px);

  // .activity_num_tips {
  //   .act_item {
  //     border-radius: 0px 4px 4px 0px;
  //     width: calc(100% - 8px);
  //   }
  // }
}
// 是不是当前点击的活动
.active_activity {
  border-top: 1px solid #8294e7;
  border-bottom: 1px solid #8294e7;
}
.active_activity_isFirst {
  border-left: 1px solid #8294e7;
}
.active_activity_isEnd {
  border-right: 1px solid #8294e7;
}
.has_line_opacity {
  height: 20px;
  background-color: rgb(255, 255, 255);
  margin-top: 4px;
  opacity: 0;
  width: 0;
}
.activity_num {
  cursor: pointer;
  position: absolute;
  left: 19px;
  bottom: 2px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #303133;
  .icon-xiala {
    font-size: 12px;
  }
}
.activity_num_tips {
  display: flex;
  flex-direction: column;
  justify-content: center;
  .act_item {
    width: 100%;
    height: 24px;
    line-height: 24px;
    border-radius: 4px;
    background-color: #e9edfb;
    color: #8294e7;
    text-align: center;
    margin-top: 6px;
  }
  .act_item_first {
    width: 50%;
  }
  .act_item_end {
    width: 50%;
  }
  .act_tit_time {
    text-align: center;
  }
}
</style>
<style>
@import '../components/calender/CSS/gcal.css';
/* @import '../components/calender/CSS/holidays-us.css'; */
</style>

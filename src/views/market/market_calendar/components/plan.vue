<template>
  <div ref="page" :class="{ calendar_page: true, fullScreenPage: $data.isFullScreen }">
    <el-calendar ref="calendar" v-model="$data.value" v-loading="$data.loading">
      <template #header="{ date }">
        <div class="one_header" style="margin-bottom: 12px">
          <div class="page_title">{{ date }}</div>
          <div class="page_header_right">
            <el-button-group>
              <el-button size="small" @click="selectDate('prev-month')">上个月</el-button>
              <el-button size="small" @click="selectDate('today')">今天</el-button>
              <el-button size="small" @click="selectDate('next-month')">下个月</el-button>
            </el-button-group>
            <el-button size="small" style="margin-left: 16px" @click="fullScreenChange">
              {{ $data.isFullScreen ? '退出全屏' : '全屏' }}
            </el-button>
          </div>
        </div>
        <div class="one_header">
          <span class="date_now" style="padding-left: 20px"></span>
          <div class="tag_box">
            <div class="one_tag">
              <span class="circle_gray"></span>
              未开启、未开始、已暂停、已关闭、已结束
            </div>
            <div class="one_tag">
              <span class="circle_blue"></span>
              进行中
            </div>
            <div class="one_tag">
              <span class="circle_orange"></span>
              未审核
            </div>
            <div class="one_tag">
              <span class="circle_red"></span>
              审核不通过
            </div>
          </div>
        </div>
      </template>
      <template #dateCell="{ data }">
        <div
          class="one_date"
          :style="
            new Date(new Date(new Date().toLocaleDateString()).getTime()) <=
            new Date(new Date(new Date(data.date).toLocaleDateString()).getTime())
              ? 'cursor:pointer'
              : 'cursor:default'
          "
          @click.stop="
            new Date(new Date(new Date().toLocaleDateString()).getTime()) <=
            new Date(new Date(new Date(data.date).toLocaleDateString()).getTime())
              ? addTask(data)
              : function () {}
          "
        >
          <p class="date_day">{{ data.day.split('-').slice(2).join('-') }}</p>
          <div v-for="(item, index) in getTaskList(data.day)" :key="index">
            <div class="date_task" v-if="item.dateTasks && item.dateTasks.length > 0">
              <div
                class="one_task"
                v-for="(x, y) in item.dateTasks.slice(0, 3)"
                :key="y"
                @click.stop="toDetail(x)"
              >
                <!-- <div
                  :class="{
                    one_circle: true,
                    circle_gray:
                      x.status === 1 ||
                      x.status === 3 ||
                      x.status === 5 ||
                      x.status === 6 ||
                      x.status === 7,
                    circle_blue: x.status === 4,
                    circle_orange: x.status === 0,
                    circle_red: x.status === 2
                  }"
                ></div> -->
                <div
                  :class="{
                    one_icon: true,
                    iconfont: true,
                    'icon-zhibo': x.type === 1,
                    'icon-live': x.type === 2,
                    'icon-tuwenrenwu': x.type === 6,
                    icon_gray:
                      x.status === 1 ||
                      x.status === 3 ||
                      x.status === 5 ||
                      x.status === 6 ||
                      x.status === 7,
                    icon_blue: x.status === 4,
                    icon_orange: x.status === 0,
                    icon_red: x.status === 2
                  }"
                ></div>
                <div class="one_title line-hidden1">
                  {{ x.name }}
                </div>
              </div>
            </div>
            <div
              class="task_num"
              v-if="item.dateTasks && item.dateTasks.length > 3"
              @click.stop="showAllList(item, data)"
            >
              共{{ item.dateTasks.length }}个任务
              <i class="iconfont icon-xiala"></i>
            </div>
          </div>
        </div>
      </template>
    </el-calendar>
    <!-- 某个日期下的任务列表弹窗 -->
    <taskDateDialog
      v-if="$data.dateDialog.show"
      :dateDialog="$data.dateDialog"
      @toDetail="toDetail"
    />
    <!-- 任务数据详情弹窗 -->
    <taskDetailDialog
      v-if="$data.detailDialog.show"
      :detailDialog="$data.detailDialog"
      @showTaskInitDialog="showTaskInitDialog"
      @updateList="updateList"
      @showDeteDialog="showDeteDialog"
    />
    <!-- 新建任务-选择类型的弹窗 -->
    <taskTypeDialog
      v-if="$data.initDialog.showOfType"
      :initDialog="$data.initDialog"
      @updateType="updateType"
    />
    <!-- 新建任务-具体内容的弹窗 -->
    <taskInitDialog
      v-if="$data.initDialog.showOfDetail"
      :initDialog="$data.initDialog"
      @updateList="updateList"
      @showDetailDialog="showDetailDialog"
    />
  </div>
</template>
<script setup>
import { list } from '@/api/market/calendar.js'
import { dateFormat, throttle } from '@/utils/tools.js'
import taskDateDialog from './task_date_dialog.vue'
import taskDetailDialog from './task_detail_dialog.vue'
import taskTypeDialog from './task_type_dialog.vue'
import taskInitDialog from './task_init_dialog.vue'

const page = ref()
const calendar = ref()
const $data = reactive({
  loading: false, // 全局loading
  value: new Date(), // 日历对应的年月日
  isFullScreen: false, // 是否全屏
  taskList: [], // 任务列表
  dateDialog: {
    show: false
  }, // 某个日期下的任务列表弹窗
  detailDialog: {
    show: false
  }, // 某个任务数据弹窗
  initDialog: {
    showOfType: false, // 是否显示选择类型的弹窗
    showOfDetail: false, // 是否显示具体内容的弹窗
    type: null, // 选择的任务类型
    startTime: '', // 哪个日期下点击的开始和结束时间就是那天
    endTime: '',
    id: null // 如果是编辑的话就填对应的ID
  } // 新建任务的弹窗
})
// 全屏的操作
function fullScreenChange() {
  if (!$data.isFullScreen) {
    document.body.webkitRequestFullScreen()
    $data.isFullScreen = true
  } else {
    document.webkitCancelFullScreen()
    $data.isFullScreen = false
  }
  // console.log('点击全屏', $data.isFullScreen)
}
// 设置日期
const selectDate = val => {
  calendar.value.selectDate(val)
  getList()
  nextTick(() => {
    setStyle()
  })
}

// 获取任务列表 calendarMode 0 日;1月; 2周;3年
function getList(calendarMode = 1, startTime, endTime) {
  return new Promise(resolve => {
    $data.loading = true
    const data = { isCalendar: 1, isCalendarData: 1 }
    data.calendarMode = calendarMode
    if (calendarMode === 1) {
      data.startTime = dateFormat($data.value).split(' ') + ' 00:00:00'
    } else if (calendarMode === 0) {
      data.startTime = dateFormat(new Date(startTime)).split(' ') + ' 00:00:00'
      data.endTime = dateFormat(new Date(endTime)).split(' ') + ' 23:59:59'
    }
    list(data)
      .then(res => {
        // console.log(res)
        if (res.code === 0) {
          if (calendarMode === 1) {
            $data.taskList = res.data || []
          } else if (calendarMode === 0) {
            const oldList = JSON.parse(JSON.stringify($data.taskList))
            const list = res.data || []
            list.forEach(x => {
              let isHave = false
              oldList.forEach((y, i) => {
                if (x.date === y.date) {
                  isHave = true
                  oldList[i].dateTasks = x.dateTasks
                }
              })
              if (!isHave) oldList.push(x)
            })
            $data.taskList = oldList
          }
        }
        $data.loading = false
        resolve()
      })
      .catch(() => {
        $data.loading = false
        resolve()
      })
  })
}
function getTaskList(date) {
  const list = $data.taskList.find(item => item.date === date)
  if (list && list.dateTasks && list.dateTasks.length > 0) {
    const showList = [] // 只展示直播和视频任务
    list.dateTasks.forEach(x => {
      // 展示直播和视频、图文任务
      if ([1, 2, 6].includes(x.type)) {
        showList.push(x)
      }
    })
    return [
      {
        date: list.date,
        dateTasks: showList
      }
    ]
  } else {
    return []
  }
}
const weekArray = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const todayTh = weekArray[new Date().getDay()] // 注意此处必须是先new一个Date
function setStyle() {
  const trList = document.getElementsByClassName('el-calendar-table__row')

  let td2 = 0
  let td1 = 0
  trList[trList.length - 2].childNodes.forEach(x => {
    if (x.className === 'next') {
      td2++
    }
  })
  trList[trList.length - 2].style = td2 > 6 ? 'display:none' : ''
  trList[trList.length - 1].childNodes.forEach(x => {
    if (x.className === 'next') {
      td1++
    }
  })

  trList[trList.length - 1].style = td1 > 6 ? 'display:none' : ''

  const thList = document.querySelector('.el-calendar-table thead').childNodes
  thList.forEach(x => {
    if (x.localName === 'th') {
      if (x.innerHTML.indexOf('周') === -1) {
        x.innerHTML = '周' + x.innerHTML
      }
      if (x.innerHTML === todayTh && new Date($data.value).getMonth() === new Date().getMonth()) {
        x.className = 'blueTh'
      } else {
        x.className = ''
      }
    }
  })
}
// 新建任务
function addTask(e) {
  // console.log(e.day)

  $data.initDialog = {
    showOfType: true, // 是否显示选择类型的弹窗
    showOfDetail: false, // 是否显示具体内容的弹窗
    startTime: e.day + ' 00:00:00',
    endTime: e.day + ' 23:59:59',
    origin: 'calendar'
  }
}
// 新建任务-选择完类型，出现填写具体内容的弹窗
function updateType(e) {
  $data.initDialog.showOfType = false
  $data.initDialog.showOfDetail = true
  $data.initDialog.type = e
}
// 任务创建或者编辑成功
function updateList(action, date) {
  // console.log('updateList,', action, date)
  getList(date ? 0 : 1, date ? date.startTime : '', date ? date.endTime : '').then(() => {
    if (action === 'showDateDialog') {
      // 如果是从任务列表弹窗打开任务详情之后，关闭任务详情弹窗，需要重新获取当日的任务并显示任务列表弹窗
      let list = []
      const list2 = []
      $data.taskList.forEach(x => {
        if (x.date === $data.dateDialog.originDate) {
          list = x.dateTasks
        }
      })
      list.forEach(x => {
        if (x.type < 3) list2.push(x)
      })
      $data.dateDialog.list = list2
      $data.dateDialog.show = true
    } else if (action === 'showDetailDialog') {
      $data.detailDialog.show = true
    }
  })
}
function showDetailDialog() {
  $data.detailDialog.show = true
}
function showDeteDialog() {
  // console.log('showDeteDialog')
  $data.dateDialog.show = true
}
// 打开任务数据弹窗
const toDetail = throttle(function (x, y) {
  // console.log('y', y)
  // console.log('x', x)
  $data.detailDialog = {
    show: true,
    id: x.id,
    origin: y === 'dateDialog' ? 'dateDialog' : 'calendar'
  }
}, 500)
// 打开任务列表的弹窗
const showAllList = throttle(function (item, data) {
  // console.log(item, data)
  const weekArray = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  const week = weekArray[new Date(data.date).getDay()] // 注意此处必须是先new一个Date
  // console.log(week)

  $data.dateDialog = {
    show: true,
    list: item.dateTasks,
    originDate: item.date,
    date: dateFormat(new Date(data.date), 'MM月DD日') + ' ' + week
  }
}, 500)

// 打开任务详情/新建任务的弹窗
function showTaskInitDialog(e) {
  // console.log('点击编辑e-->', e)
  $data.initDialog = {
    showOfType: false, // 是否显示选择类型的弹窗
    showOfDetail: true, // 是否显示具体内容的弹窗
    id: e.id || null,
    copyId: e.copyId || null,
    type: e.type,
    disEdit: e.disEdit || 0,
    origin: 'detailDialog',
    initInfo: e.initInfo || {
      timeChoseDisabled: false,
      startTime: null,
      endTime: null
    }
  }
}
onMounted(() => {
  getList()
  // 获取是否全屏
  // window.addEventListener('resize', () => {
  //   // console.log(document.body.clientWidth, page.value.clientWidth)
  //   if (
  //     document.body &&
  //     document.body.clientHeight === screen.availHeight &&
  //     document.body.clientWidth === screen.availWidth
  //   ) {
  //     // $data.isFullScreen = true
  //   } else {
  //     // $data.isFullScreen = false
  //   }
  // })

  setStyle()
})
</script>
<style lang="scss" scoped>
@import '../common/color.scss';
div {
  box-sizing: border-box;
}
.fullScreenPage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1111;
}
.calendar_page {
  border-radius: 4px;
  width: 100%;
  min-height: 100%;
  background: #fff;
  padding: 22px 24px;
  .page_title {
    font-size: 24px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #303133;
    line-height: 34px;
  }
  .date_now {
    font-size: 24px;
    font-weight: 500;
    color: #303133;
    line-height: 32px;
  }
  .tag_box {
    width: 70%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;

    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
    .one_tag {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      span {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        margin-right: 8px;
      }
    }
    .one_tag + .one_tag {
      margin-left: 24px;
    }
  }
}
:deep(.el-calendar) {
  --el-calendar-border: none;
  .blueTh {
    color: #364fcd;
  }
  .el-calendar__header {
    padding: 0px;
    display: block;
    .one_header {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .page_header_right {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
      }
    }
  }
  .el-calendar-table {
    overflow: hidden;
    thead {
      box-shadow: 0px 2px 6px 0px rgba(108, 108, 108, 0.15);
      th {
        padding: 0 0 0 19px;
        height: 56px;
      }
    }
    td {
      border-right: none;
    }
    td.is-selected {
      background-color: #f2f3f5;
    }
    tr {
      border-bottom: 1px solid #dcdee0;
    }
    .is-today {
      .date_day {
        background: #364fcd !important;
        color: #fff !important;
      }
    }
    .prev,
    .next {
      .date_day {
        color: #8f939a !important;
      }
    }
  }
}
:deep(.el-calendar-day) {
  padding: 0;
  height: 136px;
  &:hover {
    background-color: #f2f3f5;
  }
  .one_date {
    padding: 10px 12px 9px 15px;
    height: 100%;
    position: relative;
    .date_day {
      width: 28px;
      height: 28px;
      border-radius: 2px;
      text-align: center;
      line-height: 28px;
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }
  }
  .date_task {
    .one_task {
      cursor: pointer;
      margin-top: 6px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .one_circle {
        width: 5px;
        height: 5px;
        margin-right: 5px;
        border-radius: 50%;
      }

      .one_icon {
        font-size: 16px;
        margin-right: 4px;
      }
      .one_title {
        width: calc(100% - 20px);
        font-size: 12px;
        font-weight: 400;
        color: #606266;
        line-height: 17px;
        &:hover {
          color: #364fcd;
        }
      }
    }
  }
  .task_num {
    cursor: pointer;
    position: absolute;
    bottom: 9px;
    right: 12px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
    color: #364fcd;
    line-height: 17px;
    .iconfont {
      margin-left: 3px;
      font-size: 12px;
      transform: scale(0.8);
    }
  }
}
</style>

<template>
  <div class="activity">
    <div class="activity_left">
      <div class="calendar-container">
        <div class="calendar_top">
          <span class="top_year">
            {{
              `${dateData.year}年` +
              `${dateData.month < 10 ? '0' + dateData.month : dateData.month}月`
            }}
          </span>
          <div class="top_btn">
            <el-button-group>
              <el-button
                size="small"
                type="primary"
                @click="newActivity"
                style="
                  margin-right: 24px;
                  border-top-right-radius: 4px;
                  border-bottom-right-radius: 4px;
                "
              >
                创建活动
              </el-button>
              <el-button
                size="small"
                @click="lastMonth"
                style="border-top-left-radius: 2px; border-bottom-left-radius: 2px"
              >
                上个月
              </el-button>
              <el-button size="small" @click="backToday">今天</el-button>
              <el-button
                size="small"
                @click="nextMonth"
                style="border-top-right-radius: 2px; border-bottom-right-radius: 2px"
              >
                下个月
              </el-button>
              <el-button
                size="small"
                @click="fullScreen"
                style="margin-left: 24px; border-radius: 2px"
              >
                {{ isFullscreen ? '取消' : '全屏' }}
              </el-button>
            </el-button-group>
          </div>
        </div>
        <!-- 日历列表 -->
        <div
          onselectstart="return false;"
          style="z-index: 998"
          class="timetable"
          ref="timetable"
          @mouseup.stop="mouseup($event)"
          @mousedown.stop="mousedown($event)"
          @mousemove.stop="mouseover($event)"
        >
          <div class="tr title_tr">
            <div class="title" v-for="(week, wx) in dateData.weekday" :key="wx">
              {{ week }}
            </div>
          </div>
          <div class="tr" v-for="(item, i) in dateData.trList" :key="i">
            <div
              :class="[
                j.ymd === dateData.nowDay ? 'today' : '',
                'cell',
                j.selected ? 'selected' : ''
              ]"
              v-for="(j, jx) in item.children"
              :key="jx"
            >
              <div
                class="show_day"
                :class="{
                  show_day_nowDay: getCalenderDet(1, j.ymd),
                  show_day_other_mouth: getCalenderDet(3, j.ymd)
                }"
              >
                {{ getCalenderDet(2, j.ymd) }}
              </div>
              <div
                class="oneLine"
                @click="clickActivity(1, item)"
                v-for="(item, index) in activityList"
                :key="index"
                :class="[
                  showLine(j.ymd, item.activityStartTime, item.activityEndTime).showType === 0
                    ? 'has_line_opacity'
                    : `has_line${index + 1}`,
                  showLine(j.ymd, item.activityStartTime, item.activityEndTime).isFirst
                    ? 'isFirst'
                    : '',
                  showLine(j.ymd, item.activityStartTime, item.activityEndTime).isEnd
                    ? 'isEnd'
                    : '',
                  activityData.id && item.id === activityData.id && index < 3
                    ? 'active_activity'
                    : '',
                  activityData.id &&
                  item.id === activityData.id &&
                  index < 3 &&
                  showLine(j.ymd, item.activityStartTime, item.activityEndTime).isFirst
                    ? 'active_activity_isFirst'
                    : '',
                  activityData.id &&
                  item.id === activityData.id &&
                  index < 3 &&
                  showLine(j.ymd, item.activityStartTime, item.activityEndTime).isEnd
                    ? 'active_activity_isEnd'
                    : ''
                ]"
              >
                <span
                  class="line_activity_tips"
                  v-show="showName(j.ymd, item.activityStartTime) && index < 3"
                >
                  {{ item.title }}
                </span>
              </div>
              <!--                  -->
              <el-popover
                trigger="click"
                :width="300"
                popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px 12px;"
              >
                <template #reference>
                  <div
                    class="activity_num"
                    v-if="j.activityInfoList && j.activityInfoList.length > 3"
                  >
                    还有{{ j.activityInfoList && j.activityInfoList.length - 3 }}个活动
                    <i class="iconfont icon-xiala"></i>
                  </div>
                </template>
                <template #default>
                  <div class="activity_num_tips">
                    <div class="act_tit_time">{{ j.ymd.slice(5, 10) }}</div>
                    <div
                      style="cursor: pointer"
                      class="act_item"
                      :class="{
                        act_item_first: actItem(
                          j.ymd,
                          showLine(
                            j.ymd,
                            activityItem.activityStartTime,
                            activityItem.activityEndTime
                          ).showType,
                          activityItem
                        ),
                        act_item_end: activityItem.act_item_end
                      }"
                      v-for="(activityItem, activityIndex) in j.activityInfoList"
                      :key="activityIndex"
                      @click="clickActivity(2, activityItem)"
                    >
                      {{ activityItem.title }}
                    </div>
                  </div>
                </template>
              </el-popover>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="activity_right">
      <!-- 没有活动默认显示 -->
      <noActivity v-if="rightShow == 'noActivity'" />
      <!-- 新建活动 -->
      <createActivity
        v-if="rightShow == 'createActivity'"
        :time="choseTimeList"
        :type="openType"
        :activityItem="activityItem"
        @back="createBack"
        @createSuccess="createSuccess"
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
        :id="activityData.id"
        v-if="rightShow == 'detailActivity'"
        @changeActivity="changeActivity"
        @back="detailActivityBack"
        @showData="rightShow = 'dataActivity'"
      />
      <!-- 数据看板 -->
      <dataActivity
        v-if="rightShow == 'dataActivity'"
        :id="activityData.id"
        @back="rightShow = 'detailActivity'"
      />
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
import { dateFormat } from '@/utils/tools.js'

// 右边显示控制
const rightShow = ref('noActivity')
// 选择的时间列表
const choseTimeList = ref([])
// 创建还是编辑
const openType = ref('create')
// 活动列表
const activityList = ref([])
// 当前显示全部时间
const allTime = ref([])
// 活动相关
const activityData = reactive({
  id: null // 当前显示的活动id
})
const isFullscreen = ref(false)
function fullScreen() {
  const element = document.documentElement
  // 如果是全屏状态
  if (isFullscreen.value) {
    // 如果浏览器有这个Function
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  } else {
    // 如果浏览器有这个Function
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  }
  // 判断全屏状态的变量
  isFullscreen.value = !isFullscreen.value
}
// 创建活动
function newActivity() {
  clearSelected()
  choseTimeList.value = []
  choseTimeList.value.push(dateFormat(new Date(), 'YYYY-MM-DD'))
  rightShow.value = 'createActivity'
}
// 创建活动成功回调
function createSuccess() {
  getActivityList(new Date(dateData.year + '-' + dateData.month + '-01').getDay())
}
// 创建 修改的返回
function createBack() {
  if (openType.value === 'create') {
    getActivityList(new Date(dateData.year + '-' + dateData.month + '-01').getDay())
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
      activityList.value = newList.map(item => {
        item = {
          ...item,
          isEnable: item.isEnable === 1
        }
        return item
      })
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
      getActivityList(new Date(dateData.year + '-' + dateData.month + '-01').getDay())
    }
  })
}
const activityItem = ref([])
// 活动详情点击修改活动
function changeActivity(item) {
  activityItem.value = item
  openType.value = 'edit'
  rightShow.value = 'createActivity'
}
// 去到活动详情
function showDetail(id) {
  clearSelected()
  activityData.id = id
  rightShow.value = 'detailActivity'
}
// 数据详情返回
function detailActivityBack(val) {
  rightShow.value = 'listActivity'
  if (val === 'true') {
    getActivityList(new Date(dateData.year + '-' + dateData.month + '-01').getDay())
  }
}
// 点击一个活动，目前不做操作
function clickActivity(type, item) {
  clearSelected()
  activityData.id = item.id
  rightShow.value = 'detailActivity'
  // 给点击的活动加上样式
}

// 将yyyy-mm-dd hh-mm-ss格式时间转化为时间戳
function timeToTimestamp(time) {
  if (!time) return time
  return Date.parse(new Date(time))
}
function showName(now, start) {
  return (
    timeToTimestamp(dateFormat(new Date(now), 'YYYY-MM-DD')) ===
    timeToTimestamp(dateFormat(new Date(start), 'YYYY-MM-DD'))
  )
}
// 判断是否需要显示横线
function showLine(nowDate, activityStartTime, activityEndTime) {
  const showLine = ref(false) // 是否显示横线
  const showType = ref(0) // 显示横线类型 0 白色占位（看不到） 1 彩色
  const isFirst = ref(false) // 是不是活动第一个，显示圆角
  const isEnd = ref(false) // 是不是活动最后一个，显示圆角

  nowDate = timeToTimestamp(nowDate)
  activityStartTime = timeToTimestamp(activityStartTime.slice(0, 10))
  activityEndTime = timeToTimestamp(activityEndTime.slice(0, 10))

  if (activityEndTime > nowDate) {
    showLine.value = false
  }
  if (nowDate >= activityStartTime && nowDate <= activityEndTime) {
    showLine.value = true
    showType.value = 1
  }
  if (nowDate < activityStartTime) {
    showLine.value = true
    showType.value = 0
  }

  isFirst.value = nowDate === activityStartTime && showType.value === 1
  isEnd.value = nowDate === activityEndTime && showType.value === 1

  return {
    showLine: showLine.value,
    showType: showType.value,
    isFirst: isFirst.value,
    isEnd: isEnd.value
  }
}
// 判断 弹窗显示时，当天时间是否是活动开始时间或活动结束时间
function actItem(oneDay, showType, activityItem) {
  console.log('oneDay', oneDay)
  console.log('showType', showType)
  console.log('activityItem', activityItem)
}

// 日历相关 --start
const dateData = reactive({
  // 定义行数、列数和天数
  hang: 6,
  lie: 7,
  days: 30,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  day: new Date().getDate(),
  // 鼠标按下和抬起的坐标
  startX1: 0,
  startY1: 0,
  endX1: 0,
  endY1: 0,
  flag: false,
  weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  trList: [],
  nowDay: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`,
  activityStartTime: '',
  activityEndTime: ''
})

// 判断润年
function isLeapYear(year) {
  if ((year % 0 === 0 && year % 100 !== 0) || year % 400 === 0) return true // 2月份29日
  return false
}

// 获取天数
function getDays() {
  if (dateData.month === 2) {
    dateData.days = 28
    if (isLeapYear(dateData.year)) dateData.days = 29
  } else if ([1, 3, 5, 7, 8, 10, 12].indexOf(parseInt(dateData.month)) !== -1) {
    dateData.days = 31
  } else {
    dateData.days = 30
  }
  return dateData.days
}
getDays()

function getDay1(m, y) {
  let d
  if (m === 2) {
    d = 28
    if (isLeapYear(y)) m = 29
  } else if ([1, 3, 5, 7, 8, 10, 12].indexOf(parseInt(m)) !== -1) {
    d = 31
  } else {
    d = 30
  }
  return { d, m }
}
// 上个月
function lastMonth() {
  if (dateData.month === 1) {
    dateData.month = 12
    dateData.year = dateData.year - 1
  } else {
    dateData.month = dateData.month - 1
  }
  getActivityList(new Date(dateData.year + '-' + dateData.month + '-01').getDay())
}
// 下个月
function nextMonth() {
  if (dateData.month === 12) {
    dateData.month = 1
    dateData.year = dateData.year + 1
  } else {
    dateData.month = dateData.month + 1
  }
  getActivityList(new Date(dateData.year + '-' + dateData.month + '-01').getDay())
}
// 今天
function backToday() {
  dateData.year = new Date().getFullYear()
  dateData.month = new Date().getMonth() + 1
  getActivityList(new Date(dateData.year + '-' + dateData.month + '-01').getDay())
}
// 找到日历显示细节 -- 1当天背景 2判断是不是每个月1号
function getCalenderDet(type, jmd) {
  if (type === 1) {
    const today = dateFormat(new Date(), 'YYYY-MM-DD')
    return today === jmd
  }
  if (type === 2) {
    const day = jmd.slice(8, 10)
    if (day === '01') {
      const m = new Date(jmd).getMonth() + 1
      return `${m}月1日`
    } else {
      return day
    }
  }
  if (type === 3) {
    // 当前显示的所有月份
    const m = new Date(jmd).getMonth() + 1
    const nowM = dateData.month
    return !(m === nowM)
  }
}

const timetable = ref('')
function drawTable(ind) {
  // console.log(ind, 'ind')
  const allTimeArr = []
  for (let i = 0; i < dateData.hang; i++) {
    const dateDataTrListChildrenArr = []
    dateData.trList.push({ id: i, children: [] })
    for (let j = 0; j < dateData.lie; j++) {
      const text = i * dateData.lie + j - ind + 1
      let nodeText
      let ymd = ''
      if (text <= 0) {
        let m
        if (dateData.month === 1) {
          m = 12
        } else {
          m = dateData.month - 1
        }
        let y = dateData.year
        if (dateData.month === 1) y = dateData.year - 1
        const obj = getDay1(m, y)
        const d = obj.d
        nodeText = d + text
        ymd = dateFormat(new Date(`${y}-${m}-${d + text}`), 'YYYY-MM-DD')
        allTimeArr.push(ymd)
        nodeText = text
      } else if (text > 0 && text <= dateData.days) {
        ymd = dateFormat(new Date(`${dateData.year}-${dateData.month}-${text}`), 'YYYY-MM-DD')
        allTimeArr.push(ymd)
      } else if (text > dateData.days) {
        nodeText = text - dateData.days
        // console.log(text, dateData.days, 'nodeText')
        let y = dateData.year
        let m = dateData.month + 1
        if (dateData.month === 12) {
          y = dateData.year + 1
          m = 1
        }
        ymd = dateFormat(new Date(`${y}-${m}-${text - dateData.days}`), 'YYYY-MM-DD')
        allTimeArr.push(ymd)
      }
      dateDataTrListChildrenArr.push({
        day: nodeText,
        ymd
      })
    }
    dateData.trList[i].children = dateDataTrListChildrenArr
  }
  allTime.value = allTimeArr
  // console.log(dateData.trList, 'dateData.trList')
}
// 监听鼠标按下
function mousedown(e) {
  // console.log('down', e)
  dateData.startX1 = e.x
  dateData.startY1 = e.y
  dateData.flag = true
}
// 监听鼠标抬起
async function mouseup(e) {
  dateData.flag = false
  const selectArr = select(e.x, e.y)
  console.log('选择时间返回', selectArr)
  // 显示创建活动，滑动一天也要创建
  if (selectArr.length === 0) return
  if (selectArr.length === 1) {
    choseTimeList.value = selectArr
  }
  if (selectArr.length > 1) {
    choseTimeList.value = [selectArr[0], selectArr[selectArr.length - 1]]
  }
  console.log('时间 choseTimeList.value', choseTimeList.value)
  rightShow.value = 'createActivity'
}
// 监听鼠标移动
function mouseover(e) {
  // 判断鼠标是不是为按压状态
  if (!dateData.flag) return
  select(e.x, e.y)
}

// 选择区间
function select(x, y) {
  dateData.endX1 = x
  dateData.endY1 = y
  // 获取小格子的宽高、表格的宽高
  const cell = document.getElementsByClassName('cell')[0]
  const cellH = cell.offsetHeight
  const cellW = cell.offsetWidth
  const tableL = timetable.value.getBoundingClientRect().left
  const tableT = timetable.value.getBoundingClientRect().top + 56

  let startX = dateData.startX1
  let startY = dateData.startY1
  let endX = dateData.endX1
  let endY = dateData.endY1
  if (
    dateData.startY1 > dateData.endY1 ||
    (dateData.startY1 === dateData.endY1 && dateData.startX1 > dateData.endX1)
  ) {
    startX = dateData.endX1
    startY = dateData.endY1
    endX = dateData.startX1
    endY = dateData.startY1
  }

  // 转换为数组下标
  const indsx = Math.max(Math.floor((startX - tableL) / cellW), 0)
  const indsy = Math.max(Math.floor((startY - tableT) / cellH), 0)
  const index = Math.min(Math.floor((endX - tableL) / cellW), dateData.lie - 1)
  const indey = Math.min(Math.floor((endY - tableT) / cellH), dateData.hang)
  // console.log('indsx', indsx) // 向右 X方向的index
  // console.log('indsy', indsy) // 向上 Y的index
  // console.log('index', index) // 向右 横向index
  // console.log('indey', indey) // 向下 Y的index
  // 判断移动距离，如果没有离开盒子，就不执行
  // 相等就是点击，没有移动
  if (dateData.startX1 === dateData.endX1 && dateData.startY === dateData.endY) {
    return []
  }
  if (Math.abs(dateData.startX1 - dateData.endX1) < 10) return []
  // if (dateData.endX1 - dateData.startX1 > 0) {
  //   // 向右
  //   if (dateData.endX1 - dateData.startX1 < cellW * (indsx + 1) - dateData.startX1) return []
  // }
  // if (dateData.endX1 - dateData.startX1 < 0) {
  //   // 向左
  //   if (dateData.startX1 - dateData.endX1 < dateData.startX1 - cellW * (indsx + 1)) return []
  // }
  if (dateData.startY1 - dateData.endY1 < 0) {
    // 向下
    if (dateData.endY1 - dateData.startY1 < cellH * (indey + 1) - dateData.startY1) return []
  }
  if (dateData.startY1 - dateData.endY1 > 0) {
    // 向上
    if (dateData.startY1 - dateData.endY1 > dateData.startY1 - cellH * indsy) return []
  }
  const showText = []

  // 循环找出当前选中的区域并做上标记，并将未选中的区域标记去除
  for (let i = 0; i < dateData.trList.length; i++) {
    const td = dateData.trList[i].children
    for (let j = 0; j < td.length; j++) {
      if (indsx < 0 || indsy < 0 || index < 0 || indey < 0) return
      dateData.activityStartTime = dateData.trList[indsy].children[indsx].ymd
      dateData.activityEndTime = dateData.trList[indey].children[index].ymd
      const start = new Date(dateData.trList[indsy].children[indsx].ymd).getTime()
      const end = new Date(dateData.trList[indey].children[index].ymd).getTime()
      const now = new Date(td[j].ymd).getTime()
      if (now >= start && now <= end) {
        // if (td[j].innerText.length === 0) continue
        if (i >= 0) td[j].selected = true
        if (i >= 0) showText.push(td[j].ymd)
      } else {
        td[j].selected = false
      }
    }
  }
  // console.log('选择返回', showText.join('、'))
  return showText
}
// 去除日历得选择
function clearSelected() {
  console.log(dateData.trList, 'dateData.trList.length')
  dateData.trList.forEach(cellItem => {
    cellItem.children.forEach(dateItem => {
      dateItem.selected = false
    })
  })
}
// 日历相关 --end

// 获取活动列表
async function getActivityList(date) {
  // console.log('接收的日期', date)
  // 绘制表格在这里调用
  await drawTable(date)
  // console.log(allTime.value, 'allTime.value')
  const startTime = allTime.value[0] + ' ' + '00:00:00'
  const endTime = allTime.value[allTime.value.length - 1] + ' ' + '23:59:59'
  activityCalendar({ startTime, endTime }).then(res => {
    console.log('获取到活动日历返回res', res)
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
      if (activityList.value && activityList.value.length > 0) {
        // 有列表就显示
        dateData.trList.forEach((trListItem, index) => {
          trListItem.children.forEach(oneDay => {
            const activityInfoList = []
            // 最后要操作oneDay，给每一天添加活动信息
            activityList.value.forEach(activityItem => {
              // 活动的开始时间，活动的结束时间
              const { activityStartTime, activityEndTime } = activityItem
              const temp = {
                activityStartTime: new Date(activityStartTime.slice(0, 10)).getTime(),
                activityEndTime: new Date(activityEndTime.slice(0, 10)).getTime(),
                oneDay: new Date(oneDay.ymd).getTime()
              }
              if (temp.oneDay >= temp.activityStartTime && temp.oneDay <= temp.activityEndTime) {
                activityInfoList.push(activityItem)
              }
              oneDay.activityInfoList = activityInfoList
            })
          })
        })
        rightShow.value = 'listActivity'
      } else {
        // 不然就显示空状态
        rightShow.value = 'noActivity'
      }
    }
  })
}
getActivityList(new Date(dateData.year + '-' + dateData.month + '-01').getDay())
</script>

<style lang="scss">
.calendar-container {
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
  }
  .activity_right {
    width: 423px;
    box-sizing: border-box;
    height: 100%;
    // padding: 20px;
    background: #fff;
    height: 966px;
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

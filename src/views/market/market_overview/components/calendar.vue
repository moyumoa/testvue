<template>
  <div class="calendar_page">
    <div class="calendar_title">
      <div>营销计划</div>
      <el-link type="primary" v-if="showLink" @click="toPage">查看详细计划</el-link>
    </div>
    <el-calendar ref="calendar" v-model="value" v-loading="loading">
      <template #header="{ date }">
        <div class="calendar_top">
          <div class="top_left">
            <el-button
              plain
              :icon="transElIconName('DArrowLeft')"
              size="small"
              @click="selectDate('prev-year')"
            ></el-button>
            <el-button
              plain
              :icon="transElIconName('ArrowLeft')"
              size="small"
              @click="selectDate('prev-month')"
            ></el-button>
          </div>
          <div class="top_center">{{ date }}</div>
          <div class="top_right">
            <el-button
              plain
              :icon="transElIconName('ArrowRight')"
              size="small"
              @click="selectDate('next-month')"
            ></el-button>
            <el-button
              plain
              :icon="transElIconName('DArrowRight')"
              size="small"
              @click="selectDate('next-year')"
            ></el-button>
          </div>
        </div>
      </template>
      <template #dateCell="{ data }">
        <div class="one_date">
          <p>{{ data.day.split('-').slice(2).join('-') }}</p>
          <div :class="getCircle(data.day)"></div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>
<script setup>
import { list } from '@/api/market/calendar.js'
import { transElIconName, dateFormat } from '@/utils/tools'
import { useRouter } from 'vue-router'
// import { useStore } from 'vuex'

// const store = useStore()
const router = useRouter()
const value = ref(new Date())
const loading = ref(false)
const taskList = ref([]) // 任务列表
const calendar = ref()
const selectDate = val => {
  calendar.value.selectDate(val)
  getList()
  nextTick(() => {
    setStyle()
  })
}
function toPage() {
  router.push('/content_market/market_calendar')
}
// 获取某个月的任务列表
function getList() {
  loading.value = true
  list({
    startTime: dateFormat(value.value).split(' ') + ' 00:00:00',
    isCalendar: 1,
    calendarMode: 1,
    isCalendarData: 1
  })
    .then(res => {
      if (res.code === 0) {
        taskList.value = res.data
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
function getCircle(date) {
  const list = taskList.value.find(item => item.date === date)
  if (list && list.dateTasks && list.dateTasks.length > 0) {
    const showList = []
    list.dateTasks.forEach(x => {
      if (x.type < 3) {
        showList.push(x)
      }
    })
    return showList.length > 0 ? 'circle circle_blue' : 'circle'
  } else {
    return 'circle '
  }
}
function setStyle() {
  // 如果一排都是下个月的就隐藏
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
}
// 根据菜单营销计划来判断是否显示跳转入口
const showLink = computed(() => {
  const systemModule = sessionStorage.getItem('systemModule')
  return systemModule.includes('market:task:calendar')
})
onMounted(() => {
  getList()
  setStyle()
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.calendar_page {
  background: #fff;
  margin-bottom: 8px;
  border-radius: 4px;
  padding: 22px 24px 18px;
  .calendar_title {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 16px;
    border-bottom: 1px solid #eceef5;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 1.5;
    div {
      line-height: 25px;
    }
  }
  .calendar_top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .top_left {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
    .top_right {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }
  }
  .one_date {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    p {
      width: 24px;
      height: 24px;
      border-radius: 2px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .circle {
      margin-top: 3px;
      width: 5px;
      height: 5px;
      border-radius: 100%;
      background: #fff;
      border: 1px solid #fff;
    }
    .circle_blue {
      background: #364fcd;
      border: 1px solid #364fcd;
    }
  }
}
:deep(.el-button) {
  padding: 0;
  border: none;
}
:deep(.el-calendar__header) {
  border-bottom: none;
  padding: 10px 47px 6px;
}
:deep(.el-calendar__body) {
  padding: 0 5px;
}
:deep(.el-calendar-table td) {
  border: none !important;
  background-color: transparent !important;
}
:deep(.el-calendar-table .el-calendar-day) {
  height: 37px !important;
  padding: 0 !important;
}
:deep(.el-calendar-table thead th) {
  text-align: center;
  padding: 5px 0;
}
:deep(.el-calendar-table .el-calendar-day:hover) {
  cursor: default !important;
  background-color: transparent !important;
}
:deep(.is-today .one_date p) {
  color: #fff;
  background: #364fcd;
}
</style>

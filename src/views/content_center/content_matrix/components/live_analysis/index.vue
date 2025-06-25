<template>
  <div class="liveAnalysis_wrap">
    <!-- 直博数据预览 -->
    <div class="data_overview">
      <div class="title_wrap">
        <h4>直播数据概览</h4>
        <div class="time_wrap">
          <div class="date_table">
            <span
              :class="dateTabValue === item.value ? 'active' : ''"
              @click="changeDateTab(item)"
              v-for="(item, index) in dateTable"
              :key="index"
            >
              {{ item.label }}
            </span>
          </div>
          <div class="item_content">
            <el-date-picker
              :unlink-panels="true"
              v-model="daterangeArray"
              @change="changDaterange"
              style="width: 250px"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :disabled-date="
                time => {
                  let curDate = new Date().getTime()
                  let three = 60 * 24 * 3600 * 1000
                  let threeMonths = curDate - three
                  return (
                    time.getTime() > Date.now() - 24 * 60 * 60 * 1000 ||
                    time.getTime() < threeMonths
                  )
                }
              "
            ></el-date-picker>
          </div>
        </div>
      </div>
      <ul class="task_list">
        <template v-for="(item, index) in overviewList" :key="index">
          <li
            class="task_item"
            v-if="item.show"
            :style="{
              width: brandViewMode === 1 ? '20%' : '25%'
            }"
          >
            <h4>
              <template v-if="!(brandViewMode === 2 && item.name === '直播场次')">
                {{ item.value1 }}/{{ item.value2 }}
              </template>
              <template v-else>{{ item.value1 }}</template>
            </h4>
            <span>{{ item.name }}</span>
          </li>
        </template>
      </ul>
    </div>
    <!-- 累计观看人次 -->
    <div class="lineEcharts_wrap">
      <h4 class="title">累计观看人次</h4>
      <lineChart
        v-if="ismounted"
        ref="lineChartBox"
        :id="'lineChart' + type"
        :type="'累计观看人次'"
        :data="onlineChart.value"
      ></lineChart>
    </div>
    <div class="echarts_wrap">
      <!-- 直播开播时间 -->
      <div class="barEcharts_wrap">
        <h4 class="title">直播开播时间</h4>
        <barChart
          :id="'lineChart' + type"
          :data="starLiveChart.value"
          :name="'开播频次'"
        ></barChart>
      </div>
      <!-- 直播时长分布 -->
      <div class="pieEcharts_wrap">
        <h4 class="title">直播时长分布</h4>
        <pieChart
          :id="'pieChart' + type"
          :data="liveDurationChart.value"
          :pieUnit="'场'"
        ></pieChart>
      </div>
    </div>
    <!-- 直播列表 -->
    <div class="table_wrap">
      <div class="table_title">
        <span>直播列表</span>
        <div class="search_item">
          <div class="item_content">
            <el-input
              v-model="roomTitle"
              maxlength="14"
              placeholder="请输入直播标题"
              :prefix-icon="transElIconName('Search')"
            ></el-input>
          </div>
          <el-button type="primary" @click="searchRoom">查询</el-button>
        </div>
      </div>
      <xm_table
        class="pic_table"
        v-loading="tableState.loading"
        :data="tableState.listData"
        v-model:page="tableState.page"
        @getTableData="getLiveTableList"
      >
        <el-table-column label="直播内容" prop="name" min-width="322">
          <template #default="scope">
            <div class="content_wrap">
              <el-image
                class="live_img"
                v-if="scope.row.roomPhoto"
                :src="scope.row.roomPhoto ? scope.row.roomPhoto : coverImg"
                alt=""
              >
                <template #error>
                  <div class="live_img errImg_box"></div>
                </template>
              </el-image>
              <img v-else src="@/assets/images/content_center/default_cover.png" alt />
              <p>{{ scope.row.roomTitle }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="开播时间" prop="createTime" min-width="194">
          <template #default="scope">{{ scope.row.createTime || 0 }}</template>
        </el-table-column>
        <el-table-column label="直播时长" prop="liveDurationTimeStr" min-width="128">
          <template #default="scope">{{ scope.row.liveDurationTimeStr || 0 }}</template>
        </el-table-column>
        <el-table-column label="观看人次" prop="watchTimes" min-width="128">
          <template #default="scope">{{ wanSliceFormat(scope.row.watchTimes || 0) }}</template>
        </el-table-column>
        <el-table-column label="观看峰值" prop="maxOnlineNum" min-width="136">
          <template #default="scope">{{ wanSliceFormat(scope.row.maxOnlineNum || 0) }}</template>
        </el-table-column>
        <el-table-column label="销量" prop="sellNum" min-width="102" v-if="brandViewMode === 1">
          <template #default="scope">{{ wanSliceFormat(scope.row.sellNum || 0) }}</template>
        </el-table-column>
        <el-table-column
          label="销售额"
          prop="sellAmount"
          min-width="104"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">{{ wanSliceFormat(scope.row.sellAmount || 0) }}</template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          min-width="120"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            <el-link type="primary" @click="toDetails(scope.row)">详情</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { nextTick } from 'vue'
import { dateFormat, transElIconName, wanSliceFormat } from '@/utils/tools.js'
import { timeSecond, getDays, getDaysBetween } from '../js/setCharts.js'
import api from '@/api/content_center/content_matrix.js'
import coverImg from '@/assets/images/content_center/cover.jpg'
import { useRouter } from 'vue-router'
import lineChart from '../../../components/line_chart.vue'
import barChart from '../../components/bar_echarts.vue'
import pieChart from '../../components/pie_echarts.vue'
import { useStore } from 'vuex'
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const props = defineProps({
  openId: {
    type: String,
    default: () => ''
  }
})
const roomTitle = ref('')
const ismounted = ref(false)
nextTick(() => {
  ismounted.value = true
})
// 日期选择
const type = ref('matrixLive')
const dateTabValue = ref(2)
const daterangeArray = ref([])

// 日期切换
const dateTable = reactive([
  { label: '昨天', value: 2 },
  { label: '近7天', value: 7 },
  { label: '近15天', value: 15 },
  { label: '近30天', value: 30 }
])
const changeDateTab = item => {
  dateTabValue.value = item.value
  const nowTime = new Date()
  const oldTime = new Date()
  nowTime.setTime(new Date() - 1 * 24 * 3600 * 1000)
  oldTime.setTime(new Date() - item.value * 24 * 3600 * 1000)
  if (item.value === 2) {
    oldTime.setTime(new Date() - (item.value - 1) * 24 * 3600 * 1000)
    nowTime.setTime(new Date() - (item.value - 1) * 24 * 3600 * 1000)
  }
  daterangeArray.value = JSON.parse(
    JSON.stringify([dateFormat(oldTime) + ' 00:00:00', dateFormat(nowTime) + ' 23:59:59'])
  )
  getLiveDateStat()
  getLiveDateChart()
  getLiveTableList()
}
function changDaterange() {
  const nowTime = new Date()
  const oldTime1 = new Date()
  const oldTime2 = new Date()
  const oldTime3 = new Date()
  const oldTime4 = new Date()
  nowTime.setTime(new Date() - 1 * 24 * 60 * 60 * 1000)
  oldTime1.setTime(new Date() - 1 * 24 * 60 * 60 * 1000)
  oldTime2.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)
  oldTime3.setTime(nowTime - 14 * 24 * 60 * 60 * 1000)
  oldTime4.setTime(nowTime - 29 * 24 * 60 * 60 * 1000)
  if (daterangeArray.value) {
    if (dateFormat(daterangeArray.value[1]) === dateFormat(nowTime)) {
      if (dateFormat(daterangeArray.value[0]) === dateFormat(oldTime2)) {
        dateTabValue.value = 7
      } else if (dateFormat(daterangeArray.value[0]) === dateFormat(oldTime3)) {
        dateTabValue.value = 15
      } else if (dateFormat(daterangeArray.value[0]) === dateFormat(oldTime4)) {
        dateTabValue.value = 30
      } else if (dateFormat(daterangeArray.value[0]) === dateFormat(oldTime1)) {
        dateTabValue.value = 2
      } else {
        dateTabValue.value = null
      }
    } else {
      dateTabValue.value = null
    }
  }
  daterangeArray.value = [
    dateFormat(daterangeArray.value[0]) + ' 00:00:00',
    dateFormat(daterangeArray.value[1]) + ' 23:59:59'
  ]
  getLiveDateStat()
  getLiveDateChart()
  getLiveTableList()
}

// 直播数据概览
const overviewList = ref([])
function getLiveDateStat() {
  const data = {
    dyOpenId: props.openId,
    endTime: daterangeArray.value[1],
    startTime: daterangeArray.value[0]
  }
  api.getLiveDateStat(data).then(res => {
    overviewList.value = [
      brandViewMode.value === 1
        ? {
            name: '直播场次/带货场次',
            value1: wanSliceFormat(res.data.siteCount || 0),
            value2: wanSliceFormat(res.data.saleSiteCount || 0),
            show: true
          }
        : {
            name: '直播场次',
            value1: wanSliceFormat(res.data.siteCount || 0),
            value2: null,
            show: true
          },
      {
        name: '销售额/场均销售额',
        value1: '￥' + wanSliceFormat(res.data.saleAmount || 0),
        value2: '￥' + wanSliceFormat(res.data.avgSaleAmount || 0),
        show: brandViewMode.value === 1
      },
      {
        name: '观看人次/场均观看',
        value1: wanSliceFormat(res.data.sumTimes || 0),
        value2: wanSliceFormat(res.data.avgTimes || 0),
        show: true
      },
      {
        name: '直播时长/场均时长',
        value1: `${timeSecond(res.data.sumDura / 1000 || 0, '', false)}`,
        value2: `${timeSecond(res.data.avgDura / 1000 || 0, '', false)}`,
        show: true
      },
      {
        name: '观看峰值最高值/中位数',
        value1: wanSliceFormat(res.data.max || 0),
        value2: wanSliceFormat(res.data.middle || 0),
        show: true
      }
    ]
  })
}

// 直播分析 直播数据图表
// const durationList = reactive([
//   { name: '<1小时', value: 0 },
//   { name: '1-2小时', value: 0 },
//   { name: '2-3小时', value: 0 },
//   { name: '3-4小时', value: 0 },
//   { name: '>4小时', value: 0 }
// ])
const intervalNum = ref(1)
function getLiveDateChart() {
  const data = {
    dyOpenId: props.openId,
    endTime: daterangeArray.value[1],
    startTime: daterangeArray.value[0]
  }
  api.getLiveDateChart(data).then(res => {
    liveDurationChart.value = []
    onlineChart.value = []
    starLiveChart.value = []
    // 直播时长分布
    res.data.liveDurationChart.forEach(item => {
      if (item.xaxis === 1) {
        item.xaxis = '<1小时'
      } else if (item.xaxis === 2) {
        item.xaxis = '1-4小时'
      } else if (item.xaxis === 3) {
        item.xaxis = '4-8小时'
      } else if (item.xaxis === 4) {
        item.xaxis = '8-12小时'
      } else if (item.xaxis === 5) {
        item.xaxis = '>12小时'
      }
      liveDurationChart.value.push({ xData: item.xaxis, yData: item.num })
    })
    // 累计观看人次
    // res.data.onlineChart.forEach(item => {
    //   onlineChart.value.push({ xData: item.xaxis, yData: item.num })
    // })
    // 1、先拿到开始和结束时间差了几天
    const st = daterangeArray.value[0].replace(/-/g, '/')
    const et = daterangeArray.value[1].replace(/-/g, '/')
    const seN = getDaysBetween(st, et)
    intervalNum.value = seN
    // 2、然后计算开始和结束时间这个范围的日期
    const dayLen = getDays(seN + 1, et)

    // 3、循环填数据
    dayLen.forEach(x => {
      let data1 = 0
      res.data.onlineChart.forEach(y => {
        if (x === y.xaxis) {
          data1 = y.num
        }
      })
      onlineChart.value.unshift({
        xData: x.substring(5),
        yData: data1
      })
    })
    // 直播开始时间
    // res.data.starLiveChart.forEach(item => {
    //   starLiveChart.value.push({ xData: item.xaxis, yData: item.num })
    // })
    //  计算开播时间
    for (let i = 0; i <= 24; i++) {
      const timeNum = i < 10 ? '0' + i : `${i}`
      let num = 0
      for (let y = 0; y < res.data.starLiveChart.length; y++) {
        const yy = res.data.starLiveChart[y].xaxis.substring(0, 2)
        if (timeNum === yy) {
          num = res.data.starLiveChart[y].num
        }
      }
      starLiveChart.value.push({
        xData: timeNum + ':00',
        yData: num
      })
    }
  })
}

// echarts
// 直播时长
const liveDurationChart = reactive([])
// 累计观看趋势
const onlineChart = reactive([])
// 开播时间
const starLiveChart = reactive([])
// table列表
const tableState = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 10
  }
})
function getLiveTableList() {
  const data = {
    openId: props.openId,
    roomTitle: roomTitle.value,
    liveStartTimeFrom: daterangeArray.value[0],
    liveStartTimeTo: daterangeArray.value[1],
    orderSetting: 'DESC:live_start_time',
    pageSize: tableState.page.size,
    pageNo: tableState.page.index
  }
  api.getLiveTableList(data).then(res => {
    // console.log(res)
    tableState.listData = res.data.records
    tableState.page.total = res.data.total
  })
}
// 搜索房间
function searchRoom() {
  getLiveTableList()
}
// 跳转详情
const router = useRouter()
function toDetails(item) {
  router.push({
    path: '/content_center/live_center/detail',
    query: {
      roomId: item.roomId,
      dyOpenId: props.openId
    }
  })
}
onMounted(() => {
  changeDateTab({ label: '昨天', value: 2 })
})
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>

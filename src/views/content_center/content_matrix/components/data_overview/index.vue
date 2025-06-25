<template>
  <div class="date_overview">
    <!-- <div class="taskStatus_wrap">
      <h4 class="titel">任务状态</h4>
      <ul class="task_list">
        <li class="task_item" v-for="item in taskList" :key="index">
          <h4>{{ item.value }}</h4>
          <span>{{ item.name }}</span>
        </li>
      </ul>
    </div> -->
    <div class="taskStatus_wrap liveStatus_wrap" v-if="props.platform != 'sph'">
      <div class="titel_wrap">
        <h4>近30天直播概览</h4>
        <p>最新直播：</p>
        <template v-if="liveList && liveList.roomId">
          <b @click="toLiveDetails(liveList)">{{ liveList.titel || '--' }}</b>
          <img src="@/assets/images/content_center/time_icon.png" alt="" />
          <span>{{ liveList.siteTime }}</span>
        </template>
        <div style="color: #909399" v-else>--</div>
      </div>
      <ul class="live_list">
        <template v-for="(item, index) in liveList.array" :key="index">
          <li
            class="live_item"
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
    <div class="taskStatus_wrap videoStatus_wrap" v-if="props.platform != 'sph'">
      <div class="titel_wrap">
        <h4>近30天视频概览</h4>
        <p>最新视频：</p>
        <template v-if="videoList && videoList.dyItemId">
          <b @click="playVideo(videoList)">{{ videoList.title || '--' }}</b>
          <img src="@/assets/images/content_center/time_icon.png" alt="" />
          <span>
            {{
              videoList.time
                ? dateFormat(new Date(videoList.time), (format = 'YYYY-MM-DD hh:mm:ss'))
                : ''
            }}
          </span>
        </template>
        <div style="color: #909399" v-else>--</div>
      </div>
      <ul class="video_list">
        <template v-for="(item, index) in videoList.records" :key="index">
          <li
            class="video_item"
            v-if="item.show"
            :style="{
              width: brandViewMode === 1 ? '14.2%' : '20%'
            }"
          >
            <h4>{{ item.value }}</h4>
            <span>{{ item.name }}</span>
          </li>
        </template>
      </ul>
    </div>
    <!-- 新增数据 -->
    <div class="addDate_wrap" :style="props.platform == 'sph' ? 'margin-top:0' : ''">
      <div class="title_wrap">
        <h4>视频数据</h4>
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
              style="width: 250px"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="changDaterange"
              :disabled-date="
                time => {
                  return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
                }
              "
            ></el-date-picker>
          </div>
        </div>
      </div>
      <ul class="addData_list">
        <li class="addData_item" v-for="item in addDataList" :key="item.label">
          <span>{{ item.value }}</span>
          <b>{{ item.label }}</b>
        </li>
      </ul>
      <echartLine :leftTabList="leftTabList" :data="echartLineData"></echartLine>
    </div>
    <!-- 近10个作品对比 -->
    <div class="comparison_wrap">
      <h4 class="title">近10个作品对比</h4>
      <div class="echart_box">
        <barAndLineChart :data="workList" class="one_echart"></barAndLineChart>
      </div>
      <div class="video_box" v-if="videoContrastList.length > 0">
        <div class="all_video">
          <div
            class="one_video"
            :style="'width:calc(100% / ' + videoContrastList.length + ')'"
            v-for="(item, index) in videoContrastList"
            :key="index"
          >
            <div
              @click="playVideo(item)"
              class="video_info"
              :style="'height:calc((100vw - 862px)/ ' + videoContrastList.length + ' *0.9/3*4)'"
            >
              <el-image class="video_cover" :src="item.cover || coverImg" alt="" fit="cover">
                <template #error>
                  <div class="video_cover errImg_box"></div>
                </template>
              </el-image>
              <!-- 图集不显示播放按钮 -->
              <imgTextTask_ICON v-if="item.mediaType == 2" :info="item" :useClick="false" />
              <div class="play_info" v-else>
                <img src="@/assets/images/content_center/inspection_play.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import echartLine from '../echarts_line.vue'
import barAndLineChart from '../barAndLineChart.vue'
import coverImg from '@/assets/images/content_center/cover.jpg'
import api from '@/api/content_center/content_matrix.js'
import { dateFormat, wanSliceFormat } from '@/utils/tools.js'
import { timeSecond, getDaysBetween, getDays } from '../js/setCharts.js'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
const store = useStore()
const message = inject('$message')
const brandViewMode = computed(() => store.state.user.brandViewMode)
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
const props = defineProps({
  openId: {
    type: String,
    default: () => ''
  },
  tabsName: {
    type: String,
    default: () => ''
  },
  platform: {
    type: String,
    default: () => ''
  }
})
// const taskList = reactive([
//   { name: '进行中任务数', value: 8456 },
//   { name: '待审核任务数', value: 8456 },
//   { name: '审核失败任务数', value: 8456 },
//   { name: '待完成任务数', value: 8456 },
//   { name: '完成任务数', value: 8456 }
// ])
// 近30天直播数据概览
const liveList = reactive({
  titel: '',
  array: [],
  siteTime: '',
  roomId: ''
})
function getliveOverviewMonth() {
  const data = {
    openId: props.openId
  }
  api.getliveOverviewMonth(data).then(res => {
    liveList.titel = res.data.siteTitle
    liveList.siteTime = res.data.siteTime
    liveList.roomId = res.data.roomId
    liveList.array = [
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
        name: '销售额/场均销售',
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
        name: '最高观看峰值/中位数',
        value1: wanSliceFormat(res.data.max || 0),
        value2: wanSliceFormat(res.data.middle || 0),
        show: true
      }
    ]
  })
}
// 近三十天视频数据概览
const videoList = reactive({
  title: '',
  records: [],
  time: '',
  dyItemId: ''
})
function getVideoDataMonth() {
  const data = {
    openId: props.openId
  }
  api.getVideoDataMonth(data).then(res => {
    videoList.title = res.data.videoTitle
    videoList.time = res.data.createTime
    videoList.dyItemId = res.data.itemId
    videoList.records = [
      { name: '新增视频', value: wanSliceFormat(res.data.videoCount || 0), show: true },
      // {
      //   name: '新增带货视频',
      //   value: wanSliceFormat(res.data.saleVideoCount || 0),
      //   show: brandViewMode.value === 1
      // },
      {
        name: '新增销售额',
        value: '￥' + wanSliceFormat(res.data.commerceCount / 100 || 0),
        show: brandViewMode.value === 1
      },
      { name: '新增播放', value: wanSliceFormat(res.data.playCount || 0), show: true },
      { name: '新增点赞', value: wanSliceFormat(res.data.diggCount || 0), show: true },
      { name: '新增评论', value: wanSliceFormat(res.data.commentCount || 0), show: true },
      { name: '新增分享', value: wanSliceFormat(res.data.shareCount || 0), show: true }
    ]
  })
}
const dateTable = reactive([
  // { label: '昨天', value: 2 },
  { label: '近7天', value: 7 },
  { label: '近15天', value: 15 },
  { label: '近30天', value: 30 }
])
// 切换日期
const dateTabValue = ref(7)
const daterangeArray = ref([])
const changeDateTab = item => {
  dateTabValue.value = item.value
  const nowTime = new Date()
  const oldTime = new Date()
  nowTime.setTime(nowTime - 24 * 3600 * 1000)
  oldTime.setTime(nowTime - (item.value - 1) * 24 * 3600 * 1000)
  if (item.value === 2) {
    nowTime.setTime(nowTime - (item.value - 1) * 24 * 3600 * 1000)
  }
  console.log(nowTime.toLocaleString(), oldTime.toLocaleString())
  daterangeArray.value = JSON.parse(
    JSON.stringify([dateFormat(oldTime) + ' 00:00:00', dateFormat(nowTime) + ' 23:59:59'])
  )
  getDatAddDate()
}
changeDateTab({ value: 7 })
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

  const endDateTime = new Date(dateFormat(daterangeArray.value[1]) + ' 00:00:00').getTime()
  const startDateTime = new Date(dateFormat(daterangeArray.value[0]) + ' 00:00:00').getTime()
  const three = 89 * 24 * 3600 * 1000
  const threeMonths = endDateTime - three
  console.log(threeMonths, startDateTime)
  if (startDateTime < threeMonths) {
    message.error('最多只能选择3个月')
    daterangeArray.value = [
      dateFormat(daterangeArray.value[0]) + ' 00:00:00',
      dateFormat(
        new Date(
          new Date().setTime(
            new Date(dateFormat(daterangeArray.value[0]) + ' 00:00:00').getTime() +
              89 * 24 * 60 * 60 * 1000
          )
        )
      ) + ' 23:59:59'
    ]
  } else {
    daterangeArray.value = [
      dateFormat(daterangeArray.value[0]) + ' 00:00:00',
      dateFormat(daterangeArray.value[1]) + ' 23:59:59'
    ]
  }

  getDatAddDate()
}
// 新增数据
const addDataList = ref([])

function getDatAddDate() {
  const data = {
    endTime: daterangeArray.value ? daterangeArray.value[1] : '',
    openId: props.openId,
    // searchType: dateTabValue.value,
    startTime: daterangeArray.value ? daterangeArray.value[0] : ''
  }
  api.getDatAddDate(data).then(res => {
    echartLineData.playList = []
    echartLineData.diggList = []
    echartLineData.commentList = []
    echartLineData.shareList = []
    addDataList.value = [
      { label: '新增视频', value: wanSliceFormat(res.data.video || 0) },
      { label: '涨粉数', value: wanSliceFormat(res.data.fans || 0) },
      { label: '新增播放', value: wanSliceFormat(res.data.play || 0) },
      { label: '新增点赞', value: wanSliceFormat(res.data.digg || 0) },
      { label: '新增评论', value: wanSliceFormat(res.data.comment || 0) },
      { label: '新增分享', value: wanSliceFormat(res.data.share || 0) }
    ]
    // 1、先拿到开始和结束时间差了几天
    const st = daterangeArray.value[0].replace(/-/g, '/')
    const et = daterangeArray.value[1].replace(/-/g, '/')
    const seN = getDaysBetween(st, et)
    // 2、然后计算开始和结束时间这个范围的日期
    const dayLen = getDays(seN + 1, et)

    // 3、循环填数据
    dayLen.forEach(x => {
      // 播放
      let pData1 = 0
      let pData2 = 0
      res.data.playList.forEach(y => {
        if (x === y.xkey) {
          pData1 = y.yincrement
          pData2 = y.yvalue
        }
      })
      echartLineData.playList.unshift({
        xData: x.substring(5),
        yData1: pData1,
        yData2: pData2
      })
      // 点赞
      let dData1 = 0
      let dData2 = 0
      res.data.diggList.forEach(y => {
        if (x === y.xkey) {
          dData1 = y.yincrement
          dData2 = y.yvalue
        }
      })
      echartLineData.diggList.unshift({
        xData: x.substring(5),
        yData1: dData1,
        yData2: dData2
      })
      // 评论
      let cData1 = 0
      let cData2 = 0
      res.data.commentList.forEach(y => {
        if (x === y.xkey) {
          cData1 = y.yincrement
          cData2 = y.yvalue
        }
      })
      echartLineData.commentList.unshift({
        xData: x.substring(5),
        yData1: cData1,
        yData2: cData2
      })
      // 评论
      let sData1 = 0
      let sData2 = 0
      res.data.shareList.forEach(y => {
        if (x === y.xkey) {
          sData1 = y.yincrement
          sData2 = y.yvalue
        }
      })
      echartLineData.shareList.unshift({
        xData: x.substring(5),
        yData1: sData1,
        yData2: sData2
      })
    })
  })
}

// 折线图数据
const echartLineData = reactive({
  playList: [],
  diggList: [],
  commentList: [],
  shareList: []
})
const leftTabList = ref([
  { value: 0, label: '播放数' },
  { value: 1, label: '点赞数' },
  { value: 2, label: '评论数' },
  { value: 3, label: '分享数' }
])

// 作品对比数据
const workList = reactive([])
const videoContrastList = ref([])
function getVideoContrast() {
  const data = {
    openId: props.openId
  }
  api.getVideoContrast(data).then(res => {
    // console.log(res.data)
    videoContrastList.value = res.data
    workList.value = []
    res.data.forEach(item => {
      workList.push({
        name: item.createTime || '',
        diggCount: item.diggCount,
        playCount: item.playCount,
        commentCount: item.commentCount,
        shareCount: item.shareCount
      })
    })
  })
}
// 播放视频
const router = useRouter()
function playVideo(item) {
  router.push({
    path: '/content_center/content_manage/manage_detail',
    query: {
      itemId: item.dyItemId
    }
  })
}
//
function toLiveDetails(item) {
  router.push({
    path: '/content_center/live_center/detail',
    query: {
      roomId: item.roomId,
      dyOpenId: props.openId
    }
  })
}
getVideoContrast()
// getDatAddDate()
getliveOverviewMonth()
getVideoDataMonth()
</script>
<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.date_overview {
  > .taskStatus_wrap {
    width: 100%;
    background: #ffffff;
    border-radius: 4px;
    padding: 22px 24px 24px;
    > .titel {
      height: 25px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
    }
    > .titel_wrap {
      display: flex;
      align-items: center;
      > h4 {
        height: 25px;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        line-height: 25px;
        width: 130px;
        white-space: nowrap;
      }
      > p {
        height: 20px;
        font-size: 14px;
        font-weight: 500;
        color: #909399;
        line-height: 20px;
        margin-left: 24px;
        width: 70px;
        white-space: nowrap;
      }
      > b {
        height: 20px;
        font-size: 14px;
        font-weight: 500;
        color: #889cff;
        line-height: 20px;
        cursor: pointer;
        max-width: 240px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-wrap: break-word;
      }
      > img {
        width: 14px;
        height: 14px;
        margin-left: 16px;
      }
      > span {
        // height: 17px;
        font-size: 12px;
        font-weight: 500;
        color: #999999;
        // line-height: 17px;
        margin-left: 2px;
      }
    }
    > .task_list {
      display: flex;
      margin-top: 20px;
      & > .task_item:first-child {
        margin-left: 0;
      }
      > .task_item {
        width: calc(20% - 13px);
        margin-left: 16px;
        height: 85px;
        background: #f6f7f8;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        > h4 {
          height: 22px;
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
          text-align: center;
        }
        > span {
          height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
          margin-top: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
          text-align: center;
        }
      }
    }
  }
  > .liveStatus_wrap {
    // margin-top: 16px;

    > .live_list {
      display: flex;
      margin-top: 20px;
      flex-wrap: wrap;
      > .live_item {
        width: 20%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 4px;
        padding-bottom: 6px;
        @media screen and (max-width: 1500px) {
          width: 33.33%;
          &:nth-child(1) {
            padding-bottom: 18px;
          }
        }
        > h4 {
          width: 100%;
          height: 25px;
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 25px;
          white-space: nowrap;
          text-align: center;
        }
        > span {
          height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
          margin-top: 4px;
        }
      }
    }
  }
  > .videoStatus_wrap {
    margin-top: 16px;
    > .video_list {
      display: flex;
      margin-top: 20px;
      justify-content: space-between;
      > .video_item {
        width: 14.2%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 4px;
        padding-bottom: 6px;

        > h4 {
          height: 22px;
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 22px;
        }
        > span {
          height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
          margin-top: 6px;
        }
      }
    }
  }
  // 新增数据
  > .addDate_wrap {
    background: #ffffff;
    border-radius: 4px;
    margin-top: 16px;
    padding: 16px 24px 0;

    > .title_wrap {
      display: flex;
      justify-content: space-between;
      > h4 {
        height: 25px;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        line-height: 25px;
        margin-top: 6px;
      }
      > .time_wrap {
        display: flex;
        align-items: center;
        > .date_table {
          display: flex;
          margin-right: 24px;
          > span {
            width: 66px;
            height: 32px;
            border: 1px solid #d9d9d9;
            font-size: 14px;
            font-weight: 400;
            color: #595959;
            line-height: 32px;
            text-align: center;
            border-right-color: transparent;
            cursor: pointer;
          }
          > span:last-child {
            border-right-color: #d9d9d9;
            border-radius: 0 4px 4px 0;
          }
          > span:first-child {
            border-radius: 4px 0 0 4px;
          }
          > span.active {
            border-color: rgba(54, 79, 205, 1);
            background: rgba(54, 79, 205, 0.1);
            color: rgba(54, 79, 205, 1);
          }
          > .active + span {
            border-left-color: transparent;
          }
        }
      }
    }
    > .addData_list {
      display: flex;
      margin-top: 20px;
      > .addData_item {
        width: 16.6%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 4px;
        padding-bottom: 6px;

        > span {
          height: 22px;
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 22px;
        }
        > b {
          height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 17px;
          margin-top: 6px;
        }
      }
    }
  }
  // 作品对比
  > .comparison_wrap {
    background: #ffffff;
    border-radius: 4px;
    margin-top: 16px;
    padding: 16px 24px;

    > .title {
      height: 25px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
      margin-top: 6px;
    }
    > .echart_box {
      width: 100%;
      height: 368px;
      .one_echart {
        width: 100%;
        height: 100%;
      }
    }
    > .video_box {
      padding: 0 77px;
      .all_video {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        .one_video {
          width: 10%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          margin-bottom: 28px;
          .video_info {
            cursor: pointer;
            width: 90%;
            max-width: 90px;
            // height:160px;
            height: calc((100vw - 862px) / 10 * 0.9 / 3 * 4);
            // height: calc((100vw - 862px) / 10 * 9);
            max-height: 160px;
            background: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            position: relative;
            .video_cover {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 5px;
              background: #d8d8d8;
            }
            .play_info {
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              position: absolute;
              left: 0;
              top: 0;
              opacity: 0;
              &:hover {
                opacity: 1;
              }
              img {
                width: 32px;
                height: 32px;
              }
            }
          }
          .checkVideo {
            border: 1px solid #3865f3;
          }
        }
        // @media screen and (max-width: 1850px) {
        // 	.one_video {
        // 		width: 14.28% !important;
        // 	}
        // 	.video_info {
        // 		// height:120px !important
        // 	}
        // }
        // @media screen and (max-width: 1650px) {
        // 	.one_video {
        // 		width: 16.66% !important;
        // 	}
        // }
        // @media screen and (max-width: 1500px) {
        // 	.one_video {
        // 		width: 20% !important;
        // 	}
        // }
        // @media screen and (max-width: 1300px) {
        // 	.one_video {
        // 		width: 25% !important;
        // 	}
        // }
      }
    }
  }
}
</style>

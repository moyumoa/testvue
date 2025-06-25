<template>
  <div class="activity_data_board" ref="actConDom" :style="{ height: actConHeight }">
    <div class="act_con">
      <div class="title_box">
        <p class="title">{{ activityItem.title || '-' }}</p>
      </div>
      <!-- 活动目标 -->
      <div class="target_box">
        <targetData :dataList="armData" />
      </div>
      <!-- 视频数据 -->
      <dataActivity :dataList="videoData" />
      <!-- 直播数据 -->
      <dataActivity :dataList="liveData" />
      <!-- 线索榜 -->
      <dataRank
        v-if="brandViewMode == 2"
        :dataList="clueListData"
        @changeDimension="changeDimension"
      />
      <!-- 销售额 -->
      <dataRank
        v-if="brandViewMode == 1"
        :dataList="PaymentData"
        @changeDimension="changeDimensionPayment"
      />
      <!-- 曝光榜 -->
      <dataRank :dataList="exposureListData" @changeDimension="changeDimensionExposure" />

      <!-- 返回 -->
      <div class="back_btn">
        <el-button type="primary" @click="back">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import targetData from './sComponents/dataProgress.vue'
import dataActivity from './sComponents/data_activity.vue'
import dataRank from './sComponents/data_rank.vue'
import { activityData, activityRank } from '@/api/market/calendar.js'
import { changeTwoDecimal } from '@/utils/tools.js'

const props = defineProps({
  activityItem: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const brandViewMode = ref(null)
brandViewMode.value = Number(localStorage.getItem('brandViewMode'))

const emits = defineEmits(['back'])
const { activityItem } = toRefs(props)

// 高度DOM
const actConDom = ref(null)
const actConHeight = ref(null) // 高度，目前废弃，调用不影响

// 活动目标数据
const armData = ref([])
// 活动视频数据
const videoData = reactive({
  title: '活动视频数据',
  type: 1,
  data: [
    { key: 'videoCnt', label: '视频数', value: 0 },
    { key: 'playCountTarget', label: '播放数', value: 0 },
    { key: 'diggCountTarget', label: '点赞数', value: 0 },
    { key: 'commentCountTarget', label: '评论数', value: 0 },
    { key: 'shareCountTarget', label: '分享数', value: 0 },
    { key: 'videoLeaveInfoNumTarget', label: '线索数', value: 0 },
    { key: 'videoJoinUserCnt', label: '参与人数', value: 0 },
    { key: 'videoJoinCnt', label: '参与次数', value: 0 }
  ]
})
// 活动直播数据
const liveData = reactive({
  title: '活动直播数据',
  type: 2,
  data: [
    { key: 'liveTimesTarget', label: '直播场次', value: 0 },
    { key: 'liveViewNumTarget', label: '观看人次', value: 0 },
    { key: 'liveDurationTarget', label: '直播时长', value: 0 },
    { key: 'liveLeaveInfoNumTarget', label: '线索数', value: 0 },
    { key: 'liveJoinUserCnt', label: '参与人数', value: 0 },
    { key: 'liveJoinCnt', label: '参与次数', value: 0 }
  ]
})

// 线索榜
const clueListData = reactive({
  name: '线索榜',
  data: []
})
// 曝光榜
const exposureListData = reactive({
  name: '曝光榜',
  data: []
})
// 销售榜
const PaymentData = reactive({
  name: '销售榜',
  data: []
})
// 返回
function back() {
  emits('back')
}

// 处理高度
function getHeight() {
  nextTick(() => {
    console.log('高度', actConDom.value?.clientHeight)
    actConHeight.value = actConDom.value?.clientHeight < 746 ? '746px' : '100%'
  })
}
// 获取榜单
function changeDimension(val) {
  const params = {
    activityId: activityItem.value.id,
    rankShowType: val,
    rankType: 2
  }
  getRank(params)
}
function changeDimensionExposure(val) {
  const params = {
    activityId: activityItem.value.id,
    rankShowType: val,
    rankType: 1
  }
  getRank(params)
}
function changeDimensionPayment(val) {
  const params = {
    activityId: activityItem.value.id,
    rankShowType: val,
    rankType: 3
  }
  getRank(params)
}

// 获取活动数据
function getData() {
  activityData({ id: activityItem.value.id }).then(res => {
    console.log('获取活动数据返回res', res)
    if (res.code === 0) {
      if (res.data.viewMode) {
        brandViewMode.value = res.data.viewMode
      }
      // 处理活动目
      if (brandViewMode.value === 1) {
        armData.value = [
          {
            key: 1,
            label: '曝光量',
            current: Number(res.data.exposure),
            target: Number(res.data.exposureTarget)
          },
          {
            key: 3,
            label: '销售额',
            current: Number(res.data.payment),
            target: Number(res.data.paymentTarget)
          }
        ]
      }
      if (brandViewMode.value === 2) {
        armData.value = [
          {
            key: 1,
            label: '曝光量',
            current: Number(res.data.exposure),
            target: Number(res.data.exposureTarget)
          },
          {
            key: 2,
            label: '线索数',
            current: Number(res.data.clue),
            target: Number(res.data.clueTarget)
          }
        ]
      }
      // 视频数据
      videoData.data.forEach(item => {
        item.value = res.data[item.key]
      })
      // 直播数据
      liveData.data.forEach(item => {
        item.value = res.data[item.key]
      })
    }
  })
}
getData()
// 获取榜单数据
function getRank(params) {
  //   {
  //   "activityId": 0, 活动id
  //   "rankShowType": 0, 1达人 2矩阵号
  //   "rankType": 0 1曝光榜 2线索榜 3销售榜
  // }

  activityRank(params).then(res => {
    // const obj = {
    //   0: '曝光榜',
    //   1: '线索榜',
    //   2: '销售榜'
    // }
    // console.log(`获取${obj[params.rankType]}榜返回res`, res)
    if (res.code === 0) {
      // console.log('获取榜单数据的返回', res.data)
      const resultData = res.data.map(dataItem => {
        return (dataItem = {
          ...dataItem,
          value: Number(dataItem.value)
        })
      })
      // 区分不同榜单
      if (params.rankType === 1) {
        // 曝光榜
        exposureListData.data = resultData || []
      }
      if (params.rankType === 2) {
        // 线索榜
        clueListData.data = resultData || []
      }
      if (params.rankType === 3) {
        // 销售榜
        PaymentData.data = res.data.map(item => {
          return (item = {
            ...item,
            value: changeTwoDecimal(Number(item.value))
          })
        })
      }
    }
  })
}
onMounted(() => {
  nextTick(() => {
    getHeight()
  })
})
</script>

<style lang="scss" scoped>
.activity_data_board {
  width: 100%;
  background: #ffffff;
  position: relative;
  border-radius: 4px;
  .act_con {
    padding: 0 20px 64px;
    height: 100%;
    overflow-y: auto;
    .title_box {
      padding: 17px 0;
      width: 100%;
      .title {
        font-size: 18px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #303133;
        line-height: 26px;
        max-width: 271px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-wrap: break-word;
        overflow: hidden;
      }
    }
    .target_box {
      margin-top: unset;
      padding: 0 28px;
    }
  }
  .back_btn {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 56px;
    background: #ffffff;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

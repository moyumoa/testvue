<template>
  <div class="data_overview" v-loading="topLoading">
    <div class="data_overview_title">数据总览</div>
    <div class="data_overview_top">
      <div class="top_item" :style="{ height: `${topItemH}px` }" ref="overMatrix">
        <div class="top_item_title">矩阵号总数</div>
        <div class="top_item_number" ref="numFir">
          {{ wanSliceFormat(resultInfo.accountCount) }}
        </div>
        <!-- 详细数据 -->
        <div
          class="every_det_warp"
          :style="{
            marginTop: `${everyDetPosition}px`,
            justifyContent: everyDetPosition == 0 ? 'flex-start' : 'flex-end'
          }"
        >
          <div class="every_det" ref="everyDetFir">
            <div class="det_item" v-for="(item, index) in platformArr" :key="index">
              <div :class="`xm_platformIcon_${item.id}`"></div>
              <div class="text">{{ wanSliceFormat(resultInfo[`${item.key}AccountCount`]) }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="top_item" :style="{ height: `${topItemH}px` }">
        <div class="top_item_title">授权有效矩阵号数</div>
        <div class="top_item_number" ref="numSec">
          {{ wanSliceFormat(resultInfo.authValidAccountCount) }}
        </div>
        <div
          class="every_det_warp"
          :style="{
            marginTop: `${everyDetPosition}px`,
            justifyContent: everyDetPosition == 0 ? 'flex-start' : 'flex-end'
          }"
        >
          <div class="every_det" ref="everyDetSec">
            <div class="det_item" v-for="(item, index) in platformArr" :key="index">
              <div :class="`xm_platformIcon_${item.id}`"></div>
              <div class="text">
                {{ wanSliceFormat(resultInfo[`${item.key}AuthValidAccountCount`]) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="top_item" :style="{ height: `${topItemH}px` }">
        <div class="top_item_title">粉丝总数</div>
        <div class="top_item_number">{{ wanSliceFormat(resultInfo.fansCount) }}</div>
      </div>
    </div>
    <!-- 时间筛选   -->
    <div class="data-range-group">
      <div
        class="data-range-btn"
        :class="{ active: item.key === timeType }"
        v-for="item in dateList"
        :key="item.key"
        @click="chooseTime(item)"
      >
        {{ item.label }}
      </div>
    </div>
    <div v-loading="!topLoading && fourDataLoading">
      <!--  数据 + 小屏兼容  -->
      <div class="middle_container" id="small_screen">
        <div
          :class="{
            middle_container_item: true,
            middle_container_item_active: item.key === currentTab.key
          }"
          v-for="item in dataList"
          :key="item.label"
          @click="onClickData(item)"
        >
          <img class="item_img" :src="item.img" />
          <div class="item_right">
            <div
              class="item_name"
              @click="toMatrixOverview(item)"
              :style="{ cursor: item.key === 'activeAccountCount' ? 'pointer' : '' }"
            >
              {{ item.label }}
              <!-- 点击跳转到【矩阵经营】   -->
              <el-icon v-if="item.key === 'activeAccountCount'">
                <i-arrow-right />
              </el-icon>
            </div>
            <div class="item_value">
              {{ wanSliceFormat(item.value) }}
              <el-tooltip
                v-if="item.key === 'activeAccountCount'"
                content="此数值根据今日活跃矩阵号中当前实时有效的数量实时更新"
              >
                <img class="item_value_tips" src="@/assets/images/operate/tip_line.png" alt />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <!-- echarts 图表   -->
      <div class="chart_container" v-loading="!topLoading && !fourDataLoading && chartLoading">
        <!-- 只有一个不显示     -->
        <div class="chart_tab" v-if="currentTab.chartTabList && currentTab.chartTabList.length > 1">
          <div
            :class="{
              chart_tab_item: true,
              chart_tab_item_active: item.key === currentSubTab.key
            }"
            v-for="item in currentTab.chartTabList"
            :key="item.key"
            @click="clickEchartSubTab(item)"
          >
            {{ item.label }}
          </div>
        </div>
        <LineChart
          :data="echartsList"
          :tooltipData="tooltipData"
          height="270px"
          id="dataOverviewLineChart"
          :type="currentSubTab.label"
          :chartTab="currentSubTab"
        ></LineChart>
      </div>
    </div>
  </div>
</template>

<script setup>
import { wanSliceFormat } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import LineChart from '@/views/content_center/components/line_chart.vue'
import {
  overviewCountData,
  overviewChartDataV2,
  overviewStageData
} from '@/api/content_center/content_overview.js'
import { throttle } from '@/utils/tools'

const platformArr = [
  { id: 1, key: 'dy' },
  { id: 3, key: 'xhs' },
  { id: 4, key: 'ks' },
  { id: 2, key: 'wx' }
]
// 选择的时间
const dateList = ref([
  {
    key: 'week',
    label: '近7日' // 昨天
  },
  {
    key: 'month',
    label: '本月'
  },
  {
    key: 'year',
    label: '今年'
  }
])
const timeType = ref('week')
const queryParams = reactive({
  startDate: '',
  endDate: ''
})
const chooseTime = throttle(item => {
  fourDataLoading.value = true
  chartLoading.value = true
  currentSubTab.value = currentTab.value?.chartTabList[0]
  timeType.value = item.key
  if (item.key === 'week') {
    queryParams.startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
    queryParams.endDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  } else if (item.key === 'month') {
    queryParams.startDate = dayjs().startOf('month').format('YYYY-MM-DD')
    queryParams.endDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  } else if (item.key === 'year') {
    queryParams.startDate = dayjs().startOf('year').format('YYYY-MM-DD')
    queryParams.endDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  }
  // 切换日期后，获取四个数据和目前显示的图表信息
  getFourDataFun()
  getAllEchartFun()
}, 500)
const overMatrix = ref(null)
const numFir = ref(null)
const numSec = ref(null)
const everyDetFir = ref(null)
const everyDetSec = ref(null)

const topLoading = ref(true) // 总数的Loading
const chartLoading = ref(true) // 图表的Loading
const fourDataLoading = ref(true) // 四个数据的Loading
// 当前选中的
const currentTab = ref({})
// 当前echarts 选中的
const currentSubTab = ref({})
const dataList = ref([
  {
    label: '活跃矩阵号数',
    key: 'activeAccountCount',
    value: '--',
    img: 'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/6bd5b1c2af2c4e8a8f110fa33a608bfd_1686360343033.png',
    chartTabList: [
      {
        key: 'activeAccountCount',
        label: '活跃矩阵号数'
      },
      {
        key: 'clientActiveAccountCount',
        label: '潜客活跃矩阵号数'
      }
    ],
    chartKey: 'activeChart',
    chartValue: []
    // platformActiveAccountCount: {} // 各平台总数据
  },
  {
    label: '发布视频数',
    key: 'videoCount',
    value: '--',
    img: 'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/69fb8fa60f2f46918134bd943bad9066_1686360241469.png',
    chartTabList: [
      {
        key: 'videoNum',
        label: '发布视频数量'
      }
    ],
    chartKey: 'videoChart',
    chartValue: []
    // publishVideoAccount: {} // 各平台数据
  },
  {
    label: '新增播放数',
    key: 'videoPlayCount',
    value: '--',
    img: 'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/24e29f6f390a4bc397cd9e8f1fffb280_1686360308270.png',
    // 播放数/点赞数/评论数/分享数
    chartTabList: [
      {
        key: 'playNum',
        label: '播放数'
      },
      {
        key: 'diggNum',
        label: '点赞数'
      },
      {
        key: 'commentNum',
        label: '评论数'
      },
      {
        key: 'shareNum',
        label: '分享数'
      }
    ],
    chartKey: 'videoChart',
    chartValue: []
  },
  {
    label: '新增潜客数',
    key: 'clientCount',
    value: '--',
    img: 'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/537e97ddad6743cbb5a1e7975bb2365e_1686360372377.png',
    chartTabList: [
      {
        key: 'clientIntentProbabilityUcnt',
        label: '新增潜客数'
      },
      {
        key: 'clueCount',
        label: '新增线索数'
      }
    ],
    chartKey: 'clientTrends',
    chartValue: []
  }
])
// 获取顶部的三个数据
function getTopData() {
  overviewCountData({})
    .then(res => {
      if (res.code === 0) {
        resultInfo.value = res.data || {}
        nextTick(() => {
          handleResize()
        })
      }
    })
    .finally(() => {
      topLoading.value = false
    })
}
// 获取图表上四个数据
function getFourDataFun() {
  overviewStageData({
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    type: 1
  })
    .then(res => {
      if (res.code === 0) {
        const result = res.data || {}
        dataList.value.forEach(item => {
          item.value = result[item.key]
        })
      }
    })
    .finally(() => {
      fourDataLoading.value = false
    })
}
// 切换不同的模块 分别获取对应的图表数据
const onClickData = item => {
  if (currentTab.value === item) {
    return
  }
  currentTab.value = item
  currentSubTab.value = currentTab.value?.chartTabList[0]
  getAllEchartFun()
}
// 根据选中的tab获取对应图表
function getAllEchartFun() {
  chartLoading.value = true
  let type = null
  switch (currentTab.value.key) {
    case 'activeAccountCount':
      type = 1
      break
    case 'videoCount':
      type = 2
      break
    case 'videoPlayCount':
      type = 2
      break
    case 'clientCount':
      type = currentSubTab.value.key === 'clientIntentProbabilityUcnt' ? 4 : 3
      break
  }
  overviewChartDataV2({
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    type: type
  })
    .then(res => {
      if (res.code === 0) {
        const result = res.data || {}
        dataList.value.forEach(item => {
          item.chartValue =
            currentSubTab.value.key === 'clueCount' ? result.clueTrends : result[item.chartKey]
        })
        clickEchartsTab(currentSubTab.value)
      }
    })
    .finally(() => {
      chartLoading.value = false
    })
}

const echartsList = ref([])
const tooltipData = ref([])
const resultInfo = ref({
  accountCount: '--',
  authValidAccountCount: '--',
  fansCount: '--',
  platformsData: {} // 个平台具体数据
})
// 切换图表的子类型
const clickEchartSubTab = item => {
  if (currentSubTab.value === item) {
    return
  }
  currentSubTab.value = item
  // 新增潜客数的子项 新增潜客数和新增线索数 需要分别调接口获取。
  if (currentTab.value?.key === 'clientCount') {
    getAllEchartFun()
  } else {
    clickEchartsTab(item)
  }
}
// 切换echarts 不同的类型
const clickEchartsTab = item => {
  echartsList.value =
    dataList.value
      .find(item => item.key === currentTab.value.key)
      ?.chartValue?.map(item => {
        const date = item.date || item.dateTime
        return {
          xData: date.slice(-5),
          yData: item[currentSubTab.value.key] || 0
        }
      }) || []
  // console.log('currentSubTab.value', currentSubTab.value.key)
  const keyToFaild = {
    activeAccountCount: 'ActiveAccountCount',
    videoNum: 'VideoNum',
    playNum: 'PlayNum',
    diggNum: 'DiggNum',
    commentNum: 'CommentNum',
    shareNum: 'ShareNum'
  }
  tooltipData.value =
    dataList.value
      .find(item => item.key === currentTab.value.key)
      ?.chartValue?.map(item => {
        return {
          dyData: item[`dy${keyToFaild[currentSubTab.value.key]}`],
          xhsData: item[`xhs${keyToFaild[currentSubTab.value.key]}`],
          wxData: item[`wx${keyToFaild[currentSubTab.value.key]}`],
          ksData: item[`ks${keyToFaild[currentSubTab.value.key]}`]
        }
      }) || []
}

onBeforeMount(() => {
  // 获取顶部的三个数据
  getTopData()
  // 默认选中活跃矩阵号数
  currentTab.value = dataList.value.find(item => item.key === 'activeAccountCount')
  // 默认选中七天 发布视频数 播放数
  chooseTime({ key: 'week' })
})
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const everyDetPosition = ref(0) // 细分平台位置
const topItemH = ref(110) // topItem高度
// 计算位置
const handleResize = throttle(function () {
  const overMatrixWidthFir = overMatrix.value && overMatrix.value.offsetWidth // 总宽度是一样的
  const numWidthFir = numFir.value && numFir.value.offsetWidth
  const everyDetWidthFir = everyDetFir.value && everyDetFir.value.offsetWidth
  const numWidthSec = numSec.value && numSec.value.offsetWidth
  const everyDetWidthSec = everyDetSec.value && everyDetSec.value.offsetWidth
  // 都按按最长的算
  const finNum = numWidthFir > numWidthSec ? numWidthFir : numWidthSec
  const finEveryDet = everyDetWidthFir > everyDetWidthSec ? everyDetWidthFir : everyDetWidthSec
  // 计算top_item高度，当every_det长度超出时需要换行，就需要更新top_item高度
  topItemH.value = finEveryDet + 48 >= overMatrixWidthFir ? 130 : 110
  // 判断显示位置 64 = 24 + 16 + 24
  everyDetPosition.value = 64 + finNum + finEveryDet >= overMatrixWidthFir ? 0 : -12
}, 32)

// 跳转 到矩阵经营
const router = useRouter()
const toMatrixOverview = item => {
  if (item.key === 'activeAccountCount') {
    router.push('/content_center/business_overview')
  }
}
</script>

<style lang="scss" scoped>
@media screen and(max-width: 1800px) {
  #small_screen {
    .middle_container_item {
      padding: 22px 10px;

      .item_right {
        margin-left: 6px;
      }
    }
  }
}

.data_overview {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  height: 697px;
  border-radius: 4px;
  padding: 22px 24px;

  .data_overview_title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    //width: 72px;
    //height: 26px;
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 26px;
  }
  .data_overview_top {
    margin: 26px 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .top_item {
      flex: 1;
      height: 110px;
      background-color: #f7f8fa;
      border-radius: 4px;
      padding-top: 24px;
      padding-left: 24px;
      position: relative;
      overflow: hidden;
      .every_det_warp {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
      .every_det {
        // position: absolute;
        // right: 24px;
        // bottom: 24px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        margin-right: 24px;
        width: max-content;
        flex-wrap: wrap;
        .det_item {
          height: 20px;
          display: flex;
          align-items: center;
          position: relative;
          margin-right: 12px;
          &:last-child {
            margin-right: 0;
          }
          :deep(.xm_platformIcon_1),
          :deep(.xm_platformIcon_2),
          :deep(.xm_platformIcon_3),
          :deep(.xm_platformIcon_4) {
            left: 0;
          }
        }
        .text {
          text-indent: 24px;
          font-size: 16px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 500;
          color: #303133;
          line-height: 20px;
        }
      }
      .top_item_title {
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
      }
      .top_item_number {
        height: 37px;
        font-size: 26px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #303133;
        line-height: 37px;
        width: max-content;
      }
    }
    .top_item + .top_item {
      margin-left: 16px;
    }
  }

  .data-range-group {
    align-self: flex-end;
    .data-range-btn {
      position: relative;
      cursor: pointer;
      display: inline-block;
      width: 66px;
      height: 32px;
      color: #595959;
      font-size: 14px;
      font-weight: 400;
      font-family: PingFangSC-Regular, PingFang SC;
      text-align: center;
      line-height: 32px;
      border: 1px solid #d9d9d9;
    }

    .active {
      color: $theme_color;
      z-index: 10;
      background: rgba(54, 79, 205, 0.1);
      border: 1px solid #364fcd;
    }

    :not(:last-child) {
      margin-right: -1px;
    }

    :first-child {
      border-radius: 4px 0 0 4px;
    }

    :last-child {
      border-radius: 0 4px 4px 0;
    }
  }

  .middle_container {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;

    .middle_container_item {
      //display: inline-block;
      //width: 288px;
      flex: 1;
      height: 110px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      padding: 22px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &:hover {
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);
      }

      .item_img {
        flex-shrink: 0;
        //width: 56px;
        //height: 56px;
        width: 48px;
        height: 48px;
        //background-color: pink;
      }

      .item_right {
        flex: 1;
        margin-left: 16px;
      }

      .item_name {
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
        display: inline-flex;
        align-items: center;
      }

      .item_value {
        margin-top: 4px;
        height: 31px;
        font-size: 20px;
        font-family: Helvetica-Bold, Helvetica;
        font-weight: bold;
        color: #303133;
        line-height: 31px;
        .item_value_tips {
          width: 16px;
          height: 16px;
          margin-left: 8px;
        }
      }
    }

    .middle_container_item_active {
      background: rgba(54, 79, 205, 0.1);
      border-radius: 4px;
      border: 1px solid #364fcd;
    }

    .middle_container_item + .middle_container_item {
      margin-left: 16px;
    }
  }

  .chart_container {
    margin-top: 24px;

    .chart_tab {
      display: flex;
      align-items: center;
      cursor: default;

      .chart_tab_item {
        cursor: pointer;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #909399;
        line-height: 20px;
      }

      .chart_tab_item_active {
        color: $theme_color;
      }

      .chart_tab_item + .chart_tab_item {
        border-left: 1px solid #e8e8e8;
        padding-left: 8px;
        margin-left: 8px;
      }
    }
  }
}
</style>

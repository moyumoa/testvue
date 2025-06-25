<template>
  <div class="content_page" v-loading="loading">
    <!--  顶部搜索栏  -->
    <div class="module-box" style="padding: 0">
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="onReset"
        ref="xmSearchRef"
      >
        <template #searchItem>
          <div style="display: flex; align-items: center; margin-bottom: 16px; margin-right: 24px">
            <label class="item_label">成员姓名</label>
            <div class="item_content">
              <el-select
                v-model="queryUserId"
                style="width: 100%"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="请选择成员姓名"
                remote-show-suffix
                :remote-method="getUserInfo"
                no-data-text="没有搜到相关内容"
              >
                <el-option
                  v-for="item in queryUserOptions"
                  :key="item.userId"
                  :label="item.userBrandName"
                  :value="item.userId"
                >
                  <div
                    class="item_content_flex"
                    style="display: flex; align-items: center; justify-content: space-between"
                  >
                    <div class="flex-left" style="flex-shrink: 0">
                      {{ item.userBrandName }}
                    </div>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="departmentFilter(item.fullPath)"
                      placement="bottom"
                    >
                      <div
                        class="flex-right"
                        style="
                          color: #c9c9cb;
                          text-align: right;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          margin-left: 10px;
                          max-width: 200px;
                        "
                      >
                        {{ departmentFilter(item.fullPath) }}
                      </div>
                    </el-tooltip>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>
        </template>
        <template #searchBtn>
          <el-button @click="showExportDialog = true">导出</el-button>
        </template>
      </xm_search>
    </div>
    <!-- 一级页面访问统计 -->
    <div class="page_center">
      <div class="center_left data_screening">
        <div class="title_box" style="margin-bottom: 16px">
          <div style="flex: 1">
            <span style="font-size: 18px; font-weight: bold">一级页面访问统计</span>
          </div>
        </div>
        <div class="data_box">
          <div class="one_data" v-for="item in accessStatisticsList" :key="item.key">
            <div class="one_data_value">{{ wanSliceFormat(item.value) }}</div>
            <div class="one_data_title">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
    <!--  灵感库使用统计 两个漏斗图  -->
    <div class="module-box" v-if="false">
      <div class="box-title">灵感库使用统计</div>
      <div class="flex-line" style="background-color: #fff; margin-bottom: 0; margin-top: 28px">
        <funnel-chart
          style="padding: 0"
          :params="params"
          class="item_1"
          :list="inspirationList"
        ></funnel-chart>
        <funnel-chart
          style="padding: 0"
          :params="params"
          class="item_1"
          :list="inspirationList2"
        ></funnel-chart>
      </div>
    </div>
    <!--  使用时间分布 两个饼图  -->
    <div class="module-box">
      <div class="box-title">使用时间分布</div>
      <div class="flex-line" style="background-color: #fff; margin-bottom: 0">
        <pie-chart
          ref="allPieRef"
          style="padding: 0"
          class="item_1"
          title="使用时间分布"
          id="customerSource"
          :data="allPieList"
        ></pie-chart>
        <pie-chart
          ref="functionalPieRef"
          style="padding: 0"
          class="item_1"
          title="功能区使用时间分布"
          subtitle="功能区使用时间分布："
          id="customerAnalysis"
          :data="functionalPieList"
        ></pie-chart>
      </div>
    </div>
    <!--  两个任务统计的表格  -->
    <div class="flex-line">
      <TaskStatistics :list="taskStatistics" class="item_1"></TaskStatistics>
      <AccountStatistics :list="accountStatistics" class="item_1"></AccountStatistics>
    </div>
    <!--  小程序使用人次时间分布图 柱状图 applet_bar_chart  -->
    <applet-bar-chart ref="barChatRef" :list="dailyScheduleList"></applet-bar-chart>
    <!-- 导出时间弹窗  -->
    <el-dialog v-model="showExportDialog" :width="500" @close="closeDialog">
      <div class="dialog_content">
        <el-form ref="ruleForm" :rules="rules" :model="dialogForm" label-width="100px">
          <el-form-item label="导出时间：" prop="dateRangeValue">
            <el-date-picker
              v-model="dialogForm.dateRangeValue"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :clearable="false"
              :disabled-date="time => time.getTime() > Date.now() - 24 * 60 * 60 * 1000"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <exp_button type="primary" :asyncFunc="exportFiles">确定</exp_button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { dateFormat, debounce, isNotEmpty, wanSliceFormat } from '@/utils/tools.js'
import PieChart from './components/pie_chart.vue'
import FunnelChart from './components/funnel_chart.vue'
import AppletBarChart from '@/views/system/ai_tracking_point/components/applet_bar_chart.vue'
import { exportAIStatistics, getAccessStatistics } from '@/api/system_setting/ai_tracking_point'
import AccountStatistics from '@/views/system/ai_tracking_point/components/account_statistics.vue'
import TaskStatistics from '@/views/system/ai_tracking_point/components/task_statistics.vue'
import { getQuery } from '@/utils/get_query'
import { exportFileV2 } from '@/utils/exportFile'
import { setBusinessChooseParam } from '@/utils/search'
import { listUserInfo } from '@/api/system_setting/authorization'
import { batchGetByGroup } from '@/api/market/miniprogram_operation'
// 筛选条件
const searchComponents = ref([
  {
    type: 'chooseDept',
    label: '组织结构',
    val: [],
    filed: 'orgIds',
    multiple: true,
    isUsePermission: true
  },
  // {
  //   type: 'select',
  //   label: '成员姓名',
  //   val: '',
  //   filed: 'queryUserId',
  //   multiple: true,
  //   filterable: true,
  //   remote: true,
  //   remoteMethod: getUserInfo,
  //   'collapse-tags': true,
  //   'collapse-tags-tooltip': true,
  //   selects: []
  // },
  {
    type: 'input',
    label: '手机号',
    val: '',
    filed: 'phoneNum'
  },
  {
    type: 'select',
    label: '统计周期',
    val: 7,
    defaultVal: 7,
    filed: 'countDays',
    clearable: true,
    selects: [
      {
        label: '7天（不包含今天）',
        value: 7
      },
      {
        label: '15天（不包含今天）',
        value: 15
      },
      {
        label: '30天（不包含今天）',
        value: 30
      }
    ]
  }
])

const queryUserId = ref(null)
const queryUserOptions = ref([])
const { brandId, brandName } = JSON.parse(localStorage.getItem('brandInfo'))

const departmentFilter = fullPath => {
  if (isNotEmpty(fullPath)) {
    return fullPath
      .split(';')
      .map(item => {
        const list = item.split('/')
        const length = list.length
        return list[length - 1]
      })
      .filter(item => isNotEmpty(item))
      .join('/')
  }
  return brandName
}

const getUserInfo = debounce(value => {
  if (isNotEmpty(value)) {
    listUserInfo({
      brandId: brandId,
      name: value
    }).then(res => {
      if (res.code === 0) {
        queryUserOptions.value = res?.data || []
      }
    })
  }
}, 500)

// 更新业务主体
const initSearch = function () {
  const list = setBusinessChooseParam()
  searchComponents.value = searchComponents.value
    .slice(0, 3)
    .concat(list, searchComponents.value.slice(3))
}
initSearch()

const params = ref({})
const barChatRef = ref(null)
const allPieRef = ref(null)
const functionalPieRef = ref(null)
const loading = ref(false)
const getAccess = () => {
  const params = getQuery(searchComponents.value)
  params.queryUserId = queryUserId.value
  loading.value = true
  getAccessStatistics(params).then(res => {
    if (res.code === 0) {
      const {
        firstLevelPageVisitCount = {},
        inspirationLibraryUseCount = {},
        useTimeDistribution = {},
        doMainDatatimeDistribution = {},
        taskJoinCount = {},
        pageVisitCount = {},
        dailySchedule = {}
      } = res.data || {}
      //  一级页面统计信息
      if (isNotEmpty(firstLevelPageVisitCount)) {
        accessStatisticsList.value.forEach(item => {
          item.value = firstLevelPageVisitCount[item.key] || 0
        })
      }
      // 灵感库使用统计
      if (isNotEmpty(inspirationLibraryUseCount)) {
        inspirationList.value.forEach(item => {
          item.pvValue = inspirationLibraryUseCount[item.pvKey] || 0
          item.uvValue = inspirationLibraryUseCount[item.uvKey] || 0
        })
        inspirationList2.value.forEach(item => {
          item.pvValue = inspirationLibraryUseCount[item.pvKey] || 0
          item.uvValue = inspirationLibraryUseCount[item.uvKey] || 0
        })
      }
      // 使用时间分布
      if (isNotEmpty(useTimeDistribution)) {
        allPieList.value.forEach(item => {
          item.value =
            item.key === 'periodRecommenDation'
              ? useTimeDistribution.periodRecommenDation
              : useTimeDistribution[item.key + 'Duration'] || 0
          item.pv = useTimeDistribution[item.key + 'PV'] || 0
          item.uv = useTimeDistribution[item.key + 'UV'] || 0
        })
        allPieRef.value?.setChart(allPieList.value)
      }
      // 功能区使用时间分布
      if (isNotEmpty(doMainDatatimeDistribution)) {
        functionalPieList.value.forEach(item => {
          item.value = doMainDatatimeDistribution[item.key + 'Duration'] || 0
          item.pv = doMainDatatimeDistribution[item.key + 'PV'] || 0
          item.uv = doMainDatatimeDistribution[item.key + 'UV'] || 0
        })
        functionalPieRef.value?.setChart(functionalPieRef.value)
      }
      // 任务参与统计
      if (isNotEmpty(taskJoinCount)) {
        taskStatistics.value.forEach(item => {
          item.DetailView = taskJoinCount[item.key + 'DetailView'] || 0
          item.DetailViewNumber = taskJoinCount[item.key + 'DetailViewNumber'] || 0
          item.ImmediatelyJoinView = taskJoinCount[item.key + 'ImmediatelyJoinView'] || 0
          item.ImmediatelyJoinViewNumber =
            taskJoinCount[item.key + 'ImmediatelyJoinViewNumber'] || 0
        })
      }
      // 账号统计
      if (isNotEmpty(pageVisitCount)) {
        accountStatistics.value.forEach(item => {
          item.View = pageVisitCount[item.key + 'View'] || 0
          item.ViewNumber = pageVisitCount[item.key + 'ViewNumber'] || 0
        })
      }
      // 小程序使用分布
      if (isNotEmpty(dailySchedule)) {
        dailyScheduleList.value = []
        for (const key in dailySchedule) {
          dailyScheduleList.value.push({
            xData: key.slice(4) + ':00',
            yData: dailySchedule[key]
          })
        }
        barChatRef.value?.setChart(dailyScheduleList.value)
      }
    }
    loading.value = false
  })
}
// 查询全部
const searchList = () => {
  const data = getQuery(searchComponents.value)
  getAccess(data)
}
const onReset = () => {
  queryUserId.value = null
  queryUserOptions.value = []
  searchList()
}

const init = async () => {
  const res = await batchGetByGroup({
    configGroups: [
      'mission:banner',
      'mission:rank',
      'video_recommend',
      'task_recommend',
      'creation_open',
      'creative_inspiration',
      'current_version_recommend'
    ]
  })
  if (res.code === 0) {
    const data = res?.data || []
    // 功能区
    let config =
      data['mission:rank']?.find(item => item.key === 'rank_display_options')?.value || {}
    config = JSON.parse(config)
    functionalPieList.value = functionalPieList.value.filter(item =>
      isNotEmpty(config[item.configKey])
    )
    allPieList.value = allPieList.value.filter(item => {
      if (item.configKey) {
        const flagItem = data[item.configKey]?.find(i => i.key === item.configKey + '_mini_display')
        return flagItem?.value === '1'
      } else {
        return true
      }
    })
  }
  searchList()
}
onMounted(() => {
  init()
})
const showExportDialog = ref(false)
const rules = ref({
  dateRangeValue: [{ required: true, message: '请选择导出时间', trigger: 'change' }]
})
const dialogForm = ref({
  dateRangeValue: []
})
const ruleForm = ref(null)

// 关闭弹窗
const closeDialog = () => {
  showExportDialog.value = false
  ruleForm.value && ruleForm.value?.resetFields()
}

const exportFiles = async () => {
  const valid = await new Promise((resolve, reject) => {
    ruleForm.value?.validate(valid => {
      if (valid) {
        resolve(valid)
      } else {
        reject(valid)
      }
    })
  })
  if (valid) {
    const data = getQuery(searchComponents.value)
    data.startTime = dateFormat(dialogForm.value.dateRangeValue[0]) + ' 00:00:00'
    data.endTime = dateFormat(dialogForm.value.dateRangeValue[1]) + ' 23:59:59'
    data.queryUserId = queryUserId.value
    return exportFileV2(exportAIStatistics, data, 'AI终端使用情况', 'xlsx').finally(() => {
      const timer = setTimeout(() => {
        closeDialog()
        clearTimeout(timer)
      }, 2000)
    })
  }
}

// 一级页面访问统计
const accessStatisticsList = ref([
  {
    key: 'homePageVisitNumber',
    value: 0,
    label: '首页访问人次'
  },
  {
    key: 'personalCenterVisitNumber',
    value: 0,
    label: '个人中心访问人次'
  },
  {
    key: 'customerPageVisitNumber',
    value: 0,
    label: '客户页面访问人次'
  },
  {
    key: 'activityPageVisitNumber',
    value: 0,
    label: '活动页面访问人次'
  },
  {
    key: 'homePageVisit',
    value: 0,
    label: '首页访问人数'
  },
  {
    key: 'personalCenterVisit',
    value: 0,
    label: '个人中心访问人数'
  },
  {
    key: 'customerPageVisit',
    value: 0,
    label: '客户页面访问人数'
  },
  {
    key: 'activityPageVisit',
    value: 0,
    label: '活动页面访问人数'
  }
])

// 灵感库使用统计
const inspirationList = ref([
  {
    key: 1,
    label: '进入“找灵感”',
    pvKey: 'enterFindInspirationPV',
    pvValue: 0,
    uvKey: 'enterFindInspirationUV',
    uvValue: 0
  },
  {
    key: 2,
    label: '浏览灵感库',
    pvKey: 'exploreInspirationLibraryPV',
    pvValue: 0,
    uvKey: 'exploreInspirationLibraryUV',
    uvValue: 0
  },
  {
    key: 3,
    label: '查看解析',
    pvKey: 'viewParsingPV',
    pvValue: 0,
    uvKey: 'viewParsingUV',
    uvValue: 0
  },
  {
    key: 4,
    label: '复制解析',
    pvKey: 'copyParsingPV',
    pvValue: 0,
    uvKey: 'copyParsingUV',
    uvValue: 0
  }
])
const inspirationList2 = ref([
  {
    key: 1,
    label: '进入“找灵感”',
    pvKey: 'enterFindInspirationPV',
    pvValue: 0,
    uvKey: 'enterFindInspirationUV',
    uvValue: 0
  },
  {
    key: 2,
    label: '灵感跟拍',
    pvKey: 'inspirationFollowShootPV',
    pvValue: 0,
    uvKey: 'inspirationFollowShootUV',
    uvValue: 0
  },
  {
    key: 3,
    label: '跟拍发布',
    pvKey: 'followShootPublishPV',
    pvValue: 0,
    uvKey: 'followShootPublishUV',
    uvValue: 0
  },
  {
    key: 4,
    label: '跟拍下载',
    pvKey: 'followShootDownloadPV',
    pvValue: 0,
    uvKey: 'followShootDownloadUV',
    uvValue: 0
  }
])

// 使用时间 饼图全部
const allPieList = ref([
  {
    name: '功能区',
    key: 'doMain',
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '精彩视频',
    key: 'excitingVideo',
    configKey: 'video_recommend', // video_recommend_mini_display
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '一键成片',
    key: 'foolishVideo',
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '热门活动',
    key: 'hotActivity',
    configKey: 'task_recommend', // task_recommend_mini_display
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '素材宝典',
    key: 'materialEncyclopedia',
    configKey: 'creation_open', // creation_open_mini_display
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '创意灵感',
    key: 'originalityInspiration',
    configKey: 'creative_inspiration', // creative_inspiration_mini_display
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '本期推荐',
    key: 'periodRecommenDation',
    configKey: 'current_version_recommend', // current_version_recommend_mini_display
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '发视频',
    key: 'sendVideo',
    value: 0,
    pv: 0,
    uv: 0
  }
])
// 功能区使用时间分布
const functionalPieList = ref([
  {
    name: '账号诊断',
    key: 'accountDiagnosis',
    configKey: 'account_diagnosis',
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '文案提取',
    key: 'copywritingExtraction',
    configKey: 'copy_extractio',
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '找灵感',
    key: 'findInspiration',
    configKey: 'inspire',
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '视频榜',
    key: 'videoRanking',
    configKey: 'video_rank',
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '直播榜',
    key: 'liveRanking',
    configKey: 'live_rank',
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '金币榜',
    key: 'goldCoinRanking',
    configKey: 'gold_rank',
    value: 0,
    pv: 0,
    uv: 0
  },
  {
    name: '看数据',
    key: 'viewData',
    configKey: 'team_data',
    value: 0,
    pv: 0,
    uv: 0
  }
])

// 任务参与统计
const taskStatistics = ref([
  {
    label: '视频任务',
    key: 'videoTask',
    DetailView: 0,
    DetailViewNumber: 0,
    ImmediatelyJoinView: 0,
    ImmediatelyJoinViewNumber: 0
  },
  {
    label: '图文任务',
    key: 'noteTask',
    DetailView: 0,
    DetailViewNumber: 0,
    ImmediatelyJoinView: 0,
    ImmediatelyJoinViewNumber: 0
  },
  {
    label: '直播任务',
    key: 'liveTask',
    DetailView: 0,
    DetailViewNumber: 0,
    ImmediatelyJoinView: 0,
    ImmediatelyJoinViewNumber: 0
  }
])
// 账号统计
const accountStatistics = ref([
  {
    label: '矩阵号授权',
    key: 'accountAuthorizationPage',
    View: 0,
    ViewNumber: 0
  },
  {
    label: '客户跟进',
    key: 'customerFollow',
    View: 0,
    ViewNumber: 0
  }
])

// 时间分布
const dailyScheduleList = ref([])
</script>
<style lang="scss" scoped>
@import '@/views/content_center/components/css/page.scss';

.content_page {
  min-width: 1000px;

  .item_label {
    flex-shrink: 0;
    margin-right: 14px;
    text-align: right;
  }

  .item_content {
    flex-shrink: 0;
    width: 230px;
  }

  .item_content_flex {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .flex-left {
      flex-shrink: 0;
    }

    .flex-right {
      color: #c9c9cb;
      @include mult_line(1);
    }
  }

  .module-box {
    background: #ffffff;
    border-radius: 4px;
    margin-bottom: 16px;
    padding: 22px 24px;
  }

  .box-title {
    font-family: PingFangSC, PingFang SC;
    font-weight: 600;
    font-size: 18px;
    color: #303133;
    line-height: 26px;
    text-align: left;
    font-style: normal;
  }

  .page_center {
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;

    .center_left {
      width: 100%;

      .sub_title {
        font-size: 14px;
        margin-left: 6px;
        color: #909399;
      }
    }

    .data_screening {
      padding: 22px 24px;
      background: #ffffff;
      border-radius: $content-radius;

      .title {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      .data_box {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;

        .one_data {
          box-sizing: border-box;
          height: 85px;
          background: #f6f8fa;
          width: calc((100% - 36px) / 4);
          padding: 20px;
          margin-bottom: 12px;
          border-radius: 4px;
          text-align: center;
          position: relative;

          .tooltip-img {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 14px;
            height: 14px;
            margin-left: 8px;
          }

          .one_data_value {
            font-size: 18px;
            font-weight: bold;
            color: #333333;
            line-height: 22px;
          }

          .one_data_title {
            margin-top: 6px;

            font-size: 12px;
            font-weight: 400;
            color: #909399;
            line-height: 17px;
          }
        }
      }
    }
  }

  .flex-line {
    width: 100%;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    flex-direction: row;

    .item_1 {
      flex: 1;
      padding: 22px 20px;
      box-sizing: border-box;
    }

    > :not(:first-child) {
      margin-left: 16px;
    }

    .item_2 {
      padding: 22px 20px;
      width: calc(100% - (100% / 3) - 5px);
    }
  }

  .dialog_content {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  :deep(.el-dialog__header) {
    border-bottom: none;
    padding: 0;
  }
}
</style>

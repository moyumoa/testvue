<template>
  <div class="business_overview">
    <div class="tab_box">
      <el-tabs v-model="chooseTab" @tab-click="changeTab">
        <el-tab-pane
          :label="tab.label"
          :name="tab.key"
          v-for="tab in tabList"
          :key="tab.key"
        ></el-tab-pane>
      </el-tabs>
    </div>
    <div class="container" :key="containerKey">
      <!-- 经营概览 转化图 -->
      <ConversionChart
        class="mt_16"
        ref="ConversionChartDom"
        :settings="currentSettings"
        :options="options"
        :tab="chooseTab"
        v-model:groupId="groupId"
        @selectChange="selectChange"
        @paramChange="paramChange"
      ></ConversionChart>
      <!-- 矩阵趋势 堆叠柱状图和折线图 -->
      <TrendChart
        class="mt_16"
        ref="TrendChartDom"
        :settings="currentSettings"
        :tab="chooseTab"
        :groupId="groupId"
      ></TrendChart>
      <!-- 矩阵指数和热门视频 只有账号视角才会显示 -->
      <div class="bottom_group" v-if="chooseTab === 'account'">
        <!-- 矩阵指数榜 -->
        <AccountIndex
          ref="AccountIndexDom"
          :size="10"
          style="margin-right: 16px; min-height: 531px"
          :groupId="groupId"
        ></AccountIndex>
        <!-- 视频排行榜 -->
        <VideoRank
          ref="VideoRankDom"
          :size="10"
          style="min-height: 531px"
          :groupId="groupId"
        ></VideoRank>
      </div>
    </div>
  </div>
</template>

<script setup>
// 视频排行榜
import VideoRank from '@/views/content_center/content_overview/components/video_rank.vue'
// 矩阵指数
import AccountIndex from '@/views/content_center/content_overview/components/account_index.vue'

import { getBusinessEntity } from '@/api/system_setting/business_entity.js'
import ConversionChart from '@/views/content_center/content_matrix/business_overview/components/conversion_chart.vue'
import TrendChart from '@/views/content_center/content_matrix/business_overview/components/trend_chart.vue'
import api from '@/api/content_center/content_matrix.js'

const chooseTab = ref('account')
const ConversionChartDom = ref(null)
const TrendChartDom = ref(null)
const AccountIndexDom = ref(null)
const VideoRankDom = ref(null)

const tabList = ref([
  {
    label: '矩阵号视角',
    key: 'account'
  },
  {
    label: '成员视角',
    key: 'member'
  }
])
const containerKey = ref(null)
// tab 切换更改
const changeTab = () => {
  currentSettings.value = allSettings[chooseTab.value]
  containerKey.value = Date.now()
  groupId.value = ''
}

// 所以的tab配置 文案
const allSettings = {
  // 账号视角
  account: {
    // 等级种类
    entityList: [
      {
        key: 'accountCount',
        label: '矩阵号总数',
        value: 0,
        tips: '历史授权进系统的矩阵号总数（包含已失效的）'
      },
      {
        key: 'authValidAccountCount',
        label: '授权有效矩阵号数',
        value: 0,
        tips: '当前授权有效的矩阵号数量'
      },
      {
        key: 'activeAccountCount',
        label: '活跃矩阵号数',
        value: 0,
        tips: `7天内发布过有效视频或图文或做过有效直播的授权有效账号数量</br>有效视频：时长大于5秒，播放数大于50的视频</br>有效图文：播放数大于50的图文</br>有效直播：时长大于15分钟，场观大于30的直播`
      },
      {
        key: 'clientActiveAccountCount',
        label: '潜客活跃矩阵号数',
        value: 0,
        tips: '3天内有获取到新潜客的活跃矩阵号数量'
      }
    ],
    // 比率
    ratioList: [
      {
        key: 'authValidAccountRate',
        label: '矩阵有效率',
        value: '0'
      },
      {
        key: 'activeAccountRate',
        label: '矩阵活跃率',
        value: '0'
      },
      {
        key: 'clientActiveAccountRate',
        label: '潜客活跃率',
        value: '0'
      }
    ]
  },
  // 成员视角
  member: {
    // 等级种类
    entityList: [
      {
        key: 'userCount',
        label: '成员总数',
        value: 0
      },
      {
        key: 'coverUserCount',
        label: '矩阵覆盖成员数',
        value: 0,
        tips: '至少有运营一个矩阵号的成员数'
      },
      {
        key: 'authValidUserCount',
        label: '矩阵有效成员数',
        value: 0,
        tips: '至少有运营一个有效矩阵号的成员数'
      },
      {
        key: 'activeUserCount',
        label: '矩阵活跃成员数',
        value: 0,
        tips: '至少有运营一个活跃矩阵号（7天内有发布过有效视频或做过有效直播）的成员数'
      },
      {
        key: 'clientActiveUserCount',
        label: '潜客活跃成员数',
        value: 0,
        tips: '至少有运营一个潜客活跃矩阵号（3天内有获取到新潜客）的成员数'
      }
    ],
    // 比率
    ratioList: [
      {
        key: 'coverUserRate',
        label: '矩阵覆盖率',
        value: '0'
      },
      {
        key: 'authValidUserRate',
        label: '矩阵有效率',
        value: '0'
      },
      {
        key: 'activeUserRate',
        label: '矩阵活跃率',
        value: '0'
      },
      {
        key: 'clientActiveUserRate',
        label: '潜客活跃率',
        value: '0'
      }
    ]
  }
}
// 选择平台变化
function selectChange(platform) {
  ConversionChartDom.value && ConversionChartDom.value.platformChange(platform)
  TrendChartDom.value && TrendChartDom.value.platformChange(platform)
}
function paramChange(param) {
  TrendChartDom.value && TrendChartDom.value.paramChange(param)
  AccountIndexDom.value && AccountIndexDom.value.paramChange(param)
  VideoRankDom.value && VideoRankDom.value.paramChange(param)
}
// 设置业务主体 的配置文案
const filterSetting = item => {
  allSettings[item.principalType] = {
    // 等级种类
    entityList: [
      {
        key: 'principalCount',
        label: `${item.isGroup ? item.principalName + '分组' : item.principalName}总数`,
        value: 0,
        tips: `请至系统管理-架构管理标记${
          item.isGroup ? item.principalName + '分组' : item.principalName
        }`
      },
      {
        key: 'coverPrincipalCount',
        label: `矩阵覆盖${item.isGroup ? item.principalName + '分组' : item.principalName}数`,
        value: 0,
        tips: `至少有1个矩阵号的${
          item.isGroup ? item.principalName + '分组' : item.principalName
        }数量`
      },
      {
        key: 'authValidPrincipalCount',
        label: `矩阵有效${item.isGroup ? item.principalName + '分组' : item.principalName}数`,
        value: 0,
        tips: `至少有1个有效矩阵号的${
          item.isGroup ? item.principalName + '分组' : item.principalName
        }数量`
      },
      {
        key: 'activePrincipalCount',
        label: `矩阵活跃${item.isGroup ? item.principalName + '分组' : item.principalName}数`,
        value: 0,
        tips: `至少有1个活跃矩阵号的${
          item.isGroup ? item.principalName + '分组' : item.principalName
        }数量`
      },
      {
        key: 'clientActivePrincipalCount',
        label: `潜客活跃${item.isGroup ? item.principalName + '分组' : item.principalName}数`,
        value: 0,
        tips: `至少有1个潜客活跃矩阵号（3天内有获取到新潜客）的${
          item.isGroup ? item.principalName + '分组' : item.principalName
        }数量`
      }
    ],
    // 比率
    ratioList: [
      {
        key: 'coverPrincipalRate',
        label: '矩阵覆盖率',
        value: '0'
      },
      {
        key: 'authValidPrincipalRate',
        label: '矩阵有效率',
        value: '0'
      },
      {
        key: 'activePrincipalRate',
        label: '矩阵活跃率',
        value: '0'
      },
      {
        key: 'clientActivePrincipalRate',
        label: '潜客活跃率',
        value: '0'
      }
    ],
    isGroup: item.isGroup
  }
}

const init = async () => {
  console.log(allSettings)
  // 1。默认选中 账号视角
  changeTab()
  // 获取分组筛选项
  getNewGroupList()
  // 2。获取已经存在的业务主体，并且更新已经有的 tab 与 配置
  const res = await getBusinessEntity()
  if (res.code !== 0) return
  const list = res.data || []
  tabList.value = tabList.value.concat(
    list
      .filter(item => item.isOpen === 1)
      .map(item => {
        // 设置业务主体的配置
        filterSetting(item)
        return {
          key: item.principalType + '',
          label: item.principalName + '视角',
          isOpen: item.isOpen,
          isGroup: item.isGroup
        }
      })
  )
}
// 查询全部的信息
const currentSettings = ref({
  // 经营概览
  conversionChart: []
})

const options = ref([])

// 分组 参数
function getNewGroupList() {
  api.getNewGroupList({}).then(res => {
    if (res.code === 0) {
      options.value = res.data || []
    }
  })
}

// 经营概览 选中的id
const groupId = ref('')

// 初始化
init()
</script>
<style lang="scss" scoped>
.business_overview {
  //min-width: 1500px;
  .tab_box {
    background-color: #ffffff;
    height: 52px;
    border-radius: 4px;
    padding: 18px 24px 0;

    //margin-bottom
    :deep(.el-tabs__nav-wrap) {
      &::after {
        background-color: #ffffff;
      }

      .el-tabs__item {
        color: #909399;
        font-weight: 400;
        font-family: PingFangSC-Regular, PingFang SC;
      }

      .is-active {
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .container {
    padding-bottom: 22px;

    .bottom_group {
      display: flex;
    }
  }

  //.mt_16{
  //
  //}
}
</style>

<template>
  <div class="ranking_list">
    <div class="title_box">
      <div class="title">
        {{
          type == 'videos'
            ? '视频排行榜'
            : type == 'lives'
            ? '直播排行榜'
            : type == 'livingoods'
            ? '直播商品榜'
            : '矩阵带货榜'
        }}
      </div>
      <div class="rule_box">
        <div
          class="one_rule"
          @click="changeTitleRule(item.name)"
          :class="{ one_rule: true, choose_rule: item.name == chooseTitleRule }"
          v-for="(item, index) in titleRuleList"
          :key="index"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <el-tabs v-loading="titleLoading" v-model="chooseRule" @tab-click="changeRule">
      <el-tab-pane v-for="(tab, i) in ruleList" :key="i" :label="tab.label" :name="tab.name">
        <div class="one_pane" v-if="chooseRule == tab.name">
          <div class="list_box" v-if="list.length > 0">
            <template v-for="(item, index) in list" :key="index">
              <div class="one_list" @click="toDetail(item)">
                <div :class="'list_no text' + index">{{ index + 1 }}.</div>
                <div class="list_content" v-if="type != 'goods'">
                  <div class="one_list_content">
                    <img v-if="item.cover" :src="item.cover" alt />
                    <img v-else src="@/assets/images/content_center/default_cover.png" alt />
                    <!-- 图集 -->
                    <imgTextTask_ICON
                      v-if="type == 'videos' && item.mediaType == 2"
                      :info="item"
                      :useClick="false"
                    />
                    <!-- 视频发布平台 -->
                    <div
                      v-if="type == 'videos'"
                      :class="[`xm_platformIcon_${item.platform}`]"
                    ></div>
                  </div>
                  <div class="content_right">
                    <div class="content1">
                      <div class="content1 row_overflow">
                        {{ item.itemTitle || item.roomTitle || '--' }}
                      </div>
                      <div class="content2 row_overflow">
                        {{ `${PLATFORM.getCN(item.platform) || '抖音'}昵称` }}：{{
                          item.nickname || '--'
                        }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="list_content" v-else>
                  <img
                    v-if="item.xuserHeadImg"
                    style="width: 56px; height: 56px; border-radius: 100%"
                    :src="item.xuserHeadImg"
                    alt
                  />
                  <img
                    v-else
                    style="width: 56px; height: 56px; border-radius: 100%"
                    src="@/assets/images/content_center/default_user.png"
                    alt
                  />
                  <div class="content_right" style="max-width: calc(100% - 66px)">
                    <div class="content1">
                      <div class="content1 row_overflow">{{ item.nickname || '--' }}</div>
                      <div class="content2 row_overflow">
                        {{
                          `${PLATFORM.getCN(item.platform) || '抖音'}${
                            item.platform == 2 || item.platform == 3 ? '' : '号'
                          }`
                        }}
                        ：{{ item.dyDisplayId || '--' }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="list_num" v-if="type == 'goods'">
                  ￥{{ changeTwoDecimal(item.salesMoney || 0, true) }}
                  <!-- ￥{{ item.salesMoney / 100 || 0 }} -->
                </div>
                <div class="list_num" v-if="type == 'livingoods' && chooseTitleRule == '0'">
                  ￥{{ changeTwoDecimal(item.value || 0, true) }}
                </div>
                <div class="list_num" v-if="type == 'livingoods' && chooseTitleRule == '1'">
                  {{ wanSliceFormat(item.value || 0) }}
                </div>
                <div class="list_num" v-if="type == 'videos'">
                  <template v-if="chooseTitleRule == '0'">
                    {{ wanSliceFormat(item.playCount || 0) }}播放
                  </template>
                  <template v-else-if="chooseTitleRule == '1'">
                    {{ wanSliceFormat(item.diggCount || 0) }}点赞
                  </template>
                  <template v-else-if="chooseTitleRule == '2'">
                    {{ wanSliceFormat(item.commentCount || 0) }}评论
                  </template>
                  <template v-else-if="chooseTitleRule == '3'">
                    {{ wanSliceFormat(item.shareCount || 0) }}分享
                  </template>
                  <template v-else-if="chooseTitleRule == '6'">
                    {{ wanSliceFormat(item.clueCnt || 0) }}线索
                  </template>
                  <!-- <template v-else-if="chooseTitleRule == '2'">--</template> -->
                  <template v-else>--</template>
                </div>
                <div class="list_num" v-if="type == 'lives'">
                  <template v-if="chooseTitleRule == '0'">
                    {{ wanSliceFormat(item.watchTimes || 0) }}观看
                  </template>
                  <template v-else-if="chooseTitleRule == '1'">
                    {{ wanSliceFormat(item.fansAddNum || 0) }}粉丝
                  </template>
                  <template v-else-if="chooseTitleRule == '2'">
                    {{ wanSliceFormat(item.diggNum || 0) }}点赞
                  </template>
                  <template v-else-if="chooseTitleRule == '3'">
                    {{ wanSliceFormat(item.maxOnlineNum || 0) }}人气
                  </template>
                  <template v-else-if="chooseTitleRule == '6'">
                    {{ wanSliceFormat(item.clueCnt || 0) }}线索
                  </template>
                  <template v-else>--</template>
                </div>
              </div>
            </template>
            <div style="position: absolute; left: 50%; bottom: 0px">
              <p
                @click="toDetails()"
                style="
                  cursor: pointer;
                  display: flex;
                  justify-content: center;
                  margin-top: 10px;
                  color: #909399;
                "
              >
                更多
              </p>
            </div>
          </div>
          <div class="xm_noneData no_list" v-if="list.length == 0">
            <img src="@/assets/images/content_center/no_activity.png" alt />
            暂无数据
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import { PLATFORM } from '@/utils/dictionary/company.js'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'

import { getvideoRanking, getroomRanking, getsalesRanking } from '@/api/content_center/rank.js'
import { wanSliceFormat, changeTwoDecimal, throttle } from '@/utils/tools.js'
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'

const store = useStore()

// 留资模式 1是兼容 2是留资
const brandViewMode = computed(() => store.state.user.brandViewMode)
// 当前平台
const activePlatform = computed(() => store.state.content_center.platform)
console.log('brandViewMode-->', brandViewMode.value)
console.log('activePlatform-->', activePlatform.value)

const titleLoading = ref(true)
const props = defineProps({
  type: {
    type: String,
    default: ''
  }
})
const type = toRef(props, 'type')

// const loading = ref(true) // 加载动画
const list = ref([]) //
const chooseRule = ref('0')
const ruleList = ref([
  {
    name: '0',
    label: '日榜'
  },
  {
    name: '1',
    label: '周榜'
  },
  {
    name: '2',
    label: '月榜'
  }
])
const chooseTitleRule = ref('0')
const titleRuleList = ref([])
if (type.value === 'videos') {
  titleRuleList.value = [
    {
      name: '0',
      label: '播放数'
    },
    // {
    //   name: '2',
    //   label: '涨粉数'
    // },
    {
      name: '1',
      label: '点赞数'
    }
  ]
  if (brandViewMode.value === 2) {
    titleRuleList.value = [
      ...titleRuleList.value,
      {
        name: '2',
        label: '评论数'
      },
      {
        name: '3',
        label: '分享数'
      },
      {
        name: '6',
        label: '线索数'
      }
    ]
  }
} else if (type.value === 'lives') {
  titleRuleList.value = [
    {
      name: '0',
      label: '观看人次'
    },
    {
      name: '1',
      label: '涨粉数'
    },
    {
      name: '2',
      label: '点赞数'
    }
  ]
  // 人气峰值、线索数
  if (brandViewMode.value === 2) {
    titleRuleList.value = [
      ...titleRuleList.value,
      {
        name: '3',
        label: '人气峰值'
      },
      {
        name: '6',
        label: '线索数'
      }
    ]
  }
} else if (type.value === 'livingoods') {
  titleRuleList.value = [
    {
      name: '0',
      label: '销售额'
    },
    {
      name: '1',
      label: '销售量'
    }
  ]
} else {
  titleRuleList.value = [
    {
      name: '0',
      label: '直播'
    },
    {
      name: '1',
      label: '视频'
    }
  ]
}
const router = useRouter()
const toDetails = throttle(function () {
  // debugger
  if (type.value === 'videos') {
    router.push(`/content_center/video_rankinglist`)
  } else if (type.value === 'lives') {
    router.push(`/content_center/live_rankinglist`)
  } else {
    router.push(`/content_center/commerce_rankinglist`)
  }
}, 500)
function weekCheckingIn() {
  const now = new Date()
  const nowTime = now.getTime()
  const day = now.getDay() || 7 // 不加 || 7.周末会变成下周一
  const oneDayTime = 24 * 60 * 60 * 1000
  const MondayTime = nowTime - (day - 1) * oneDayTime // 显示周一
  const SundayTime = nowTime + (7 - day) * oneDayTime // 显示周日

  return [new Date(MondayTime), new Date(SundayTime)]
}
const timeList = reactive({
  dailyEnd: dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD 23:59:59'), // 日榜的结束日期
  dailyStart: dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD 00:00:00'), // 日榜的开始日期
  zhouStart: dayjs(weekCheckingIn()[0]).format('YYYY-MM-DD 00:00:00'), // 周榜的开始日期
  zhouEnd: dayjs(weekCheckingIn()[1]).format('YYYY-MM-DD 23:59:59'), // 周榜的结束日期
  monthStart: dayjs(new Date()).startOf('month').format('YYYY-MM-DD 00:00:00'), // 月榜的开始日期
  monthEnd: dayjs(new Date()).endOf('month').format('YYYY-MM-DD 23:59:59') // 月榜的结束日期,
})

// 表头的tab切换
const changeTitleRule = throttle(e => {
  console.log(chooseTitleRule.value)
  chooseTitleRule.value = e
  getEveryDataFun(e, chooseRule.value)
}, 300)

changeTitleRule('0')
// tab切换
function changeRule() {
  getEveryDataFun(chooseTitleRule.value, chooseRule.value)
}
// 每个榜单获取对应的数据
function getEveryDataFun() {
  titleLoading.value = true
  if (type.value === 'videos') {
    getVideoInterfaceFun()
  } else if (type.value === 'lives') {
    getLiveInterfaceFun()
  } else if (type.value === 'livingoods') {
    // if (e === '0') {
    //   getLiveSalesFun()
    // } else {
    //   getLiveSalesFun()
    // }
  } else {
    getGoodInterfaceFun()
  }
}
// 跳转页面
const toDetail = throttle(function (e) {
  let url = ''
  switch (props.type) {
    case 'videos':
      url = `/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(
        e.dyItemId
      )}`
      break
    case 'lives':
      url = `/content_center/live_center/detail?roomId=${e.dyRoomId}&dyOpenId=${e.dyOpenId}`
      break
    case 'goods':
      url = `/content_center/content_matrix/details?openId=${e.dyOpenId}`
      break
  }
  router.push(url)
}, 500)
// 视频排行榜的接口
function getVideoInterfaceFun() {
  getvideoRanking({
    platform: activePlatform.value || null,
    areaIds: [],
    groupIds: [],
    pageNo: 1,
    pageSize: 5,
    videoRankingType: Number(chooseTitleRule.value) + 1 || 1,
    startDate:
      chooseRule.value === '0'
        ? timeList.dailyStart
        : chooseRule.value === '1'
        ? timeList.zhouStart
        : timeList.monthStart,
    endDate:
      chooseRule.value === '0'
        ? timeList.dailyEnd
        : chooseRule.value === '1'
        ? timeList.zhouEnd
        : timeList.monthEnd
  })
    .then(res => {
      if (res.code === 0) {
        list.value = res.data.records || []
      } else {
        list.value = []
      }
      titleLoading.value = false
    })
    .catch(() => {
      list.value = []
      titleLoading.value = false
    })
}
// 直播排行榜的接口
function getLiveInterfaceFun() {
  getroomRanking({
    platform: activePlatform.value || null,
    areaIds: [],
    groupIds: [],
    pageNo: 1,
    pageSize: 5,
    liveRankingType: Number(chooseTitleRule.value) + 1 || 1,
    startDate:
      chooseRule.value === '0'
        ? timeList.dailyStart
        : chooseRule.value === '1'
        ? timeList.zhouStart
        : timeList.monthStart,
    endDate:
      chooseRule.value === '0'
        ? timeList.dailyEnd
        : chooseRule.value === '1'
        ? timeList.zhouEnd
        : timeList.monthEnd
  })
    .then(res => {
      if (res.code === 0) {
        list.value = res.data.records || []
      } else {
        list.value = []
      }
      titleLoading.value = false
    })
    .catch(() => {
      list.value = []
      titleLoading.value = false
    })
}
// 矩阵带货榜的接口
function getGoodInterfaceFun() {
  getsalesRanking({
    platform: activePlatform.value || undefined,
    areaIds: [],
    groupIds: [],
    pageNo: 1,
    pageSize: 5,
    salesRankingType: chooseTitleRule.value === '0' ? 2 : 1,
    startDate:
      chooseRule.value === '0'
        ? timeList.dailyStart
        : chooseRule.value === '1'
        ? timeList.zhouStart
        : timeList.monthStart,
    endDate:
      chooseRule.value === '0'
        ? timeList.dailyEnd
        : chooseRule.value === '1'
        ? timeList.zhouEnd
        : timeList.monthEnd
  })
    .then(res => {
      if (res.code === 0) {
        list.value = res.data.records || []
      } else {
        list.value = []
      }
      titleLoading.value = false
    })
    .catch(() => {
      list.value = []
      titleLoading.value = false
    })
}
defineExpose({ getEveryDataFun })
</script>
<style lang="scss" scoped>
@import '../../components/css/page.scss';
.ranking_list {
  position: relative;
  .title_box {
    margin-bottom: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .rule_box {
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      .one_rule {
        padding-left: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #909399;
        line-height: 20px;
        padding-right: 8px;
        &:last-child {
          padding-right: 0px;
        }
      }
      .one_rule + .one_rule {
        border-left: 1px solid #e8e8e8;
      }
      .choose_rule {
        color: $theme_color;
      }
    }
  }
  .one_pane {
    min-height: 424px;
  }
  .no_list {
    height: 424px;
  }
  .list_box {
    width: 100%;
    .one_list {
      cursor: pointer;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      margin-top: 20px;
      &:first-child {
        margin-top: 0;
      }

      .list_no {
        width: 26px;
        font-size: 16px;
        color: #909399;
        line-height: 19px;
      }
      .text0 {
        color: #db5335;
      }
      .text1 {
        color: #dd713e;
      }
      .text2 {
        color: #eeaf14;
      }
      .list_content {
        width: calc(100% - 126px);
        padding-right: 10px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        img {
          width: 48px;
          height: 64px;
          background: #d8d8d8;
          border-radius: 4px;
          object-fit: cover;
          margin-right: 10px;
        }
        .one_list_content {
          margin-right: 10px;
          width: 48px;
          height: 64px;
          position: relative;
          img {
            margin-right: 0;
          }
        }
        .content_right {
          height: 64px;
          max-width: calc(100% - 58px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          .content1 {
            max-width: 100%;
            font-size: 14px;
            font-weight: 400;
            color: #303133;
            line-height: 20px;
          }
          .content2 {
            max-width: 100%;
            margin-top: 4px;
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            line-height: 20px;
          }
        }
      }
      .list_num {
        width: 100px;
        text-align: right;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
    }
  }
}
:deep(.toolTip_box) {
  max-width: 100px !important;
}
</style>

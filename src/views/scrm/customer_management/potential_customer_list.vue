<template>
  <div>
    <div class="customer-setting">
      <el-tabs class="tab_box hide_underline" v-model="chooseRule" @tab-click="changeTab">
        <el-tab-pane label="潜客列表" name="list"></el-tab-pane>
        <el-tab-pane label="获客规则" name="keyword">
          <keyword v-if="chooseRule === 'keyword'" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="customer_management" v-show="chooseRule === 'list'">
      <!-- 筛选条件 -->
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
        ref="xmSearchRef"
      >
        <template #labelTip>
          <el-tooltip class="item" effect="dark" content="" placement="top">
            <template #content>
              <div style="max-width: 300px">用于筛选员工在小程序手动录入手机号码的留资客户</div>
            </template>
            <img
              src="@/assets/images/content_center/tip_line.png"
              style="width: 14px; height: 14px; margin-left: 5px"
              alt
            />
          </el-tooltip>
        </template>
        <template #searchBtn>
          <exp_button type="default" :asyncFunc="exportFunV2">导出</exp_button>
        </template>
      </xm_search>
      <!-- 列表 -->
      <div class="table_box">
        <div class="btn_box">
          <template v-if="showBatchSwitch">
            <el-button plain @click="chooseAllFun">
              {{ isAllBatch ? '取消全选' : '全选' }}
            </el-button>
            <el-button
              type="primary"
              :loading="batchAllocationInfo.loading"
              @click="showAllocationFun"
            >
              批量分配
            </el-button>
          </template>
          <el-switch
            style="margin: 0 12px 0 24px"
            v-model="showBatchSwitch"
            inline-prompt
            :width="45"
            active-text="开"
            inactive-text="关"
            @change="switchChange"
          ></el-switch>
          <span style="color: #909399">批量操作</span>
        </div>
        <xm_table
          ref="tableRef"
          rowKey="id"
          :showSelection="showBatchSwitch"
          tableType="default"
          v-loading="tableForm.loading"
          :data="tableForm.listData"
          v-model:page="tableForm.page"
          @getTableData="getList"
          @selection-change="handleSelectionChange"
          :checkSelectable="handleCheckSelectable"
          :select="chooseList"
        >
          <el-table-column min-width="150" label="客户信息">
            <template v-slot="{ row }">
              <div class="user_box">
                <div class="user_head_box">
                  <img v-if="row.clientAvatar" :src="row.clientAvatar" class="user_head" alt="" />
                  <img
                    v-else
                    src="@/assets/images/content_center/default_user.png"
                    class="user_head"
                    alt=""
                  />
                  <div
                    style="width: 18px; height: 18px"
                    :class="[`xm_platformIcon_${row.platform}`]"
                  ></div>
                </div>
                <div class="user_content">
                  <div class="content1">
                    <div class="content_text row_overflow">
                      {{ row.clientNickname || '匿名客户' }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="140" prop="clientPhone" label="联系电话">
            <template v-slot="{ row }">
              <table_column_phone :phone="row.clientPhone"></table_column_phone>
            </template>
          </el-table-column>
          <!-- <el-table-column min-width="100" prop="地区" label="地区">
            <template v-slot="{ row }">
              <span v-if="row.clientProvince && row.clientCity">
                {{ row.clientProvince + '-' + row.clientCity }}
              </span>
              <span v-else>--</span>
            </template>
          </el-table-column> -->
          <!--          <el-table-column min-width="100" prop="clientRelate" label="客户关系">-->
          <!--            <template v-slot="{ row }">-->
          <!--              &lt;!&ndash;            {{ CUSTOMER_RELATE.getCN(row.clientRelate) || '&#45;&#45;' }}&ndash;&gt;-->
          <!--              {{ row.clientRelateStr }}-->
          <!--            </template>-->
          <!--          </el-table-column>-->
          <el-table-column min-width="180" label="来源矩阵号">
            <template v-slot="{ row }">
              <div>
                {{ row.nickName || '--' }}
                <!-- 矩阵号被删除 -->
                <div class="xm_delClass" v-if="row.xuserIsDel && row.xuserIsDel == 1"></div>
              </div>
              <!-- 业务主体 -->
              <table_column_business_entity :list="row.businessNameList" />
            </template>
          </el-table-column>
          <el-table-column min-width="100" label="关键互动">
            <template v-slot="{ row }">
              <div class="badge" v-if="row.keyEvent">
                {{ row.keyEvent }}
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column min-width="220" label="互动来源">
            <template v-slot="{ row }">
              <div
                class="form_box"
                :class="{ can_click: canJumpDetail(row) }"
                @click="toDetail(row)"
              >
                <img
                  class="form_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/2022062391ont.png"
                  alt=""
                  v-if="row.intention == 1 && row.eventVideoItemId"
                />
                <img
                  class="form_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230313lwzlo.png"
                  alt=""
                  v-if="row.intention == 2 && (row.eventRoomId || row.openId)"
                />
                <div
                  class="form_content from"
                  :style="
                    !(
                      (row.intention == 1 && row.eventVideoItemId) ||
                      (row.intention == 2 && (row.eventRoomId || row.openId))
                    )
                      ? ''
                      : 'width:100%'
                  "
                >
                  {{
                    row.intention == 1
                      ? row.videoTitle || '--'
                      : row.intention == 2
                      ? row.roomTitle || '--'
                      : '--'
                  }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="310" label="互动内容">
            <template v-slot="{ row }">
              <div class="text_more" :title="row.keyEventStr">{{ row.keyEventStr || '--' }}</div>
            </template>
          </el-table-column>
          <el-table-column min-width="180" label="创建时间">
            <template v-slot="{ row }">
              {{ row.gmtCreate || '--' }}
            </template>
          </el-table-column>
          <el-table-column min-width="180" label="互动时间">
            <template v-slot="{ row }">
              {{ row.keyEventTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column min-width="180" label="留资时间">
            <template v-slot="{ row }">
              {{ row.gmtUpdate || '--' }}
            </template>
          </el-table-column>
          <el-table-column min-width="100" label="意向标签">
            <template v-slot="{ row }">
              {{ row.clientIntentStatusStr || '--' }}
            </template>
          </el-table-column>
          <!--          <el-table-column min-width="120" label="最近互动类型">-->
          <!--            <template v-slot="{ row }">-->
          <!--              {{ row.lastEventTypeStr || '&#45;&#45;' }}-->
          <!--            </template>-->
          <!--          </el-table-column>-->
          <!--          <el-table-column min-width="160" prop="lastInteractionTime" label="最近互动时间">-->
          <!--            <template v-slot="{ row }">-->
          <!--              {{ row.lastInteractionTime || '&#45;&#45;' }}-->
          <!--            </template>-->
          <!--          </el-table-column>-->
          <el-table-column min-width="100" label="分配状态">
            <template v-slot="{ row }">
              {{ row.isValid == 1 ? '已分配' : row.isValid == 0 ? '待分配' : '-' || '--' }}
            </template>
          </el-table-column>
          <el-table-column min-width="170" label="客户状态">
            <template v-slot="{ row }">
              {{ customerStatus(row) }}
            </template>
          </el-table-column>
          <el-table-column min-width="100" prop="clientBelongedName" label="归属人">
            <template v-slot="{ row }">
              {{ row.clientBelongedName || '--' }}
            </template>
          </el-table-column>
          <!--          <el-table-column min-width="140" prop="clientBelongedPhone" label="归属人联系方式">-->
          <!--            <template v-slot="{ row }">-->
          <!--              {{ row.clientBelongedPhone || '&#45;&#45;' }}-->
          <!--            </template>-->
          <!--          </el-table-column>-->
          <!--          <el-table-column min-width="100" label="跟进状态">-->
          <!--            <template v-slot="{ row }">-->
          <!--              {{ CUSTOMER_FOLLOW_STATUS.getCN(row.clientConsultStatus) || '&#45;&#45;' }}-->
          <!--            </template>-->
          <!--          </el-table-column>-->
          <el-table-column
            label="操作"
            fixed="right"
            width="260"
            align="right"
            header-align="right"
          >
            <template v-slot="{ row }">
              <div class="table_ope">
                <!-- 潜客存在openid才显示分配以及进入会话按钮（clientOpenId字段）-->
                <template v-if="row.isValid == 0 && (row.clientOpenId || row.fromUid)">
                  <el-link type="primary" @click="openDistribution(row)">分配</el-link>
                  <div class="ling"></div>
                </template>
                <!-- 回复评论： 未被删除 && 视频潜客才有-->
                <template v-if="row.xuserIsDel === 0 && row.clientSource == 110">
                  <el-link type="primary" @click="openVideoCommentFun(row)">回复评论</el-link>
                  <div class="ling"></div>
                </template>
                <!-- 旧 进入会话： 未被删除 &&（视频潜客-认证企业号/员工号 || 私信潜客-认证企业号/员工号 || 历史内容中台线索来源-认证企业号/员工号） -->
                <!-- 1.4： 现在小红书是拉不到视频的 所以只要判断小红书平台就行-->
                <!-- 新 进入会话： 未被删除 && (视频潜客||私信潜客||历史内容中台线索来源) && (抖音平台是认证企业号/员工号 || 小红书平台是专业号) -->
                <template
                  v-if="
                    row.xuserIsDel === 0 &&
                    (row.clientSource == 112 ||
                      row.clientSource == 110 ||
                      row.clientSource == 310 ||
                      row.clientSource == 311 ||
                      row.clientSource == 312 ||
                      row.clientSource == 313) &&
                    ((row.platform === 1 &&
                      (row.eaccountRole == 'EAccountS' ||
                        row.eaccountRole == 'EAccountK' ||
                        row.enterpriseType)) ||
                      row.platform === 3)
                  "
                >
                  <el-link type="primary" @click="openChat(row)">进入会话</el-link>
                  <div class="ling"></div>
                </template>
                <el-link type="primary" @click="toDetails(row)">详情</el-link>
              </div>
            </template>
          </el-table-column>
        </xm_table>
      </div>
      <!-- 分配弹窗 -->
      <AllocationDialog
        v-if="showAll"
        :btnLoading="dispatchLoading"
        @close="allClose"
        @confirm="allConfirm"
        :isBatch="batchAllocationInfo.isBatch"
        :customerLength="batchAllocationInfo.batchCount"
      />
    </div>
    <!-- 视频评论详情弹窗 -->
    <videoDialog v-if="videoCommentInfo.show" :videoDialog="videoCommentInfo" />
  </div>
</template>

<script setup>
import videoDialog from './dialog/video_dialog.vue'
import { pageList } from './model/get_potential_list.js'
import { throttle, isEmpty } from '@/utils/tools.js'
import { createNewChat } from '../session_management/js/tools'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
import { CUSTOMER_FOLLOW_STATUS, CUSTOMER_STEP_STATUS } from '@/utils/dictionary/customer.js'
import AllocationDialog from '../components/allocation-dialog.vue'
// import { getCustomerSetting } from '@/api/scrm/customer.js'
import Keyword from '@/views/scrm/customer_management/keyword.vue'
import { ElMessage } from 'element-plus'
import { setBusinessChooseParam } from '@/utils/search.js'

const store = useStore()
const router = useRouter()
const { query } = useRoute()

const vm = getCurrentInstance()
const {
  searchComponents,
  searchComponents1,
  getList,
  tableForm,
  exportFunV2,
  dispatchLoading,
  cusDispatch,
  cusBatchDispatch,
  tableRef,
  setCheck,
  clearTableChoose,
  isAllBatch,
  chooseList,
  batchAllocationInfo,
  showAllocationFun,
  showAll,
  cusDispatchQuery,
  getUserGroupList
} = pageList(vm)

const chooseRule = ref('')
// 获取链路中的参数
function gettable() {
  const fromPath = store.state.page.fromPath
  if (query.type && query.type === '2' && fromPath === '/scrm/message_policy') {
    chooseRule.value = 'keyword'
  } else {
    chooseRule.value = 'list'
  }
}
function changeTab(val) {
  console.log(val, 'val')
  chooseRule.value = val.props.name
  if (val.props.name === 'list') {
    xmSearchRef.value?.reset()
  }
}

function allClose() {
  showAll.value = false
}
function allConfirm(val) {
  dispatchLoading.value = true
  // 如果是批量分配
  if (batchAllocationInfo.isBatch) {
    cusBatchDispatch(val)
    return
  }
  cusDispatchQuery.clientId = allocationData.value.clientId
  cusDispatchQuery.clientUserBindId = allocationData.value.clientUserBindId
  cusDispatchQuery.targetUserId = val
  cusDispatch()
}
// 清空查询参数
function clearSearchQuery() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
}
// 查询
function searchList() {
  clearTableChoose()
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}

// 重置
function resetSearch() {
  clearTableChoose()
  clearSearchQuery()
  getList()
}
clearSearchQuery()

const allocationData = reactive({})
// 进入分配
const openDistribution = throttle(function (row) {
  // 清空批量分配的数据
  batchAllocationInfo.loading = false
  batchAllocationInfo.batchCount = null
  batchAllocationInfo.isBatch = false
  allocationData.value = row
  showAll.value = true
})
// 发起会话
const openChat = throttle(function (e) {
  const fromUser = {
    openId: e.fromUid || e.clientOpenId,
    avatar: e.clientAvatar,
    name: e.clientNickname,
    clientUserId: e.clientUserId, // scrm 多存储一个用于请求互动记录
    source: e.clientSource // scrm五期是否显示icon
  }
  const toUser = {
    openId: e.toUid || e.openId,
    avatar: e.headUrl,
    name: e.nickName
  }
  createNewChat(fromUser, toUser, () => {
    router.push({
      path: '/scrm/session_management',
      query: { fromUserId: fromUser.openId, toUserId: toUser.openId, clientUserId: e.clientUserId }
    })
    store.commit('chat/needIntendedChat', true)
  })
}, 700)
// 去详情
const toDetails = throttle(function (row) {
  router.push({
    path: '/scrm/potential_customer_list/potential_details',
    query: {
      clientUserBindId: row.clientUserBindId,
      fromOpenId: row.clientOpenId,
      toOpenId: row.openId,
      fromUid: row.fromUid,
      clientUserId: row.id,
      clientUserType: row.clientPhone ? 2 : 1,
      toUserId: row.toUserId,
      fromUserId: row.fromUserId
    }
  })
}, 700)

// // 是否开启客户分配
// const canDistribution = ref(false)
// const getSetting = () => {
//   getCustomerSetting({ type: 3 }).then(res => {
//     if (res.code === 0) {
//       if (res.code === 0) {
//         canDistribution.value = res.data !== 0
//       }
//     }
//   })
// }
// 能跳转详情
const canJumpDetail = row => {
  const { intention, eventRoomId, openId, eventVideoItemId, cgpContentExist } = row
  //  内容中台内容资源不存在就无法跳转
  if (!cgpContentExist) return false
  // 只有直播和视频才能跳转
  if (![1, 2].includes(intention)) return false
  if (intention === 1 && !eventVideoItemId) {
    return false
  }
  if (intention === 2 && (!eventRoomId || !openId)) {
    return false
  }
  return true
}
function toDetail(row) {
  // if (!row.intentionDesc) return
  const { intention, eventRoomId, openId, eventVideoItemId } = row
  if (!canJumpDetail(row)) {
    // ElMessage.warning('暂无意向来源')
    return
  }
  const jumpSrc = {
    1: `/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(
      eventVideoItemId
    )}`, // 视频
    2: `/content_center/live_center/detail?roomId=${eventRoomId}&dyOpenId=${openId}` // 直播
  }
  const url = location.origin + jumpSrc[intention]
  window.open(url)
}
const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    // chooseRule.value = 'list'
    gettable()
    if (xmSearchRef.value) {
      clearTableChoose()
      xmSearchRef.value?.reset()
    } else {
      resetSearch()
    }
    menuOfKeepAlive('reset')
  } else {
    clearTableChoose()
    getList()
  }
  // chooseRule.value = 'list'
  // getSetting()
  getUserGroupList()
  gettable()
  // 为保证业务主体是最新的，
  const businessChooseObj = {}
  searchComponents.value.forEach(item => {
    if (!item.hiddenItem) {
      if (item.type === 'chooseBusiness' || item.type === 'chooseBusinessGroup') {
        const info = {
          ids: item.ids || [],
          isCheckAll: item.isCheckAll || false
        }
        businessChooseObj[item.principalType] = info
      }
    }
  })
  if (isEmpty(businessChooseObj)) {
    const list = setBusinessChooseParam(businessChooseObj)
    searchComponents.value = searchComponents1.value.concat(list)
  }
})

// 页面里开的时候 清空分组组件
onBeforeRouteLeave((to, from) => {
  if (
    to.path !== '/scrm/potential_customer_list/potential_details' &&
    to.path !== '/scrm/session_management'
  ) {
    searchComponents.value = []
    nextTick(() => {
      searchComponents.value = searchComponents1.value
    })
  }
})
// 客户状态
const customerStatus = item => {
  if (!item.clientConsultStatus || !item.clientConsultStage) {
    return '--'
  }
  return `${CUSTOMER_FOLLOW_STATUS.getCN(item.clientConsultStatus)} - ${CUSTOMER_STEP_STATUS.getCN(
    item.clientConsultStage
  )}`
}
// 回复评论
const videoCommentInfo = reactive({
  show: false
})
const openVideoCommentFun = throttle(function (row) {
  if (row.eventVideoItemId) {
    videoCommentInfo.info = {
      clientUserBindId: row.clientUserBindId,
      fromOpenId: row.clientOpenId,
      toOpenId: row.openId,
      fromUid: row.fromUid,
      clientUserId: row.id,
      toUserId: row.toUserId,
      fromUserId: row.fromUserId,
      clientUserType: row.clientPhone ? 2 : 1
    }
    videoCommentInfo.cgpContentExist = row.cgpContentExist
    videoCommentInfo.videoId = row.eventVideoItemId
    videoCommentInfo.show = true
  } else {
    ElMessage.warning('暂未找到视频信息')
  }
}, 500)

// 批量操作相关
const showBatchSwitch = ref(false) // 批量操作的开关

// 当选择项发生变化时
function handleSelectionChange(e) {
  chooseList.value = e
}
// 决定这一行的 CheckBox 是否可以勾选 --
// 目前只有待分配的客户前才有多选框，其他禁用--
function handleCheckSelectable(row) {
  if (isAllBatch.value) {
    return false
  } else {
    return row.isValid === 0
  }
}

// 批量操作的开关变换 清空批量的所有数据
function switchChange() {
  clearTableChoose()
  showAll.value = false
}
// 全选/取消全选
const chooseAllFun = throttle(() => {
  if (isAllBatch.value) {
    tableRef.value.$refs.table.clearSelection()
  } else {
    setCheck(true)
  }
  nextTick(() => {
    isAllBatch.value = !isAllBatch.value
  })
}, 500)
</script>
<style lang="scss" scoped>
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  border-radius: 4px;
}

.customer-setting {
  //min-height: calc(100% - 20px);
  // background: #ffffff;
  border-radius: 2px;

  .main-title {
    padding: 0 24px;
    line-height: 70px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #dcdee0;
  }

  .container {
    padding: 4px 24px;
    font-size: 14px;
    line-height: 30px;
    color: #606266;

    .module-title {
      margin-top: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;

      .switch {
        margin-left: 12px;
      }
    }
  }
}
.customer_management .xm_search {
  :deep(.el-tag__content) {
    max-width: 100px !important;
  }
}

.table_box {
  background: #fff;
  padding: 22px 24px;
  margin-top: 16px;
  .btn_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
  }
  .table_top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .mark {
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
  }
  .from {
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    // white-space: pre-wrap;
  }
  .can_click {
    cursor: pointer;
  }
}

.user_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .user_head_box {
    width: 36px;
    height: 36px;
    margin-right: 4px;
    position: relative;
  }
  .user_head {
    width: 36px;
    height: 36px;
    border-radius: 100%;
  }

  .user_content {
    width: calc(100% - 40px);
    min-height: 36px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    .content1 {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;

      font-weight: 500;
      color: #303133;
      line-height: 20px;

      .content_text {
        width: max-content;
        // max-width: calc(100% - 40px);
        max-width: 100%;
      }

      img {
        width: 16px;
        height: 16px;
        margin-left: 4px;
      }
    }

    .content2 {
      margin-top: 6px;
      font-size: 12px;

      font-weight: 400;
      color: #909399;
      line-height: 17px;
    }
  }
}

//:deep(.el-date-editor .el-icon) {
//  top: 9px !important;
//}

// 操作
.table_ope {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .ling {
    height: 12px;
    border-left: 1px solid #bfc4cd;
    margin: 0 8px;
  }
}

// 对互动内容单独处理
.text_more {
  overflow: hidden; // 溢出隐藏
  text-overflow: ellipsis; // 溢出用省略号显示
  display: -webkit-box; // 作为弹性伸缩盒子模型显示。
  -webkit-box-orient: vertical; // 设置伸缩盒子的子元素排列方式：从上到下垂直排列
  -webkit-line-clamp: 2; // 显示的行数
}

//
.badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 400;
  color: #364fcd;
  line-height: 18px;
  background: rgba(54, 79, 205, 0.1);
  border-radius: 2px;
  border: 1px solid #364fcd;
  padding: 0 4px;
  height: 19px;
}
.form_icon {
  width: 20px;
  height: 20px;
  display: inline-block;
  object-fit: contain;
  margin-right: 4px;
}
.form_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .form_content {
    width: calc(100% - 24px);
  }
}
</style>

<template>
  <div class="customer_management">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
      ref="xmSearchRef"
    >
      <template #searchBtn>
        <exp_button type="default" :asyncFunc="exportFunV2">导出</exp_button>
      </template>
    </xm_search>
    <!-- 列表 -->
    <div class="table_box">
      <xm_table
        tableType="avatar"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="150" label="客户信息">
          <template v-slot="{ row }">
            <div class="user_box">
              <img v-if="row.clientAvatar" :src="row.clientAvatar" class="user_head" alt="" />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                class="user_head"
                alt=""
              />
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
        <el-table-column min-width="140" prop="clientPhone" label="联系方式">
          <template v-slot="{ row }">
            <table_column_phone :phone="row.clientPhone"></table_column_phone>
          </template>
        </el-table-column>
        <el-table-column min-width="100" prop="地区" label="地区">
          <template v-slot="{ row }">
            <span v-if="row.clientProvince && row.clientCity">
              {{ row.clientProvince + '-' + row.clientCity }}
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <!--        <el-table-column min-width="100" prop="clientRelate" label="客户关系">-->
        <!--          <template v-slot="{ row }">-->
        <!--            &lt;!&ndash;            {{ CUSTOMER_RELATE.getCN(row.clientRelate) || '&#45;&#45;' }}&ndash;&gt;-->
        <!--            {{ row.clientRelateStr }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column min-width="150" label="来源抖音">
          <template v-slot="{ row }">
            {{ row.nickName || '--' }}
            <!-- 矩阵号被删除 -->
            <div class="xm_delClass" v-if="row.xuserIsDel && row.xuserIsDel == 1"></div>
          </template>
        </el-table-column>
        <el-table-column min-width="180" label="意向来源">
          <template v-slot="{ row }">
            <div
              class="from"
              :class="{ can_click: row.intentionDesc || canJumpDetail(row) }"
              @click="toDetail(row)"
            >
              {{ row.intentionDesc || '--' }}
            </div>
          </template>
        </el-table-column>
        <!--        <el-table-column min-width="100" label="留资来源">-->
        <!--          <template v-slot="{ row }">-->
        <!--            {{ row.clueSourceStr }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
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
        <!--        <el-table-column min-width="120" label="最近互动类型">-->
        <!--          <template v-slot="{ row }">-->
        <!--            {{ row.lastEventTypeStr || '&#45;&#45;' }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <!--        <el-table-column min-width="160" prop="lastInteractionTime" label="最近互动时间">-->
        <!--          <template v-slot="{ row }">-->
        <!--            {{ row.lastInteractionTime || '&#45;&#45;' }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
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
        <!--        <el-table-column min-width="140" prop="clientBelongedPhone" label="归属人联系方式">-->
        <!--          <template v-slot="{ row }">-->
        <!--            <table_column_phone :phone="row.clientBelongedPhone"></table_column_phone>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <!--        <el-table-column min-width="100" label="跟进状态">-->
        <!--          <template v-slot="{ row }">-->
        <!--            {{ CUSTOMER_FOLLOW_STATUS.getCN(row.clientConsultStatus) || '&#45;&#45;' }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column
          label="操作"
          fixed="right"
          min-width="180"
          align="right"
          header-align="right"
        >
          <template v-slot="{ row }">
            <div class="table_ope">
              <template v-if="row.isValid == 0 && canDistribution">
                <el-link type="primary" @click="openDistribution(row)">分配</el-link>
                <div class="ling"></div>
              </template>
              <!-- enterImStatus字段在scrm五期新增用于判断是否能进入会话 -->
              <!-- .imEnable === 1 && -->
              <!-- 8期放开进入会话 v-if="row.enterImStatus" -->
              <el-link type="primary" @click="openChat(row)">进入会话</el-link>
              <div class="ling"></div>
              <el-link type="primary" @click="toDetails(row)">详情</el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 分配弹窗 -->
    <AllocationDialog
      v-if="showAll"
      @close="allClose"
      @confirm="allConfirm"
      :cusInfo="allocationData.value"
    />
  </div>
</template>

<script setup>
import { pageList } from './model/get_list.js'
import { throttle } from '@/utils/tools.js'
import { createNewChat } from '../session_management/js/tools'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { CUSTOMER_FOLLOW_STATUS, CUSTOMER_STEP_STATUS } from '@/utils/dictionary/customer.js'
import AllocationDialog from '../components/allocation-dialog.vue'
import { getCustomerSetting } from '@/api/scrm/customer.js'
import { ElMessage } from 'element-plus'

const store = useStore()
const router = useRouter()

const vm = getCurrentInstance()
const {
  searchComponents,
  getList,
  tableForm,
  exportFunV2,
  searchList,
  cusDispatch,
  showAll,
  cusDispatchQuery,
  getUserGroupList
} = pageList(vm)

function allClose() {
  showAll.value = false
}

function allConfirm(val) {
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
// 重置
function resetSearch() {
  clearSearchQuery()
  getList()
}

clearSearchQuery()

const allocationData = reactive({})
// 进入分配
const openDistribution = throttle(function (row) {
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
    path: '/scrm/customer_management/details',
    query: {
      clientUserBindId: row.clientUserBindId,
      fromOpenId: row.clientOpenId,
      toOpenId: row.openId,
      clientUserId: row.id,
      clientUserType: 2
    }
  })
}, 700)

// 是否开启客户分配
const canDistribution = ref(false)
const getSetting = () => {
  getCustomerSetting({ type: 3 }).then(res => {
    if (res.code === 0) {
      canDistribution.value = res.data !== 0
    }
  })
}
const canJumpDetail = row => {
  const { intention, eventRoomId, openId, eventVideoItemId } = row
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
    ElMessage.warning('暂无意向来源')
    return
  }
  const jumpSrc = {
    1: `/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(
      eventVideoItemId
    )}`, // 视频
    2: `/content_center/live_center/detail?roomId=${eventRoomId}&dyOpenId=${openId}` // 直播
  }
  console.log()
  const url = location.origin + jumpSrc[intention]
  window.open(url)
}
const customerStatus = item => {
  if (!item.clientConsultStatus || !item.clientConsultStage) {
    return '--'
  }
  return `${CUSTOMER_FOLLOW_STATUS.getCN(item.clientConsultStatus)} - ${CUSTOMER_STEP_STATUS.getCN(
    item.clientConsultStage
  )}`
}

const xmSearchRef = ref(null)
const menuOfKeepAlive = inject('$menuOfKeepAlive')
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    if (xmSearchRef.value) {
      xmSearchRef.value?.reset()
    } else {
      resetSearch()
    }
    menuOfKeepAlive('reset')
  } else {
    getList()
  }
  getUserGroupList()
  getSetting()
})
//
</script>
<style lang="scss" scoped>
.customer_management .xm_search {
  :deep(.el-tag__content) {
    max-width: 100px !important;
  }
}

.table_box {
  background: #fff;
  padding: 22px 24px;
  margin-top: 16px;
  border-radius: 4px;
  .table_top {
    margin-left: -18px;
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
    -webkit-line-clamp: 2;
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

  .user_head {
    width: 36px;
    height: 36px;
    border-radius: 100%;
    margin-right: 4px;
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
</style>

<template>
  <div class="dy_wrapper">
    <!-- <xm_search>
      <div class="search_item">
        <label class="item_label">快手号</label>
        <div class="item_content">
          <el-input v-model="searchForm.authName" placeholder="请输入快手昵称" clearable />
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">矩阵号部门</label>
        <div class="item_content">
          <choose_dept_search
            ref="chooseDeptSearchRef"
            @updateDeptIds="updateDeptIds"
            :multiple="true"
            :isUsePermission="true"
            searchLabel="矩阵号部门"
          />
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">授权状态</label>
        <div class="item_content">
          <el-select
            v-model="searchForm.dyAuthStatus"
            placeholder="请选择授权状态"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in statusListSphKs"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">是否有运营者</label>
        <div class="item_content">
          <el-select
            v-model="searchForm.isBindOperator"
            placeholder="请选择是否有运营者"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in bindOperatorList"
              :label="item.label"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">运营者</label>
        <div class="item_content">
          <el-input v-model="searchForm.operator" placeholder="请输入手机号、姓名" clearable />
        </div>
      </div>
      <div class="search_item">
        <el-button type="primary" @click="_getList">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </div>
    </xm_search> -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="_getList"
      :useOwnReset="true"
      @reset="reset"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </template>
    </xm_search>
    <div class="page_main g_bg mt_16">
      <div class="g_bw">
        <el-button type="primary" @click="addKsAuth">新增快手授权</el-button>
        <div class="num_warp">
          <!-- 批量操作 -->
          <div class="one_area" v-show="$data.showBatch">
            <!-- 选择数量 -->
            <span>
              已选中
              <span style="color: #364fcd">
                {{ $data.isAll ? $data.isAllTotal : $data.chooseList.length || 0 }}
              </span>
              个矩阵号
            </span>
            <!--  全选/取消全选按钮 -->
            <el-button style="margin-left: 16px" @click="allChooseFun">
              {{ $data.isAll ? '取消全选' : '全选' }}
            </el-button>
            <!-- 操作 -->
            <el-button @click="batchOpFun(1, 4)">授权所选矩阵号</el-button>
            <el-button @click="batchOpFun(0, 4)">解除所选矩阵号授权</el-button>
          </div>

          <div class="batch_box">
            <el-switch
              v-model="$data.showBatch"
              inline-prompt
              :width="45"
              :disabled="loading"
              :before-change="batchHandelBefore"
            ></el-switch>
            批量操作
            <el-tooltip placement="top">
              <template #content>
                <div style="max-width: 360px">
                  批量授权仅针对星力值不足自动失效的矩阵号进行自动授权
                </div>
              </template>
              <img
                style="width: 14px; height: 14px; margin-left: 8px; vertical-align: middle"
                src="@/assets/images/operate/tip_line.png"
                alt
              />
            </el-tooltip>
          </div>
        </div>
      </div>
      <xm_table
        rowKey="openId"
        class="pic_table"
        tableType="avatar"
        v-loading="loading"
        :data="listData"
        v-model:page="page"
        @getTableData="getList"
        ref="userTable"
        :showSelection="!!$data.showBatch"
        @selection-change="handleSelectionChange"
        :checkSelectable="handleCheckSelectable"
        :select="$data.chooseList"
      >
        <el-table-column label="矩阵号" prop="minProgram" min-width="170px">
          <template #default="{ row }">
            <div class="table_photo">
              <img :src="row.authAccountPhoto" alt />
              <div class="table_photo_right">
                <div class="photo_right_top">
                  <div>{{ row.authAccountName }}</div>
                  <div class="platform_img">
                    <div class="xm_platformIcon_4"></div>
                  </div>
                </div>
                <!--                <div class="account_id">
                  <span>快手号：{{ row.orginUid || '&#45;&#45;' }}</span>
                </div>-->
                <div class="photo_right_top">
                  <table_column_department_info
                    className="blue_department_info"
                    :departmentName="row.xuserDeptName"
                    connectStr="/"
                    divisionStr=";"
                    trigger="hover"
                    tipPlacement="right"
                  ></table_column_department_info>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="170px">
          <template #header>
            <div class="column_header">
              <span>授权状态</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                content="<div>授权后将自动获取数据</div>
                <div>1、获取数据将消耗1星力值/矩阵号/天</div><div>2、成功接入的矩阵号长期有效，可手动解除授权，授权失效状态下停止扣除星力值</div>"
                raw-content
                :style="{ 'margin-left': '4px' }"
              >
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div style="display: flex; align-items: center">
              <span :style="{ color: row.dyAuth == 2 ? '#f85151' : '' }">
                {{ getEmpowerStatus(row.dyAuth) || '--' }}
              </span>
              <el-tooltip placement="top" effect="dark" :style="{ 'margin-left': '4px' }">
                <template #content>
                  <div v-if="row.dyAuth !== 0">
                    <!-- 授权时间 -->
                    <p>授权时间：{{ row.dyAuthValidDateTime }}</p>
                    <!-- 上一次失效时间 授权失效才显示 -->
                    <div v-if="row.dyAuth == 2">
                      上一次失效时间：{{ row.dyAuthInvalidDateTime || '--' }}
                    </div>
                    <!-- 累计有效授权时长 -->
                    <div style="max-width: 300px">
                      累计有效授权时长：{{
                        row.syncTotalDays != null ? (row.syncTotalDays || 0) + '天' : '--'
                      }}
                    </div>
                    <p v-if="row.dyAuth !== 1">
                      失效原因：{{ failReason(row.dyAuthInvalidType) || '--' }}
                    </p>
                  </div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 13px; height: 13px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="运营者" min-width="170px">
          <template #default="{ row }">
            <span>{{ row.opeName || '--' }}</span>
          </template>
        </el-table-column>
        <!--  fixed="right" -->
        <el-table-column label="操作" align="right" min-width="170px">
          <template #default="{ row }">
            <div class="operate_box">
              <el-link type="primary" class="ml_16">
                <span v-if="row.dyAuth === 1" @click="cancelAuth(4, row)">解除授权</span>
                <span v-if="row.dyAuth === 2" @click="reAuth(4, row)">重新授权</span>
              </el-link>
              <el-link type="primary" class="ml_16" @click="openEmpowerRecords(row.openId, false)">
                权限记录
              </el-link>
              <!-- 更多 -> 矩阵号详情&设置运营者 -->
              <el-dropdown>
                <span class="btn_txt ml_16 default_color">更多</span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="systemVersion == 3">
                      <el-link type="primary" @click="toAccontDetail(row.openId, systemModule)">
                        矩阵号详情
                      </el-link>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-link type="primary" style="margin-left: unset" @click="setAccount(row)">
                        编辑矩阵号
                      </el-link>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="row.dyAuth != 1">
                      <el-link type="danger" style="margin-left: unset" @click="delFun(row.openId)">
                        删除矩阵号
                      </el-link>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 权限记录 -->
    <empowerRecordsDialog
      :empowerRecords="empowerRecords"
      v-if="empowerRecords.show"
      @close="empowerRecordsDialogClose"
    />
    <!-- 设置运营者 -->
    <set-operator
      v-model:visible="dialog.setVisible"
      :data="dialog.current"
      @updateList="getList"
    />
    <!-- 编辑矩阵号信息   -->
    <AccountAuth
      v-if="accountAuthInfo.show"
      v-model="accountAuthInfo.show"
      :info="accountAuthInfo.info"
      @update="_getList"
      :isConfigPermission="true"
    ></AccountAuth>
    <!-- 授权弹窗 -->
    <authDOM
      v-if="state.ksAuthDialog.show"
      :authDialog="state.ksAuthDialog"
      @updateFun="updateFun"
    />
    <!--取消授权弹框  -->
    <CancelAuthDialog
      v-if="state.cancelAuthDialog.show"
      :cancelAuthDialog="state.cancelAuthDialog"
      @auth="singleOpFun(0, state.cancelAuthDialog.row)"
    />
    <!--重新授权弹框  -->
    <ReAuthDialog v-if="state.reAuthDialog.show" :reAuthDialog="state.reAuthDialog" />

    <!--授权消耗弹框  -->
    <AuthCostDialog v-if="state.costDialog.show" :dialogInfo="state.costDialog" @auth="auth" />
  </div>
</template>

<script setup>
import AuthCostDialog from './components/accountCostWarn_dialog.vue'
import ReAuthDialog from './components/reAuth_dialog.vue'
import CancelAuthDialog from './components/cancelAuth_dialog.vue'
import authDOM from './components/authKS_dialog.vue'
import { useAccountAuth } from './model/use_account_auth'
import { useStore } from 'vuex'

import AccountAuth from '@/views/system/authorization/components/account_auth.vue'
import empowerRecordsDialog from './components/empower_records.vue'
import SetOperator from './components/set_operator_new.vue'
const emits = defineEmits(['updateTotal'])
const {
  searchComponents,
  state,
  getList,
  _getList,
  reset,
  exportFiles,
  // removeAuth,
  delFun,
  // setOperators,
  openEmpowerRecords,
  empowerRecordsDialogClose,
  toAccontDetail,
  // chooseDeptSearchRef,
  // updateDeptIds,
  operationSuccessFun,
  reAuth,
  cancelAuth,
  $data,
  batchHandelBefore,
  allChooseFun,
  userTable,
  handleCheckSelectable,
  handleSelectionChange,
  batchOpFun,
  addKsAuth,
  singleOpFun,
  singleAccountOp
} = useAccountAuth(emits, 4)
const {
  dialog,
  listData,
  empowerRecords,
  page,
  loading
  // statusListSphKs,
  // statusListXhsSph,
  // searchForm
  // bindOperatorList
} = toRefs(state)
const store = useStore()
const systemModule = store.getters.systemModule
// 基础版不显示矩阵号详情
const systemVersion = computed(() => store.state.user.systemVersion)

// 匹配授权状态
function getEmpowerStatus(status) {
  if (!status) return status
  const obj = {
    0: '未授权',
    1: '已授权',
    2: '授权失效'
  }
  return obj[status] || null
}
// 匹配失效原因
function failReason(reason) {
  const obj = {
    1: '后台手动解除',
    2: '自动过期',
    3: '矩阵号接入余额不足',
    4: 'APP主动解除',
    5: '用户禁用自动解除',
    6: '该用户授权矩阵号数量超出限制',
    9: '星力值不足'
  }
  return obj[reason] || null
}
onMounted(() => {
  state.platform = 4
  getList()
})

// 编辑矩阵号信息
const accountAuthInfo = reactive({
  show: false,
  info: {}
})
const setAccount = row => {
  accountAuthInfo.show = true
  accountAuthInfo.info = row
}

function updateFun(isRefresh) {
  if (isRefresh) {
    operationSuccessFun(true)
  }
  state.ksAuthDialog.show = false
}

function auth() {
  // 如果是重新授权
  if (state.costDialog.refreshAuth) {
    // 如果是失效原因是星力值不足且当前平台真实授权状态为有效 ，直接调接口该状态，否则出二维码弹窗
    if (
      state.costDialog.refreshAccountInfo.dyAuthInvalidType === 9 &&
      state.costDialog.refreshAccountInfo.nativeAuth === 1
    ) {
      singleAccountOp(1, state.costDialog.refreshAccountInfo)
    } else {
      state.ksAuthDialog.show = true
    }
    return
  }
  state.ksAuthDialog.show = true
}
</script>
<style lang="scss" scoped>
@import './scss/page.scss';
.table_photo {
  .table_photo_right {
    width: calc(100% - 52px);
    .photo_right_top {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
  }
}
.platform_img {
  width: 18px !important;
  height: 18px !important;
  position: relative;
  div {
    width: 18px;
    height: 18px;
  }
}
.account_id {
  white-space: nowrap;
  overflow: hidden;
  height: 17px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
  line-height: 17px;
  margin-top: 4px;
}
.g_bw {
  display: flex;
  align-items: center;
  margin-bottom: 20px !important;
  .num_warp {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: #606266;
    .one_area {
      display: flex;
      align-items: center;
    }
  }
}
</style>

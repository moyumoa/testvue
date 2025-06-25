<template>
  <div class="account_wrapper">
    <!-- <xm_search>
      <div class="search_item">
        <label class="item_label">用户</label>
        <div class="item_content">
          <el-input v-model.trim="search.userName" placeholder="请输入用户名、手机号" clearable />
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">状态</label>
        <div class="item_content">
          <el-select
            v-model="search.status1"
            placeholder="请选择状态"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in statusList"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">角色</label>
        <div class="item_content">
          <el-select
            v-model="search.roleIdList"
            multiple
            clearable
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="item in roleList"
              :label="item.roleName"
              :value="item.roleId"
              :key="item.roleId"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">员工</label>
        <div class="item_content">
          <el-input v-model="search.fsName" placeholder="请输入员工姓名" clearable />
        </div>
      </div>     
      <div class="search_item">
        <label class="item_label">组织结构</label>
        <div class="item_content">
          <el-cascader
            v-model="search.depIds"
            :options="organizations"
            :clearable="true"
            :props="cascaderProps"
            placeholder="请选择"
          ></el-cascader>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">创建时间</label>
        <div class="item_content">
          <el-date-picker
            v-model="search.dataRange"
            type="dateRange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </div>
      </div>
      <div class="search_item">
        <el-button type="primary" @click="searchList(search)">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </xm_search> -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      :showShrink="true"
      @reset="reset"
    >
      <template #searchBtn>
        <exp_button ref="expButton" type="default" :isExport="true" :asyncFunc="exportData">
          导出
        </exp_button>
      </template>
    </xm_search>
    <div class="account_content">
      <div class="g_bw" v-if="!judgeOEA()">
        <el-button type="primary" @click="handleAdd">新增用户</el-button>
        <div class="num_warp">
          <div class="one_area" v-show="!$data.showBatch">
            自动开启后台账号
            <el-switch
              style="margin: 0 16px 0 12px"
              :value="userInfo.isAutoEnablePc ? true : false"
              inline-prompt
              :width="45"
              :loading="$data.loginBackLoading || $data.showBatchLoading"
              :disabled="loading || (!userInfo.isAutoEnablePc && $data.pcClientRealRemainNum <= 0)"
              @change="autoSwitchChange($event, 'loginBack')"
            ></el-switch>
            自动开启AI终端账号
            <el-switch
              style="margin-left: 12px"
              :value="userInfo.isAutoEnableMini ? true : false"
              inline-prompt
              :width="45"
              :loading="$data.loginMiniLoading || $data.showBatchLoading"
              :disabled="
                loading || (!userInfo.isAutoEnableMini && $data.miniClientRealRemainNum <= 0)
              "
              @change="autoSwitchChange($event, 'loginMini')"
            ></el-switch>
          </div>
          <!-- 批量操作 -->
          <div class="one_area" v-show="$data.showBatch">
            <!-- 选择数量 -->
            <span>
              已选中
              <span style="color: #364fcd">
                {{ $data.isAll ? $data.isAllTotal : $data.chooseList.length || 0 }}
              </span>
              个用户
            </span>
            <!--  全选/取消全选按钮 -->
            <el-button style="margin-left: 16px" @click="allChooseFun">
              {{ $data.isAll ? '取消全选' : '全选' }}
            </el-button>
            <!-- 操作 -->
            <el-dropdown popper-class="xm_dropDown" @command="handleCommandDown">
              <el-button style="margin-left: 16px">
                批量开关
                <el-icon class="el-icon--right"><i-arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="1">批量开启选中用户的后台账号</el-dropdown-item>
                  <el-dropdown-item command="2">批量关闭选中用户的后台账号</el-dropdown-item>
                  <el-dropdown-item command="3">批量开启选中用户的AI终端账号</el-dropdown-item>
                  <el-dropdown-item command="4">批量关闭选中用户的AI终端账号</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <span style="color: #909399; margin: 0 12px 0 16px">批量操作</span>
          <el-switch
            v-model="$data.showBatch"
            inline-prompt
            :width="45"
            :disabled="loading"
            :before-change="batchHandelBefore"
          ></el-switch>
        </div>
      </div>
      <xm_table
        class="pic_table pic_table_user"
        tableType="live"
        v-loading="loading"
        :data="listData"
        v-model:page="page"
        @getTableData="getList(search)"
        rowKey="userId"
        ref="userTable"
        :showSelection="!!$data.showBatch"
        @selection-change="handleSelectionChange"
        :checkSelectable="handleCheckSelectable"
        :select="$data.chooseList"
      >
        <el-table-column label="用户信息" prop="userBrandName" min-width="170">
          <template #default="{ row }">
            <div
              class="photo_wrapper"
              :style="row.fsAccount && row.fsAccount.feishuOpenId ? 'cursor: pointer' : ''"
              @click="
                row.fsAccount && row.fsAccount.feishuOpenId
                  ? toFschat(row.fsAccount.feishuOpenId)
                  : ''
              "
            >
              <img v-if="row.userPhoto" :src="row.userPhoto" />
              <div v-else>
                <default-photo :name="row.userBrandName" />
              </div>
              <el-tooltip :content="row.userBrandName" :disabled="!row.userBrandName">
                <div class="table_pre">{{ row.userBrandName || '-' }}</div>
              </el-tooltip>
              <!--  <span v-html="row.userBrandName"></span>  -->
              <template v-if="row.fsAccount">
                <img
                  class="logo"
                  v-if="row.fsAccount.iconType === 2"
                  src="@/assets/images/user/weChat.png"
                />
                <img
                  class="logo"
                  v-if="row.fsAccount.iconType === 1"
                  src="@/assets/images/user/feishu.png"
                />
                <!--                <img-->
                <!--                  class="logo"-->
                <!--                  v-if="row.fsAccount.iconType === 3"-->
                <!--                  src="@/assets/images/user/wx.png"-->
                <!--                />-->
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="userPhone" min-width="140">
          <template #default="{ row }">
            <table_column_phone :phone="row.userPhone"></table_column_phone>
          </template>
        </el-table-column>
        <el-table-column
          label="员工ID"
          prop="thirdPartyStaffId"
          v-if="store.state.user.showEmployeeId === true"
          min-width="140"
        ></el-table-column>
        <el-table-column label="角色" show-overflow-tooltip min-width="140">
          <template #default="{ row }">
            {{ row.role && row.role.length > 0 ? row.role.map(i => i.roleName).join('/') : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="员工" width="170">
          <template #default="{ row }">
            <template v-if="row.fsAccount">
              <div style="margin-top: 6px">
                <pre style="display: inline-block">{{ row.fsAccount.name || '--' }}</pre>
                <span v-if="row.fsAccount.staffStatus === 2" class="g_departure">已离职</span>
              </div>
              <el-tooltip
                effect="dark"
                placement="top"
                v-if="row.fsAccount.showDepartment.length > 28"
              >
                <template #content>
                  <div style="max-width: 300px">
                    <div v-for="(item, index) in row.fsAccount.departmentList" :key="index">
                      {{ item.name }}
                    </div>
                  </div>
                </template>
                <div class="line-hidden3" style="margin-bottom: 6px">
                  {{ row.fsAccount.showDepartment }}
                </div>
              </el-tooltip>
              <template v-else>{{ row.fsAccount.showDepartment }}</template>
            </template>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <el-table-column label="后台账号" show-overflow-tooltip min-width="240">
          <template #header>
            <div class="column_header">
              <p v-html="listIsBackLabel"></p>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <p>当前版本后台账号数量上限{{ $data.pcClientNumber || 0 }}，暂不支持调整</p>
                </template>
                <img src="@/assets/images/operate/tip_line.png" style="width: 12px; height: 12px" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <el-switch
              v-model="row.loginBack"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              :width="45"
              :loading="row.loading"
              :disabled="row.isValid !== 1 || (row.isMain == 1 && row.loginBack == 1)"
              :before-change="beforeChangChildren.bind(this, row)"
              :key="row.userId"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="AI终端账号"
          show-overflow-tooltip
          min-width="240"
          v-if="systemVersion !== 2"
        >
          <template #header>
            <div class="column_header">
              <p v-html="listIsMiniLabel"></p>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
                v-if="systemVersion !== 2"
              >
                <template #content>
                  <p>
                    AI终端账号上限{{ $data.miniClientNumber || 0 }}个，可
                    <span style="color: #889cff; cursor: pointer" @click="buySubmit">点击购买</span>
                  </p>
                </template>
                <img src="@/assets/images/operate/tip_line.png" style="width: 12px; height: 12px" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <el-switch
              v-model="row.loginMini"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              :width="45"
              :loading="row.loadingLoginMini"
              :disabled="row.isValid !== 1"
              :before-change="beforeChangAi.bind(this, row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="运营矩阵号" min-width="200">
          <template #default="{ row }">
            <div class="photos" v-if="row.operator && row.operator.length > 0">
              <template v-for="(item, index) in row.operator">
                <el-tooltip
                  v-if="index < 3"
                  effect="dark"
                  :content="item.authAccountName"
                  placement="top"
                  :key="item.operatorId"
                >
                  <div class="photos_item" :class="{ g_failure: isInvalid(item) }">
                    <img :src="item.authAccountPhoto" alt />
                    <div
                      :class="[`xm_platformIcon_${item.platform}`]"
                      style="width: 16px; height: 16px"
                    ></div>
                  </div>
                </el-tooltip>
              </template>
              <div
                class="photo_more flex_center"
                @click="viewMore(row.operator, `运营矩阵号`)"
                v-if="row.operator.length > 3"
              >
                +{{ row.operator.length - 3 }}
              </div>
            </div>
            <template v-else>--</template>
          </template>
        </el-table-column>

        <!-- <el-table-column label="是否登录后台">
          <template #default="{ row }">
            <span v-if="row.loginBack === 1">是</span>
            <span v-if="row.loginBack === 0">否</span>
          </template>
        </el-table-column> -->
        <el-table-column label="状态" min-width="120">
          <template #default="{ row }">
            <span class="table_point" v-if="row.isValid === 1">已启用</span>
            <span class="table_point reverse" v-else>已禁用</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="170" />
        <el-table-column label="建模权限" min-width="100" v-if="isGlobalPermitCreateModel">
          <template #default="{ row }">
            <el-switch
              :model-value="row.permitCreateModel == 1"
              inline-prompt
              active-text="开"
              inactive-text="关"
              :disabled="row.isValid != 1"
              @click="changeFaceModelPermission(row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" align="right" fixed="right">
          <template #default="{ row }">
            <!-- <el-link type="primary" class="ml_16" @click="toDetail(row)" v-if="row.staffType != 2">
              详情
            </el-link> -->
            <el-link
              type="primary"
              class="ml_16"
              @click="handleEdit(row)"
              v-if="row.staffType != 2 && row.fsAccount.staffStatus !== 2"
            >
              编辑
            </el-link>
            <template v-if="!judgeOEA()">
              <template v-if="row.isMain !== 1">
                <el-popconfirm
                  v-if="row.fsAccount.staffStatus !== 2"
                  :title="row.isValid === 1 ? '禁用后将无法登录系统' : '确定要启用吗'"
                  @confirm="handleToggle(row.userBrandId, row.fsAccount, row.isValid, search)"
                >
                  <template #reference>
                    <el-link type="primary" class="ml_16">
                      {{ row.isValid === 1 ? '禁用' : '启用' }}
                    </el-link>
                  </template>
                </el-popconfirm>

                <template v-if="row.isValid !== 1">
                  <el-popconfirm title="确定要删除吗" @confirm="handleDel(row.userBrandId, search)">
                    <template #reference>
                      <el-link type="primary" class="ml_16">
                        <span class="g_red">删除</span>
                      </el-link>
                    </template>
                  </el-popconfirm>
                </template>
              </template>
            </template>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <g-dialog
      v-model:visible="showDialog"
      v-if="showDialog"
      :dict="roleList"
      :data="currentData"
      @updateList="updateList"
      :editActDataPmsEditVO="editActDataPmsEditVO"
      :permissionsType="permissionsType"
    />
    <el-dialog
      v-model="photosVisible"
      custom-class="hide_footer_line "
      :title="title"
      width="300px"
    >
      <div class="photos_dialog">
        <div class="photo_item" v-for="item in userList" :key="item.authAccountPhoto">
          <div style="position: relative" :class="{ g_failure: isInvalid(item) }" class="big">
            <img :src="item.authAccountPhoto" alt />
            <div :class="[`xm_platformIcon_${item.platform}`]"></div>
          </div>
          <span style="margin-left: 16px">{{ item.authAccountName }}</span>
        </div>
      </div>
      <template #footer></template>
    </el-dialog>
    <!-- 详情弹框 -->
    <detailDialog :detailData="detailData" @changeVisible="viewMore"></detailDialog>
  </div>
</template>

<script setup>
import GDialog from './g_dialog.vue'
import detailDialog from './detail_dialog.vue'
import DefaultPhoto from '../components/default_photo/index.vue'
import { useAccount } from './model/use_account.js'
import { selectRoleList } from '@/api/system_setting/role'
import { userInfoEditData } from '@/api/system_setting/personal'
import {
  changeUserInfo,
  changeBrandAutoEnableAccount,
  changeUserLoginSwitchBatch
} from '@/api/system_setting/account.js'
import { throttle } from '@/utils/tools'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'

const {
  searchComponents,
  state,
  getList,
  searchList,
  handleToggle,
  handleDel,
  detailData,
  getProductUseInfoFn,
  $data,
  userTable,
  setCheck,
  resetSelect,
  getListBeforeBatch,
  exportData
} = useAccount()
const { loading, listData, page, searchParams } = toRefs(state)
const store = useStore()
const judgeOEA = inject('$judgeOEA')
const message = inject('$message')
const systemVersion = computed(() => store.state.user.systemVersion)
const userInfo = computed(() => store.getters.userInfo)

const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
// cascaderValue.value = []
// const  cascaderValue=ref([]);
const isGlobalPermitCreateModel = ref(false)
isGlobalPermitCreateModel.value =
  JSON.parse(localStorage.getItem('userInfo')).systemModuleInfo.hasIntellgentLive ||
  JSON.parse(localStorage.getItem('userInfo')).systemModuleInfo.hasSumvideo
isGlobalPermitCreateModel.value = false

// 列表后台账号label 因为代码换行显示上有空格，所以这样做
const listIsBackLabel = computed(() => {
  return `后台账号（<span style="color: #364fcd">${
    ($data.pcClientNumber || 0) - ($data.pcClientRealRemainNum || 0)
  }</span>/${$data.pcClientNumber || 0} ）`
})

const listIsMiniLabel = computed(() => {
  let str = 'AI终端账号'
  if (systemVersion.value !== 2) {
    str = `${str}（<span style="color: #364fcd">${
      ($data.miniClientNumber || 0) - ($data.miniClientRealRemainNum || 0)
    }</span>/${$data.miniClientNumber || 0}）`
  }
  return str
})

const switchTipData = reactive({
  type: 'openAutoXmy', // 类型 openAutoXmy自动开启后台账号的操作 openAutoXcx自动开启小程序的操作 accountXmyOpen/accountXmyClose批量开启/关闭后台账号的操作 accountXcxOpen/accountXcxClose批量开启/关闭小程序账号的操作
  title: '账号设置',
  content: '',
  tip: ''
})

// 弹框相关数据
const dialog = reactive({
  isEdit: false,
  currentData: undefined,
  showDialog: false,
  // 更多账号弹框
  photosVisible: false,
  userList: [],
  title: ''
})
const { currentData, showDialog, photosVisible, userList, title } = toRefs(dialog)
// 增加状态，批量开关开启关闭时，为了页面上的开关表现不受影响
function batchHandelBefore() {
  return new Promise(resolve => {
    $data.showBatchLoading = true
    nextTick(() => {
      resolve(true)
      $data.showBatchLoading = false
    })
  })
}

// 弹出弹窗
function showPopup(isEnableStatus = false) {
  const contentText =
    switchTipData.tip || isEnableStatus
      ? `${switchTipData.content}<br/><span style="line-height: 30px;font-size:13px;color:#606266">${switchTipData.tip}</span>`
      : switchTipData.content

  ElMessageBox.confirm(contentText, switchTipData.title, {
    closeOnClickModal: false,
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: '',
    customClass: 'xm_dialog_messageBox',
    dangerouslyUseHTMLString: !!switchTipData.tip || isEnableStatus
  })
    .then(() => {
      const { type } = switchTipData
      switchTipSubmit(type, isEnableStatus)
    })
    .catch(() => {
      switchTipClose()
    })
}

// 批量开/关后台/Ai终端账号
function updateAccountSwitchBatch(type, isEnableStatus = false) {
  const enableTrueList = ['accountXmyOpen', 'accountXcxOpen']
  const isMiniTrueList = ['accountXcxOpen', 'accountXcxClose']
  const enable = enableTrueList.includes(type)
  const isMini = isMiniTrueList.includes(type)
  const params = {
    enable, // true 开启 false 关闭
    isMini, // true AI终端 false PC
    isSelectAll: !!$data.isAll // true 全选 false 非全选
  }
  if (params.isSelectAll) {
    params.selectUserParam = searchParams.value
  } else {
    // 开启时，开启选中的，未开启的；关闭时，关闭选中的，已开启的
    const ids = ($data.chooseList || [])
      .map(x => {
        const loginStatus = isMini ? x.loginMini : x.loginBack
        if ((enable && !loginStatus) || (!enable && loginStatus)) {
          return x.userBrandId
        }
        return null
      })
      .filter(id => id !== null)
    params.userBrandBindIds = ids
  }
  // 开启余额不足时，传入需要开启的数量
  if (isEnableStatus) {
    params.forceEnableNum = isMini ? $data.miniClientRealRemainNum : $data.pcClientRealRemainNum
  }
  // console.log('入参', params)
  // if (params) return

  changeUserLoginSwitchBatch(params)
    .then(res => {
      if (res.code === 0) {
        const messageObj = {
          accountXmyOpen: '后台账号开启成功',
          accountXmyClose: '后台账号关闭成功',
          accountXcxOpen: 'AI终端账号开启成功',
          accountXcxClose: 'AI终端账号关闭成功'
        }
        message.success(messageObj[type])
        // 刷新下列表
        getList()
        getProductUseInfoFn()
      }
    })
    .catch(() => {})
}

// 开/关 自动开关
function updateAutoSwitch(params, type) {
  changeBrandAutoEnableAccount(params)
    .then(res => {
      if (res.code === 0) {
        // 更新用户信息
        store.dispatch('user/getUserInfo').then(res => {
          store.commit('user/setStateUserInfo', res)
          // 自动开启后台账号
          // if (type === 'openAutoXmy') {
          $data.loginBackLoading = false
          // }
          // 自动开启AI终端账号
          // if (type === 'openAutoXcx') {
          $data.loginMiniLoading = false
          // }
        })
      }
    })
    .catch(() => {
      $data.loginMiniLoading = false
      $data.loginBackLoading = false // hide开启/关闭 自动开启后台账号 功能loading
    })
}

// 确定操作
function switchTipSubmit(type, isEnableStatus = false) {
  const autoTypeList = ['openAutoXmy', 'openAutoXcx']
  if (autoTypeList.includes(type)) {
    const params = {}
    if (type === 'openAutoXmy') {
      params.isAutoEnablePc = !userInfo.value.isAutoEnablePc ? 1 : 0 // 0关闭 1开启
    } else {
      params.isAutoEnableMini = !userInfo.value.isAutoEnableMini ? 1 : 0
    }
    updateAutoSwitch(params, type)
  } else {
    // accountXmyOpen accountXmyClose accountXcxOpen accountXcxClose
    updateAccountSwitchBatch(type, isEnableStatus)
  }
}

// 初始化操作状态
function switchTipClose() {
  switchTipData.tip = ''
  switchTipData.type = ''
  switchTipData.content = ''
  $data.loginBackLoading = false
  $data.loginMiniLoading = false
}

// 点击全选的按钮
const allChooseFun = throttle(() => {
  if ($data.isAll) {
    userTable.value.$refs.table.clearSelection()
  } else {
    setCheck(true)
  }
  nextTick(() => {
    $data.isAll = !$data.isAll
  })
}, 500)

// 允许/禁止表格选择
function handleCheckSelectable(row) {
  if ($data.isAll) {
    return false
  } else {
    // 全都能选 return true
    // 已禁用账号不能选
    return row.isValid === 1
  }
}

// 当选择项发生变化时
function handleSelectionChange(e) {
  $data.chooseList = e
}

// 打开关闭自动开关
function autoSwitchChange(e, filed) {
  const loadingFiled = `${filed}Loading`
  $data[loadingFiled] = true

  if (filed === 'loginBack') {
    switchTipData.type = 'openAutoXmy'
    switchTipData.content = userInfo.value.isAutoEnablePc
      ? '关闭后所有新接入用户将无法登录后台，确认是否关闭？'
      : '开启后所有新接入用户将自动开启登录后台的权限，确认是否开启？'
    switchTipData.tip = userInfo.value.isAutoEnablePc
      ? ''
      : '注：账号开启达到上限后接入的用户将自动关闭后台账号权限'
  } else if (filed === 'loginMini') {
    switchTipData.type = 'openAutoXcx'
    switchTipData.content = userInfo.value.isAutoEnableMini
      ? '关闭后所有新接入用户将无法登录AI终端，确认是否关闭？'
      : '开启后所有新接入用户将自动开启登录AI终端的权限，确认是否开启？'
    switchTipData.tip = userInfo.value.isAutoEnableMini
      ? ''
      : '注：账号开启达到上限后接入的用户将自动关闭AI终端账号权限'
  }
  showPopup()
}
// 非全选时，开启的数量
function getUnOpenNum(isMini = false) {
  return ($data.chooseList || []).filter(x => {
    return isMini ? !x.loginMini : !x.loginBack
  })?.length
}

const handleCommandDown = async command => {
  if (!$data.chooseList.length) {
    message.warning('请选择用户')
    return
  }
  let contentText = ''
  // accountXmyOpen/accountXmyClose批量开启/关闭后台账号的操作
  // accountXcxOpen/accountXcxClose批量开启/关闭小程序账号的操作
  let type = ''
  // 选中记录点击开启账号时，判断选中数量和当前该类型账号的剩余额度
  // 选中范围内已开启账号的用户保持不变，不扣除额度
  // 如果是开启账号的话，就获取当前开启类型下关闭的所有账号列表
  const openCommandList = ['1', '3']
  let isEnableStatus = false // 余额是否不足
  if (openCommandList.includes(command)) {
    const isMini = command === '3'
    const openNum = $data.isAll ? await getListBeforeBatch(isMini) : getUnOpenNum(isMini)
    if (command === '1') {
      if ($data.pcClientRealRemainNum <= 0) {
        message.warning('后台账号已达到上限')
        return
      }
      contentText =
        openNum > $data.pcClientRealRemainNum
          ? `确定开启前 <span style="color: #364fcd">${$data.pcClientRealRemainNum}</span> 个选中用户的后台账号？`
          : `确定开启选中用户的后台账号？`
      type = 'accountXmyOpen'
      isEnableStatus = openNum > $data.pcClientRealRemainNum
    } else {
      if ($data.miniClientRealRemainNum <= 0) {
        message.warning('AI终端账号已达到上限')
        return
      }
      console.log('openNum, $data.miniClientRealRemainNum', openNum, $data.miniClientRealRemainNum)
      contentText =
        openNum > $data.miniClientRealRemainNum
          ? `确定开启前 <span style="color: #364fcd">${$data.miniClientRealRemainNum}</span> 个选中用户的AI终端账号？`
          : `确定开启选中用户的AI终端账号？`
      type = 'accountXcxOpen'
      isEnableStatus = openNum > $data.miniClientRealRemainNum
    }
  } else {
    if (command === '2') {
      contentText = `确定关闭选中用户的后台账号？`
      type = 'accountXmyClose'
    } else {
      contentText = `确定关闭选中用户的AI终端账号？`
      type = 'accountXcxClose'
    }
  }

  switchTipData.type = type
  switchTipData.content = contentText
  switchTipData.tip = ''
  showPopup(isEnableStatus)
}

const buySubmit = throttle(() => {
  window.open(`${location.origin}/system_manage/voucher_center?tab=mini_client`, '_blank')
}, 500)
// 后台账号打开前
function beforeChangChildren(row) {
  return new Promise(resolve => {
    row.loading = true
    // 真实可用为零就上线
    if ($data.pcClientRealRemainNum <= 0 && !row.loginBack) {
      message.warning('当前后台账号数量已满')
      row.loading = false
      resolve(false)
    } else {
      changeUserInfo({
        userBrandId: row.userBrandId,
        opType: 3
      })
        .then(res => {
          if (res.code === 0) {
            getProductUseInfoFn()
            resolve(true)
          } else {
            resolve(true)
          }
        })
        .catch(() => {
          resolve(true)
        })
        .finally(() => {
          row.loading = false
        })
    }
  })
}

function showUnEnough() {
  ElMessageBox.confirm('当前AI终端账号数量已满，如需新增请前往充值', 'AI终端账号充值', {
    closeOnClickModal: false,
    confirmButtonText: '去充值',
    cancelButtonText: '取消',
    type: '',
    customClass: 'xm_dialog_messageBox',
    dangerouslyUseHTMLString: true
  })
    .then(() => {
      aiUnEnoughSubmit()
    })
    .catch(() => {})
}

// AI终端账号打开前
function beforeChangAi(row) {
  return new Promise(resolve => {
    row.loadingLoginMini = true
    if ($data.miniClientRealRemainNum <= 0 && !row.loginMini) {
      row.loadingLoginMini = false
      showUnEnough()
      resolve(false)
    } else {
      changeUserInfo({
        userBrandId: row.userBrandId,
        opType: 4
      })
        .then(res => {
          if (res.code === 0) {
            getProductUseInfoFn()
            resolve(true)
          } else {
            resolve(true)
          }
        })
        .catch(() => {
          resolve(true)
        })
        .finally(() => {
          row.loadingLoginMini = false
        })
    }
  })
}

function aiUnEnoughSubmit() {
  window.open(`${location.origin}/system_manage/voucher_center?tab=mini_client`, '_blank')
}

const handleAdd = () => {
  dialog.isEdit = false
  currentData.value = undefined
  showDialog.value = true
}
const editActDataPmsEditVO = ref({})
const permissionsType = ref(1) // 0全部   1指定
const handleEdit = row => {
  dialog.isEdit = true
  const { brandId } = JSON.parse(localStorage.getItem('brandInfo'))
  userInfoEditData({
    accountId: row.accountId,
    brandId: brandId,
    userId: row.userId
  })
    .then(res => {
      editActDataPmsEditVO.value = res.data.userActDataPmsEditVO
      permissionsType.value =
        res.data.userActDataPmsEditVO.permissionsType === null
          ? 1
          : res.data.userActDataPmsEditVO.permissionsType
      if (
        res.code === 0 &&
        res.data &&
        res.data.dataPermissionsList &&
        res.data.dataPermissionsList.length > 0
      ) {
        row.dataPermissionsList = res.data.dataPermissionsList
      }
      nextTick(() => {
        currentData.value = row
        showDialog.value = true
      })
    })
    .catch(() => {
      currentData.value = row
      showDialog.value = true
    })
}
function changeFaceModelPermission(row) {
  if (row.isValid === 1) {
    changeUserInfo({
      userBrandId: row.userBrandId,
      opType: 2
    })
      .then(res => {
        if (res.code === 0) {
          getList()
          // emits('updateList')
          // handleClose()
        }
      })
      .finally(() => {
        // saveLoading.value = false
      })
  }
}
const reset = () => {
  resetSelect()
  state.page.index = 1
  getList()
}
const viewMore = (data, t) => {
  photosVisible.value = true
  userList.value = data
  title.value = t
}
const roleList = ref([])
// 角色下拉框
const fetchRoleList = () => {
  selectRoleList({
    pageNumber: 1,
    pageSize: 999
  }).then(res => {
    // roleList.value = res.data || []
    searchComponents.value.find(item => item.filed === 'roleIdList').selects = res.data || []
  })
}
const fetchRoleListV2 = () => {
  selectRoleList({
    isFilterAdmin: 1, // 是否过滤掉管理员
    pageNumber: 1,
    pageSize: 999
  }).then(res => {
    roleList.value = res.data || []
  })
}
// 跳转飞书聊天
function toFschat(openId) {
  window.open(`https://applink.feishu.cn/client/chat/open?openId=${openId}`)
}

// 平台授权有效
const isInvalid = item => {
  if ([1, 2, 3, 4].indexOf(item.platform) === -1) return true
  const authKey = {
    1: 'dyAuth',
    2: 'wxAuth',
    3: 'xhsAuth',
    4: 'dyAuth'
  }
  return item[authKey[item.platform]] === 2
}

function updateList() {
  if (dialog.isEdit) {
    getList()
  } else {
    reset()
    getProductUseInfoFn()
  }
}
onMounted(() => {
  getList()
  fetchRoleList()
  fetchRoleListV2()
  getProductUseInfoFn()
})
</script>

<style lang="scss" scoped>
.table_pre {
  margin: 0 4px 0 8px;
  max-width: 100px;
  white-space: pre;
  @include mult_line(1);
}
.account_wrapper {
  .account_content {
    margin-top: 16px;
    padding: 22px 24px 24px 24px;
    border-radius: 4px;
    background-color: #fff;
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
  }
}
.photo_wrapper {
  display: flex;
  align-items: center;
  img:first-child {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  span {
    margin: 0 8px;
  }
  .logo {
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }
}
.photos {
  display: flex;
  .photos_item {
    position: relative;
    margin-right: 6px;
    width: 32px;
    height: 32px;
    > img {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 50%;

      vertical-align: middle;
    }
  }

  .photo_more {
    width: 32px;
    height: 32px;
    background: #eff2f8;
    border-radius: 50%;
    font-weight: 500;
    color: #364fcd;
    font-size: 12px;
    cursor: pointer;
  }
}
.photos_dialog {
  display: flex;
  flex-direction: column;
  .photo_item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
}
:deep(.el-link.is-underline:hover:after) {
  border-bottom: none;
}
.column_header {
  display: flex;
  align-items: center;
}
</style>

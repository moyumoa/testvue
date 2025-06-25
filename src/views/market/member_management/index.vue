<template>
  <div>
    <xm_search
      useOwnReset
      :searchComponents="data.searchComponents"
      @getData="searchList"
      @reset="resetList"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportListFile">导出</exp_button>
      </template>
    </xm_search>

    <div class="page_main mt_16">
      <div class="page_btns">
        <div class="page_btns_left">
          <el-button type="primary" @click="data.showImport = true">批量修改金币</el-button>
        </div>
        <el-link
          class="xm_linkHasIcon"
          type="primary"
          @click="router.push('/content_market/member_list/update_gold_log')"
        >
          金币变更记录
          <el-icon>
            <i-arrow-right />
          </el-icon>
        </el-link>
      </div>
      <xm_table
        tableType="default"
        v-loading="data.loading"
        :data="data.tableData"
        v-model:page="data.page"
        @getTableData="getList"
      >
        <el-table-column label="用户信息" prop="name" min-width="300">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              :showDyNum="false"
              :showLeaving="row.staffStatus && row.staffStatus == 2"
              :showBusiness="true"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="工号" min-width="130" v-if="showEmployeeId">
          <template #default="scope">
            {{ scope.row.thirdPartyStaffId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="部门信息" prop="deptInfo" min-width="200">
          <template #default="{ row }">
            <table_column_department_info
              :departmentName="row.deptInfo"
              v-if="row.deptInfo"
              connectStr="/"
              divisionStr=";"
              trigger="hover"
            ></table_column_department_info>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="达人等级" v-if="employeeGrowthSystemState" min-width="150">
          <template #default="{ row }">
            <div>
              <el-tooltip placement="top">
                <template #content>
                  <div class="">等级阶段：{{ row.levelStage || '--' }}</div>
                </template>
                <div class="more">{{ row.levelName || '--' }}</div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="运营矩阵号" prop="operator" width="190" v-if="false">
          <template #default="{ row }">
            <div class="photos" v-if="row.operator && row.operator.length > 0">
              <template v-for="(item, index) in row.operator" :key="item.operatorId">
                <el-tooltip
                  v-if="index < 3"
                  effect="dark"
                  :content="item.authAccountName"
                  placement="top"
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
                @click="openOtherAccount(row.operator)"
                v-if="row.operator.length > 3"
              >
                +{{ row.operator.length - 3 }}
              </div>
            </div>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column label="抖音授权状态" min-width="150">
          <template #default="{ row }">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  class="status status-2"
                  :class="{
                    'status-2': row.dyAuthStatus === 0,
                    'status-3': row.dyAuthStatus === 1,
                    'status-4': row.dyAuthStatus === 2
                  }"
                ></span>
                {{ row.dyAuthStatusStr }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="视频号授权状态" min-width="150">
          <template #default="{ row }">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  class="status status-2"
                  :class="{
                    'status-2': row.wxAuthStatus === 0,
                    'status-3': row.wxAuthStatus === 1,
                    'status-4': row.wxAuthStatus === 2
                  }"
                ></span>
                {{ row.wxAuthStatusStr || '未授权' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="小红书授权状态" min-width="150">
          <template #default="{ row }">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  class="status status-2"
                  :class="{
                    'status-2': row.xhsAuthStatus === 0,
                    'status-3': row.xhsAuthStatus === 1,
                    'status-4': row.xhsAuthStatus === 2
                  }"
                ></span>
                {{ row.xhsAuthStatusStr || '未授权' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="快手授权状态" min-width="150">
          <template #default="{ row }">
            <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
              <div style="display: flex; align-items: center">
                <span
                  class="status status-2"
                  :class="{
                    'status-2': row.ksAuthStatus === 0,
                    'status-3': row.ksAuthStatus === 1,
                    'status-4': row.ksAuthStatus === 2
                  }"
                ></span>
                {{ row.ksAuthStatusStr || '未授权' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!--        <el-table-column label="矩阵号主号" prop="accountCount" min-width="200">-->
        <!--          <template #default="{ row }">-->
        <!--            <div class="account_info">-->
        <!--              <span class="account_info_name">-->
        <!--                <span style="cursor: pointer" @click="toDetail(row.dyMasterOpenId)">-->
        <!--                  {{ row.dyNickname || '&#45;&#45;' }}-->
        <!--                </span>-->
        <!--                <el-tooltip v-if="row.dyMasterAuthStatus == 1" content="授权成功" placement="right">-->
        <!--                  <el-icon><i-success-filled color="#67c23a" /></el-icon>-->
        <!--                </el-tooltip>-->
        <!--                <el-tooltip v-if="row.dyMasterAuthStatus == 2" content="授权失效" placement="right">-->
        <!--                  <el-icon><i-warning-filled color="#f56c6c" /></el-icon>-->
        <!--                </el-tooltip>-->
        <!--              </span>-->
        <!--              <template v-if="row.dyNickname">-->
        <!--                <img-->
        <!--                  v-if="row.dyAccountType == '企业号'"-->
        <!--                  src="@/assets/images/content_center/change.png"-->
        <!--                />-->
        <!--              </template>-->
        <!--            </div>-->
        <!--            <table_column_group_list :groups="row.groups"></table_column_group_list>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="粉丝数" min-width="150">
          <template #default="{ row }">
            <div>{{ row.fansNum === null ? '--' : wanSliceFormat(row.fansNum) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="金币余额" min-width="150">
          <template #default="{ row }">
            <div>
              <el-tooltip placement="top">
                <template #content>
                  <div class="">
                    <div v-for="(x, y) in row.goldDetails" :key="y">
                      {{ x.name || '--' }}：{{ x.balance || 0 }}
                    </div>
                  </div>
                </template>
                <div class="more">{{ row.gold || 0 }}</div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" fixed="right" width="240">
          <template #default="scope">
            <el-link type="primary" @click="showDynamicDialog(scope.row)">成员动态</el-link>
            <el-link
              style="margin-left: 12px"
              type="primary"
              @click="showUpdateGoldDialog(scope.row)"
            >
              变更金币
            </el-link>
            <el-link
              type="primary"
              style="margin-left: 12px"
              v-if="hasChangePart"
              @click="showUpdatePartDialog(scope.row)"
            >
              修改部门
            </el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <import-file-dialog
      v-model:show="data.showImport"
      redTips="注：成员姓名和手机号二选一填写即可（同时存在则以手机号为准）"
      title="批量修改金币"
      subTitle="批量修改金币操作流程"
      uploadUrl="/api/mission/employee/importCheck"
      :exportFile="downLoadTemplate"
      :canBatchAddExportFiles="canBatchAddExportFiles"
      @uploadSuccess="getList"
    ></import-file-dialog>
    <update-gold-dialog
      v-if="data.showDialog"
      v-model:showDialog="data.showDialog"
      :info="data.updateGoldInfo"
      @success="getList"
    ></update-gold-dialog>
    <update-part-dialog
      v-if="updatePartForm.show"
      :updateDialog="updatePartForm"
      @updateList="getList"
    ></update-part-dialog>
    <!-- 成员动态 -->
    <memberDynamicDialog v-if="memberDynamicInfo.show" :dynamicDialog="memberDynamicInfo" />
    <!--运营矩阵号全部弹窗    -->
    <el-dialog
      v-model="showAllDialog"
      custom-class="hide_footer_line "
      title="运营矩阵号"
      width="300px"
    >
      <div class="photos_dialog">
        <div class="photo_item" v-for="item in accountList" :key="item.operatorId">
          <div :class="{ g_failure: isInvalid(item) }" style="position: relative" class="big">
            <img :src="item.authAccountPhoto" alt />
            <div
              :class="[`xm_platformIcon_${item.platform}`]"
              style="width: 20px; height: 20px"
            ></div>
          </div>
          <span style="margin-left: 16px">{{ item.authAccountName }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { getQuery } from '@/utils/get_query.js'
import { useStore } from 'vuex'
import {
  getMemberMangeList,
  exportModifyCoinsTemplate,
  exporMemberMangementFile,
  getUserGroup
} from '@/api/market/operate_analysis.js'
import importFileDialog from '@/views/market/components/import_file_dialog.vue'
import updateGoldDialog from './components/update_gold_dialog.vue'
import { exportFile, exportFileV2 } from '@/utils/exportFile'
import { wanSliceFormat, throttle, isNotEmpty } from '@/utils/tools.js'
import { useRouter, useRoute } from 'vue-router'
import updatePartDialog from './components/update_part_dialog.vue'
import { userGrowthLevel } from '@/api/market/growth_system.js'
import memberDynamicDialog from './components/member_dynamic_dialog.vue'
import { setBusinessChooseParam } from '@/utils/search.js'
const router = useRouter()
const route = useRoute()
const store = useStore()
// import store from '@/store'
const showEmployeeId = computed(() => store.state.user.showEmployeeId)
const data = reactive({
  showImport: false,
  showDialog: false,
  updateGoldInfo: {},
  searchComponents: [
    {
      type: 'chooseDept',
      label: '组织结构',
      val: [],
      filed: 'orgIds',
      multiple: true,
      isUsePermission: true
    },
    {
      type: 'input',
      label: '成员姓名',
      val: '',
      filed: 'name'
    },
    {
      type: 'input',
      label: '手机号码',
      val: '',
      filed: 'phoneNum'
    }
  ]
    .concat(addEmployeeIdField())
    .concat([
      {
        type: 'select',
        label: '成员状态',
        val: null,
        // defaultVal: -1,
        filed: 'isValid',
        selects: [
          // {
          //   label: '全部',
          //   value: -1
          // },
          {
            label: '已启用',
            value: 1
          },
          {
            label: '已禁用',
            value: 0
          }
        ]
      },
      {
        type: 'select',
        label: '矩阵号分组',
        val: [],
        filed: 'groupIds',
        multiple: true,
        filterable: true,
        remote: true,
        remoteMethod: getUserGroupList(),
        'collapse-tags': true,
        'collapse-tags-tooltip': true,
        selects: []
      },
      // {
      //   type: 'select',
      //   label: '是否是运营矩阵号',
      //   val: null,
      //   placeholder: '请选择',
      //   filed: 'operateXUserType',
      //   selects: [
      //     {
      //       label: '全部',
      //       value: null
      //     },
      //     {
      //       label: '运营中',
      //       value: 1
      //     },
      //     {
      //       label: '未运营',
      //       value: 0
      //     }
      //   ]
      // },
      {
        type: 'select',
        label: '抖音授权状态',
        val: null,
        placeholder: '请选择',
        filed: 'dyAuthStatus',
        selects: [
          {
            label: '授权有效',
            value: 1
          },
          {
            label: '授权失效',
            value: 2
          },
          {
            label: '未授权',
            value: 0
          }
        ]
      },
      {
        hiddenItem: true,
        type: 'select',
        label: '达人等级',
        val: null,
        placeholder: '请选择',
        filed: 'levelId',
        selectDefultName: ['levelId', 'name'],
        selects: [
          {
            name: '全部',
            levelId: ''
          }
        ].concat(store.state.user.employeeGrowthLevelList)
      }
    ]),
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  searchParams: {}
})
// 是否可以点击批量导出
const canBatchAddExportFiles = ref(true)

function addEmployeeIdField() {
  if (store.state.user.showEmployeeId) {
    return [
      {
        type: 'input',
        label: '工号',
        val: '',
        filed: 'thirdPartyStaffId'
      }
    ]
  } else {
    return []
  }
}
// 更新业务主体筛选项
const initSearch = function () {
  const list = setBusinessChooseParam()
  data.searchComponents = data.searchComponents.concat(list)
}
initSearch()

// 获取成长体系等级
function getGrowthLevel() {
  userGrowthLevel({ isDetail: false }).then(res => {
    if (res.code === 0) {
      const resData = res.data || []
      resData.unshift({
        name: '全部',
        levelId: ''
      })

      data.searchComponents.forEach(x => {
        if (x.label === '达人等级') {
          x.selects = resData
        }
      })
    }
  })
}

// 获取矩阵号分组
function getUserGroupList(value) {
  getUserGroup({
    groupName: value
  }).then(res => {
    data.searchComponents.forEach(item => {
      if (item.label === '矩阵号分组') {
        item.selects = res.data.map(e => {
          return {
            label: e.groupName,
            value: e.id
          }
        })
      }
    })
  })
}

// 搜索
function searchList(searchData) {
  // if (searchData.orgId && searchData.orgId.length) {
  //   searchData.orgId = searchData.orgId[searchData.orgId.length - 1]
  // } else {
  //   searchData.orgId = null
  // }
  if (!searchData.accountType) {
    searchData.accountType = null
  }
  data.searchParams = searchData
  data.page.index = 1
  getList()
}

function resetList() {
  data.page.index = 1
  data.searchParams = {}
  getList()
}

function getList() {
  data.loading = true
  const searchQuery = getQuery(data.searchComponents)
  const params = Object.assign(searchQuery, {
    pageSize: data.page.size,
    pageNum: data.page.index,
    staffType: 1
  })
  if (isNotEmpty(searchQuery.businessQueryParams)) {
    params.businessQueryParams = searchQuery.businessQueryParams
  }
  getMemberMangeList(params)
    .then(res => {
      data.tableData = (res.data.records || []).map(e => {
        e.gold = e.gold || 0
        e.phone = e.phoneNum
        if (e.deptInfo) {
          const depList = e.deptInfo.split('|')
          e.allDepList = depList
          e.depList = depList.length > 2 ? depList.slice(0, 2) : depList
        }
        return e
      })
      data.page.total = res.data.total || 0
    })
    .finally(() => {
      data.loading = false
    })
}

// function showPhoneFun(e, i) {
//   data.tableData[i].showPhone = !data.tableData[i].showPhone
// }

// 变更金币
function showUpdateGoldDialog(row) {
  data.showDialog = true
  data.updateGoldInfo = row
}

function downLoadTemplate() {
  canBatchAddExportFiles.value = false
  return exportFile(exportModifyCoinsTemplate, {}, '批量修改金币模板', 'xlsx')
    .then(() => {
      canBatchAddExportFiles.value = true
    })
    .catch(() => {
      canBatchAddExportFiles.value = true
    })
}

function exportListFile() {
  const searchQuery = getQuery(data.searchComponents)
  const params = Object.assign({ staffType: 1 }, searchQuery)
  if (isNotEmpty(searchQuery.businessQueryParams)) {
    params.businessQueryParams = searchQuery.businessQueryParams
  }
  // if (params.orgId && params.orgId.length) {
  //   params.orgId = params.orgId[params.orgId.length - 1]
  // } else {
  //   params.orgId = null
  // }
  return exportFileV2(exporMemberMangementFile, params, '达人数据', 'xlsx')
}

onMounted(() => {
  if (route.query.levelId) {
    data.searchComponents.forEach(x => {
      if (x.label === '达人等级') {
        x.val = route.query.levelId
      }
    })
    data.searchParams.levelId = route.query.levelId
  }
  getList()
  getGrowthLevel()
})
// 修改部门
const hasChangePart = ref(false)
const systemModule = store.getters.systemModule
console.log(systemModule)
const publicList = systemModule.filter(item => item.scopeCode === 'public_authority')
if (publicList.length > 0) {
  const childrenMenuList = publicList[0].childrenPermissionList.filter(
    item => item.scopeCode === 'update_depart'
  )
  if (childrenMenuList.length > 0) {
    hasChangePart.value = true
  }
}
const updatePartForm = reactive({
  show: false
})
const showUpdatePartDialog = throttle(e => {
  updatePartForm.show = true
  updatePartForm.info = e
}, 300)

// 员工成长体系开关
const employeeGrowthSystemState = computed(() => {
  data.searchComponents.forEach(x => {
    console.log(x.label)
    if (x.label === '达人等级') {
      x.hiddenItem = !store.state.user.employeeGrowthSystemState
    }
  })
  return store.state.user.employeeGrowthSystemState
})
// const toDetail = openId => {
//   const routerUrl = `${window.location.origin}/content_center/content_matrix/details?openId=${openId}`
//   window.open(routerUrl, '_blank')
// }

// 显示成员动态的弹窗
const memberDynamicInfo = reactive({
  show: false
})
const showDynamicDialog = throttle(e => {
  memberDynamicInfo.userId = e.userId
  memberDynamicInfo.show = true
}, 300)

// 显示全部运营矩阵号信息
// 矩阵号是否授权有效
const isInvalid = item => {
  // （0：未授权，1：已授权，2：授权失败）
  if ([1, 2, 3, 4].indexOf(item.platform) === -1) return true
  const authKey = {
    1: 'dyAuth',
    2: 'wxAuth',
    3: 'xhsAuth',
    4: 'dyAuth'
  }
  return item[authKey[item.platform]] === 2
}
const showAllDialog = ref(false)
const accountList = ref([])
// 预览其余矩阵号
const openOtherAccount = list => {
  accountList.value = list
  showAllDialog.value = true
}
</script>

<style lang="scss" scoped>
.page_btns {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .page_btns_left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
}
.part_name {
  @include mult_line(1);
}

.status {
  font-size: 5px;
  margin-right: 4px;
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.status-2 {
  background-color: rgba(144, 147, 153, 1);
}

.status-3 {
  background-color: rgba(81, 248, 139, 1);
}

.status-4 {
  background-color: rgba(248, 81, 81, 1);
}

.account_info {
  display: flex;
  align-items: center;

  .account_info_name {
    > span,
    > i {
      vertical-align: middle;
      margin-right: 4px;
    }
  }

  img {
    margin-left: 8px;
    width: 16px;
    height: 16px;
  }
}

:deep(.page_main .el-tooltip__trigger) {
  display: inline-block !important;
}

.photos {
  display: flex;
  .photos_item {
    margin-right: 6px;
    position: relative;
    > img {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 50%;

      vertical-align: middle;
    }
    &.main {
      position: relative;
      border: 1px solid $theme_color;
      border-radius: 50%;
      // &:after {
      //   content: '主';
      //   display: flex;
      //   justify-content: center;
      //   align-items: center;
      //   width: 20px;
      //   height: 20px;
      //   background: #364fcd;
      //   border-radius: 50%;
      //   position: absolute;
      //   bottom: 0;
      //   right: -6px;
      //   color: #fff;
      //   font-size: 12px;
      // }
    }
    .fs_icon {
      position: absolute;
      width: 14px;
      height: 14px;
      bottom: 0;
      left: 22px;
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
// 弹框样式
.photos_dialog {
  display: flex;
  flex-direction: column;
  .photo_item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
  }
}
</style>

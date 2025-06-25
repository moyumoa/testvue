<template>
  <div style="height: calc(100% - 50px)">
    <div class="page_layout mt_16">
      <div class="section_tree" :style="showTree ? '' : 'overflow:hidden'">
        <el-input
          class="search_input"
          v-model.trim="sectionInput"
          clearable
          placeholder="请输入部门名称或成员名"
          @change="filterText"
        />
        <div
          style="min-height: 200px; height: calc(100% - 32px - 16px)"
          v-loading="showLeftLoading"
        >
          <div v-show="showTree">
            <!-- 如果是微信组织架构的，就支持自建部门 -->
            <!-- 如果是雅迪（三方）品牌下，也不支持自建部门 -->
            <template v-if="isWeiXin && orgSyncMode !== 1">
              <wxTree
                ref="wxTreeDOM"
                :department="department"
                @onNodeClick="onNodeClick"
                @loadNode="loadNode"
                @refreshTreeNode="refreshTreeNode"
              ></wxTree>
            </template>
            <!-- 否则 就不允许自建部门，只能是同步 -->
            <template v-else>
              <el-tree
                class="mt_16"
                ref="departTree"
                node-key="parentIds"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                :props="{ label: 'name', isLeaf: 'leaf' }"
                @node-click="onNodeClick"
                lazy
                :load="loadNode"
              >
                <template #default="{ node, data }">
                  <div class="tree_node">
                    <div class="node_text">
                      <div class="node_icon">
                        <i class="icon iconfont icon-jiagou"></i>
                      </div>
                      <div>{{ node.label }}</div>
                      <i
                        class="icon iconfont icon-dianpu"
                        :style="{ color: principalColor(data.type) }"
                        v-if="data.isOpen === 1 && data.type !== 1"
                      ></i>
                    </div>
                  </div>
                </template>
              </el-tree>
            </template>
          </div>
          <div v-show="!showTree" style="margin-top: 16px; height: 100%; overflow-y: auto">
            <div
              v-if="treeData.length"
              :infinite-scroll-delay="1000"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="treeData.length >= treeDataTotal"
            >
              <div
                :title="item.name"
                class="tree_section"
                v-for="(item, index) in treeData"
                :key="index"
                @click="onTreeClick(item)"
                :style="department.parentIds === item.parentIds ? 'background:#f0f4ff' : ''"
              >
                <div class="node_icon">
                  <i class="icon iconfont icon-jiagou"></i>
                </div>
                <div class="text">{{ item.name }}</div>
                <i
                  class="icon iconfont icon-dianpu"
                  :style="{ color: principalColor(item.type) }"
                  v-if="item.isOpen === 1 && item.type !== 1"
                ></i>
              </div>
              <div class="xm_pullUpToLoadMore">
                <img
                  src="/public/loading.gif"
                  v-if="showLeftLoading && treeDataPageNumber > 1"
                  alt=""
                />
                {{
                  showLeftLoading
                    ? treeDataPageNumber === 1
                      ? ''
                      : '加载中...'
                    : treeData.length >= treeDataTotal
                    ? treeData.length > 15
                      ? '已经到底了~'
                      : ''
                    : '上拉加载更多~'
                }}
              </div>
            </div>
            <div style="text-align: center; color: #c0c4cc; min-height: 200px" v-else>暂无数据</div>
          </div>
        </div>
      </div>
      <!-- 所有成员 -->
      <div
        class="section_staff"
        v-loading="showRightLoading"
        :style="isWeiXin && showQuitTable.show ? 'padding-top:18px' : ''"
      >
        <div class="section_top">
          <div class="section_top1">
            <div class="section_title" :style="!isWeiXin ? 'width:100%' : ''">
              <div class="section_title_title" :style="isWeiXin ? 'max-width:100%' : ''">
                {{ department.name }}
              </div>
              <div class="section_title_no" v-if="!isWeiXin">部门编号：{{ department.id }}</div>
            </div>
            <template v-if="isWeiXin">
              <el-button v-if="showQuitTable.show" @click="showQuitTable.show = false">
                返回
              </el-button>
              <div v-else class="section_top3">
                <exp_button :asyncFunc="exportDeptStaffFun">
                  <div class="section_quit">
                    <img
                      class="quit_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/202308307gfk6.png"
                      alt=""
                    />
                    导出成员列表
                  </div>
                </exp_button>
                <div class="section_quit" style="margin-left: 24px" @click="showQuitUserFun">
                  <img
                    class="quit_icon"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230210q1obl.png"
                    alt=""
                  />
                  查看离职成员
                </div>
              </div>
            </template>
            <!-- 除了微信组织架构，如果是根部门就在右边显示开关 -->
            <template v-if="!isWeiXin && department.id === 0">
              <div class="section_switch" style="min-width: 220px; justify-content: flex-end">
                <el-switch v-model="isSwitch" inline-prompt @change="resetStaffList"></el-switch>
                <div class="switch_mark">仅展示部门的直属成员</div>
              </div>
            </template>
          </div>
          <div
            class="section_top2"
            v-if="!showQuitTable.show && !(!isWeiXin && department.id === 0)"
          >
            <div class="section_switch" v-if="!(!isWeiXin && department.id === 0)">
              <el-switch v-model="isSwitch" inline-prompt @change="resetStaffList"></el-switch>
              <div class="switch_mark">仅展示部门的直属成员</div>
            </div>
            <div class="section_btn">
              <el-button
                v-if="isWeiXin"
                type="primary"
                :icon="transElIconName('Plus')"
                @click="invitationFun"
              >
                邀请成员加入
              </el-button>
              <el-button v-if="isWeiXin" @click="showImportDialogFun">批量导入成员</el-button>
              <el-button v-if="isWeiXin" @click="batchChangeDepartFun">变更部门</el-button>
              <template v-if="department.id != 0">
                <div
                  class="entity_name"
                  v-if="currentNode?.type !== 1 && currentNode?.isOpen === 1"
                >
                  <EntityIcon :type="currentNode.type"></EntityIcon>
                  <span style="margin-left: 6px">{{ currentNode.principalName }}</span>
                </div>
                <!--                v-if="canChangeStoreMark"-->
                <el-button
                  :type="
                    currentNode?.type !== 1 && currentNode?.isOpen === 1 ? 'default' : 'primary'
                  "
                  @click="showBusinessEntity = true"
                >
                  标记业务主体
                </el-button>
              </template>
            </div>
          </div>
        </div>
        <!-- 已离职成员 -->
        <div class="staff_list" v-if="showQuitTable.show">
          <quitTableDOM :id="showQuitTable.id" :isDirect="isSwitch"></quitTableDOM>
        </div>
        <!-- 所有在职成员 -->
        <div class="staff_list" v-show="!showQuitTable.show">
          <xm_table
            ref="staffTable"
            rowKey="userId"
            class="pic_table"
            tableType="avatar"
            :data="listData"
            v-model:page="page"
            @getTableData="getStaffList"
            v-loading="!showRightLoading && showRightTableLoading"
            :showSelection="isWeiXin"
            @selection-change="handleSelectionChange"
            :select="selectUserList"
          >
            <el-table-column label="成员信息" prop="name" min-width="150">
              <template #default="{ row }">
                <div class="table_photo">
                  <img class="photo_img" v-if="row.photo" :src="row.photo" alt />
                  <template v-else>
                    <default-photo
                      class="photo_img"
                      type="selfBuilt"
                      v-if="architectureMode == 4"
                      :name="row.name"
                    />
                    <img
                      class="photo_img"
                      v-else
                      src="@/assets/images/content_center/default_user.png"
                    />
                  </template>
                  <div class="namePhone_box">
                    <div class="name_name">
                      <div class="name_box" :style="row.staffStatus === 2 ? '' : 'max-width:100%'">
                        {{ row.name }}
                      </div>
                      <span v-if="row.staffStatus === 2" class="g_departure">已离职</span>
                    </div>
                    <table_column_phone v-if="row.phone" :phone="row.phone"></table_column_phone>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="部门" min-width="170">
              <template #default="{ row }">
                <template v-if="row.departmentList && row.departmentList.length > 0">
                  <span v-for="(item, index) in row.departmentList" :key="item">
                    {{ item }}
                    <template v-if="index + 1 !== row.departmentList.length">/</template>
                  </span>
                </template>
                <template v-else>--</template>
              </template>
            </el-table-column>
            <el-table-column label="状态" min-width="100" v-if="!isWeiXin">
              <template #default="{ row }">
                <template v-if="isWeiXin">
                  <div v-if="row.bindStatus === 1" class="table_point">已启用</div>
                  <div v-else class="table_point gray">已禁用</div>
                </template>
                <template v-else>
                  <div v-if="row.bindStatus === 1" class="table_point">已绑定</div>
                  <div v-else class="table_point gray">未绑定</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column
              v-if="isWeiXin"
              label="消息触达状态"
              prop="deliverCount"
              min-width="135"
            >
              <template #header>
                <div class="column_header">
                  <span>公众号消息触达状态</span>
                  <el-tooltip popper-class="tooltip-class" placement="top">
                    <template #content>
                      <div class="column_header_content">
                        成员需关注微信公众号“星麦云服务号”，才能收到任务通知等各种系统消息的推送。
                        <span @click="openFollow">公众号二维码点这里</span>
                      </div>
                    </template>
                    <img
                      src="@/assets/images/operate/tip_line.png"
                      style="width: 12px; height: 12px; margin-left: 4px"
                    />
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div v-if="row.isFollowOfficial === 1" class="table_point">可触达</div>
                <div v-else class="table_point gray">无法触达</div>
              </template>
            </el-table-column>
            <el-table-column v-if="isWeiXin" label="操作" width="150" align="right" fixed="right">
              <template #header v-if="orgSyncMode == 1">
                <div class="column_header column_header_end">
                  <span>操作</span>
                  <el-tooltip popper-class="tooltip-class" placement="top">
                    <template #content>
                      <p>从API同步的员工不支持编辑操作</p>
                    </template>
                    <img
                      src="@/assets/images/operate/tip_line.png"
                      style="width: 12px; height: 12px; margin-left: 4px"
                    />
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <template v-if="!row.thirdPartyStaffId">
                  <div class="xm_table_action xm_table_action_line xm_table_action_right">
                    <el-link type="primary" @click="changeDepartFun(row)">变更部门</el-link>
                    <template v-if="row.userCompanyType != 1">
                      <div class="action_line"></div>
                      <!-- admin账号不能离职 -->
                      <el-link type="danger" @click="quitFun(row)">离职</el-link>
                    </template>
                  </div>
                </template>
                <!-- 雅迪不支持“变更部门”及“离职”操作 -->
                <template v-else>
                  <span>-</span>
                </template>
              </template>
            </el-table-column>
          </xm_table>
        </div>
      </div>
    </div>

    <!-- 邀请更多成员的弹窗 -->

    <invitationDOM
      v-if="invitationDialog.show"
      v-model:mode="invitationDialog.mode"
      :invitationDialog="invitationDialog"
      @getStaffList="resetStaffList"
    ></invitationDOM>
    <!-- 批量导入成员的弹窗 -->
    <import-file-dialog
      v-model:show="importDialog.show"
      title="批量导入成员"
      tips="注：单次最多导入1000条"
      uploadUrl="/api/v1/system/account/staff/importUser"
      :exportFile="batchAddExportFiles"
      :canBatchAddExportFiles="canBatchAddExportFiles"
      @uploadSuccess="resetStaffList"
    ></import-file-dialog>
    <!-- 操作离职的弹窗 -->
    <quitDOM v-if="quitDialog.show" :quitDialog="quitDialog" @getStaffList="getStaffList"></quitDOM>
    <!-- 变更部门的弹窗 -->
    <changeDepartDOM
      v-if="changeDepartDialog.show"
      :changeDepartDialog="changeDepartDialog"
      @resetStaffList="resetStaffList"
    ></changeDepartDOM>
    <!-- 变更业务主体 -->
    <BusinessEntity
      v-if="showBusinessEntity"
      v-model="showBusinessEntity"
      :current-type="department?.type"
      @confirm="changeStoreMark"
    ></BusinessEntity>
    <!-- 关注公众号 -->
    <followDOM
      v-if="showFollowDialog"
      v-model="showFollowDialog"
      @getStaffList="followToGetStaffList"
    />
  </div>
</template>

<script setup>
import followDOM from './components/follow_dialog.vue'
import quitTableDOM from './components/quit_table.vue'
import quitDOM from './components/quit_dialog.vue'
import changeDepartDOM from './components/changeDepart_dialog.vue'
import { exportFile, exportFileV2 } from '@/utils/exportFile'
import importFileDialog from '@/views/market/components/import_file_dialog.vue'
import invitationDOM from '@/views/system/organization_framework/components/invitation_dialog.vue'
import wxTree from '@/views/system/organization_framework/components/wx_tree.vue'
import DefaultPhoto from '@/views/system/components/default_photo/index.vue'
import { debounce, transElIconName, throttle, isEmpty } from '@/utils/tools'

import { dept } from '@/api/system_setting/section'
import { deptStaffPage } from '@/api/system_setting/account'

import { changeDepartmentStoreMark } from '@/api/market/store'
import { hasResign, downloadTemplate, exportDeptStaffPage } from '@/api/system_setting/framework.js'
import BusinessEntity from '@/views/system/organization_framework/components/business_entity.vue'
import EntityIcon from '@/views/system/business_entity/components/entity_icon.vue'
import { getBusinessEntity } from '@/api/system_setting/business_entity.js'
import { getLazyDeptTree } from '@/api/main/dept.js'

const architectureMode = computed(() => {
  return localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).architectureMode
    : null
})

const orgSyncMode = computed(() => {
  return localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).orgSyncMode
    : null
})

const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
const isWeiXin = ref(true)
isWeiXin.value = localStorage.getItem('isWeiXin') === '1'
const leftTree = ref([])
const showTree = ref(true)

const staffTable = ref()
const $message = inject('$message')
const showLeftLoading = ref(false)
const showRightLoading = ref(false)
const showRightTableLoading = ref(false)

const listData = ref([])
const page = reactive({
  index: 1,
  size: 10,
  total: 0
})
const department = reactive({
  id: null,
  name: '',
  type: null,
  brandId: null,
  parentIds: ''
})

const sectionInput = ref('')
watch(
  () => sectionInput.value,
  (newVal, oldVal) => {
    if (newVal === '') {
      showTree.value = true
    }
  }
)
const wxTreeDOM = ref() // 微信组织架构的树形DOM
const departTree = ref() // 除了微信组织架构的树形DOM
const treeData = ref([]) // 输入部门名称或成员名所匹配到的数据
const treeDataTotal = ref(null)
const treeDataPageNumber = ref(1)
// 输入部门名称或成员名所触发的修改方法
const filterText = () => {
  sectionInput.value && (showTree.value = false)
  if (sectionInput.value) {
    treeDataPageNumber.value = 1
    showLeftLoading.value = true
    dept({ name: sectionInput.value, pageNumber: treeDataPageNumber.value, pageSize: 30 })
      .then(res => {
        const records = res.data.records || []
        records.forEach(x => {
          x.parentIds =
            x.parentIds.substring(x.parentIds.length - 1) === '/'
              ? x.parentIds + x.departmentId
              : x.parentIds
        })
        treeData.value = records
        treeDataTotal.value = res.data.total
        showLeftLoading.value = false
      })
      .catch(err => {
        showLeftLoading.value = false
        console.log(err, 'errr')
      })
  } else {
    treeData.value = []
    if (leftTree.value && leftTree.value.length > 0) {
      setCurrentFun(leftTree.value[0])
      setCurrentStyleFun(leftTree.value[0].id)
    } else {
      department.name = ''
      department.id = null
      department.parentIds = ''
    }
    resetStaffList()
  }
}
function loadFun() {
  treeDataPageNumber.value++
  showLeftLoading.value = true
  dept({ name: sectionInput.value, pageNumber: treeDataPageNumber.value, pageSize: 30 })
    .then(res => {
      const newListData = res.data.records || []
      newListData.forEach(x => {
        x.parentIds =
          x.parentIds.substring(x.parentIds.length - 1) === '/'
            ? x.parentIds + x.departmentId
            : x.parentIds
      })
      treeData.value = treeData.value.concat(newListData)

      showLeftLoading.value = false
    })
    .catch(err => {
      showLeftLoading.value = false
      console.log(err, 'errr')
    })
}
// 设置当前选中的部门信息
function setCurrentFun(data) {
  department.name = data.name
  department.id = data.id
  department.type = data.type
  department.isTypeChangeable = data.isTypeChangeable
  department.brandId = data.brandId
  department.parentIds =
    data.parentIds.substring(data.parentIds.length - 1) === '/'
      ? data.parentIds + data.id
      : data.parentIds
}

// 设置当前选中的部门样式
function setCurrentStyleFun(id) {
  if (isWeiXin.value) {
    wxTreeDOM.value?.$refs.treeWx.setCurrentKey(id)
  } else {
    departTree.value?.setCurrentKey(id)
  }
}

// tree筛选
function filterNode(value, data) {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}

function init() {
  sectionInput.value = ''
  showTree.value = true
  listData.value = []
  // 获取业务主体 类型
  getBusinessEntity({}).then(res => {
    if (res.code === 0) {
      entityList.value = res.data || []
    }
  })
}

init()
const entityList = ref([])
// 是否能标记部门
// const canChangeStoreMark = computed(() => {
//   console.log(entityList.value,entityList.value.some(item => item.isOpen === 1))
//   return department.isTypeChangeable !== 0 && entityList.value.some(item => item.isOpen === 1)
// })

// 清空表格的选中状态并请求数据
function resetStaffList() {
  showQuitTable.show = false
  if (isWeiXin.value) {
    staffTable.value?.$refs.table.clearSelection()
  }
  page.index = 1
  getStaffList()
}

const isSwitch = ref(true) // 只展示直属部门
// 获取部门成员
const getStaffList = noLoading => {
  if (!noLoading) {
    showRightTableLoading.value = true
  }
  deptStaffPage({
    isDirect: isSwitch.value ? 1 : 0,
    name: sectionInput.value,
    pageNumber: page.index,
    pageSize: page.size,
    departmentId: department.id
  })
    .then(res => {
      listData.value = res.data.records
      page.total = res.data.total
      showRightTableLoading.value = false
      showRightLoading.value = false
    })
    .catch(() => {
      showRightTableLoading.value = false
      showRightLoading.value = false
    })
}
const currentNode = ref(null)
const onNodeClick = data => {
  showRightLoading.value = true
  setCurrentFun(data)
  resetStaffList()
  currentNode.value = data
}
const onTreeClick = item => {
  showRightLoading.value = true
  item.id = item.departmentId
  setCurrentFun(item)
  resetStaffList()
  currentNode.value = item
}
// 标记/取消标记部门
const changeStoreMark = debounce((value, name) => {
  changeDepartmentStoreMark({
    brandId: department.brandId,
    deptIds: [department.id],
    principalType: value
  }).then(res => {
    if (res.code === 0) {
      $message.success('操作成功')
      if (name) {
        currentNode.value.principalName = name
      }
      currentNode.value.type = value
      currentNode.value.isOpen = value === 1 ? 0 : 1
      department.type = currentNode.value.type
      // 如果是筛选的时候标记/取消标记部门，要把树形结构的部门标记也做修改
      if (!showTree.value) {
        // 要使用树的node.expand取更新节点
        refreshTreeNode(department.parentIds)

        treeData.value.forEach(x => {
          const splitList = x.parentIds.split('/')
          if (parseInt(splitList[splitList.length - 1]) === department.id) {
            x.type = value
          }
        })
      }
    }
  })
})
function resetCurrentFun() {
  if (leftTree.value[0]) {
    setCurrentFun(leftTree.value[0])
    nextTick(() => {
      setCurrentStyleFun(leftTree.value[0].id)
    })
  }
  department.id !== null && resetStaffList()
}
// 更新树节点的业务主体 id 要更新的nodeID isParent是否要刷新整个树
function refreshTreeNode(id, isParent, refreshR) {
  let node = null
  if (isWeiXin.value) {
    node = wxTreeDOM.value?.$refs.treeWx?.getNode(id)
  } else {
    node = departTree.value?.getNode(id)
  }
  if (node) {
    // 需要每次都去请求接口获取最新的数据
    if (isParent) {
      // 刷新整个树，并且设置右边列表为跟部门
      node.loaded = false
      node.expand()
      if (refreshR) {
        resetCurrentFun()
      }
    } else {
      const parentId = node.parent.key
      let node2 = null
      if (isWeiXin.value) {
        node2 = wxTreeDOM.value?.$refs.treeWx?.getNode(parentId)
      } else {
        node2 = departTree.value?.getNode(parentId)
      }
      if (node2) {
        node2.loaded = false
        node2.expand()
      }
    }
  }
}

const invitationDialog = reactive({
  id: null,
  name: '',
  mode: 'wx', // wx 微信模式 app 星麦云app
  show: false
})
// 显示邀请成员的弹窗
const invitationFun = throttle(() => {
  invitationDialog.id = department.id || 0
  invitationDialog.name = department.name || ''
  invitationDialog.show = true
}, 700)

// 显示导入成员的弹窗
const importDialog = reactive({
  id: null,
  show: false
})
const showImportDialogFun = throttle(() => {
  importDialog.id = department.id || 0
  importDialog.show = true
}, 700)

// 批量导入的模板下载是否是可点击
const canBatchAddExportFiles = ref(true)

// 批量导入模板时下载模板
function batchAddExportFiles() {
  canBatchAddExportFiles.value = false
  const params = {
    deptId: importDialog.id || 0
  }
  return exportFile(downloadTemplate, params, '批量导入成员', 'xlsx')
    .then(() => {
      canBatchAddExportFiles.value = true
    })
    .catch(() => {
      canBatchAddExportFiles.value = true
    })
}

// 表格的选中人员
const selectUserList = ref([])

function unique(arr) {
  const res = new Map()
  return arr.filter(arr => !res.has(arr.userId) && res.set(arr.userId, 1))
}

// 表格的选择
function handleSelectionChange(e) {
  selectUserList.value = unique(e)
}

// 变更部门
const changeDepartDialog = reactive({
  userIds: [],
  show: false
})
// 批量变更部门
const batchChangeDepartFun = throttle(() => {
  if (selectUserList.value && selectUserList.value.length > 0) {
    const selectUserIds = selectUserList.value.map(x => x.userId)
    changeDepartDialog.userIds = selectUserIds
    changeDepartDialog.show = true
  } else {
    $message.warning('请先选中成员')
  }
}, 700)
// 单个变更部门
const changeDepartFun = throttle(e => {
  changeDepartDialog.userIds = [e.userId]
  changeDepartDialog.show = true
}, 700)

// 离职
const quitDialog = reactive({
  userId: null,
  show: false
})
const quitFun = throttle(e => {
  quitDialog.userId = e.userId
  quitDialog.show = true
}, 700)

// 查看已离职成员
const showQuitTable = reactive({
  id: null,
  show: false
})
const showQuitUserFun = throttle(() => {
  hasResign({
    id: department.id,
    isDirect: isSwitch.value ? 1 : 0
  })
    .then(res => {
      if (res.code === 0) {
        if (res.data) {
          showQuitTable.id = department.id
          showQuitTable.show = true
        } else {
          $message.warning('该部门无离职成员')
        }
      }
    })
    .catch(() => {})
}, 700)

// 业务主体
const showBusinessEntity = ref(false)
const principalColor = type => {
  const obj = {
    2: '#3B81F3',
    3: '#F99C41',
    4: '#48B42D'
  }
  return obj[type + ''] || obj['1']
}
// 关注微信公众号
const showFollowDialog = ref(false)
const openFollow = throttle(() => {
  showFollowDialog.value = true
}, 500)

// 关注公众号弹窗关闭时，刷新列表
function followToGetStaffList() {
  getStaffList(true)
}

const track = inject('$tracking')
// 微信架构下 导出成员列表
const exportDeptStaffFun = () => {
  track.clickBtn(205)
  const params = {
    isDirect: isSwitch.value ? 1 : 0,
    name: sectionInput.value,
    departmentId: department.id
  }
  return exportFileV2(exportDeptStaffPage, params, '微信架构-成员列表', 'xlsx')
}

// 依次加载树形结构
function loadNode(node, resolve) {
  const { level, data } = node
  getLazyDeptTree({
    deptId: level === 0 ? null : data.id,
    deptIdParentPath: data.parentIds || '',
    isUsePermission: false
  }).then(res => {
    if (res.code === 0) {
      const list = res.data || []
      list.forEach(x => {
        x.leaf = !x.hasChildren // 是否有下一级
      })
      if (level === 0 && isEmpty(department.id)) {
        setCurrentFun(list[0])
        nextTick(() => {
          setCurrentStyleFun(list[0].id)
        })
        department.id !== null && resetStaffList()
        leftTree.value = list
      }
      resolve(list)
    }
  })
}
</script>

<style lang="scss" scoped>
@import './components/scss/framework_table.scss';

.page_layout {
  display: flex;
  height: 100%;

  .section_tree {
    border-radius: 4px;
    height: 100%;
    width: 320px;
    background: #fff;
    margin-right: 16px;
    padding: 24px 0 24px 24px;
    box-sizing: border-box;
    overflow-y: auto;

    .search_input {
      width: calc(100% - 24px);
      margin: 0;
    }

    .tree_section {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 16px;
      cursor: pointer;
      padding: 5px;
      align-items: center;

      &:hover {
        background: #ecf5ff;
      }

      .node_icon {
        width: 20px;
        height: 20px;
        margin-right: 6px;
        background: #364fcd;
        opacity: 0.6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;

        .iconfont {
          font-size: 12px !important;
        }
      }

      .text {
        line-height: 26px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-wrap: break-word;
        max-width: calc(100% - 60px);
      }

      .icon-dianpu {
        margin-left: 4px;
        font-size: 20px;
        line-height: 26px;
        //color: $theme_color;
      }
    }

    .tree_node {
      display: flex;
      line-height: 26px;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .node_text {
        display: flex;
        align-items: center;

        .node_icon {
          width: 20px;
          height: 20px;
          margin-right: 6px;
          background: #364fcd;
          opacity: 0.6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;

          .iconfont {
            font-size: 12px !important;
          }
        }

        .node_empty {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 10px;
        }

        .icon-dianpu {
          margin-left: 6px;
          //font-size: 20px;
          //line-height: 26px;
          color: $theme_color;
        }
      }

      .node_btns {
        display: none;
        align-items: center;

        i {
          color: $theme_color;
          margin-right: 24px;

          &:last-child {
            margin-right: 16px;
            color: #303133;
          }
        }
      }

      &:hover {
        .node_btns {
          display: flex;
        }
      }
    }

    :deep(.el-tree-node) {
      max-width: 100vw;
      width: max-content;
      min-width: 100%;
    }

    :deep(.el-tree > .el-tree-node) {
      padding-right: 24px;
    }
  }

  .section_staff {
    border-radius: 4px;
    width: calc(100% - 320px);
    height: 100%;
    background: #fff;
    padding: 22px 24px;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;

    .staff_title {
      font-size: 18px;
      font-weight: 600;
      line-height: 25px;
      margin-bottom: 22px;
      display: flex;
      align-items: center;

      .icon {
        font-size: 20px;
        margin: 0 8px 0 12px;
      }

      .staff_total {
        flex: 1;
        font-weight: normal;
        font-size: 14px;
        color: #c0c4cc;
        display: flex;
        align-items: center;
        transform: translateY(1px);

        span {
          line-height: 25px;
          transform: translateY(1px);
        }
      }
    }

    .staff_list {
      box-sizing: border-box;
    }

    .staff_search {
      display: flex;
      align-items: center;
    }
  }
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #f0f4ff;
}

.section_top {
  margin-bottom: 20px;

  .section_top1 {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .section_title {
      width: calc(100% - 260px);

      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      .section_title_title {
        @include mult_line(1);
        max-width: calc(100% - 200px);
        font-size: 18px;
        font-weight: 600;
        color: #333333;
        line-height: 26px;
      }

      .section_title_no {
        margin-left: 12px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
    }

    .section_quit {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #364fcd;
      line-height: 20px;

      .quit_icon {
        width: 16px;
        height: 16px;
        object-fit: cover;
        margin-right: 4px;
      }
    }
  }
  .section_top3 {
    width: 260px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    :deep(.el-button) {
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      min-height: auto !important;
      height: max-content !important;
      background-color: rgba(0, 0, 0, 0) !important;
    }
  }

  .section_switch {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    .switch_mark {
      margin-left: 14px;
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      line-height: 18px;
    }
  }

  .section_top2 {
    margin-top: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    .section_btn {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;

      .el-button + .el-button {
        margin-left: 16px;
      }
    }
  }
  .entity_name {
    display: flex;
    align-items: center;
    margin: 0 20px;
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
  }
}

:deep(.is-horizontal) {
  display: none !important;
}
:deep(.column_header) {
  display: flex;
  align-items: center;
}
.column_header_end {
  justify-content: flex-end;
}
.column_header_content {
  max-width: 318px;
  span {
    color: rgb(35, 136, 255);
    cursor: pointer;
  }
}
.xm_pullUpToLoadMore {
  padding-bottom: 15px;
}
</style>

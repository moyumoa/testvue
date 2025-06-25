<template>
  <div
    class="entity_card"
    :style="isHideLeftMenu ? 'width:calc(100vw / 3)' : ''"
    v-loading="loading"
  >
    <div class="top_title">
      <EntityIcon :type="info.principalType"></EntityIcon>
      <div class="entity_name">
        {{ info.principalName }}（{{
          editState ? '-' : info.isOpen === 1 ? info.principalDeptNumber : 0
        }}）
      </div>
      <template v-if="info.isOpen">
        <el-button
          style="padding: 0"
          type="text"
          :disabled="editStateDisabled"
          link
          @click="openEdit"
        >
          添加
        </el-button>
        <el-button
          style="padding: 0"
          type="text"
          :disabled="editStateDisabled || info.principalDeptNumber === 0"
          link
          @click="grouping"
        >
          分组
        </el-button>
        <el-dropdown :append-to-body="false" :teleported="false">
          <div class="function_icon"></div>
          <template #dropdown>
            <el-dropdown-menu :teleported="false">
              <el-dropdown-item>
                <el-link
                  type="primary"
                  style="margin-left: unset"
                  @click="switchRenameDialog(true)"
                >
                  重命名
                </el-link>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-link type="primary" style="margin-left: unset" @click="switchState('close')">
                  关闭
                </el-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
    <!-- 1。 关闭状态 -->
    <div class="center_container middle_container" v-if="!info.isOpen">
      <div class="close_icon"></div>
      <el-button @click="switchState('open')">立即开启</el-button>
    </div>
    <!-- 2。 列表 向下加载更多  -->
    <div
      class="middle_container"
      :class="{ middle_container_has_group: hasGroup && !groupStatus }"
      v-else-if="!editState"
    >
      <div class="middle_search_input" v-if="info.principalDeptNumber > 0">
        <el-input
          v-model="searchParams.departmentName"
          @keyup.enter="searchInfo"
          placeholder="请输入部门名称搜索"
        >
          <template #suffix>
            <el-icon class="el-input__icon" @click="searchInfo" style="cursor: pointer">
              <i-search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <div
        v-show="hasGroup && list.length > 0"
        class="xm_collapse_warp"
        :class="{ xm_collapse_warp_group: groupStatus }"
        v-infinite-scroll="loadMore"
        :infinite-scroll-distance="100"
        :infinite-scroll-disabled="listFinished"
      >
        <!-- <div class="select_all_warp" v-if="groupStatus">
          <el-checkbox
            label="全选"
            v-model="checkAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
            :disabled="groupCheckAllDisabledStatus"
          >
            全选
          </el-checkbox>
        </div> -->
        <!-- 每个分组 -->
        <div
          class="xm_collapse_item"
          :class="{ xm_collapse_item_active: activeNames.includes(item.id) }"
          v-for="item in list"
          :key="item.id"
        >
          <div class="title_warp" @click.stop="beforeHandleChange(item)">
            <el-icon class="el-icon_arrow-down"><i-arrow-down /></el-icon>
            <div class="title">{{ item.groupName }}</div>
            <el-dropdown :append-to-body="false" :teleported="false" :disabled="item.loading">
              <div class="function_icon" @click.stop v-if="item.isGroup"></div>
              <template #dropdown>
                <el-dropdown-menu :teleported="false">
                  <el-dropdown-item>
                    <el-link
                      type="primary"
                      style="margin-left: unset"
                      @click.stop="openRename(item)"
                    >
                      重命名
                    </el-link>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-link type="primary" style="margin-left: unset" @click.stop="delGroup(item)">
                      删除
                    </el-link>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="loading_warp" v-if="item.loading" v-loading="item.loading"></div>

          <div class="collapse_content_warp">
            <!-- 选择时 -->
            <template v-if="groupStatus">
              <el-checkbox
                v-for="cItem in item.children"
                :label="cItem.id"
                :key="cItem.id"
                v-model="cItem.checked"
                @change="handleCheckedChange($event, item, cItem)"
              >
                <template #default>
                  <div class="scroll_wrapper_item">
                    <div class="item__title" :title="cItem.departmentName">
                      {{ cItem.departmentName || '--' }}
                    </div>
                    <div class="item__info">
                      <span class="info_label">成员：</span>
                      <span class="info_text">
                        {{ cItem.userCount || 0 }}
                      </span>
                    </div>
                    <div class="item__info">
                      <span class="info_label">有效矩阵号：</span>
                      <span class="info_text">
                        {{ cItem.authValidAccountCount || 0 }}
                      </span>
                    </div>
                  </div>
                </template>
              </el-checkbox>
            </template>
            <!-- 不选择时 -->
            <template v-else>
              <div class="scroll_wrapper_item" v-for="cItem in item.children" :key="cItem">
                <div class="item__title" :title="cItem.departmentName">
                  <span class="name">{{ cItem.departmentName || '--' }}</span>

                  <!-- 移动至 -->
                  <div class="move_warp">
                    <span
                      class="el-dropdown-link"
                      style="cursor: pointer"
                      @click="groupChange(item, cItem)"
                    >
                      移动至
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240509gbccv.png"
                        alt=""
                        class="move_icon"
                      />
                    </span>
                  </div>
                </div>
                <div class="item__info">
                  <span class="info_label">成员：</span>
                  <span class="info_text">
                    {{ cItem.userCount || 0 }}
                  </span>
                </div>
                <div class="item__info">
                  <span class="info_label">有效矩阵号：</span>
                  <span class="info_text">
                    {{ cItem.authValidAccountCount || 0 }}
                  </span>
                </div>
              </div>
            </template>

            <div
              class="get_more"
              :class="{
                get_more_disabled:
                  item.page && item.children && item.page.total === item.children.length
              }"
              @click="getMore(item)"
            >
              {{
                item.loading
                  ? '加载中...'
                  : item.page && item.children && item.page.total === item.children.length
                  ? '已经到底了~'
                  : '点击加载更多~'
              }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-show="!hasGroup && list.length > 0"
        class="scroll_wrapper"
        :class="{ xm_collapse_warp_group: groupStatus }"
        v-infinite-scroll="loadMore"
        :infinite-scroll-distance="100"
        :infinite-scroll-disabled="listFinished"
      >
        <template v-if="!groupStatus">
          <div class="scroll_wrapper_item" v-for="item in list" :key="item">
            <div class="item__title" :title="item.departmentName">
              {{ item.departmentName || '--' }}
            </div>
            <div class="item__info">
              <span class="info_label">成员：</span>
              <span class="info_text">
                {{ item.userCount || 0 }}
              </span>
            </div>
            <div class="item__info">
              <span class="info_label">有效矩阵号：</span>
              <span class="info_text">
                {{ item.authValidAccountCount || 0 }}
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="select_all_warp">
            <el-checkbox
              label="全选"
              v-model="checkAllV2"
              :indeterminate="isIndeterminateV2"
              @change="handleCheckAllChangeV2"
            >
              全选
            </el-checkbox>
          </div>
          <el-checkbox
            v-for="item in list"
            :key="item.id"
            :label="item.id"
            v-model="item.checked"
            @change="handleCheckedChangeV2($event, item)"
          >
            <template #default>
              <div class="scroll_wrapper_item">
                <div class="item__title" :title="item.departmentName">
                  {{ item.departmentName || '--' }}
                </div>
                <div class="item__info">
                  <span class="info_label">成员：</span>
                  <span class="info_text">
                    {{ item.userCount || 0 }}
                  </span>
                </div>
                <div class="item__info">
                  <span class="info_label">有效矩阵号：</span>
                  <span class="info_text">
                    {{ item.authValidAccountCount || 0 }}
                  </span>
                </div>
              </div>
            </template>
          </el-checkbox>
        </template>
      </div>
      <!-- 暂无数据 -->
      <div class="no_data" v-if="list.length === 0">
        <el-empty
          :image-size="70"
          image="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/bb500557fe2e43cea32c45b68eca89dc_1685948431961.png"
          description="暂无数据"
        />
      </div>
      <!--   分组的保存与取消按钮 -->
      <div class="bottom_btn" v-if="groupStatus">
        <el-button @click="cancelGroup">取消</el-button>
        <el-button
          type="primary"
          @click="openSave"
          :disabled="hasGroup ? !chooseIds.length : !chooseIdsV2.length"
        >
          保存
        </el-button>
      </div>
    </div>

    <!-- 3。树形结构    -->
    <DeptTree
      v-if="editState"
      v-model="editState"
      :chooseNodes="list"
      :info="info"
      @cancel="cancelAfter"
      @update="updateAfter"
    ></DeptTree>
    <!-- 重命名   -->
    <el-dialog
      v-model="rename.visible"
      custom-class="role_dialog"
      title="编辑业务主体类型"
      :before-close="dialogBeforeClose"
      :close-on-click-modal="false"
      width="420px"
    >
      <div class="input_wrapper">
        <el-form
          ref="formRef"
          :model="rename"
          :rules="rules"
          :hide-required-asterisk="true"
          label-width="90px"
        >
          <el-form-item label="名称" prop="inputValue">
            <el-input
              v-model="rename.inputValue"
              @input="inputEmit"
              placeholder="请输入"
              show-word-limit
              maxlength="5"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="switchRenameDialog(false)">取消</el-button>
          <el-button type="primary" @click="renameSubmit" :disabled="rename.disabled">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 保存分组 -->
    <groupSave
      v-if="groupSaveData.show"
      :info="groupSaveData"
      @createGroup="openCreate"
      @close="openSaveCancel"
      @submit="saveGroupSubmit"
    />
    <!-- 新建分组 -->
    <groupNew
      v-if="groupCreateData.show"
      :info="groupCreateData"
      @cancel="groupNewCancel"
      @submit="groupNewSubmit"
    />
  </div>
</template>

<script setup>
import groupNew from './group_new_dialog.vue'
import groupSave from './group_save_dialog.vue'
import EntityIcon from '@/views/system/business_entity/components/entity_icon.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getBusinessEntityByPage,
  principalRename,
  switchBusinessEntity,
  getGroupList,
  allGroupList,
  createDeptGroup,
  deleteDeptGroup,
  updateDeptGroup,
  moveGroupDepts,
  principalStatus
} from '@/api/system_setting/business_entity.js'
import DeptTree from '@/views/system/business_entity/components/dept_tree.vue'
import { useStore } from 'vuex'
import { throttle } from '@/utils/tools'

// 判断是否可以编辑
const store = useStore()
const editStateDisabled = computed(() => {
  return store.state.system.editBusinessEntity === 0 || groupStatus.value
})
const isHideLeftMenu = store.getters.isHideLeftMenu
const editState = ref(false) // 是不是树形的编辑状态
watch(
  () => editState.value,
  newValue => {
    store.commit('system/setEditBusinessEntity', newValue ? 0 : 1)
  }
)
onBeforeUnmount(() => {
  // 页面离开时 重置
  store.commit('system/setEditBusinessEntity', 1)
})
const openEdit = () => {
  editState.value = true
}

const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        principalType: 1,
        principalName: '门店',
        isOpen: true
      }
    }
  },
  entityList: { type: Array, default: () => [] }
})
const emits = defineEmits(['update', 'updateBrother'])
const { info } = toRefs(props)
const loading = ref(false)

// 列表搜索
// const searchInput = ref('')
const listLoading = ref(false)
const listFinished = ref(false)
const list = ref([])
const searchParams = reactive({
  departmentName: '',
  pageNumber: 0,
  pageSize: 20,
  principalType: info.value.principalType
})
// 没有分组时选择（初次分组之前）
const checkAllV2 = ref(false) // 全选是否选中
const isIndeterminateV2 = ref(false) // 半选装填
const chooseIdsV2 = ref([])
const groupListV2 = ref([]) // 所有分组列表，用于筛选
// ----- 分组 -----
const hasGroup = ref(false) // 当前数据是否已添加过分组
const groupStatus = ref(false) // 是否在操作分组
const activeNames = ref([]) // 当前打开的分组ids
const chooseIds = ref([]) // 选中的ids
const checkAll = ref(false) // 是否全选
const isIndeterminate = ref(false) // 	设置不确定状态，仅负责样式控制
const groupCheckAllDisabledStatus = ref(true) // 有分组的情况下，在编辑分组时的全选是否禁用

// const groupList = ref([]) // 当前所有分组
// 保存分组的信息
const groupSaveData = reactive({
  show: false,
  title: '',
  principalType: null, // 类型
  type: 1, // 1新建 2移动
  groups: null, // 分组的id
  chooseIds: [],
  groupList: [] // 所有分组列表
})
// 新建分组
const groupCreateData = reactive({
  show: false,
  title: '',
  type: 1, // 1新建分组 2重命名分组
  labelName: '', // 标签的名称
  principalType: null, // 类型
  groupList: [] // 所有分组列表
})

watch(
  () => groupStatus.value,
  newValue => {
    store.commit('system/setEditBusinessEntity', newValue ? 0 : 1)
  }
)
watch(
  () => list.value,
  val => {
    if (val && val.length > 0) {
      groupCheckAllDisabled()
    }
  },
  {
    deep: true
  }
)

// 是否正在获取分组里的列表
const isLoading = computed(() => {
  return list.value.findIndex(x => x.loading) > -1
})
// 初次分组之前的选择逻辑 ----- start

const groupCheckAllDisabled = function () {
  // 如果子级列表一个都没加载出来就禁止选择
  let childrenNum = 0
  list.value.forEach(item => {
    if (item.children && item.children.length > 0) {
      childrenNum = childrenNum += item.children.length
    }
  })
  groupCheckAllDisabledStatus.value = !childrenNum
}
// 全选
function handleCheckAllChangeV2(val) {
  if (val) {
    const ids = []
    list.value.forEach(x => {
      ids.push(x.id)
      x.checked = true
    })
    chooseIdsV2.value = ids
    checkAllV2.value = true
    isIndeterminateV2.value = false
  } else {
    list.value.forEach(x => {
      x.checked = false
    })
    chooseIdsV2.value = []
    checkAllV2.value = false
    isIndeterminateV2.value = false
  }
}
// 单选
function handleCheckedChangeV2(e, item) {
  console.log('有分组前-选择部门-单选/ 取消单选 eee ', e)
  console.log('有分组前-选择部门-单选/ 取消单选 item ', item)
  if (e) {
    // 选中
    const ii = chooseIdsV2.value.findIndex(y => y === item.id)
    if (ii === -1) {
      chooseIdsV2.value.push(item.id)
      item.checked = true
    }
  } else {
    // 取消选中
    const ii = chooseIdsV2.value.findIndex(y => y === item.id)
    if (ii > -1) {
      chooseIdsV2.value.splice(ii, 1)
      item.checked = false
    }
  }

  if (chooseIdsV2.value.length === 0) {
    // 全部不选
    checkAllV2.value = false
    isIndeterminateV2.value = false
  } else if (chooseIdsV2.value.length > 0 && chooseIdsV2.value.length === list.value.length) {
    // 全部选中
    checkAllV2.value = true
    isIndeterminateV2.value = false
  } else {
    // 半选
    checkAllV2.value = true
    isIndeterminateV2.value = true
  }
}
// 初次分组之前的选择逻辑 ----- end
function initCheckStatus() {
  checkAll.value = false
  checkAllV2.value = false
  isIndeterminate.value = false
  isIndeterminateV2.value = false
  chooseIds.value = []
  chooseIdsV2.value = []
  list.value.forEach(item => {
    if (hasGroup.value) {
      if (item.children && item.children.length > 0) {
        item.children.forEach(x => {
          x.checked = false
        })
      }
    } else {
      item.checked = false
    }
  })
}
// 有分组 ------
// 打开分组
const grouping = () => {
  groupStatus.value = true
  // 默认打开未分组分组
  if (hasGroup.value) {
    list.value.forEach(async item => {
      if (!item.isGroup) {
        activeNames.value.push(item.id)
        item.loading = true
        if (!item?.children?.length) {
          const page = {
            index: 1,
            size: 10,
            total: 0
          }
          item.page = page
          const { resultList, resultTotal } = await getListInGroup(item)
          item.page.total = resultTotal
          item.children = resultList
          item.loading = false
        } else {
          item.loading = false
        }
      }
    })
  }
}
// 打开保存分组
const openSave = throttle(function () {
  console.log('打开新建分组保存', groupSaveData)
  groupSaveData.groups = null
  groupSaveData.title = '保存分组'
  groupSaveData.type = 1
  groupSaveData.principalType = info.value.principalType
  groupSaveData.groupList = groupListV2.value // 所有分组列表
  // groupSaveData.chooseIds = hasGroup.value ? chooseIds.value : chooseIdsV2.value
  groupSaveData.show = true
}, 500)
// 取消保存分组
function openSaveCancel() {
  groupSaveData.show = false
}
// 提交保存分组/提交移动至
function saveGroupSubmit(type, data, reList = false) {
  openSaveCancel()
  if (type === 2) {
    loading.value = true
    const params = {
      principalType: info.value.principalType,
      id: data.groups,
      deptIds: groupSaveData.chooseIds
    }
    console.log('数据处于的当前的分组id', groupSaveData.groups)
    console.log('数据要移动到的分组id', data.groups)
    const willUpdateListIds = [groupSaveData.groups, data.groups] // 已经展开的分组更新列表
    moveToGroup(params, willUpdateListIds, reList)
  }
  if (type === 1) {
    loading.value = true
    const params = {
      principalType: info.value.principalType,
      id: data.groups,
      deptIds: hasGroup.value ? chooseIds.value : chooseIdsV2.value
    }
    addToGroup(params)
  }
}
// 移动分组
function moveToGroup(params, willUpdateListIds = [], reList) {
  moveGroupDepts(params)
    .then(res => {
      if (res.code === 0) {
        ElMessage.success('操作成功！')
        groupSaveData.groups = null
        groupSaveData.chooseIds = null
        if (reList) {
          reset(true)
        } else {
          if (!groupSaveData.isGroup) {
            reset(true)
            groupSaveData.isGroup = null
          } else {
            if (willUpdateListIds && willUpdateListIds.length > 0) {
              list.value.forEach(async item => {
                if (willUpdateListIds.includes(item.id) && activeNames.value.includes(item.id)) {
                  console.log('将要更新子级列表的分组', item)
                  item.loading = true
                  const page = {
                    index: 1,
                    size: 10,
                    total: 0
                  }
                  item.page = page
                  const { resultList, resultTotal } = await getListInGroup(item)
                  item.children = resultList || []
                  item.page.total = resultTotal || 0
                  item.loading = false
                }
              })
              loading.value = false
            } else {
              loading.value = false
            }
          }
        }
        // 更新移入移出分组内列表
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 添加到分组
function addToGroup(params) {
  moveGroupDepts(params)
    .then(res => {
      if (res.code === 0) {
        groupStatus.value = false
        initCheckStatus()
        groupSaveData.isGroup = null
        groupSaveData.groups = null
        groupSaveData.chooseIds = null
        reset(true)
        ElMessage.success('操作成功！')
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 保存分组弹窗下点击打开新建分组
function openCreate() {
  groupCreateData.labelName = '输入分组名称'
  groupCreateData.title = '新建分组'
  groupCreateData.principalType = info.value.principalType
  groupCreateData.groupList = groupListV2.value
  groupCreateData.type = 1
  groupCreateData.item = {}
  groupCreateData.show = true
}
// 重命名分组/新建分组提交
function groupNewSubmit(data) {
  if (groupCreateData.type === 1) {
    // 新建分组 - 新建分组弹窗的提交
    createGroupSubmit(data)
  }
  if (groupCreateData.type === 2) {
    // 重命名分组
    const params = {
      principalType: info.value.principalType,
      id: groupCreateData.item?.id,
      groupName: data.name
    }
    renameGroup(params)
  }
}
// 取消新建分组
function groupNewCancel() {
  groupCreateData.show = false
}

// 新建分组
function createGroupSubmit(data) {
  const params = {
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : null,
    groupName: data.name,
    principalType: info.value.principalType
  }

  createDeptGroup(params)
    .then(res => {
      if (res.code === 0) {
        // 新建分组成功时，将已选中的数据添加到当前分组
        const saveData = {
          groups: res.data
        }
        saveGroupSubmit(groupSaveData.type, saveData, true)
      } else {
        ElMessage.error('操作失败！')
      }
    })
    .catch(() => {
      ElMessage.error('操作失败！')
    })
    .finally(() => {
      groupNewCancel()
    })
}

// 重命名分组
function renameGroup(params) {
  updateDeptGroup(params)
    .then(res => {
      if (res.code === 0) {
        groupNewCancel()
        groupCreateData.item.groupName = params.groupName
        ElMessage.success('操作成功！')
      } else {
        groupNewCancel()
      }
    })
    .catch(() => {
      groupNewCancel()
    })
}

// 移动分组
const groupChange = throttle(function (e, item) {
  console.log('打开移动分组', groupSaveData)
  groupSaveData.title = '移动至'
  groupSaveData.type = 2
  groupSaveData.principalType = info.value.principalType
  groupSaveData.groupList = groupListV2.value // 所有分组列表
  groupSaveData.chooseIds = [item.id]
  groupSaveData.groups = e.id
  groupSaveData.isGroup = e.isGroup
  groupSaveData.show = true
}, 500)

// 打开/关闭折叠面板
const beforeHandleChange = throttle(async function (item) {
  if (activeNames.value.includes(item.id)) {
    item.loading = false
    activeNames.value = activeNames.value.filter(x => x !== item.id)
  } else {
    if (isLoading.value) return
    activeNames.value.push(item.id)
    item.loading = true
    if (!item?.children?.length) {
      const page = {
        index: 1,
        size: 10,
        total: 0
      }
      item.page = page
      const { resultList, resultTotal } = await getListInGroup(item)
      item.page.total = resultTotal
      item.children = resultList
      item.loading = false
    } else {
      item.loading = false
    }
  }
}, 300)
// 获取分组内数据
function getListInGroup(item) {
  return new Promise((resolve, reject) => {
    const params = {
      departmentName: '',
      deptGroupIds: [item.id],
      grouped: item.isGroup,
      pageNumber: item.page.index,
      pageSize: item.page.size,
      principalType: info.value.principalType
    }
    getBusinessEntityByPage(params).then(res => {
      if (res.code === 0 && res.data) {
        const data = res.data[0]?.principalDataVoS || {}
        const { records: resultList = [], total: resultTotal = 0 } = data
        resolve({ resultList, resultTotal })
      }
    })
  })
}
// 取消分组
const cancelGroup = throttle(function () {
  groupStatus.value = false
  initCheckStatus()
  initSelectStatus()
}, 500)

// 选择-初始化页面显示状态
function initSelectStatus() {
  checkAll.value = false
  isIndeterminate.value = false
}
// 确定分组
function extractChildren(data) {
  const result = []

  function recurse(items) {
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        // 如果存在children，并且children不为空，则将其添加到结果中
        result.push(item.children)
        recurse(item.children) // 递归处理子项
      }
    })
  }

  recurse(data)
  return result.flat() // 扁平化结果数组
}
// 全选按钮状态
function updateCheckAllStatus(allChildren) {
  // 更新页面选中显示状态，当且列表全部包含在选中列表时就全选
  allChildren = allChildren || extractChildren(list.value)
  const allChildrenIds = allChildren.map(z => z.id)
  const checkedCount = findNum(allChildrenIds || [], chooseIds.value)
  if (checkedCount === allChildren.length) {
    // 当前加载出来的数据全都选中了
    checkAll.value = true
  } else {
    checkAll.value = false
  }
  isIndeterminate.value = checkedCount > 0 && checkedCount < allChildren.length
}
// 全选
// const handleCheckAllChange = val => {
//   const allChildren = extractChildren(list.value)
//   if (!(allChildren.length > 0 && allChildren.length === chooseIds.value.length)) {
//     list.value.forEach(x => {
//       // 父级不选
//       if (x.children && x.children.length > 0) {
//         x.children.forEach(xxx => {
//           xxx.checked = true
//           if (!chooseIds.value.includes(xxx.id)) {
//             chooseIds.value.push(xxx.id)
//           }
//         })
//       }
//     })
//   } else {
//     // 取消全选，当前已加载列表循环，如果在选中列表就删除
//     list.value.forEach(x => {
//       // 父级不选
//       if (x.children && x.children.length > 0) {
//         x.children.forEach(xxx => {
//           xxx.checked = false
//           const ii = chooseIds.value.findIndex(y => y === xxx.id)
//           if (ii > -1) {
//             chooseIds.value.splice(ii, 1)
//           }
//         })
//       }
//     })
//   }
//   updateCheckAllStatus()
// }

// 找到list1中包含多少个list2中的数据
function findNum(list1, list2) {
  return list1.filter(item => list2.includes(item)).length
}

// 单选
const handleCheckedChange = (e, item, x) => {
  if (e) {
    if (!chooseIds.value.includes(x.id)) {
      chooseIds.value.push(x.id)
      x.checked = true
    }
  } else {
    const ii = chooseIds.value.findIndex(y => y === x.id)
    if (ii > -1) {
      chooseIds.value.splice(ii, 1)
      x.checked = false
    }
  }
  updateCheckAllStatus()
}

// 获取更多子级数据
const getMore = throttle(async function (item) {
  if (item.page && item.children && item.page.total === item.children.length) return
  item.loading = true
  item.page.index++
  const { resultList } = await getListInGroup(item)
  item.children = item.children.concat(resultList)
  item.loading = false
}, 500)

// 重命名分组
const openRename = throttle(function (item) {
  if (item.loading) return
  groupCreateData.labelName = '分组名'
  groupCreateData.title = '重新命名分组'
  groupCreateData.type = 2
  groupCreateData.item = item
  groupCreateData.show = true
}, 500)

function deleteDeptGroupFn(params) {
  deleteDeptGroup(params)
    .then(res => {
      if (res.code === 0) {
        ElMessage.success('操作成功！')
        reset(true)
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 删除分组
const delGroup = throttle(function (item) {
  if (item.loading) return
  ElMessageBox.confirm(
    '删除后不可恢复，是否确认?<br/><span>注：分组中的部门不会被删除，将自动划分至未分组</span>',
    '删除分组',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: '',
      customClass: 'drawer_systemBox drawer_systemBox2',
      dangerouslyUseHTMLString: true
    }
  )
    .then(() => {
      loading.value = true
      const params = {
        brandId: localStorage.getItem('brandInfo')
          ? JSON.parse(localStorage.getItem('brandInfo')).brandId
          : null,
        ids: [item.id],
        principalType: info.value.principalType
      }
      deleteDeptGroupFn(params)
    })
    .catch(() => {
      console.log('取消删除')
    })
}, 500)
// 更新下页面分组状态
// async function searchInfoBlur() {
//   if (!searchParams.departmentName && !hasGroup.value) {
//     loading.value = true
//     reset(true)
//   }
// }
const searchInfo = () => {
  initCheckStatus()
  searchParams.pageNumber = 0
  loading.value = true
  if (!useGroupDep.value) {
    hasGroup.value = true
  }
  const getInfo = {
    getChildren: hasGroup.value ? !searchParams.departmentName : false, // 分组情况下搜索的是部门列表
    getGroup: hasGroup.value ? !searchParams.departmentName : false
  }
  getList(getInfo.getChildren, getInfo.getGroup)
}
const loadMore = () => {
  if (listLoading.value || listFinished.value) {
    return
  }
  const getInfo = {
    getChildren: false, // hasGroup.value ? !searchParams.departmentName : false
    getGroup: hasGroup.value ? !searchParams.departmentName : false
  }
  getList(getInfo.getChildren, getInfo.getGroup)
}
// 获取部门列表
function getBussList() {
  getBusinessEntityByPage(searchParams).then(res => {
    editState.value = false
    if (res.code === 0 && res.data) {
      const data = res.data[0]?.principalDataVoS || {}
      const { records: resultList = [], total: resultTotal = 0 } = data
      if (searchParams.pageNumber === 1) {
        list.value = resultList
      } else {
        list.value = list.value.concat(resultList)
      }
      listFinished.value = list.value.length >= resultTotal
      // 修改是全部才会设置total值
      // if (!searchParams.departmentName) {
      //   total.value = resultTotal
      // }
      listLoading.value = false
      loading.value = false
    }
  })
}
// 获取分组列表-用于页面显示
function getGroupFn(getChildren = false) {
  searchParams.isQueryDept = false
  getGroupList(searchParams)
    .then(res => {
      if (res.code === 0) {
        editState.value = false
        const { records: resultList, total: resultTotal } = res.data
        if (searchParams.pageNumber === 1) {
          list.value = resultList
        } else {
          list.value = list.value.concat(resultList)
        }
        listFinished.value = list.value.length >= resultTotal
        // // 修改是全部才会设置total值
        // if (!searchParams.departmentName && searchParams.pageNumber === 1) {
        //   // const hasGroupItem = resultList.find(x => x.groupDeptCount > 0) || {} // 分组内有数据才能获取到总数 24/05/19-后端准备不维护groupDeptCount字段
        //   // total.value = resultList?.length > 0 ? hasGroupItem.principalDeptNumber : 0
        //   total.value = (resultList || [])[0]?.principalDeptNumber || 0
        // }
        if (getChildren) {
          // 如果有打开的分组就更新这些分组的子级
          list.value.forEach(async x => {
            if (activeNames.value.includes(x.id)) {
              x.loading = true
              const page = {
                index: 1,
                size: 10,
                total: 0
              }
              x.page = page
              const { resultList, resultTotal } = await getListInGroup(x)
              x.page.total = resultTotal
              x.children = resultList
              x.loading = false
            }
          })
        }

        listLoading.value = false
        loading.value = false
      } else {
        listLoading.value = false
        loading.value = false
      }
    })
    .catch(() => {
      listLoading.value = false
      loading.value = false
    })
}

// 获取没有分页的分组列表，用于筛选项
function getListV2() {
  const params = {
    isQueryDept: false,
    principalType: info.value.principalType
  }
  allGroupList(params).then(res => {
    if (res.code === 0) {
      groupListV2.value = res.data // (res.data || []).filter(x => x.isGroup)
      groupCreateData.groupList = groupListV2.value
      groupSaveData.groupList = groupListV2.value
    }
  })
}

// 查询是否有分组
function principalStatusFn() {
  return new Promise(resolve => {
    principalStatus({ principalType: info.value.principalType })
      .then(res => {
        resolve(res?.code === 0 && res?.data)
      })
      .catch(() => {
        resolve(false)
      })
  })
}

const useGroupDep = ref(true)
// 获取有分页的分组列表用于页面显示
const getList = async (getChildren = false, useGroup = true) => {
  searchParams.pageNumber++
  listLoading.value = true
  const isGroup = await principalStatusFn()
  hasGroup.value = useGroup ? isGroup : false // 搜索时显示所有部门
  useGroupDep.value = JSON.parse(JSON.stringify(useGroup))
  console.log('是否有分组', hasGroup.value)
  console.log('是否是分组编辑状态', groupStatus.value)
  if (hasGroup.value) {
    getGroupFn(getChildren)
  } else {
    getBussList()
  }
  getListV2()
}
if (props.info.isOpen === 1) {
  getList()
}

// 切换当前模块的开关状态
const switchState = async key => {
  let result = null
  if (key === 'close') {
    result = await ElMessageBox.confirm(
      `确认关闭“${info.value.principalName}”这种业务主体类型？关闭后系统中将不呈现该视角的统计`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).catch(err => {
      console.log(err)
    })
  }
  // 如果已经有管理状态的 则不开启 toast 提示
  if (key === 'open' && editStateDisabled.value) {
    ElMessage.warning('请先保存管理中的主体！')
    return
  }
  // 开启 或者 已经确定关闭
  if (key === 'open' || result === 'confirm') {
    loading.value = true
    switchBusinessEntity({
      isOpen: key === 'close' ? 0 : 1,
      principalType: info.value.principalType // 主体类型
    }).then(res => {
      if (res.code === 0) {
        loading.value = false
        // 打开成功立刻显示管理
        if (key === 'open') {
          openEdit()
        } else {
          editState.value = false
          groupStatus.value = false
        }
        emits('update', false)
      }
    })
  }
}

// 业务主体重命名
const rename = reactive({
  visible: false,
  disabled: false,
  inputValue: ''
})
const switchRenameDialog = value => {
  // 关闭弹窗手动置空 表单
  if (!value && formRef.value) {
    formRef.value.resetFields()
    rename.disabled = false
  }
  rename.visible = value
  rename.inputValue = value ? info.value.principalName : ''
}
const dialogBeforeClose = done => {
  if (formRef.value) {
    formRef.value.resetFields()
    rename.disabled = false
  }
  done()
}
const renameSubmit = value => {
  principalRename({
    principalType: info.value.principalType, // 主体类型
    principalName: rename.inputValue
  }).then(res => {
    if (res.code === 0) {
      rename.visible = false
      emits('update')
    }
  })
}
function inputEmit(e) {
  // 只能输入中英文
  rename.inputValue = e.replace(/[^a-zA-Z0-9\u4E00-\u9FA5]/g, '')
  rename.disabled = !rename.inputValue
}
const formRef = ref(null)

// 验证规则
const validateReason = (rule, value, callback) => {
  if (
    props.entityList
      .filter(item => item.principalType !== info.value.principalType)
      .some(item => item.principalName === rename.inputValue)
  ) {
    rename.disabled = true
    return callback(new Error('业务主体类型名已存在'))
  }
  callback()
}
const rules = {
  inputValue: [{ required: true, validator: validateReason, trigger: 'blur' }]
}

const reset = (getChildren = false) => {
  listLoading.value = false
  listFinished.value = false
  // loading.value = false
  searchParams.pageNumber = 0
  searchParams.departmentName = ''
  getList(getChildren)
}

const updateAfter = () => {
  emits('update')
  emits('updateBrother')
}
const cancelAfter = () => {
  if (hasGroup.value) {
    reset(true)
  }
}

defineExpose({
  reset,
  info
})
</script>

<style lang="scss" scoped>
.entity_card {
  font-family: PingFangSC-Medium, PingFang SC;
  width: calc((100vw - 210px) / 3);
  height: calc(100vh - 125px);
  background-color: #ffffff;
  border-radius: 4px;
  padding: 20px 0;

  .input_wrapper {
    :deep(.el-form-item__label) {
      width: 50px !important;
      min-width: 50px !important;
    }
  }

  // 头部标题栏
  .top_title {
    display: flex;
    align-items: center;
    color: $theme_color;
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 16px;
    padding: 0 24px;

    .entity_name {
      flex: 1;
      margin-left: 6px;
      color: #303133;
      font-weight: 500;
      font-size: 16px;
    }

    .right_text {
      cursor: pointer;
      font-weight: 400;
      font-family: PingFangSC-Regular, PingFang SC;
    }

    .function_icon {
      //cursor: pointer;
      width: 20px;
      height: 20px;
      margin-left: 8px;
      background-repeat: no-repeat;
      background-size: contain;
      background-image: url('https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/7fb08c9c16b44f75a875335d03fca24e_1685586386018.png');
    }

    .function_container {
      cursor: default;
      text-align: center;

      .function_item {
        //width: 150px;
        //height: 2px;
        font-size: 14px;
        line-height: 22px;
        padding: 5px 0;
        color: #606266;
      }
    }
  }

  // 搜索内容区域
  .middle_container {
    // 下滑加载更多列表
    .scroll_wrapper {
      overflow-y: scroll;
      height: calc(100vh - 235px);
      padding: 0 22px 0;
      &::-webkit-scrollbar {
        display: none;
      }
      // 没有分组时，选择的样式
      :deep(.el-checkbox) {
        height: unset;
        background: #f7f8fa;
        margin-bottom: 8px;
        margin-right: 0;
        padding: 10px 12px;
        width: calc(100% - 24px);
        overflow: hidden;
        &:first-child {
          background: unset;
          width: max-content;
        }
        .el-checkbox__label {
          width: calc(100% - 26px);
          padding-left: 12px;
          .scroll_wrapper_item {
            padding: 0;
            margin-bottom: 0;
            height: unset;
          }
        }
        .item__title {
          @include mult_line(1);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;
        }
      }
    }

    .no_data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100vh - 235px);
    }

    // 折叠面板
    .xm_collapse_warp {
      overflow-y: scroll;
      height: calc(100vh - 235px);
      padding: 0 22px 0;
      &::-webkit-scrollbar {
        display: none;
      }
      .xm_collapse_item {
        position: relative;
        box-sizing: border-box;
        .title_warp {
          display: flex;
          align-items: center;
          height: 48px;
          cursor: pointer;
          user-select: none;
          :deep(.el-icon_arrow-down) {
            transition: transform 0.3s;
            transform: rotate(-90deg);
            font-weight: 300;
            color: inherit;
            height: 13px;
            width: 13px;
            line-height: 13px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            position: relative;
            fill: currentColor;
            color: inherit;
            font-size: inherit;
            > svg {
              height: 13px;
              width: 13px;
            }
          }
          .title {
            margin-left: 8px;
          }
          .el-dropdown {
            margin: 0 2px 0 auto;
          }
          .function_icon {
            //cursor: pointer;
            width: 20px;
            height: 20px;
            margin-left: 8px;
            background-repeat: no-repeat;
            background-size: contain;
            background-image: url('https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/7fb08c9c16b44f75a875335d03fca24e_1685586386018.png');
          }
        }
        .loading_warp {
          width: 100%;
          height: calc(100% - 48px);
          min-height: 44px;
          position: absolute;
          top: 48px;
          left: 0;
          box-sizing: border-box;
        }
        .collapse_content_warp {
          height: 0;
          will-change: height;
          overflow: hidden;
          flex-direction: column;
          display: none;
          &::-webkit-scrollbar {
            display: none;
          }
          .get_more {
            display: flex;
            align-items: center;
            justify-content: center;
            // background: #f7f8fa;
            line-height: 32px;
            cursor: pointer;
            font-size: 12px;
            color: #364fcd;
            box-sizing: border-box;
            // border-bottom: 1px solid #ccc;
          }
          .get_more_disabled {
            cursor: not-allowed;
            color: #909399;
          }
        }
      }
    }
    .xm_collapse_item_active {
      .collapse_content_warp {
        height: auto !important;
        display: flex !important;
        max-height: 320px !important;
        overflow-y: auto !important;
      }
      .el-icon_arrow-down {
        transform: rotate(0) !important;
      }
    }

    .xm_collapse_warp_group {
      height: calc(100vh - 295px);
      .collapse_content_warp {
        // :deep(.el-checkbox-group) {
        //   display: flex;
        //   flex-direction: column;
        :deep(.el-checkbox) {
          height: unset;
          background: #f7f8fa;
          margin-bottom: 8px;
          margin-right: 0;
          padding: 10px 12px;
          .el-checkbox__label {
            width: 100%;
            padding-left: 12px;
            .scroll_wrapper_item {
              padding: 0;
              margin-bottom: 0;
              height: unset;
            }
          }
        }
        // }
      }
    }
    .bottom_btn {
      position: relative;
      z-index: 10; // 解决树形结构滚动遮住 box-shadow
      height: 56px;
      background: #ffffff;
      box-shadow: 0 0 7px 0 rgba(224, 224, 224, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .middle_search_input {
    padding: 0 24px;
    margin-bottom: 12px;
  }
  .scroll_wrapper_item {
    margin-bottom: 8px;
    height: 64px;
    background-color: #f7f8fa;
    border-radius: 2px;
    display: flex;
    flex-wrap: wrap;
    padding: 10px 12px;

    .item__title {
      flex-basis: 100%;
      flex-shrink: 0;
      height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #303133;
      line-height: 20px;
      margin-bottom: 6px;
      align-items: center;
      @include mult_line(1);
      white-space: normal;
      .name {
        display: inline-block;
        max-width: calc(100% - 78px);
        @include mult_line(1);
      }
    }

    .item__info {
      display: flex;
      flex-basis: 50%;
      flex-shrink: 0;
      height: 18px;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #606266;
      line-height: 18px;
      @include mult_line(1);

      .info_label {
      }

      .info_text {
        color: $theme_color;
      }
    }
    .move_warp {
      flex: 1;
      .el-dropdown-link {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 12px;
        color: #364fcd;
        .move_icon {
          width: 16px;
          height: 16px;
          display: flex;
          object-fit: contain;
          margin-left: 2px;
        }
      }
    }
  }

  // 关闭状态 垂直水平居中
  .center_container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    // 关闭icon
    .close_icon {
      width: 120px;
      height: 120px;
      background-size: cover;
      background-repeat: no-repeat;
      background-image: url('https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/3db76f56aa6147c887c8ce864ccef562_1685603625361.png');
    }
  }
}
.middle_container_has_group {
  .item__title {
    display: flex !important;
  }
}
</style>

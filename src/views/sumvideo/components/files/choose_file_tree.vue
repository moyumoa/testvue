<template>
  <!-- 选择文件的tree -->
  <div
    :class="{
      choose_file_tree_page: true,
      file_operation: true,
      add_file_page: showDropDown,
      radio_page: showRadio
    }"
  >
    <!-- 输入框-->
    <el-input
      ref="inputRef"
      class="input_box"
      placeholder="搜索"
      type="text"
      v-model.trim="inputValue"
      @blur="getInfoByInput"
      @keyup.enter="inputEnterFun"
      @clear="clearInputFun"
      @input="inputFun"
      maxlength="10"
      clearable
    >
      <template #suffix>
        <div class="suffix_box" v-if="!inputValue" @click="getInfoByInput">
          <img
            class="suffix_img"
            src="https://tagvv-1256030678.file.myqcloud.com/20240326pimc2.png"
            alt=""
          />
        </div>
      </template>
    </el-input>
    <!-- 搜索后的展示内容 -->
    <div class="content_box" v-loading="loading">
      <div class="content_content_box">
        <!-- 名称输入为空时显示tree -->
        <el-tree
          v-if="showTree && refreshAllTree"
          ref="treeRef"
          lazy
          :load="loadNode"
          node-key="id"
          :expand-on-click-node="false"
          :props="{ label: 'name', isLeaf: 'leaf' }"
          :render-after-expand="false"
          @node-click="clickTreeFun"
          :default-expanded-keys="expandedKeys"
          :current-node-key="chooseId"
          :default-checked-keys="[chooseId]"
        >
          <template #default="{ node, data }">
            <fileSlot
              :origin="origin"
              :showDropDown="showDropDown"
              :hideFileIcon="hideFileIcon"
              :showRadio="showRadio"
              :node="node"
              :data="data"
              :fileType="fileType"
              :chooseId="chooseId"
              :rightActionId="rightActionId"
              @showRenameFun="showRenameFun"
              @showRemoveFun="showRemoveFun"
              @showDelFun="showDelFun"
              @addFileFun="addFileFun"
            />
          </template>
        </el-tree>

        <!-- 根据名称搜索显示对应的数据 -->
        <div class="search_list" ref="searchRef" v-if="!showTree">
          <template v-if="searchList && searchList.length > 0">
            <div
              class="search_box"
              :infinite-scroll-delay="500"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="searchList.length >= searchParam.total"
            >
              <div
                class="one_search"
                :style="chooseId == item.id ? 'background:#f2f2f2' : ''"
                v-for="item in searchList"
                :key="item.id"
                @click="clickSearchFun(item)"
              >
                <fileSlot
                  :origin="origin"
                  :showDropDown="showDropDown"
                  :hideFileIcon="hideFileIcon"
                  :showRadio="showRadio"
                  :node="{
                    label: item.name
                  }"
                  :data="item"
                  :fileType="fileType"
                  :chooseId="chooseId"
                  :rightActionId="rightActionId"
                  @showRenameFun="showRenameFun"
                  @showRemoveFun="showRemoveFun"
                  @showDelFun="showDelFun"
                  @addFileFun="addFileFun"
                />
              </div>
              <div class="xm_pullUpToLoadMore">
                <img
                  src="/public/loading.gif"
                  v-if="loading && searchParam.pageNumber > 1"
                  alt=""
                />
                {{
                  loading
                    ? searchParam.pageNumber === 1
                      ? ''
                      : '加载中...'
                    : searchList.length >= searchParam.total
                    ? searchList.length > 10
                      ? '已经到底了~'
                      : ''
                    : '上拉加载更多~'
                }}
              </div>
            </div>
          </template>
          <div
            class="xm_noneData"
            style="height: 300px"
            v-if="!(searchList && searchList.length > 0) && !loading && !showTree"
          >
            暂无数据
          </div>
        </div>
      </div>
    </div>

    <!-- 重命名的弹窗 -->
    <renameDOM
      v-if="renameDialog.show"
      :origin="origin"
      :fileType="fileType"
      :renameDialog="renameDialog"
      @renameSuccessFun="renameSuccessFun"
    />
    <!-- 移动到的弹窗 -->
    <removeDOM
      v-if="removeDialog.show"
      :origin="origin"
      :fileType="fileType"
      :removeDialog="removeDialog"
      @removeSuccessFun="removeSuccessFun"
    />
  </div>
</template>
<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  listTagFolder,
  listCreationTagFolder,
  updateTagFolder,
  updateCreationTagFolder,
  queryTagFolder,
  queryCreationTagFolder
} from '@/api/sumvideo/files.js'
import renameDOM from './file_rename_dialog.vue'
import removeDOM from './file_remove_dialog.vue'
import fileSlot from './file_slot.vue'
import { isEmpty, isNotEmpty, throttle } from '@/utils/tools.js'

const props = defineProps({
  origin: {
    type: String,
    default: '' // material 原料库 finishProduct 素材库 productScene 商品场景 productShoot 实拍图
  },
  rootTitle: {
    type: String,
    default: ''
  }, // 默认的根文件名称
  chooseId: {
    type: String || Number,
    default: null
  }, // 选中的Id信息
  expandIds: {
    type: Array,
    default: () => {
      return []
    }
  }, // 要展开的文件夹id列表 移动文件夹时，需要展开当前所属的文件夹
  showRadio: {
    type: Boolean,
    default: false
  }, // 是否显示单选框
  showDropDown: {
    type: Boolean,
    default: false
  }, // 是否显示下拉框[右侧操作区]
  hideFileIcon: {
    type: Boolean,
    default: false
  }, // 是否隐藏文件夹ICON
  fileType: Number // 文件夹类型 3原料库 4实拍库 5场景库
})
const { origin, showRadio, showDropDown, hideFileIcon, fileType } = toRefs(props)
const showTree = ref(true) // 是否显示tree
const treeRef = ref()
const refreshAllTree = ref(true) // 刷新整个树
const choosePid = ref() // 选中的父级ID
const chooseId = ref() // 选中的文件夹id
const chooseInfo = ref() // 选中的文件夹完整信息
const inputValue = ref('') // 输入框输入的内容
const searchRef = ref()
const loading = ref(true) // 数据的请求Loading
const searchList = ref([]) // 搜索后的列表
const searchParam = reactive({
  pageNumber: 1,
  pageSize: 20,
  total: 0
}) // 分页查询数据
const expandedKeys = ref(['0']) // 默认展开的id

function init() {
  console.log('init', props.chooseId, isNotEmpty(props.chooseId))
  if (isNotEmpty(props.chooseId)) {
    if (showDropDown.value) {
      setCurrentFun(props.chooseId)
    } else if (showRadio.value) {
      chooseId.value = props.chooseId
      setCurrentFun(props.chooseId)
      // 目前不支持
      expandedKeys.value = props.expandIds && props.expandIds.length > 0 ? props.expandIds : ['0']
    } else {
      chooseId.value = props.chooseId
    }
  } else {
    if (showDropDown.value) {
      setCurrentFun('0')
    }
  }
}

onMounted(() => {
  init()
})
// 完整的刷新一下整个树
function changeRefreshAllTree(id) {
  refreshAllTree.value = false
  nextTick(() => {
    refreshAllTree.value = true
  })
}
// 根据输入内容去查询
function getInfoByInput(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  inputValue.value = inputValue.value.replace(reg, '')
  searchParam.pageNumber = 1
  if (isEmpty(inputValue.value)) {
    clearInputFun()
  } else {
    showTree.value = false
    resetSearchList()
  }
}
const inputRef = ref()
// 输入框回车的时候失去焦点触发请求
function inputEnterFun(e) {
  e.target.blur()
}
// 当输入框内容为空时需要清空数据去查询
function inputFun(e) {
  if (isEmpty(e)) {
    inputRef.value.blur()
  }
}
// 清空数据
function clearInputFun() {
  console.log('ch', chooseId.value, chooseId.value !== '0')
  if (chooseId.value !== '0' && showDropDown.value) {
    chooseId.value = '0'
  }
  showTree.value = true
  inputValue.value = ''
  searchList.value = []
  changeRefreshAllTree()
}
function resetSearchList() {
  loading.value = true
  searchParam.pageNumber = 1
  getSearchList()
}
function getSearchList() {
  loading.value = true
  const param = {
    name: inputValue.value,
    pageNo: searchParam.pageNumber,
    pageSize: searchParam.pageSize
  }
  if (isNotEmpty(fileType.value)) {
    param.tagType = fileType.value
  }
  const listPromise = isNotEmpty(fileType.value)
    ? queryTagFolder(param)
    : origin.value === 'material'
    ? queryTagFolder(param)
    : queryCreationTagFolder(param)
  listPromise
    .then(res => {
      if (res.code === 0) {
        if (searchParam.pageNumber === 1) {
          // 第一次请求 ，要让滚动条回到顶部
          searchRef.value?.scrollTo(0, 0)
          searchList.value = res.data.records || []
          searchParam.total = res.data.total
        } else {
          const newListData = res.data.records || []
          searchList.value = searchList.value.concat(newListData)
        }
      } else {
        if (searchParam.pageNumber === 1) {
          searchList.value = []
        }
      }
      loading.value = false
    })
    .catch(() => {})
}
// 上拉加载更多的多选框列表
function loadFun() {
  loading.value = true
  searchParam.pageNumber++
  getSearchList()
}
// 一次加载树形结构
function loadNode(node, resolve) {
  const { level, data } = node
  if (level === 0) {
    // 第一级
    const list = [
      {
        id: '0',
        level: 0,
        name:
          origin.value === 'productShoot'
            ? '实拍图'
            : origin.value === 'productScene'
            ? '场景图'
            : origin.value === 'material'
            ? '原料库'
            : '素材库',
        leaf: false // 是否到底了
      }
    ]
    loading.value = false
    resolve(list)
    if (showDropDown.value) {
      nextTick(() => {
        setCurrentFun('0')
      })
    }
  } else {
    const param = {
      id: level === 0 ? null : data.id
    }
    if (isNotEmpty(fileType.value)) {
      param.tagType = fileType.value
    }
    const folderPromise = isNotEmpty(fileType.value)
      ? listTagFolder(param)
      : origin.value === 'material'
      ? listTagFolder(param)
      : listCreationTagFolder(param)
    folderPromise
      .then(res => {
        if (res.code === 0) {
          const list = res.data || []
          list.forEach(x => {
            x.leaf = !x.hasChildren
          })
          resolve(list)
        }
        loading.value = false
      })
      .catch(() => {
        resolve([])
        loading.value = false
      })
      .finally(() => {
        nextTick(() => {
          setCurrentFun(chooseId.value || '0')
        })
      })
  }
}
// 选中的id 树
const clickTreeFun = (e, node, TreeNode, eventData) => {
  chooseId.value = e.id
  choosePid.value = e.pid
  chooseInfo.value = node.data
}
// 选中的id 列表
const clickSearchFun = throttle(e => {
  chooseId.value = e.id
  choosePid.value = e.pid
  chooseInfo.value = e
}, 300)

const rightActionId = ref('0') // 右侧显示操作区的ID

// 重命名
const renameDialog = ref({
  show: false
})
function showRenameFun(node, data) {
  renameDialog.value = {
    isAdd: false,
    name: data.name,
    pid: data.pid,
    id: data.id,
    show: true
  }
}
function setCurrentFun(id) {
  if (chooseId.value !== id) {
    chooseId.value = id
  }
  if (showTree.value) {
    treeRef.value?.setCurrentKey(id)
  }
}

// 更新树   id 要更新的ID refreshR 是否更新所有并展开某一级
async function refreshTreeNode(id, refreshR) {
  const node = treeRef.value?.getNode(id)
  if (refreshR) {
    changeRefreshAllTree(chooseId.value || '0')
  } else {
    if (node) {
      node.loaded = false
      node.expand()
    }
  }
}

// 重命名成功 新增的话 需要刷新当前文件夹的父级，并展开当前文件夹，因为不刷新父级，就无法获取当前文件夹最新的子集数量
function renameSuccessFun(pid, ppid) {
  loading.value = true
  // 重命名成功 如果当前选中的文件夹ID和重命名的文件夹ID一致，就刷新原料/素材列表
  if (!renameDialog.value.isAdd && chooseId.value === renameDialog.value.id) {
    emits('updateId', chooseId.value, chooseInfo.value)
  }
  if (showTree.value) {
    refreshTreeNode(pid)
  } else {
    if (!renameDialog.value.isAdd) {
      resetSearchList()
    } else {
      loading.value = false
    }
  }
}
// 移动到
const removeDialog = reactive({
  show: false
})
function showRemoveFun(node, data) {
  // rightActionId.value = data.id
  console.log('')
  removeDialog.expandIds = []
  removeDialog.fileId = data.id
  removeDialog.parentId = data.pid || '0'
  removeDialog.onlyRemoveFile = true
  removeDialog.show = true
}
// 移动成功  刷新整体
function removeSuccessFun(pid, info, oldPid) {
  loading.value = true
  if (showTree.value) {
    refreshTreeNode(pid, true)
  } else {
    loading.value = false
  }
}
// 删除  刷新整体并展开删除的父级文件夹
function showDelFun(node, data) {
  // rightActionId.value = data.id
  ElMessageBox.alert(
    `<div>确定删除“${
      data.name || '文件夹名'
    }”吗？<br/>注：删除后所有子文件夹也将被删除，但不会删除文件夹中的${
      origin.value === 'productShoot'
        ? '实拍图'
        : origin.value === 'productScene'
        ? '场景图'
        : origin.value === 'material'
        ? '原料'
        : '素材'
    }</div>`,
    {
      showCancelButton: true,
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'drawer_systemBox drawer_systemBox2'
    }
  )
    .then(() => {
      loading.value = true
      // 调接口
      const param = {
        id: data.id || '0',
        operateWay: 1
      }
      if (isNotEmpty(fileType.value)) {
        param.tagType = fileType.value
      }
      const addPromise = isNotEmpty(fileType.value)
        ? updateTagFolder(param)
        : origin.value === 'material'
        ? updateTagFolder(param)
        : updateCreationTagFolder(param)
      addPromise
        .then(res => {
          if (res.code === 0) {
            if (showTree.value) {
              // 如果删除的文件夹ID和当前选中的一样 那就默认选中到根文件夹下
              if (chooseId.value === data.id) {
                chooseId.value = '0'
              }
              refreshTreeNode(data.pid)
            } else {
              resetSearchList()
            }
            ElMessage({
              type: 'success',
              message: '删除成功'
            })
          }
          loading.value = false
        })
        .catch(() => {
          loading.value = false
        })
    })
    .catch(() => {})
}
// 新增文件夹
const addFileFun = (node, data) => {
  // 文件夹最多5级 文件夹数量上限100
  renameDialog.value = {
    isAdd: true,
    ppid: data.pid || '0',
    pid: data.id || '0',
    show: true
  }
}

const emits = defineEmits(['updateId'])
watch(
  () => chooseId.value,
  val => {
    console.log('watch', chooseId.value, chooseInfo.value)
    emits('updateId', chooseId.value, chooseInfo.value)
  },
  {
    deep: true
  }
)
// 刷新树
function refreshFun() {
  if (showTree.value) {
    changeRefreshAllTree()
  } else {
    resetSearchList()
  }
}
defineExpose({
  refreshFun
})
</script>
<style lang="scss" scoped>
@import '../scss/file.scss';
.choose_file_tree_page {
  .content_box {
    margin-top: 12px;
    width: 100%;
    min-height: 100px;
    height: calc(100% - 84px);
  }
  .content_content_box {
    width: 100%;
    min-height: 100px;
    padding-right: 12px;
    overflow-y: auto;
    max-height: 400px;
    .el-tree {
      background: transparent;
    }
    .search_box {
      .one_search {
        padding-left: 12px;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: 36px;
        border-radius: 4px;
        &:hover {
          background: #f6f8fa;
        }
        :deep(.one_file) {
          width: 100%;
        }
      }
      .one_search + .one_search {
        margin-top: 2px;
      }
    }
  }
}
.add_file_page {
  width: 100%;
  height: 100%;
  padding: 16px 0 0px 16px;
  background: #ffffff;
  border-radius: 4px;
  .content_box {
    margin-top: 12px;
    height: calc(100% - 44px);
    padding-right: 12px;
    .content_content_box {
      overflow-x: hidden;
      max-height: calc(100% - 16px) !important;
    }
    :deep(.one_file) {
      .one_left {
        width: 100%;
      }
      .one_right {
        opacity: 0;
      }
      &:hover {
        .one_left {
          width: calc(100% - 48px) !important;
        }
        .one_left_left {
          width: calc(100% - 68px) !important;
        }
        .one_right {
          opacity: 1;
        }
      }
    }
  }
}
:deep(.el-message-box__message) {
  p {
    white-space: pre-line;
    word-break: break-all;
  }
}
.radio_page {
  .content_box {
    .content_content_box {
      max-height: 440px !important;
    }
  }
}
:deep(.el-tree) {
  --el-tree-node-hover-bg-color: transparent;
}
</style>

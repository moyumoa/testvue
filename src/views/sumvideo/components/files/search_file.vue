<template>
  <div class="search_file">
    <el-select
      ref="selectRef"
      :clearable="props.clearable"
      :model-value="$data.treeSelect.name"
      :placeholder="placeholder"
      style="width: 100%"
      @change="selectChange"
    >
      <template #empty>
        <div class="tree_warp">
          <el-tree
            ref="treeRef"
            node-key="id"
            lazy
            :expand-on-click-node="false"
            :render-after-expand="false"
            :props="{
              label: 'name',
              isLeaf: 'leaf'
            }"
            :load="loadNode"
            :default-checked-keys="chooseFullIds"
            @node-click="clickTreeFun"
          >
            <template #default="{ node, data }">
              <fileSlot
                :showRadio="true"
                :node="node"
                :data="data"
                :showDropDown="true"
                :onlyShowAdd="true"
                :chooseId="$data.treeSelect.id"
                :origin="
                  failType === 'productSceneFolder'
                    ? 'productScene'
                    : failType === 'listTagFolder'
                    ? 'material'
                    : failType === 'listCreationTagFolder'
                    ? 'finishProduct'
                    : ''
                "
                :fileType="fileType"
                @addFileFun="addFileFun"
              />
            </template>
          </el-tree>
        </div>
      </template>
    </el-select>
    <!-- 重命名的弹窗 -->
    <renameDOM
      v-if="renameDialog.show"
      :origin="
        failType === 'productSceneFolder'
          ? 'productScene'
          : failType === 'listTagFolder'
          ? 'material'
          : failType === 'listCreationTagFolder'
          ? 'finishProduct'
          : ''
      "
      :fileType="fileType"
      :renameDialog="renameDialog"
      @renameSuccessFun="renameSuccessFun"
    />
  </div>
</template>

<script setup>
import { listTagFolder, listCreationTagFolder } from '@/api/sumvideo/files.js'
import { isNotEmpty } from '@/utils/tools'

import renameDOM from '../../components/files/file_rename_dialog.vue'

import fileSlot from './file_slot.vue'
const props = defineProps({
  placeholder: {
    type: String,
    default: '请选择文件夹'
  },
  failType: {
    type: String,
    default: 'listTagFolder' // listTagFolder原料 listCreationTagFolder素材 productSceneFolder商品场景图
  },
  fileID: {
    type: Object,
    default: () => {
      return {} // 回显选中文件夹
    }
  },
  selectRoot: {
    type: Boolean,
    default: false // 是否默认选中根文件夹
  },
  clearable: {
    type: Boolean,
    default: true // 是否可以清除筛选项
  },
  fileType: Number // 文件夹类型 3原料库 4实拍库 5场景库
  // isSearchSelf: {
  //   type: Boolean,
  //   default: null
  // }, // 是否只加载某个父部门下的子部门
  // isSearchSelfById: {
  //   type: String || Number,
  //   default: null
  // }, // 要加载哪个父部门下的子部门
  // isUsePermission: {
  //   type: Boolean,
  //   default: false
  // } // 是否受数据权限控制
})
// const { isSearchSelf, isSearchSelfById, isUsePermission, placeholder } = toRefs(props)
const { placeholder, failType, selectRoot, fileType } = toRefs(props)

const emits = defineEmits(['select', 'fileChange']) // fileChange 文件夹内容进行了修改
const chooseFullIds = ref([]) // 选中的数组全路径Id列表
const treeLoading = ref(false) // tree加载loading
const newTreeDataId = ref(null)
const $data = reactive({
  treeSelect: {} // 选择的节点（文件夹）
})
const selectRef = ref(null)
const renameDialog = ref({
  show: false
})
const treeRef = ref(null)
// 如果选择了就清掉
function selectChange() {
  $data.treeSelect = {}
  emits('select', $data.treeSelect)
}

// 通过懒加载方式加载树形结构数据
function loadNode(node, resolve) {
  const { level, data } = node
  if (level === 0) {
    // 第一级
    const list = [
      {
        id: '0',
        name:
          failType.value === 'productSceneFolder'
            ? '场景图'
            : failType.value === 'listTagFolder'
            ? '原料库'
            : '素材库',
        leaf: false, // 是否到底了
        level: 0
      }
    ]
    treeLoading.value = false
    if (selectRoot.value) {
      clickTreeFun(list[0])
    }
    resolve(list)
  } else {
    const param = {
      id: level === 0 ? null : data.id
    }
    if (isNotEmpty(fileType.value)) {
      param.tagType = fileType.value
    }
    const queryPromise = isNotEmpty(fileType.value)
      ? listTagFolder(param)
      : failType.value === 'listTagFolder'
      ? listTagFolder(param)
      : listCreationTagFolder(param)

    queryPromise
      .then(res => {
        if (res.code === 0) {
          // loading.value = false
          const list = res.data || []
          list.forEach(x => {
            x.leaf = !x.hasChildren
          })
          if (newTreeDataId.value) {
            // 找到这个数据
            const selectData = list.find(x => x.id === newTreeDataId.value)
            clickTreeFun(selectData)
          }
          // 设置选中
          resolve(list)
        } else {
          treeLoading.value = false
        }
      })
      .catch(() => {
        resolve([])
        treeLoading.value = false
      })
  }
}
// 选择节点
function clickTreeFun(data) {
  if (isNotEmpty(data)) {
    $data.treeSelect = data
    emits('select', data)
    nextTick(() => {
      selectRef.value && selectRef.value.blur()
    })
  }
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
function renameSuccessFun(pid, ppid) {
  emits('fileChange')
  const node = treeRef.value?.getNode(pid)
  if (node) {
    node.loaded = false
    node.expand()
    newTreeDataId.value = ppid
  }
}

watch(
  () => props.fileID,
  val => {
    if (isNotEmpty(val)) {
      $data.treeSelect = val
    } else {
      $data.treeSelect = {}
    }
  },
  { deep: true }
)
// 不知道以前为什么不在watch fileid 里加immediate: true 设计地方多 所以改成onMounted
onMounted(() => {
  if (!props.selectRoot && isNotEmpty(props.fileID)) {
    $data.treeSelect = JSON.parse(JSON.stringify(props.fileID))
  }
})
</script>

<style lang="scss" scoped>
.tree_warp {
  min-height: 64px;
  max-height: 324px;
  overflow: auto;
  .tree_node {
    display: flex;
    align-items: center;
    .icon {
      min-width: 16px;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      border-radius: 50%;
    }
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: #f0f4ff;
  }
  :deep(.el-tree-node__content) {
    height: 36px;
  }
  :deep(.one_file) {
    .one_left {
      width: 100%;
    }
    .one_right {
      opacity: 0;
    }
    .one_right2 {
      min-width: 16px;
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
</style>

<template>
  <el-dialog
    width="960px"
    v-model="showDialog"
    destroy-on-close
    title="选择部门"
    @closed="close"
    ref="dialog"
    custom-class="choose_department_dialog"
  >
    <div class="dialog_content" v-loading="$data.loading">
      <div class="department_wrapper">
        <div class="choose_block">
          <div class="block_title">组织结构</div>
          <div class="cascader_wrapper" v-if="treeData && treeData.length">
            <panel-item :list="treeData" @change="onChange"></panel-item>
          </div>
        </div>
        <div class="result_block">
          <div class="block_title">
            已勾选组织结构
            <div class="clear_all" @click="clearALl">全部清除</div>
          </div>
          <div class="checked_list">
            <div class="checked_item" v-for="(item, index) in $data.checkedList" :key="index">
              <span class="name">{{ item.name }}</span>
              <div class="close" @click="deleteDep(item, index)">
                <el-icon color="#f56c6c" size="20">
                  <i-close-bold />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="confirm">确认</el-button>
      <!-- <async_button type="primary" :asyncFunc="confirm">确认</async_button> -->
    </template>
  </el-dialog>
</template>

<script setup>
import panelItem from './panel_item.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
const props = defineProps({
  showDialog: Boolean,
  treeData: Array
})
const { showDialog } = toRefs(props)
const treeData = ref([])

// const message = inject('$message')
const emits = defineEmits(['update:showDialog', 'choose'])

const $data = reactive({
  loading: false,
  checkOrgIds: [],
  checkedList: []
})

// 获取选中的节点
function getAllNode() {
  const nodes = []
  const getNode = function (list) {
    list.forEach(item => {
      if (item.checked && item.id) {
        nodes.push(item)
      }
      if (item.children && item.children.length) {
        getNode(item.children)
      }
    })
  }
  getNode(treeData.value)
  return nodes
}

// 取消节点选择
function removeNode(id) {
  const getNode = function (list) {
    list.forEach(item => {
      if (item.id === id || item.name === '全部' || id === 'all') {
        item.checked = 0
      }
      if (item.children && item.children.length) {
        getNode(item.children)
      }
    })
  }
  getNode(treeData.value)
}

function onChange() {
  const nodes = getAllNode()
  $data.checkedList = nodes
  $data.checkOrgIds = nodes.map(e => e.id)
}

const dialog = ref()
function close() {
  emits('update:showDialog', false)
  dialog.value.handleClose()
}

// 删除
function deleteDep(item, index) {
  $data.checkOrgIds = $data.checkOrgIds.filter(e => {
    if (item.id === e) {
      $data.checkedList.splice(index, 1)
      removeNode(item.id)
    }
    return item.id !== e
  })
}

function clearALl() {
  if (!$data.checkedList.length) {
    ElMessage({ type: 'warning', message: '未选择部门' })
    return
  }
  ElMessageBox.confirm('是否清除所有已选部门?', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    removeNode('all')
    $data.checkedList = []
    $data.checkOrgIds = []
  })
}

function confirm() {
  if (!$data.checkOrgIds || !$data.checkOrgIds.length) {
    ElMessage({ type: 'warning', message: '请选择部门' })
    return
  }
  emits('choose', $data.checkOrgIds, treeData.value)
}

defineExpose({ onChange })

onMounted(() => {
  if (props.treeData && props.treeData.length > 0) {
    treeData.value = JSON.parse(JSON.stringify(props.treeData))
  }
  onChange()
})
</script>

<style lang="scss" scoped>
.dialog_content {
  .department_wrapper {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    display: flex;
    .block_title {
      position: relative;
      font-size: 16px;
      line-height: 42px;
      padding-left: 12px;
      border-bottom: 1px solid #e4e7ed;
      .clear_all {
        cursor: pointer;
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        font-size: 14px;
        color: #364fcd;
      }
    }
    .choose_block {
      flex: 1;
      overflow-x: auto;
      border-right: 1px solid #e4e7ed;
      .cascader_wrapper {
        width: 100%;
        overflow-x: auto;
      }
    }
    .result_block {
      width: 285px;
      flex-shrink: 0;
      .checked_list {
        overflow-y: auto;
        height: 388px;
        padding: 8px 12px;
        .checked_item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          margin-bottom: 4px;
          line-height: 36px;
          background-color: #eff3fd;
          border-radius: 4px;
          .name {
            @include mult_line(1);
          }
          .close {
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>

<style>
.choose_department_dialog .el-dialog__body {
  padding: 0 !important;
}
</style>

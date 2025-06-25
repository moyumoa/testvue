<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="choose_part_dialog "
    destroy-on-close
    v-model="show"
    title="请选择部门"
    width="828px"
  >
    <div class="dialog_content">
      <div class="dialog_left">
        <el-input
          class="search_input"
          v-model.trim="partInput"
          clearable
          placeholder="请输入部门名"
          @change="filterText"
          @clear="getPartList"
        />
        <div class="left_content">
          <div style="min-height: 100%" v-loading="loading">
            <el-tree
              ref="departTree"
              :data="orgData"
              show-checkbox
              node-key="id"
              :default-checked-keys="chooseKeys"
              :expand-on-click-node="false"
              check-on-click-node
              :props="{
                label: 'name'
              }"
              @check-change="onCheckChange"
              :check-strictly="true"
            >
              <template #default="{ node }">
                <span class="tree_node line-hidden1">
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/20220111qk48z.png"
                    class="tree_icon"
                  />
                  <span :title="node.label" class="line-hidden1">{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>
      </div>
      <div class="dialog_right">
        <div class="right_top">
          <div>
            已选：
            <span>{{ chooseNode.length }}</span>
            个部门
          </div>
          <el-link type="primary" @click="clearNode">清空</el-link>
        </div>
        <div class="right_content">
          <div class="one_content" v-for="(item, index) in chooseNode" :key="item.id">
            <div class="right_left">
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20220111qk48z.png"
                class="tree_icon"
              />
              <div class="right_left_content">
                <div class="right_name1">{{ getLastName(item.name) }}</div>
                <div :title="getParentName(item.id)" class="right_name2 line-hidden1">
                  {{ getParentName(item.id) }}
                </div>
              </div>
            </div>
            <div class="right_right" @click="cancelNode(item, index)">
              <el-icon><i-close /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { getSectionTree, dept } from '@/api/system_setting/section'

import { throttle } from '@/utils/tools.js'
const props = defineProps({
  updateDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        checkNode: []
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.updateDialog, 'show')
const chooseNode = ref([])
const chooseKeys = ref([])
const loading = ref(false)
const btnLoading = ref(false)
function init() {
  if (props.updateDialog.checkNode && props.updateDialog.checkNode.length > 0) {
    chooseNode.value = JSON.parse(JSON.stringify(props.updateDialog.checkNode))
    chooseKeys.value = chooseNode.value.map(x => x.id)
  } else {
    chooseNode.value = []
    chooseKeys.value = []
  }
}
init()
const message = inject('$message')
const emits = defineEmits(['updatePart'])
const handleConfirm = throttle(() => {
  btnLoading.value = true
  if (chooseNode.value && chooseNode.value.length > 0) {
    emits('updatePart', chooseNode.value)
    dialog.value.handleClose()
    btnLoading.value = false
  } else {
    message.warning('一定要选择一个部门哦')
    btnLoading.value = false
  }
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
const departTree = ref(null)
let oldOrg = [] // 第一次加载时获取到的全部数据
const orgData = ref([]) // 显示的tree数据
const partInput = ref('')
// 获取全部组织结构树
function getPartList() {
  loading.value = true
  getSectionTree()
    .then(res => {
      if (res.code === 0) {
        if (oldOrg.length === 0) {
          oldOrg = res.data || []
        }
        orgData.value = res.data || []
      }
    })
    .finally(x => {
      nextTick(() => {
        loading.value = false
      })
    })
}
// 筛选部门
const filterText = () => {
  loading.value = true
  if (partInput.value) {
    dept({
      name: partInput.value,
      pageNumber: 1,
      pageSize: 999
    })
      .then(res => {
        if (res.code === 0) {
          orgData.value = changeData(res.data.records || [])
        }
      })
      .finally(x => {
        nextTick(() => {
          loading.value = false
        })
      })
  } else {
    getPartList()
  }
}
// 对数据进行重命名
function changeData(data) {
  data.forEach(x => {
    x.id = x.departmentId
  })
  return data
}
getPartList()
// 根据id，获取他的父级名字
function getParentName(id) {
  const list = getParentsIds(oldOrg, id)
  let name = ''
  if (list && list.length > 0) {
    // if (list.length > 1) {
    list.shift()
    // }
    name = list.reverse().join('/')
  }

  return name
}
function getLastName(name) {
  if (name) {
    const list = name.split('/')
    return list[list.length - 1]
  } else {
    return ''
  }
}
function getParentsIds(data, id) {
  // 根据id值匹配
  for (const i in data) {
    if (data[i].id === parseInt(id)) {
      return [data[i].name]
    }
    if (data[i].children) {
      const result = getParentsIds(data[i].children, id)
      if (result !== undefined) {
        return result.concat(data[i].name)
      }
    }
  }
}
// 树的点击事件
function onCheckChange(data, check) {
  console.log(check, data)
  // 选中
  if (check) {
    chooseNode.value.push(data)
    chooseKeys.value.push(data.id)
  } else {
    // 未选中
    const index = chooseKeys.value.indexOf(data.id)
    if (index > -1) {
      chooseNode.value.splice(index, 1)
      chooseKeys.value.splice(index, 1)
    }
  }
}
// 取消选中
const cancelNode = throttle((e, index) => {
  departTree.value.setChecked(e.id, false)
  chooseNode.value.splice(index, 1)
  chooseKeys.value.splice(index, 1)
}, 500)
// 清除选中
const clearNode = throttle(() => {
  departTree.value.setCheckedKeys([], false)

  chooseNode.value = []
  chooseKeys.value = []
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align: flex-start;
  .dialog_left {
    border-right: 1px solid #dcdfe6;
    flex: 1;
    max-width: 50%;
    padding: 24px 24px 0;
    height: 409px;
    .left_content {
      padding-top: 10px;
      height: calc(100% - 32px);
      overflow-y: auto;
      .tree_node {
        display: flex;
        align-items: center;
        .tree_icon {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          margin-right: 8px;
        }
        > span {
          color: #323233;
          font-size: 13px;
        }
      }
    }
  }
  .dialog_right {
    flex: 1;
    max-width: 50%;
    padding: 24px 24px 0;
    height: 409px;
    .right_top {
      padding-right: 8px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align: center;

      font-size: 14px;
      font-weight: 500;
      color: #333333;
      line-height: 20px;
      margin-bottom: 4px;
      span {
        color: #364fcd;
      }
    }
    .right_content {
      width: 100%;
      height: calc(100% - 32px);
      overflow-y: auto;
      .one_content {
        margin-top: 12px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .right_left {
          width: 80%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .tree_icon {
            width: 26px;
            height: 26px;
            margin-right: 8px;
          }
          .right_left_content {
            width: calc(100% - 25px);
            .right_name1 {
              font-size: 14px;
              font-weight: 400;
              color: #323233;
              line-height: 20px;
            }
            .right_name2 {
              margin-top: 2px;
              font-size: 12px;
              font-weight: 400;
              color: #909399;
              line-height: 20px;
            }
          }
        }
        .right_right {
          padding-right: 8px;
          width: 20%;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
          cursor: pointer;

          font-size: 20px;
          color: #909399;
          &:hover {
            color: #f85151;
          }
        }
      }
    }
  }
}
</style>

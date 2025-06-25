<template>
  <!-- 微信组织架构的组件 包含了展示 和 部门的增删改弹窗 -->
  <div>
    <el-tree
      class="mt_16"
      ref="treeWx"
      lazy
      :load="loadNode"
      node-key="parentIds"
      :expand-on-click-node="false"
      :props="{ label: 'name', isLeaf: 'leaf' }"
      :render-after-expand="false"
      @node-click="clickTreeFun"
      :default-expanded-keys="expandedKeys"
    >
      <template #default="{ node, data }">
        <div class="tree_node wx_tree_node">
          <div class="node_text">
            <!-- @click.prevent="onNodeClick(data)" -->
            <div class="node_icon">
              <i class="icon iconfont icon-jiagou"></i>
            </div>
            <div
              class="node_label"
              :style="data.isOpen === 1 && data.type !== 1 ? 'max-width:calc(100% - 46px)' : ''"
            >
              {{ node.label }}
            </div>
            <i
              class="icon iconfont icon-dianpu"
              v-if="data.isOpen === 1 && data.type !== 1"
              :style="{ color: principalColor(data.type) }"
            ></i>
          </div>
          <div class="wx_tree_btn" v-if="department && department.id == data.id">
            <div class="add_btn" @click.stop="showAddEditFun('add', data, node)">
              <i class="iconfont icon-tianjia"></i>
            </div>
            <!-- 根部门不能编辑和删除  trigger="click"-->
            <el-dropdown v-if="data.id != 0" @click.stop="noneFun">
              <div class="more_btn">
                <i class="iconfont icon-gengduo"></i>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click.prevent="showAddEditFun('edit', data, node)">
                    编辑部门
                  </el-dropdown-item>
                  <el-dropdown-item @click.prevent="showDelFun(data, node)">
                    删除部门
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
    </el-tree>
    <!-- 新建/编辑部门 -->
    <el-dialog
      :close-on-click-modal="false"
      destroy-on-close
      :title="addEditDialog.isAdd ? '新建部门' : '编辑部门'"
      width="420px"
      @close="addEditDialog.show = false"
      v-model="addEditDialog.show"
      custom-class="xm_element_dialog addEditPart_dialog"
    >
      <el-form
        :model="addEditDialog.form"
        :rules="addEditDialog.rules"
        ref="ruleForm"
        label-width="100px"
        label-position="top"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input
            style="width: 388px"
            @blur="retEmit($event)"
            v-model.trim="addEditDialog.form.name"
            maxlength="20"
            show-word-limit=""
            placeholder="请输入部门名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属部门" prop="parentIds">
          <choose_dept_search
            ref="chooseDeptSearchRef"
            @updateDeptIds="onChangeDepartment"
            :multiple="false"
            :isUsePermission="false"
            :defaultValue="addEditDialog.chooseParentInfo"
            searchLabel="所属部门"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="addEditDialog.saveLoading" @click="handleConfirm">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 删除部门 -->
    <el-dialog
      :close-on-click-modal="false"
      destroy-on-close
      title="删除部门"
      width="420px"
      @close="delDialog.show = false"
      v-model="delDialog.show"
      custom-class="xm_element_dialog delPart_dialog"
    >
      <div class="delpart_content" v-if="delDialog.type === 1">部门删除后不可恢复，是否继续？</div>
      <!-- 部门有成员 -->
      <div class="delpart_content" v-if="delDialog.type === 2">
        请先移出部门内所有人员再进行删除部门操作
      </div>
      <!-- 部门有子部门 -->
      <div class="delpart_content" v-if="delDialog.type === 3">
        请先删除所有子部门再进行删除部门操作
      </div>
      <template #footer>
        <span class="dialog-footer">
          <template v-if="delDialog.type === 1">
            <el-button @click="closeDelDialog">取消</el-button>
            <el-button type="danger" :loading="delDialog.saveLoading" @click="handleDelConfirm">
              删除
            </el-button>
          </template>
          <el-button v-else type="primary" @click="closeDelDialog">好的</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { createDept, deleteDeptRelation } from '@/api/system_setting/framework.js'
import { isNotEmpty, throttle } from '@/utils/tools.js'
const props = defineProps({
  department: {
    type: Object,
    default: () => {}
  }
})
console.log('department', props.department)
const treeWx = ref()
const expandedKeys = ref([]) // 微信架构下要展开的部门ID
const emits = defineEmits(['onNodeClick', 'loadNode', 'refreshTreeNode'])
function loadNode(node, resolve) {
  emits('loadNode', node, resolve)
}
function clickTreeFun(data) {
  console.log('单个点击', data)
  emits('onNodeClick', data)
}
//  新建/编辑部门
const addEditDialog = reactive({
  show: false,
  isAdd: false,
  form: {
    id: null,
    name: '',
    parentIds: []
  },
  rules: {
    name: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      {
        min: 1,
        max: 20,
        message: '请输入部门名称,最多20个字符',
        trigger: 'blur'
      }
    ],
    parentIds: [{ required: true, message: '请选择部门', trigger: 'change' }]
  },
  saveLoading: false,
  chooseParentInfo: [] // 选中的父ID集合
})
// 显示新增/编辑部门的弹窗
const showAddEditFun = throttle((type, data, node) => {
  const xxx = data.parentIds.indexOf(';') > -1 ? data.parentIds.split(';')[0] : data.parentIds
  const yyy = data.fullPath.indexOf(';') > -1 ? data.fullPath.split(';')[0] : data.fullPath
  const parentIds = xxx.split('/').map(x => {
    return parseInt(x)
  })
  const parentNames = yyy.split('/')
  if (type !== 'add') {
    parentIds.pop()
    parentNames.pop()
  }
  addEditDialog.form = {
    id: type === 'add' ? null : data.id,
    name: type === 'add' ? '' : data.name,
    parentIds: parentIds && parentIds.length > 0 ? [parentIds[parentIds.length - 1]] : null
  }
  addEditDialog.isAdd = type === 'add'
  addEditDialog.show = true
  addEditDialog.saveLoading = false
  if (parentIds && parentIds.length > 0) {
    addEditDialog.oldParentIds = parentIds.join('/')
    addEditDialog.chooseParentInfo = [
      {
        fullIds: parentIds,
        fullPath: parentNames.join('/'),
        label: parentNames[parentNames.length - 1],
        value: parentIds[parentIds.length - 1]
      }
    ]
  }
}, 500)
// 检查文案
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  console.log(e.target.value.replace(reg, ''))
  addEditDialog.form.name = e.target.value.replace(reg, '')
}
const ruleForm = ref(null)
function onChangeDepartment(e) {
  addEditDialog.form.parentIds = isNotEmpty(e) ? [e] : []
  ruleForm.value.validateField('parentIds')
}
function setExpandedKey(id) {
  expandedKeys.value = [id]
}
defineExpose({
  setExpandedKey
})
const $message = inject('$message')
const chooseDeptSearchRef = ref(null)
// 新增/编辑部门弹窗的确定事件
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      addEditDialog.saveLoading = true
      const param = {
        name: addEditDialog.form.name,
        parentIds: addEditDialog.form.parentIds
      }
      if (!addEditDialog.isAdd) {
        param.id = addEditDialog.form.id
      }

      createDept(param)
        .then(res => {
          if (res.code === 0) {
            $message.success(addEditDialog.isAdd ? '新建部门成功' : '编辑部门成功')
            const fullParentId = chooseDeptSearchRef.value?.getMoreInfo()[0].fullIds.join('/')

            emits('refreshTreeNode', fullParentId, true, true)
            //  编辑的时候，会存在原始父部门和新父部门，如果两个父部门不一样，那就都进行更新
            if (!addEditDialog.isAdd && fullParentId !== addEditDialog.oldParentIds) {
              nextTick(() => {
                emits('refreshTreeNode', addEditDialog.oldParentIds, true)
              })
            }
          }
          addEditDialog.saveLoading = false
          addEditDialog.show = false
        })
        .catch(() => {
          addEditDialog.saveLoading = false
          addEditDialog.show = false
        })
    }
  })
}, 700)
// 新增/编辑部门弹窗的取消事件
function closeDialog() {
  addEditDialog.show = false
}
// 删除部门的弹窗
const delDialog = reactive({
  show: false,
  type: null,
  departmentId: null,
  parentDepartmentId: null,
  fullParentDepartmentId: null, // 父部门的完整路径 因为会存在多个父部门有同一个子部门的情况
  saveLoading: false
})
function noneFun() {}
// 显示删除部门的弹窗
const showDelFun = throttle((data, node) => {
  console.log(data, node)
  deleteDeptRelation({
    isCheck: 1,
    departmentId: data.id,
    parentDepartmentId: node?.parent?.data?.id
  })
    .then(res => {
      if (res.code === 0) {
        delDialog.type = 1
        delDialog.departmentId = data.id
        delDialog.parentDepartmentId = node.parent.data.id
        delDialog.fullParentDepartmentId = node.parent.data.parentIds
        delDialog.show = true
        delDialog.saveLoading = false
      }
    })
    .catch(err => {
      console.log('err', err)
      if (err) {
        if (err.code === 30001 || err.code === 30002) {
          delDialog.type = err.code === 30001 ? 2 : 3
          delDialog.departmentId = null
          delDialog.parentDepartmentId = null
          delDialog.fullParentDepartmentId = null
          delDialog.show = true
          delDialog.saveLoading = false
        } else {
          $message.error(err.msg)
        }
      }
    })
}, 500)
const handleDelConfirm = throttle(() => {
  delDialog.saveLoading = true
  deleteDeptRelation({
    isCheck: 0,
    departmentId: delDialog.departmentId,
    parentDepartmentId: delDialog.parentDepartmentId
  })
    .then(res => {
      if (res.code === 0) {
        $message.success('删除成功')
        delDialog.show = false
        emits('refreshTreeNode', delDialog.fullParentDepartmentId, true, true)
      }
      delDialog.saveLoading = false
    })
    .catch(err => {
      if (err && err.msg) {
        $message.error(err.msg)
      }
      delDialog.saveLoading = false
    })
}, 700)
function closeDelDialog() {
  delDialog.show = false
}
const principalColor = type => {
  const obj = {
    2: '#3B81F3',
    3: '#F99C41',
    4: '#48B42D'
  }
  return obj[type + ''] || obj['1']
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.tree_node {
  display: flex;
  line-height: 26px;
  align-items: center;
  justify-content: flex-start;
  // width: 100%;
  width: calc(100% - 24px);
  .node_text {
    display: flex;
    align-items: center;
    // width: calc(100% - 62px);
    height: 36px;
    overflow: hidden;
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
    .node_label {
      max-width: calc(100% - 26px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .node_empty {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .icon-dianpu {
      margin-left: 4px;
      //font-size: 20px;
      //line-height: 26px;
      //color: $theme_color;
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
// 微信组织架构下 可以编辑部门
.wx_tree_btn {
  padding-left: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding-right: 7px;
  .add_btn {
    width: 22px;
    height: 36px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: rgb(147, 147, 147);
    // .add_icon {
    //   width: 20px;
    //   height: 20px;
    //   object-fit: cover;
    // }
    &:hover {
      color: #364fcd;
    }
  }
  .more_btn {
    width: 22px;
    height: 36px;
    margin-left: 2px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    color: rgb(147, 147, 147);
    font-size: 14px;
    &:hover {
      color: #364fcd;
    }
    // .more_icon {
    //   width: 20px;
    //   height: 20px;
    //   object-fit: cover;
    // }
  }
}

:deep(.addEditPart_dialog) {
  .el-form-item__label {
    position: relative;
    line-height: 20px;
  }
  .el-form-item.is-required:not(.is-no-asterisk)
    > .el-form-item__label-wrap
    > .el-form-item__label:before,
  .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
    position: absolute;
    left: 61px;
    top: 4px;
  }
  .el-form-item {
    margin-bottom: 16px;
  }
}
.delpart_content {
  font-size: 14px;
  padding-bottom: 37px;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
}
// :deep(.el-tree-node__content:hover){
//   background-color: rgba(0, 0, 0, 0);
// }

:deep(.input_box) {
  width: 100% !important;
}
:deep(.input_box .input_choose .one_choose) {
  max-width: 180px !important;
}
</style>

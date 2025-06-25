<template>
  <el-dialog
    ref="dialog"
    v-model="show"
    :title="title"
    width="800px"
    custom-class="section_choice_dialog hide_footer_line"
  >
    <div class="header_search">
      <el-input
        class="search_input"
        v-model="sectionInput"
        placeholder="请输入部门名称"
        style="width: 360px"
        @keyup.enter="filterText"
        clearable
        @clear="getList"
      >
        <template #suffix>
          <el-icon class="el-input__icon" style="cursor: pointer" @click="filterText">
            <i-search />
          </el-icon>
        </template>
      </el-input>
    </div>
    <div class="section_choice">
      <div class="section_tree" v-loading="treeLoading">
        <el-tree
          ref="tree"
          class="mt_16"
          :data="leftTree"
          show-checkbox
          node-key="idx"
          :filter-node-method="filterNode"
          :props="{ label: 'name' }"
          :check-strictly="true"
          :auto-expand-parent="true"
          @check-change="checkChange"
        >
          <!-- @check="checkChange" -->
          <!-- :check-strictly="true" -->
          <!-- :ref="el => (tree = el)" -->
          <!-- :default-checked-keys="frameworkData.ids" -->
          <template #default="{ node }">
            <div class="tree_node">
              <div class="node_icon">
                <i class="icon iconfont icon-jiagou"></i>
              </div>
              <div>{{ node.label }}</div>
            </div>
          </template>
        </el-tree>
      </div>
      <!-- <div class="check_section">
        <div class="check_list">
          <div class="check_item" v-for="(item, index) in showNodePath" :key="index">
            <el-radio v-model="currentStaff" :label="item">
              <div class="g_acc_info">
                <span>{{ item.parentNamePathList + '' }}</span>
              </div>
            </el-radio>
          </div>
        </div>
      </div>-->
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
/**
 * 部门选择弹窗组件
 */
import { getSectionTree, dept } from '@/api/system_setting/section'

export default {
  name: 'section-choice',
  props: {
    /**
     * 弹窗信息
     * @param {boolean} show visible model
     * @param {Object} data 选择的data
     */
    frameworkData: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: '',
          data: null,
          ids: '',
          chooseList: [] // 选中的详细信息列表
        }
      },
      required: true
    }
  },
  emits: ['setResult', 'close'],
  setup(props) {
    const treeLoading = ref(false)
    const show = toRef(props.frameworkData, 'show')
    const title = toRef(props.frameworkData, 'title')
    const checkIds = ref([])
    const checkInfos = ref([]) // 选中的详细信息列表
    if (props.frameworkData.ids && props.frameworkData.ids.length > 0) {
      const info = JSON.parse(JSON.stringify(props.frameworkData))
      checkIds.value = info.ids
      checkInfos.value = info.chooseList
    }
    const message = inject('$message')
    const leftTree = ref([])
    const flattenLeftTree = ref([]) // 扁平化leftTree
    const staffList = ref([])
    const currentStaff = ref(null)
    // // 树节点增加路径展示字段
    function setTreePath(isChild = false, tree, parent = null) {
      for (const item of tree) {
        // 已选中的项 子级全部禁选
        // if (props.frameworkData.ids.includes(item.id) && item.children) {
        //   setTreeDisabled(item.children, true)
        // }
        item.path = isChild ? item.label : `${parent.path}/${item.label}`
        if (item.children && item.children.length > 0) {
          setTreePath(false, item.children, item)
        }
      }
    }

    const tree = ref(null)
    const rightData = ref([])
    const checkChange = (data, checked) => {
      console.log('checkChange', data, checked)
      // const flag = !!checked
      // const filterNode = flattenLeftTree.value.filter(item => {
      //   return item.id === data.id
      // })
      // nextTick(() => {
      //   filterNode.forEach(item => {
      //     // console.log('item', item)
      //     tree.value.setChecked(item, flag)
      //   })
      // })
      // 如果选中 就往checkIds里加
      const index = checkIds.value.indexOf(data.id)
      if (checked) {
        if (index === -1) {
          checkIds.value.push(data.id)
          checkInfos.value.push(data)
        }
      } else {
        if (index > -1) {
          checkIds.value.splice(index, 1)
          checkInfos.value.splice(index, 1)
        }
      }
      // const checkedList = tree.value.getCheckedKeys()
      // const isChecked = checkedList.includes(checkedNodes.id)
      // if (checkedNodes.id === 0) {
      //   if (checkedList.indexOf(checkedNodes.id) > -1) {
      //     tree.value.setCheckedKeys([checkedNodes.id])
      //   } else {
      //     tree.value.setCheckedKeys([])
      //   }
      // }
      // // setTreeDisabled(checkedNodes.children, isChecked)
      // rightData.value = tree.value.getCheckedNodes()
    }

    const num = ref(0)
    // 扁平化
    function flatData(arr) {
      const newArr = []
      for (let i = 0; i < arr.length; i++) {
        arr[i].idx = num.value++
        if (arr[i].children) {
          newArr.push(...flatData(arr[i].children))
        }
        newArr.push({ ...arr[i] })
      }
      return newArr
    }

    /**
     * @description 设置子级为disabled
     * @param {Array} data - 父级children
     * @param {Array} parentIschecked - 顶层父级是否选中
     */
    // function setTreeDisabled(data, parentIschecked) {
    //   // for (const item of data) {
    //   //   item.children.length > 0 && setTreeDisabled(item.children, parentIschecked)
    //   //   item.disabled = parentIschecked
    //   //   // 禁止选择同时清除选中状态
    //   //   if (item.disabled) {
    //   //     const checkedList = tree.value.getCheckedKeys()
    //   //     checkedList.forEach((e, i) => {
    //   //       if (e === item.id) {
    //   //         checkedList.splice(i, 1)
    //   //       }
    //   //     })
    //   //     if (checkedList.length) {
    //   //       tree.value.setCheckedKeys(checkedList)
    //   //     }
    //   //   }
    //   // }
    // }
    const showNodePath = computed(() => {
      // return rightData.value.filter(item => item.children.length === 0)
    })
    // 搜索
    const sectionInput = ref('')
    const filterText = () => {
      if (sectionInput.value) {
        dept({
          name: sectionInput.value,
          pageNumber: 1,
          pageSize: 999
        }).then(res => {
          leftTree.value = res.data.records.map(item => {
            return (item = {
              ...item,
              id: item.departmentId
            })
          })
          flattenLeftTree.value = flatData(leftTree.value)
          nextTick(() => {
            flattenLeftTree.value.forEach(ev => {
              checkIds.value.forEach(item => {
                if (item === ev.id) tree.value.setChecked(ev, true)
              })
            })
          })
        })
      } else {
        getList()
      }
    }
    function onClear() {
      getSectionTree().then(res => {
        leftTree.value = res.data.map(item => {
          return (item = {
            ...item,
            id: item.departmentId
          })
        })
        flattenLeftTree.value = flatData(leftTree.value)
        nextTick(() => {
          flattenLeftTree.value.forEach(ev => {
            checkIds.value.forEach(item => {
              if (item === ev.id) tree.value.setChecked(ev, true)
            })
          })
        })
      })
    }

    function getList() {
      treeLoading.value = true
      getSectionTree()
        .then(res => {
          leftTree.value = res.data
          flattenLeftTree.value = flatData(leftTree.value)
          setTreePath(true, res.data)
          // 回显选中
          nextTick(() => {
            console.log('选中', checkIds.value)
            // tree.value.setCheckedNodes(checkIds.value)
            flattenLeftTree.value.forEach(ev => {
              checkIds.value.forEach(item => {
                if (item === ev.id) tree.value.setChecked(ev, true)
              })
            })
          })
        })
        .finally(() => {
          treeLoading.value = false
        })
    }

    onMounted(() => {
      getList()
    })

    return {
      getList,
      checkIds,
      checkInfos,
      flatData,
      flattenLeftTree,

      treeLoading,
      show,
      title,
      message,
      sectionInput,
      leftTree,
      checkChange,
      staffList,
      currentStaff,
      filterText,
      onClear,
      tree,
      showNodePath,
      rightData,
      setTreePath
    }
  },
  methods: {
    closeDialog() {
      this.$refs.dialog.handleClose()
    },
    // tree筛选
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 去重
    unique(arr, key = 'id') {
      const res = new Map()
      return arr.filter(arr => !res.has(arr[key]) && res.set(arr[key], 1))
    },

    handleConfirm() {
      // this.$emit('setResult', this.rightData)tree.value.getCheckedNodes()
      // const selectList = this.unique(this.$refs.tree.getCheckedNodes(), 'id')
      // console.log('selectList', selectList)
      this.$emit('setResult', this.checkInfos)
      this.closeDialog()
    }
  }
}
</script>

<style lang="scss">
.section_choice_dialog {
  .el-dialog__body {
    padding: 0;
    height: 409px;
    border-bottom: 1px solid #dcdfe6;
  }
  .el-checkbox__inner {
    width: 16px;
    height: 16px;
    &::after {
      height: 9px;
      left: 5px;
    }
  }
  .el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
    top: 6px;
  }
}
.header_search {
  display: flex;
  align-items: center;
  .search_input {
    width: 350px;
    margin: 16px 24px;
  }
  p {
    font-weight: 500;
    color: #909399;
    margin: 0 60px 0 170px;
    span {
      color: #333333;
    }
  }
  > span {
    color: #364fcd;
    cursor: pointer;
  }
}

.section_choice {
  width: 100%;
  height: calc(100% - 64px);
  display: flex;
  border-top: 1px solid #dcdfe6;
  border-bottom: none;
  .section_tree,
  .check_section {
    padding: 4px 12px 18px 24px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }
  .section_tree {
    border-right: 1px solid #dcdfe6;
    .tree_node {
      display: flex;
      line-height: 26px;
      align-items: center;
    }
  }
  .box {
    display: flex;
    overflow-y: auto;
    height: 350px;
    .left_a {
      display: flex;
      flex-direction: column;
      .left_container {
        margin-bottom: 16px;
        .user_head {
          width: 40px;
          height: 40px;
          border: 1px solid #f7f7f7;
          border-radius: 100%;
          vertical-align: middle;
          margin-right: 6px;
        }
      }
    }
    .originazeContent {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 325px;
      > div:nth-child(2):hover {
        color: red;
        cursor: pointer;
      }
      .top {
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #323233;
        line-height: 20px;
      }
      .bottom {
        margin-top: 2px;
        height: 20px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
    }
  }
  .box2 {
    height: 350px;
    display: block;
    overflow-y: auto;
    .box2_content {
      display: flex;
      margin-bottom: 12px;
    }
  }
  .check_section {
    color: #333;
    .check_head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .check_list {
      margin-top: 16px;
      .check_item {
        height: 44px;
        line-height: 44px;
        padding: 4px 0;
        display: flex;
        align-items: center;
        &:hover {
          background: #eff3fd;
        }
        &:last-child {
          margin-bottom: 12px;
        }
        .el-radio {
          width: 100%;
          .el-radio__label {
            padding-left: 8px;
          }
        }
      }
    }
  }
}
.node_icon {
  width: 26px;
  height: 26px;
  margin-right: 8px;
  background: #364fcd;
  opacity: 0.6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
</style>

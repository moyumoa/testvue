<template>
  <el-dialog
    ref="dialog"
    v-model="show"
    title="绑定员工"
    width="800px"
    custom-class="section_choice_dialog hide_footer_line"
  >
    <el-input
      class="search_input"
      v-model="sectionInput"
      clearable
      :placeholder="searchPhone ? '请输入员工姓名或手机号' : '请输入员工姓名'"
      @keyup.enter="filterText(false)"
    />
    <div class="section_choice">
      <div class="section_tree">
        <el-tree
          class="mt_16"
          :data="leftTree"
          ref="tree"
          node-key="id"
          :filter-node-method="filterNode"
          :props="{ label: 'name' }"
          @node-click="filterText"
        >
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
      <div class="check_section">
        <div class="check_list" v-loading="loading">
          <div class="check_item" v-for="(item, index) in staffList" :key="index">
            <el-radio v-model="currentStaff" :label="item.userId">
              <div class="g_acc_info">
                <img
                  v-if="item.photo"
                  :src="item.photo"
                  alt=""
                  style="width: 36px; height: 36px; margin-right: 12px"
                />
                <template v-else>
                  <default-photo
                    class="default_photo"
                    type="selfBuilt"
                    v-if="architectureMode == 4"
                    :name="item.name"
                  />
                  <img v-else src="@/assets/images/content_center/default_user.png" />
                </template>
                <span>{{ item.name }}</span>
              </div>
            </el-radio>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="currentStaff === null">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
/**
 * 部门选择弹窗组件
 */
import { getSectionTree } from '@/api/system_setting/section'
import { deptStaffPage } from '@/api/system_setting/account'

import DefaultPhoto from '@/views/system/components/default_photo/index.vue'
export default {
  name: 'section-choice',
  components: { DefaultPhoto },
  props: {
    /**
     * 弹窗信息
     * @param {boolean} show visible model
     * @param {Object} data 选择的data
     */
    showModal: {
      type: Object,
      default: () => {
        return {
          show: false,
          searchPhone: false, // 是否支持手机号搜索
          data: null
        }
      },
      required: true
    }
  },
  emits: ['setResult', 'close'],
  setup(props) {
    const show = toRef(props.showModal, 'show')
    const searchPhone = toRef(props.showModal, 'searchPhone')
    const message = inject('$message')
    const leftTree = ref([])
    const staffList = ref([])
    const currentStaff = ref(null)
    const loading = ref(false)
    setTreePath(true, leftTree.value)
    // 树节点增加路径展示字段
    function setTreePath(isChild = false, tree, parent = null) {
      for (const item of tree) {
        item.path = isChild ? item.label : `${parent.path}/${item.label}`
        if (item.children && item.children.length > 0) {
          setTreePath(false, item.children, item)
        }
      }
    }

    const filterText = e => {
      loading.value = true
      deptStaffPage({
        pageNumber: 1,
        pageSize: 999,
        departmentId: e ? e.id : null,
        staffName: sectionInput.value,
        searchPhone: searchPhone.value ? 2 : 1
      }).then(res => {
        loading.value = false
        staffList.value = res.data.records
      })
    }
    const sectionInput = ref('')
    return {
      loading,
      show,
      searchPhone,
      message,
      sectionInput,
      leftTree,
      staffList,
      currentStaff,
      filterText
    }
  },
  computed: {
    architectureMode() {
      return localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo')).architectureMode
        : null
    }
  },
  methods: {
    getList() {
      getSectionTree().then(res => {
        this.leftTree = res.data
      })
    },
    closeDialog() {
      this.$refs.dialog.handleClose()
    },
    // tree筛选
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },

    handleConfirm() {
      const result = this.staffList.filter(item => this.currentStaff === item.userId)[0]
      this.$emit('setResult', result)
      this.closeDialog()
    }
  },
  mounted() {
    this.getList()
  }
}
</script>

<style lang="scss">
.section_choice_dialog {
  .el-dialog__body {
    padding: 0;
    height: 409px;
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
.search_input {
  width: 350px;
  margin: 16px 24px;
}
.section_choice {
  width: 100%;
  height: calc(100% - 64px);
  display: flex;
  border-top: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  .section_tree,
  .check_section {
    padding: 4px 12px 18px 24px;
    width: 50%;
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
      min-height: 300px;
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
.g_acc_info {
  :deep(.default_photo) {
    width: 36px;
    height: 36px;
    margin-right: 12px;
    border-radius: 50%;
    font-size: 12px;
  }
}
</style>

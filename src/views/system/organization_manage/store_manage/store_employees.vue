<template>
  <el-dialog ref="dialog" v-model="show" title="员工管理" width="720px">
    <xm_search style="padding: 0" :searchComponents="searchComponents" />
    <div class="choice_employees">
      <div class="left">
        <xm_table
          class="pic_table"
          :showSelection="true"
          :data="leftTableState.data"
          v-model:page="leftTableState.page"
          @getTableData="getLeftList"
        >
          <el-table-column label="员工信息" prop="name">
            <template #default="scope">
              <div class="table_photo">
                <img :src="scope.row.photo" alt="" />
                <div>{{ scope.row.name }}</div>
              </div>
            </template>
          </el-table-column>
        </xm_table>
      </div>
      <div class="center">
        <div>
          <el-button>{{ '加入门店 >>' }}</el-button>
        </div>
        <div class="mt_16">
          <el-button>{{ '<< 移出门店' }}</el-button>
        </div>
      </div>
      <div class="right">
        <xm_table
          class="pic_table"
          :showSelection="true"
          :data="rightTableState.data"
          v-model:page="rightTableState.page"
          @getTableData="getRightList"
        >
          <el-table-column label="员工信息" prop="name">
            <template #default="scope">
              <div class="table_photo">
                <img :src="scope.row.photo" alt="" />
                <div>{{ scope.row.name }}</div>
              </div>
            </template>
          </el-table-column>
        </xm_table>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    editModal: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: '',
          row: null
        }
      },
      required: true
    }
  },
  emits: ['getTableData'],
  setup(props, { emit }) {
    const choiceList = ref([])
    init()
    function init() {
      choiceList.value = JSON.parse(JSON.stringify(props.editModal.row)) // 数量量少的直接使用这个转
    }
    const show = toRef(props.editModal, 'show')
    const message = inject('$message')
    const searchComponents = ref([
      {
        type: 'input',
        label: '员工手机',
        val: '',
        filed: 'username'
      }
    ])
    // 未加入门店员工
    const leftTableState = reactive({
      data: [
        {
          num: '800012314',
          name: '雷鑫',
          photo: 'https://p3.douyinpic.com/aweme/100x100/241ce0003adea87b15704.jpeg?from=4010531038'
        }
      ],
      page: {
        index: 1,
        size: 10,
        total: 10
      }
    })
    // 已加入门店员工
    const rightTableState = reactive({
      data: [
        {
          num: '800012314',
          name: '陶桑桑',
          photo: 'https://p3.douyinpic.com/aweme/100x100/241ce0003adea87b15704.jpeg?from=4010531038'
        }
      ],
      page: {
        index: 1,
        size: 10,
        total: 10
      }
    })
    return {
      choiceList,
      show,
      message,
      searchComponents,
      leftTableState,
      rightTableState
    }
  },
  methods: {
    closeDialog() {
      this.$refs.dialog.handleClose()
    },
    handleConfirm() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.props.row) {
            this.addForm()
          } else {
            this.updateForm()
          }
        }
      })
    },
    getLeftList() {},
    getRightList() {}
  }
}
</script>

<style lang="scss" scoped>
.table_photo {
  display: flex;
  align-items: center;
  img {
    width: 52px;
    height: 52px;
    margin-right: 4px;
    border-radius: 50%;
  }
}
.choice_employees {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  .center {
    margin: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}
</style>

<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    width="820px"
    custom-class="addTaskToLevelDialog"
  >
    <template #title>
      <div class="dialog_title">
        <div class="title_box">
          选择要添加到成长等级中的任务
          <el-button class="refresh_btn" @click="refreshTask">刷新</el-button>
        </div>
        <div>
          <el-link type="primary" @click="createTask">前往创建成长任务</el-link>
        </div>
      </div>
    </template>
    <div class="dialog_content">
      <xm_search
        :searchComponents="$data.searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
      />
      <xm_table
        showSelection
        ref="multipleTableRef"
        max-height="400"
        v-loading="$data.tableForm.loading"
        :data="$data.tableForm.listData"
        v-model:page="$data.tableForm.page"
        @getTableData="getList"
        @selection-change="handleSelectionChange"
        :select="$data.selectList"
        :checkSelectable="checkSelectable"
        rowKey="taskId"
        :maxTableHeight="400"
      >
        <el-table-column
          prop="taskName"
          label="任务名称"
          width="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="任务类型" width="120">
          <template #default="{ row }">
            {{
              GROWTH_TASK_TYPE.getCN(row.taskType)
                ? GROWTH_TASK_TYPE.getCN(row.taskType).label + '任务'
                : '--'
            }}
          </template>
        </el-table-column>
        <el-table-column label="是否已添加" width="100">
          <template #default="{ row }">
            <div>{{ row.isValid ? '是' : '否' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="任务指标" min-width="160">
          <template #default="{ row }">
            <template v-if="row.taskTarget">
              <div class="detail_target" v-for="(x, y) in row.taskTarget.split(',')" :key="y">
                {{ x }}
              </div>
            </template>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="任务奖励" min-width="120">
          <template #default="{ row }">
            {{ row.taskReward ? (row.taskReward === '0金币' ? '--' : row.taskReward) : '--' }}
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <template #footer>
      <div class="dialog_footer">
        <div class="footer_left">
          已选
          <span>{{ $data.selectList.length }}</span>
          个任务，将添加到Level {{ level }}成长等级中
        </div>
        <div class="footer_right">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="$data.saveLoading" @click="handleConfirm">
            保存
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { getQuery } from '@/utils/get_query.js'
import { GROWTH_TASK_TYPE } from '@/utils/dictionary/task'
import { throttle } from '@/utils/tools.js'
import { growthTasks } from '@/api/market/growth_system.js'
const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const show = toRef(props.addDialog, 'show')
const level = toRef(props.addDialog, 'level')
const $data = reactive({
  saveLoading: false,
  searchComponents: [
    {
      type: 'input',
      label: '任务名称',
      val: '',
      placeholder: '请输入任务名称',
      filed: 'taskName'
    },
    {
      type: 'select',
      label: '任务类型',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择任务类型',
      filed: 'taskType',
      selects: [
        {
          value: -1,
          label: '全部'
        },
        {
          label: '视频任务',
          value: 1
        },
        {
          label: '直播任务',
          value: 2
        },
        {
          label: '学习任务',
          value: 5
        }
      ]
    },
    {
      type: 'select',
      label: '是否已添加',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择是否已添加',
      filed: 'isValid',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '否',
          value: 0
        },
        {
          label: '是',
          value: 1
        }
      ]
    }
  ],
  tableForm: {
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  },
  selectList: [], // 当前选中的数据
  oldSelect: [] // 原始选中的数据
})
const dialog = ref()

function getList() {
  const data = getQuery($data.searchComponents)
  data.pageNo = $data.tableForm.page.index
  data.pageSize = $data.tableForm.page.size
  console.log(data)
  growthTasks(data)
    .then(res => {
      if (res.code === 0) {
        $data.tableForm.listData = res.data.records || []
        $data.tableForm.page.total = res.data.total || 0
      } else {
        if ($data.tableForm.page.index === 1) {
          $data.tableForm.listData = []
        }
      }
      $data.tableForm.loading = false
    })
    .catch(() => {
      $data.tableForm.loading = false
    })
}
const multipleTableRef = ref(null)
// 重置
function resetSearch() {
  console.log('table', multipleTableRef)

  $data.tableForm.loading = true
  $data.tableForm.page.index = 1
  $data.tableForm.page.size = 10
  getList()
}
// 查询
function searchList() {
  $data.tableForm.loading = true
  $data.tableForm.page.index = 1
  getList()
}
// 刷新任务
const refreshTask = throttle(() => {
  multipleTableRef.value.$refs.table.clearSelection()
  searchList()
  nextTick(() => {
    choose()
  })
}, 700)
function init() {
  resetSearch()
  if (props.addDialog.oldSelect && props.addDialog.oldSelect.length > 0) {
    const list = JSON.parse(JSON.stringify(props.addDialog.oldSelect))
    $data.oldSelect = list
  } else {
    $data.oldSelect = []
  }
  nextTick(() => {
    choose()
  })
}
init()
// 设置选中
function choose() {
  $data.oldSelect.forEach(y => {
    multipleTableRef.value.$refs.table.toggleRowSelection(y, true)
  })
}
function unique(arr) {
  const res = new Map()
  return arr.filter(arr => !res.has(arr.taskId) && res.set(arr.taskId, 1))
}
// 表格的选择
function handleSelectionChange(e) {
  console.log('e', e)
  $data.selectList = unique(e)
}
const emits = defineEmits(['chooseTask'])

const message = inject('$message')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  $data.saveLoading = true
  console.log($data.selectList)
  if ($data.selectList && $data.selectList.length > 0) {
    emits('chooseTask', $data.selectList)
    $data.saveLoading = false
    dialog.value.handleClose()
  } else {
    $data.saveLoading = false

    message({ type: 'warning', message: '请先选择要添加到成长等级中的任务' })
  }
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}

// 创建任务
const createTask = throttle(() => {
  window.open(`${location.origin}/content_market/growth_setting?type=growthTask`, '_blank')
}, 700)

// 设置是否可选择
function checkSelectable(row, index) {
  return !row.isValid || (row.isValid && row.level && parseInt(row.level) === level.value)
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.dialog_title {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding: 18px 58px 18px 16px;
  .title_box {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #323233;
    line-height: 24px;
    .refresh_btn {
      width: 58px;
      height: 24px;
      border-radius: 2px;
      border: 1px solid #dcdee0;
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      color: #323233;
      line-height: 24px;
      margin-left: 12px;
      min-height: 24px;
      padding: 0;
    }
  }
}

.dialog_content {
  padding: 16px;
  :deep(.xm_search) {
    padding: 0;
    margin: 4px 0 8px;
  }
}
.dialog_footer {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px 0;
  height: 64px;
  // border-top: 1px solid #dcdfe6;
  .footer_left {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    span {
      color: #364fcd;
    }
  }
}
</style>

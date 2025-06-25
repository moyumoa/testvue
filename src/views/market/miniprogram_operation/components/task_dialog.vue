<template>
  <div class="task-dialog">
    <el-dialog v-model="isShowDialog" width="900px" title="选择任务">
      <div class="dialog-content">
        <xm_search
          v-if="hasSearch"
          :searchComponents="searchComponents"
          useOwnReset
          @reset="searchList"
          @getData="searchList"
        ></xm_search>
        <div class="task-list">
          <xm_table
            class="task-table"
            v-loading="loading"
            :data="list"
            highlight-current-row
            :maxTableHeight="'500px'"
            v-model:page="page"
            :pageSizes="[5, 10, 20]"
            @getTableData="getList"
            @current-change="handleCurrentChange"
          >
            <el-table-column label="任务标题" min-width="180">
              <template v-slot="{ row }">{{ row.name || '--' }}</template>
            </el-table-column>
            <el-table-column label="任务时间" min-width="200">
              <template v-slot="{ row }">
                <div v-if="row.startTime">
                  {{ row.startTime.slice(0, 10) }}&nbsp;至&nbsp;{{ row.endTime.slice(0, 10) }}
                </div>
                <div v-else>--</div>
              </template>
            </el-table-column>
            <el-table-column label="创建人" min-width="100">
              <template v-slot="{ row }">{{ row.taskCreateUserName || '--' }}</template>
            </el-table-column>
            <el-table-column label="状态">
              <template v-slot="{ row }">
                <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
                  <div style="display: flex; align-items: center">
                    <span
                      style="
                        font-size: 5px;
                        margin-right: 4px;
                        display: inline-block;
                        width: 4px;
                        height: 4px;
                        border-radius: 50%;
                      "
                      :class="{
                        'status-0': row.status === 0,
                        'status-1': row.status === 1 || row.status === 5,
                        'status-2': row.status === 3 || row.status === 7,
                        'status-3': row.status === 4,
                        'status-4': row.status === 2 || row.status === 6
                      }"
                    ></span>
                    {{ row.statusName }}
                    <template v-if="row.status === 2">
                      <el-tooltip class="item" effect="dark" placement="top">
                        <template #content>
                          <div>{{ row.auditRemark }}</div>
                        </template>
                        <el-icon style="margin-left: 8px">
                          <i-warning />
                        </el-icon>
                      </el-tooltip>
                    </template>
                  </div>
                </div>
              </template>
            </el-table-column>
          </xm_table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isShowDialog = false">取消</el-button>
          <el-button type="primary" @click="onConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getVTaskList } from '@/api/market/task'
import { TASK_STATUS } from '@/utils/dictionary/task'
import { getQuery } from '@/utils/get_query'
import { isEmpty } from '@/utils/tools.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  hasSearch: {
    type: Boolean,
    default: true
  },
  queryInfo: Object,
  isKOC: {
    type: Boolean,
    default: false
  } // 是否是KOC过来的，是的话任务类型只有视频和图文
})
const emit = defineEmits(['update:show', 'confirm'])
const isShowDialog = ref(false)

watch(
  () => props.show,
  value => {
    isShowDialog.value = value
  },
  {
    immediate: true
  }
)

watch(
  () => isShowDialog.value,
  value => {
    emit('update:show', value)
  }
)
const loading = ref(false)
const list = ref([])

const page = ref({
  index: 1,
  size: 5,
  total: 0
})
const searchComponents = ref([
  {
    type: 'input',
    label: '任务名称',
    val: '',
    filed: 'taskName'
  },
  {
    type: 'select',
    label: '任务类型',
    val: '',
    filed: 'taskType',
    selects: props.isKOC
      ? [
          {
            label: '全部',
            value: -1
          },
          {
            label: '视频任务',
            value: 1
          },
          {
            label: '图文任务',
            value: 6
          }
        ]
      : [
          {
            label: '全部',
            value: -1
          },
          {
            label: '视频任务',
            value: 1
          },
          {
            label: '图文任务',
            value: 6
          },
          {
            label: '直播任务',
            value: 2
          },
          {
            label: '征集任务',
            value: 3
          },
          {
            label: '学习任务',
            value: 5
          }
        ]
  }
])

function searchList() {
  page.value.index = 1
  getList()
}

const getList = () => {
  // console.log('看看传过来的props.queryInfo', props.queryInfo)
  loading.value = true
  let data = getQuery(searchComponents.value)
  data.allTypes = true
  data.pageNo = page.value.index
  data.pageSize = page.value.size
  data.taskStatuses = [3, 4, 5]
  if (!isEmpty(props.queryInfo)) {
    data = Object.assign(data, props.queryInfo)
  }
  data.taskGroup = props.isKOC ? 3 : 1 // 任务分发类型 1 KOS 3KOC
  getVTaskList(data)
    .then(res => {
      list.value = res.data.records.map(e => {
        e.statusName = TASK_STATUS.getCN(e.status)
        return e
      })
      page.value.total = res.data.total || 0
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
getList()
let currentItem = {}
const handleCurrentChange = item => {
  currentItem = item
}

const onConfirm = () => {
  isShowDialog.value = false
  if (!isEmpty(currentItem)) {
    emit('confirm', currentItem)
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-table__row) {
  height: 62px;
}

.status-0 {
  background-color: rgba(54, 79, 205, 1);
}

:deep(.el-table__row) {
  height: 62px;
}

.status-0 {
  background-color: rgba(54, 79, 205, 1);
}

.status-1 {
  background-color: rgba(255, 172, 109, 1);
}

.status-2 {
  background-color: rgba(144, 147, 153, 1);
}

.status-3 {
  background-color: rgba(81, 248, 139, 1);
}

.status-4 {
  background-color: rgba(248, 81, 81, 1);
}

:deep .column_header {
  display: flex;
  align-items: center;
}

.task-dialog {
  .margin-right-12 {
    margin-right: 12px;
  }

  .dialog-content {
    .xm_search {
      padding: 0 0 8px 0;
    }

    .search-wrapper {
      margin-bottom: 16px;
    }

    .task-table {
      //height: 500px;
    }
  }
}
</style>

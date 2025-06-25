<template>
  <div class="task-dialog">
    <el-dialog v-model="isShowDialog" width="900px" title="选择活动">
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
            <el-table-column label="活动名称" min-width="180">
              <template v-slot="{ row }">{{ row.title || '--' }}</template>
            </el-table-column>
            <el-table-column v-if="judgeHWork()" label="所属波次" min-width="100">
              <template v-slot="{ row }">{{ row.haierWaveOrder || '--' }}</template>
            </el-table-column>
            <el-table-column label="活动日期" min-width="200">
              <template v-slot="{ row }">
                <div v-if="row.activityStartTime">
                  {{ row.activityStartTime.slice(0, 10) }}&nbsp;至&nbsp;{{
                    row.activityEndTime.slice(0, 10)
                  }}
                </div>
                <div v-else>--</div>
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
import { getQuery } from '@/utils/get_query'
import {isEmpty} from '@/utils/tools.js'
import { getActivityListBindTask } from '@/api/market/activity'
const judgeHWork = inject('$judgeHWork')
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  hasSearch: {
    type: Boolean,
    default: true
  },
  queryInfo: Object
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const isShowDialog = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

watch(
  () => isShowDialog.value,
  newValue => {
    if (newValue) {
      getList()
    }
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
    label: '活动名称',
    val: '',
    filed: 'title'
  },
  {
    type: 'dateRange',
    label: '活动日期', // label展示
    val: '', // 响应式绑定
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '开始时间'],
    filed: 'dateRange' // 查询字段名
  }
])

function searchList() {
  page.value.index = 1
  getList()
}

const getList = () => {
  loading.value = true
  const data = getQuery(searchComponents.value, ['activityStartTime', 'activityEndTime'])
  data.pageNo = page.value.index
  data.pageSize = page.value.size
  console.log(data)
  getActivityListBindTask(data)
    .then(res => {
      if (res.code === 0) {
        const { records = [], total = 0 } = res?.data || {}
        list.value = records
        page.value.total = total
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

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

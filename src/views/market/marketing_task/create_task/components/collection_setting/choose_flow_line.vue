<template>
  <el-dialog
    v-model="showDialog"
    title="选择流水线"
    :width="986"
    @closed="emits('update:showDialog', false)"
  >
    <div class="dialog_content">
      <xm_search
        :searchComponents="data.searchComponents"
        @getData="searchList"
        useOwnReset
        @reset="resetList"
      ></xm_search>
      <xm_table
        ref="xmTableRef"
        v-loading="data.loading"
        v-model:page="data.page"
        tableType="live"
        :data="data.tableData"
        showSelection
        @getTableData="getAllList"
        rowKey="id"
        :select="data.selectedFlowLines"
        @selection-change="onSelectionChange"
        pageLayout="total, prev, pager, next , jumper"
      >
        <el-table-column label="流水线名称" width="180px">
          <template #default="{ row }">
            <div class="flow_line_info">
              <img :src="row.coverUrl" />
              <div class="name">{{ row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创意仓库">
          <template #default="{ row }">{{ row.factoryNum || '-' }}</template>
        </el-table-column>
        <el-table-column label="原料库存">
          <template #default="{ row }">{{ row.materialNum || '-' }}</template>
        </el-table-column>
        <el-table-column label="素材库存">
          <template #default="{ row }">{{ row.productNum || '-' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="100px">
          <template #default="{ row }">{{ row.createTimeStr || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" align="right">
          <template #default="{ row }">
            <el-link type="primary" @click="toDetail(row)">查看</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emits('update:showDialog', false)">取消</el-button>
        <el-button type="primary" @click="confirm">确定选择</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { getPipelineList } from '@/api/market/task'

const props = defineProps({
  showDialog: Boolean,
  defaultIds: Array
})
const { showDialog, defaultIds } = toRefs(props)

const emits = defineEmits(['update:showDialog', 'chooseFlowLine'])
const message = inject('$message')

const xmTableRef = ref(null)
const data = reactive({
  allList: [],
  tableData: [],
  searchComponents: [
    {
      type: 'input',
      label: '流水线名称',
      val: '',
      placeholder: '请输入创意名称',
      filed: 'name'
    }
  ],
  loading: false,
  page: {
    index: 1,
    size: 5,
    total: 0
  },
  searchParams: {},
  selectedFlowLines: []
})

function getAllList() {
  data.loading = true
  getPipelineList({
    condition: {
      name: data.searchParams.name
    },
    pageNum: data.page.index,
    pageSize: data.page.size
  })
    .then(res => {
      if (res.code === 0) {
        data.tableData = res.data.records || []
        data.page.total = res.data.total || 0
      } else {
        if (data.page.index === 1) {
          data.tableData = []
        }
      }
      data.allList = res.data.records
      data.page.total = res.data.total
    })
    .finally(() => {
      data.loading = false
    })
}

// 搜索
function searchList(searchData) {
  data.page.index = 1
  data.searchParams = searchData
  getAllList()
}

// 重置
function resetList() {
  data.searchParams = {}
  data.page.index = 1
  getAllList()
}

function toDetail() {
  window.open(`${location.origin}/sumwhy_video/Assemblyline`)
}
function unique(arr) {
  const res = new Map()
  return arr.filter(arr => !res.has(arr.id) && res.set(arr.id, 1))
}

function onSelectionChange(e) {
  data.selectedFlowLines = unique(e)
}

function confirm() {
  if (!data.selectedFlowLines.length) {
    return message.warning('请选择流水线')
  }
  emits('update:showDialog', false)
  emits('chooseFlowLine', data.selectedFlowLines)
}
// 设置选中
function choose() {
  defaultIds.value.forEach(y => {
    xmTableRef.value.table.toggleRowSelection(y, true)
  })
}
onMounted(() => {
  if (props.defaultIds && props.defaultIds.length > 0) {
    const list = JSON.parse(JSON.stringify(props.defaultIds))
    data.selectedFlowLines = list
  } else {
    data.selectedFlowLines = []
  }
  getAllList()
  nextTick(() => {
    choose()
  })
})
</script>

<style lang="scss" scoped>
:deep .xm_search {
  padding: 0 0 8px 0;
}

.dialog_content {
  .flow_line_info {
    display: flex;
    align-items: center;
    > img {
      width: 44px;
      height: 58px;
      border-radius: 2px;
      margin-right: 16px;
      object-fit: cover;
    }
    .name {
      @include mult_line(1);
      font-size: 14px;
    }
  }
}

.xm_table_page {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>

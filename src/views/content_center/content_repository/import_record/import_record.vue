<template>
  <div class="g_bg">
    <xm_table
      v-loading="tableState.loading"
      :data="tableState.listData"
      v-model:page="tableState.page"
      @getTableData="getList"
    >
      <el-table-column show-overflow-tooltip label="标题" prop="title" min-width="150">
        <template #default="scope">
          {{ scope.row.title || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="导入批次号" prop="batchNo" min-width="240">
        <template #default="scope">
          {{ scope.row.batchNo || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="最大拉取条数" prop="bigPullNum" min-width="130">
        <template #default="scope">
          {{ scope.row.bigPullNum || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="实际已导入数量" prop="actualImport" min-width="130">
        <template #default="scope">
          {{ scope.row.actualImport || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" min-width="120">
        <template #default="scope">
          <div class="status_style">
            <div
              v-if="statusList.get(scope.row.status)"
              :class="
                'status_circle ' +
                (statusList.get(scope.row.status) ? statusList.get(scope.row.status).class : '')
              "
            ></div>
            <div>
              {{ statusList.get(scope.row.status) ? statusList.get(scope.row.status).label : '--' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="提交人" prop="userName" min-width="120">
        <template #default="scope">
          {{ scope.row.userName || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="提交时间" prop="submitTime" min-width="170">
        <template #default="scope">
          {{ scope.row.submitTime || '--' }}
        </template>
      </el-table-column>
    </xm_table>
  </div>
</template>
<script setup>
import { importRecordList } from '@/api/content_center/content_repository.js'
const tableState = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
const statusList = reactive(
  new Map([
    [1, { label: '导入中', class: '' }],
    [2, { label: '导入失败', class: 'red_circle' }],
    [0, { label: '导入成功', class: 'green_circle' }]
  ])
)
function getList() {
  importRecordList({
    pageSize: tableState.page.size,
    pageNo: tableState.page.index
  })
    .then(res => {
      if (res.code === 0) {
        tableState.listData = res.data.records || []
        tableState.page.total = res.data.total || 0
      } else {
        tableState.listData = []
        if (tableState.page.index === 1) {
          tableState.page.total = 0
        }
      }
      tableState.loading = false
    })
    .catch(() => {
      tableState.listData = []
      tableState.loading = false
      if (tableState.page.index === 1) {
        tableState.page.total = 0
      }
    })
}
function init() {
  tableState.loading = true
  getList()
}
init()
</script>
<style lang="scss" scoped></style>

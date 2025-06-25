<template>
  <div class="matrix_page">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 表格 -->
    <div class="table_box">
      <div class="xm_promptAboveTheTable">默认展示近30天违规关键词列表</div>
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
        @sort-change="sortChange"
        :default-sort="{
          prop: 'violationNum',
          order: 'descending'
        }"
      >
        <el-table-column min-width="125" label="关键词">
          <template #default="scope">{{ scope.row.keyWords || '--' }}</template>
        </el-table-column>
        <el-table-column min-width="110" sortable="custom" prop="violationNum" label="违规次数">
          <template #default="scope">{{ wanSliceFormat(scope.row.violationNum || 0) }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { pageList } from './model/get_list.js'
import { wanSliceFormat } from '@/utils/tools.js'
const { searchComponents, tableForm, getList } = pageList()

// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableForm.page.index = 1
  getList()
}

// 排序
function sortChange(column, prop, order) {
  if (column.prop === 'violationNum') {
    if (column.order === 'ascending') {
      tableForm.orderBy = 1
    } else if (column.order === 'descending') {
      tableForm.orderBy = 2
    }
  } else {
    tableForm.orderBy = null
  }
  searchList()
}
</script>
<style lang="scss" scoped>
.table_box {
  border-radius: 4px;
  margin-top: 16px;
  padding: 22px 24px 24px;
  background: #fff;
}
</style>

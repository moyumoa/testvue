<template>
  <div>
    <!-- search -->
    <section class="search">
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
      ></xm_search>
    </section>

    <!-- content -->
    <div class="page_main mt_16">
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="用户名" prop="name" min-width="150">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              phoneKey="telephone"
              :showAvatar="false"
              :showDyNum="false"
              :showLeaving="row.staffStatus && row.staffStatus == 2"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="变更原因" prop="typeName" />
        <el-table-column label="金币类型" prop="goldTypeName" />
        <el-table-column label="变更明细" prop="changeGold">
          <template v-slot="{ row }">
            {{ row.changeGold > 0 ? `+${row.changeGold}` : row.changeGold }}
          </template>
        </el-table-column>
        <el-table-column label="变更后余额" prop="newGold" />
        <el-table-column label="变更时间" prop="gmtCreate" min-width="150" />
        <el-table-column label="备注" prop="note" min-width="250" />
      </xm_table>
    </div>
  </div>
</template>

<script>
import { pageList } from './model/get_list'
export default {
  setup() {
    const { searchComponents, tableForm, getList, showTel } = pageList()

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
      tableForm.loading = true
      tableForm.page.index = 1
      getList()
    }
    return { searchComponents, tableForm, getList, searchList, resetSearch, showTel }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-table__row) {
  height: 62px;
}
</style>

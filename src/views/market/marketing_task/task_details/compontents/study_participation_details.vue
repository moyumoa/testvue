<template>
  <div>
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    >
      <template #labelTip v-if="pageSource != 'growth'">
        <el-tooltip
          class="item"
          effect="dark"
          content="已结束/已关闭任务不支持查询未参与的成员明细，请导出查看"
          placement="top"
        >
          <img
            src="@/assets/images/content_center/tip_line.png"
            style="width: 14px; height: 14px; margin-left: 5px"
            alt
          />
        </el-tooltip>
      </template>
      <template #searchBtn>
        <!-- <async_button :asyncFunc="exportTask" :isExport="true">导出</async_button> -->
        <exp_button :asyncFunc="exportTask">导出</exp_button>
        <!-- <el-button @click="exportTask">导出</el-button> -->
      </template>
    </xm_search>

    <div class="page_main mt_16">
      <xm_table
        class="pic_table"
        tableType="live"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTaskInfo"
        @sort-change="handleSortChange"
      >
        <el-table-column label="成员信息" min-width="250">
          <template v-slot="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              :showDyNum="false"
              :showLeaving="row.staffStatus && row.staffStatus == 2"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="部门" min-width="200">
          <template v-slot="{ row }">
            <table_column_department_info
              :departmentName="row.orgInfo"
              v-if="row.orgInfo"
              connectStr="/"
              divisionStr=";"
              trigger="hover"
              className="dept_flex"
            ></table_column_department_info>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="参与任务部门" min-width="200" v-if="pageSource != 'growth'">
          <template #header>
            <div class="column_header">
              <span>参与任务部门</span>
              <el-tooltip placement="top" :style="{ 'margin-left': '4px' }">
                <template #content>
                  <div>若成员属于多个部门，参与任务时需选择其中一个部门</div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row }">
            <table_column_department_info
              :departmentName="row.taskJoinDept"
              v-if="row.taskJoinDept"
              connectStr="/"
              divisionStr=";"
              trigger="hover"
            ></table_column_department_info>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="参与任务矩阵号分组" prop="groupsName" min-width="200">
          <template v-slot="{ row }">
            <span v-if="!row.groupsName || (row.groupsName && row.groupsName.length <= 0)">-</span>
            <table_column_group_list
              v-else
              :showCount="2"
              :groups="row.groupsName || []"
            ></table_column_group_list>
          </template>
        </el-table-column> -->
        <el-table-column label="参与状态" min-width="120">
          <template v-slot="{ row }">
            <div class="status_style" v-if="GROWTH_DELIVERY_STATUS.getCN(row.status)">
              <div
                :class="'status_circle ' + GROWTH_DELIVERY_STATUS.getCN(row.status || 0).class"
              ></div>
              <div>
                {{ GROWTH_DELIVERY_STATUS.getCN(row.status).label }}
              </div>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column prop="joinTaskTime" label="参与时间" width="180">
          <template v-slot="{ row }">
            <div>{{ row.joinTaskTime || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="获得金币数" min-width="110">
          <template v-slot="{ row }">{{ row.coinNum || 0 }}</template>
        </el-table-column>
        <el-table-column label="完成时间" width="180">
          <template v-slot="{ row }">{{ row.finishTimeStr || '-' }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { participation } from '../data'
import { GROWTH_DELIVERY_STATUS } from '@/utils/dictionary/task'
const props = defineProps({
  pageSource: String
})
const pageSource = toRef(props, 'pageSource')
const { tableForm, getTaskInfo, searchComponents, handleSortChange, exportTask } =
  participation('study')
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getTaskInfo()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getTaskInfo()
}
</script>

<style lang="scss" scoped>
:deep .column_header {
  display: flex;
  align-items: center;
}
</style>

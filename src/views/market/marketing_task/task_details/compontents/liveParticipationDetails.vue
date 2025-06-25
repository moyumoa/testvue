<template>
  <div>
    <!-- search -->
    <section class="search">
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
    </section>

    <!-- content -->
    <div class="page_main mt_16">
      <xm_table
        class="pic_table"
        tableType="live"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTaskInfo"
      >
        <!-- @sort-change="handleSortChange" -->
        <el-table-column label="成员信息" min-width="250" fixed="left">
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
        <el-table-column
          label="参与任务矩阵号分组"
          prop="groupsName"
          min-width="200"
          v-if="pageSource != 'growth'"
        >
          <template v-slot="{ row }">
            <span v-if="!row.groupsName || (row.groupsName && row.groupsName.length <= 0)">-</span>
            <table_column_group_list
              v-else
              :showCount="2"
              :groups="row.groupsName || []"
            ></table_column_group_list>
          </template>
        </el-table-column>
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
        <el-table-column
          prop="totalJoinTimes"
          label="重复参与进度"
          min-width="140"
          v-if="dyVersion == 3 && pageSource != 'growth'"
        >
          <template v-slot="{ row }">
            <div v-if="row.totalJoinTimes">
              {{ wanSliceFormat(row.alreadyJoinTimes || 0) }}/{{
                wanSliceFormat(row.totalJoinTimes || 0)
              }}
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="joinTaskTime"
          :label="dyVersion == 3 && pageSource != 'growth' ? '初次参与时间' : '参与时间'"
          min-width="140"
        >
          <template v-slot="{ row }">
            <div>{{ row.joinTaskTime || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="latestJoinTaskTime"
          label="最新参与时间"
          min-width="140"
          v-if="dyVersion == 3 && pageSource != 'growth'"
        >
          <template v-slot="{ row }">
            <div>{{ row.latestJoinTaskTime || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="live_times_target" label="直播场次" min-width="120">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.liveTimesTarget || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="live_duration_target" label="直播时长(分钟)" min-width="150">
          <template v-slot="{ row }">
            <div>{{ parseInt(row.liveDurationTarget / 60000) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="live_view_num_target" label="直播观看人次" min-width="145">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.liveViewNumTarget || 0) }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="live_view_num_target" label="留资数" min-width="120">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.leaveinfoNumTarget || 0) }}</div>
          </template>
        </el-table-column> -->
        <el-table-column
          prop="share_count_target"
          label="销售额"
          min-width="120"
          v-if="brandViewMode === 1"
        >
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat((row.orderAmountTarget || 0) / 100) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="share_count_target"
          label="销售量"
          min-width="120"
          v-if="brandViewMode === 1"
        >
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.paymentOrderCountTarget || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="share_count_target" label="发放金币数" min-width="120">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.changeCoin || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="rewardStatus" label="完成所有指标" min-width="150">
          <template v-slot="{ row }">
            <div>{{ row.rewardStatus === 3 ? '是' : '否' }}</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { participation } from '../data'
import { wanSliceFormat } from '@/utils/tools.js'
import { GROWTH_DELIVERY_STATUS } from '@/utils/dictionary/task'
import { useStore } from 'vuex'
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const dyVersion = computed(() => store.state.user.dyVersion)

const props = defineProps({
  taskInfo: Object,
  pageSource: String
})
const taskInfo = toRef(props, 'taskInfo')
const { tableForm, getTaskInfo, searchComponents, exportTask } = participation(
  'live',
  taskInfo.value.name
)
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

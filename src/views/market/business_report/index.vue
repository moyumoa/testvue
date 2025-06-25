<template>
  <div>
    <xm_search
      :searchComponents="searchComponents"
      @getData="querySearch"
      @reset="resetSearch"
      @rangeTimeChange="rangeTimeChange"
    >
      <template #searchBtn>
        <exp_button ref="expButton" type="default" :isExport="true" :asyncFunc="exportData">
          导出
        </exp_button>
      </template>
    </xm_search>
    <div class="page_main mt_16">
      <xm_table
        tableType="avatar"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="成员信息" prop="name" min-width="200">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              :showDyNum="false"
              name="name"
              :showLeaving="row.staffStatus && row.staffStatus == 2"
            ></table_column_matrix_account>
          </template>
        </el-table-column>

        <el-table-column label="有效矩阵号数" min-width="120">
          <template #default="scope">{{ wanSliceFormat(scope.row.validXUserCnt || 0) }}</template>
        </el-table-column>
        <el-table-column label="矩阵号信息" min-width="220">
          <template #default="scope">
            <div v-if="scope.row.xusers && scope.row.xusers.length > 0">
              <span v-for="(item, index) in scope.row.xusers" :key="index">
                {{ item.nickname || '--' }}
                <span v-if="index < scope.row.xusers.length - 1">,</span>
              </span>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="粉丝数" min-width="130">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.fansCnt || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="涨粉数" min-width="130">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.newFansCnt || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="参与任务数" min-width="100">
          <template #default="scope">{{ wanSliceFormat(scope.row.joinTaskCnt || 0) }}</template>
        </el-table-column>
        <el-table-column label="参与成功任务数" prop="joinSucceedTaskCnt" min-width="150">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.joinSucceedTaskCnt || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="完成任务数" prop="finishTaskNum" min-width="100">
          <template #default="scope">{{ wanSliceFormat(scope.row.finishTaskNum || 0) }}</template>
        </el-table-column>
        <el-table-column label="接收任务数" min-width="100">
          <template #default="scope">{{ wanSliceFormat(scope.row.receiveTaskCnt || 0) }}</template>
        </el-table-column>
        <el-table-column label="任务参与率" prop="task_join_rate" min-width="100">
          <template #default="scope">{{ scope.row.taskJoinRate || 0 }}</template>
        </el-table-column>
        <el-table-column label="视频数" prop="video_cnt" min-width="100">
          <template #default="scope">{{ wanSliceFormat(scope.row.videoCnt || 0) }}</template>
        </el-table-column>
        <el-table-column
          label="直播场次"
          prop="live_times_target"
          min-width="100"
          v-if="systemVersion == 3"
        >
          <template #default="scope">{{ wanSliceFormat(scope.row.liveTimesTarget || 0) }}</template>
        </el-table-column>
        <!-- 顾家定制，所以部门暂时写死 -->
        <el-table-column label="事业部" min-width="130">
          <template #default="scope">
            {{ scope.row.businessDivision || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="零售中心" min-width="130">
          <template #default="scope">
            {{ scope.row.retailCenter || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="大区" min-width="130">
          <template #default="scope">
            {{ scope.row.orgName3 || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="督导" min-width="130">
          <template #default="scope">
            {{ scope.row.orgName4 || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="经销商" min-width="130">
          <template #default="scope">
            {{ scope.row.orgName5 || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="门店" min-width="130">
          <template #default="scope">
            {{ scope.row.orgName6 || '--' }}
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { handleGetList } from './get_list'
import { wanSliceFormat } from '@/utils/tools.js'
// import { ElMessage } from 'element-plus'

const { tableForm, searchComponents, getList, resetSearch, exportData } = handleGetList()
const store = useStore()
// 基础版只显示矩阵号等级规则，其余版本显示完整
const systemVersion = computed(() => store.state.user.systemVersion)

// 时间范围选择改变
const rangeTimeChange = value => {
  console.log(value)
}

const expButton = ref(null)
function querySearch() {
  const time = toRaw(searchComponents.value.find(item => item.type === 'dateRange').val)
  const range = time[1].getTime() - time[0].getTime()
  if (range > 30 * 24 * 60 * 60 * 1000) {
    return expButton.value?.showTipDialog(30)
  }
  tableForm.page.index = 1
  getList()
}

// const aliasName = computed(() => {
//   if (store.state.user.levelAlias && store.state.user.levelAlias.length > 0) {
//     const levelAlias = store.state.user.levelAlias
//     const data = levelAlias.slice(0, 2)
//     return data
//   } else {
//     return [null, null]
//   }
// })
</script>

<style lang="scss" scoped>
.part_name {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.account_info {
  display: flex;
  align-items: center;

  > img {
    margin-left: 8px;
    width: 16px;
    height: 16px;
  }
}

:deep .cell .el-tooltip__trigger {
  display: inline-block !important;
}
</style>

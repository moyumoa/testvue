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
      <!-- <div class="page_btns"> -->
      <!-- <async_button type="default" :isExport="true" :asyncFunc="exportData">导出</async_button> -->
      <!-- <exp_button type="default" :isExport="true" :asyncFunc="exportData">导出</exp_button> -->
      <!-- </div> -->
      <xm_table
        tableType="default"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="成员信息" prop="name" min-width="300">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              :showDyNum="false"
              name="name"
              :showLeaving="row.staffStatus && row.staffStatus == 2"
              :showBusiness="true"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="工号" min-width="130" v-if="showEmployeeId">
          <template #default="scope">
            {{ scope.row.thirdPartyStaffId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="部门信息" prop="orgName" min-width="200">
          <template #default="{ row }">
            <table_column_department_info
              :departmentName="row.orgName"
              v-if="row.orgName"
              connectStr="/"
              divisionStr=";"
              trigger="hover"
            ></table_column_department_info>
            <span v-else>--</span>
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
        <el-table-column
          label="参与任务次数"
          prop="joinTaskTimes"
          min-width="120"
          v-if="dyVersion && dyVersion == 3"
        >
          <template #default="scope">{{ wanSliceFormat(scope.row.joinTaskTimes || 0) }}</template>
        </el-table-column>
        <el-table-column
          label="参与任务成功次数"
          prop="joinTaskSuccessTimes"
          min-width="150"
          v-if="dyVersion && dyVersion == 3"
        >
          <template #default="scope">
            {{ wanSliceFormat(scope.row.joinTaskSuccessTimes || 0) }}
          </template>
        </el-table-column>
        <el-table-column
          label="完成任务次数"
          prop="finishTaskTimes"
          min-width="120"
          v-if="dyVersion && dyVersion == 3"
        >
          <template #default="scope">{{ wanSliceFormat(scope.row.finishTaskTimes || 0) }}</template>
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
          v-if="systemVersion !== 4"
        >
          <template #default="scope">{{ wanSliceFormat(scope.row.liveTimesTarget || 0) }}</template>
        </el-table-column>
        <el-table-column label="留资数" prop="leaveinfo_num_target" min-width="100">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.leaveinfoNumTarget || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="获得金币数" prop="add_gold" min-width="100">
          <template #default="scope">{{ wanSliceFormat(scope.row.addGold || 0) }}</template>
        </el-table-column>
        <el-table-column label="当前金币数" min-width="130">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.totalGold || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="消耗金币数" prop="subGold" min-width="100">
          <template #default="scope">{{ wanSliceFormat(scope.row.subGold || 0) }}</template>
        </el-table-column>
        <!--        <el-table-column label="授权情况" prop="dy_account_status" min-width="100">-->
        <!--          <template #default="scope">-->
        <!--            {{ scope.row.dyAccountStatus || '&#45;&#45;' }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column label="播放数" prop="play_count_target" min-width="100">
          <template #default="scope">{{ wanSliceFormat(scope.row.playCountTarget || 0) }}</template>
        </el-table-column>
        <el-table-column label="点赞数" prop="digg_count_target" min-width="100">
          <template #default="scope">{{ wanSliceFormat(scope.row.diggCountTarget || 0) }}</template>
        </el-table-column>
        <el-table-column label="分享数" prop="share_count_target" min-width="100">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.shareCountTarget || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="评论数" prop="comment_count_target" min-width="100">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.commentCountTarget || 0) }}
          </template>
        </el-table-column>
        <el-table-column
          label="直播观看人次"
          prop="live_view_num_target"
          min-width="140"
          v-if="systemVersion !== 4"
        >
          <template #default="scope">
            {{ wanSliceFormat(scope.row.liveViewNumTarget || 0) }}
          </template>
        </el-table-column>
        <el-table-column
          label="直播时长(分钟)"
          prop="live_duration_target"
          min-width="170"
          v-if="systemVersion !== 4"
        >
          <template #default="scope">
            {{
              wanSliceFormat(
                scope.row.liveDurationTarget ? parseInt(scope.row.liveDurationTarget / 60000) : 0
              )
            }}
          </template>
        </el-table-column>
        <el-table-column :label="aliasName.length > 0 ? aliasName[0] : ''" min-width="130">
          <template #default="scope">
            {{ scope.row.businessDivision || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="aliasName.length > 1 ? aliasName[1] : ''" min-width="130">
          <template #default="scope">
            {{ scope.row.retailCenter || '--' }}
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { handleGetList } from './get_list'
// import {
//   isShowEmployeeId
// } from '@/api/market/operate_analysis.js'
import { wanSliceFormat } from '@/utils/tools.js'
// import { ElMessage } from 'element-plus'

const { tableForm, searchComponents, getList, resetSearch, exportData } = handleGetList()
// const showEmployee = ref(null)
// function getShowEmployeeResult(){
//   isShowEmployeeId({})
//     .then(res => {
//       showEmployee.value = res.data
//     })
//     .finally(() => {})
// };
// getShowEmployeeResult();
// 时间范围选择改变
const rangeTimeChange = value => {
  console.log(value)
  // const time = toRaw(value)
  // const range = time[1].getTime() - time[0].getTime()
  // if (range > 30 * 24 * 60 * 60 * 1000) {
  //   ElMessage.warning('时间跨度超过30天，请导出报表查看数据')
  // }
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
const store = useStore()
const showEmployeeId = computed(() => store.state.user.showEmployeeId)
const systemVersion = computed(() => store.state.user.systemVersion)
const aliasName = computed(() => {
  if (store.state.user.levelAlias && store.state.user.levelAlias.length > 0) {
    const levelAlias = store.state.user.levelAlias
    const data = levelAlias.slice(0, 2)
    return data
  } else {
    return [null, null]
  }
})
const dyVersion = computed(() => store.state.user.dyVersion)
// function getXuserName(e) {
//   if (e && e.length > 0) {
//     const nameList = []
//     e.forEach(x => {
//       nameList.push(x.nickname)
//     })
//     return nameList.join(',')
//   } else {
//     return '--'
//   }
// }
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
:deep .business_box .businessEntity_tag_box {
  display: flex !important;
}
// :deep(.page_btns .el-button) {
//   margin-left: 0 !important;
// }
</style>

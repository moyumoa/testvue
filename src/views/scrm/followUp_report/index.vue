<template>
  <div>
    <xm_search :searchComponents="searchComponents" @getData="querySearch" @reset="resetSearch">
      <template #searchBtn>
        <exp_button ref="expButton" type="default" :isExport="true" :asyncFunc="exportData">
          导出
        </exp_button>
      </template>
    </xm_search>
    <div class="page_main mt_16">
      <xm_table
        tableType="default"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="成员信息" prop="name" min-width="260">
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
        <el-table-column label="获客数" min-width="130">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.totalClientCnt || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="视频潜客数" min-width="130">
          <template #default="scope">
            {{ wanSliceFormat(scope.row.videoClientCnt || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="直播潜客数" min-width="130">
          <template #default="scope">{{ wanSliceFormat(scope.row.liveClientCnt || 0) }}</template>
        </el-table-column>
        <el-table-column label="私信潜客数" min-width="130">
          <template #default="scope">{{ wanSliceFormat(scope.row.imClientCnt || 0) }}</template>
        </el-table-column>
        <el-table-column label="分配客户数" min-width="130">
          <template #default="scope">{{ wanSliceFormat(scope.row.dispatchCnt || 0) }}</template>
        </el-table-column>
        <el-table-column label="跟进率" min-width="130">
          <template #default="scope">{{ scope.row.followUpRate || 0 }}</template>
        </el-table-column>
        <el-table-column label="平均跟进时效" min-width="130">
          <template #default="scope">{{ scope.row.avgFollowEfficiency || 0 }}</template>
        </el-table-column>
        <el-table-column label="留资数" min-width="130">
          <template #default="scope">{{ wanSliceFormat(scope.row.clueCnt || 0) }}</template>
        </el-table-column>
        <el-table-column label="留资转化率" min-width="130">
          <template #default="scope">{{ scope.row.clueRate || 0 }}</template>
        </el-table-column>
        <el-table-column label="成交数" min-width="130">
          <template #default="scope">{{ wanSliceFormat(scope.row.dealCnt || 0) }}</template>
        </el-table-column>
        <el-table-column label="成交转化率" min-width="130">
          <template #default="scope">{{ scope.row.dealRate || 0 }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { handleGetList } from './get_list'
import { wanSliceFormat } from '@/utils/tools.js'

const { tableForm, searchComponents, getList, resetSearch, exportData } = handleGetList()

const expButton = ref(null)
function querySearch() {
  // 超出30天走导出
  // const time = toRaw(searchComponents.value.find(item => item.type === 'dateRange').val)
  // const range = time[1].getTime() - time[0].getTime()
  // if (range > 30 * 24 * 60 * 60 * 1000) {
  //   return expButton.value?.showTipDialog(30)
  // }
  tableForm.page.index = 1
  getList()
}
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
</style>

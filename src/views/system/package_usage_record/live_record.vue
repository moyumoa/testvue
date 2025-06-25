<template>
  <div>
    <xm_search
      :searchComponents="$data.searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_main mt_16">
      <xm_table
        tableType="avatar"
        v-loading="$data.loading"
        :data="$data.tableData"
        v-model:page="$data.page"
        @getTableData="getList"
      >
        <el-table-column label="矩阵号" min-width="150px">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row"
              :showDel="row.xuserIsDel && row.xuserIsDel == 1 ? true : false"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="运营者">
          <template #default="{ row }">{{ row.operatorName || '--' }}</template>
        </el-table-column>
        <el-table-column label="所在部门">
          <template #default="{ row }">
            <table_column_department_info
              :departmentName="row.departmentStr"
              v-if="row.departmentStr"
              connectStr="/"
              divisionStr=";"
              trigger="hover"
            ></table_column_department_info>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="直播标题">
          <template #default="{ row }">{{ row.roomTitle || '-' }}</template>
        </el-table-column>
        <el-table-column label="录屏时间" min-width="135px">
          <template #default="{ row }">
            <div>{{ row.recordStartTime }}</div>
            <div>至</div>
            <div>{{ row.recordEndTime }}</div>
          </template>
        </el-table-column>
        <el-table-column label="录屏时长(分钟)">
          <template #default="{ row }">{{ row.changeNum }}</template>
        </el-table-column>
        <el-table-column label="直播时间" min-width="135px">
          <template #default="{ row }">
            <div>{{ row.liveStartTime }}</div>
            <div>至</div>
            <div>{{ row.liveEndTime }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播时长(分钟)">
          <template #default="{ row }">{{ transDuration(row.liveDuration) }}</template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="120"
          align="center"
          header-align="center"
        >
          <template v-slot="{ row }">
            <el-link type="primary" @click="toDetail(row.roomId, row.dyOpenId)">直播详情</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { getQuery } from '@/utils/get_query.js'
import { getLiveRecord } from '@/api/system_setting/brand_info'

const $data = reactive({
  searchComponents: [
    {
      type: 'dateRange',
      label: '直播时间',
      val: '',
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange'
    },
    {
      type: 'input',
      label: '抖音号',
      placeholder: '请输入抖音昵称、抖音号',
      val: '',
      filed: 'dyInfo'
    }
  ],
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 10
  }
})

function getList() {
  $data.loading = true
  const params = getQuery($data.searchComponents, ['startTime', 'endTime'])
  params.pageNo = $data.page.index
  params.pageSize = $data.page.size
  params.changeType = 2
  getLiveRecord(params)
    .then(res => {
      const _list = res.data.records || []
      $data.tableData = _list.map(e => {
        e.dyAvatar = e.headUrl
        e.dyName = e.dyNickname
        e.dyNum = e.dyDisplayId
        if (e.department) {
          e.departmentStr = e.department.join('|')
        }
        return e
      })
      $data.page.total = res.data.total
    })
    .finally(() => {
      $data.loading = false
    })
}

// 时长毫秒转分钟
function transDuration(value) {
  const MIN = 1000 * 60
  return Math.ceil(value / MIN)
}

function searchList() {
  $data.page.index = 1
  getList()
}
function resetSearch() {
  $data.page.index = 1
  $data.page.size = 10
  getList()
}

onMounted(() => {
  getList()
})

const toDetail = (roomId, dyOpenId) => {
  window.open(
    `${location.origin}/content_center/live_center/detail?roomId=${roomId}&dyOpenId=${dyOpenId}`,
    '_blank'
  )
}
</script>

<style lang="scss" scoped></style>

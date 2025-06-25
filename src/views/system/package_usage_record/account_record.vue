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
            <table_column_matrix_account :info="row" numText="账号ID"></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="所属平台">
          <template #default="{ row }">{{ PLATFORM.getCN(row.platform) || '未知' }}</template>
        </el-table-column>
        <el-table-column label="运营者">
          <template #default="{ row }">{{ row.opeName || '--' }}</template>
        </el-table-column>
        <el-table-column label="所在部门">
          <template #default="{ row }">
            <table_column_department_info
              :departmentName="row.departmentInfo"
              v-if="row.departmentInfo"
              connectStr="/"
              divisionStr=";"
              trigger="hover"
            ></table_column_department_info>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="当前授权状态">
          <template #default="{ row }">{{ getAuthCN(row) || '--' }}</template>
        </el-table-column>
        <el-table-column label="授权时间">
          <template #default="{ row }">{{ getAuthTime(row) || '--' }}</template>
        </el-table-column>
        <el-table-column label="累计有效授权时长">
          <template #default="{ row }">
            {{ row.syncTotalDays != null ? (row.syncTotalDays || 0) + '天' : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="累计消耗星力值">
          <template #default="{ row }">
            {{ row.syncTotalSumvideo != null ? row.syncTotalSumvideo || 0 : '--' }}
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { getQuery } from '@/utils/get_query.js'
import { getAccountRecord } from '@/api/system_setting/brand_info'
import { PLATFORM } from '@/utils/dictionary/company.js'

const $data = reactive({
  searchComponents: [
    {
      type: 'dateRange',
      label: '接入时间',
      val: '',
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange'
    },
    {
      type: 'select',
      label: '授权状态',
      val: -1,
      defaultVal: -1,
      filed: 'dyAuthStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '已授权',
          value: 1
        },
        {
          label: '授权失效',
          value: 2
        }
      ]
    },
    {
      type: 'input',
      label: '矩阵号',
      val: '',
      placeholder: '请输入矩阵号昵称、账号ID',
      filed: 'authName'
    },
    {
      type: 'select',
      label: '所属平台',
      val: -1,
      defaultVal: -1,
      filed: 'platform',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '抖音',
          value: 1
        },
        {
          label: '视频号',
          value: 2
        },
        {
          label: '小红书',
          value: 3
        },
        {
          label: '快手',
          value: 4
        }
      ]
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

const auth = {
  1: 'dyAuth',
  2: 'wxAuth',
  3: 'xhsAuth',
  4: 'dyAuth'
}
const authStatus = {
  0: '未授权',
  1: '已授权',
  2: '授权失效'
}
const getAuthCN = item => {
  if ([1, 2, 3, 4].indexOf(item.platform) === -1) return '--'
  return authStatus[item[auth[item.platform]]]
}
const getAuthTime = item => {
  if ([1, 2, 3, 4].indexOf(item.platform) === -1) return '--'
  return item[`${auth[item.platform]}ValidDateTime`]
}

function getList() {
  $data.loading = true
  const params = getQuery($data.searchComponents, ['startTime', 'endTime'])
  params.pageNumber = $data.page.index
  params.pageSize = $data.page.size
  params.isAppendStaffDetail = true
  getAccountRecord(params)
    .then(res => {
      const _list = res.data.records || []
      $data.tableData = _list.map(e => {
        let _depList = []
        if (e.fsAccount && e.fsAccount.departmentList) {
          _depList = e.fsAccount.departmentList.map(item => item.name)
        }
        e.dyAvatar = e.authAccountPhoto
        e.dyName = e.authAccountName
        e.dyNum = e.orginUid
        e.departmentInfo = _depList.join('|')
        return e
      })
      $data.page.total = res.data.total
    })
    .finally(() => {
      $data.loading = false
    })
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
</script>

<style lang="scss" scoped></style>

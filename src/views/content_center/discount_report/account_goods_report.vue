<template>
  <!-- 筛选条件 -->
  <xm_search :searchComponents="data.searchComponents" @getData="getList" />
  <div class="table_box">
    <xm_table
      v-loading="data.tableLoading"
      :data="data.tableData"
      v-model:page="data.page"
      @getTableData="getList"
    >
      <el-table-column min-width="200" label="矩阵号">
        <template #default="{ row }">
          <div class="user_box">
            <img v-if="row.avatar" :src="row.avatar" class="avatar" />
            <img v-else src="@/assets/images/content_center/default_user.png" class="avatar" />
            <div class="user_name">{{ row.nickname }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="平均标价折扣">
        <template #default="{ row }">
          {{ row.avgDiscount ? Math.floor(row.avgDiscount * 1000) / 100 + '折' : '--' }}
        </template>
      </el-table-column>
      <el-table-column min-width="110" align="right" fixed="right" label="操作">
        <template #default="{ row }">
          <el-link type="primary" @click="showDetail(row)">详情</el-link>
        </template>
      </el-table-column>
    </xm_table>

    <live-goods-report-dialog
      v-model:showDialog="data.showDialog"
      :accountId="data.accountId"
    ></live-goods-report-dialog>
  </div>
</template>

<script setup>
import { getLastMonthDate } from '@/utils/tools.js'
import { getAccountDiscountReport } from '@/api/content_center/discount_report.js'
import liveGoodsReportDialog from './live_goods_report_dialog.vue'
import { getQuery } from '@/utils/get_query.js'
import api from '@/api/content_center/content_matrix.js'

const data = reactive({
  searchComponents: [
    {
      type: 'select',
      label: '矩阵号',
      val: -1,
      placeholder: '请选择矩阵号',
      multiple: true,
      filterable: true,
      remote: true,
      remoteMethod: getMatrixList(),
      selects: [],
      filed: 'xuserIds'
    },
    {
      type: 'dateRange',
      label: '开播时间',
      val: getLastMonthDate(),
      isDisEdit: true,
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange'
    }
  ],
  tableLoading: false,
  tableData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  showDialog: false,
  accountId: null
})

// 获取商品列表
function getList() {
  data.tableLoading = true
  const searchParams = getQuery(data.searchComponents, ['minLiveStartTime', 'maxLiveStartTime'])
  const params = Object.assign(searchParams, {
    pageSize: data.page.size,
    pageNo: data.page.index
  })
  getAccountDiscountReport(params)
    .then(res => {
      data.tableData = res.data.records
      data.page.total = res.data.total
    })
    .finally(() => {
      data.tableLoading = false
    })
}

// 获取矩阵号列表
function getMatrixList(value) {
  api
    .getMatrixList({
      dyNickName: value || '',
      orderBy: 2,
      orderItem: 'amount',
      pageNo: 1,
      pageSize: 10
    })
    .then(res => {
      data.searchComponents.forEach(item => {
        if (item.label === '矩阵号') {
          item.selects = res.data.records.map(e => {
            return {
              label: e.dyNickname,
              value: e.xuserId
            }
          })
        }
      })
    })
}

// 显示详情弹窗
function showDetail(row) {
  data.showDialog = true
  data.accountId = row.xuserId
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
@import '../components/css/page.scss';
.table_box {
  margin-top: $content_margin;
  border-radius: $content_radius;
  width: 100%;
  background: #fff;
  padding: 22px 24px;
  .user_box {
    display: flex;
    align-items: center;
    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 100%;
      margin-right: 4px;
    }
    .user_name {
      font-size: 14px;
    }
  }
  .action {
  }
}
</style>

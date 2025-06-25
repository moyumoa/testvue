<template>
  <div>
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 表格 -->
    <div class="table_box">
      <xm_table
        ref="table"
        tableType="live"
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="日期" prop="date" width="180">
          <template #default="scope">
            <div>{{ scope.row.dayDate || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column min-width="220" label="商品名称">
          <template #default="scope">
            <div class="content_text">
              {{ scope.row.title || '--' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="180" label="货号">
          <template #default="scope">
            <div>{{ scope.row.productIdStr || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交金额(元)" prop="amount" min-width="170">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.amount || 0), false) }}</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { daily } from '@/api/content_center/good_aggregate.js'
import { changeTwoDecimal } from '@/utils/tools.js'
// import { selectList } from '@/api/content_center/good_group.js'
import { getQuery } from '@/utils/get_query.js'

// 筛选条件
const searchComponents = ref([
  {
    type: 'dateRange', // 组件类型
    label: '时间范围', // label展示
    val: '', // 响应式绑定
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    clearable: 'false',
    filed: 'dateRange' // 查询字段名
  },
  {
    type: 'input',
    label: '商品名称',
    val: '',
    placeholder: '请输入商品名称',
    filed: 'title'
  },
  {
    type: 'input',
    label: '货号',
    val: '',
    placeholder: '请输入货号',
    filed: 'productId'
  }
])
const nowTime = new Date()
const oldTime = new Date()
oldTime.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)

searchComponents.value[0].val = [oldTime, nowTime]
searchComponents.value[0].defaultVal = [oldTime, nowTime]
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
function getList() {
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  data.searchCount = true
  data.pageNo = tableForm.page.index
  data.pageSize = tableForm.page.size
  daily(data)
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
        tableForm.listData.forEach(x => {
          x.goodsSort1 = x.goodsSort
        })
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}

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
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
.table_box {
  border-radius: $content_radius;
  margin-top: $content_margin;
  width: 100%;
  background: #fff;
  padding: 22px 24px;
}
</style>

<template>
  <div class="shop_opera">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <!-- <el-button @click="exportFiles">导出</el-button> -->
        <exp_button :asyncFunc="exportFiles">导出</exp_button>
      </template>
    </xm_search>
    <!-- 表格 -->
    <div class="table_box">
      <!-- <el-icon style="margin-left: 8px">
        <i-warning />
      </el-icon>
      <span>
        抖音授权过期或者抖店百应授权过期时，将无法统计直播千次观看成交金额、商品曝光次数、商品点击率、商品访客数、商品点击人数
      </span> -->
      <div class="tips">
        <div class="xm_promptAboveTheTable">
          抖店授权过期或者抖店百应授权过期时，将无法统计直播千次观看成交金额、商品曝光次数、商品点击率、商品访客数、商品点击人数
        </div>
      </div>
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="店铺名称" prop="shopName" width="150">
          <template #default="scope">
            <div>{{ scope.row.shopName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="店铺ID" min-width="120" prop="shopId">
          <template #default="scope">
            {{ scope.row.shopId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="授权状态" min-width="130" prop="shopAuthStatus">
          <template #default="scope">
            <!-- 0-表示抖店百应都未授权 -->
            <div v-if="scope.row.shopAuthStatus == 0">
              <el-icon style="color: #f56c6c">
                <i-circle-close-filled />
              </el-icon>
              {{ '抖店授权' }}
              <el-icon style="color: #f56c6c">
                <i-circle-close-filled />
              </el-icon>
              {{ '百应授权' }}
            </div>
            <!-- 1-抖店授权 -->
            <div v-if="scope.row.shopAuthStatus == 1">
              <el-icon style="color: #67c23a">
                <i-success-filled />
              </el-icon>
              {{ '抖店授权' }}
              <el-icon style="color: #f56c6c">
                <i-circle-close-filled />
              </el-icon>
              {{ '百应授权' }}
            </div>
            <!-- 2-百应授权 -->
            <div v-if="scope.row.shopAuthStatus == 2">
              <el-icon style="color: #f56c6c">
                <i-circle-close-filled />
              </el-icon>
              {{ '抖店授权' }}
              <el-icon style="color: #67c23a">
                <i-success-filled />
              </el-icon>
              {{ '百应授权' }}
            </div>
            <!-- 3-表示抖店百应都已经授权 -->
            <div v-if="scope.row.shopAuthStatus == 3">
              <el-icon style="color: #67c23a">
                <i-success-filled />
              </el-icon>
              {{ '抖店授权' }}
              <el-icon style="color: #67c23a">
                <i-success-filled />
              </el-icon>
              {{ '百应授权' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成交金额(元)" prop="payGmv" min-width="150">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.payGmv || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款金额(元)" prop="refundAmount" min-width="150">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.refundAmount || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交人数" min-width="140" prop="payUv">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.payUv || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交件数" min-width="140" prop="payComboCnt">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.payComboCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交件单价(元)" prop="itemUnitPrice" min-width="170">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.itemUnitPrice || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交订单数" min-width="150" prop="payOrderCnt">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.payOrderCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播千次观看成交金额(元)" prop="gpm" min-width="200">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.gpm || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品曝光次数" min-width="150" prop="productShowCnt">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.productShowCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品点击率" min-width="150" prop="productClickRatio">
          <template #default="scope">
            <div>{{ scope.row.productClickRatio || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column label="商品访客数" min-width="150" prop="productShowUcnt">
          <template #header>
            <div class="column_header">
              <span>商品访客数</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <p>跨天数据直接累计，未去重</p>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 13px; height: 13px; margin-left: 8px; margin-top: 3px"
                />
              </el-tooltip>
            </div>
          </template>

          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.productShowUcnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品点击人数" min-width="150" prop="productClickUcnt">
          <template #header>
            <div class="column_header">
              <span>商品点击人数</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <p>跨天数据直接累计，未去重</p>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 13px; height: 13px; margin-left: 8px; margin-top: 3px"
                />
              </el-tooltip>
            </div>
          </template>
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.productClickUcnt || 0) }}</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { getQuery } from '@/utils/get_query'
// import { exportFile } from '@/utils/exportFile'
import { exportFileV2 } from '@/utils/exportFile'
import { changeTwoDecimal, wanSliceFormat } from '@/utils/tools.js'
import {
  shopTransactionAnalysis,
  exportShopTransactionAnalysisV2
} from '@/api/content_center/shop_operation'
// 筛选条件
const searchComponents = ref([
  {
    type: 'dateRange', // 组件类型
    label: '时间范围', // label展示
    defaultVal: [
      new Date(new Date().setDate(new Date().getDate() - 7)),
      new Date(new Date().setDate(new Date().getDate() - 1))
    ],
    val: [
      new Date(new Date().setDate(new Date().getDate() - 7)),
      new Date(new Date().setDate(new Date().getDate() - 1))
    ], // 默认是近七天的数据
    disabledDate(time) {
      const curDate = new Date().getTime()
      const three = 100 * 24 * 3600 * 1000
      const threeMonths = curDate - three
      return time.getTime() > Date.now() - 24 * 60 * 60 * 1000 || time.getTime() < threeMonths
      // return time.getTime() - 100 * 24 * 60 * 60 * 1000 > Date.now() - 24 * 60 * 60 * 1000
    }, // 禁用日期
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    clearable: 'false',
    filed: 'dateRange' // 查询字段名
  },
  {
    type: 'input',
    label: '店铺名称',
    val: '',
    placeholder: '请输入店铺名称',
    filed: 'shopName'
  }
])

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
function getList(origin) {
  if (origin !== 'export') {
    tableForm.loading = true
  }
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  const params = {
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    shopName: data.shopName,
    startTime: data.startTime.replace(/-/gi, '').substring(0, 8),
    endTime: data.endTime.replace(/-/gi, '').substring(0, 8),
    orderSetting: '',
    searchCount: true
  }

  shopTransactionAnalysis(params)
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
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
getList()
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page = {
    index: 1,
    size: 10
  }
  getList()
  tableForm.loading = false
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}

function exportFiles() {
  getList('export')
  const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
  const param = {
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    shopName: data.shopName,
    startTime: data.startTime.replace(/-/gi, '').substring(0, 8),
    endTime: data.endTime.replace(/-/gi, '').substring(0, 8),
    orderSetting: ''
  }
  return exportFileV2(exportShopTransactionAnalysisV2, param, '店铺成交分析', 'xlsx')
}
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
.el-icon {
  vertical-align: middle;
  // margin-bottom: 3.5px;
  margin: 0 2px 3.5px 0;
  font-size: 20px;
}
.table_box {
  .auth {
    margin-top: 2px;
  }
  .tips {
    margin: 0 0 20px;
  }
  border-radius: $content_radius;
  margin-top: $content_margin;
  width: 100%;
  background: #fff;
  padding: 22px 24px;
}
</style>

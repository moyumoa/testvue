<template>
  <div class="shop_report">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <!-- <el-button @click="exportFiles">导出</el-button>-->
        <exp_button :asyncFunc="exportReportFun">导出</exp_button>
      </template>
    </xm_search>
    <div class="table_box">
      <!-- <div class="btn_box"> -->
      <!-- <el-button
          type="primary"
          class="btn"
          v-loading.fullscreen.lock="fullscreenLoading"
          @click="exportReportFun"
        >
          导出成Excel
        </el-button> -->
      <!-- <exp_button :asyncFunc="exportReportFun">导出成Excel</exp_button>
      </div> -->
      <!-- 表格 -->
      <xm_table
        ref="table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column label="日期" prop="date" width="150">
          <template #default="scope">
            <div>{{ scope.row.date || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="店铺" prop="shopName" min-width="170">
          <template #default="scope">
            <div>{{ scope.row.shopName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="title" min-width="220">
          <template #default="scope">
            <div>{{ scope.row.title || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="当前价格(元)" prop="curPrice" min-width="170">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.curPrice || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="抖店商品类目" prop="category" min-width="190">
          <template #default="scope">
            <div>{{ scope.row.category || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品分组" prop="productGroup" min-width="170">
          <template #default="scope">
            <div>{{ scope.row.productGroup || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交金额(元)" prop="payGmv" min-width="170">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.payGmv || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="退款金额(元)" prop="refundAmount" min-width="170">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.refundAmount || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交订单数" prop="payOrderCnt" min-width="150">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.payOrderCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交件数" prop="payComboCnt" min-width="150">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.payComboCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="件单价(元)" prop="itemUnitPrice" min-width="150">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.itemUnitPrice || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="成交人数" prop="payUv" min-width="150">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.payUv || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="客单价(元)" prop="userUnitPrice" min-width="150">
          <template #default="scope">
            <div>{{ changeTwoDecimal(parseFloat(scope.row.userUnitPrice || 0), false) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="差评数" prop="badEvalCnt" min-width="170">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.badEvalCnt || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="差评率" prop="badEvalRatio" min-width="150">
          <template #default="scope">
            <div>{{ scope.row.badEvalRatio || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column label="商品曝光次数" prop="dhProductShowPv" min-width="170">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.dhProductShowPv || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品曝光人数" prop="dhProductShowUv" min-width="170">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.dhProductShowUv || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品点击人数" prop="dhProductClickUv" min-width="170">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.dhProductClickUv || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播间曝光点击转化率(PV)"
          prop="dhLiveProductClickPvRatio"
          min-width="220"
        >
          <template #default="scope">
            <div>{{ scope.row.dhLiveProductClickPvRatio || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播间点击成交转化率(PV)"
          prop="dhLivePayConversionPvRatio"
          min-width="220"
        >
          <template #default="scope">
            <div>{{ scope.row.dhLivePayConversionPvRatio || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播间曝光点击转化率(UV)"
          prop="dhLiveProductClickUvRatio"
          min-width="220"
        >
          <template #default="scope">
            <div>{{ scope.row.dhLiveProductClickUvRatio || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播间点击成交转化率(UV)"
          prop="dhLivePayConversionUvRatio"
          min-width="220"
        >
          <template #default="scope">
            <div>{{ scope.row.dhLivePayConversionUvRatio || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column label="直播间商品千次曝光成交金额(元)" prop="dhLiveGpm" min-width="250">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.dhLiveGpm || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="近30天累计讲解时长" prop="cumulativeLectureTime" min-width="220">
          <template #default="scope">
            <div>{{ scope.row.cumulativeLectureTime || 0 }}</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <el-dialog v-model="dialogVisible" title="导出文档" width="30%">
      <span>{{ exportMessage }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="confirmClick(confirm)">查看</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { wanSliceFormat, changeTwoDecimal } from '@/utils/tools.js'
import { pageList } from './model/get_shopReport.js'

const vm = getCurrentInstance()
const {
  searchComponents,
  tableForm,
  getList,
  exportReportFun,
  confirmClick,
  exportMessage,
  dialogVisible
  // fullscreenLoading
} = pageList(vm)

// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
resetSearch()
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.table_box {
  margin-top: 16px;
  border-radius: 4px;
  width: 100%;
  background: #fff;
  padding: 22px 24px;
  .btn_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style>

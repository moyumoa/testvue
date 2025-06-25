<template>
  <div>
    <xm_search
      ref="xmSearchRef"
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportReport" ref="expButton">导出</exp_button>
      </template>
      <!-- <div class="search_item"> -->
      <!-- <exp_button :asyncFunc="exportReport">导出</exp_button> -->
      <!--        <el-button class="btn" v-loading.fullscreen.lock="fullscreenLoading" @click="exportReport">-->
      <!--          导出-->
      <!--        </el-button>-->
      <!-- </div> -->
    </xm_search>
    <div class="page_main mt_16">
      <!--      <el-tabs class="tabs" v-model="chooseRule" @tab-click="changeTab">-->
      <!--        <el-tab-pane label="日报" name="1"></el-tab-pane>-->
      <!--        <el-tab-pane label="周报" name="2"></el-tab-pane>-->
      <!--        <el-tab-pane label="月报" name="3"></el-tab-pane>-->
      <!--      </el-tabs>-->
      <!--      <div class="import_box">-->
      <!--        <el-button-->
      <!--          type="primary"-->
      <!--          class="btn"-->
      <!--          v-loading.fullscreen.lock="fullscreenLoading"-->
      <!--          @click="exportReport"-->
      <!--        >-->
      <!--          导出成Excel-->
      <!--        </el-button>-->
      <!--      </div>-->
      <div style="margin-bottom: 20px">
        <div class="xm_promptAboveTheTable">
          每日02:00左右更新前一日除粉丝数与涨粉数外的统计分析数据
        </div>
      </div>
      <xm_table
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getTableData"
        :maxTableHeight="tableHeight"
        :showSummary="true"
        sumText="汇总"
        :summaryMethod="summaryMethod"
      >
        <el-table-column label="统计日期" prop="date" width="190">
          <template #default="scope">
            <div>{{ scope.row.date || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="有效矩阵号数" prop="validCnt" width="190">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.validCnt || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="有效矩阵号数增量" prop="addValidCnt" width="190">
          <template v-slot="{ row }">
            <div>
              {{ row.addValidCnt < 0 ? '' : '+' }}{{ wanSliceFormat(row.addValidCnt || '0') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="涨粉数" prop="fansIncrement" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.fansIncrement || 0) }}</div>
          </template>
        </el-table-column>
        <!-- v-if="chooseRule == 1" -->
        <el-table-column label="总粉丝数" prop="fansCount" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.fansCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="线索数" v-if="brandViewMode === 2" prop="relatedInfos" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.relatedInfos || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="总销售额(元)"
          prop="totalSaleAccount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.totalSaleAccount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="总销售量"
          prop="totalSaleNum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.totalSaleNum || 0) }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column
          label="平均标价折扣率"
          prop="avgPriceDiscountRate"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.avgPriceDiscountRate || '0' }}</div>
          </template>
        </el-table-column> -->
        <el-table-column label="直播总场次" prop="liveBroadcast" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveBroadcast || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播总时长" prop="liveDuration" width="190" class-name="isTime">
          <template #default="scope">
            <div>{{ scope.row.liveDuration || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播场均时长"
          prop="avgRoomLiveTimeIncrement"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.avgRoomLiveTimeIncrement || '0' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播曝光人次" prop="roomWatchPv" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomWatchPv || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播曝光人数" prop="roomWatchPeople" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomWatchPeople || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播观看人次" prop="liveWatchTimes" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveWatchTimes || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播观看人数" prop="liveWatchUv" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveWatchUv || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播新加团人数" prop="newGroupNumSum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.newGroupNumSum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播自然UV" prop="natureUvSum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.natureUvSum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播付费UV" prop="payedUvSum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.payedUvSum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播人气峰值" prop="maxOnlineNum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.maxOnlineNum || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="直播平均在线人数" prop="liveAvgOnlineUv" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveAvgOnlineUv || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播人均看播时长"
          prop="liveAvgWatchDuration"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.liveAvgWatchDuration || '0' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播销售额(元)"
          prop="liveSaleAccount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveSaleAccount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播销售量"
          prop="liveSaleNum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveSaleNum || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播订单数"
          prop="roomSalesOrders"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomSalesOrders || '0') }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播UV价值(元)"
          prop="liveUvValue"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveUvValue || '0') }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播在售商品数"
          prop="roomProductNumSum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomProductNumSum || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播动销商品数"
          prop="roomPayedProductNumSum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomPayedProductNumSum || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播千次观看成交额(元)"
          prop="gpm"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.gpm || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播单小时成交额(元)"
          prop="hourAmount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.hourAmount || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播退款金额(元)"
          prop="refundSalesMoney"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.refundSalesMoney || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播退款件数"
          prop="refundSalesGoods"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.refundSalesGoods || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播商品点击人数"
          prop="productClickUvSum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.productClickUvSum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播商品点击率(次数)"
          prop="avgClickGoodsRateFrequency"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.avgClickGoodsRateFrequency || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播商品点击率(人数)"
          prop="avgClickGoodsRatePeople"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.avgClickGoodsRatePeople || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播看播成交转化率"
          prop="avgKanBoChengJiaoRatePeople"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.avgKanBoChengJiaoRatePeople || '0' }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播点击成交转化率"
          prop="avgClickPayRatePeople"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.avgClickPayRatePeople || '0' }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播客单价(元)"
          prop="keDanJia"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.keDanJia || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播件均价(元)"
          prop="avgProductPrice"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.avgProductPrice || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播连带率"
          prop="multiProductRate"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.multiProductRate || '0' }}</div>
          </template>
        </el-table-column>

        <el-table-column
          label="直播曝光进入转化率"
          prop="exposureIn"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.exposureIn || '0' }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播曝光成交转化率"
          prop="exposureDone"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.exposureDone || '0' }}%</div>
          </template>
        </el-table-column>
        <el-table-column label="直播涨粉数" prop="liveFansIncrement" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveFansIncrement || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播点赞数" prop="liveDiggIncrement" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveDiggIncrement || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播评论数" prop="roomCommentNum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomCommentNum || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播互动率"
          prop="liveRoomInteractionRate"
          width="190"
          class-name="isRate"
        >
          <template #default="scope">
            <div>{{ scope.row.liveRoomInteractionRate || '0' }}%</div>
          </template>
        </el-table-column>

        <!-- <el-table-column label="直播场均销售量" prop="liveAvgSaleNum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.liveAvgSaleNum || 0) }}</div>
          </template>
        </el-table-column> -->

        <el-table-column label="视频数" prop="videoCount" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoCount || 0) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="视频播放数" prop="videoPlayCount" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoPlayCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="视频点赞数" prop="videoDiggCount" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoDiggCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="视频分享数" prop="videoShareCount" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoShareCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="视频评论数" prop="videoCommentCount" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoCommentCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频销售额(元)"
          prop="videoSaleAccount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoSaleAccount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频销售量"
          prop="videoSaleNum"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoSaleNum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频完播率"
          prop="videoPlayOverRate"
          width="190"
          class-name="isRate"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ scope.row.videoPlayOverRate || 0 }}%</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频平均观看时长"
          prop="videoAvgWatchDuration"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.videoAvgWatchDuration || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频购物车曝光次数"
          prop="videoCartExposureTimes"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoCartExposureTimes || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频千次观看成交额(元)"
          prop="videoGpm"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoGpm || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频引流直播间金额(元)"
          prop="videoDrainLiveAmount"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoDrainLiveAmount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频引流直播间次数"
          prop="videoDrainLiveTimes"
          width="190"
          v-if="brandViewMode === 1"
        >
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.videoDrainLiveTimes || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="视频直播入口点击率"
          prop="videoLiveEntranceClickRate"
          width="190"
          class-name="isRate"
        >
          <template #default="scope">
            <div>{{ scope.row.videoLiveEntranceClickRate || 0 }}%</div>
          </template>
        </el-table-column>

        <!-- <el-table-column label="商品卡销售额(元)" prop="otherSalesMoney" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.otherSalesMoney || 0) }}</div>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="操作" prop width="60" fixed="right" align="right">
          <template #default>
            <el-button type="text" style="padding: 0" @click="togglePart2">详情</el-button>
          </template>
        </el-table-column>-->
      </xm_table>
    </div>
    <el-dialog v-model="dialogVisible" title="导出文档" width="30%">
      <span>{{ exportMessage }}</span>
      <template #footer>
        <span class="dialog-footer">
          <!-- <el-button @click="dialogVisible = false">Cancel</el-button> -->
          <el-button type="primary" @click="confirmClick(confirm)">查看</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { handleGetList } from './get_list1'
import { wanSliceFormat } from '@/utils/tools.js'
import { defineEmits } from 'vue'
import { getQuery } from '@/utils/get_query.js'
import { useStore } from 'vuex'
// import { ElMessage } from 'element-plus'

const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const props = defineProps({
  tableHeight: {
    type: Number,
    default: null
  }
})
const tableHeight = toRef(props, 'tableHeight')
const emits = defineEmits(['operateReportSearchChange'])
const {
  searchComponents,
  tableForm,
  dialogVisible,
  exportMessage,
  resetSearch,
  // rangeTimeChange,
  exportReport,
  confirmClick,
  getList,
  getSummary
  // getAccountList
} = handleGetList()
onMounted(() => {
  // getAccountList()
  getList()
  getSummary()
})
const expButton = ref(null)

const xmSearchRef = ref()

function querySearch() {
  const time = toRaw(searchComponents.value.find(item => item.type === 'dateRange').val)
  const range = time[1].getTime() - time[0].getTime()
  if (range > 6 * 24 * 60 * 60 * 1000) {
    // ElMessage.warning('时间跨度超过7天，请导出报表查看')
    // 不能查询的时候自动帮用户导出数据
    expButton.value?.showTipDialog(7)
    return
  }
  tableForm.page.index = 1
  getList()
  getSummary()
  const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
  info.oldJiagou = xmSearchRef.value?.getMoreInfo()
  emits('operateReportSearchChange', info)
}

function getTableData() {
  getList()
  const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
  info.oldJiagou = xmSearchRef.value?.getMoreInfo()
  emits('operateReportSearchChange', info)
}

function summaryMethod({ columns, data }) {
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '汇总'
      return
    }
    if (['validCnt', 'addValidCnt', 'fansCount'].indexOf(column.property) !== -1) {
      sums[index] = '-'
      return
    }
    const res = tableForm.summaryData[column.property] || 0
    sums[index] =
      column.className === 'isRate'
        ? res + '%'
        : column.className === 'isTime'
        ? res
        : wanSliceFormat(res)
    return sums
  })
  return sums
}
</script>

<style lang="scss" scoped>
.page_main {
  position: relative;
  padding-bottom: 11px;

  .import_box {
    position: absolute;
    right: 24px;
    top: 11px;

    .btn {
      margin-left: 24px;
    }
  }
}

// :deep(.el-table__footer .cell) {
//   padding-left: 14px !important;
// }
</style>

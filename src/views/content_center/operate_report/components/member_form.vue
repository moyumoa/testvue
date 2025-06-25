<template>
  <div>
    <xm_search
      :searchComponents="searchComponents"
      :useOwnReset="true"
      @getData="querySearch"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportReport" ref="expButton">导出</exp_button>
      </template>
    </xm_search>
    <div class="page_main mt_16">
      <div class="head_wrap_tip">
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20230529xhu7v.png"
          alt=""
          class="rules_img"
        />
        每日02:00左右更新前一日除粉丝数与涨粉数外的统计分析数据
      </div>
      <xm_table
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        :maxTableHeight="props.tableHeight"
        v-model:page="tableForm.page"
        @getTableData="getList"
        :showSummary="true"
        sumText="汇总"
        :summaryMethod="summaryMethod"
      >
        <el-table-column label="成员信息" prop="operatorName" width="190">
          <template v-slot="{ row }">
            <table_column_matrix_account
              :info="{
                dyAvatar: row.operatorHead,
                dyName: row.operatorName,
                telephone: row.operatorPhone
              }"
              showPhone
              phoneKey="telephone"
              :showAvatar="true"
              :showDyNum="false"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="运营矩阵号" prop="accountUserVOList" width="190">
          <template #default="{ row }">
            <div class="photos" v-if="row.accountUserVOList && row.accountUserVOList.length > 0">
              <template v-for="(item, index) in row.accountUserVOList" :key="item.operatorId">
                <el-tooltip
                  v-if="index < 3"
                  effect="dark"
                  :content="item.dyNickname"
                  placement="top"
                >
                  <div class="photos_item" :class="{ g_failure: isInvalid(item) }">
                    <img :src="item.dyHeadUrl" alt />
                    <div
                      :class="[`xm_platformIcon_${item.platform}`]"
                      style="width: 16px; height: 16px"
                    ></div>
                  </div>
                </el-tooltip>
              </template>
              <div
                class="photo_more flex_center"
                @click="openOtherAccount(row.accountUserVOList)"
                v-if="row.accountUserVOList.length > 3"
              >
                +{{ row.accountUserVOList.length - 3 }}
              </div>
            </div>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column label="总粉丝数" prop="fansCount" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.fansCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="涨粉数" prop="fansIncrement" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.fansIncrement || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="线索数" v-if="brandViewMode === 2" prop="relatedInfos" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.relatedInfos || 0) }}</div>
          </template>
        </el-table-column>
        <!-- 兼容模式特有 start   -->
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
        <!-- 兼容模式特有 end   -->
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
        <!-- 兼容模式特有 start   -->
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
        <!-- 兼容模式特有 end-->
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
        <!-- 兼容模式特有 start   -->
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
        <!-- 兼容模式特有 end   -->

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
        <el-table-column label="直播总场次" prop="roomSiteCount" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomSiteCount || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播总时长"
          prop="roomLiveTimeIncrement"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.roomLiveTimeIncrement || 0 }}</div>
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
        <el-table-column label="直播观看人次" prop="roomWatchTimes" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomWatchTimes || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="直播观看人数" prop="roomWatchUv" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.roomWatchUv || 0) }}</div>
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
        <el-table-column label="直播平均在线人数" prop="avgOnlineNum" width="190">
          <template #default="scope">
            <div>{{ wanSliceFormat(scope.row.avgOnlineNum || 0) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="直播人均看播时长"
          prop="avgRoomWatchDuration"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.avgRoomWatchDuration || '0' }}</div>
          </template>
        </el-table-column>
        <!-- 兼容模式特有 start   -->
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
        <!-- 兼容模式特有 end   -->
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
      </xm_table>
    </div>
    <!--运营矩阵号全部弹窗    -->
    <el-dialog
      v-model="showDialog"
      custom-class="hide_footer_line "
      title="运营矩阵号"
      width="300px"
    >
      <div class="photos_dialog">
        <div class="photo_item" v-for="item in accountList" :key="item.operatorId">
          <div :class="{ g_failure: isInvalid(item) }" style="position: relative" class="big">
            <img :src="item.dyHeadUrl" alt />
            <div
              :class="[`xm_platformIcon_${item.platform}`]"
              style="width: 20px; height: 20px"
            ></div>
          </div>
          <span style="margin-left: 16px">{{ item.dyNickname }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { setBusinessChooseParam } from '@/utils/search.js'

import { wanSliceFormat } from '@/utils/tools.js'
import { defineEmits } from 'vue'
import { getQuery } from '@/utils/get_query.js'
import { useStore } from 'vuex'
// import {ElMessage} from 'element-plus'
import Track from '@/utils/tracking'
import { exportFileV2 } from '@/utils/exportFile'
import {
  getMemberList,
  memberReportExport,
  getMemberSummary
} from '@/api/content_center/operate_report'

const props = defineProps({
  tableHeight: {
    type: Number,
    default: null
  }
})
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)

const searchComponents = ref([
  {
    type: 'dateRange',
    label: '时间范围',
    val: [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    ],
    defaultVal: [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    ],
    disabledDate: time => {
      return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
    },
    filed: 'employeeName',
    placeholder: ['开始时间', '结束时间'],
    clearable: 'false'
  },
  {
    type: 'chooseDept',
    label: '矩阵号部门',
    val: [],
    filed: 'areaIds',
    multiple: true,
    isUsePermission: true
  },
  {
    type: 'input',
    label: '成员姓名',
    val: '',
    placeholder: '请输入成员姓名',
    filed: 'employeeName'
  }
])
// 更新业务主体
const initSearch = function () {
  const list = setBusinessChooseParam()
  searchComponents.value = searchComponents.value.concat(list)
}
initSearch()

const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 10
  },
  summaryData: {}
})
// 查询
const querySearch = () => {
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
  info.oldJiagou = searchComponents.value[1].val
  emits('operateReportSearchChange', info)
}
// 重置
const resetSearch = () => {
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
  getSummary()
}
// 导出
const exportReport = () => {
  Track.clickBtn(111)
  const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
  info.useOperation = 1
  info.isValid = 1
  info.reportType = 1
  return exportFileV2(memberReportExport, info, '汇总报表', 'xlsx')
}
const emits = defineEmits(['operateReportSearchChange'])

const expButton = ref(null)
// 获取表格列表信息
const getList = () => {
  tableForm.loading = true
  const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
  info.pageNo = tableForm.page.index
  info.pageSize = tableForm.page.size
  info.useOperation = 1
  info.reportType = 1
  getMemberList(info)
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total
      }
    })
    .finally(() => {
      tableForm.loading = false
    })
}
// 获取汇总信息
const getSummary = () => {
  const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
  info.pageNo = tableForm.page.index
  info.pageSize = tableForm.page.size
  info.useOperation = 1
  info.reportType = 1
  getMemberSummary(info).then(res => {
    if (res.code === 0) {
      tableForm.summaryData = res.data
    }
  })
}
// 点击查询
const summaryMethod = ({ columns, data }) => {
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '汇总'
      return
    }
    if (['operatorName', 'accountUserVOList'].indexOf(column.property) !== -1) {
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
// 矩阵号是否授权有效
const isInvalid = item => {
  // 0 有效 1无效 非0都为无效
  return item.authStatus !== 0
}
const showDialog = ref(false)
const accountList = ref([])
// 预览其余矩阵号
const openOtherAccount = list => {
  accountList.value = list
  showDialog.value = true
}
onBeforeMount(() => {
  getList()
  getSummary()
})
</script>

<style lang="scss" scoped>
.head_wrap_tip {
  //position: absolute;
  display: flex;
  align-items: center;
  height: 48px;
  background: #eaedfa;
  border-radius: 4px;
  border: 1px solid #889cff;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #323233;
  margin-bottom: 16px;

  .rules_img {
    width: 16px;
    height: 16px;
    min-width: 16px;
    margin-right: 8px;
    margin-left: 16px;
  }
}
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

  .photos {
    display: flex;
    position: relative;
    .photos_item {
      margin-right: 6px;
      position: relative;

      > img {
        width: 32px;
        height: 32px;
        object-fit: cover;
        border-radius: 50%;

        vertical-align: middle;
      }
    }

    .photo_more {
      width: 32px;
      height: 32px;
      background: #eff2f8;
      border-radius: 50%;
      font-weight: 500;
      color: #364fcd;
      font-size: 12px;
      cursor: pointer;
    }
  }
}

.photos_dialog {
  display: flex;
  flex-direction: column;

  .photo_item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    position: relative;
    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
  }
}
</style>

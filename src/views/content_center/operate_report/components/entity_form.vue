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
        v-model:page="tableForm.page"
        :maxTableHeight="props.tableHeight"
        @getTableData="getList"
      >
        <el-table-column
          :label="props.isGroup ? props.label + '分组名称' : props.label + '名称'"
          prop="date"
          width="210"
        >
          <template #default="{ row }">
            <div class="store_name_wrapper">
              <EntityIcon :type="row.principalType"></EntityIcon>
              <el-tooltip :content="row.deptName" placement="right-start">
                <div style="margin-left: 4px" class="store_name">{{ row.deptName }}</div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成员数" prop="userCount" width="190">
          <template v-slot="{ row }">
            <div>
              {{ wanSliceFormat(row.userCount || '0') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="矩阵号总数" prop="accountCount" width="190">
          <template v-slot="{ row }">
            <div>
              {{ wanSliceFormat(row.accountCount || '0') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="有效矩阵号数" prop="authValidAccountCount" width="190">
          <template v-slot="{ row }">
            <div>{{ wanSliceFormat(row.authValidAccountCount || '0') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="活跃矩阵号数" prop="activeAccountCount" width="190">
          <template v-slot="{ row }">
            <div>
              {{ wanSliceFormat(row.activeAccountCount || '0') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="潜客活跃矩阵号数" prop="clientActiveAccountCount" width="190">
          <template v-slot="{ row }">
            <div>
              {{ wanSliceFormat(row.clientActiveAccountCount || '0') }}
            </div>
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
          prop="roomAvgWatchDuration"
          width="190"
          class-name="isTime"
        >
          <template #default="scope">
            <div>{{ scope.row.roomAvgWatchDuration || '0' }}</div>
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
  </div>
</template>

<script setup>
import { wanSliceFormat } from '@/utils/tools.js'
import { defineEmits } from 'vue'
import { getQuery } from '@/utils/get_query.js'
import { useStore } from 'vuex'
// import { ElMessage } from 'element-plus'
import Track from '@/utils/tracking'
import { exportFileV2 } from '@/utils/exportFile'
import { getPrincipalList, principalReportExport } from '@/api/content_center/operate_report'
import EntityIcon from '@/views/system/business_entity/components/entity_icon.vue'

const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)

const props = defineProps({
  label: {
    type: String,
    default: '门店'
  },
  type: Number,
  tableHeight: {
    type: Number,
    default: null
  },
  isGroup: {
    type: Boolean,
    default: false
  }
})
console.log('props.label', props.label)
console.log('props.type', props.type)
console.log('props.tableHeight', props.tableHeight)

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
    filed: 'timeRange',
    placeholder: ['开始时间', '结束时间'],
    clearable: 'false'
  },
  {
    type: 'input',
    label: props.label + '名称',
    val: '',
    placeholder: `请输入${props.label}名称`,
    filed: 'principalName'
  }
])
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 10
  }
})
// 更新筛选项
function initSearch() {
  return new Promise(resolve => {
    if (props.isGroup) {
      // 有分组筛选项就是下拉
      const oneBusiness = {
        type: 'chooseBusiness',
        principalType: Number(props.type),
        label: props.isGroup ? `${props.label}分组名称` : `${props.label}名称`,
        placeholder: `请选择${props.label}`,
        isCheckAll: false,
        ids: [],
        idFiled: `businessIds`,
        checkAllFiled: `isAllSelect`,
        multiple: true,
        isGetId: true,
        isGroupSelect: true
      }
      searchComponents.value[1] = oneBusiness
    } else {
      searchComponents.value[1].filed = 'principalName'
    }
    resolve()
  })
}
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
  info.reportType = '1'
  info.principalType = props.type
  if (props.isGroup) {
    info.groupModel = 1
    // info.principalName = props.label
  }
  return exportFileV2(principalReportExport, info, '汇总报表', 'xlsx')
}
const emits = defineEmits(['operateReportSearchChange'])

const expButton = ref(null)
// 获取表格列表信息
const getList = () => {
  tableForm.loading = true
  const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
  info.pageNo = tableForm.page.index
  info.pageSize = tableForm.page.size
  info.principalType = props.type
  info.reportType = '1'
  info.useOperation = 1

  if (props.isGroup) {
    info.groupModel = 1
    // info.principalName = props.label
  }
  getPrincipalList(info)
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
  info.useOperation = 1
  info.pageNo = tableForm.page.index
  info.pageSize = tableForm.page.size
  info.reportType = '1'
  info.principalType = props.type

  if (props.isGroup) {
    info.groupModel = 1
    // info.principalName = props.label
  }
}
onBeforeMount(async () => {
  tableForm.loading = true
  await initSearch()
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

  .store_name_wrapper {
    display: flex;
    align-items: center;
    .store_name {
      mix-width: 150px;
      @include mult_line(1);
    }

    .store_icon {
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
  }
  .import_box {
    position: absolute;
    right: 24px;
    top: 11px;

    .btn {
      margin-left: 24px;
    }
  }
}
:deep(.el-table__footer > tbody > tr > td) {
  &:nth-of-type(1) {
    width: 210px;
  }
}
</style>

<template>
  <div class="team_data">
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    >
      <template #searchBtn>
        <exp_button :asyncFunc="exportFiles" :isExport="true">导出</exp_button>
      </template>
    </xm_search>
    <!-- 表格 -->
    <div class="table_box">
      <xm_table
        ref="table"
        tableType="live"
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="beforeGetList"
      >
        <el-table-column label="订单编号" prop="orderId">
          <template #default="scope">
            <div>{{ scope.row.orderId || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="手机号">
          <template #header>
            <div class="column_header">
              <span>手机号</span>
              <el-tooltip
                popper-class="tooltip-class"
                placement="top"
                :style="{ 'margin-left': '4px' }"
              >
                <template #content>
                  <div>
                    <p>无法获取手机号的情况</p>
                    <p>1、创建商品时未要求填写手机号</p>
                    <p>2、抖音来客未开通线索经营能力</p>
                    <p>3、获取手机号前订单已退款</p>
                  </div>
                </template>
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
          <template v-slot="{ row }">
            <table_column_phone :phone="row.phone" v-if="row.phone && row.phone !== '-'" />
            <span v-else>{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源商家" prop="name">
          <template #default="scope">
            <div>{{ scope.row.name || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="来源矩阵号">
          <template #default="scope">
            <div class="form_max_warp">
              <div class="name flex_form">
                <span class="text">{{ scope.row.dyNickname || '-' }}</span>
                <span class="label_box" v-if="scope.row.saleUserRole">
                  {{ scope.row.saleUserRole }}
                </span>
              </div>
              <div
                class="form flex_form"
                :class="{
                  form_url: scope.row.attributeType == 1 || scope.row.attributeType == 2
                }"
                v-if="scope.row.attributeType"
                @click="toDel(scope.row)"
              >
                <img
                  v-if="scope.row.attributeType == 1"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240122v3cfv.png"
                  alt=""
                  class="icon"
                />
                <img
                  v-if="scope.row.attributeType == 2"
                  src="https://tagvv-1256030678.file.myqcloud.com/20240122n9fsd.png"
                  alt=""
                  class="icon"
                />
                <span class="text_saleChannel">
                  {{
                    scope.row.attributeType == 1
                      ? '视频'
                      : scope.row.attributeType == 2
                      ? '直播'
                      : '-'
                  }}
                </span>
                <img
                  src="https://tagvv-1256030678.file.myqcloud.com/2024012251vgq.png"
                  alt=""
                  class="icon_r"
                  v-if="scope.row.videoShareUrl && scope.row.videoShareUrl.startsWith('https://')"
                />
              </div>
              <div v-else>-</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" prop="skuName">
          <template #default="scope">
            <div>{{ scope.row.skuName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="售卖金额" prop="originalAmount">
          <template #default="scope">
            <div>{{ '￥' + changeTwoDecimal(scope.row.originalAmount) || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="实付金额" prop="payAmount">
          <template #default="scope">
            <div>{{ '￥' + changeTwoDecimal(scope.row.payAmount) || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" prop="orderStatusStr">
          <template #default="scope">
            <div class="round_warp">
              <div
                class="round"
                :class="{
                  orderStatus_101: scope.row.orderStatus == 101,
                  orderStatus_200: scope.row.orderStatus == 200,
                  orderStatus_201: scope.row.orderStatus == 201
                }"
              ></div>
              {{ scope.row.orderStatusStr || '--' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单创建时间" prop="createOrderTime">
          <template #default="scope">
            <div>{{ scope.row.createOrderTime || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="订单支付时间" prop="payTime">
          <template #default="scope">
            <div>{{ scope.row.payTime || '--' }}</div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { pageList } from './model/index'
import { changeTwoDecimal, throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'

const { searchComponents, getList, tableForm, exportFiles } = pageList('order')
const router = useRouter()

const toDel = throttle(function (row) {
  if (row.attributeType === 1) {
    router.push({
      path: '/content_center/content_manage/manage_detail',
      query: {
        itemId: row.contentId
      }
    })
  }
  if (row.attributeType === 2) {
    router.push(`/content_center/live_center/detail?roomId=${row.contentId}&dyOpenId=${row.openId}`)
  }
}, 500)

// 重置
function resetSearch() {
  tableForm.page.index = 1
  tableForm.page.size = 10
  beforeGetList()
}
// 查询
function searchList() {
  tableForm.page.index = 1
  beforeGetList()
}
function beforeGetList() {
  tableForm.loading = true
  getList()
}
onMounted(() => {
  beforeGetList()
})
</script>

<style lang="scss" scoped>
.team_data {
  .table_box {
    border-radius: 4px;
    margin-top: 16px;
    width: 100%;
    background: #fff;
    padding: 22px 24px;
    .round_warp {
      display: flex;
      align-items: center;
      .round {
        width: 8px;
        height: 8px;
        margin-right: 6px;
        border-radius: 50%;
        background: #bfc4cd;
      }
      .orderStatus_101 {
        background: #ff0101;
      }
      .orderStatus_200 {
        background: #52c41a;
      }
      .orderStatus_201 {
        background: #f3871c;
      }
    }
    .form_max_warp {
      .flex_form {
        display: flex;
        align-items: center;
      }

      .form {
        margin-top: 6px;
      }
      .form_url {
        cursor: pointer;
        .text_saleChannel {
          color: #364fcd;
        }
      }

      .text {
        font-size: 14px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        color: #323233;
      }
      .label_box {
        white-space: nowrap;
        margin-left: 8px;
        background: rgba(54, 79, 205, 0.1);
        border-radius: 2px;
        border: 1px solid #364fcd;
        font-size: 12px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        color: #364fcd;
        line-height: 18px;
        padding: 0 4px;
      }
      .icon {
        width: 16px;
        height: 16px;
        min-width: 16px;
        margin-right: 4px;
      }
      .text_saleChannel {
        font-size: 14px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        line-height: 20px;
      }
      .icon_r {
        width: 14px;
        height: 14px;
        min-width: 14px;
        margin-left: 2px;
      }
    }
  }
}
</style>

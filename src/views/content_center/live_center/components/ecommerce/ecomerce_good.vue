<template>
  <div class="one_box">
    <div class="title_box" style="margin-bottom: 24px">
      <div class="title">
        商品信息
        <el-tooltip placement="right">
          <template #content>
            当数据显示为“-”，需授权百应获取查看；
            <br />
            没有授权百应仅显示已付款的商品，授权百应后可显示直播间上架商品
          </template>
          <i class="iconfont icon-wenhao" style="color: #909399; margin-left: 4px"></i>
        </el-tooltip>
      </div>
    </div>
    <xm_table
      class="pic_table"
      v-loading="tableForm.loading"
      :data="tableForm.listData"
      v-model:page="tableForm.page"
      @getTableData="getList"
      @sort-change="sortChange"
      :default-sort="{
        prop: 'pay_in_live_order_product_gmv',
        order: 'descending'
      }"
    >
      <el-table-column min-width="180" label="商品">
        <template #default="scope">
          <div class="good_box" style="display: flex">
            <img v-if="scope.row.imageUri" class="good_cover" :src="scope.row.imageUri" alt="" />
            <img
              v-else
              class="good_cover"
              src="https://tagvv-1256030678.file.myqcloud.com/img/video4296897723694437335.jpg"
              alt=""
            />
            <div class="good_content">
              <!-- <el-tooltip effect="dark" placement="top-start" v-if="scope.row.title">
                <template #content>
                  <div style="max-width: 300px">
                    {{ scope.row.title || '--' }}
                  </div>
                </template> -->
              <div class="content_text row_overflow">
                {{ scope.row.title || '--' }}
              </div>
              <!-- </el-tooltip>
              <div v-else>--</div> -->
              <div class="content_price">
                ¥{{ changeTwoDecimal(scope.row.currMinPrice || 0, true) }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        sortable="custom"
        prop="pay_in_live_order_product_cnt"
        label="销售量"
      >
        <template #default="scope">
          {{ wanSliceFormat(scope.row.payInLiveOrderProductCnt || 0) }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        sortable="custom"
        prop="pay_in_live_order_product_gmv"
        label="销售额"
      >
        <template #default="scope">
          ¥{{ changeTwoDecimal(scope.row.payInLiveOrderProductGmv || 0, true) }}
        </template>
      </el-table-column>
      <el-table-column min-width="110" sortable="custom" prop="product_click_ucnt" label="点击人数">
        <template #default="scope">
          <span v-if="haveBy">
            {{ wanSliceFormat(scope.row.productClickUcnt || 0) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="160"
        sortable="custom"
        prop="product_click_in_live_rate"
        label="曝光-点击转化率"
      >
        <template #default="scope">
          <span v-if="haveBy">{{ scope.row.productClickInLiveRate || 0 }}%</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="160"
        sortable="custom"
        prop="product_click_to_pay_rate"
        label="点击-成交转化率"
      >
        <template #default="scope">
          <span v-if="haveBy">{{ scope.row.productClickToPayRate || 0 }}%</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="160"
        sortable="custom"
        prop="prod_show_to_pay_ucnt_rate_in_live"
        label="曝光-成交转化率"
      >
        <template #default="scope">
          <span v-if="haveBy">{{ scope.row.prodShowToPayUcntRateInLive || 0 }}%</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column min-width="160" prop="prod_show_to_pay_ucnt_rate_in_live" label="标价折扣">
        <template #default="scope">
          <span v-if="haveBy">{{ scope.row.discount ? scope.row.discount + '折' : '' }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </xm_table>
  </div>
</template>
<script setup>
import { wanSliceFormat, changeTwoDecimal } from '@/utils/tools.js'
import { pageList } from '../../model/ecommerce_data/get_good.js'
const props = defineProps({
  roomId: {
    type: String,
    default: '',
    required: true
  },
  haveBy: {
    type: Boolean,
    default: false
  }
})
// 订单详情
const { tableForm, getList, resetList, sortChange } = pageList(props.roomId)
resetList()
</script>
<style lang="scss" scoped>
@import '../../../components/css/page.scss';
.content_text {
  max-width: 100%;
  width: max-content;
}
.good_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .good_cover {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    object-fit: cover;
    margin-right: 6px;
  }
  .good_content {
    width: calc(100% - 66px);
    .content_price {
      margin-top: 8px;
      color: #909399;
    }
  }
}
.one_box {
  background: #fff;
  border-radius: $content_radius;
  border-radius: 4px;
  padding: 22px 24px;
  margin-bottom: $content_margin;
  .title_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

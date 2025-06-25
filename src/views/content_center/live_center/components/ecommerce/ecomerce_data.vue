<template>
  <div class="ecommerceData">
    <!-- 数据概览 -->
    <div class="one_box">
      <div class="title_box" style="margin-bottom: 24px">
        <div class="title">数据概览</div>
      </div>
      <!-- <div class="title_mark">直播带货表现</div> -->
      <div class="num_box">
        <div class="one_num">
          <div class="num1">
            {{ dataForm.loading ? '--' : wanSliceFormat(dataForm.sellAmount || 0) }}
          </div>
          <div class="num2">销售额(元)</div>
        </div>
        <div class="one_num">
          <div class="num1">
            {{ dataForm.loading ? '--' : wanSliceFormat(dataForm.sellNum || 0) }}
          </div>
          <div class="num2">销售量</div>
        </div>
        <!-- <div class="one_num">
          <div class="num1">
            {{ dataForm.loading ? '--' : wanSliceFormat(dataForm.clueNum || 0) }}
          </div>
          <div class="num2">线索数</div>
        </div> -->
      </div>
    </div>
    <ecomerceGood :roomId="roomId" :haveBy="haveBy"></ecomerceGood>
    <!-- 订单详情 -->
    <ecomerceTable :roomId="roomId"></ecomerceTable>
  </div>
</template>
<script setup>
import ecomerceGood from './ecomerce_good.vue'
import ecomerceTable from './ecomerce_table.vue'
import { wanSliceFormat } from '@/utils/tools.js'
import { pageData } from '../../model/ecommerce_data/get_data.js'
defineComponent(ecomerceTable, ecomerceGood)
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
const haveBy = toRef(props, 'haveBy')
const roomId = toRef(props, 'roomId')
// 数据概览
const { dataForm, getData } = pageData(props.roomId, haveBy.value)
onMounted(() => {
  getData()
})
</script>
<style lang="scss" scoped>
@import '../../../components/css/page.scss';
.ecommerceData {
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
      .rule_box {
        flex: 1;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        .one_rule {
          padding-left: 8px;
          cursor: pointer;
          font-size: 14px;

          font-weight: 500;
          color: #909399;
          line-height: 20px;
          &:first-child {
            padding-right: 8px;
          }
        }
        .one_rule + .one_rule {
          border-left: 1px solid #e8e8e8;
        }
        .choose_rule {
          color: $theme_color;
        }
      }
    }
    .title_mark {
      font-size: 14px;

      font-weight: 400;
      color: #909399;
      line-height: 20px;
      margin: 16px 0;
    }
    .num_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      .one_num {
        width: calc((100% - 32px) / 2);
        padding: 20px 0;

        background: #f6f7f8;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .num1 {
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 22px;
        }
        .num2 {
          margin-top: 6px;
          font-size: 12px;

          font-weight: 400;
          color: #909399;
          line-height: 17px;
        }
      }
    }
  }
}
</style>

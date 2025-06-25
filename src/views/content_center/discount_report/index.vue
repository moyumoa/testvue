<template>
  <div>
    <el-tabs class="tab_box hide_underline" v-model="data.chooseType">
      <el-tab-pane label="抖店商品" name="shop">
        <shop-goods-report v-if="data.chooseType == 'shop'"></shop-goods-report>
      </el-tab-pane>
      <el-tab-pane label="聚合商品" name="aggregate">
        <aggregateGoodsReport v-if="data.chooseType == 'aggregate'"></aggregateGoodsReport>
      </el-tab-pane>
      <!-- <el-tab-pane label="矩阵号商品折扣" name="account">
        <account-goods-report v-if="data.chooseType == 'account'"></account-goods-report>
      </el-tab-pane> -->
    </el-tabs>

    <!-- <shop-goods-report></shop-goods-report> -->
  </div>
</template>

<script setup>
// import liveGoodsReport from './live_goods_report.vue'
// import accountGoodsReport from './account_goods_report.vue'
import shopGoodsReport from './shop_goods_report.vue'
import aggregateGoodsReport from './aggregate_goods_report.vue'
const data = reactive({
  chooseType: 'shop'
})
</script>

<style lang="scss" scoped>
@import '../components/css/page.scss';
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  border-radius: $content-radius;
}
.btn_box {
  position: absolute;
  right: 24px;
  top: 0;
  width: 100px;
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  :deep(.el-link--inner) {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    img {
      width: 14px;
      height: 14px;
      margin-left: 2px;
    }
  }
}
</style>

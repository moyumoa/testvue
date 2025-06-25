<template>
  <div class="guest_list">
    <el-tabs class="tab_box hide_underline" v-model="chooseRule" @tab-click="changeRule">
      <el-tab-pane label="订单" name="orderList">
        <orderList v-if="chooseRule == 'orderList'"></orderList>
      </el-tab-pane>
      <el-tab-pane label="券" name="couponsList">
        <couponsList v-if="chooseRule == 'couponsList'"></couponsList>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import orderList from './order_list.vue'
import couponsList from './coupons_list.vue'

const chooseRule = ref('orderList')
function changeRule() {}
</script>

<style lang="scss" scoped>
@import '../components/css/page.scss';
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  border-radius: $content-radius;
}
.guest_list {
  position: relative;
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

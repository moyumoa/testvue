<template>
  <div>
    <el-tabs class="tab_box hide_underline" v-model="currentTab">
      <el-tab-pane label="商品管理" name="goods"></el-tab-pane>
      <el-tab-pane label="金币管理" name="gold"></el-tab-pane>
    </el-tabs>
    <div class="page">
      <goods-management key="1" v-if="currentTab === 'goods'"></goods-management>
      <gold-management v-else></gold-management>
    </div>
  </div>
</template>
<script setup>
import GoodsManagement from './compontents/goods_management.vue'
import GoldManagement from './compontents/gold_management.vue'

const currentTab = ref('goods') // goods 商品管理 gold 金币管理
</script>

<style lang="scss" scoped>
:deep(.el-tabs__header) {
  padding: 16px 24px 0 24px;
  background-color: #fff;
  border-radius: 5px;
}

:deep(.el-tabs__item.is-active) {
  color: #303133;
  font-weight: 600;
}
</style>

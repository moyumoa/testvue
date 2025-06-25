<template>
  <div class="good_management">
    <el-tabs class="tab_box hide_underline" v-model="chooseRule" @tab-click="changeRule">
      <el-tab-pane label="抖店商品" name="goodStore">
        <goodStore v-if="chooseRule == 'goodStore'"></goodStore>
      </el-tab-pane>
      <el-tab-pane label="聚合商品" name="goodAggregate">
        <goodAggregate v-if="chooseRule == 'goodAggregate'"></goodAggregate>
      </el-tab-pane>
      <el-tab-pane label="商品分组" name="goodGroup">
        <goodGroup v-if="chooseRule == 'goodGroup'"></goodGroup>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import goodStore from '../good_store/index.vue'
// import goodRetention from '../good_retention/index.vue'
import goodAggregate from '../good_aggregate/index.vue'
import goodGroup from '../good_group/index.vue'
defineComponent(goodStore, goodGroup)
const chooseRule = ref('goodStore')
function changeRule() {}
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  border-radius: $content-radius;
}
.good_management {
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

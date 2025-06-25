<template>
  <div class="goods">
    {{ props.componentData }}
    <el-tabs v-model="showTab" class="hide_underline">
      <el-tab-pane
        :label="item.name"
        v-for="(item, index) in props.componentData.groupList"
        :key="index"
        :name="item.id"
      >
        <goodsCommon :componentData="props.componentData"></goodsCommon>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import goodsCommon from '../goods_common/goods_common.vue'
defineComponent(goodsCommon)
const props = defineProps({
  componentData: {
    type: Object
  }
})
const showTab = ref()
function init() {
  if (props.componentData.groupList.length > 0) {
    showTab.value = props.componentData.groupList[0].id
  }
}
init()
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
</style>

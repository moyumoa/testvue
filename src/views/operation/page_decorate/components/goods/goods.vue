<template>
  <div class="goods">
    <goodsCommon :componentData="props.componentData"></goodsCommon>
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
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
</style>

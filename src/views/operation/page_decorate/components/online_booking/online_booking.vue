<template>
  <div class="goods">
    <goodsCommon type="booking" :componentData="componentData"></goodsCommon>
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
watch(
  () => props.componentData,
  newVal => {
    componentData.value = newVal
  },
  { deep: true }
)
const componentData = ref()
function init() {
  if (props.componentData) {
    componentData.value = JSON.parse(JSON.stringify(props.componentData))
  }
}
init()
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
</style>

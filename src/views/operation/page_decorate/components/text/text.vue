<template>
  <div
    :class="{ diy_text: true, showBottomLine: props.componentData.showBottomLine }"
    :style="{
      fontSize: props.componentData.fontSize,
      color: props.componentData.color,
      backgroundColor: props.componentData.backgroundColor,
      textAlign: props.componentData.textAlign,
      fontWeight: props.componentData.fontWeight
    }"
  >
    {{ props.componentData.text || '请设置文本信息' }}
  </div>
</template>
<script setup>
const props = defineProps({
  componentData: {
    type: Object
  }
})
</script>
<style lang="scss" scoped>
.diy_text {
  padding: 15px 8px;
  line-height: 20px;
}
.showBottomLine {
  border-bottom: 1px solid #eceef5;
}
div,
p {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

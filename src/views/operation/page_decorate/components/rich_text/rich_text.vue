<template>
  <div class="rich_text">
    <div
      class="diy_richText"
      :style="{
        backgroundColor: props.componentData.backgroundColor,
        color: props.componentData.content ? '' : '#909399'
      }"
      v-html="props.componentData.content || '点击编辑富文本内容'"
    ></div>
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
@import '../scss/decorate.scss';
.diy_richText {
  padding: 15px 8px;
  line-height: 20px;
}
div,
p {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

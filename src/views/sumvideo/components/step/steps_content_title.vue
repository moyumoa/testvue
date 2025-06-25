<template>
  <div class="steps_content_title">
    <div class="s_left">
      <span class="name">Step{{ currentSteps + 1 }}</span>
      <span class="desc">{{ title }}</span>
      <slot name="leftBox"></slot>
    </div>
    <div class="right_box"><slot name="rightBox"></slot></div>
  </div>
</template>
<script setup>
const props = defineProps({
  currentSteps: {
    type: Number,
    default: 0
  },
  title: String
})
const { currentSteps, title } = toRefs(props)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.steps_content_title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 28px;
  border-bottom: 1px solid #e8e8e8;
  white-space: nowrap;
  position: relative;
  .s_left {
    display: flex;
    align-items: flex-end;
  }

  .name {
    font-weight: 600;
    font-size: 16px;
    color: #364fcd;
    line-height: 22px;
  }
  .desc {
    font-weight: 400;
    font-size: 16px;
    color: #303133;
    line-height: 22px;
    margin-left: 8px;
  }
  .right_box {
    // display: flex;
    // flex-wrap: wrap;
  }
}
</style>

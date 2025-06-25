<template>
  <div class="title-wrapper">
    <div class="title" v-if="title">{{ title }}</div>
    <div class="slot-wrapper" v-if="hasSolt">
      <slot name="right"></slot>
    </div>
    <div class="subtitle">{{ subtitle }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  hasSolt: {
    type: Boolean,
    default: true
  } // 是否需要slot
})
const { title, subtitle } = toRefs(props)
</script>

<style lang="scss" scoped>
.title-wrapper {
  box-sizing: border-box;
  padding: 0 22px;
  border-bottom: 1px solid #dcdee0;
  display: flex;
  align-items: center;
  min-height: 56px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  div {
    display: inline-block;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-right: 12px;
  }
  .slot-wrapper {
    margin-right: 12px;
  }
  .subtitle {
    flex: 1;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
  }
}
</style>

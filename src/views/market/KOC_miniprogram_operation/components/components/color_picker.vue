<template>
  <div class="color_picker ">
    <el-color-picker popper-class="operation_color_picker" v-model="color" @change="changeColor" :show-alpha="!hideAlpha" />

    <el-link type="primary" @click="resetColor">重置</el-link>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  color: {
    type: String,
    default: '',
    required: true
  },
  defatultColor: {
    type: String,
    default: ''
  },
  hideAlpha: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['update:color'])
function changeColor(e) {
  emits('update:color', e)
}

const color = computed(() => {
  return props.color
})

const resetColor = throttle(() => {
  color.value = props.defatultColor
  changeColor(props.defatultColor)
}, 700)
</script>
<style lang="scss" scoped>
.color_picker {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  .el-link {
    margin-left: 12px;
  }
  :deep(.el-color-picker) {
    height: 32px;
  }
  :deep(.el-color-picker__trigger) {
    width: 60px;
    height: 32px;
    border-radius: 2px;
    padding: 2px;
  }
  :deep(.el-color-picker__icon) {
    display: none;
  }
}

:deep(.el-color-picker__panel) {
  .el-color-dropdown__btns {
    .el-button--text {
      display: none !important;
    }
  }
}
</style>

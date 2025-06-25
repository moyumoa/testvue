<template>
  <div class="color_picker">
    <el-link type="primary" @click="resetColor">重置</el-link>
    <el-color-picker v-model="color" @change="changeColor" :show-alpha="!hideAlpha" />
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
  hideAlpha: {
    type: Boolean,
    default: false
  }
})
const oldColor = ref()
const emits = defineEmits(['update:color'])
function changeColor(e) {
  emits('update:color', e)
}
// 打开弹窗并将数据填写
function init() {
  if (props.color) {
    oldColor.value = props.color // 数量量少的直接使用这个转
  }
}
const color = computed(() => {
  return props.color
})
onMounted(() => {
  init()
})

const resetColor = throttle(() => {
  color.value = oldColor.value
  changeColor(oldColor.value)
}, 700)
</script>
<style lang="scss" scoped>
.color_picker {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  .el-link {
    margin-right: 8px;
  }
  :deep(.el-color-picker) {
    height: 26px;
  }
  :deep(.el-color-picker__trigger) {
    width: 58px;
    height: 26px;
    border-radius: 2px;
  }
  :deep(.el-color-picker__icon) {
    display: none;
  }
}
</style>

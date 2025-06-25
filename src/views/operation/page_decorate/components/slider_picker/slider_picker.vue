<template>
  <div class="slider_picker">
    <el-slider
      v-model="slider"
      :show-tooltip="false"
      :show-input-controls="false"
      show-input
      :max="props.max"
      :min="props.min"
      @input="changeRule"
    ></el-slider>
  </div>
</template>
<script setup>
const props = defineProps({
  slider: {
    type: Number,
    default: 0,
    required: true
  },
  max: {
    type: Number,
    default: 30,
    required: true
  },
  min: {
    type: Number,
    default: 0,
    required: true
  }
})
const slider = ref()
function init() {
  slider.value = props.slider
}
init()
// 选择
const emits = defineEmits(['update:slider'])
const changeRule = e => {
  emits('update:slider', e)
}
</script>
<style lang="scss" scoped>
.slider_picker {
  :deep(.el-slider__input) {
    width: 58px !important;
  }
  :deep(.el-slider__runway.show-input) {
    margin-right: 78px !important;
    height: 4px !important;
  }
  :deep(.el-slider__bar) {
    height: 4px !important;
  }
  :deep(.el-slider__button-wrapper) {
    width: 12px !important;
    height: 12px !important;
    top: -7px !important;
  }
  :deep(.el-slider__button) {
    width: 12px !important;
    height: 12px !important;
    border-radius: 100% !important;
    border: solid 1px var(--el-slider-main-bg-color);
  }
}
</style>

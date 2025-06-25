<template>
  <div
    class="g_tabs_wrapper g_bg"
    :class="{ underline: props.underline }"
    :ref="el => (wrapperRef = el)"
  >
    <template v-for="item in props.data" :key="item.value">
      <div
        :class="{ active: current === item.value }"
        class="g_tab_item"
        @click="toggle(item.value)"
        :ref="
          el => {
            if (current === item.value) tabRef = el
          }
        "
      >
        {{ item.label }}
      </div>
    </template>
    <div class="g_underline" :ref="el => (underline = el)"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Array }, // 格式：[{ label: 'xxx', value: 'xxx' }]
  current: { type: String }, // 当前选中的value值
  underline: { type: Boolean, default: false }, // 下划线
  beforeChange: {
    type: Function,
    default: fn => {
      fn()
    }
  }
})
const emits = defineEmits(['update:current'])

const wrapperRef = ref(null)
const tabRef = ref(null)
const underline = ref(null)

const toggle = val => {
  props.beforeChange(() => {
    emits('update:current', val)
  })
}

onMounted(() => {
  // tab下划线动画效果
  watchEffect(() => {
    if (tabRef.value) {
      const { width, left: tabLeft } = tabRef.value.getBoundingClientRect()
      const { left } = wrapperRef.value.getBoundingClientRect()
      underline.value.style.width = width + 'px'
      underline.value.style.left = tabLeft - left + 'px'
    }
  })
})
</script>

<style lang="scss" scoped>
.g_tabs_wrapper {
  display: flex;
  padding: 0 24px;
  position: relative;
  border-radius: 4px;
  &.underline {
    border-bottom: 1px solid #e8e8e8;
  }
  .g_tab_item {
    color: #909399;
    margin-right: 40px;
    padding: 16px 0;
    cursor: pointer;
    &.active {
      color: #303133;
    }
  }
  .g_underline {
    border-bottom: 2px solid #364fcd;
    position: absolute;
    bottom: -1px;
    transition: all 250ms;
  }
}
</style>

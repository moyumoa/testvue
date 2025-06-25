<template>
  <div class="g_select_wrapper" :class="{ show_text: type === 'icon' }">
    <span class="text" v-if="type === 'icon'">{{ text }}</span>
    <div class="select_wrapper">
      <template v-for="item in props.options" :key="item.value">
        <div
          class="g_select_item"
          :class="{ active: props.value === item.value }"
          @click="toggle(item.value)"
          :style="{ width: props.type !== 'icon' ? '108px' : '50px' }"
        >
          <template v-if="props.type !== 'icon'">
            {{ item.label }}
          </template>
          <template v-else>
            <i :class="['iconfont', `icon-${item.icon}`, 'icon']"></i>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  options: { type: Array, default: () => [] }, // text:[{label: 'xxx', value: 1 }]   icon:[{icon:'xxx',label:'xxx',value:1}]
  value: { type: [String, Number], required: true },
  type: { type: String, default: 'text' } // text:文字 icon:图标
})
const emits = defineEmits(['update:value'])

// 展示文字
const text = computed(() => {
  const item = props.options.find(i => i.value === props.value)
  return item.label
})

// 切换
const toggle = val => {
  emits('update:value', val)
}
</script>

<style lang="scss" scoped>
.g_select_wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  &.show_text {
    justify-content: space-between;
  }
  .text {
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #303133;
    line-height: 24px;
    margin-left: 16px;
  }
  .select_wrapper {
    display: flex;
    .g_select_item {
      cursor: pointer;
      text-align: center;
      border: 1px solid #e8e8e8;
      border-right: 1px solid transparent;
      font-size: 12px;
      color: #606266;
      line-height: 24px;
      padding: 4px 0;
      &:first-child {
        border-radius: 2px 0 0 2px;
      }
      &:last-child {
        border-radius: 0 2px 2px 0;
        border-right: 1px solid #e8e8e8;
      }
      &.active {
        background: rgba(54, 79, 205, 0.1);
        border: 1px solid #364fcd;
        color: #364fcd;
        > .icon {
          color: #364fcd;
        }
      }
      > .icon {
        color: #909399;
        font-size: 16px;
      }
    }
  }
}
</style>

<template>
  <div class="sort-icon">
    <slot></slot>
    <!-- 置顶 -->
    <i class="iconfont icon-zhiding" @click="moveTopItem(index)" v-if="index !== 0 && hasTop"></i>
    <!-- 拖拽 -->
    <i class="iconfont icon-tuodongweizhi" v-if="hasMove"></i>
    <!-- 向下 -->
    <i
      class="iconfont icon-xiayi"
      @click="moveDownItem(index)"
      v-if="index !== list.length - 1 && hasUpDown"
    ></i>
    <!-- 向上 -->
    <i class="iconfont icon-shangyi" @click="moveUpItem(index)" v-if="index !== 0 && hasUpDown"></i>
    <!-- 删除 -->
    <i class="iconfont icon-shanchu1" v-if="hasDelete" @click="deleteItem(index)"></i>
  </div>
</template>

<script setup>
import { moveDown, moveUp } from '@/utils/array.js'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  list: Array,
  index: Number,
  hasDelete: {
    type: Boolean,
    default: true
  },
  hasTop: {
    type: Boolean,
    default: false
  },
  hasUpDown: {
    type: Boolean,
    default: false
  },
  hasMove: {
    type: Boolean,
    default: false
  }
})
const { list, index } = toRefs(props)
const emits = defineEmits(['delItem'])
const moveUpItem = index => {
  list.value = moveUp(list.value, index)
}
const moveDownItem = index => {
  list.value = moveDown(list.value, index)
}
const deleteItem = throttle(index => {
  const item = list.value[index]
  emits('delItem', item)
  list.value.splice(index, 1)
}, 700)
const moveTopItem = index => {
  if (list.value && list.value.length > 0) {
    list.value.unshift(list.value.splice(index, 1)[0])
  }
}
</script>

<style lang="scss" scoped>
.sort-icon {
  cursor: pointer;
  position: absolute;
  z-index: 10;
  top: 16px;
  right: 16px;
  font-size: 20px;
  color: #909399;
  display: flex;
  align-items: center;
  .iconfont {
    font-size: 20px;
    margin-left: 12px;
  }
  .iconfont:hover {
    color: $theme-color;
  }
  .icon-zhiding {
    font-size: 16px !important;
  }
}
</style>

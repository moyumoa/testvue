<template>
  <div class="page">
    <el-button v-for="(item, index) in functionList" :key="index" @click="chooseFun(item)">
      {{ item.name }}
    </el-button>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const emits = defineEmits(['upPage'])
const functionList = ref([
  {
    name: '返回顶部',
    type: 'toTop'
  }
])
// 选择页面
const chooseFun = throttle(e => {
  const data = {
    type: 'function',
    name: 'function',
    label: `【功能】：${e.name}`,
    url: e.type
  }
  emits('upPage', data)
}, 300)
</script>
<style lang="scss" scoped></style>

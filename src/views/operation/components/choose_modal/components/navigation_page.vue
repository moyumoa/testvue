<template>
  <div class="page">
    <template v-for="(item, index) in buttonList" :key="index">
      <template v-if="props.showNavigation.length > 0">
        <el-button
          @click="chooseNavigation(item)"
          v-if="props.showNavigation.indexOf(item.name) > -1"
        >
          {{ item.title }}
        </el-button>
      </template>
      <template v-else>
        <el-button @click="chooseNavigation(item)">{{ item.title }}</el-button>
      </template>
    </template>
  </div>
</template>
<script setup>
import { page } from '../../page.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  showNavigation: {
    type: Array,
    default: () => {
      return []
    }
  } // 只展示的页面
})
// 所有可跳转的导航页面
const buttonList = reactive([
  {
    name: 'home',
    title: '首页',
    type: 'page',
    url: page.get('home').url
  },
  {
    name: 'category',
    title: '分类页',
    type: 'page',
    url: page.get('category').url
  },
  {
    name: 'brand',
    title: '品牌号',
    type: 'page',
    url: page.get('brand').url
  },
  {
    name: 'mine',
    title: '我的',
    type: 'page',
    url: page.get('mine').url
  }
])
const emits = defineEmits(['upPage'])
// 选择页面
const chooseNavigation = throttle(e => {
  console.log(1)
  e.label = `【页面】：${e.title}`
  emits('upPage', e)
}, 300)
</script>
<style lang="scss" scoped></style>

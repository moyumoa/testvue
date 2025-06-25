<template>
  <div class="intelligent_page">
    <el-tabs v-model="chooseTab" class="tab_components" @tab-click="changeTab">
      <el-tab-pane label="智能快拆" name="disassemble">
        <disassembleDOM v-if="chooseTab === 'disassemble'" />
      </el-tab-pane>
      <el-tab-pane label="拆解记录" name="record">
        <recordsDOM v-if="chooseTab === 'record'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import disassembleDOM from './disassemble.vue'
import recordsDOM from './records.vue'
import { useRoute } from 'vue-router'
// tab切换
const chooseTab = ref('disassemble')

function changeTab() {
  // 切换路由不刷新页面
  // const url = window.location.href
  // const newQuery = `type=${chooseTab.value}`
  // const newUrl = url.split('?')[0] + '?' + newQuery
  // history.pushState(null, null, newUrl)
}
const route = useRoute()

if (route.query.type) {
  chooseTab.value = route.query.type
}

onMounted(() => {
  const tab = sessionStorage.getItem('intelligent_tab')
  if (tab) {
    chooseTab.value = tab
    sessionStorage.removeItem('intelligent_tab')
  }
})
</script>
<style lang="scss" scoped>
.intelligent_page {
  width: 100%;
  height: 100%;
  .tab_components {
    width: 100%;
    height: 100%;
    :deep(.el-tab-pane) {
      width: 100%;
      height: 100%;
    }
    :deep(.el-tabs__content) {
      width: 100%;
      height: calc(100% - 66px);
    }
  }
}
</style>

<template>
  <div class="setting_table">
    <el-tabs class="tab_box hide_underline" v-model="chooseTab" @tab-click="changeTab">
      <el-tab-pane v-for="(tab, i) in tabList" :key="i" :label="tab.label" :name="tab.name">
        <template #label>
          <div class="tab_label">
            {{ tab.label }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 作品库 -->
    <workLibrary v-if="chooseTab === 'work_library'" @changeTab="upTab"></workLibrary>
    <!-- 素材库 -->
    <!-- <materialLibrary v-if="chooseTab === 'material_library'"></materialLibrary> -->
    <!-- 灵感视频库 -->
    <videoLibrary v-if="chooseTab === 'video_library'"></videoLibrary>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import workLibrary from './work_library/work_library.vue'
// import materialLibrary from './material_library/material_library.vue'
import videoLibrary from './video_library/video_library.vue'
const tabList = [
  {
    name: 'work_library',
    label: '作品库'
  },
  // {
  //   name: 'material_library',
  //   label: '素材库'
  // },
  {
    name: 'video_library',
    label: '灵感视频库'
  }
]
const route = useRoute()
const router = useRouter()
const chooseTab = ref('work_library')
function changeTab() {
  const query = {
    type: chooseTab.value
  }
  router.push({ path: route.path, query })
}
onMounted(() => {
  console.log('mounted', route.query)
  if (route.query.type) {
    chooseTab.value = route.query.type
  }
})
function upTab(e) {
  chooseTab.value = e
}
</script>

<style lang="scss" scoped>
.setting_table {
  // min-width: 1310px;
  :deep(.el-tabs__header) {
    padding: 16px 24px 0 24px;
    background-color: #fff;
    border-radius: 5px;
  }
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
}
</style>

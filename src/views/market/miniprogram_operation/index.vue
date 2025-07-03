<template>
  <div class="miniprogram-operation">
    <el-tabs class="tab_box hide_underline" v-model="chooseTab">
      <el-tab-pane
        v-for="(tab, i) in tabList"
        :key="i"
        :label="tab.label"
        :name="tab.name"
      ></el-tab-pane>
    </el-tabs>
    <div class="main">
      <Home v-if="chooseTab === 'home'"></Home>
      <Active v-if="chooseTab === 'active'"></Active>
      <ActivitySetting v-if="chooseTab === 'ActivitySetting'"></ActivitySetting>
      <commonSetting v-if="chooseTab === 'commonSetting'" />
    </div>
  </div>
</template>

<script setup>
import Home from './home_setting/index.vue'
import Active from './active_setting/index.vue'
import ActivitySetting from '../operation_setting/components/activity_setting.vue'
import commonSetting from './common_setting/index.vue'
import { useStore } from 'vuex'
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)
const miniViewMode = computed(() => store.state.user.miniViewMode)

const chooseTab = ref('home')
const tabList = ref([
  {
    name: 'home',
    label: '首页配置'
  },
  {
    name: 'active',
    label: '活动配置'
  },
  {
    name: 'ActivitySetting',
    label: '小程序弹窗'
  }
])
if ([3].includes(systemVersion.value) && [3].includes(miniViewMode.value)) {
  tabList.value.push({
    name: 'commonSetting',
    label: '常用功能配置'
  })
}
</script>

<style lang="scss" scoped>
.miniprogram-operation {
  .main {
    // height: 100%;
    height: calc(100vh - 190px);
    // background-color: #fff;
  }

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

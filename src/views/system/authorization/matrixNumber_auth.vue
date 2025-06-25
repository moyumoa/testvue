<template>
  <div class="auth_wrapper">
    <!-- 数据统计 -->
    <authTotal ref="authDOM" />
    <el-tabs class="tab_box hide_underline" v-model="chooseTab" @tab-click="changeTab">
      <template v-for="(tab, i) in tabs" :key="i">
        <el-tab-pane v-if="tab.show" :label="tab.label" :name="tab.value">
          <template #label>
            <div class="tab_label auth_tab_label">
              <div class="tab_platform"><div :class="`xm_platformIcon_${tab.platform}`"></div></div>
              {{ tab.label }}
            </div>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
    <component :is="currentCom" @updateTotal="updateTotal" />
  </div>
</template>

<script setup>
import authTotal from './components/auth_total.vue'
import AccountPage from './account_page.vue'
import XHSPage from './xhs_page.vue'
import SPHPage from './sph_page.vue'
import KSPage from './ks_page.vue'

import { useRoute, useRouter } from 'vue-router'
const tabs = ref([
  { label: '抖音授权', value: 'account', show: true, platform: 1 },
  { label: '小红书授权', value: 'xhs', show: true, platform: 3 },
  { label: '视频号授权', value: 'sph', show: true, platform: 2 },
  { label: '快手授权', value: 'ks', show: true, platform: 4 }
])

const route = useRoute()
const router = useRouter()
const chooseTab = ref('')
// 当前显示组件
const currentCom = computed(() => {
  if (chooseTab.value === 'xhs') {
    return XHSPage
  } else if (chooseTab.value === 'sph') {
    return SPHPage
  } else if (chooseTab.value === 'ks') {
    return KSPage
  } else if (chooseTab.value === 'account') {
    return AccountPage
  }
})
function changeTab() {
  const query = {
    type: chooseTab.value
  }
  router.push({ path: route.path, query })
}
onMounted(() => {
  if (route.query.type) {
    chooseTab.value = route.query.type
  } else {
    chooseTab.value = 'account'
  }
})
const authDOM = ref(null)
// 更新统计数据
function updateTotal() {
  authDOM.value?.getCount()
}
</script>
<style lang="scss" scoped>
.auth_wrapper {
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
<style lang="scss">
.operate_box {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .btn_txt {
    cursor: pointer;
  }
}
.default_color {
  color: #364fcd;
}
.auth_tab_label {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .tab_platform {
    width: 20px;
    height: 20px;
    position: relative;
    margin-right: 4px;
  }
}
</style>

<!--
 * @Date: 2022-04-28 15:14:56
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-04-28 15:16:20
 * @FilePath: \sumwhy-fly-view\src\views\system\authorization\index.vue
-->
<template>
  <div class="auth_wrapper">
    <el-tabs class="tab_box hide_underline" v-model="chooseTab" @tab-click="changeTab">
      <template v-for="(tab, i) in tabs" :key="i">
        <el-tab-pane v-if="tab.show" :label="tab.label" :name="tab.value">
          <template #label>
            <div class="tab_label">
              {{ tab.label }}
            </div>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
    <component :is="currentCom" />
  </div>
</template>

<script setup>
import { hasDyPro } from '@/utils/tools'
import DyPage from './dy_page.vue'
import AccountPage from './account_page.vue'
import MpPage from './mp_page.vue'
import KJLPage from './kjl_page.vue'
import XHSPage from './xhs_page.vue'
import SPHPage from './sph_page.vue'
import KSPage from './ks_page.vue'
import DyGuest from './dy_guest.vue'

import { useRoute, useRouter } from 'vue-router'
const tabs = ref([
  // { label: '抖音小店授权管理', value: 'dy', show: true },
  // { label: '抖音号授权管理', value: 'account', show: true },
  // { label: '小程序授权管理', value: 'mini', show: true },
  // { label: '酷家乐账号管理', value: 'kjl', show: true }
  // { label: '小程序授权管理', value: 'mini' },
  { label: '抖音授权', value: 'account', show: true },
  { label: '小红书授权', value: 'xhs', show: true },
  { label: '快手授权', value: 'ks', show: true },
  { label: '视频号授权', value: 'sph', show: true },
  { label: '抖店授权', value: 'dy', show: true },
  { label: '小程序授权管理', value: 'mini', show: true },
  { label: '酷家乐授权', value: 'kjl', show: true },
  { label: '抖音来客', value: 'dyGuest', show: true }
])

if (!hasDyPro()) {
  const index = tabs.value.findIndex(x => x.value === 'mini')
  tabs.value[index].show = false
}

const judgeHWork = inject('$judgeHWork')
// 海尔需要隐藏抖店授权、小程序授权、酷家乐授权
if (judgeHWork()) {
  tabs.value.forEach(x => {
    if (x.value === 'dy' || x.value === 'kjl') {
      x.show = false
    }
  })
}
const route = useRoute()
const router = useRouter()
const chooseTab = ref('account')
// 当前显示组件
const currentCom = computed(() => {
  if (chooseTab.value === 'mini') {
    return MpPage
  } else if (chooseTab.value === 'dy') {
    return DyPage
  } else if (chooseTab.value === 'kjl') {
    return KJLPage
  } else if (chooseTab.value === 'xhs') {
    return XHSPage
  } else if (chooseTab.value === 'sph') {
    return SPHPage
  } else if (chooseTab.value === 'ks') {
    return KSPage
  } else if (chooseTab.value === 'dyGuest') {
    return DyGuest
  } else {
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
  }
})
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
</style>

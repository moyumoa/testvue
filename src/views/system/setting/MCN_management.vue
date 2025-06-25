<template>
  <div class="page">
    <!-- 视频号机构号 -->
    <sphMCN :switchValue="wxMcnOpened" />
    <!-- 抖音机构号 -->
    <dyMCN :switchValue="dyMcnOpened" />
  </div>
</template>
<script setup>
import { getBrandDefaultMcnConfigV2 } from '@/api/system_setting/authorization.js'

import sphMCN from './components/sph_mcn_list.vue'
import dyMCN from './components/dy_mcn_list.vue'
const wxMcnOpened = ref(false) // 视频号机构号是否开通
const dyMcnOpened = ref(false) // 抖音机构号是否开通

function getBrandDefaultMcnConfigFn() {
  getBrandDefaultMcnConfigV2({})
    .then(res => {
      if (res.code === 0) {
        dyMcnOpened.value = res?.data.dyMcnOpened || false
        wxMcnOpened.value = res?.data.wxMcnOpened || false
      }
    })
    .catch(() => {})
}
onMounted(() => {
  getBrandDefaultMcnConfigFn()
})
</script>
<style lang="scss" scoped></style>

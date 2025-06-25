<template>
  <div class="intelligent_page">
    <!-- <down-load-client v-if="systemVersion != 3"></down-load-client> -->
    <el-tabs v-model="chooseTab" class="tab_components" @tab-click="changeTab">
      <el-tab-pane label="企业模板" name="enterpriseTemplate">
        <creativeMould v-if="chooseTab === 'enterpriseTemplate'" />
      </el-tab-pane>
      <el-tab-pane label="模板发布详情" name="publishInfo" v-if="[3, 4].includes(systemVersion)">
        <publishInfoDOM v-if="chooseTab === 'publishInfo'" />
      </el-tab-pane>
      <el-tab-pane label="云模板" name="cloudTemplate">
        <cloudTemplateDOM v-if="chooseTab === 'cloudTemplate'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import { resetPushState } from '@/utils/getRoute'
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import creativeMould from '../creative_mould/index.vue'
import cloudTemplateDOM from '../cloud_template/index.vue'
import publishInfoDOM from './publishInfo.vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
const router = useRouter()
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

// tab切换
const chooseTab = ref('enterpriseTemplate')

function changeTab() {
  // sessionStorage.removeItem('taskTemplateName')
  console.log('changetab', chooseTab.value)
  // // 切换路由不刷新页面
  // const query = {
  //   type: chooseTab.value
  // }
  // router.push({ path: route.path, query })
  resetPushState()
  router.replace({ query: {} })
}
const route = useRoute()

const menuOfKeepAlive = inject('$menuOfKeepAlive')
onMounted(() => {
  chooseTab.value = route.query.type || 'enterpriseTemplate'
})
onActivated(() => {
  if (menuOfKeepAlive('judge')) {
    chooseTab.value = route.query.type || 'enterpriseTemplate'

    menuOfKeepAlive('reset')
  } else {
    // chooseTab.value = route.query.type || 'enterpriseTemplate'
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
    :deep(.el-tabs__content) {
      width: 100%;
      min-height: calc(100% - 82px);
      overflow: visible;
    }
  }
}
</style>

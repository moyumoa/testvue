<template>
  <div class="package_usage_record">
    <el-tabs class="tab_box" v-model="$data.chooseTab" @tab-click="clickTab">
      <el-tab-pane v-for="(tab, i) in $data.tabList" :key="i" :label="tab.label" :name="tab.value">
        <template #label>
          <div class="tab_label">
            {{ tab.label }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>

    <batchPublish ref="batchPublishRef" v-if="$data.chooseTab == 1" @changeTab="changeTab" />
    <recordsPublish
      ref="recordsPublishRef"
      v-if="$data.chooseTab == 2"
      :bizId="bizId"
      @updateUrl="updateUrl"
    />
    <qrcodePublish ref="qrcodePublishRef" v-if="$data.chooseTab == 3" />
  </div>
</template>

<script setup>
import qrcodePublish from './qrcode_publish/index.vue'
import batchPublish from './batch_publish/index.vue'
import recordsPublish from './records_publish/index.vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const $data = reactive({
  chooseTab: 1,
  tabList: [
    {
      label: '批量发布',
      value: 1
    },
    {
      label: '发布记录',
      value: 2
    },
    {
      label: '二维码发布记录',
      value: 3
    }
  ]
})
const bizId = ref('') // 批量发布列表到发布记录列表需要将当前发布任务id带入
const batchPublishRef = ref(null)
const recordsPublishRef = ref(null)
const qrcodePublishRef = ref(null)
onMounted(() => {
  console.log('mounted', route.query)
  $data.chooseTab = route.query.tab ? parseInt(route.query.tab) : 1
  if ($data.chooseTab === 2) {
    bizId.value = route.query.bizId ? route.query.bizId : ''
  } else {
    bizId.value = ''
  }
  nextTick(() => {
    batchPublishRef.value && batchPublishRef.value.getList()
    recordsPublishRef.value && recordsPublishRef.value.initPage()
    qrcodePublishRef.value && qrcodePublishRef.value.initType()
  })
})
// 清除URL上的bizid参数
function updateUrl() {
  if (route.query.bizId) {
    router.replace({
      path: router.currentRoute.value.path,
      query: {
        tab: router.currentRoute.value.query.tab
      }
    })
  }
}

function changeTab(val, item) {
  bizId.value = item?.id || ''

  nextTick(() => {
    $data.chooseTab = val
    clickTab()
  })
}
function clickTab() {
  if ($data.chooseTab !== 2) {
    bizId.value = ''
  }
  const query = {
    tab: $data.chooseTab
  }
  if (bizId.value) {
    query.bizId = bizId.value
  }
  router.push({ path: route.path, query })
  if ($data.chooseTab === 3) {
    qrcodePublishRef.value && qrcodePublishRef.value.initType()
  }
}
</script>

<style lang="scss" scoped>
.package_usage_record {
  :deep(.el-tabs__header) {
    padding: 16px 24px 0 24px;
    background-color: #fff;
    border-radius: 5px;
  }
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  :deep .el-tabs__nav-wrap::after {
    height: 0 !important;
  }
}
</style>

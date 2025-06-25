<template>
  <div class="package_usage_record">
    <!-- <el-tabs
      class="tab_box"
      v-model="$data.chooseTab"
      v-if="$data.tabList && $data.tabList.length > 1"
    >
      <el-tab-pane v-for="(tab, i) in $data.tabList" :key="i" :label="tab.label" :name="tab.value">
        <template #label>
          <div class="tab_label">
            {{ tab.label }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs> -->

    <memberManagement />
    <!-- <externalTalent v-if="$data.chooseTab == 'externalTalent'" /> -->
  </div>
</template>

<script setup>
import memberManagement from '../member_management/index.vue'
// import externalTalent from '../member_management/external_talent.vue'
// import { useRoute } from 'vue-router'
// import { getUserPermission } from '@/utils/tools.js'

// const route = useRoute()
// const $data = reactive({
//   chooseTab: 'memberManagement',
//   tabList: [
//     {
//       label: '内部达人',
//       value: 'memberManagement'
//     }
//   ]
// })

// onMounted(() => {
//   $data.chooseTab = route.query.type || 'memberManagement'
//   if (getUserPermission('market:member:switch'))
//     $data.tabList.push({
//       label: '外部达人',
//       value: 'externalTalent'
//     })
// })
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

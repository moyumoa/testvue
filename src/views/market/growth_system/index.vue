<template>
  <div class="package_usage_record">
    <!-- <el-tabs class="tab_box" v-model="$data.chooseTab" @tab-click="onChangeTab">
      <el-tab-pane v-for="(tab, i) in $data.tabList" :key="i" :label="tab.label" :name="tab.value">
        <template #label>
          <div class="tab_label">
            {{ tab.label }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs> -->

    <growthSetting></growthSetting>
  </div>
</template>

<script setup>
import growthSetting from './growth_setting.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const $data = reactive({
  chooseTab: '',
  tabList: [
    {
      label: '成长体系设置',
      value: 'growthSetting'
    }
  ]
})

// function onChangeTab(e) {
//   console.log(e)
// }

onMounted(() => {
  $data.chooseTab = route.query.type || 'growthSetting'
})
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

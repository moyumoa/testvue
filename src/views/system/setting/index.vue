<template>
  <div class="package_usage_record">
    <el-tabs
      class="tab_box"
      v-if="systemVersion != 2"
      v-model="$data.chooseTab"
      @tab-click="onChangeTab"
    >
      <el-tab-pane v-for="(tab, i) in $data.tabList" :key="i" :label="tab.label" :name="tab.value">
        <template #label>
          <div class="tab_label">
            {{ tab.label }}
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>

    <levelRulesSetting v-if="$data.chooseTab == 'levelRules'"></levelRulesSetting>
    <rightsRulesSetting v-else-if="$data.chooseTab == 'rightsRules'"></rightsRulesSetting>
    <dyAuthModeConfiguration v-else-if="$data.chooseTab == 'dyAuthMode'" />
    <MCNManagement v-else-if="$data.chooseTab == 'mcn'" />
  </div>
</template>

<script setup>
import dyAuthModeConfiguration from './dyAuthMode_configuration.vue'
import MCNManagement from './MCN_management.vue'
import levelRulesSetting from './levelRules_setting.vue'
import rightsRulesSetting from './rightsRules_setting.vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const store = useStore()
// 基础版只显示矩阵号等级规则，其余版本显示完整
const systemVersion = computed(() => store.state.user.systemVersion)
const $data = reactive({
  chooseTab: '',
  tabList: [
    {
      label: '抖音授权模式配置',
      value: 'dyAuthMode'
    },
    {
      label: '机构号管理',
      value: 'mcn'
    },
    {
      label: '授权规则配置',
      value: 'rightsRules'
    },
    {
      label: '矩阵号等级规则',
      value: 'levelRules'
    }
  ]
})

function onChangeTab(e) {
  console.log(e)
}

onMounted(() => {
  if (systemVersion.value !== 2) {
    $data.chooseTab = route.query.type || 'dyAuthMode'
  } else {
    $data.chooseTab = 'rightsRules'
  }
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

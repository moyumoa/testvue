<template>
  <div class="package_usage_record">
    <el-tabs class="tab_box" v-model="$data.chooseTab" @tab-click="onChangeTab">
      <template v-for="(tab, i) in $data.tabList">
        <el-tab-pane :key="i" :label="tab.label" :name="tab.value" v-if="tab.show">
          <template #label>
            <div class="tab_label">
              {{ tab.label }}
            </div>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>

    <live-record v-if="$data.chooseTab == 'live'"></live-record>
    <video-record v-if="$data.chooseTab == 'video'"></video-record>
    <account-record v-if="$data.chooseTab == 'account'"></account-record>
    <imgTextRecord v-if="$data.chooseTab == 'imageText'" />
    <AiCreateTicket v-if="$data.chooseTab == 'aiCreateTicket'" />
    <AiAuditList v-if="$data.chooseTab == 'ai_audit'" />
  </div>
</template>

<script setup>
import accountRecord from './account_record.vue'
import liveRecord from './live_record.vue'
import videoRecord from './video_record.vue'
import AiCreateTicket from './ai_create_ticket.vue'
import imgTextRecord from './img_text_record.vue'
import AiAuditList from './ai_audit_list.vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

const route = useRoute()

const $data = reactive({
  chooseTab: '',
  tabList: []
})

function onChangeTab(e) {
  console.log(e)
}

onMounted(() => {
  $data.tabList = [
    {
      label: '矩阵号接入记录',
      value: 'account',
      show: true
    },
    {
      label: '视频智能合成记录',
      value: 'video',
      show: true
    },
    {
      label: '图文智能合成记录',
      value: 'imageText',
      show: systemVersion.value === 3
    },
    {
      label: '智能审核记录',
      value: 'ai_audit',
      show: true
    },
    {
      label: '直播录屏记录',
      value: 'live',
      show: systemVersion.value === 3
    },
    {
      label: 'AI文案创作记录',
      value: 'aiCreateTicket',
      show: systemVersion.value === 3
    }
  ]

  $data.chooseTab = route.query.type || 'account'
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

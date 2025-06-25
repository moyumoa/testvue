<template>
  <div class="interactive_management">
    <el-tabs class="tab_box hide_underline" v-model="chooseRule" @tab-click="changeTab">
      <el-tab-pane label="私信聊天" name="sessionManagement"></el-tab-pane>
      <el-tab-pane label="视频评论" name="videoComment"></el-tab-pane>
      <el-tab-pane label="直播弹幕" name="bulletManagement"></el-tab-pane>
    </el-tabs>
    <div
      class="interactive_content"
      :style="chooseRuleTrue == 'sessionManagement' ? 'overflow:hidden' : ''"
    >
      <sessionManagementDOM v-if="chooseRuleTrue == 'sessionManagement'"></sessionManagementDOM>
      <videoCommentDOM v-if="chooseRuleTrue == 'videoComment'"></videoCommentDOM>

      <bulletManagementDOM v-if="chooseRuleTrue == 'bulletManagement'"></bulletManagementDOM>
    </div>
  </div>
</template>
<script setup>
import sessionManagementDOM from '../session_management/index.vue'
import videoCommentDOM from '../video_comments/index.vue'
import bulletManagementDOM from '../bullet_management/index.vue'
import { useRoute, useRouter } from 'vue-router'

defineComponent(sessionManagementDOM, videoCommentDOM, bulletManagementDOM)
const chooseRule = ref('')
const chooseRuleTrue = ref('')

const route = useRoute()
const router = useRouter()

onMounted(() => {
  if (route.query.type) {
    chooseRule.value = route.query.type
    chooseRuleTrue.value = route.query.type
  } else {
    chooseRule.value = 'sessionManagement'
    chooseRuleTrue.value = 'sessionManagement'
  }
})
function changeTab() {
  const query = {
    type: chooseRule.value
  }
  router.push({ path: route.path, query })
}
</script>
<style lang="scss" scoped>
@import '@/views/content_center/components/css/page.scss';
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  border-radius: $content-radius;
}
.interactive_management {
  position: relative;
  width: 100%;
  height: 100%;
  // :deep(.el-tabs),
  // :deep(.el-tab-pane) {
  //   width: 100%;
  //   height: 100%;
  // }
  :deep(.el-tabs__content) {
    width: 100%;
  }
  .interactive_content {
    width: 100%;
    height: calc(100% - 49px);
    border-radius: $content-radius;
  }
}
:deep(.el-tabs__active-bar) {
  animation-play-state: paused;
}
</style>

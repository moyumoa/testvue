<template>
  <div class="setting_table">
    <el-tabs class="tab_box hide_underline" v-model="chooseTab">
      <template v-for="(tab, i) in tabList">
        <el-tab-pane :key="i" :label="tab.label" :name="tab.name" v-if="tab.show">
          <template #label>
            <div class="tab_item">
              <span class="tab_label">{{ tab.label }}</span>
              <el-tooltip
                v-if="tab.name == 'material'"
                popper-class="tooltip-class"
                content="对征集任务上传的素材和视频生效"
              >
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="width: 12px; height: 12px; margin-left: 8px"
                />
              </el-tooltip>
            </div>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
    <!-- 活动设置 -->
    <!-- <activitySetting v-if="chooseTab === 'active_setting'"></activitySetting> -->
    <auditVideo v-if="chooseTab === 'video'"></auditVideo>
    <auditTask v-if="chooseTab === 'task'"></auditTask>
    <audit-material v-if="chooseTab === 'material'"></audit-material>
    <!-- <task-tag v-if="chooseTab === 'tag'"></task-tag> -->
    <!-- <homework-review v-if="chooseTab === 'homework'"></homework-review> -->
  </div>
</template>

<script setup>
import { pageList } from './model/get_list'
import auditMaterial from './components/audit_material.vue'
import auditVideo from './components/audit_video.vue'
import auditTask from './components/audit_task.vue'
// import activitySetting from './components/activity_setting.vue'
// import taskTag from './components/task_tag.vue'
// import HomeworkReview from './components/homework_review.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { tabList, chooseTab } = pageList()
onMounted(() => {
  if (route.query.type) {
    chooseTab.value = route.query.type
  }
})
</script>

<style lang="scss" scoped>
.setting_table {
  :deep(.el-tabs__header) {
    padding: 16px 24px 0 24px;
    background-color: #fff;
    border-radius: 5px;
  }
  :deep(.el-tabs__item.is-active) {
    color: #303133;
    font-weight: 600;
  }
  // :deep(.el-tab-pane) {
  //   padding: 32px 33px 24px 33px;
  //   background-color: #fff;
  // }
}
.tab_item {
  display: flex;
  align-items: center;
}
</style>

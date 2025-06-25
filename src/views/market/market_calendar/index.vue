<template>
  <div>
    <el-tabs v-model="data.chooseType">
      <el-tab-pane label="活动日历" name="activity">
        <activityCalendar v-if="data.chooseType == 'activity'"></activityCalendar>
      </el-tab-pane>
      <el-tab-pane label="任务日历" name="plan">
        <planCalendar v-if="data.chooseType == 'plan'"></planCalendar>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup>
import activityCalendar from './components/activity.vue'
import planCalendar from './components/plan.vue'
const data = reactive({
  chooseType: 'activity'
})
</script>
<style lang="scss" scoped>
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  border-radius: 4px;
}
:deep(.el-tabs__nav-wrap::after) {
  height: unset !important;
}
:deep(.el-tabs__item) {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #909399;
}
:deep(.is-active) {
  font-size: 14px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #303133;
}
.fullScreenPage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1111;
}
</style>

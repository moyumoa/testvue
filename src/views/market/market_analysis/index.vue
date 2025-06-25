<template>
  <div class="good_management">
    <el-tabs class="tab_box hide_underline" v-model="chooseRule" @tab-click="changeRule">
      <el-tab-pane label="数据概览" name="dataOverview"></el-tab-pane>
      <el-tab-pane label="成员数据" name="memberData"></el-tab-pane>
      <el-tab-pane label="任务数据" name="taskData"></el-tab-pane>
      <el-tab-pane label="部门数据" name="partData"></el-tab-pane>
    </el-tabs>
    <dataOverview v-if="chooseRule == 'dataOverview'" />
    <memberData v-if="chooseRule == 'memberData'" />
    <taskData v-if="chooseRule == 'taskData'" />
    <partData v-if="chooseRule == 'partData'" />
  </div>
</template>
<script setup>
import dataOverview from './data_overview/index.vue'
import memberData from './member_data/index.vue'
import taskData from './task_data/index.vue'
import partData from './part_data/index.vue'
defineComponent(dataOverview, memberData, taskData, partData)
const chooseRule = ref('dataOverview')
function changeRule() {}
</script>
<style lang="scss" scoped>
// @import '../components/css/page.scss';
:deep(.el-tabs__header) {
  background: #fff;
  padding: 16px 0 0 24px;
  // border-radius: $content-radius;
}
.good_management {
  position: relative;
}
.btn_box {
  position: absolute;
  right: 24px;
  top: 0;
  width: 100px;
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  :deep(.el-link--inner) {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    img {
      width: 14px;
      height: 14px;
      margin-left: 2px;
    }
  }
}
</style>

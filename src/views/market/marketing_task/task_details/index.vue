<template>
  <div class="page" style="min-height: 100%" v-loading="pageLoading">
    <aside class="left">
      <taskDetailsVue
        v-if="data.taskInfo"
        :taskInfo="data.taskInfo"
        :pageSource="pageSource"
      ></taskDetailsVue>
    </aside>
    <aside class="right">
      <div class="tab">
        <el-tabs v-model="activeName" class="hide_underline">
          <!-- 视频 -->
          <template v-if="route.query.type === '1'">
            <el-tab-pane label="参与明细" name="0">
              <videoParticipationDetails
                v-if="data.taskInfo"
                :taskInfo="data.taskInfo"
                :pageSource="pageSource"
              ></videoParticipationDetails>
            </el-tab-pane>
            <el-tab-pane label="视频列表" name="1">
              <videoList></videoList>
            </el-tab-pane>
            <videoDataAnalysis
              v-if="activeName == 2 && data.taskInfo"
              :taskInfo="data.taskInfo"
            ></videoDataAnalysis>
            <el-tab-pane label="数据分析" name="2"></el-tab-pane>
          </template>
          <!-- 直播 -->
          <template v-if="route.query.type === '2'">
            <el-tab-pane label="参与明细" name="0">
              <liveParticipationDetails
                v-if="data.taskInfo"
                :taskInfo="data.taskInfo"
                :pageSource="pageSource"
              ></liveParticipationDetails>
            </el-tab-pane>
            <el-tab-pane label="直播列表" name="1">
              <liveList></liveList>
            </el-tab-pane>
            <liveDataAnalysis v-if="activeName == 2"></liveDataAnalysis>
            <el-tab-pane label="数据分析" name="2"></el-tab-pane>
          </template>
          <!-- 征集 -->
          <template v-if="route.query.type === '3'">
            <el-tab-pane label="参与明细" name="0">
              <collect-participation-details
                v-if="data.taskInfo"
                :taskInfo="data.taskInfo"
                :collectType="data.collectType"
                :pageSource="pageSource"
              ></collect-participation-details>
            </el-tab-pane>
            <el-tab-pane :label="data.collectType === 1 ? '视频列表' : '原料列表'" name="1">
              <material-list :collectType="data.collectType"></material-list>
            </el-tab-pane>
          </template>
          <!-- 学习 -->
          <template v-if="route.query.type === '5'">
            <el-tab-pane label="参与明细" name="0">
              <study-participation-details
                v-if="data.taskInfo"
                :taskInfo="data.taskInfo"
                :collectType="data.collectType"
                :pageSource="pageSource"
              ></study-participation-details>
            </el-tab-pane>
            <el-tab-pane label="作业列表" name="1">
              <study-job-list v-if="data.taskInfo" :taskInfo="data.taskInfo"></study-job-list>
            </el-tab-pane>
          </template>
          <!-- 图文 -->
          <template v-if="route.query.type === '6'">
            <el-tab-pane label="参与明细" name="0">
              <imgTextParticipationDetails
                v-if="data.taskInfo"
                :taskInfo="data.taskInfo"
                :pageSource="pageSource"
              ></imgTextParticipationDetails>
            </el-tab-pane>
            <el-tab-pane label="图文列表" name="1">
              <imgTextList></imgTextList>
            </el-tab-pane>
            <imgTextDataAnalysis
              v-if="activeName == 2 && data.taskInfo"
              :taskInfo="data.taskInfo"
            ></imgTextDataAnalysis>
            <el-tab-pane label="数据分析" name="2"></el-tab-pane>
          </template>
        </el-tabs>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { getTaskInfoView } from '@/api/market/task'
import taskDetailsVue from './compontents/taskDetails.vue'
import videoParticipationDetails from './compontents/videoParticipationDetails.vue'
import videoList from './compontents/videoList.vue'
import videoDataAnalysis from './compontents/videoDataAnalysis.vue'
import liveParticipationDetails from './compontents/liveParticipationDetails.vue'
import liveList from './compontents/liveList.vue'
import liveDataAnalysis from './compontents/liveDataAnalysis.vue'
import collectParticipationDetails from './compontents/collect_participation_details.vue'
import materialList from './compontents/material_list.vue'
import studyParticipationDetails from './compontents/study_participation_details.vue'
import studyJobList from './compontents/study_job_list.vue'
import imgTextParticipationDetails from './compontents/imgTextParticipationDetails.vue'
import imgTextList from './compontents/imgTextList.vue'
import imgTextDataAnalysis from './compontents/imgTextDataAnalysis.vue'
const route = useRoute()
const activeName = ref('0')
const data = reactive({
  taskInfo: null,
  collectType: 0
})
const pageLoading = ref(true)
async function _getTaskInfoView() {
  const res = await getTaskInfoView({ taskId: route.query.itemId })
  data.taskInfo = res.data
  res.data.taskConfigs.forEach(e => {
    if (e.ckey === 'collect_type' && e.cvalue) {
      data.collectType = Number(e.cvalue)
    }
  })

  pageLoading.value = false
}
const pageSource = ref('')
onMounted(() => {
  pageLoading.value = true
  pageSource.value = route.query.pageSource
  _getTaskInfoView()
})

console.log(route.query)
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  .left {
    width: 303px;
    height: 100vh;
    border-radius: 4px;
    height: 100%;
  }
  .right {
    margin-left: 16px;
    width: calc(100% - 315px);
    // background-color: rgb(5, 238, 238);
    height: 100%;
    .tab {
      // background-color: #fff;
      .el-tabs {
        // padding-top: 16px;

        :deep(.el-tabs__header) {
          background: #fff;
          padding: 16px 0 0 24px;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>

<template>
  <div class="create_task">
    <div class="task_form">
      <el-form ref="taskForm" :model="data.taskInfo" :rules="data.rules" label-width="240px">
        <!-- 基本设置 -->
        <basic-setting
          :disabled="data.disabled"
          :taskType="data.type"
          :basicDisabled="data.basicDisabled"
          :taskInfo="data.taskInfo"
          :pageSource="pageSource"
          :timeChoseDisabled="data.disableActivityChoseTimeObject"
          :isFromActivity="data.isFromActivity"
          v-if="data.taskInfo.type"
          @updateValidate="updateValidate"
        ></basic-setting>
        <div v-for="(config, index) in data.taskInfo.infoConfigs" :key="index">
          <!--          <mount-setting-->
          <!--            v-if="config.name == '挂载设置' && showDYAPP"-->
          <!--            :disabled="data.disabled"-->
          <!--            :taskType="data.type"-->
          <!--            :mountConfig="data.taskInfo.infoConfigs[index]"-->
          <!--          ></mount-setting>-->
          <collection-setting
            v-if="config.name == '征集设置'"
            :taskType="data.type"
            :disabled="data.disabled"
            :taskInfo="data.taskInfo"
            :collectionConfig="data.taskInfo.infoConfigs[index]"
          ></collection-setting>
          <!--  图文/视频任务 下载发布模式显示这个任务要求        -->
          <requirement
            v-if="
              config.name == '任务要求' && !((data.type == 1 || data.type == 6) && dyVersion == 3)
            "
            :taskType="data.type"
            :pageSource="pageSource"
            :disabled="data.disabled"
            :taskInfo="data.taskInfo"
            :requirement="data.taskInfo.infoConfigs[index]"
            :dyVersion="dyVersion"
          ></requirement>
          <!-- 图文任务下载发布模式 特有的任务要求 -->
          <download-publish-requirement
            :ref="videoRequirementRef"
            v-if="config.ckey == 'video_set' && data.type == 6 && dyVersion == 3"
            :taskType="data.type"
            :disabled="data.disabled"
            :taskInfo="data.taskInfo"
          ></download-publish-requirement>
          <video-setting
            v-if="config.ckey == 'video_set' && data.type != 6 && data.type != 5"
            @updateValidate="updateValidate"
            :disabled="data.disabled"
            :taskInfo="data.taskInfo"
            :taskType="data.type"
            :videoConfig="data.taskInfo.infoConfigs[index]"
            :pageSource="pageSource"
            @publishPlatformChange="publishPlatformChange"
          ></video-setting>
          <imgTextSetting
            v-if="config.ckey == 'video_set' && data.type == 6"
            @updateValidate="updateValidate"
            :disabled="data.disabled"
            :taskInfo="data.taskInfo"
            :taskType="data.type"
            :videoConfig="data.taskInfo.infoConfigs[index]"
            :pageSource="pageSource"
            @publishPlatformChange="publishPlatformChange"
          ></imgTextSetting>
          <!-- 视频任务下载发布模式 特有的任务要求 -->
          <download-publish-requirement
            :ref="videoRequirementRef"
            v-if="config.ckey == 'video_set' && data.type == 1 && dyVersion == 3"
            :taskType="data.type"
            :disabled="data.disabled"
            :taskInfo="data.taskInfo"
          ></download-publish-requirement>
          <!-- 学习任务才会显示 -->
          <course-setting
            v-if="config.name == '内容设置' && data.type == 5"
            @updateValidate="updateValidate"
            :disabled="data.disabled"
            :courseConfig="data.taskInfo.infoConfigs[index]"
          ></course-setting>
          <!-- 课后任务 -->
          <afterClassTasks
            v-if="config.name == '课后任务'"
            :taskInfo="data.taskInfo"
            @updateValidate="updateValidate"
            :disabled="data.disabled"
            :classConfig="data.taskInfo.infoConfigs[index]"
          ></afterClassTasks>
        </div>
        <!-- 指标奖励 -->
        <target-reward
          :taskType="data.type"
          v-model:target="data.taskInfo.targetConfigs"
          :disabled="data.targetRewardDisabled"
          :taskInfo="data.taskInfo"
          @updateValidate="updateValidate"
        ></target-reward>
        <!-- 任务分发 -->
        <distribute
          v-if="data.taskInfo.id && pageSource != 'growth'"
          :taskInfo="data.taskInfo"
          :disabled="data.disabled"
          :basicDisabled="data.basicDisabled"
          :pageSource="pageSource"
          :taskType="data.type"
          :isEdit="data.isEdit"
          @updateDelivernum="updateDelivernum"
          @updateValidate="updateValidate"
        ></distribute>
        <!-- 任务开启方式 视频和图文放在高级设置里面 -->
        <taskOpenMethod
          v-if="data.taskInfo.id && pageSource != 'growth' && ![1, 6].includes(data.type)"
          :taskInfo="data.taskInfo"
          :disabled="data.disabled"
        ></taskOpenMethod>
        <!-- 高级设置 -->
        <advanced-setting
          v-if="data.taskInfo.id && [1, 6].includes(data.type)"
          :taskInfo="data.taskInfo"
          :disabled="data.disabled"
          :targetRewardDisabled="data.targetRewardDisabled"
          :target="data.taskInfo.targetConfigs"
          @updateValidate="updateValidate"
          :taskType="data.type"
          :pageSource="pageSource"
          @publishPlatformChange="publishPlatformChange"
        ></advanced-setting>
      </el-form>
    </div>
    <div class="footer_btns" v-if="!data.disabled || !data.basicDisabled">
      <el-button @click="cancel">取消</el-button>
      <el-button
        :disabled="saveBtnDisabled"
        type="primary"
        @click="saveTask"
        :loading="data.saving"
      >
        保存
      </el-button>
    </div>

    <!-- 创建失败弹窗 -->
    <el-dialog v-model="data.warningDialogVisible" width="400px" center>
      <template #title>
        <div class="warning_title">{{ data.taskId ? '修改' : '创建' }}失败</div>
      </template>
      <div class="warning_text">{{ data.warningInfo.msg }}</div>
      <template #footer>
        <span class="dialog-footer" v-if="data.warningInfo.code == 501">
          <el-button @click="data.warningDialogVisible = false">暂不创建</el-button>
          <el-button type="primary" @click="toAuditSetting">前往设置</el-button>
        </span>
        <span class="dialog-footer" v-else>
          <el-button type="primary" @click="data.warningDialogVisible = false">我知道了</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import afterClassTasks from './components/afterClass_tasks.vue'
import taskOpenMethod from './components/taskOpen_method.vue'
import basicSetting from './components/basic_setting.vue'
// import mountSetting from './components/mount_setting.vue'
import collectionSetting from './components/collection_setting/index.vue'
import requirement from './components/requirement.vue'
import videoSetting from './components/video_setting/index.vue'
import imgTextSetting from './components/imgText_setting/index.vue'
import targetReward from './components/target_reward.vue'
import distribute from './components/distribute.vue'
import courseSetting from './components/course_setting/index.vue'
import downloadPublishRequirement from './components/download_publish_requirement.vue'
import advancedSetting from './components/advanced_setting.vue'

import { useRoute, useRouter } from 'vue-router'
import { createTask } from './task_create.js'
import { useStore } from 'vuex'
const store = useStore()
const dyVersion = computed(() => store.state.user.dyVersion)

const route = useRoute()
const router = useRouter()
const taskForm = ref(null)
const {
  data,
  updateValidate,
  _getTaskConfig,
  _getTaskInfo,
  updateDelivernum,
  saveTask,
  toAuditSetting
} = createTask('task', taskForm, null, null, route.query.pageSource)

function cancel() {
  router.go(-1)
}

const pageSource = ref('')
// const showDYAPP = computed(() => {
//   const systemModule = store.getters.systemModule
//   return systemModule.filter(item => item.scopeEnglishName === 'Operational Position').length > 0
// })
// 视频任务的任务要求清空POI
const videoRequireRef = ref([])
const videoRequirementRef = el => {
  videoRequireRef.value.push(el)
}
const publishPlatformChange = type => {
  videoRequireRef.value[0]?.publishPlatformChange(type)
}
// 是否禁用保存按钮
const saveBtnDisabled = computed(() => {
  // 任务ai生成的仿写标题时候禁用保存按钮
  return store.state.market.aiCreateLoading
})

onMounted(() => {
  pageSource.value = route.query.pageSource
  if (route.query.disEdit) {
    data.disEdit = true
  }
  data.taskId = route.query.id
  data.type = +route.query.type || 1

  // data.disabled = data.taskId && !route.query.isEdit
  // 有copyId代表是复制该任务
  if (route.query.copyId) {
    _getTaskInfo(route.query.copyId)
  } else {
    data.taskId ? _getTaskInfo() : _getTaskConfig()
    if (data.taskId) {
      data.isEdit = true
    }
  }
})
</script>

<style lang="scss" scoped>
:deep .setting_block {
  background: #ffffff;
  border-radius: 4px;
  margin-bottom: 16px;

  .setting_title {
    padding-left: 24px;
    line-height: 50px;
    font-weight: bold;
    border-bottom: 1px solid #e8e8e8;
    font-size: 18px;
    color: #323233;
  }

  .setting_main {
    padding: 20px 0;

    .tip {
      color: #c0c4cc;
      font-size: 14px;
    }

    .bottom_tip {
      color: #c0c4cc;
      font-size: 14px;
      line-height: 20px;
      margin-top: 4px;
    }
  }

  .remark {
    cursor: pointer;
    color: #364fcd;
    font-size: 12px;
  }
}

.footer_btns {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 58px;
  box-sizing: border-box;
  background: #fff;

  > button {
    margin: 0 16px;
  }
}

:deep .el-form-item__content {
  display: block;
  flex: 0 0 542px;
}

.warning_title {
  color: #f56c6c;
  font-size: 16px;
}

.warning_text {
  line-height: 24px;
}
</style>

<style lang="scss" scoped>
.tooltip-class.is-dark .el-popper__arrow::before {
  background-color: #6e738a;
}

.tooltip-class {
  max-width: 500px !important;
  font-size: 12px !important;
  line-height: 17px !important;
  background-color: #6e738a !important;
}
</style>

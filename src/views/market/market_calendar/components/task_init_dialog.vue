<template>
  <div>
    <el-dialog
      ref="dialog"
      custom-class="hide_footer_line task_init_dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="title"
      width="940px"
      :before-close="handleClose"
    >
      <div class="dialog_content" v-loading="data.loading">
        <div class="dialog_left">
          <template v-for="item in taskTypeInfo.list">
            <div
              :class="{ one_left: true, active_left: taskTypeInfo.chooseType === item.value }"
              v-if="item.show"
              :key="item.value"
              @click="scrollDom(item.value)"
            >
              {{ item.label }}
            </div>
          </template>
        </div>
        <div class="dialog_right">
          <div
            class="right_top"
            :style="!data.disabled || !data.basicDisabled ? '' : 'height:100%'"
            @scroll="scroll"
          >
            <el-form ref="taskForm" :model="data.taskInfo" :rules="data.rules" label-width="180px">
              <div id="basicSettingDOM" v-if="!initInfo.timeChoseDisabled">
                <basic-setting
                  :taskType="data.type"
                  :disabled="data.disabled"
                  :basicDisabled="data.basicDisabled"
                  :taskInfo="data.taskInfo"
                  :isFromCalendar="true"
                  v-if="data.taskInfo.type"
                  @updateValidate="updateValidate"
                ></basic-setting>
              </div>
              <div id="basicSettingDOM" v-else>
                <basic-setting
                  :taskType="data.type"
                  :taskInfo="data.taskInfo"
                  :disabled="data.disabled"
                  :basicDisabled="data.basicDisabled"
                  :timeChoseDisabled="{ startTime: initInfo.startTime, endTime: initInfo.endTime }"
                  :isFromActivity="true"
                  v-if="data.taskInfo.type"
                  :activityChoseValue="activityChoseValue"
                  @updateValidate="updateValidate"
                ></basic-setting>
              </div>
              <div v-for="(config, index) in data.taskInfo.infoConfigs" :key="index">
                <!--                <div id="mountSettingDOM" v-if="config.name == '挂载设置' && showDYAPP">-->
                <!--                  <mount-setting-->
                <!--                    :disabled="data.disabled"-->
                <!--                    :taskType="data.type"-->
                <!--                    :mountConfig="data.taskInfo.infoConfigs[index]"-->
                <!--                  ></mount-setting>-->
                <!--                </div>-->
                <div id="collectionSettingDOM" v-if="config.name == '征集设置'">
                  <collection-setting
                    :disabled="data.disabled"
                    :taskInfo="data.taskInfo"
                    :collectionConfig="data.taskInfo.infoConfigs[index]"
                  ></collection-setting>
                </div>
                <!--   其余任务通用要求             -->
                <div
                  id="requirementDOM"
                  v-if="
                    config.name == '任务要求' &&
                    !((data.type == 1 || data.type == 6) && dyVersion == 3)
                  "
                >
                  <requirement
                    :disabled="data.disabled"
                    :taskInfo="data.taskInfo"
                    :taskType="data.type"
                    pageSource=""
                    :dyVersion="dyVersion"
                    :requirement="data.taskInfo.infoConfigs[index]"
                  ></requirement>
                </div>
                <!-- 抖音下载发布 图文任务要用特殊的任务要求 -->
                <div
                  id="requirementDOM"
                  v-if="config.ckey == 'video_set' && data.type == 6 && dyVersion == 3"
                >
                  <downloadPublishRequirement
                    :ref="videoRequirementRef"
                    :taskType="data.type"
                    :disabled="data.disabled"
                    :taskInfo="data.taskInfo"
                  ></downloadPublishRequirement>
                </div>
                <div id="videoSettingDOM" v-if="config.ckey == 'video_set' && data.type != 6">
                  <video-setting
                    @updateValidate="updateValidate"
                    :disabled="data.disabled"
                    :videoConfig="data.taskInfo.infoConfigs[index]"
                    @getOffsetTop="getOffsetTop"
                    :isFromCalendar="true"
                    :taskInfo="data.taskInfo"
                    :taskType="data.type"
                    @publishPlatformChange="publishPlatformChange"
                  ></video-setting>
                </div>
                <div id="videoSettingDOM" v-if="config.ckey == 'video_set' && data.type == 6">
                  <imgTextSetting
                    @updateValidate="updateValidate"
                    :disabled="data.disabled"
                    :taskInfo="data.taskInfo"
                    :taskType="data.type"
                    :videoConfig="data.taskInfo.infoConfigs[index]"
                    @publishPlatformChange="publishPlatformChange"
                  ></imgTextSetting>
                </div>
                <!-- 抖音下载发布 视频任务要用特殊的任务要求 -->
                <div
                  id="requirementDOM"
                  v-if="config.ckey == 'video_set' && data.type == 1 && dyVersion == 3"
                >
                  <downloadPublishRequirement
                    :ref="videoRequirementRef"
                    :taskType="data.type"
                    :disabled="data.disabled"
                    :taskInfo="data.taskInfo"
                  ></downloadPublishRequirement>
                </div>
              </div>
              <div id="targetRewardDOM">
                <target-reward
                  :taskType="data.type"
                  v-model:target="data.taskInfo.targetConfigs"
                  :taskInfo="data.taskInfo"
                  :disabled="data.targetRewardDisabled"
                  :pageSource="pageSource"
                  @updateValidate="updateValidate"
                ></target-reward>
              </div>
              <div id="distributeDOM" style="padding-bottom: 14px">
                <distribute
                  v-if="data.taskInfo.id"
                  :taskInfo="data.taskInfo"
                  :disabled="data.disabled"
                  :basicDisabled="data.basicDisabled"
                  :taskType="data.type"
                  :isEdit="data.isEdit"
                  :pageSource="pageSource"
                  @updateDelivernum="updateDelivernum"
                  @updateValidate="updateValidate"
                  @getOffsetTop="getOffsetTop"
                ></distribute>
              </div>
              <!--  任务开启方式 视频和图文放在高级设置里面 -->
              <div
                v-if="data.taskInfo.id && ![1, 6].includes(data.type)"
                id="taskOpenMethodDOM"
                :style="
                  !data.disabled || !data.basicDisabled ? 'min-height: 399px' : 'min-height: 463px'
                "
              >
                <!-- 任务开启方式 -->
                <taskOpenMethod
                  v-if="data.taskInfo.id && ![1, 6].includes(data.type)"
                  :taskInfo="data.taskInfo"
                  :disabled="data.disabled"
                ></taskOpenMethod>
              </div>
              <!-- 高级设置 只有视频 和 图文任务显示 -->
              <div
                v-if="data.taskInfo.id && [1, 6].includes(data.type)"
                :style="
                  !data.disabled || !data.basicDisabled ? 'min-height: 399px' : 'min-height: 463px'
                "
                id="advancedSettingDOM"
              >
                <!-- 任务开启方式 -->
                <advanced-setting
                  :taskInfo="data.taskInfo"
                  :disabled="data.disabled"
                  :target="data.taskInfo.targetConfigs"
                  @updateValidate="updateValidate"
                  :taskType="data.type"
                  :pageSource="pageSource"
                  @publishPlatformChange="publishPlatformChange"
                ></advanced-setting>
              </div>
            </el-form>
          </div>
          <div class="right_bottom" v-if="!data.disabled || !data.basicDisabled">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" :loading="data.saving" @click="BeforeSaveTask">
              确定
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

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
import { throttle } from '@/utils/tools.js'
import taskOpenMethod from '../../marketing_task/create_task/components/taskOpen_method.vue'
import basicSetting from '../../marketing_task/create_task/components/basic_setting.vue'
// import mountSetting from '../../marketing_task/create_task/components/mount_setting.vue'
import collectionSetting from '../../marketing_task/create_task/components/collection_setting/index.vue'
import requirement from '../../marketing_task/create_task/components/requirement.vue'
import videoSetting from '../../marketing_task/create_task/components/video_setting/index.vue'
import downloadPublishRequirement from '../../marketing_task/create_task/components/download_publish_requirement.vue'

// import imgTextSetting from './components/imgText_setting/index.vue'
import imgTextSetting from '../../marketing_task/create_task/components/imgText_setting/index.vue'
import targetReward from '../../marketing_task/create_task/components/target_reward.vue'
import distribute from '../../marketing_task/create_task/components/distribute.vue'
import advancedSetting from '../../marketing_task/create_task/components/advanced_setting.vue'
import { createTask } from '../../marketing_task/create_task/task_create.js'
import { TASK_TYPE } from '@/utils/dictionary/task'
import { useStore } from 'vuex'
const store = useStore()
const dyVersion = computed(() => store.state.user.dyVersion)

const props = defineProps({
  initDialog: {
    type: Object,
    default: () => {
      return {
        showOfDetail: false, // 是否显示弹窗
        initInfo: {
          // 增加控制参数，有timeChoseDisabled,startTime-活动开始时间,EndTime-活动结束时间字段，如果是活动过来的，那么就要处理禁止可选择时间为活动时间段范围内
          timeChoseDisabled: false // 是否禁止时间选择范围
        }
      }
    },
    required: true
  },
  pageSource: String
})
const pageSource = toRef(props, 'pageSource')
const initInfo = toRef(props.initDialog, 'initInfo')
const { initDialog } = toRefs(props)
console.log('initDialog', initDialog.value)
if (!initInfo.value) {
  initInfo.value = {
    timeChoseDisabled: false // 是否禁止时间选择范围
  }
}
const dialog = ref()
const taskForm = ref({})
const show = toRef(props.initDialog, 'showOfDetail')
const topList = reactive({
  basicSettingTop: null,
  mountSettingTop: null,
  videoSettingTop: null,
  targetRewardTop: null,
  requirementTop: null,
  distributeTop: null,
  taskOpenMethodTop: null,
  advancedSettingTop: null
})
const emits = defineEmits(['updateList', 'showDetailDialog', 'newTaskSuccess'])

const {
  taskTypeInfo,
  data,
  updateValidate,
  _getTaskConfig,
  _getTaskInfo,
  updateDelivernum,
  saveTask,
  closeDialog,
  getOffsetTop,
  toAuditSetting
} = createTask('calendar', taskForm, dialog, topList, pageSource.value || '', emits)

const title = ref('')
const BeforeSaveTask = throttle(() => {
  saveTask()
}, 700)
// 如果从活动日历进入，选择时间范围的规定
const activityChoseValue = ref([new Date()])
// 时间选择器，选择初始设置
function initDatePickerDefaultValue(startDay) {
  if (!startDay) return [new Date()]
  const year = new Date(startDay).getFullYear()
  const mouth = new Date(startDay).getMonth() + 1
  const startTimeFrom = `${year}-${mouth}-01`
  if (!isNaN(startTimeFrom) && isNaN(Date.parse(startTimeFrom))) return [new Date()]
  return [new Date(startTimeFrom)]
}
// 初始化弹窗
function init() {
  const dialogInfo = JSON.parse(JSON.stringify(props.initDialog))
  console.log(dialogInfo)
  data.isSave = false
  data.loading = true
  activityChoseValue.value = initDatePickerDefaultValue(props.initDialog.initInfo.startTime)
  if (props.initDialog.id) {
    data.isEdit = true
    data.taskId = dialogInfo.id
    if (props.initDialog.disEdit === 1) {
      title.value = TASK_TYPE.getCN(props.initDialog.type) + '任务详情'
    } else {
      title.value = '编辑' + TASK_TYPE.getCN(props.initDialog.type) + '任务'
    }
    data.disEdit = props.initDialog.disEdit === 1
    _getTaskInfo()
  } else if (props.initDialog.copyId) {
    title.value = '创建' + TASK_TYPE.getCN(props.initDialog.type) + '任务'
    data.type = dialogInfo.type
    data.disEdit = false
    _getTaskInfo(props.initDialog.copyId)
  } else if (props.initDialog.type) {
    title.value = '创建' + TASK_TYPE.getCN(props.initDialog.type) + '任务'
    data.type = dialogInfo.type
    if (dialogInfo.startTime) {
      data.startTime = dialogInfo.startTime
    }
    if (dialogInfo.endTime) {
      data.endTime = dialogInfo.endTime
    }
    data.disEdit = false
    _getTaskConfig()
  }
}
init()
// 关闭弹窗
function handleClose(done) {
  // 确定创建成功再调用
  if (data.isSave) {
    emits(
      'updateList',
      props.initDialog.origin === 'detailDialog' ? 'showDetailDialog' : '',
      props.initDialog.id
        ? null
        : { startTime: data.taskInfo.startTime, endTime: data.taskInfo.endTime }
    )
  } else {
    if (props.initDialog.origin === 'detailDialog') {
      emits('showDetailDialog')
    }
  }
  console.log('任务详情弹窗关闭')
  done()
}
const scrollDom = throttle(e => {
  const scrollTop = document.querySelector(`#${e}DOM`).offsetTop
  document.querySelector('.right_top').scrollTop = scrollTop
  getOffsetTop()
})

// 视频任务的任务要求清空POI
const videoRequireRef = ref([])
const videoRequirementRef = el => {
  videoRequireRef.value.push(el)
}
const publishPlatformChange = type => {
  videoRequireRef.value[0]?.publishPlatformChange(type)
}
function scroll(e) {
  const scrollTop = e.srcElement.scrollTop + 2
  if (topList.taskOpenMethodTop != null && scrollTop >= topList.taskOpenMethodTop) {
    taskTypeInfo.chooseType = 'taskOpenMethod'
  } else if (topList.advancedSettingTop != null && scrollTop >= topList.advancedSettingTop) {
    taskTypeInfo.chooseType = 'advancedSetting'
  } else if (scrollTop >= topList.distributeTop) {
    taskTypeInfo.chooseType = 'distribute'
  } else if (scrollTop >= topList.targetRewardTop) {
    taskTypeInfo.chooseType = 'targetReward'
  } else if (scrollTop >= topList.requirementTop && data.type === 2) {
    taskTypeInfo.chooseType = 'requirement'
  } else if (
    scrollTop >= topList.requirementTop &&
    (dyVersion.value !== 3 || (dyVersion.value === 3 && data.type === 1))
  ) {
    taskTypeInfo.chooseType = 'requirement'
  } else if (topList.videoSettingTop != null && scrollTop >= topList.videoSettingTop) {
    taskTypeInfo.chooseType = 'videoSetting'
  } else if (scrollTop >= topList.requirementTop && dyVersion.value === 3 && data.type === 6) {
    taskTypeInfo.chooseType = 'requirement'
  } else if (topList.mountSettingTop != null && scrollTop >= topList.mountSettingTop) {
    taskTypeInfo.chooseType = 'mountSetting'
  } else if (scrollTop >= topList.basicSettingTop) {
    taskTypeInfo.chooseType = 'basicSetting'
  }
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
:deep #distributeDOM {
  .setting_block {
    margin-bottom: 0;
  }
}
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
    // display: none;
  }
  .setting_main {
    padding: 32px 0 0;
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
  .mount_list {
    margin-top: 0;
    flex-wrap: wrap;
    .mount_item {
      margin-top: 16px;
    }
  }
}
:deep .el-form-item__content {
  display: block;
  flex: 0 0 470px;
  .input_keyword_choose {
    width: 470px !important;
  }
  .result_box .one_result {
    margin-right: 0;
    width: 470px !important;
  }
}

.warning_title {
  color: #f56c6c;
  font-size: 16px;
}
.warning_text {
  line-height: 24px;
}
.tooltip-class.is-dark .el-popper__arrow::before {
  background-color: #6e738a;
}
.tooltip-class {
  max-width: 500px !important;
  font-size: 12px !important;
  line-height: 17px !important;
  background-color: #6e738a !important;
}
.dialog_content {
  border-top: 1px solid #dcdee0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  height: 464px;
  .dialog_left {
    width: 88px;
    height: 100%;
    background: #f7f8fa;
    border-radius: 0px 0px 0px 4px;
    padding-top: 4px;
    .one_left {
      padding: 6px 0;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;
    }
    .active_left {
      color: #364fcd;
    }
  }
  .dialog_right {
    width: calc(100% - 88px);
    height: 100%;
    position: relative;
    .right_top {
      // padding-top: 20px;
      height: calc(100% - 64px);
      overflow-y: auto;
      :deep(.target_main) {
        width: 650px !important;
      }
      :deep(.switch_and_text) {
        width: 660px !important;
      }
      :deep(.quota_line) {
        width: 660px !important;
      }
    }
    .right_bottom {
      position: absolute;
      bottom: 0px;
      right: 0px;
      padding: 16px;
      background: #fff;
      width: 100%;
      text-align: right;
    }
  }
}
:deep(.tip) {
  width: max-content;
}
</style>

<template>
  <div class="left_page">
    <section class="taskDetail" v-if="data.taskInfo.id">
      <h3 class="taskType">
        <img :src="typeIconEnum[data.taskInfo.type]" />
        <p>
          {{ TASK_TYPE.getCN(data.taskInfo.type) }}任务
          <template v-if="data.collectTypeStr">({{ data.collectTypeStr }})</template>
        </p>
        <p class="state" v-if="pageSource != 'growth'">
          {{ TASK_STATUS.getCN(data.taskInfo.status) }}
        </p>
      </h3>
      <p class="taskName">{{ data.taskInfo.name }}</p>
      <div class="taskTime" v-if="pageSource != 'growth'">
        <p>任务时间:</p>
        <p>
          {{ data.taskInfo.startTime.substring(0, 16) }} -
          {{ data.taskInfo.endTime.substring(0, 16) }}
        </p>
      </div>
      <div class="taskInfo">
        <ul>
          <li v-if="pageSource != 'growth'">
            <p>任务分发：</p>
            <p v-if="data.taskInfo.taskGroup == 3">
              {{ wanSliceFormat(data.taskInfo.deliverCount || 0, false, true) }}人
            </p>
            <p v-else>{{ TASK_DELIVER_TYPE.getCN(data.taskInfo.deliverType) }}</p>
          </li>
          <!-- <li
            v-if="
              data.taskInfo.type != TASK_TYPE.get('collection') &&
              data.taskInfo.type != TASK_TYPE.get('study')
            "
          >
            <p>{{ TASK_TYPE.getCN(data.taskInfo.type) }}挂载：</p>
            <p>小程序 | 营销组件 | 小黄车</p>
          </li> -->
          <li v-if="data.taskInfo.type == TASK_TYPE.get('video')">
            <p>视频发布：</p>
            <p>{{ data.releaseTypeStr }}</p>
          </li>
          <template v-if="data.taskInfo.type == TASK_TYPE.get('collection')">
            <template v-if="data.collectTypeStr == '原料'">
              <li>
                <p>流水线：</p>
                <p class="line-hidden1">
                  共{{ data.pipelineNum }}条
                  <span v-if="data.pipelineName">({{ data.pipelineName }})</span>
                </p>
              </li>
              <li>
                <p>流水线标签：</p>
                <p>{{ data.lableNum }}种</p>
              </li>
              <li>
                <p>每种原料征集：</p>
                <p>{{ data.collectNum }}个</p>
              </li>
            </template>
            <template v-else>
              <li>
                <p>征集方式：</p>
                <p>{{ data.collectMode == '1' ? '直接上传视频' : '创意模板合成视频' }}</p>
              </li>
              <template v-if="data.collectMode == '1'">
                <li>
                  <p>视频数：</p>
                  <p>每人{{ data.collectNum }}个</p>
                </li>
                <li>
                  <p>视频长度：</p>
                  <p>{{ data.videoDurationRange[0] }} - {{ data.videoDurationRange[1] }}秒</p>
                </li>
              </template>
            </template>
          </template>
          <li>
            <p>任务简介：</p>
            <p>{{ data.taskInfo.taskInfo || '-' }}</p>
          </li>
          <li
            v-if="
              data.taskInfo.type != TASK_TYPE.get('collection') &&
              data.taskInfo.type != TASK_TYPE.get('study')
            "
          >
            <p>任务要求：</p>
            <p>{{ data.taskRequire || '-' }}</p>
          </li>
          <template v-if="data.taskInfo.type == TASK_TYPE.get('study')">
            <li>
              <p>学习形式：</p>
              <p>{{ STUDY_TYPE.getCN(data.courseForm) }}</p>
            </li>
            <li v-if="data.courseForm === '1'">
              <p>学习内容：</p>
              <p style="cursor: pointer; color: #364fcd" @click="data.previewDialogVisible = true">
                预览
              </p>
            </li>

            <template v-if="data.courseHomeworkOpen && data.courseHomeworkOpen === '1'">
              <li>
                <p>作业类型：</p>
                <p>{{ STUDY_JOB_TYPE.getCN(data.courseHomeworkType) }}</p>
              </li>
              <li>
                <p>作业要求：</p>
                <p style="white-space: pre-wrap; word-break: break-all">
                  {{ data.courseHomeworkRequire || '-' }}
                </p>
              </li>
            </template>
          </template>
        </ul>
      </div>
    </section>
    <!-- 任务指标 -->
    <section class="taskTarget">
      <h3>
        <img src="@/assets/images/operate/target.png" />
        <p>任务指标和奖励</p>
      </h3>
      <div class="videoTarget">
        <template v-for="(group, groupIndex) in data.taskInfo.targetConfigs" :key="groupIndex">
          <ul class="targetList" v-if="group.targetKey != 'all_target' && group.valid">
            <div class="title">
              <div class="left">
                <img
                  v-if="group.targetKey == 'transform_target'"
                  src="https://tagvv-1256030678.file.myqcloud.com/202202216yvw4.png"
                />
                <img
                  v-else-if="group.targetKey == 'video_target'"
                  src="@/assets/images/operate/video_2.png"
                />
                <img
                  v-else-if="data.taskInfo.type === TASK_TYPE.get('live')"
                  src="@/assets/images/operate/live_2.png"
                />
                <p>{{ group.targetName }}</p>
              </div>

              <p class="right">奖励/金币</p>
            </div>
            <template v-for="(subGroup, subGroupIndex) in group.children" :key="subGroupIndex">
              <template v-for="(target, targetIndex) in subGroup.targetRwwards" :key="targetIndex">
                <li v-if="target.cvalue">
                  <p>
                    {{ subGroup.targetName }}
                    <span>{{ target.cvalue }}</span>
                    <!-- 征集指标解释 -->
                    <el-tooltip
                      v-if="
                        subGroup.targetKey == 'collect_audit_success_count_target' &&
                        targetIndex === 0
                      "
                      class="item"
                      effect="dark"
                      placement="top-start"
                    >
                      <template #content>
                        <p v-if="data.collectTypeStr == '原料'">征集原料任务：审核通过标签数</p>
                        <p v-else>征集视频任务：审核通过视频数</p>
                        <p v-if="subGroup.targetRwwards.length > 1">
                          支持阶梯奖励，达到对应阶梯指标后获得的额外金币数。例：1指标/10金币，2指标/20金币，达到2指标累计获得30金币。
                        </p>
                      </template>
                      <img
                        src="@/assets/images/operate/tip_line.png"
                        style="width: 12px; height: 12px; vertical-align: -10%; margin-left: 8px"
                        alt
                      />
                    </el-tooltip>
                    <!-- 阶梯奖励解释 -->
                    <el-tooltip
                      v-else-if="subGroup.targetRwwards.length > 1 && targetIndex === 0"
                      class="item"
                      effect="dark"
                      content="支持阶梯奖励，达到对应阶梯指标后获得的额外金币数。例：1指标/10金币，2指标/20金币，达到2指标累计获得30金币。"
                      placement="top-start"
                    >
                      <img
                        src="@/assets/images/operate/tip_line.png"
                        style="width: 12px; height: 12px; vertical-align: -10%; margin-left: 8px"
                        alt
                      />
                    </el-tooltip>
                  </p>
                  <p v-for="(reward, rewardIndex) in target.rewards" :key="rewardIndex">
                    <span>{{ reward.value === null ? '-' : reward.value }}</span>
                    {{ reward.typeName }}
                  </p>
                </li>
              </template>
            </template>
            <li v-if="group.targetRwwards[0].rewards[0].value">
              <p>
                完成所有{{ group.targetName }}
                <span></span>
              </p>
              <p v-for="(reward, rewardIndex) in group.targetRwwards[0].rewards" :key="rewardIndex">
                <span>{{ reward.value === null ? '-' : reward.value }}</span>
                {{ reward.typeName }}
              </p>
            </li>
          </ul>
        </template>
        <div class="end" v-if="data.allTargetRewards">
          <p>完成所有指标：</p>
          <p>
            奖励
            <span>{{ data.allTargetRewards }}</span>
            金币
          </p>
        </div>
        <div
          class="end"
          v-if="data.multiJoinTargetReward && data.multiJoinTargetReward.targetReward"
        >
          <p style="display: flex">
            重复参与
            <span>{{ data.multiJoinTargetReward.targetValue }}</span>
            次：
          </p>
          <p>
            奖励
            <span>{{ data.multiJoinTargetReward.targetReward }}</span>
            金币
          </p>
        </div>
      </div>
    </section>
    <!-- 任务数据 -->
    <section class="taskData">
      <h3>
        <img src="@/assets/images/operate/data.png" />
        <p>任务数据</p>
      </h3>
      <div class="data">
        <div class="list" v-if="pageSource != 'growth'">
          <p>{{ data.taskInfo.deliverCount }}</p>
          <p>分发人数</p>
        </div>
        <!-- v-if="data.taskInfo.type != TASK_TYPE.get('study')" 之前学习任务没有参与人数 -->
        <div class="list">
          <p>{{ data.taskInfo.joinCount }}</p>
          <p>参与人数</p>
        </div>
        <div class="list">
          <p>{{ data.taskInfo.joinSucceedCount }}</p>
          <p>参与成功人数</p>
        </div>
        <div class="list">
          <p>{{ data.taskInfo.finishCount }}</p>
          <p>完成人数</p>
        </div>
        <div class="list" v-if="dyVersion == 3 && pageSource != 'growth'">
          <p>{{ data.taskInfo.totalUserJoinTimes }}</p>
          <p>参与人次</p>
        </div>
        <div class="list" v-if="dyVersion == 3 && pageSource != 'growth'">
          <p>{{ data.taskInfo.totalUserJoinSuccessTimes }}</p>
          <p>参与成功人次</p>
        </div>
        <div class="list" v-if="dyVersion == 3 && pageSource != 'growth'">
          <p>{{ data.taskInfo.totalUserCompleteTimes }}</p>
          <p>完成人次</p>
        </div>
        <template v-if="data.taskInfo.type == TASK_TYPE.get('collection')">
          <div class="list">
            <p>{{ data.taskInfo.collectUploadCount || 0 }}</p>
            <p>上传{{ data.collectTypeStr }}数</p>
          </div>
          <div class="list">
            <p>{{ data.taskInfo.collectAuditSuccessCount || 0 }}</p>
            <p>审核通过{{ data.collectTypeStr }}数</p>
          </div>
        </template>
      </div>
    </section>
    <!-- 学习内容预览 -->
    <preview-class-dialog
      v-model:dialogVisible="data.previewDialogVisible"
      :classInfo="data.previewClassInfo"
    ></preview-class-dialog>
  </div>
</template>

<script setup>
import {
  TASK_DELIVER_TYPE,
  TASK_STATUS,
  TASK_TYPE,
  RELEASE_TYPE,
  STUDY_TYPE,
  STUDY_JOB_TYPE
} from '@/utils/dictionary/task'
import previewClassDialog from '@/views/market/study/course_management/components/preview_class_dialog.vue'
import { useStore } from 'vuex'
import { wanSliceFormat } from '@/utils/tools.js'
const store = useStore()
const dyVersion = computed(() => store.state.user.dyVersion)

const props = defineProps({
  taskInfo: Object,
  pageSource: String
})
const data = reactive({
  taskInfo: {},
  taskRequire: '',
  allTargetRewards: 0,
  multiJoinTargetReward: {},
  releaseTypeStr: '',
  collectNum: 0,
  lableNum: 0,
  pipelineNum: 0,
  collectTypeStr: '', // 征集类型
  videoDurationRange: [],
  previewDialogVisible: false,
  previewClassInfo: {},
  pipelineName: '', // 流水线名称
  collectMode: '1' // 征集方式 1直接上传视频 2创意模板合成视频
})
const typeIconEnum = {
  1: 'https://tagvv-1256030678.file.myqcloud.com/img/20211229182233b51cf74a22.png',
  2: 'https://tagvv-1256030678.file.myqcloud.com/img/20211229144603f8e18e1209.png',
  3: 'https://tagvv-1256030678.file.myqcloud.com/20220328zjfg8.png',
  5: 'https://tagvv-1256030678.file.myqcloud.com/20220519he08l.png',
  6: 'https://tagvv-1256030678.file.myqcloud.com/20230926mhcjn.png'
}
const taskInfo = toRef(props, 'taskInfo')
async function _getTaskInfoView() {
  data.taskInfo = taskInfo.value
  data.taskInfo.taskConfigs.forEach(item => {
    if (item.ckey === 'task_require_info') {
      data.taskRequire = item.cvalue
    }
    // 只有视频任务才有视频发布
    if (data.taskInfo.type === TASK_TYPE.get('video')) {
      if (item.ckey === 'video_audit_set') {
        if (item.cvalue === '1') {
          data.releaseTypeStr = '上传审核发布'
        }
      } else {
        if (item.ckey === 'video_push_mode') {
          console.log('video_push_mode', item.cvalue)
          // debugger

          data.releaseTypeStr = RELEASE_TYPE.getCN(Number(item.cvalue))
          if (item.cvalue.length === 3) {
            data.releaseTypeStr = '上传直接发布 | 拍摄直接发布'
          }
        }
      }
    }
    if (item.cvalue) {
      if (item.ckey === 'collect_num') {
        data.collectNum = item.cvalue
      }
      if (item.ckey === 'pipeline_lables') {
        data.lableNum = item.cvalue.split(',').length
      }
      if (item.ckey === 'choose_pipeline') {
        data.pipelineNum = item.cvalue.split(',').length
      }
      if (item.ckey === 'collect_type') {
        data.collectTypeStr = Number(item.cvalue) === 2 ? '原料' : '视频'
      }
      if (item.ckey === 'video_duration_range') {
        data.videoDurationRange = item.cvalue.split(',')
      }
      if (item.ckey === 'learning_content') {
        data.previewClassInfo = JSON.parse(item.cvalue)
      }
      if (item.ckey === 'course_form') {
        data.courseForm = item.cvalue
      }
      if (item.ckey === 'course_homework_open') {
        data.courseHomeworkOpen = item.cvalue
      }
      if (item.ckey === 'course_homework_type') {
        data.courseHomeworkType = item.cvalue
      }
      if (item.ckey === 'course_homework_requirement') {
        data.courseHomeworkRequire = item.cvalue
      }
      if (item.ckey === 'collect_mode') {
        data.collectMode = item.cvalue
      }
    }
  })
  data.taskInfo.targetConfigs.forEach(item => {
    if (item.targetKey === 'all_target') {
      data.allTargetRewards = item.targetRwwards[0].rewards[0].value
    } else if (item.targetKey === 'multi_join_target') {
      data.multiJoinTargetReward = {
        targetValue: item.targetRwwards[0].cvalue || null,
        targetReward: item.targetRwwards[0].rewards[0].value || null
      }
    }
    let validChildNum = 0
    if (item.children && item.children.length) {
      item.children.forEach(child => {
        child.targetRwwards.forEach(target => {
          if (target.cvalue) validChildNum++
        })
      })
    }
    item.valid = validChildNum !== 0
  })
  // 流水线名称
  if (taskInfo.value.pipelineInfos && taskInfo.value.pipelineInfos.length > 0) {
    const pipelineName = taskInfo.value.pipelineInfos.map(x => x.name)
    console.log('pipelineName', pipelineName)
    data.pipelineName = pipelineName.join('、')
  }
}

onMounted(() => {
  _getTaskInfoView()
})
</script>

<style lang="scss" scoped>
.left_page {
  background-color: #fff;
  padding: 22px 28px 25px 25px;
  h3 {
    display: flex;
    align-items: center;
    img {
      height: 20px;
      width: 20px;
      margin-right: 8px;
    }
    p {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
    .state {
      margin-left: 22px;
      background: rgba(204, 208, 229, 0.51);
      border-radius: 14px;
      padding: 2px 8px;
      color: #364fcd;
      font-size: 12px;
    }
  }
  .taskDetail {
    .taskType,
    h3 {
      display: flex;
      align-items: center;
      img {
        height: 20px;
        width: 20px;
        margin-right: 8px;
      }
      p {
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #303133;
      }
      .state {
        margin-left: 22px;
        background: rgba(204, 208, 229, 0.51);
        border-radius: 14px;
        padding: 2px 8px;
        color: #364fcd;
        font-size: 12px;
      }
    }
    .taskName {
      @include mult_line(2);
      line-height: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      line-height: 20px;
      margin-top: 16px;
    }
    .taskTime {
      margin-top: 10px;
      p {
        &:nth-of-type(1) {
          height: 17px;
          font-size: 12px;
          color: #303133;
          line-height: 17px;
        }
        &:nth-of-type(2) {
          margin-top: 4px;
          height: 17px;
          font-size: 12px;
          color: #909399;
          line-height: 17px;
        }
      }
    }

    .taskInfo {
      margin-top: 12px;
      padding-bottom: 24px;
      border-bottom: 1px solid #eceef5;
      ul {
        li {
          display: flex;
          line-height: 17px;
          margin-bottom: 9px;
          flex-wrap: wrap;
          p {
            &:nth-of-type(1) {
              flex-shrink: 0;
              font-size: 12px;
              color: #909399;
            }
            &:nth-of-type(2) {
              flex: 1;
              font-size: 12px;
              color: #303133;
              line-height: 17px;
            }
          }
        }
      }
    }
  }

  .taskTarget {
    margin-top: 16px;
    .videoTarget {
      margin-top: 16px;
      .title {
        display: flex;
        justify-content: space-between;
        padding-bottom: 10px;
        margin-bottom: 10px;
        line-height: 16px;
        border-bottom: 1px solid #eceef5;
        .left {
          img {
            width: 16px;
            height: 16px;
            margin-right: 6px;
          }
          display: flex;
          align-items: center;
          p {
            font-size: 12px;
            color: #303133;
          }
        }
        .right {
          font-size: 12px;
          color: #909399;
        }
      }
      .targetList {
        margin-top: 12px;
        border-bottom: 1px solid #eceef5;
        li {
          padding-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          p {
            font-size: 12px;
            color: #909399;
            height: 17px;
            line-height: 17px;
            &:nth-of-type(1) {
              span {
                color: rgba(48, 49, 51, 1);
              }
            }

            &:nth-child(2) {
              span {
                color: rgba(255, 179, 41, 1);
              }
            }
          }
        }
      }
      .end {
        padding: 17px 0 12px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #eceef5;

        p {
          height: 17px;
          font-size: 14px;

          color: #303133;
          line-height: 17px;
          &:nth-of-type(2) {
            height: 22px;
            line-height: 22px;
            span {
              color: rgba(255, 179, 41, 1);
            }
          }
        }
      }
    }
  }

  .taskData {
    padding-top: 32px;
    .data {
      padding-top: 8px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: space-between;
      .list {
        flex: 0 1 82px;
        display: flex;
        flex-direction: column;
        text-align: center;
        margin-top: 15px;
        p {
          &:nth-of-type(1) {
            height: 25px;
            font-size: 18px;
            font-family: PingFangSC-Semibold, PingFang SC;
            font-weight: 600;
            color: #333333;
            line-height: 25px;
          }
          &:nth-of-type(2) {
            height: 17px;
            font-size: 12px;

            color: #909399;
            line-height: 17px;
          }
        }
      }
    }
  }
}
</style>

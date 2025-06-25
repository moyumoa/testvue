<template>
  <div>
    <el-dialog
      ref="dialog"
      :model-value="isShow"
      title="审核任务"
      width="447px"
      destroy-on-close
      @closed="closeDialog"
    >
      <section class="task">
        <div class="left_page">
          <section class="taskDetail" v-if="taskData.taskInfo.id">
            <p class="taskName">
              {{ taskData.taskInfo.name }} - {{ TASK_TYPE.getCN(taskData.taskInfo.type) }}任务
            </p>
            <div class="taskTime">
              <p>任务时间:</p>
              <p>
                {{ taskData.taskInfo.startTime.substring(0, 16) }} -
                {{ taskData.taskInfo.endTime.substring(0, 16) }}
              </p>
            </div>
            <div class="taskInfo">
              <ul>
                <li>
                  <p>任务分发：</p>
                  <p>{{ TASK_DELIVER_TYPE.getCN(taskData.taskInfo.deliverType) }}</p>
                </li>
                <li v-if="taskData.taskInfo.type != TASK_TYPE.get('collection')">
                  <p>{{ TASK_TYPE.getCN(taskData.taskInfo.type) }}挂载：</p>
                  <p>小程序 | 营销组件 | 小黄车</p>
                </li>
                <li v-if="taskData.taskInfo.type == TASK_TYPE.get('video')">
                  <p>视频发布：</p>
                  <p>{{ taskData.releaseTypeStr }}</p>
                </li>
                <template v-if="taskData.taskInfo.type == TASK_TYPE.get('collection')">
                  <li>
                    <p>流水线：</p>
                    <p>{{ pipelineNum }}条</p>
                  </li>
                  <li>
                    <p>流水线标签：</p>
                    <p>{{ lableNum }}个</p>
                  </li>
                  <li>
                    <p>每种素材征集：</p>
                    <p>{{ collectNum }}个</p>
                  </li>
                </template>
                <li>
                  <p>任务简介：</p>
                  <p>{{ taskData.taskInfo.taskInfo || '-' }}</p>
                </li>
                <li v-if="taskData.taskInfo.type != TASK_TYPE.get('collection')">
                  <p>任务要求：</p>
                  <p>{{ taskData.taskRequire || '-' }}</p>
                </li>
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
              <template
                v-for="(group, groupIndex) in taskData.taskInfo.targetConfigs"
                :key="groupIndex"
              >
                <ul class="targetList" v-if="group.targetKey != 'all_target' && group.valid">
                  <div class="title">
                    <div class="left">
                      <img
                        v-if="taskData.taskInfo.type === TASK_TYPE.get('live')"
                        src="@/assets/images/operate/live_2.png"
                      />
                      <img
                        v-if="group.targetKey == 'video_target'"
                        src="@/assets/images/operate/video_2.png"
                      />
                      <img
                        v-if="group.targetKey == 'transform_target'"
                        src="https://tagvv-1256030678.file.myqcloud.com/202202216yvw4.png"
                      />
                      <p>{{ group.targetName }}</p>
                    </div>

                    <p class="right">奖励/金币</p>
                  </div>
                  <template
                    v-for="(subGroup, subGroupIndex) in group.children"
                    :key="subGroupIndex"
                  >
                    <template
                      v-for="(target, targetIndex) in subGroup.targetRwwards"
                      :key="targetIndex"
                    >
                      <li v-if="target.cvalue">
                        <p>
                          {{ subGroup.targetName }}
                          <span>{{ target.cvalue }}</span>

                          <el-tooltip
                            v-if="subGroup.targetRwwards.length > 1 && targetIndex === 0"
                            class="item"
                            effect="dark"
                            content="支持阶梯奖励，达到对应阶梯指标后获得的额外金币数。例：1指标/10金币，2指标/20金币，达到2指标累计获得30金币。"
                            placement="top-start"
                          >
                            <img
                              src="@/assets/images/operate/tip_line.png"
                              style="
                                width: 12px;
                                height: 12px;
                                vertical-align: -10%;
                                margin-left: 8px;
                              "
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
                    <p
                      v-for="(reward, rewardIndex) in group.targetRwwards[0].rewards"
                      :key="rewardIndex"
                    >
                      <span>{{ reward.value === null ? '-' : reward.value }}</span>
                      {{ reward.typeName }}
                    </p>
                  </li>
                </ul>
              </template>
              <div class="end" v-if="taskData.allTargetRewards">
                <p>完成所有指标：</p>
                <p>
                  奖励
                  <span>{{ taskData.allTargetRewards }}</span>
                  金币
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <!-- 任务结果 -->
      <section class="taskResult">
        <div
          class="tasknormal"
          v-if="taskData.taskOtherInfo.status === 1 || taskData.taskOtherInfo.status === 2"
        >
          <!-- 审核人 -->
          <div class="block">
            <p class="top">审核人</p>
            <div>
              <img
                v-if="taskData.taskOtherInfo.auditorHead"
                :src="taskData.taskOtherInfo.auditorHead"
                style="width: 24px; height: 24px; border-radius: 50%"
                alt
              />
              <DefaultPhoto v-else :name="taskData.taskOtherInfo.auditorName || '--'" />
              <p>{{ taskData.taskOtherInfo.auditorName }}</p>
            </div>
          </div>
          <!-- 审核结果 -->
          <div class="block">
            <p class="top">审核结果</p>

            <div class="content">
              <p>{{ taskData.taskOtherInfo.status === 2 ? '审核不通过' : '审核通过' }}</p>
              <p style="margin-left: 40px">{{ taskData.taskOtherInfo.remark }}</p>
            </div>
          </div>
          <!-- 审核时间 -->
          <div class="block">
            <p class="top">审核时间</p>
            <div class="content">
              <p>{{ taskData.taskOtherInfo.auditTime }}</p>
            </div>
          </div>
        </div>
        <div class="taskerror" v-if="taskData.taskOtherInfo.status === 4">
          <div class="block">
            <p class="top">审核已过期</p>
            <div class="content">
              <p>任务已结束</p>
            </div>
          </div>
        </div>
      </section>
      <section class="footer" v-if="taskData.taskOtherInfo.status === 3">
        <!-- 审核模块 -->
        <div style="display: flex; align-items: center">
          <p style="margin-right: 40px">审核</p>
          <el-radio-group v-model="query.auditResult">
            <el-radio :label="1">审核通过</el-radio>
            <el-radio :label="2">审核不通过</el-radio>
          </el-radio-group>
        </div>
        <div style="margin-top: 16px">
          <template v-if="query.auditResult == 2">
            <el-form :rules="rules">
              <el-form-item prop="reason">
                <el-input
                  v-model="query.remark"
                  :rows="1"
                  type="textarea"
                  resize="none"
                  placeholder="请输入审核不通过理由，最多15字"
                  style="font-size: 14px"
                  :maxlength="15"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </template>
        </div>
      </section>

      <template #footer v-if="taskData.taskOtherInfo.status === 3">
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="updateTask()">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { pageList } from './model/get_list'
import DefaultPhoto from '../default_photo/index.vue'
import { TASK_DELIVER_TYPE, TASK_TYPE } from '@/utils/dictionary/task'

const props = defineProps({
  isShow: {
    type: Boolean
  },
  taskData: {
    type: Object
  },
  taskId: {
    type: Array
  }
})
const { isShow, taskData, taskId } = toRefs(props)
const emits = defineEmits(['update:isShow', 'upData'])
const { query, updateTask } = pageList(emits, props)

function queryCkeyOfCvalue(ceky) {
  const taskConfigs = taskData.value.taskInfo.taskConfigs
  for (const i in taskConfigs) {
    const config = taskConfigs[i]
    if (config.ckey === ceky) {
      console.log(config.ckey, config.cvalue)
      return config.cvalue
    }
  }
}

const collectNum = computed(() => {
  return queryCkeyOfCvalue('collect_num')
})
const lableNum = computed(() => {
  const _labels = queryCkeyOfCvalue('pipeline_lables')
  if (_labels) {
    return _labels.split(',').length
  } else {
    return 0
  }
})
const pipelineNum = computed(() => {
  const _pipelines = queryCkeyOfCvalue('choose_pipeline')
  if (_pipelines) {
    return _pipelines.split(',').length
  } else {
    return 0
  }
})

// 关闭整个弹窗
function closeDialog() {
  query.remark = ''
  query.auditResult = null
  emits('update:isShow', false)
}

watchEffect(() => {
  query.auditIds = taskId.value
  // console.log(query.auditIds)
})
</script>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 20px 16px 22px 16px;
}
.task {
  // padding: 0px 0px 28px 0px;
  // border-bottom: 1px solid #dcdee0;
  .title {
    height: 24px;
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #303133;
    line-height: 24px;
    margin-bottom: 12px;
  }

  .left_page {
    background-color: #fff;
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
        // margin-top: 16px;
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
        padding-bottom: 5px;
        border-bottom: 1px solid #eceef5;
        ul {
          li {
            display: flex;
            line-height: 17px;
            margin-bottom: 9px;
            flex-wrap: wrap;
            p {
              &:nth-of-type(1) {
                // flex: 3;
                font-size: 12px;
                color: #909399;
              }
              &:nth-of-type(2) {
                flex: 8;
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
          padding-bottom: 4px;
          border-bottom: 1px solid #eceef5;
          display: flex;
          justify-content: space-between;
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
        padding-top: 23px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .list {
          flex: 1;
          display: flex;
          flex-direction: column;
          text-align: center;
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
}
.taskResult {
  .tasknormal,
  .taskerror {
    .block {
      margin-top: 20px;
      .top {
        height: 24px;
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #303133;
        line-height: 24px;
        margin-bottom: 12px;
      }
      div {
        display: flex;
        align-items: center;
        .default_photo {
          margin-right: 12px;
          width: 24px;
          height: 24px;
        }
        img {
          margin-right: 12px;
          width: 24px;
          height: 24px;
        }
        p {
          height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
        }
      }
    }
  }
}
.footer {
  padding: 20px 0px 0px 0px;
}
</style>

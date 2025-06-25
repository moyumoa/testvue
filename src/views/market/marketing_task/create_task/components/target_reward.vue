<template>
  <div class="setting_block">
    <div class="setting_title">任务指标和奖励</div>
    <div class="setting_main">
      <el-form-item label="指标和奖励：" prop="target">
        <div class="tip" style="display: flex; align-items: center; margin-bottom: 8px">
          <div>请勾选并填写至少一个指标（金币为非必填项），点击" + "可设置阶梯指标和奖励</div>
          <el-tooltip
            content="阶梯奖励：达到对应阶梯指标后获得额外的金币   例：1指标/奖10金币，2指标/额外奖20金币；若达成2指标，累计获得30金币"
            placement="top"
            :style="{ 'margin-left': '4px' }"
          >
            <img
              src="@/assets/images/operate/tip_line.png"
              style="width: 14px; height: 14px; margin-left: 8px"
            />
          </el-tooltip>
        </div>
        <div class="target_main">
          <div class="target_group" v-for="(targetGroup, index) in target" :key="index">
            <!-- 指标大类的group_header -->
            <div
              class="group_header"
              v-if="!['all_target', 'multi_join_target'].includes(targetGroup.targetKey)"
            >
              <div class="target_label">
                <el-checkbox
                  :style="{
                    visibility: targetGroup.isSupportFill === 0 ? 'hidden' : ''
                  }"
                  v-model="targetGroup.isChecked"
                  :disabled="disabled"
                ></el-checkbox>
                <span>{{ targetGroup.targetName }}</span>
              </div>
              <template v-if="targetGroup.isSupportFill !== 0">
                <div class="group_title">完成所有{{ targetGroup.targetName }}</div>
                <div class="group_reward_wrapper">
                  <div
                    class="group_reward"
                    v-for="(groupReward, groupRewardIndex) in targetGroup.targetRwwards[0].rewards"
                    :key="groupRewardIndex"
                  >
                    <span>奖</span>
                    <div class="input_number">
                      <el-input
                        v-model="groupReward.value"
                        @input="checkInt($event, groupReward, 'value')"
                        :disabled="disabled"
                      />
                    </div>
                    <span>{{ groupReward.typeName }}</span>
                  </div>
                </div>
              </template>
            </div>
            <!-- 指标大类 -->
            <template v-for="(targetSubGroup, subGroupIndex) in targetGroup.children">
              <template
                v-if="
                  taskInfo.type != 5 ||
                  (taskInfo.type == 5 &&
                    ((targetSubGroup.targetKey === 'homework_grade_target' &&
                      courseHomeworkOpen === '1') ||
                      (targetSubGroup.targetKey === 'viewing_hours' && courseForm === '1')))
                "
              >
                <div class="target_list" :key="subGroupIndex">
                  <div class="target_item">
                    <!-- 指标名称 - 征集素材特殊处理 -->
                    <div
                      class="target_label"
                      v-if="targetSubGroup.targetKey == 'collect_audit_success_count_target'"
                      style="width: 80px"
                    >
                      <el-checkbox
                        v-model="targetSubGroup.isChecked"
                        :disabled="disabled"
                      ></el-checkbox>
                    </div>
                    <div class="target_label" v-else>
                      <el-checkbox
                        v-model="targetSubGroup.isChecked"
                        :disabled="disabled"
                      ></el-checkbox>
                      <span>{{ targetSubGroup.targetName }}</span>
                      <!-- 视频任务的快手平台不支持分享数，所以加个小提示 -->
                      <template
                        v-if="
                          taskInfo.type == 1 && targetSubGroup.targetKey === 'share_count_target'
                        "
                      >
                        <el-tooltip placement="top">
                          <template #content>
                            <div style="max-width: 450px">快手平台暂时无法跟踪分享数指标</div>
                          </template>
                          <div class="xm_tooltipOfRight" style="width: max-content"></div>
                        </el-tooltip>
                      </template>
                    </div>
                    <div class="target_content">
                      <!-- 阶梯指标and奖励 -->
                      <div
                        class="target_num_wrapper"
                        v-for="(targetItem, targetIndex) in targetSubGroup.targetRwwards"
                        :key="targetSubGroup.targetKey + targetIndex"
                      >
                        <!-- 指标值 -->
                        <div class="target_num input_wrapper">
                          <!-- 指标名称特殊处理 -->
                          <span
                            v-if="targetSubGroup.targetKey == 'collect_audit_success_count_target'"
                          >
                            审核通过
                          </span>
                          <span v-else-if="targetSubGroup.targetKey == 'viewing_hours'">
                            浏览时长
                          </span>
                          <span v-else-if="targetSubGroup.targetKey == 'homework_grade_target'">
                            达到
                          </span>
                          <span v-else>达成</span>
                          <div class="input_number">
                            <el-input
                              v-model="targetItem.cvalue"
                              @input="
                                checkInt($event, targetItem, 'cvalue', targetSubGroup.targetKey)
                              "
                              :disabled="disabled || (collectMode === '2' && collectType === '1')"
                            />
                          </div>
                          <!-- 指标名称特殊处理 -->
                          <span
                            v-if="targetSubGroup.targetKey == 'collect_audit_success_count_target'"
                          >
                            {{ collectType == 2 ? '种标签' : '视频' }}
                          </span>
                          <span v-else-if="targetSubGroup.targetKey == 'viewing_hours'">秒</span>
                          <span v-else-if="targetSubGroup.targetKey == 'homework_grade_target'">
                            分
                          </span>
                          <span v-else>指标</span>
                        </div>
                        <!-- 奖励列表 -->
                        <div class="reward_num_wrapper">
                          <div
                            class="reward_num input_wrapper"
                            v-for="rewardItem in targetItem.rewards"
                            :key="rewardItem.typeName"
                          >
                            <!-- 奖励值 -->
                            <span v-if="targetIndex > 0" style="color: #f56c6c">额外</span>
                            <span>奖</span>
                            <div class="input_number">
                              <el-input
                                v-model="rewardItem.value"
                                @input="checkInt($event, rewardItem, 'value')"
                                :disabled="disabled"
                              />
                            </div>
                            <span>{{ rewardItem.typeName }}</span>
                          </div>
                        </div>
                        <!-- 阶梯奖励 -->
                        <div
                          class="add_ladder"
                          v-if="
                            targetSubGroup.surpportMultiple == 1 &&
                            targetIndex == targetSubGroup.targetRwwards.length - 1 &&
                            !disabled
                          "
                        >
                          <el-icon
                            v-if="targetIndex != 4"
                            color="#364FCD"
                            size="18"
                            @click="addLadder(targetSubGroup.targetRwwards)"
                          >
                            <i-plus />
                          </el-icon>
                          <el-icon
                            v-if="targetIndex != 0"
                            color="#f85151"
                            size="18"
                            @click="deleteLadder(targetSubGroup.targetRwwards, targetIndex)"
                          >
                            <i-delete />
                          </el-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="完成所有指标奖：" prop="allTarget" v-if="computedAllTargetIndex > -1">
        <el-input
          v-model="target[computedAllTargetIndex].targetRwwards[0].rewards[0].value"
          :disabled="disabled"
          @input="
            checkInt($event, target[computedAllTargetIndex].targetRwwards[0].rewards[0], 'value')
          "
          style="width: 195px; margin-right: 8px"
        ></el-input>
        <span>金币</span>
        <div class="tip">完成所有指标后，额外奖励的金币数</div>
      </el-form-item>
      <!-- 只有直播任务重复参与指标在这里显示 -->
      <el-form-item
        label="重复参与指标奖："
        prop="multiJoinTarget"
        class="hideRequired"
        v-if="taskType === 2 && computedMultiJoinTargetIndex > -1 && multiJoinSet == 1"
      >
        <div class="repeated_participation_wrapper">
          <span>达成</span>
          <el-input
            class="repeated_participation_input"
            v-model="target[computedMultiJoinTargetIndex].targetRwwards[0].cvalue"
            :disabled="disabled"
            @input="
              checkInt(
                $event,
                target[computedMultiJoinTargetIndex].targetRwwards[0],
                'cvalue',
                'multi_join_target_num'
              )
            "
          ></el-input>
          <span>次数</span>
          <span style="margin-left: 20px">奖</span>
          <el-input
            class="repeated_participation_input"
            v-model="target[computedMultiJoinTargetIndex].targetRwwards[0].rewards[0].value"
            :disabled="disabled"
            @input="
              checkInt(
                $event,
                target[computedMultiJoinTargetIndex].targetRwwards[0].rewards[0],
                'value',
                'multi_join_target_gold'
              )
            "
          ></el-input>
          <span>金币</span>
        </div>
      </el-form-item>
      <el-form-item label="发放金币类型：" prop="goldTypeId" v-if="showGoldType">
        <el-select
          placeholder="请选择"
          v-model="taskInfo.goldTypeId"
          :disabled="disabled"
          class="input-text-align"
        >
          <el-option
            v-for="item in goldTypeList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            :disabled="item.isValid === 0"
          ></el-option>
        </el-select>
      </el-form-item>
    </div>
  </div>
</template>

<script setup>
import { getCkeyOfCvalue } from '../task_tools'
import { getGoldList } from '@/api/market/gold_exchange_gifts.js'
import { useRoute } from 'vue-router'
import { isEmpty } from '@/utils/tools.js'
const props = defineProps({
  target: Object,
  taskInfo: Object,
  disabled: Boolean,
  taskType: Number
})
const { target, disabled, taskInfo, taskType } = toRefs(props)

const message = inject('$message')
const emits = defineEmits(['updateValidate'])

// 征集类型
const collectType = computed(() => {
  return getCkeyOfCvalue(taskInfo.value, 'base_set', 'collect_type')
})
// 学习形式
const courseForm = computed(() => {
  return getCkeyOfCvalue(taskInfo.value, 'content_settings', 'course_form')
})
// 课后作业开关
const courseHomeworkOpen = computed(() => {
  return getCkeyOfCvalue(taskInfo.value, 'course_homework_config', 'course_homework_open')
})

// 征集任务-征集方式
const collectMode = computed(() => {
  return getCkeyOfCvalue(taskInfo.value, 'base_set', 'collect_mode')
})
// 视频、图文、直播任务-重复参与[视频、图文都是上传模式才有、直播是放在任务要求里 其余都在视频设置里]
const multiJoinSet = computed(() => {
  return (
    getCkeyOfCvalue(taskInfo.value, 'video_set', 'multi_join_set') ||
    getCkeyOfCvalue(taskInfo.value, 'task_require', 'multi_join_set') ||
    0
  )
})
// 重复参与次数
const totalJoinTimes = computed(() => {
  return (
    getCkeyOfCvalue(taskInfo.value, 'video_set', 'total_join_times') ||
    getCkeyOfCvalue(taskInfo.value, 'task_require', 'total_join_times') ||
    2
  )
})
watch(
  () => collectMode.value,
  val => {
    sumvideoCollect()
  }
)
watch(
  () => collectType.value,
  val => {
    sumvideoCollect()
  }
)
// 如果是创意模板合成视频，不支持阶梯奖励，并指标默认填1
function sumvideoCollect() {
  if (taskInfo.value.type === 3) {
    target.value.forEach(x => {
      x.children.forEach(y => {
        if (y.targetKey === 'collect_audit_success_count_target') {
          if (collectType.value === '1' && collectMode.value === '2') {
            y.surpportMultiple = 0
            y.targetRwwards[0].cvalue = '1'
            y.targetRwwards = [y.targetRwwards[0]]
          } else {
            y.surpportMultiple = 1
          }
        }
      })
    })
  }
}
// 完成所有指标下标
const computedAllTargetIndex = computed(() => {
  let allTargetIndex = -1
  if (target.value && target.value.length) {
    target.value.forEach((e, index) => {
      if (e.targetKey === 'all_target') {
        allTargetIndex = index
      }
    })
  }
  return allTargetIndex
})
// 完成重复参与指标下标 只有开启了重复参与惨显示
const computedMultiJoinTargetIndex = computed(() => {
  let multiJoinTargetIndex = -1
  if (target.value && target.value.length) {
    target.value.forEach((e, index) => {
      if (e.targetKey === 'multi_join_target') {
        multiJoinTargetIndex = index
      }
    })
  }
  return multiJoinTargetIndex
})
// 添加阶梯奖励
function addLadder(targetRwwards) {
  if (targetRwwards.length === 5) return
  // 视频、图文指标支持从0开始 其余从1开始
  if (
    ([1, 6].includes(taskType.value) &&
      !(
        (typeof targetRwwards[targetRwwards.length - 1].cvalue === 'number' ||
          (typeof targetRwwards[targetRwwards.length - 1].cvalue === 'string' &&
            targetRwwards[targetRwwards.length - 1].cvalue.length > 0)) &&
        Number(targetRwwards[targetRwwards.length - 1].cvalue) >= 0
      )) ||
    (![1, 6].includes(taskType.value) && !targetRwwards[targetRwwards.length - 1].cvalue)
  ) {
    return message.warning('请先填写当前级的指标')
  }
  for (const i in targetRwwards) {
    const target = targetRwwards[i]
    const preTarget = targetRwwards[i - 1]
    if (Number(i) !== 0) {
      if (parseInt(target.cvalue) <= parseInt(preTarget.cvalue)) {
        return message.warning('您填写的指标数需高于上一级')
      }
    }
  }
  const newLadder = JSON.parse(JSON.stringify(targetRwwards[0]))
  newLadder.cvalue = null
  newLadder.rewards.forEach(e => {
    e.value = null
  })
  targetRwwards.push(newLadder)
}
// 删除阶梯奖励
function deleteLadder(targetRwwards, index) {
  if (targetRwwards.length === 1) return
  targetRwwards.splice(index, 1)
  emits('updateValidate', 'target')
}
// 输入框转为正整数
function checkInt(value, item, key, targetKey) {
  // 重复参与次数 如果有拿到任务里配置的次数那最大值就是任务里配置的否则就是100
  const MAX_NUM =
    targetKey === 'multi_join_target_num' && totalJoinTimes.value
      ? Number(totalJoinTimes.value) || 100
      : targetKey === 'homework_grade_target' || targetKey === 'multi_join_target_num'
      ? 100
      : 99999999

  let _value = parseInt(value) > MAX_NUM ? MAX_NUM : parseInt(value)
  // 重复参与次数要大于1
  console.log('_value', _value)
  if (targetKey === 'multi_join_target_num') {
    _value = isNaN(_value) ? '' : parseInt(_value) > 1 ? _value : 2
  }
  item[key] = isNaN(_value) ? '' : _value
}

const showGoldType = ref(true)
const { query } = useRoute()
showGoldType.value = !(query?.pageSource === 'growth')
// const goldTypeValue = computed({
//   get() {
//     // 获取到配置值
//     return taskInfo.value.goldTypeId
//   },
//   set(value) {
//     taskInfo.value.goldTypeId = value
//   }
// })
// 对taskInfo.value 赋值会被监听到
watch(
  () => taskInfo.value,
  newValue => {
    getGoldTypeList()
  }
)
// 金币类型
const goldTypeList = ref([])
const getGoldTypeList = () => {
  getGoldList({}).then(res => {
    if (res?.code === 0) {
      goldTypeList.value = res.data || []
      goldTypeList.value.sort(item => (item?.isValid === 0 ? 1 : -1))
      // 新建任务只有一种类型的时候 默认选中 多种类型 不默认选中
      const { goldTypeId } = taskInfo.value
      if (isEmpty(goldTypeId) && goldTypeList.value.length === 1) {
        taskInfo.value.goldTypeId = goldTypeList.value[0].id
      }
    }
  })
}
</script>

<style lang="scss" scoped>
$targetHeight: 58px;
.setting_main {
  .target_main {
    border: 1px solid #dcdfe6;
    border-bottom: none;
    // width: 680px;
    width: 800px;
    .target_group {
      .group_header {
        height: $targetHeight;
        background-color: #f7f8fa;
        display: flex;
        align-items: center;
        .target_label {
          flex-shrink: 0;
          width: 184px;
          padding-left: 28px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          height: $targetHeight;
          > span {
            display: inline-block;
            margin-left: 8px;
            color: #303133;
            font-size: 14px;
          }
        }
        .group_title {
          width: 160px;
          margin-right: 66px;
        }
        .group_reward_wrapper {
          .group_reward {
            display: flex;
            align-items: center;
            .input_number {
              width: 88px;
              margin: 0 8px;
            }
          }
        }
      }
      .target_list {
        .target_item {
          display: flex;
          border-bottom: 1px solid #eceef5;
          .target_label {
            flex-shrink: 0;
            width: 184px;
            padding-left: 48px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            height: $targetHeight;
            > span {
              display: inline-block;
              margin-left: 8px;
              color: #303133;
              font-size: 14px;
            }
          }
          .target_content {
            .input_wrapper {
              display: flex;
              align-items: center;
              .input_number {
                width: 88px;
                margin: 0 8px;
              }
            }
            .target_num_wrapper {
              display: flex;
              height: $targetHeight;
              > div {
                display: flex;
                align-items: center;
                height: 100%;
              }
              .target_num {
                margin-right: 66px;
              }
              .reward_num_wrapper {
                margin-right: 15px;
              }
              &:nth-of-type(n + 2) {
                .target_num {
                  margin-right: 39px;
                }
              }
            }
          }
        }
      }
    }
  }
  // 重新参与指标
  .repeated_participation_wrapper {
    display: flex;
    align-items: center;
    > span {
    }
    .repeated_participation_input {
      width: 88px;
      margin: 0 8px;
    }
  }
}

:deep {
  .el-input {
    width: auto;
  }
  .el-input__inner {
    text-align: center;
  }
  .add_ladder {
    .el-icon {
      cursor: pointer;
      margin-right: 15px;
    }
  }
}
:deep(.input-text-align) {
  .el-input__inner {
    text-align: left;
  }
}
:deep .el-form-item.is-error .el-input__inner {
  border-color: #dcdfe6;
}
</style>

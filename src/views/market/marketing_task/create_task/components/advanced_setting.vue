<template>
  <div class="setting_block">
    <div :class="['setting_title', showExpand ? 'setting_title_active' : '']" @click="switchExpand">
      高级设置
      <el-icon class="arrow_icon arrow_icon_active">
        <i-arrow-down />
      </el-icon>
    </div>
    <div class="setting_main" v-if="showExpand">
      <!-- 重复参与 下载发布模式下的普通视频任务才加 -->
      <el-form-item
        v-if="pushMode == RELEASE_TYPE.get('upload') && pageSource != 'growth' && dyVersion == 3"
        label="重复参与"
        prop="multi_join_set"
      >
        <div
          class="repeated_wrapper"
          :style="{ height: repeatedInfo.switchStatus == 1 ? '130px' : '64px' }"
        >
          <div class="audit_wrapper">
            <el-switch
              v-model="repeatedInfo.switchStatus"
              :active-value="1"
              :inactive-value="0"
              @change="repeatedInfoChange($event, 'switchStatus')"
              :disabled="disabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
            />
          </div>
          <div class="tip">开启后，任务将支持成员在时间范围内多次参与，任务奖励也会多次发放</div>
          <el-radio-group
            v-if="repeatedInfo.switchStatus === 1"
            v-model="repeatedInfo.typeRadio"
            :disabled="disabled"
            @change="repeatedInfoChange($event, 'typeRadio')"
          >
            <el-radio :label="1">
              <div class="repeated_radio">
                每
                <el-input-number
                  class="repeated_radio_input_number"
                  v-model="repeatedInfo.everyday"
                  @change="repeatedInfoChange($event, 'everyday')"
                  :disabled="disabled"
                  :min="1"
                  :max="100"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                />
                日可参与1次，任务范围内每位成员最多参与
                <el-input-number
                  class="repeated_radio_input_number"
                  @change="repeatedInfoChange($event, 'maximum')"
                  v-model="repeatedInfo.maximum"
                  :disabled="disabled"
                  :min="2"
                  :max="100"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                />
                次
              </div>
            </el-radio>
            <el-radio :label="2">
              <div class="repeated_radio">
                完成1次任务后可继续参与，任务范围内每位成员最多参与
                <el-input-number
                  class="repeated_radio_input_number"
                  @change="repeatedInfoChange($event, 'totalMaximum')"
                  v-model="repeatedInfo.totalMaximum"
                  :disabled="disabled"
                  :min="2"
                  :max="100"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                />
                次
              </div>
            </el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
      <!-- 重复参与指标 -->
      <el-form-item
        label="重复参与指标奖："
        prop="multiJoinTarget"
        class="hideRequired"
        v-if="computedMultiJoinTargetIndex > -1 && multiJoinSet == 1"
      >
        <div class="repeated_participation_wrapper">
          <!--          <div class="input_wrapper">-->
          <span>达成</span>
          <el-input
            class="repeated_participation_input"
            v-model="target[computedMultiJoinTargetIndex].targetRwwards[0].cvalue"
            :disabled="targetRewardDisabled"
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
          <!--          </div>-->
          <!--          <div class="input_wrapper">-->
          <span style="margin-left: 20px">奖</span>
          <el-input
            class="repeated_participation_input"
            v-model="target[computedMultiJoinTargetIndex].targetRwwards[0].rewards[0].value"
            :disabled="targetRewardDisabled"
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
          <!--          </div>-->
        </div>
      </el-form-item>
      <!-- 优质矩阵号转发提醒 成长任务不加 -->
      <el-form-item
        v-if="pushMode == RELEASE_TYPE.get('forward') && pageSource != 'growth'"
        label="优质矩阵号转发提醒"
        prop="forward_alarm"
      >
        <div class="flex_box">
          <el-switch
            v-model="forwardTips"
            :disabled="disabled"
            inline-prompt
            active-text="开"
            inactive-text="关"
            active-value="1"
            inactive-value="0"
          />
          <el-tooltip placement="right">
            <template #content>
              <div style="max-width: 360px">
                一键转发任务推荐新手账号参与，开关开启后系统将自动提示S级和A级矩阵号运营者
              </div>
            </template>
            <div class="xm_tooltipOfRight" style="margin-left: 4px"></div>
          </el-tooltip>
        </div>
      </el-form-item>
      <!-- 任务标签 -->
      <el-form-item label="任务标签：" prop="tagId">
        <div class="task_tag">
          <div v-if="taskInfo.tagId && taskInfo.taskTag" class="choose_tag">
            <div
              class="one_color"
              :style="{
                background: `rgba(${(taskInfo.taskTag.tagColor, 0.1)})`,
                borderColor: `rgb(${taskInfo.taskTag.tagColor})`,
                color: `rgb(${taskInfo.taskTag.tagColor})`,
                cursor: 'default'
              }"
            >
              {{ taskInfo.taskTag.tagName }}
            </div>

            <div class="btn_box" v-if="!(disabled && basicDisabled)">
              <el-link type="primary" @click="changeTag">更改</el-link>
              <div class="box_line"></div>
              <el-link type="primary" @click="delTag">删除</el-link>
            </div>
          </div>
          <el-button
            type="primary"
            v-else
            @click="showChooseDialog"
            :disabled="disabled && basicDisabled"
          >
            选择标签
          </el-button>
          <div
            class="tag_list"
            v-if="tagData.tagList && tagData.tagList.length > 0 && !(disabled && basicDisabled)"
          >
            <div class="tag_mark">常用标签：</div>
            <div
              class="one_color"
              :style="{
                background: `rgba(${(item.tagColor, 0.1)})`,
                borderColor: `rgb(${item.tagColor})`,
                color: `rgb(${item.tagColor})`
              }"
              v-for="(item, index) in tagData.tagList"
              :key="index"
              @click="updateTag(item)"
            >
              {{ item.tagName }}
            </div>
          </div>
        </div>
      </el-form-item>
      <!-- 任务图标 -->
      <el-form-item label="任务图标：" prop="taskCover">
        <div class="cover_tip">
          不上传则展示默认封面，建议尺寸为200*200px，大小不超过500K，支持png、jpg、jpeg
        </div>
        <div class="has_cover" v-if="taskInfo.taskCover">
          <el-image
            style="width: 80px; height: 80px; border-radius: 2px"
            :src="taskInfo.taskCover"
            fit="cover"
            :preview-src-list="[taskInfo.taskCover]"
          ></el-image>
          <img
            v-if="!(disabled && basicDisabled)"
            @click="delImg"
            src="https://tagvv-1256030678.file.myqcloud.com/20230610mq634.png"
            alt=""
            class="del_icon"
          />
        </div>
        <uploadImg
          :showLoading="true"
          v-else
          :index="0"
          @success="uploadImgSuccess"
          :disabled="disabled && basicDisabled"
          style="width: 78px"
        >
          <div :class="{ upload_box: true, dis_upload: disabled && basicDisabled }">
            <el-icon class="upload_icon">
              <i-plus />
            </el-icon>
            <div class="uploader_text">上传封面</div>
          </div>
        </uploadImg>
      </el-form-item>
      <!-- 开启方式 删除开启方式 默认自动开启 -->
      <!-- <el-form-item v-if="pageSource != 'growth'" label="开启方式：" prop="isAutoStart">
        <el-radio-group v-model="taskInfo.isAutoStart" :disabled="disabled">
          <el-radio v-for="(item, index) in methodList" :key="index" :label="item.id">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
        <div class="tip small_tips" v-if="taskInfo.isAutoStart === 1">
          任务审核通过后将自动开启，无需审核的任务创建后即自动开启
        </div>
        <div class="tip small_tips" v-if="taskInfo.isAutoStart === 0">
          任务审核通过后需手动开启，无需审核的任务创建后可手动开启
        </div>
      </el-form-item> -->
    </div>
    <!-- 标签选择弹窗 -->
    <chooseTagDialog
      v-if="tagData.chooseDialog.show"
      :chooseDialog="tagData.chooseDialog"
      @updateTag="updateTag"
    ></chooseTagDialog>
  </div>
</template>

<script setup>
import uploadImg from '@/views/market/miniprogram_operation/components/upload_image.vue'
import { getCkeyOfCvalue } from '../task_tools'
import { tagList } from '@/api/market/task_tag.js'
import chooseTagDialog from './chooseTag_dialog.vue'
import { throttle } from '@/utils/tools'
// import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { RELEASE_TYPE } from '@/utils/dictionary/task'
const props = defineProps({
  videoConfig: Object,
  target: Array,
  activityChoseValue: Array,
  taskInfo: Object,
  disabled: Boolean,
  targetRewardDisabled: Boolean,
  basicDisabled: Boolean,
  pageSource: String // 从哪里进入的  growth 代表从成长任务进来的。
})
const store = useStore()
const dyVersion = computed(() => store.state.user.dyVersion)
const taskInfo = toRef(props, 'taskInfo')
const disabled = toRef(props, 'disabled')
const basicDisabled = toRef(props, 'basicDisabled') // 基础信息是否禁用
const targetRewardDisabled = toRef(props, 'targetRewardDisabled') // 目标奖励是否禁用
const pageSource = toRef(props, 'pageSource')
const target = toRef(props, 'target')
// 是否展开显示
const showExpand = ref(false)
const switchExpand = throttle(() => {
  showExpand.value = !showExpand.value
})
// 任务配置
const videoConfig = computed(() => {
  return props.taskInfo.infoConfigs.find(item => item.ckey === 'video_set')
})
// 发布方式
const pushMode = computed(() => {
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'video_push_mode') {
      return config.cvalue
    }
  }
})
//  开启方式
// const methodList = reactive([
//   {
//     id: 1,
//     label: '自动开启'
//   },
//   {
//     id: 0,
//     label: '手动开启'
//   }
// ])

// --重复参与 begin
const repeatedInfo = ref({
  switchStatus: 0,
  typeRadio: 1, //
  everyday: 1, // 每日可重复参加几次
  maximum: 2, // 每日参加最多几次
  totalMaximum: 2 // 完成即可参与，最高参与次数
})
// 数据修改
function repeatedInfoChange(data, key) {
  if (key === 'switchStatus') {
    videoConfig.value.children.forEach(e => {
      if (e.ckey === 'multi_join_set') {
        e.cvalue = data
      }
      if (e.ckey === 'multi_join_type') {
        e.cvalue = repeatedInfo.value.typeRadio
      }
      if (e.ckey === 'join_interval') {
        if (repeatedInfo.value.typeRadio === 1) {
          e.cvalue = repeatedInfo.value.everyday
        } else {
          e.cvalue = ''
        }
      }
      if (e.ckey === 'total_join_times') {
        if (repeatedInfo.value.typeRadio === 1) {
          e.cvalue = repeatedInfo.value.maximum
        } else {
          e.cvalue = repeatedInfo.value.totalMaximum
        }
      }
    })
  } else if (key === 'typeRadio') {
    // 切换参与类型 要设置对应的参数
    videoConfig.value.children.forEach(e => {
      if (e.ckey === 'multi_join_type') {
        e.cvalue = data
      }
      if (e.ckey === 'join_interval') {
        if (data === 1) {
          e.cvalue = repeatedInfo.value.everyday
        } else {
          e.cvalue = ''
        }
      }
      if (e.ckey === 'total_join_times') {
        if (data === 1) {
          e.cvalue = repeatedInfo.value.maximum
        } else {
          e.cvalue = repeatedInfo.value.totalMaximum
        }
      }
    })
  } else if (key === 'everyday') {
    // 重复参与开关开启 & 第一种参与类型[每X日一次，最多参与Y次] 才可以设置参与间隔
    if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 1) {
      videoConfig.value.children.forEach(e => {
        if (e.ckey === 'join_interval') {
          e.cvalue = data
        }
      })
    }
  } else if (key === 'maximum') {
    // 重复参与开关开启 & 第一种参与类型[每X日一次，最多参与Y次] 才可以设置总参与次数
    if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 1) {
      videoConfig.value.children.forEach(e => {
        if (e.ckey === 'total_join_times') {
          e.cvalue = data
        }
      })
    }
  } else if (key === 'totalMaximum') {
    // 重复参与开关开启 & 第二种规则[完成一次后，最多参与Y次] 才可以设置总参与次数
    if (repeatedInfo.value.switchStatus === 1 && repeatedInfo.value.typeRadio === 2) {
      videoConfig.value.children.forEach(e => {
        if (e.ckey === 'total_join_times') {
          e.cvalue = data
        }
      })
    }
  }
}
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
// 视频、图文、直播任务-重复参与[视频、图文都是上传模式才有、直播是放在任务要求里 其余都在视频设置里]
const multiJoinSet = computed(() => {
  return (
    getCkeyOfCvalue(taskInfo.value, 'video_set', 'multi_join_set') ||
    getCkeyOfCvalue(taskInfo.value, 'task_require', 'multi_join_set') ||
    0
  )
})
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
// 重复参与次数
const totalJoinTimes = computed(() => {
  return (
    getCkeyOfCvalue(taskInfo.value, 'video_set', 'total_join_times') ||
    getCkeyOfCvalue(taskInfo.value, 'task_require', 'total_join_times') ||
    2
  )
})
// --重复参与 end

onMounted(() => {
  console.log('videoConfig.value', videoConfig.value.children)
  // 回显 重复参与
  for (const i in videoConfig.value.children) {
    const config = videoConfig.value.children[i]
    if (config.ckey === 'multi_join_set') {
      repeatedInfo.value.switchStatus = config.cvalue ? Number(config.cvalue) : 0
    } else if (config.ckey === 'multi_join_type') {
      repeatedInfo.value.typeRadio = config.cvalue ? Number(config.cvalue) : 1
    } else if (config.ckey === 'join_interval') {
      repeatedInfo.value.everyday =
        repeatedInfo.value.typeRadio === 1 ? (config.cvalue ? Number(config.cvalue) : 1) : 1
    } else if (config.ckey === 'total_join_times') {
      console.log('repeatedInfo.value.typeRadio ', repeatedInfo.value.typeRadio)
      if (repeatedInfo.value.typeRadio === 1) {
        repeatedInfo.value.maximum = config.cvalue ? Number(config.cvalue) : 2
      } else {
        repeatedInfo.value.totalMaximum = config.cvalue ? Number(config.cvalue) : 2
      }
    }
  }
})

// 标签的字段
const tagData = reactive({
  tagList: [],
  chooseDialog: {
    show: false,
    id: null
  }
})
function getTaskTagList() {
  tagList({}).then(res => {
    if (res.code === 0) {
      tagData.tagList = res.data && res.data.length > 0 ? res.data.slice(0, 3) : []
    }
  })
}
getTaskTagList()
// 显示选择任务标签的弹窗
const showChooseDialog = throttle(() => {
  tagData.chooseDialog.show = true
  tagData.chooseDialog.id = null
}, 500)
// 更改标签
const changeTag = throttle(() => {
  tagData.chooseDialog.id = taskInfo.value.tagId
  tagData.chooseDialog.show = true
}, 500)
// 删除标签
const delTag = throttle(() => {
  taskInfo.value.tagId = ''
  taskInfo.value.taskTag = {}
}, 500)
const updateTag = throttle(e => {
  // console.log('选择的数据', e)
  taskInfo.value.tagId = e.id
  taskInfo.value.taskTag = e
}, 500)

// 选择活动
// const showChooseActivity = ref(false)

// 优质账号转发提醒
const forwardTips = computed({
  get() {
    return getCkeyOfCvalue(taskInfo.value, 'video_set', 'forward_alarm') || '0'
  },
  set(value) {
    for (const i in videoConfig.value.children) {
      const config = videoConfig.value.children[i]
      if (config.ckey === 'forward_alarm') {
         config.cvalue = value
      }
    }
  }
})
// 任务图标封面
// 上传封面成功
function uploadImgSuccess(e) {
  taskInfo.value.taskCover = e
}
const delImg = throttle(() => {
  taskInfo.value.taskCover = ''
}, 500)
</script>

<style lang="scss" scoped>
:deep .el-date-editor .el-icon {
  height: inherit;
}
// 重复参与
.repeated_wrapper {
  display: block;
  height: 130px;
  :deep(.el-radio) {
    height: 40px;
  }
  .repeated_radio {
    color: #303133;
    margin: 6px 0;
    .repeated_radio_input_number {
      width: 120px;
      margin: 0 8px;
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

.task_tag {
  .tag_list {
    margin-top: 12px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .tag_mark {
      line-height: 24px;
    }
  }
}

.one_color {
  margin-right: 12px;
  padding: 0px 4px;
  border-radius: 2px;
  border: 1px solid #fff;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  cursor: pointer;
}
.choose_tag {
  height: 32px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .btn_box {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .box_line {
      width: 1px;
      height: 16px;
      background: rgb(220, 222, 224);
      margin: 0 6px;
    }
  }
}
.setting_block {
  .setting_title {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid #fff !important;
    .arrow_icon {
      margin-left: 4px;
    }
  }
  .setting_title_active {
    border-bottom: 1px solid #e8e8e8 !important;
    .arrow_icon_active {
      transform: rotate(-180deg);
      transition: transform 0.3s ease-in-out;
    }
  }
}
.flex_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.cover_tip {
  width: max-content;
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  margin-bottom: 12px;
  line-height: 32px;
}
.has_cover {
  width: 80px;
  height: 80px;
  position: relative;
  .del_icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    cursor: pointer;
    position: absolute;
    right: -8px;
    top: -8px;
  }
}
.upload_box {
  width: 78px;
  height: 78px;
  background: #ffffff;
  border-radius: 2px;
  border: 1px dashed #dcdee0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #333333;
  line-height: 20px;
  .upload_icon {
    font-size: 20px;
    margin-bottom: 4px;
    color: #909399;
  }
}
</style>

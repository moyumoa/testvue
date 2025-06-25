<template>
  <div class="setting_block">
    <div class="setting_title">基本设置</div>
    <div class="setting_main">
      <el-form-item label="任务标题：" prop="name">
        <el-input
          v-model.trim="taskInfo.name"
          :disabled="disabled && basicDisabled"
          placeholder="请输入任务标题，最多24个汉字"
          maxlength="24"
          :autosize="{ minRows: 1, maxRows: 1 }"
        ></el-input>
      </el-form-item>
      <el-form-item label="任务时间：" prop="date" v-if="pageSource != 'growth'">
        <el-date-picker
          v-model="data.startTime"
          type="datetime"
          :disabled="disabled"
          :disabledDate="data.disabledDate"
          placeholder="开始时间"
          @change="onChangeStartTime"
          :default-value="activityChoseValue"
        ></el-date-picker>
        -
        <el-date-picker
          v-model="data.endTime"
          type="datetime"
          placeholder="结束时间"
          :disabled="disabled && basicDisabled"
          :default-time="data.defaultEndTime"
          :disabledDate="disabledEndDate"
          @change="onChangeEndTime"
          :default-value="activityChoseValue"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="任务简介：" prop="taskInfo">
        <el-input
          v-model.trim="taskInfo.taskInfo"
          :disabled="disabled && basicDisabled"
          placeholder="请输入任务简介，最多100汉字"
          type="textarea"
          resize="none"
          maxlength="100"
          :autosize="{ minRows: 4, maxRows: 6 }"
          show-word-limit
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="任务图标：" prop="taskCover">
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
      </el-form-item> -->
      <!-- 图文 与 视频放在高级设置 -->
      <el-form-item label="任务标签：" prop="tagId" v-if="![1,6].includes(taskType)">
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
      <!--      <el-form-item label="所属活动：" prop="activityTaskBindId" v-if="showActivity">-->
      <!--        <div class="task_tag">-->
      <!--          <div v-if="taskInfo.activities" class="choose_tag">-->
      <!--            <div style="margin-right: 8px">-->
      <!--              {{ taskInfo.activities.title }}-->
      <!--            </div>-->

      <!--            <div class="btn_box" v-if="!disabled">-->
      <!--              <el-link type="primary" @click="showChooseActivity = !showChooseActivity">-->
      <!--                更改-->
      <!--              </el-link>-->
      <!--              <div class="box_line"></div>-->
      <!--              <el-link type="primary" @click="delActivity">删除</el-link>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--          <el-button-->
      <!--            type="primary"-->
      <!--            v-else-->
      <!--            @click="showChooseActivity = !showChooseActivity"-->
      <!--            :disabled="disabled && basicDisabled"-->
      <!--          >-->
      <!--            选择活动-->
      <!--          </el-button>-->
      <!--        </div>-->
      <!--      </el-form-item>-->
    </div>
    <chooseTagDialog
      v-if="tagData.chooseDialog.show"
      :chooseDialog="tagData.chooseDialog"
      @updateTag="updateTag"
    ></chooseTagDialog>
    <!-- 选择活动弹窗   -->
    <!--    <chooseActivity v-model="showChooseActivity" @confirm="updateActivity"></chooseActivity>-->
  </div>
</template>

<script setup>
// import uploadImg from '@/views/market/miniprogram_operation/components/upload_image.vue'
import { tagList } from '@/api/market/task_tag.js'
import chooseTagDialog from './chooseTag_dialog.vue'
import { dateFormat, throttle } from '@/utils/tools'
import { useRoute } from 'vue-router'
// import chooseActivity from '@/views/market/marketing_task/create_task/components/choose_activity.vue'
// import { TASK_TYPE } from '@/utils/dictionary/task'

const props = defineProps({
  activityChoseValue: Array,
  taskType: Number,
  taskInfo: Object,
  disabled: Boolean,
  basicDisabled: Boolean,
  isFromCalendar: Boolean, // 是否从任务日历进入
  isFromActivity: Boolean, // 是否从营销计划进入
  pageSource: String, // 从哪里进入的  growth 代表从成长任务进来的。
  timeChoseDisabled: Object // 从活动进入，可选择的时间范围
})
const emits = defineEmits(['updateValidate'])
// const judgeHWork = inject('$judgeHWork')
const route = useRoute()

const taskInfo = toRef(props, 'taskInfo')
const disabled = toRef(props, 'disabled')
const basicDisabled = toRef(props, 'basicDisabled')
const isFromCalendar = toRef(props, 'isFromCalendar')
const isFromActivity = toRef(props, 'isFromActivity')
const pageSource = toRef(props, 'pageSource')
const timeChoseDisabled = toRef(props, 'timeChoseDisabled')
const taskType = toRef(props, 'taskType')
const data = reactive({
  timeRang: '',
  startTime: '',
  endTime: '',
  defaultEndTime: new Date(2000, 2, 1, 23, 59, 59),
  disabledDate(time) {
    const ONY_DAY = 24 * 60 * 60 * 1000
    if (isFromActivity.value) {
      return (
        time.getTime() <= new Date(timeChoseDisabled.value.startTime).getTime() - ONY_DAY ||
        time.getTime() >= new Date(timeChoseDisabled.value.endTime).getTime()
      )
    } else {
      return time.getTime() < Date.now() - ONY_DAY
    }
  }
})

// 显示所属活动
// const showActivity = computed(() => {
//   // 海尔定制开发 直播 视频 图文 营销任务下创建任务需要选择所属活动
//   if (judgeHWork()) {
//     const isTargetTask = [
//       TASK_TYPE.get('视频发布'),
//       TASK_TYPE.get('直播'),
//       TASK_TYPE.get('图文发布')
//     ].includes(taskInfo.value.type)
//     return (
//       !isFromActivity.value &&
//       !isFromCalendar.value &&
//       pageSource.value !== 'growth' &&
//       isTargetTask
//     )
//   }
//   return false
// })

// 选中活动信息
// const updateActivity = item => {
//   taskInfo.value.activities = item
// }

// const delActivity = () => {
//   taskInfo.value.activities = null
// }

// 设置开始时间
function onChangeStartTime(value) {
  if (value) {
    if (new Date(value).getTime() > new Date(data.endTime).getTime()) {
      data.endTime = ''
      taskInfo.value.endTime = null
    }
    taskInfo.value.startTime = dateFormat(value, 'YYYY-MM-DD hh:mm:ss')
  } else {
    taskInfo.value.startTime = null
  }
  emits('updateValidate', 'countdown')
}
// 设置结束时间
function onChangeEndTime(value) {
  if (value) {
    taskInfo.value.endTime = dateFormat(value, 'YYYY-MM-DD hh:mm:ss')
  } else {
    taskInfo.value.endTime = null
  }
  emits('updateValidate', 'countdown')
}

// 结束时间选择限制
function disabledEndDate(time) {
  const ONE_DAY = 24 * 60 * 60 * 1000
  if (timeChoseDisabled.value) {
    return (
      time.getTime() <= new Date(timeChoseDisabled.value.startTime).getTime() - ONE_DAY ||
      time.getTime() >= new Date(timeChoseDisabled.value.endTime).getTime()
    )
  } else {
    // 任务的开始时间
    if (!data.startTime) {
      return data.disabledDate(time)
    }
    return time.getTime() <= new Date(data.startTime).getTime() - ONE_DAY
  }
}
onMounted(() => {
  if (route.query.id || isFromCalendar.value) {
    data.startTime = new Date(taskInfo.value.startTime)
    data.endTime = new Date(taskInfo.value.endTime)
    data.timeRang = [new Date(taskInfo.value.startTime), new Date(taskInfo.value.endTime)]
    // 如果有活动相关信息，说明是从日历进的 活动任务，需禁用时间
    // console.log('taskInfo.value-----11--->', taskInfo.value)
  }
  // 是否是从活动计划进入
  if (isFromActivity.value || timeChoseDisabled.value?.startTime) {
    // 更新data.disabledDate
    // 以及disabledEndDate
    // 回显任务时间
    // console.log('taskInfo.value', taskInfo.value)
    if (taskInfo.value.startTime) data.startTime = new Date(taskInfo.value.startTime)
    if (taskInfo.value.endTime) data.endTime = new Date(taskInfo.value.endTime)
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

// // 上传封面成功
// function uploadImgSuccess(e) {
//   taskInfo.value.taskCover = e
// }
// const delImg = throttle(() => {
//   taskInfo.value.taskCover = ''
// }, 500)
// 选择活动
// const showChooseActivity = ref(false)
</script>

<style lang="scss" scoped>
:deep .el-date-editor .el-icon {
  height: inherit;
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
.dis_upload {
  cursor: not-allowed;
}
:deep(.el-date-editor .el-range-input) {
  width: 42%;
}
</style>

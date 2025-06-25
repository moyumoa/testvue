<template>
  <div class="video_job">
    <!-- 左侧区 -->
    <div class="job_left">
      <video
        id="video"
        ref="videoFile"
        class="video"
        :src="props.videoUrl"
        controls="controls"
        :style="{
          width: '252px',
          objectFit: 'contain'
        }"
        preload="load"
        @canplay="loadSuccess"
        @timeupdate="timeupdate"
        @ended="onEnded"
      ></video>
      <!-- 进度条 -->
      <div class="progress_box">
        <el-slider v-model="$data.progress" @change="sliderChange" :show-tooltip="false" />
      </div>

      <div class="tag_list">
        <div
          class="one_tag line-hidden1"
          v-for="(item, index) in $data.tagList"
          :key="index"
          :style="{
            left: (item.time / $data.duration) * 100 + '%'
          }"
          @click="changeVideoTime(item.time, index)"
        >
          {{ index + 1 }}
        </div>
      </div>
      <!-- 按钮区 -->
      <div class="btn_area" v-if="!$data.disabled">
        <el-button type="primary" @click="addTag">添加点评</el-button>
      </div>
    </div>
    <!-- 右侧区 -->
    <div class="job_right">
      <div class="top-container">
        <div class="top-container--title">
          作业要求
          <div
            class="top-container--title__left"
            v-if="subject.imgUrl"
            @click="previewVideo(subject.imgUrl)"
          >
            示例
            <el-icon>
              <i-arrow-right />
            </el-icon>
          </div>
        </div>
        <div class="top-container--item">
          {{ subject.title }}
        </div>
      </div>
      <div class="title">
        <div class="title1">精细点评</div>
        <div class="title2">可拖动左侧视频下方滑块，对视频节点进行精细点评</div>
      </div>
      <div class="tag_box">
        <!-- 单个标签 -->
        <div class="one_tag" v-for="(item, index) in $data.tagList" :key="index">
          <div class="tag_title">
            <div>
              位置{{ index + 1 }}
              <span>{{ computedTime(item.time) }}</span>
            </div>
            <el-link type="primary" @click="delTag(index)" v-if="!$data.disabled">删除</el-link>
          </div>
          <div class="tag_content">
            <el-input
              :readonly="$data.disabled"
              :ref="tagContentRef"
              v-model.trim="item.content"
              placeholder="请输入点评"
              type="textarea"
              resize="none"
              maxlength="200"
              :autosize="{ minRows: 4, maxRows: 6 }"
              show-word-limit
            ></el-input>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  videoUrl: String,
  homeworkInfo: Object,
  videoTag: Array,
  disabled: Boolean,
  taskInfo: Object
})
const videoFile = ref()
const $data = reactive({
  disabled: false,
  duration: 0,
  currentTime: 0,
  progress: 0,
  tagList: [] // 点评列表
})
const subject = computed({
  get() {
    const { requirement,sample } = props.homeworkInfo

    const result = {
      title: requirement,
      imgUrl: sample ? JSON.parse(sample)?.map(item => item.url)[0] : ''
    }
    // const list = props.taskInfo?.taskConfigs || []
    // list.forEach(item => {
    //   if (item.ckey === 'course_homework_requirement') {
    //     result.title = item.cvalue || '-'
    //   }
    //   if (item.ckey === 'course_homework_sample') {
    //     result.imgUrl = item.cvalue ? JSON.parse(item.cvalue)?.map(item => item.url)[0] : ''
    //   }
    // })
    return result
  }
})
const previewVideo = value => {
  if (value) {
    window.open(value)
  }
}

function init() {
  $data.disabled = props.disabled
  if (props.videoTag && props.videoTag.length > 0) {
    $data.tagList = JSON.parse(JSON.stringify(props.videoTag))
  }
}

const tagRef = ref([])
const tagContentRef = el => {
  tagRef.value.push(el)
}
init()

// 视频加载完成
function loadSuccess(e) {
  $data.duration = videoFile.value.duration
}

// 视频播放中
function timeupdate(e) {
  $data.currentTime = videoFile.value.currentTime
  $data.progress = ($data.currentTime / $data.duration) * 100
}

// 视频播放完毕
function onEnded(e) {
  console.log('onEnded', e)
}

// 更改视频的播放点

const changeVideoTime = throttle((e, i) => {
  videoFile.value.currentTime = e
  $data.currentTime = e
  $data.progress = ($data.currentTime / $data.duration) * 100
  tagRef.value[i].focus()
}, 500)
const message = inject('$message')
// 添加点评
const addTag = throttle(() => {
  videoFile.value.pause()
  const currentTime = $data.currentTime
  const hasTime = $data.tagList.findIndex(x => parseInt(x.time) === parseInt(currentTime))

  if (hasTime > -1) {
    tagRef.value[hasTime].focus()
    message.warning('当前时间点已添加过点评哦')
  } else {
    tagRef.value = []
    $data.tagList.push({
      time: $data.currentTime,
      content: ''
    })

    nextTick(() => {
      tagRef.value[$data.tagList.length - 1].focus()
    })
  }
}, 700)
const delTag = throttle(i => {
  tagRef.value = []
  $data.tagList.splice(i, 1)
}, 700)

// 转换显示时间格式
function computedTime(time) {
  let m = parseInt(time / 60)
  m = m < 10 ? '0' + String(m) : m
  let s = parseInt(time % 60)
  s = s < 10 ? '0' + String(s) : s
  return `${m}:${s}`
}

const emits = defineEmits(['updateTag'])
watch(
  () => $data.tagList,
  () => {
    emits('updateTag', $data.tagList)
  },
  { deep: true }
)

// 滑块拖动
function sliderChange(e) {
  const currentTime = $data.duration * (e / 100)
  $data.currentTime = currentTime
  videoFile.value.currentTime = currentTime
}
</script>
<style lang="scss" scoped>
.video_job {
  font-family: PingFangSC-Regular, PingFang SC;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  height: 556px;

  .job_left {
    margin-left: 8px;
    width: 252px;
    margin-right: 24px;
    // 视频
    .video {
      width: 252px;
      height: 448px;
      border-radius: 2px;
      object-fit: cover;
    }

    // 进度条
    .progress_box {
      width: 252px;
      position: relative;
      height: 16px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      .progress_back {
        border-radius: 4px;
        height: 4px;
        width: calc(100% + 8px);
        position: absolute;
        top: 6px;
        background: rgba(56, 101, 243, 0.2);
        left: 0;
      }

      .progress_progress {
        height: 5px;
        border-radius: 4px;
        background: rgba(56, 101, 243, 1);
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        z-index: 2;
      }

      .progress_control {
        cursor: pointer;
        border: 2px solid #fff;
        width: 12px;
        height: 12px;
        background: rgba(56, 101, 243, 1);
        border-radius: 100%;
        position: absolute;
        top: 0px;
        left: 0;
        z-index: 3;
        margin-left: -4px;
      }
    }

    // 标签区
    .tag_list {
      width: calc(100% + 0px);
      margin-left: -8px;
      position: relative;

      .one_tag {
        cursor: pointer;
        width: 16px;
        height: 28px;
        background: url('https://tagvvcloud-brandapp-1256030678.cos.ap-guangzhou.myqcloud.com/c69fe1daa61d45ea90f0e4d9ff22ed89tag1.png')
          no-repeat;
        background-size: cover;
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-end;
        color: #fff;
        line-height: 20px;
      }
    }

    // 按钮区
    .btn_area {
      margin-top: 40px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }

  .job_right {
    height: 100%;
    width: calc(100% - 284px);
    overflow: scroll;

    .top-container {
      margin-right: 16px;
      margin-bottom: 16px;
      background: #f6f8fa;
      border-radius: 2px;
      padding: 12px;

      .top-container--title {
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-weight: bold;
        color: #606266;
        display: flex;
        justify-content: space-between;

        .top-container--title__left {
          cursor: default;
          font-size: 13px;
          font-weight: 400;
          color: #364fcd;
        }
      }

      .top-container--item {
        margin-top: 5px;
        line-height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
      }
    }

    .title {
      margin-bottom: 14px;

      .title1 {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        line-height: 22px;
      }

      .title2 {
        margin-top: 4px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
    }

    .tag_box {
      padding-right: 16px;
      height: calc(100% - 60px);
      overflow-y: auto;

      .one_tag {
        margin-bottom: 12px;

        .tag_title {
          font-size: 14px;
          font-weight: 500;
          color: #364fcd;
          line-height: 20px;
          margin-bottom: 8px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;

          span {
            color: #909399;
          }
        }
      }
    }
  }
}

// 滑块的样式
:deep(.el-slider__button) {
  border: 2px solid #fff;
  width: 12px;
  height: 12px;
  background: rgba(56, 101, 243, 1);
}

:deep(.el-slider__runway) {
  background: rgba(56, 101, 243, 0.2);
  height: 4px;
}

:deep(.el-slider__bar) {
  background: rgba(56, 101, 243, 1);
  height: 4px;
}

:deep(.el-slider__button-wrapper) {
  top: -16px !important;
}
</style>

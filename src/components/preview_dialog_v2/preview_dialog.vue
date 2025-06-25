<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    :title="`${
      props.previewDialog.title
        ? props.previewDialog.title
        : props.previewDialog.type == 'borderVideo'
        ? '查看视频'
        : ''
    }`"
    width="315px"
    v-model="show"
    custom-class="rule_setting_dialog"
  >
    <div class="content_box">
      <div class="overlay" @click.stop="pauseVideo" v-if="isShowBorder">
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240329lnttj.png"
          alt=""
          class="play_icon"
          @click.stop="playVideo"
          v-if="$video.isPaused && !$video.isDragging"
        />
        <div class="overlay-content">
          <img :src="typeBorderSet[borderType]" alt="" class="back_border" />
          <div class="progress_warp" @click.stop>
            <el-slider
              v-model="$video.currentTimeVal"
              :max="$video.totalTimeVal"
              :step="0.01"
              :show-tooltip="false"
              @input="progressInput"
              @change="progressUpdate"
            ></el-slider>
          </div>
        </div>
      </div>
      <div
        class="video_container_border"
        v-if="props.previewDialog.type == 'borderVideo' && isShowBorder"
      >
        <video
          :poster="props.previewDialog.cover"
          :src="props.previewDialog.url"
          class="preview_info"
          controls="false"
          autoplay
          ref="videoRef"
          @canplay="getTotalTime"
          @timeupdate="timeUpdate($event)"
          @progress="videoProgress($event)"
          @ended="videoPlayEnded"
        ></video>
      </div>
      <div
        class="video_container"
        v-else-if="props.previewDialog.type == 'borderVideo' && !isShowBorder"
      >
        <video
          :poster="props.previewDialog.cover"
          class="preview_info"
          :src="props.previewDialog.url"
          controls="controls"
          autoplay
        ></video>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools'

const props = defineProps({
  previewDialog: {
    type: Object,
    default: () => {
      return {
        title: '', // 弹窗标题
        show: true, // 是否显示弹窗
        url: '', // 预览地址
        cover: '', // 视频的封面地址
        type: 'video', // 预览类型 video普通的视频 image图片 audio音频 digitalVideo数字人的人物模型[带遮罩]
        borderType: 'dy' // 预览边框类型
      }
    },
    required: true
  }
})
const show = toRef(props.previewDialog, 'show')
const borderType = toRef(props.previewDialog, 'borderType')
const videoRef = ref(null)
const typeBorderSet = reactive({
  dy: 'https://tagvv-1256030678.file.myqcloud.com/202407224gf8a.png',
  xhs: 'https://tagvv-1256030678.file.myqcloud.com/20240722ce06b.png',
  ks: 'https://tagvv-1256030678.file.myqcloud.com/20240722ohday.png',
  sph: 'https://tagvv-1256030678.file.myqcloud.com/20240722habqp.png'
})

const $video = reactive({
  persentLoad: 0, // 视频加载进度
  isPaused: false, // 是否暂停
  currentTime: '00:00:00', // 当前播放时刻
  totalTime: '00:00:00', // 视频总时长
  currentTimeVal: 0, // 当前视频播放进度
  totalTimeVal: 0, // 视频总进度
  isDragging: false, // 是否在拖动视频进度中
  currentTimeDragging: '00:00:00' // 拖动中的时刻
})

const isShowBorder = computed(() => {
  return !!borderType.value
})

function playVideo() {
  $video.isPaused = false
  videoRef.value?.play()
}

function pauseVideo() {
  $video.isPaused = true
  videoRef.value?.pause()
}

// 视频时长格式化
function timeFormat(time) {
  let hour = Math.floor(time / 3600)
  let minute = Math.floor((time % 3600) / 60)
  let second = Math.floor(time % 60)
  hour = hour < 10 ? '0' + hour : hour
  minute = minute < 10 ? '0' + minute : minute
  second = second < 10 ? '0' + second : second
  return `${hour}:${minute}:${second}`
}

// 获取视频的总时长和进度条最大值
function getTotalTime() {
  $video.totalTime = timeFormat(videoRef.value?.duration)
  $video.totalTimeVal = videoRef.value?.duration
}

// 更新视频当前播放时间
function timeUpdate(event) {
  const videoElement = event.target
  $video.currentTimeVal = videoElement.currentTime // 格式number
  $video.currentTime = timeFormat(videoRef.value?.currentTime) // 格式hh:mm:ss
}
// 拖动中赋值视频时间，不用实时
const setVideoTime = throttle(function (val) {
  if (videoRef.value) videoRef.value.currentTime = val
}, 256)

// 开始拖动进度条时，暂停播放
function progressInput(val) {
  videoRef.value?.pause()
  $video.isPaused = true
  $video.isDragging = true
  setVideoTime(val)
  $video.currentTimeDragging = timeFormat(val)
}
// 进度条拖动结束
function progressUpdate(val) {
  $video.isDragging = false
  if (videoRef.value) videoRef.value.currentTime = val
  $video.currentTime = timeFormat(val)
  $video.isPaused = false
  videoRef.value?.play()
}
// 循环播放
function videoPlayEnded() {
  nextTick(() => {
    $video.currentTimeVal = 0
    $video.currentTime = '00:00:00'
    $video.currentTimeDragging = '00:00:00'
    if (videoRef.value) videoRef.value.currentTime = 0
    videoRef.value?.play()
  })
}
// 获取视频加载进度
function videoProgress(e) {
  const bf = videoRef.value?.buffered || []
  const time = videoRef.value?.currentTime
  if (bf.length !== 0) {
    let range = 0
    while (!(bf.start(range) <= time && time <= bf.end(range))) {
      range += 1
    }
    const loadEndPercentage = (bf.end(range) / videoRef.value?.duration) * 100 // 结束加载的百分比
    $video.persentLoad = loadEndPercentage
    console.log('视频加载进度', $video.persentLoad)
  }
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  // padding: 16px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  height: max-content;
}
.preview_info {
  width: 315px;
  height: auto;
  // max-height: 70vh;
}

.video_container {
  position: relative;
  width: 315px /* 视频的宽度 */;
  height: 560px /* 视频的高度 */;
}
.video_container_border {
  position: relative;
  width: 315px /* 视频的宽度 */;
  height: 560px /* 视频的高度 */;
  /* 隐藏视频控件 */
  video::-webkit-media-controls {
    display: none !important;
  }
}

video {
  width: 100%;
  height: auto;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 630px;
  z-index: 10; /* 确保这个值大于video的z-index */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  .play_icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 46px;
    height: 46px;
    cursor: pointer;
    z-index: 14;
  }
}

.overlay-content {
  color: white;
  position: relative;
  width: 100%;
  height: 100%;
  .back_border {
    width: 315px;
    height: 630px;
    object-fit: contain;
  }
  .progress_warp {
    width: 100%;
    height: max-content;
    position: absolute;
    bottom: 64px;
    left: 0;
    padding: 0 12px;
    :deep(.el-slider__runway) {
      background-color: rgba(255, 255, 255, 0.4);
      height: 4px;
    }
    :deep(.el-slider__bar) {
      background-color: #fff;
      height: 4px;
    }
    :deep(.el-slider__button-wrapper) {
      width: 32px;
      height: 32px;
      top: -14px;
    }
    :deep(.el-slider__button) {
      border: unset;
      width: 12px;
      height: 12px;
      background-color: #fff;
    }
  }
}
</style>

<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    :title="`${
      props.previewDialog.title
        ? props.previewDialog.title
        : props.previewDialog.type == 'video'
        ? '查看视频'
        : props.previewDialog.type == 'image'
        ? '查看图片'
        : props.previewDialog.type == 'audio'
        ? '查看音频'
        : props.previewDialog.type == 'scene'
        ? '查看场景图'
        : ''
    }`"
    width="347px"
    v-model="show"
    custom-class="rule_setting_dialog"
  >
    <div class="content_box">
      <video
        :poster="props.previewDialog.cover"
        v-if="props.previewDialog.type == 'video'"
        class="preview_info"
        :src="props.previewDialog.url"
        controls="controls"
        autoplay
      ></video>
      <img
        class="preview_info preview_info_img"
        v-if="props.previewDialog.type == 'image'"
        :src="props.previewDialog.url"
        alt=""
      />
      <audio
        v-if="props.previewDialog.type == 'audio'"
        class="audio_info"
        :src="props.previewDialog.url"
        controls
        autoplay
      ></audio>
      <div
        class="digital_video_info"
        :style="{
          width: `${props.previewDialog.maskPosition.baseWidth}px`,
          height: `${props.previewDialog.maskPosition.baseHeight}px`
        }"
        v-if="props.previewDialog.type == 'digitalVideo'"
      >
        <video
          :poster="props.previewDialog.cover"
          class="video_info"
          :src="props.previewDialog.url"
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          disablepictureinpicture
          autoplay
        ></video>
        <img
          class="video_mask"
          :style="{
            width: `${props.previewDialog.maskPosition.location.width}px`,
            height: `${props.previewDialog.maskPosition.location.height}px`,
            left: `${props.previewDialog.maskPosition.location.left}px`,
            top: `${props.previewDialog.maskPosition.location.top}px`
          }"
          src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/sumvideo/image/20230309111222ed3a10f6c5.png"
          alt=""
        />
      </div>
      <!-- 场景图 -->
      <div class="scene_info" v-if="props.previewDialog.type == 'scene'">
        <el-carousel
          :loop="false"
          class="scene_info_carousel"
          trigger="click"
          v-if="props.previewDialog.urlList.length > 1"
          :interval="3000"
          :autoplay="false"
          arrow="always"
          indicator-position="none"
          :height="firstHeight + 'px'"
        >
          <el-carousel-item v-for="(item, index) in props.previewDialog.urlList" :key="index">
            <div class="scene_box" style="height: 100%">
              <img v-if="item.url" class="one_scene" :src="item.url" alt="" />
              <div v-else class="one_scene">
                <img src="https://tagvv-1256030678.file.myqcloud.com/20240914lrejw.png" alt="" />
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
        <div class="scene_box" v-else-if="props.previewDialog.urlList.length == 1">
          <img
            v-if="props.previewDialog.urlList[0].url"
            class="one_scene"
            :src="props.previewDialog.urlList[0].url"
            alt=""
          />
          <div v-else class="one_scene">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20240914lrejw.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  previewDialog: {
    type: Object,
    default: () => {
      return {
        title: '', // 弹窗标题
        show: false, // 是否显示弹窗
        url: '', // 预览地址
        urlList: [], // 场景图的预览地址列表 场景图有组图和单图
        cover: '', // 视频的封面地址
        type: 'video', // 预览类型 video普通的视频 image图片 audio音频 digitalVideo数字人的人物模型[带遮罩]
        maskPosition: {} // 人物模型 会有一个遮罩的信息
      }
    },
    required: true
  }
})
// const dialog = ref()
const show = toRef(props.previewDialog, 'show')
// function closeDialog() {
//   console.log(dialog.value)
//   dialog.value.handleClose()
// }

const firstHeight = ref(200) // 获取到的首图高度作为轮播图高度

//  当图片为轮播图的时候就换算高度
function getLunboHeight() {
  const imgElement = document.createElement('img')
  imgElement.src = props.previewDialog.urlList[0].url
  imgElement.addEventListener('load', function () {
    if (imgElement.height && imgElement.width) {
      const scale = imgElement.height / imgElement.width
      const height = parseInt(315 * scale.toFixed(2))
      firstHeight.value = height > firstHeight.value ? height : firstHeight.value
    }
  })
}
onMounted(() => {
  if (
    props.previewDialog.type === 'scene' &&
    props.previewDialog.urlList &&
    props.previewDialog.urlList.length > 1
  ) {
    getLunboHeight()
  }
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding: 16px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.preview_info {
  width: 315px;
  height: auto;
  max-height: 70vh;
}
.preview_info_img {
  max-width: 315px !important;
  width: auto !important;
}
.audio_info {
  width: 315px;
}
.digital_video_info {
  position: relative;
  margin: 0 auto;
  .video_info {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .video_mask {
    pointer-events: none;
    position: absolute;
    object-fit: contain;
  }
  :deep(video::-webkit-media-controls-fullscreen-button) {
    display: none;
  }
}
.scene_info {
  width: 100%;
  max-height: 70vh;
  img {
    width: 100%;
    max-height: 70vh;
    height: auto;
  }
}
:deep(.el-carousel__arrow) {
  display: flex;
  font-size: 22px;
  font-weight: 800;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
}
.scene_box {
  width: 100%;
}
.scene_info_carousel {
  .one_scene {
    height: 100%;
    object-fit: contain;
  }
}
</style>

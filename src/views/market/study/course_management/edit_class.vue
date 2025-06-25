<template>
  <div class="edit_class_wrapper">
    <div class="edit_class">
      <div class="preview">
        <div class="phone">
          <div class="phone_header"></div>
          <div class="phone_main">
            <div class="video_wrapper" v-if="$data.video.length">
              <video
                :src="$data.video[0].url"
                :poster="$data.video[0].img"
                controls
                autoplay
              ></video>
            </div>
            <div class="content" v-html="$data.richHtml"></div>
          </div>
        </div>
        <div class="add_video">
          <oss_upload
            :maxSize="1048576"
            :btnText="$data.video.length ? '替换视频' : '设置视频'"
            @success="onUploadSuccess"
          ></oss_upload>
          <div class="tip">注：上传视频大小不可超过1G</div>
          <el-tooltip effect="dark" placement="right">
            <template #content>
              <div class="tip_content" style="max-width: 360px">
                若视频画面黑屏，可能是因为该视频格式无法在浏览器中直接预览。请先保存课程，系统稍后会自动对视频做转码处理。
              </div>
            </template>
            <div class="tip_box">
              视频黑屏怎么办
              <img class="tip_img" src="@/assets/images/content_center/tip_line.png" />
            </div>
          </el-tooltip>
        </div>
      </div>
      <div class="rich_text">
        <div
          :style="isHideTopMenu ? ' height: calc(100vh - 130px);' : ''"
          id="class_rich_text"
        ></div>
      </div>
    </div>
    <div class="footer_btns">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="saveClassContent">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import Wangeditor from 'wangeditor'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useStore()
const $data = reactive({
  richHtml: '',
  video: []
})
const editorRef = ref(null)
function initWangeditor() {
  editorRef.value = new Wangeditor('#class_rich_text')
  editorRef.value.config.menus = [
    'bold',
    'fontSize',
    'italic',
    'underline',
    'strikeThrough',
    'foreColor',
    'justify',
    'lineHeight',
    'image'
  ]
  // 设置编辑区域高度为 500px
  editorRef.value.config.zIndex = 3
  editorRef.value.config.fontSize = 14
  editorRef.value.config.uploadImgServer = '/api/mission/file/upload'
  editorRef.value.config.uploadFileName = 'file'
  editorRef.value.config.lineHeights = ['1', '1.5', '2', '2.5', '3']
  editorRef.value.config.showFullScreen = false
  editorRef.value.config.showLinkImgAlt = false
  editorRef.value.config.showLinkImgHref = false
  editorRef.value.config.uploadImgAccept = ['jpg', 'jpeg', 'png', 'gif']
  editorRef.value.config.uploadImgMaxLength = 1
  editorRef.value.config.uploadImgHeaders = {
    'X-Requested-With': 'XMLHttpRequest',
    token: localStorage.getItem('token')
  }
  editorRef.value.config.uploadImgHooks = {
    customInsert: function (insertImgFn, result) {
      if (result.code === 0 || result.code === 200) {
        insertImgFn(result.data)
      }
    }
  }
  // 配置 onchange 回调函数
  editorRef.value.config.onchange = function (newHtml) {
    $data.richHtml = newHtml
  }
  // 配置触发 onchange 的时间频率，默认为 200ms
  editorRef.value.config.onchangeTimeout = 500 // 修改为 500ms
  editorRef.value.create()
  editorRef.value.txt.html($data.richHtml)
}

const isHideTopMenu = store.getters.isHideTopMenu
function cancel() {
  router.go(-1)
}

function saveClassContent() {
  if (!$data.video.length && !$data.richHtml) {
    return ElMessage.warning('请设置课程内容')
  }
  store.commit('course/setClassInfo', {
    videoInfo: $data.video.length ? $data.video[0] : {},
    richHtml: $data.richHtml
  })
  router.go(-1)
}

function onUploadSuccess(res) {
  console.log('onUploadSuccess', res)
  $data.video = [
    {
      url: res.url,
      img: ''
    }
  ]
}

onBeforeUnmount(() => {
  editorRef.value.destroy()
  editorRef.value = null
})
onMounted(() => {
  if (store.state.course.classInfo) {
    const classInfo = store.state.course.classInfo
    $data.richHtml = classInfo
    $data.video = classInfo.videoInfo.url ? [classInfo.videoInfo] : []
    $data.richHtml = classInfo.richHtml
  }
  initWangeditor()
})
</script>

<style lang="scss" scoped>
.edit_class_wrapper {
  // margin-bottom: -16px;
  // height: calc(100vh - 76px);
  height: calc(100% + 16px);
  min-width: 1000px;
  .edit_class {
    height: calc(100% - 58px);
    display: flex;
    .preview {
      flex-shrink: 0;
      margin-right: 24px;
      .phone {
        height: calc(100% - 104px);
        width: 375px;
        display: flex;
        flex-direction: column;
        background: #ffffff;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
        .phone_header {
          flex-shrink: 0;
          width: 100%;
          height: 80px;
          background-size: cover;
          background-image: url('/src/assets/images/diy/phone_header.png');
        }
        .phone_main {
          flex: 1;
          padding: 8px 12px 0 12px;
          overflow-y: auto;
          .video_wrapper {
            height: 193px;
            background: #181818;
            border-radius: 4px;
            overflow: hidden;
            video {
              width: 100%;
              height: 100%;
            }
          }
          .content {
            margin-top: 20px;
            word-break: break-all;
            word-wrap: break-word;
          }
        }
      }
      .add_video {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px 0 52px 0;
        .tip {
          margin-top: 10px;
          color: #666;
          font-size: 14px;
        }
        .tip_box {
          margin-top: 6px;
          color: #666;
          font-size: 14px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          .tip_img {
            margin-left: 6px;
            width: 14px;
            height: 14px;
          }
        }
      }
    }
    .rich_text {
      flex: 1;
      padding-top: 20px;
      background: #ffffff;
      width: 300px;
      #class_rich_text {
        height: calc(100vh - 240px);
        word-break: break-all;
        word-wrap: break-word;
      }
    }
  }
  .footer_btns {
    margin-left: -16px;
    width: calc(100% + 32px);
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
}
:deep #class_rich_text {
  .w-e-toolbar,
  .w-e-text,
  .w-e-text-container {
    border: none !important;
  }
  .w-e-text-container {
    height: 100% !important;
  }
}
:deep .upload_item_wrapper {
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
}
:deep #class_rich_text {
  p {
    line-height: 1;
    margin: 0;
  }
  .w-e-panel-container {
    left: auto;
  }
}
:deep(img) {
  display: block;
}
</style>

<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="封面选择"
    width="820px"
    custom-class=" choose_part_dialog"
  >
    <div class="dialog_content" v-loading="initLoading">
      <!-- 选定的封面 -->
      <div class="choose_cover">
        <!-- 已设置封面 -->
        <div class="cover_over" v-if="videoInfo.coverUrl">
          <el-image
            class="cover_img"
            :src="videoInfo.coverUrl"
            fit="cover"
            :preview-src-list="[videoInfo.coverUrl]"
          ></el-image>
        </div>
        <!-- 未设置封面 -->
        <div class="cover_upload" v-else>
          <uploadImage :maxSize="500" :index="0" @success="uploadImgSuccess" :showLoading="true">
            <div class="upload_box">
              <el-icon class="icon-plus">
                <i-plus />
              </el-icon>
              <div class="text1">点击上传封面</div>
              <div class="text2">（建议比例9:16）</div>
            </div>
          </uploadImage>
        </div>
      </div>
      <!-- 切换类型的按钮 -->
      <div class="btn_box">
        <div :class="{ one_btn: true, choose_btn: videoCoverType === 1 }" @click="changeType(1)">
          视频帧
        </div>
        <div :class="{ one_btn: true, choose_btn: videoCoverType === 2 }" @click="changeType(2)">
          本地上传
        </div>
      </div>
      <!-- 视频帧选取 -->
      <div class="all_cover_box" v-if="videoCoverType === 1">
        <div class="all_box" v-if="!videoErr">
          <div
            class="one_cover"
            @click="changeCover(item)"
            v-for="(item, index) in coverList"
            :key="index"
          >
            <img class="one_cover" :src="item" alt="" />
            <div class="choose_cover" v-if="item === videoInfo.coverUrl"></div>
          </div>
        </div>
        <div class="err_box" v-else>暂未找到对应的视频帧信息</div>
      </div>
      <!-- 本地上传 -->
      <div class="upload_cover_box" v-else>
        <div class="name_box line-hidden1">{{ chooseVideoInfo.uploadName || '' }}</div>
        <uploadImage
          v-if="chooseVideoInfo.uploadUrl"
          :maxSize="500"
          :index="1"
          @success="uploadImgSuccess"
        >
          <div class="upload_text">更换</div>
        </uploadImage>
        <div v-else class="disabled_text">更换</div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import uploadImage from '@/views/market/miniprogram_operation/components/upload_image.vue'
import { throttle } from '@/utils/tools.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  coverDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const initLoading = ref(true)
const dialog = ref()
const show = toRef(props.coverDialog, 'show')
const loading = ref(false) // 保存的Loading
const videoInfo = ref({}) // 视频信息
const videoCoverType = ref(1) // 封面的选择方式 1 从视频帧截取 2 本地上传
const coverList = ref([]) // 视频帧列表
const videoErr = ref(false) // 视频加载失败
const chooseVideoInfo = reactive({
  frameUrl: '', // 选择的视频帧画面
  uploadUrl: '', // 本地上传的图标地址
  uploadName: '' // 本地上传的图片名称
})
function init() {
  videoCoverType.value = 1
  if (props.coverDialog.videoUrl) {
    videoInfo.value = JSON.parse(JSON.stringify(props.coverDialog))
    getCoverList()
  } else {
    videoInfo.value = {}
    coverList.value = []
    initLoading.value = false
  }
}
init()
// 获取所有视频帧信息
function getCoverList() {
  // 如果没有视频时长，那就根据视频地址，然后获取对应的时长，再去获取每一秒的视频帧画面
  const videoElement = document.createElement('video')
  videoElement.src = videoInfo.value.videoUrl
  videoElement.addEventListener('loadedmetadata', function () {
    videoErr.value = false
    if (videoElement.duration) {
      const videoDuration = Math.floor(videoElement.duration)
      const list = []
      for (let i = 1; i <= videoDuration; i++) {
        let coverPath = ''
        if (videoInfo.value.ossType === 'ali') {
          coverPath = `${videoInfo.value.videoUrl}?x-oss-process=video/snapshot,t_${
            i * 1000
          },m_fast`
        } else {
          coverPath = `${videoInfo.value.videoUrl}?ci-process=snapshot&time=${i}&format=jpg`
        }
        list.push(coverPath)
      }
      coverList.value = list
      // 默认初始化是视频的第一帧
      videoInfo.value.coverUrl = coverList.value[0]
      chooseVideoInfo.frameUrl = coverList.value[0]
      nextTick(() => {
        initLoading.value = false
      })
    } else {
      coverList.value = []
      initLoading.value = false
    }
  })
  videoElement.addEventListener('error', function () {
    videoErr.value = true
    coverList.value = []
    initLoading.value = false
    ElMessage.warning('获取视频信息异常，请检查视频')
  })
}
const emits = defineEmits(['updateCover'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  loading.value = true
  if (videoInfo.value.coverUrl) {
    emits('updateCover', videoInfo.value.coverUrl)
    closeDialog()
  } else {
    loading.value = false
    ElMessage.warning('请先选择封面')
  }
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}

// 修改视频封面的选择类型
const changeType = throttle(e => {
  if (e !== videoCoverType.value) {
    videoCoverType.value = e
    if (e === 1) {
      videoInfo.value.coverUrl = chooseVideoInfo.frameUrl
    } else {
      videoInfo.value.coverUrl = chooseVideoInfo.uploadUrl
    }
  }
}, 400)
// 更新封面
const changeCover = throttle(e => {
  videoInfo.value.coverUrl = e
  chooseVideoInfo.frameUrl = e
}, 400)
function uploadImgSuccess(e, i, name) {
  videoInfo.value.coverUrl = e
  chooseVideoInfo.uploadUrl = e
  chooseVideoInfo.uploadName = name
  videoCoverType.value = 2
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 16px 16px 8px 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.cover_img {
  width: 180px;
  height: 320px;
  border-radius: 2px;
}
.upload_box {
  width: 178px;
  height: 318px;
  background: #ffffff;
  border-radius: 2px;
  border: 1px solid #dcdee0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .icon-plus {
    font-size: 20px;
  }
  .text1 {
    margin: 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    line-height: 20px;
  }
  .text2 {
    font-size: 12px;
    font-weight: 400;
    color: #909399;
    line-height: 18px;
  }
}
.btn_box {
  margin: 24px 0 36px;
  height: 40px;
  width: 204px;
  background: #f6f7f8;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px;
  .one_btn {
    cursor: pointer;
    width: 96px;
    height: 32px;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
  }
  .choose_btn {
    background: #e9edfb;
    font-size: 14px;
    font-weight: 400;
    color: #364fcd;
    line-height: 20px;
  }
}
.all_cover_box {
  width: 100%;
  overflow-x: auto;
  .all_box {
    margin-bottom: 8px;
    height: 80px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    border-radius: 4px;
    overflow: hidden;
    width: max-content;
    .one_cover {
      position: relative;
      cursor: pointer;
      width: 56px;
      height: 80px;
      object-fit: cover;
    }
    .choose_cover {
      position: absolute;
      left: 0;
      top: 0;
      width: 56px;
      height: 80px;
      border: 1px solid #364fcd;
      box-shadow: inset 0px 0px 10px 0px rgba(54, 79, 205, 0.3);
    }
  }
}
.upload_cover_box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .name_box {
    width: 396px;
    height: 32px;
    background: #f6f7f8;
    border-radius: 2px;
    padding: 0px 12px;

    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 32px;
  }
  .upload_text {
    padding: 6px 12px;

    font-size: 14px;
    font-weight: 400;
    color: #364fcd;
    line-height: 20px;
    cursor: pointer;
  }
  .disabled_text {
    padding: 6px 12px;

    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    cursor: not-allowed;
  }
}
.err_box {
  width: 100%;
  height: 25px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: #909399;
}
</style>

<template>
  <div class="disassemble_page">
    <!-- 输入框 :rows="1" type="textarea" resize="none"-->
    <div class="video_from_warp" v-if="systemVersion !== 2">
      <span class="label">视频来源一</span>
      <el-button type="primary" class="input_button" :disabled="loading" @click="openInspiration">
        灵感库选取
      </el-button>
    </div>
    <div class="input_box">
      <span class="label" v-if="systemVersion !== 2">视频来源二</span>
      <el-input
        class="input_input"
        v-model.trim="inputLink"
        placeholder="请在此处粘贴视频播放地址/抖音分享链接🔗 或在下方上传视频文件"
      ></el-input>
      <el-button type="primary" class="input_button" :disabled="loading" @click="saveInputFun">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240326j10w2.png" alt="" />
        载入
      </el-button>
    </div>
    <!-- 视频区域 -->
    <div class="page_center" v-loading="loading">
      <div class="page_upload" ref="centerRef">
        <!-- 视频 -->
        <div class="video_parent" v-if="videoUrl">
          <div
            class="video_box"
            :style="{
              height: `calc(${centerHeight}px - 40px)`,
              width: `calc((${centerHeight}px - 40px) / 1.777)`
            }"
          >
            <video
              :poster="videoCover"
              class="one_video"
              :src="videoUrl"
              controls="controls"
              autoplay
            ></video>
            <div class="video_btn" @click="delFun">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20221119hj21g.png" alt="" />
            </div>
          </div>
        </div>
        <!-- 上传入口 -->
        <div class="upload_box" v-else>
          <uploadMaterial
            :disabled="loading"
            :maxDuration="300"
            class="upload_box2"
            :index="0"
            :showLoading="false"
            v-model:uploadLoading="loading"
            @success="uploadVideoSuccess"
            :acceptTypeList="['video/mp4', 'video/quicktime']"
          >
            <div class="upload_upload">
              <img
                class="upload_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20240327gu6fh.png"
                alt=""
              />
              <div class="upload_title">点击上传视频文件</div>
              <div class="upload_mark">支持mp4、mov格式，视频时长不超过5min</div>
            </div>
          </uploadMaterial>
        </div>
      </div>
      <div class="page_switch">
        <div class="one_switch">
          智能擦除水印/logo
          <el-switch
            :disabled="!videoUrl || handleLoading"
            style="margin-left: 12px"
            v-model="switchInfo.removeLogo"
            active-text="开"
            inactive-text="关"
            :active-value="1"
            :inactive-value="0"
            inline-prompt
          ></el-switch>
        </div>
        <div class="one_switch">
          智能擦除字幕
          <el-switch
            :disabled="!videoUrl || handleLoading"
            style="margin-left: 12px"
            v-model="switchInfo.removeText"
            active-text="开"
            inactive-text="关"
            :active-value="1"
            :inactive-value="0"
            inline-prompt
          ></el-switch>
        </div>
        <el-checkbox-group
          v-model="switchInfo.checkList"
          class="one_check_group"
          :disabled="!videoUrl || handleLoading || !switchInfo.removeText"
        >
          <el-checkbox :label="1">擦除视频上方1/3位置字幕</el-checkbox>
          <el-checkbox :label="2">擦除视频中间1/3位置字幕</el-checkbox>
          <el-checkbox :label="3">擦除视频下方1/3位置字幕</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <!-- 底部 -->
    <div class="page_bottom">
      <el-button
        class="bottom_btn"
        type="primary"
        :loading="handleLoading"
        :disabled="!videoUrl"
        @click="handleFun"
      >
        开始处理
      </el-button>
    </div>
    <!-- 选择灵感 -->
    <inspirationChooseDialog
      v-if="inspirationDialog.show"
      :inspirationDialog="inspirationDialog"
      @closeDialog="closeDialog"
      @preview="previewVideoFun"
      @select="selectSuccess"
    />
    <!-- 预览灵感视频 -->
    <previewVideo v-if="videoDialog.show" :previewDialog="videoDialog" />
  </div>
</template>
<script setup>
import { resolveLink, submitVideoSplitTask } from '@/api/sumvideo/intelligent_material.js'
import uploadMaterial from '@/views/sumvideo/components/material/upload_material_dialog.vue'
import inspirationChooseDialog from './components/inspiration_choose_dialog.vue'
import previewVideo from '@/components/preview_dialog/preview_dialog.vue'

// import uploadVideo from '@/views/sumvideo/components/material/upload_material_dialog.vue'
import { throttle, isEmpty, isNotEmpty } from '../../../utils/tools'
import { useStore } from 'vuex'

const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

console.log('版本信息 1专业版 2标准版 3企业版', systemVersion.value)
const inputLink = ref('') // 要载入的视频链接地址
const switchInfo = reactive({
  removeLogo: 1,
  removeText: 1,
  checkList: [1]
}) // 开关信息
const videoUrl = ref('') // 上传或载入成功的视频地址
const videoCover = ref('') // 上传或载入成功的视频封面
const videoName = ref('') //  上传的视频名字
const loading = ref(false) // 载入的Loading
const handleLoading = ref(false) // 开始处理的Loaidng

const inspirationDialog = reactive({
  show: false
})
// 视频预览的弹窗
const videoDialog = reactive({
  show: false,
  url: '',
  title: '查看灵感',
  type: 'video'
})

function resolveLinkFun(url, clearInput = false) {
  resolveLink({
    url
  })
    .then(res => {
      if (res.code === 0) {
        if (clearInput) {
          inputLink.value = ''
        }
        const link = res.data?.url
        // 载入成功
        videoCover.value =
          link.indexOf('aliyuncs.com') > -1
            ? link + '?x-oss-process=video/snapshot,t_1000,m_fast'
            : link + 'ci-process=snapshot&time=1&format=jpg'
        videoUrl.value = link || ''
        videoName.value = videoName.value ? videoName.value : res.data?.name || ''
        loading.value = false
      } else {
        if (clearInput) {
          inputLink.value = ''
        }
        loading.value = false
      }
    })
    .catch(() => {
      if (clearInput) {
        inputLink.value = ''
      }
      loading.value = false
    })
}

// 选择成功再进行一次导入
function selectSuccess(info) {
  loading.value = true
  videoName.value = info.name
  resolveLinkFun(info.url)
}

function previewVideoFun(e) {
  videoDialog.url = e.url
  videoDialog.show = e.show
}

// 打开素材库选择视频
function openInspiration() {
  inspirationDialog.show = true
}

function closeDialog() {
  inspirationDialog.show = false
}

// 视频上传成功
function uploadVideoSuccess(data, index, duration, name) {
  videoCover.value = data.url + '?x-oss-process=video/snapshot,t_1000,m_fast'
  videoUrl.value = data.url
  videoName.value = name || ''
}
// 删除视频
function delFun() {
  videoCover.value = ''
  videoUrl.value = ''
  videoName.value = ''
}
const message = inject('$message')
// 载入视频
const saveInputFun = throttle(() => {
  if (
    isEmpty(inputLink.value) ||
    (isNotEmpty(inputLink.value) && inputLink.value.indexOf('http') === -1)
  ) {
    message.warning(`请先输入${isNotEmpty(inputLink.value) ? '正确的' : ''}链接地址`)
    nextTick(() => {
      inputLink.value = ''
    })
  } else {
    loading.value = true
    videoName.value = ''
    resolveLinkFun(inputLink.value, true)
  }
}, 500)

// 开始处理
const handleFun = throttle(() => {
  if (videoUrl.value) {
    handleLoading.value = true
    let textArea = {}
    if (switchInfo.removeText && switchInfo.checkList && switchInfo.checkList.length > 0) {
      if (switchInfo.checkList.length === 1) {
        if (switchInfo.checkList.includes(1)) {
          textArea = {
            BY: 0,
            bh: 0.334
          }
        } else if (switchInfo.checkList.includes(2)) {
          textArea = {
            BY: 0.333,
            bh: 0.334
          }
        } else if (switchInfo.checkList.includes(3)) {
          textArea = {
            BY: 0.666,
            bh: 0.334
          }
        }
      } else if (switchInfo.checkList.length === 2) {
        if (JSON.stringify(switchInfo.checkList.sort()) === JSON.stringify([1, 2].sort())) {
          textArea = {
            BY: 0,
            bh: 0.667
          }
        } else if (JSON.stringify(switchInfo.checkList.sort()) === JSON.stringify([1, 3].sort())) {
          textArea = {
            BY: 0,
            bh: 1
          }
        } else if (JSON.stringify(switchInfo.checkList.sort()) === JSON.stringify([2, 3].sort())) {
          textArea = {
            BY: 0.333,
            bh: 0.667
          }
        }
      } else {
        textArea = {
          BY: 0,
          bh: 1
        }
      }
    } else if (switchInfo.removeText && switchInfo.checkList && switchInfo.checkList.length === 0) {
      textArea = {
        BY: 0,
        bh: 1
      }
    }
    submitVideoSplitTask({
      isRemoveLogo: switchInfo.removeLogo,
      isRemoveText: switchInfo.removeText,
      url: videoUrl.value,
      name: videoName.value || '',
      textArea: textArea
    })
      .then(res => {
        if (res.code === 0) {
          message.success('任务提交成功！请在【拆解记录】中查看拆解结果并手动归类')
          clearFun()
        } else {
          handleLoading.value = false
        }
      })
      .catch(() => {
        handleLoading.value = false
      })
  }
}, 500)
// 清空所有信息
function clearFun() {
  videoUrl.value = ''
  videoCover.value = ''
  videoName.value = ''
  loading.value = false
  handleLoading.value = false
  switchInfo.removeLogo = 1
  switchInfo.removeText = 1
  switchInfo.checkList = [1]
}
// 视频的高度计算
const centerHeight = ref(511)
const centerRef = ref(null)
function getCenterHeight() {
  centerHeight.value = centerRef.value?.clientHeight || 511
}
onMounted(() => {
  getCenterHeight()
  // 窗口重新绘制
  window.addEventListener('resize', getCenterHeight)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', getCenterHeight)
})
</script>
<style lang="scss" scoped>
.disassemble_page {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  padding: 16px 0px 0;
  .video_from_warp {
    padding: 0 24px;
    margin-bottom: 16px;
  }
  .input_box {
    padding: 0 24px;
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .input_input {
      width: calc(100% - 16px - 74px);
      margin-right: 16px;
    }
    .input_button {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      img {
        width: 16px;
        height: 16px;
        object-fit: contain;
        display: flex;
        margin-right: 2px;
      }
    }
  }
  .label {
    white-space: nowrap;
    margin-right: 16px;
  }
  .page_center {
    padding: 0 24px;
    width: 100%;
    height: calc(100% - 48px - 80px - 48px);
    .page_upload {
      width: 100%;
      height: calc(100% - 153px);
      background: #f2f3f5;
      border-radius: 2px;
      overflow-y: auto;
      // border: 1px solid #d8d8d8;
      .video_parent {
        width: 100%;
        height: 100%;
        min-height: 350px;
        padding: 20px 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .video_box {
        min-width: 180px;
        min-height: 320px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        .one_video {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          background: #303133;
        }
        .video_btn {
          cursor: pointer;
          position: absolute;
          right: 12px;
          top: 12px;
          img {
            width: 24px;
            height: 24px;
            object-fit: contain;
            display: flex;
          }
        }
      }
      .upload_box,
      .upload_box2,
      :deep(.upload-demo),
      :deep(.el-upload),
      :deep(.el-upload-dragger) {
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        border-radius: 4px;
      }

      .upload_upload {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .upload_icon {
          width: 24px;
          height: 24px;
          object-fit: contain;
          display: flex;
        }
        .upload_title {
          font-weight: 400;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
          margin: 16px 0 8px;
        }
        .upload_mark {
          font-weight: 400;
          font-size: 12px;
          color: #909399;
          line-height: 18px;
        }
      }
    }
    .page_switch {
      width: 100%;
      height: 153px;
      padding-top: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .one_switch {
        font-weight: 400;
        font-size: 14px;
        color: #303133;
        line-height: 20px;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
      .one_switch + .one_switch {
        margin-top: 4px;
      }
      .one_check_group {
        margin-top: 8px;
        padding: 0 12px;
        width: max-content;
        height: 36px;
        background: #ffffff;
        border-radius: 4px;
        border: 1px dashed #d8d8d8;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }
    }
  }

  .page_bottom {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 80px;
    background: #ffffff;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    border-radius: 0px 0px 4px 4px;
    .bottom_btn {
      width: 360px;
      height: 40px;
      border-radius: 4px;
    }
  }
}
</style>

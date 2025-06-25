<template>
  <div class="one_record">
    <div
      :style="info.status === 0 || info.status === 1 ? 'background: rgba(0, 0, 0, 0.4)' : ''"
      class="record_left"
      :class="{
        record_left_showProgress:
          info.videoStatus === 1 || immediateSaveStatus || props.savingList.includes(info.id + '')
      }"
      v-loading="info.status === 0 || info.status === 1"
      element-loading-background="rgba(0, 0, 0, 0.4)"
      @click="playFun"
    >
      <!-- 视频封面 -->
      <img class="left_video" :src="changeCover(info.coverUrl, info.videoUrl)" alt="" />
      <!-- 原视频tag -->
      <div class="left_tag">原视频</div>
      <!-- 播放按钮 -->
      <div class="left_play">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240328m6wlp.png" alt="" />
      </div>
      <!-- 合成进度 -->
      <div
        class="syn_progress"
        v-if="
          info.videoStatus === 1 || immediateSaveStatus || props.savingList.includes(info.id + '')
        "
      >
        AI模板合成中
        <el-progress
          type="circle"
          :width="50"
          :percentage="progress"
          style="margin-top: 8px"
          stroke-color="#fff"
        />
      </div>
    </div>
    <div class="record_right">
      <div class="right_top">
        <div class="right_top_right">
          <div>{{ info.submitTime ? String(info.submitTime).replace(/T/, ' ') : '--' }}</div>
          <div class="status_box">
            <!-- 成功 -->
            <template v-if="info.status === 2">
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240524hbp4y.png"
                alt=""
                class="success_icon"
              />
              <span class="success_text">拆解成功</span>
            </template>
            <template v-if="info.status === 3">
              <span class="fail_text">拆解失败</span>
              <span class="retry_text" @click="reIntelligent">重试</span>
            </template>
          </div>
        </div>
        <div v-if="info.status === 0 || info.status === 1"></div>
        <div v-else>
          <el-tooltip
            :disabled="chooseList.length > 0"
            popper-class="tooltip-class tooltip_group_list"
            placement="left"
          >
            <template #content>请先勾选原料</template>

            <el-button
              :disabled="chooseList.length == 0"
              class="right_top_left"
              type="primary"
              @click="handleFun"
            >
              执行操作
            </el-button>
          </el-tooltip>
          <el-button
            class="right_top_left"
            :class="{ right_top_left_loading: productLoading }"
            type="primary"
            :disabled="
              info.videoStatus == 1 ||
              immediateSaveStatus ||
              props.savingList.includes(info.id + '')
            "
            :loading="productLoading"
            @click="productTemplate"
            v-if="info.status !== 3"
          >
            {{ info.videoStatus === 2 ? '查看模板' : '合成模板' }}
          </el-button>
        </div>
      </div>
      <div class="right_bottom" v-if="info.status == 2 || info.status == 3">
        <div
          class="material_box"
          :infinite-scroll-delay="1000"
          v-infinite-scroll="loadFun"
          :infinite-scroll-distance="50"
          :infinite-scroll-immediate="false"
          :infinite-scroll-disabled="true"
        >
          <!-- tableForm.listData.length >= tableForm.page.total -->
          <div
            :class="{ one_material: true, choose_material: item.isChoose }"
            v-for="(item, index) in info.results"
            :key="index"
            @click="previewMaterialFun(item, index)"
          >
            <!-- 视频封面和图片地址 -->
            <img
              v-if="item.mediaType == 1 || item.mediaType == 2"
              class="material_img"
              :src="item.coverUrl || item.url"
              alt=""
            />
            <!-- 音频ICON -->
            <div class="material_audio" v-else-if="item.mediaType == 3">
              <img
                class="audio_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20240328tv5yk.png"
                alt=""
              />
            </div>
            <!-- 文本内容 -->
            <div class="material_text" v-else-if="item.mediaType == 4">
              {{ item.textContent || '--' }}
            </div>
            <!-- 音频和视频的时长 -->
            <div
              v-if="item.mediaType == 1 || item.mediaType == 3"
              :class="{ material_duration: true }"
            >
              {{ conversionTime(item.duration) }}
            </div>
            <!-- 视频的播放ICON -->
            <div class="video_play" v-if="item.mediaType == 1">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20240328m6wlp.png" alt="" />
            </div>
            <!-- 多选框 -->
            <div class="video_check" @click.stop="chooseFun(item, index)">
              <div class="xm_check_box">
                <div :class="{ check_box: true, check_box_active: item.isChoose }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 执行操作的弹窗 -->
    <operationDOM
      v-if="operationDialog.show"
      :operationDialog="operationDialog"
      @successFun="successFun"
    />
    <!-- 预览除了文本的原料弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 预览文本 -->
    <previewTextDialog v-if="previewTextInfo.show" :previewDialog="previewTextInfo" />
  </div>
</template>
<script setup>
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import previewTextDialog from '@/components/preview_text/preview_text.vue'
import operationDOM from './operation_dialog.vue'
import { throttle, secToMin } from '@/utils/tools'
import ProgressUpdater from '../js/index.js'
import { saveToTemplate } from '@/api/sumvideo/intelligent_material.js'
// import { INTELLIGENT_RECORD_STATUS } from '@/utils/dictionary/sumvideo.js' // 任务状态 0 未开始 1处理中 2处理成功 3处理失败
import { useRouter } from 'vue-router'

const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {}
    }
  },
  index: {
    type: Number,
    default: null
  },
  savingList: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const { info } = toRefs(props)
const router = useRouter()
const progress = ref(0)
const emits = defineEmits(['retry', 'save'])
const immediateSaveStatus = ref(false)
const message = inject('$message')
const productLoading = ref(false)
const operationDialog = ref({
  show: false
})

// 倒计时
const progressUpdater = new ProgressUpdater(
  val => {
    progress.value = val
  },
  () => {
    progress.value = 0
  }
)

watch(
  () => props.info,
  val => {
    // 合成成功提示
    if (val?.videoStatus === 2 && immediateSaveStatus.value) {
      message.success('合成成功！')
    }
    // 合成失败提示
    if (val?.videoStatus === 3 && immediateSaveStatus.value) {
      message.success('合成失败，请重试!')
    }
    // 合成中就显示合成中状态
    if (val?.videoStatus === 1) {
      immediateSaveStatus.value = true
    } else {
      immediateSaveStatus.value = false
    }
  },
  {
    deep: true,
    immediate: true
  }
)

onMounted(() => {
  if (info.value.videoStatus === 1) {
    immediateSaveStatus.value = true
    let start = 0 // 起始进度
    if (props.info.creativeCreateTime) {
      const startTemp = new Date(props.info.creativeCreateTime).getTime()
      const currentTemp = new Date().getTime()
      const tempDiff = parseInt((currentTemp - startTemp) / 1000)
      start = tempDiff > 20 ? 99 : tempDiff * 5
    }
    progressUpdater.start(start)
  }
})

const reIntelligent = throttle(() => {
  emits('retry', info.value.id, props.index)
}, 500)

// 获取原视频封面
function changeCover(cover, url) {
  if (cover) {
    return cover
  } else {
    return url.indexOf('aliyuncs.com') > -1
      ? url + '?x-oss-process=video/snapshot,t_1000,m_fast'
      : url + 'ci-process=snapshot&time=1&format=jpg'
  }
}
// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000)
}

// const tableForm = reactive({
//   listData: [
//     { isChoose: false },
//     { isChoose: false },
//     { isChoose: false },
//     { isChoose: false },
//     { isChoose: false }
//   ],
//   page: {
//     index: 1,
//     size: 10,
//     total: 0
//   }
// })
// 上拉加载更多
function loadFun() {
  console.log('到底了')
}

const previewTextInfo = ref({
  show: false
})
function previewTextFun(content) {
  previewTextInfo.value = {
    text: content || '',
    show: true
  }
}
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
// 播放原视频
const playFun = throttle(() => {
  // 播放视频
  if (
    info.value.videoStatus === 1 ||
    immediateSaveStatus.value ||
    props.savingList.includes(info.id + '')
  )
    return

  previewFun(info.value.videoUrl, 'video', '查看视频')
}, 500)

// 预览原料
const previewMaterialFun = throttle(item => {
  if (item.mediaType === 4) {
    previewTextFun(item.textContent)
    return
  }
  let url = ''
  let type = ''
  let title = ''
  let cover = ''
  switch (item.mediaType) {
    case 1:
      url = item.url
      cover = item.coverUrl
      type = 'video'
      title = '查看视频'
      break
    case 2:
      url = item.coverUrl
      cover = item.coverUrl
      type = 'image'
      title = '查看图片'
      break
    case 3:
      url = item.url
      type = 'audio'
      title = '查看音频'
      break
  }

  previewFun(url, type, title, cover)
}, 500)

function previewFun(url, type, title, cover) {
  previewInfo.value = {
    show: true,
    title: title,
    url: url,
    type: type,
    cover: cover || ''
  }
}
const chooseList = ref([])
// 选择原料
const chooseFun = throttle((e, i) => {
  e.isChoose = !e.isChoose
  if (e.isChoose) {
    chooseList.value.push(e)
  } else {
    const index = chooseList.value.findIndex(x => x.id === e.id)
    if (index > -1) {
      chooseList.value.splice(index, 1)
    }
  }
}, 300)

// 合成模板
function productTemplate() {
  // videoStatus	合成的模板视频合成状态 0：未触发 1：合成中 2：已完成 3:合成失败
  if (info.value.videoStatus === 2) {
    if (info.value.creativeIsDel === 1) {
      message.warning('该模板已被放入回收站，请还原后查看')
      return
    }
    // 存当前的tab，返回再回显
    sessionStorage.setItem('intelligent_tab', 'record')
    router.push({
      path: '/sumwhy_video/template_space/template_edit',
      query: {
        id: info.value.creativeId,
        origin: 'creative_mould' // 跟列表点进去的逻辑一样
      }
    })
    return
  }
  productLoading.value = true
  // if (!info.value.videoStatus) {
  //   immediateSaveStatus.value = true
  //   progressUpdater.start()
  // }
  saveToTemplate({ id: info.value.id })
    .then(res => {
      if (res.code === 0) {
        emits('save', info.value.id + '', props.index)
        productLoading.value = false
        immediateSaveStatus.value = true
        progressUpdater.start()
      } else {
        productLoading.value = false
      }
    })
    .catch(() => {
      progressUpdater.end(progress.value)
      immediateSaveStatus.value = false
      productLoading.value = false
    })
}
// 执行操作
const handleFun = throttle(() => {
  if (chooseList.value && chooseList.value.length > 0) {
    const ids = []
    chooseList.value.forEach(x => {
      ids.push(x.id)
    })
    operationDialog.value = {
      videoTitle: info.value.name ? info.value.name.substring(0, 20) : '',
      chooseMaterialList: ids || [],
      show: true
    }
  } else {
    message.warning('请先勾选原料')
  }
}, 500)

// 原料操作成功
function successFun() {
  // tableForm.listData.forEach(x => {
  //   x.isChoose = false
  // })
  info.value.results.forEach(x => {
    x.isChoose = false
  })
  chooseList.value = []
}

function clearFun() {
  chooseList.value = []
}
defineExpose({
  clearFun
})
</script>
<style lang="scss" scoped>
.one_record {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 12px 0 0 12px;
  :deep(.el-loading-spinner .path) {
    stroke: rgba(255, 255, 255, 0.8);
  }
  .record_left {
    cursor: pointer;
    margin-right: 12px;
    width: 120px;
    height: 182px;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    .left_video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: flex;
    }
    .left_tag {
      position: absolute;
      right: 0;
      top: 0;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 0px 4px 0px 10px;
      font-weight: 400;
      font-size: 12px;
      color: #ffffff;
      line-height: 18px;
      padding: 1px 6px;
    }
    .left_play,
    .syn_progress {
      opacity: 0;
      width: 120px;
      height: 182px;
      border-radius: 4px;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      img {
        width: 36px;
        height: 36px;
        object-fit: contain;
        display: flex;
      }
      :deep(.el-progress__text) {
        color: #fff;
      }
    }
    .syn_progress {
      opacity: 1;
      color: #fff;
      background: rgba(0, 0, 0, 0.4);
      flex-direction: column;
      :deep(.el-progress-circle) {
        svg {
          path:first-child {
            stroke: rgba(255, 255, 255) !important;
          }
        }
      }
    }
    &:hover {
      .left_play {
        opacity: 1;
      }
    }
  }
  .record_left_showProgress {
    cursor: default;
    .left_play {
      display: none;
    }
  }
  .record_right {
    width: calc(100% - 132px);
    padding-right: 8px;
    height: 182px;
    .right_top {
      margin-bottom: 2px;
      padding-right: 12px;
      width: 100%;
      display: flex;
      flex-direction: row;
      // justify-content: space-between;
      align-items: flex-start;
      .right_top_left {
        height: 28px;
        min-height: 28px;
        width: 80px;
      }
      .right_top_left_loading {
        width: auto;
      }
      .right_top_right {
        font-weight: 400;
        font-size: 14px;
        color: #909399;
        line-height: 20px;
        flex: 1;
        display: flex;
        .status_box {
          display: flex;
          margin-left: 18px;
          .success_text {
            color: #36c723;
          }
          .success_icon {
            width: 16px;
            height: 16px;
            min-width: 16px;
            object-fit: contain;
            display: flex;
            margin-right: 8px;
            margin-top: 2px;
          }
          .fail_text {
            color: #606266;
          }
          .retry_text {
            color: #364fcd;
            cursor: pointer;
            margin-left: 2px;
          }
        }
      }
    }
    .right_bottom {
      width: 100%;
      height: calc(100% - 30px);
      overflow-y: auto;
      .material_box {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        .one_material {
          cursor: pointer;
          width: 105px;
          height: 105px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          border: 1px solid #f7f8fa;
          margin: 12px 12px 0 0;
          position: relative;
          .material_img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .material_audio {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            .audio_icon {
              width: 60px;
              height: 60px;
              object-fit: contain;
              display: flex;
            }
          }
          .material_text {
            width: 100%;
            height: calc(100% - 8px);
            padding: 8px;
            font-weight: 400;
            font-size: 12px;
            line-height: 17px;
            overflow: hidden;
          }
          .material_duration {
            position: absolute;
            top: 6px;
            left: 6px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 2px;
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            line-height: 14px;
            padding: 0 4px;
          }
          .video_check {
            position: absolute;
            right: 0px;
            bottom: 0px;
            padding: 8px;
          }
          .video_play {
            opacity: 0;
            width: 105px;
            height: 105px;
            border-radius: 4px;
            position: absolute;
            left: 0;
            top: 0;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            img {
              width: 36px;
              height: 36px;
              object-fit: contain;
              display: flex;
            }
          }
          &:hover {
            .video_play {
              opacity: 1;
            }
          }
        }
        .choose_material {
          border: 1px solid #364fcd;
        }
      }
    }
  }
}
:deep(.record_left) {
  .el-loading-mask {
    .el-loading-spinner .circular {
      width: 28px;
      height: 28px;
    }
    .el-loading-spinner .path {
      stroke-width: 3;
    }
  }
  &:hover {
    .el-loading-mask {
      display: none !important;
    }
  }
}
</style>

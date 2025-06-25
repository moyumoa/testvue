<template>
  <div class="step_1" v-loading="stepLoading">
    <div class="title_warp">
      <stepTitle
        :currentSteps="1"
        :title="'请为每个分镜导入原料组，并完成旁白角色、字幕等自定义项'"
      ></stepTitle>
    </div>
    <div class="content_warp">
      <storyboardItem
        ref="storyboardItemRef"
        :ruleForm="ruleForm"
        :pipelineId="pipelineIdInStep"
        :storyErrIds="storyErrIds"
        @preview="materialPreview"
        @change="storyboardItemChange"
        @updateList="updateListFn"
      />
      <div class="line"></div>
      <!-- 声音设置 -->
      <div class="voice_warp" ref="voiceWarpRef" v-if="!stepLoading">
        <choseVoice
          title="旁白AI自动朗读"
          :classList="['chose_voice_step2', choseVoiceErr ? 'chose_voice_step2_err' : '']"
          :chooseInfo="(props.ruleForm.extraConfig && props.ruleForm.extraConfig.voices) || []"
          @updateVoiceFun="updateVoiceFun"
        />
        <div class="voice_bottom_box">
          <autoCreateSubtitles
            :classList="autoAsrErr ? ['chose_voice_step2_err'] : []"
            :extraConfig="props.ruleForm.extraConfig"
            @updateSubtitles="updateSubtitles"
          />
          <choseBgm
            ref="chooseBGMRef"
            :pipelineId="pipelineId"
            :extraConfig="props.ruleForm.extraConfig"
            :classList="bgmErr ? ['chose_voice_step2_err'] : []"
            @preview="materialPreview"
            @updateBgm="updateBgm"
            @updateList="updateListFn"
          />
        </div>
      </div>
    </div>
    <!-- 预览视频 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo" />
  </div>
</template>

<script setup>
import stepTitle from '@/views/sumvideo/components/step/steps_content_title.vue'
import storyboardItem from '@/views/sumvideo/create_by_script/components/import_storyboard_item.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import choseVoice from '@/views/sumvideo/components/material/choose_voice.vue'
import autoCreateSubtitles from '@/views/sumvideo/components/material/auto_create_subtitles.vue'
import choseBgm from '@/views/sumvideo/components/material/choose_bgm.vue'

import { getQueryVariable, throttle } from '@/utils/tools.js'
import { saveClipConfig, saveScriptConfig } from '@/api/sumvideo/create_by_script.js'
const props = defineProps({
  ruleForm: {
    type: Object,
    default: () => {
      return {
        list: []
      }
    }
  }, // 分镜列表
  pipelineId: {
    type: Number || String,
    default: null
  }
})
const { ruleForm, pipelineId } = toRefs(props)
const emits = defineEmits(['updateList', 'changeStep', 'updateLoading'])
const message = inject('$message')
const voiceWarpRef = ref(null)
const pipelineIdInStep = ref(null) // 流水线id
const stepLoading = ref(true)
const clickNext = ref(false) // 是否点击了下一步，如果每点击，那么原料验证就不要加
const choseVoiceErr = ref(false) // 旁白AI自动朗读是否通不通过校验，不通过时显示红框
const autoAsrErr = ref(false) // 自动生成字幕红框
const bgmErr = ref(false) // Bgm红框
const storyErrIds = ref([]) // 未通过检验的分镜ids，需要显示红框
const storyboardItemRef = ref(null)
const previewInfo = reactive({
  show: false, // 是否显示预览弹窗
  type: '', // 类型 video视频 audio音频 image图片
  title: '', // 预览标题
  url: '', // 地址
  cover: ''
})

// 保存通用设置信息（旁白AI朗读、自动生成字幕、BGM
function saveScriptConfigFn(info, type) {
  const params = {
    pipelineId: pipelineIdInStep.value
  }
  if (type === 'ai') {
    params.voices = info
  }
  if (type === 'subtitles') {
    params.fontSettings = info.fontSettings
    params.autoAsr = info.autoAsr
  }

  if (type === 'bgm') {
    const bgmConfig = {
      // bgms: []
    }
    bgmConfig.enableBgm = info.changeInfo.enableBgm || false
    bgmConfig.volume = info.changeInfo.volume || 20
    bgmConfig.fadeInTime = info.changeInfo.fadeInTime || 1
    bgmConfig.fadeOutTime = info.changeInfo.fadeOutTime || 1
    bgmConfig.isSelectAll = false
    bgmConfig.bgms = info.changeInfo.bgms // 选择的音频列表

    params.bgmConfig = bgmConfig
  }

  // if (params) return
  saveScriptConfig(params).then(res => {
    emits('updateList')
  })
}

// 更新BGM信息
function updateBgm(info, type) {
  const data = {
    changType: type,
    changeInfo: info
  }
  // if (data) return
  saveScriptConfigFn(data, 'bgm')
}

// 更新是否自动生成字幕
function updateSubtitles(info, isOpen) {
  const fontSettingList = (info || []).map(x => {
    return x.fontSetting
  })
  const data = {
    autoAsr: isOpen,
    fontSettings: fontSettingList
  }
  saveScriptConfigFn(data, 'subtitles')
}

// 更新旁白AI朗读
function updateVoiceFun(info) {
  saveScriptConfigFn(info, 'ai')
}

// 预览原料
function materialPreview(info) {
  previewInfo.cover = info.cover || null
  previewInfo.url = info.url
  previewInfo.type = info.type
  previewInfo.title = info.title
  previewInfo.show = info.show
}

function getUseTime(item, type) {
  let time = 0
  const clipAsideLength = item?.clipAside?.length || 0
  if (type === 'min') {
    if (clipAsideLength > 0) {
      time = (clipAsideLength / 5.5).toFixed(1)
    } else {
      time = 0
    }
  }
  if (type === 'max') {
    if (clipAsideLength > 0) {
      time = (clipAsideLength / 4.2).toFixed(1)
    } else {
      time = 0
    }
  }
  return time || 0
}
// clearInvalidMaterial 是否清空不匹配的素材
function storyboardItemChange(item, type, clearInvalidMaterial) {
  let params = {
    pipelineId: pipelineId.value,
    scriptClipId: item.id,
    cropType: item.cropType,
    isEnableMaterialSound: item.isEnableMaterialSound || 0,
    replaceModel: item.replaceModel,
    maxDuration: getUseTime(item, 'max') * 1000,
    minDuration: getUseTime(item, 'min') * 1000
  }
  // 智能倍速下支持清空不匹配的原料
  if (clearInvalidMaterial) {
    params.clearInvalidMaterial = true
    params.replaceModel = 3
  }
  if (type === 'transition') {
    const param = {
      pipelineId: pipelineId.value,
      scriptClipId: item.id,
      transition: item.transition
    }
    params = param
  }

  // if (item) return
  saveClipConfigFn(params, clearInvalidMaterial)
}

// 保存分镜信息
const saveClipConfigFn = throttle(function (params, clearInvalidMaterial) {
  saveClipConfig(params).then(res => {
    if (res.code === 0 && clearInvalidMaterial) {
      emits('updateList')
    }
  })
}, 200)

// 初始化第二步
function initPage() {
  if (pipelineId.value) {
    pipelineIdInStep.value = pipelineId.value
  } else {
    const id = getQueryVariable('pipelineId')
    pipelineIdInStep.value = Number(id)
  }
  clickNext.value = true
  choseVoiceErr.value = false
  storyErrIds.value = []
  // 获取(更新)列表
  updateListFn()
}
const chooseBGMRef = ref()
function getListEnd(result) {
  if (result === 'success') {
    nextTick(() => {
      storyboardItemRef.value?.clearLoading()
      chooseBGMRef.value?.clearLoading()
      stepLoading.value = false
    })
  } else {
    nextTick(() => {
      storyboardItemRef.value?.clearLoading()
      chooseBGMRef.value?.clearLoading()
      stepLoading.value = false
    })
  }
}
function updateListFn() {
  emits('updateList')
}

// bgm取消红框
// 自动生成字幕取消红框
watch(
  () => props.ruleForm.extraConfig,
  val => {
    if (voidAutoAsr(val)) {
      autoAsrErr.value = false
    }
    if (voidBgm(val)) {
      bgmErr.value = false
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// 旁白AI自动朗读取消红框
watch(
  () => props.ruleForm.extraConfig?.voices,
  val => {
    if (val && val.length > 0) {
      choseVoiceErr.value = false
    }
  },
  {
    deep: true,
    immediate: true
  }
)
// 验证分镜取消红框
watch(
  () => props.ruleForm.list,
  val => {
    if (val && val.length > 0) {
      if (clickNext.value) voidList(val)
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// 验证分镜是否都添加原料
function voidList(list) {
  const errIds = []
  ;(list || []).forEach(item => {
    if (
      !item.mediaListTotal ||
      !item.mediaList ||
      (item.mediaList && item.mediaList.length === 0)
    ) {
      errIds.push(item.id)
    }
  })
  storyErrIds.value = errIds
  return storyErrIds.value.length > 0
}

// 验证自动生成字幕-开关打开必选至少一个
function voidAutoAsr(config) {
  const { autoAsr, fontSettings } = config || {}
  let result = false
  if (!autoAsr) {
    result = true
  } else {
    if (fontSettings && fontSettings.length > 0) {
      result = true
    } else {
      result = false
    }
  }

  return result
}
// 验证bgm - 打开开关至少选择一个
function voidBgm(config) {
  const { bgmConfig } = config || {}
  let result = false
  if (!bgmConfig?.enableBgm) {
    result = true
  } else {
    if (bgmConfig?.bgms && bgmConfig.bgms.length > 0) {
      result = true
    } else {
      result = false
    }
  }
  return result
}
const scrollToBottom = () => {
  nextTick(() => {
    voiceWarpRef && voiceWarpRef.value.scrollIntoView({ block: 'center', inline: 'start' }) // behavior: 'smooth'
  })
}

// 校验，外边可以做，但是既然第一步放在里边了，其余的也都放在里边吧
function nextStep() {
  clickNext.value = true
  const { list, extraConfig } = props.ruleForm
  const listRegex = voidList(list)
  if (listRegex) {
    emits('updateLoading', false)
    message.warning('请先完善原料！')
    // 滚动到第一个未填写原料
    nextTick(() => {
      const id = storyErrIds.value[0]
      storyboardItemRef.value?.rollToErr(id)
    })
    return
  }
  if (!props.ruleForm?.extraConfig?.voices?.length) {
    choseVoiceErr.value = true
    emits('updateLoading', false)
    scrollToBottom()
    message.warning('请至少选择一种AI朗读音色！')
    return
  }

  const autoAsrRegex = voidAutoAsr(extraConfig)
  if (!autoAsrRegex) {
    emits('updateLoading', false)
    autoAsrErr.value = true
    scrollToBottom()
    message.warning('请至少选择一种字幕样式！')
    return
  }

  const bgmRegex = voidBgm(extraConfig)
  if (!bgmRegex) {
    emits('updateLoading', false)
    bgmErr.value = true
    scrollToBottom()
    message.warning('请至少选择一个BGM！')
    return
  }

  emits('changeStep', 2)
}
onMounted(() => {
  stepLoading.value = true
  initPage()
})

defineExpose({
  getListEnd,
  nextStep
})
</script>

<style lang="scss" scoped>
.step_1 {
  border-radius: 4px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  .title_warp {
    padding: 22px 24px 0 24px;
  }
  .content_warp {
    height: calc(100% - 73px);
    overflow-y: auto;
    padding: 20px 24px 92px 24px;
    .line {
      border-top: 1px solid #e8e8e8;
      margin-top: 16px;
    }
    .voice_warp {
      margin-top: 16px;
      box-sizing: border-box;
      :deep(.one_voice) {
        background: #fff !important;
      }
      .chose_voice_step2_err {
        border: 1px solid red;
      }
      .chose_voice_step2 {
        background: linear-gradient(180deg, #ffe8d9 0%, #fffcfa 100%);
        border-radius: 4px;
        :deep(.page_top) {
          .title {
            color: #f4640b;
          }
        }
        :deep(.page_center) {
          height: 104px;
        }
      }
      .voice_bottom_box {
        display: flex;
        margin-top: 12px;
        :deep(.auto_create_sub) {
          height: unset;
          .content {
            height: unset;
            max-height: 324px;
          }
        }
        :deep(.chose_voice_step2_err) {
          border: 1px solid red;
        }
        :deep(.choose_bgm) {
          margin-left: 12px;
          width: calc(50% - 6px);
          // max-height: 388px;
          // overflow: hidden;
          // padding-bottom: 16px;
        }
        :deep(.auto_create_sub) {
          width: calc(50% - 6px);
        }
      }
    }
  }
}
</style>

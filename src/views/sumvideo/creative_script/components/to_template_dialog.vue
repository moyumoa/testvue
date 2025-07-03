<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="转化为模板"
      width="560px"
      custom-class="rule_setting_dialog hide_footer_line show_header_line"
    >
      <div class="dialog_container">
        <div class="radio_line">
          <div class="radio_line_label">模板音频：</div>
          <el-radio-group v-model="audioMode">
            <el-radio :label="2">台词/旁白转化为音频</el-radio>
            <el-radio :label="1">保留分镜视频音频</el-radio>
          </el-radio-group>
        </div>
        <choseVoice
          v-if="audioMode === 2"
          title="旁白AI自动朗读"
          :classList="['chose_voice_self']"
          :showChooseNum="false"
          :multiple="false"
          :needDefault="true"
          :chooseInfo="chooseVoice"
          @updateVoiceFun="updateVoiceFun"
        />
        <autoCreateSubtitles
          :classList="['auto_create_subtitles']"
          :extraConfig="fontSetting"
          :showSetting="false"
          :multiple="false"
          :needDefault="true"
          @updateSubtitles="updateSubtitles"
        >
          <template #title>
            <div class="title_line">
              模板字幕
              <div class="title_line_subtitle">台词/旁白转化字幕</div>
            </div>
          </template>
        </autoCreateSubtitles>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="btnLoading" @click="show = false">取消</el-button>
          <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import choseVoice from '@/views/sumvideo/components/material/choose_voice.vue'
import autoCreateSubtitles from '@/views/sumvideo/components/material/auto_create_subtitles.vue'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['confirm', 'update:modelValue'])
const btnLoading = ref(false)
// 显示弹窗
const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  }
})
// 模板音频来源 1分镜音频 2 旁白
const audioMode = ref(2)
// 选中的音色
const chooseVoice = ref([])
const updateVoiceFun = list => {
  chooseVoice.value = list
}
// 选中字幕的样式
const fontSettingIsOpen = ref(false)
const fontSetting = ref({})
const updateSubtitles = (list, isOpen) => {
  fontSetting.value = list[0]?.fontSetting
  fontSettingIsOpen.value = isOpen
}

// 弹窗的确定事件
const handleConfirm = throttle(() => {
  btnLoading.value = true
  const data = {
    audioMode: audioMode.value,
    chooseVoice: audioMode.value === 2 ? chooseVoice.value[0] : undefined,
    clip2Subtitle: fontSettingIsOpen.value,
    fontSetting: fontSettingIsOpen.value ? fontSetting.value : undefined
  }
  emits('confirm', data)
}, 700)
</script>
<style lang="scss" scoped>
.dialog_container {
  padding: 8px 16px;
  .radio_line {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  .title_line {
    display: flex;
    align-items: center;
    .title_line_subtitle {
      margin-left: 8px;
      font-weight: 400;
      font-size: 12px;
      color: #909399;
      line-height: 18px;
      text-align: left;
      font-style: normal;
    }
  }
}

:deep(.el-textarea__inner) {
  padding: 6px 12px;
}
:deep(.el-input__inner) {
  padding: 0 12px;
}
:deep(.el-input-number.is-controls-right .el-input__inner) {
  padding-left: 12px;
  padding-right: 38px;
}
</style>

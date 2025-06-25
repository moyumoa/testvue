<template>
  <div>
    <el-dialog v-model="show" :width="580" @closed="close" top="60px">
      <template #title>
        <div class="dialog_title">
          <div class="title">{{ $data.templateInfo.title }}</div>
          <!-- <el-switch v-model="$data.templateInfo.enable" size="large" /> -->
        </div>
      </template>
      <div class="dialog_content">
        <div class="content_header">
          <div class="text">回复规则</div>
          <div
            class="select_template"
            :class="{
              disabled: $data.templateInfo.enable
            }"
            @click="onShowDialog"
          >
            <span>套用模板</span>
            <el-icon><i-arrow-right /></el-icon>
          </div>
        </div>
        <div class="reply_radio">
          <el-radio-group
            :disabled="$data.templateInfo.enable"
            v-model="$data.templateInfo.template[0].auto_reply_mode"
            @change="onModeChange"
          >
            <el-radio label="all">全部回复</el-radio>
            <el-radio label="keywords">匹配到关键词自动回复</el-radio>
          </el-radio-group>
        </div>
        <div class="rules_wrapper">
          <el-form ref="formRef" label-width="94px" :disabled="$data.templateInfo.enable">
            <reply-content
              :disabled="$data.templateInfo.enable"
              :type="$data.templateInfo.template[0].auto_reply_mode"
              :options="$data.templateInfo.template[0].auto_reply_options"
            ></reply-content>
          </el-form>
        </div>
      </div>
      <template #footer v-if="!$data.templateInfo.enable">
        <span class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="confirm" :loading="$data.saving">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <choose-policy-template
      v-if="$data.isShowDialog"
      v-model:show="$data.isShowDialog"
      @confirm="onSelectTemplate"
    ></choose-policy-template>
  </div>
</template>

<script setup>
import choosePolicyTemplate from './choose_policy_template.vue'
import replyContent from '../auto_reply_template/reply_content.vue'
import { saveMessagePolicy } from '@/api/scrm/policy'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  show: Boolean,
  info: Object
})
const { show, info } = toRefs(props)
const emits = defineEmits(['update:show', 'confirm'])

const formRef = ref(null)
const $data = reactive({
  templateInfo: {},
  saving: false,
  isShowDialog: false
})

function onModeChange(value) {
  if (value === 'all') {
    $data.templateInfo.template[0].auto_reply_options =
      $data.templateInfo.template[0].auto_reply_options.slice(0, 1)
  }
}

function onSelectTemplate(item) {
  $data.templateInfo.template = item.template
  $data.templateInfo.template[0].auto_reply_options.forEach(e => {
    e.reply_type = e.reply_type || 'text'
  })
}

function onShowDialog() {
  if ($data.templateInfo.enable) return
  $data.isShowDialog = true
}
function close() {
  $data.templateInfo = JSON.parse(JSON.stringify(info.value))
  emits('update:show', false)
}
function confirm() {
  const _before = $data.templateInfo
  for (const i in _before.template[0].auto_reply_options) {
    const ruleItem = _before.template[0].auto_reply_options[i]
    if (!ruleItem.reply_type) {
      ElMessage.warning('请填写回复类型')
      return
    }
    if (
      _before.template[0].auto_reply_mode === 'keywords' &&
      (!ruleItem.auto_reply_keywords || !ruleItem.auto_reply_keywords.length)
    ) {
      ElMessage.warning('请填写关键词')
      return
    }
    const _replyType = ruleItem.reply_type
    for (const k in ruleItem.auto_reply_seq) {
      const replyItem = ruleItem.auto_reply_seq[k]
      if (replyItem.reply_type === _replyType && !replyItem.reply_content) {
        ElMessage.warning('请填写回复内容')
        return
      }
    }
  }
  const parma = {
    id: _before.id,
    isOpen: _before.enable ? 1 : 0,
    openId: store.state.chat.policyOpenId,
    strategyType: _before.strategyType,
    type: _before.type,
    template: _before.template
  }
  $data.saving = true
  saveMessagePolicy(parma)
    .then(res => {
      ElMessage.success('保存成功')
      close()
      emits('confirm')
      setTimeout(() => {
        $data.saving = false
      }, 1000)
    })
    .catch(() => {
      $data.saving = false
    })
}

watch(
  () => props.info,
  val => {
    $data.templateInfo = JSON.parse(JSON.stringify(val))
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
:deep .el-dialog__header {
  padding: 6px 24px 6px 16px;
  .dialog_title {
    display: flex;
    align-items: center;
    height: 40px;
    color: #303133;
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
    .title {
      margin-right: 18px;
    }
  }
}
:deep .el-dialog__body {
  padding: 14px 16px;
  max-height: 70vh;
  overflow: auto;
}
.dialog_content {
  padding: 6px 0 14px 0;
  .content_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 15px;
    .text {
      font-weight: bold;
      color: #333;
    }
    .select_template {
      display: flex;
      align-items: center;
      color: #364fcd;
      cursor: pointer;
      &.disabled {
        cursor: not-allowed;
        color: #c0c4cc;
      }
      > span {
        margin-right: 4px;
      }
    }
  }
  .rules_wrapper {
    margin-top: 12px;
  }
}
</style>

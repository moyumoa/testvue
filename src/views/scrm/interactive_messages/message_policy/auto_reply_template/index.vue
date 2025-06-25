<template>
  <div>
    <el-dialog v-model="show" :width="580" @closed="close">
      <template #title>
        <div class="dialog_title">
          <div class="title">{{ $data.templateInfo.title }}</div>
          <!-- <el-switch v-model="$data.templateInfo.enable" size="large" /> -->
        </div>
      </template>
      <div class="dialog_content">
        <el-form ref="formRef" label-width="94px" :disabled="$data.templateInfo.enable">
          <reply-content
            :disabled="$data.templateInfo.enable"
            :options="$data.templateInfo.template[0].auto_reply_options"
          ></reply-content>
        </el-form>
      </div>
      <template #footer v-if="!$data.templateInfo.enable">
        <span class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="confirm" :loading="$data.saving">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import replyContent from './reply_content.vue'
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
const $data = reactive({
  templateInfo: {},
  saving: false
})
const formRef = ref(null)

watch(
  () => props.info,
  val => {
    $data.templateInfo = JSON.parse(JSON.stringify(val))
  },
  { deep: true, immediate: true }
)

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
}
.dialog_content {
  display: flex;
  justify-content: space-between;
  padding: 6px 0 14px 0;
}
</style>

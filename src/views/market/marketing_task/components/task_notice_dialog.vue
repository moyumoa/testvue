<template>
  <div class="task-notice-dialog">
    <el-dialog v-model="dialogVisible" width="700px">
      <div class="dialog-container">
        <el-icon class="icon-warning">
          <i-warning-filled/>
        </el-icon>
        确认立即向还未参与任务的员工发送通知？
      </div>
      <div class="dialog-tips">
        任务通知规则：
        <br/>
        1. 手动点击发送通知将立即通过客户端给所有还未参与过任务的员工发送任务通知
        <br/>
        2. 任务开始时，系统会自动给员工发送一条任务通知（22点～08点的通知消息将在08:00后发送）
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
})
// const { modelValue } = toRefs(props)
const emits = defineEmits(['update:modelValue', 'confirm'])
const dialogVisible = ref(false)

watch(() => dialogVisible.value, (newValue) => {
  emits('update:modelValue', newValue)
})
watch(() => props.modelValue, (newValue) => {
  console.log('modelValue.发送通知')
  dialogVisible.value = newValue
})

const onConfirm = () => {
  emits('confirm')
}
</script>

<style lang="scss" scoped>
.task-notice-dialog {
  .dialog-container {
    line-height: 20px;
    display: flex;
    align-items: center;
    font-size: 16px;

    .icon-warning {
      color: #e6a23c;
      font-size: 24px;
      margin-right: 5px;
    }
  }

  .dialog-tips {
    margin-top: 20px;
    padding-left: 30px;
    color: #b9b9b9;
    line-height: 25px;
  }
}
</style>

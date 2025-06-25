<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="系统提醒"
    width="500px"
    @close="close"
  >
    提交成功，系统后台已开始导入
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">查看导入记录</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  successDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.successDialog, 'show')

const emits = defineEmits(['upList'])

const router = useRouter()
const handleConfirm = throttle(() => {
  router.push({
    path: '/content_center/work_library/import_record'
  })
}, 700)
function close() {
  emits('upList')
}
</script>
<style lang="scss" scoped>
.error_text {
  color: #ff0000;
  margin-top: 8px;
}
</style>

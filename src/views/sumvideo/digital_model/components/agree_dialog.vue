<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="用户协议"
    width="500px"
    custom-class="rule_setting_dialog rule_setting_form_dialog hide_footer_line"
  >
    用户协议
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <!-- <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button> -->
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
// import { throttle } from '@/utils/tools.js'
const props = defineProps({
  agreeDialog: {
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
const show = toRef(props.agreeDialog, 'show')
// const loading = ref(false)
// const handleConfirm = throttle(() => {
//   const text = textarea.value.replace(/&nbsp;/g, '').replace(/ /g, '')
//   if (text) {
//     loading.value = true
//     showErr.value = false
//     addContent({
//       content: textarea.value
//     })
//       .then(res => {
//         if (res.code === 0) {
//           message({
//             type: 'success',
//             message: '添加成功'
//           })
//           dialog.value.handleClose()

//           emits('updateList')
//         } else {
//           loading.value = false
//         }
//       })
//       .catch(() => {
//         loading.value = false
//       })
//   } else {
//     showErr.value = true
//   }
// }, 700)
function closeDialog() {
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
</style>

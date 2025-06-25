<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    title="请成员使用微信扫码关注公众号"
    width="420px"
    v-model="show"
    custom-class="xm_element_dialog delPart_dialog"
    :before-close="handleClose"
  >
    <div class="content" v-loading="loading">
      <img v-if="authImageBase64" :src="authImageBase64" alt="" />
    </div>
  </el-dialog>
</template>
<script setup>
import { getWxOfficialQrCode } from '@/api/system_setting/framework.js'
const props = defineProps({
  followDialog: {
    type: Object,
    default: () => {
      return {
        userId: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})

const emits = defineEmits(['getStaffList'])
const dialog = ref()
const show = toRef(props.followDialog, 'show')
const authImageBase64 = ref()
const loading = ref(false)

function handleClose(done) {
  console.log('弹窗关闭')
  emits('getStaffList')
  done()
}
function closeDialog() {
  dialog.value.handleClose()
}
function init() {
  loading.value = true
  getWxOfficialQrCode({})
    .then(res => {
      if (res.code === 0) {
        authImageBase64.value = res.data.qrCodeURL
        loading.value = false
      } else {
        loading.value = false

        closeDialog()
      }
    })
    .catch(() => {
      loading.value = false
      closeDialog()
    })
}
init()
</script>
<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4px 0 8px;
  min-height: 180px;
  img {
    width: 168px;
    height: 168px;
    object-fit: contain;
  }
}
</style>

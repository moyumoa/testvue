<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="新增视频号机构号"
      width="420px"
      custom-class="rule_setting_dialog rule_setting_form_dialog  hide_footer_line"
      :before-close="handleClose"
    >
      <div
        class="dialog_content"
        v-loading="showAuthReqLoading"
        element-loading-background="rgba(0,0,0,0)"
      >
        <!-- 未授权 -->
        <div class="unAuth_box flexCenter" v-if="authStatus == 1 || authStatus == 5">
          <div class="unAuth_title">请使用机构号主账号微信扫码</div>
          <div class="unAuth_content">
            <qrcode-vue v-if="codeUrl" :size="180" level="H" :value="codeUrl" />
            <!-- 已失效 -->
            <div class="unAuth_other" @click="getAuthReq" v-if="authStatus == 5">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20230719zhvs7.png" alt />
            </div>
          </div>
          <div class="unAuth_time" v-if="authStatus == 1">
            <span style="color: #364fcd">{{ count }}S</span>
            后失效
          </div>
          <div class="unAuth_time" v-if="authStatus == 5">已失效，点击重新加载</div>
        </div>
        <!-- 授权中 -->
        <!-- <div
          class="authing_box flexCenter"
          v-else-if="authStatus == 2"
          v-loading="true"
          element-loading-text="验证中，请稍后"
          custom-class="loading_box"
        ></div> -->
        <!-- 授权成功 -->
        <div class="authSuccess_box flexCenter" v-else-if="authStatus == 3 || authStatus == 2">
          <img src="https://tagvv-1256030678.file.myqcloud.com/202401291edc3.png" alt="" />
          {{ authStatus == 3 ? '授权成功' : '操作成功，待星麦云进一步人工确认' }}
        </div>
        <!-- 授权失败 -->
        <div class="authFail_box flexCenter" v-else-if="authStatus == 4">
          <img src="https://tagvv-1256030678.file.myqcloud.com/20240129pjvf6.png" alt="" />
          <div class="authFail_title">授权失败</div>
          <div class="authFail_mark" v-if="authErrReason">
            失败原因：{{ authErrReason || '--' }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'
import { getWxMcnAuthGuid, getWxMcnAuthStatus } from '@/api/system_setting/authorization'

import qrcodeVue from 'qrcode.vue'
const props = defineProps({
  authDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const show = toRef(props.authDialog, 'show')
const dialog = ref()
const emits = defineEmits(['updateList'])
// 请求接口的Loading
const showAuthReqLoading = ref(false)
const authStatus = ref(1) // 1 未授权 2待进一步人工确认 3授权成功 4授权失败 5二维码失效
const codeUrl = ref('') // 授权的二维码
const authToken = ref(null) // 授权token
const authErrReason = ref('') // 授权失败原因
const timer = ref(null) // 倒计时的定时器
const count = ref(300) // 倒计时
const scan = ref(false) // 是否扫码成功
// 获取授权信息
const getAuthReq = throttle(() => {
  showAuthReqLoading.value = true
  authStatus.value = 1
  authErrReason.value = ''
  clearTimer()
  codeUrl.value = ''
  scan.value = false
  getWxMcnAuthGuid({
    state: JSON.stringify({
      brandId: localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo')).brandId
        : null
    })
  })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        codeUrl.value = data.qrCode || ''

        authToken.value = data.token || ''
        setTimeCount(data.expireIn)
        setTimer()
      } else {
        dialog.value.handleClose()
      }
      showAuthReqLoading.value = false
    })
    .catch(() => {
      dialog.value.handleClose()
      showAuthReqLoading.value = false
    })
}, 500)

// 设置定时器
const setTimer = () => {
  timer.value = setInterval(() => {
    if (count.value === 0) {
      authStatus.value = 5
      clearTimer()
    } else {
      count.value--
      if (count.value % 3 === 0) {
        getWxMcnAuthStatus({ token: authToken.value }).then(res => {
          if (res.code === 0) {
            // 0初始化二维码 1待星麦云确认 2 授权成功 3授权失败
            if (res.data === '2') {
              authStatus.value = 3
              clearTimer()
            }
            if (res.data === '1') {
              authStatus.value = 2
              clearTimer()
            }
            if (res.data === '3') {
              clearTimer()
              setTimeCount()
              authErrReason.value = res.msg || ''
              authStatus.value = 4
            }
          }
        })
      }
    }
  }, 1000)
}
// 设置倒计时
const setTimeCount = expireIn => {
  count.value = expireIn || 300
}
// 清空定时器
const clearTimer = () => {
  clearInterval(timer.value)
  timer.value = null
}
// 授权弹窗关闭时，清空定时器
function handleClose(done) {
  clearTimer()
  setTimeCount()
  // if (authStatus.value === 3 || authStatus.value === 2) {
  emits('updateList')
  // }
  done()
}
onBeforeUnmount(() => {
  clearTimer()
})
onMounted(() => {
  getAuthReq()
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  width: 100%;
  min-height: 290px;
  .flexCenter {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  // 未授权
  .unAuth_box {
    .unAuth_title {
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      padding: 20px 0 16px;
    }
    .unAuth_content {
      width: 180px;
      height: 180px;
      background: #d8d8d8;
      border-radius: 1px;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: flex;
      }
      .unAuth_other {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        text-align: center;
        background-color: rgba($color: #fff, $alpha: 0.9);
        img {
          display: flex;
          width: 36px;
          height: 36px;
        }
      }
      .unAuth_scanSuccess {
        height: 100%;
        flex-direction: column;
        color: #7fe2a1;
        > .wc_icon {
          margin-bottom: 8px;
          font-size: 36px;
        }
      }
    }
    .unAuth_time {
      margin: 16px 0 24px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    .unAuth_btn {
      margin: 24px 0 16px;
      width: 122px;
      height: 32px;
      background: #364fcd;
      border-radius: 4px;
    }
  }
  // 授权中
  .authing_box {
    width: 100%;
    height: 100%;
    :deep(.el-loading-spinner) {
      margin-top: -50px;
      .el-loading-text {
        margin: 24px 0 0;
        color: #909399;
      }
    }
  }
  // 授权成功
  .authSuccess_box {
    width: 100%;
    height: 100%;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    line-height: 20px;
    img {
      width: 48px;
      height: 48px;
      margin: 64px 0 20px;
      object-fit: contain;
      display: flex;
    }
  }
  // 授权失败
  .authFail_box {
    width: 100%;
    height: 100%;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    line-height: 20px;
    img {
      width: 48px;
      height: 48px;
      margin: 64px 0 20px;
      object-fit: contain;
      display: flex;
    }
    .authFail_mark {
      margin-top: 12px;
      padding: 0 16px;
      font-size: 14px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      text-align: center;
    }
  }
}
</style>

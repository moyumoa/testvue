<template>
  <div class="qrCode_box">
    <div
      class="code_loading"
      style="width: 160px; height: 160px; margin: 0 auto"
      v-loading="showAuthReqLoading"
      element-loading-background="rgba(0,0,0,0.05)"
    >
      <div
        v-if="codeUrl"
        class="code_img"
        v-loading="scan"
        element-loading-text="授权验证中"
        custom-class="loading_box"
      >
        <img v-if="codeUrl" :src="codeUrl" alt />
        <div v-if="(count === 0 || authErr) && !scan" class="mask flex_center">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20230719zhvs7.png"
            alt
            @click="getAuthReq"
          />
        </div>
        <div v-if="scan" class="mask">
          <div class="success flex_center">
            <i class="iconfont icon-wancheng wc_icon"></i>
            <p>扫码成功</p>
          </div>
        </div>
      </div>
    </div>
    <div class="text" style="margin-bottom: 0" v-if="!scan && codeUrl">
      <template v-if="authErr">
        <div>授权失败，点击重新加载</div>
        <div style="color: #fd2d54; margin-top: 10px" v-if="authErrReason">
          {{ authErrReason || '' }}
        </div>
      </template>
      <template v-else>
        <template v-if="count > 0">
          <span style="color: #364fcd">{{ count }}S</span>
          后失效
        </template>
        <template v-else>已失效，点击重新加载</template>
      </template>
    </div>
  </div>
</template>
<script setup>
import { getDyAuthQrCode, getDyQrAuthStatus } from '@/api/system_setting/authorization'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  info: {
    type: Object,
    default: () => {
      return {
        authAccountName: ''
      }
    }
  }
})
const { info } = toRefs(props)
// 请求接口的Loading
const showAuthReqLoading = ref(false)
//  邀请码相关数据
const authErr = ref(false) // 授权是否失败
const authErrReason = ref('') // 授权失败的原因
const codeUrl = ref(null) // 二维码地址
const authNo = ref(null) // 授权唯一号
const authToken = ref(null) // 授权token
const qrid = ref(null) // 授权唯一号
const timer = ref(null) // 倒计时的定时器
const count = ref(300) // 倒计时
const scan = ref(false) // 是否扫码成功
const scanAuth = ref(false) // 是否扫码验证中
const show = ref(true)
const emits = defineEmits(['update:disabled', 'updateStatus'])
// 设置定时器
const setTimer = () => {
  timer.value = setInterval(() => {
    if (count.value === 0) {
      emits('update:disabled', false)
      scan.value = false
      scanAuth.value = false
      clearTimer()
    } else {
      count.value--
      if (count.value % 3 === 0) {
        getDyQrAuthStatus({ authNo: authNo.value, token: authToken.value }).then(res => {
          if (res.code === 0) {
            // status 扫码状态new（新建）scanned（已扫描）confirmed（已授权）expired（已过期，过期时间 5 分钟）
            // saveStatus   1待授权 2授权成功 3授权失败
            // 授权正常
            if (res.data.status === 'confirmed' && res.data.saveStatus === 2) {
              emits('updateStatus', 2)
              clearTimer()
            }
            // 已扫码
            if (res.data.status === 'scanned') {
              emits('update:disabled', true)
              scan.value = true
              scanAuth.value = false
            }
            if (res.data.status === 'confirmed' && res.data.saveStatus === 1) {
              scanAuth.value = true
            }
            // 授权失效
            if (res.data.status === 'expired') {
              emits('update:disabled', false)
              scan.value = false
              scanAuth.value = false
              clearTimer()
              count.value = 0
            }
            // 授权失败
            if (res.data.saveStatus === 3) {
              emits('update:disabled', false)
              scan.value = false
              scanAuth.value = false
              clearTimer()
              setTimeCount()
              authErrReason.value = res.data.errorMsg || ''
              authErr.value = true
            }
          }
        })
      }
    }
  }, 1000)
}
// 清空定时器
const clearTimer = () => {
  clearInterval(timer.value)
  timer.value = null
}
// 设置倒计时
const setTimeCount = () => {
  count.value = 300
}
// 获取授权信息
const getAuthReq = throttle(() => {
  showAuthReqLoading.value = true
  authErr.value = false
  authErrReason.value = ''
  clearTimer()
  codeUrl.value = ''
  emits('update:disabled', false)
  scan.value = false
  scanAuth.value = false
  getDyAuthQrCode({ source: 2, authType: 5, isAuth: 1, targetAuthClueUid: info.value.originUid })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        codeUrl.value = data.authImageBase64 ? 'data:image/jpg;base64,' + data.authImageBase64 : '' // 授权图片地址
        authNo.value = data.authNo || ''
        authToken.value = data.token || ''
        qrid.value = data.qrid || ''
        setTimeCount()
        if (show.value) {
          setTimer()
        }
      }
      showAuthReqLoading.value = false
    })
    .catch(() => {
      showAuthReqLoading.value = false
    })
}, 500)

onMounted(() => {
  setTimeCount()
  getAuthReq()
})
// 弹窗关闭时，清空定时器
onBeforeUnmount(() => {
  show.value = false
  clearTimer()
  setTimeCount()
})
</script>
<style lang="scss" scoped>
.qrCode_box {
  margin-top: -16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.code_img {
  position: relative;
  margin: 0 auto;
  width: 160px;
  height: 160px;
  > img {
    width: 100%;
  }
  .mask {
    width: 100%;
    height: 100%;
    background-color: rgba($color: #fff, $alpha: 0.9);
    position: absolute;
    left: 0;
    top: 0;
    > img {
      width: 36px;
      height: 36px;
      cursor: pointer;
    }
    > .success {
      height: 100%;
      flex-direction: column;
      color: #7fe2a1;
      > .wc_icon {
        margin-bottom: 8px;
        font-size: 36px;
      }
    }
  }
}
.text {
  color: #909399;
  font-size: 14px;
  margin: 10px 0 22px 0;
  text-align: center;
}
</style>

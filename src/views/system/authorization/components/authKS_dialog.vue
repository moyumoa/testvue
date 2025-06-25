<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="授权码"
      width="344px"
      custom-class="hide_footer_line hide_header_line"
      :before-close="handleClose"
    >
      <div class="invite_code">
        <div class="code">
          <p style="margin-bottom: 8px">请使用快手扫码加入</p>

          <div
            class="code_loading"
            style="width: 140px; height: 140px; margin: 0 auto"
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
              <div style="color: red; margin-top: 10px" v-if="authErrReason">
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
      </div>
      <template #footer></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { getKsAuthQrCode, getKsQrAuthStatus } from '@/api/system_setting/authorization'
import { throttle } from '@/utils/tools.js'
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
const emits = defineEmits(['updateFun'])
const dialog = ref()
const show = toRef(props.authDialog, 'show')
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
const count = ref(100) // 倒计时
const scan = ref(false) // 是否扫码成功
const message = inject('$message')
// 设置定时器
const setTimer = () => {
  timer.value = setInterval(() => {
    if (count.value === 0) {
      scan.value = false
      clearTimer()
    } else {
      count.value--
      if (count.value % 3 === 0) {
        getKsQrAuthStatus({ authNo: authNo.value, token: authToken.value }).then(res => {
          if (res.code === 0) {
            // status 扫码状态new（新建）SCANNED（已扫描）ACCEPTED（已扫码并确认）expired（已过期，过期时间 100s）
            // saveStatus   1待授权 2授权成功 3授权失败
            if (res.data.status === 'ACCEPTED' && res.data.saveStatus === 2) {
              message.success('授权成功')
              clearTimer()
              emits('updateFun', true)
              // 关闭弹窗刷新列表
            }
            if (res.data.status === 'SCANNED') {
              scan.value = true
            }
            if (res.data.status === 'expired') {
              scan.value = false
              clearTimer()
              count.value = 0
            }
            if (res.data.saveStatus === 3) {
              scan.value = false
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
  count.value = 100
}
// 获取授权信息
const getAuthReq = throttle(() => {
  showAuthReqLoading.value = true
  authErr.value = false
  authErrReason.value = ''
  clearTimer()
  codeUrl.value = ''
  scan.value = false
  getKsAuthQrCode({ source: 2, authType: 6 })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        codeUrl.value = data.authImageBase64 ? 'data:image/jpg;base64,' + data.authImageBase64 : '' // 授权图片地址
        authNo.value = data.authNo || ''
        authToken.value = data.token || ''
        qrid.value = data.qrid || ''
        setTimeCount()
        setTimer()
      } else {
        emits('updateFun')
      }
      showAuthReqLoading.value = false
    })
    .catch(() => {
      emits('updateFun')
      showAuthReqLoading.value = false
    })
}, 500)

onMounted(() => {
  setTimeCount()
  getAuthReq()
})
// 授权弹窗关闭时，清空定时器
function handleClose(done) {
  clearTimer()
  setTimeCount()
  done()
}
</script>
<style lang="scss" scoped>
.invite_code {
  .code {
    text-align: center;
    .code_img {
      position: relative;
      margin: 0 auto;
      width: 140px;
      height: 140px;
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
    }
  }
}
</style>

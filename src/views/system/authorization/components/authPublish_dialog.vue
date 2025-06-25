<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="发布能力授权"
      width="420px"
      custom-class="rule_setting_dialog show_header_line "
      :before-close="handleClose"
    >
      <div class="dialog_content" v-loading="loading">
        <!-- 正常授权界面 -->
        <template v-if="showStatus == 1">
          <div class="tab_tip">请使用抖音扫码加入</div>
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
                <div
                  style="color: #fd2d54; margin-top: 10px; padding-bottom: 8px"
                  v-if="authErrReason"
                >
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
        <!-- 授权成功 -->
        <div class="authSuccess_box" v-if="showStatus == 2">
          <img src="https://tagvv-1256030678.file.myqcloud.com/202308285x4mf.png" alt="" />

          <div class="title">恭喜你！授权成功</div>
        </div>
        <!-- 没有UID -->
        <authNoUID
          origin="authPublish"
          :info="info"
          @updateStatus="updateStatus"
          v-if="showStatus == 3"
        />
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { accountDyWebAuthLink, accountDyWebAuthFresh } from '@/api/system_setting/authorization'
import authNoUID from './authClue_components/authClue_NoUID.vue'
import { throttle } from '@/utils/tools'

const props = defineProps({
  authDialog: {
    type: Object,
    default: () => {
      return {
        info: {},
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
// const disabled = ref(false) // 是否授权中
const info = ref({})
const dialog = ref()
const show = toRef(props.authDialog, 'show')
const useRefresh = ref(null) // 是否需要刷新页面
const showStatus = ref(null) // 1 正常授权界面 2 授权成功 3没有UID
// 授权弹窗关闭时，清空定时器
function handleClose(done) {
  if (useRefresh.value) {
    emits('updateFun', true)
  }
  done()
}
const loading = ref(true) // 是否加载中

const emits = defineEmits(['updateFun'])
// 更新页面状态
function updateStatus(e, uid) {
  showStatus.value = e
  if (e === 2 || e === 1) {
    useRefresh.value = e
  }
  if (uid) {
    info.value.originUid = uid
  }
}

// 请求接口的Loading
const showAuthReqLoading = ref(false)
//  邀请码相关数据
const authErr = ref(false) // 授权是否失败
const authErrReason = ref('') // 授权失败的原因
const codeUrl = ref(null) // 二维码地址
const authNo = ref(null) // 授权唯一号
const authToken = ref(null) // 授权token

const timer = ref(null) // 倒计时的定时器
const count = ref(300) // 倒计时
const scan = ref(false) // 是否扫码成功
const scanAuth = ref(false) // 是否扫码验证中

// const emits = defineEmits(['update:disabled', 'updateStatus'])
// 设置定时器
const setTimer = () => {
  timer.value = setInterval(() => {
    if (count.value === 0) {
      // emits('update:disabled', false)
      scan.value = false
      scanAuth.value = false
      clearTimer()
    } else {
      count.value--
      if (count.value % 3 === 0) {
        accountDyWebAuthFresh({ authNo: authNo.value, token: authToken.value }).then(res => {
          if (res.code === 0) {
            // status 扫码状态new（新建）scanned（已扫描）confirmed（已授权）expired（已过期，过期时间 5 分钟）
            // authStatus   1待授权 2授权成功 3授权失败
            // 授权正常
            if (res.data.status === 'confirmed' && res.data.authStatus === 2) {
              updateStatus(2)
              message.success('授权成功')
              clearTimer()
              emits('updateFun', true)
            }
            // 已扫码
            if (res.data.status === 'scanned') {
              // emits('update:disabled', true)
              scan.value = true
              scanAuth.value = false
            }
            if (res.data.status === 'confirmed' && res.data.authStatus === 1) {
              scanAuth.value = true
            }
            // 授权失效
            if (res.data.status === 'expired') {
              // emits('update:disabled', false)
              scan.value = false
              scanAuth.value = false
              clearTimer()
              count.value = 0
            }
            // 授权失败
            if (res.data.authStatus === 3) {
              // emits('update:disabled', false)
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
const message = inject('$message')
// 获取授权信息
const getAuthReq = throttle(() => {
  showAuthReqLoading.value = true
  authErr.value = false
  authErrReason.value = ''
  clearTimer()
  codeUrl.value = ''
  // emits('update:disabled', false)
  scan.value = false
  scanAuth.value = false
  accountDyWebAuthLink({ id: info.value.operationId, openId: info.value.openId })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        codeUrl.value = data.qrCode ? 'data:image/jpg;base64,' + data.qrCode : '' // 授权图片地址
        authNo.value = data.authNo || ''
        authToken.value = data.token || ''

        setTimeCount()

        setTimer()
      }
      showAuthReqLoading.value = false
    })
    .catch(err => {
      if (err.msg) {
        message.error(err.msg)
        show.value = false
      }
      showAuthReqLoading.value = false
    })
}, 500)

onMounted(() => {
  console.log('authdialog', props.authDialog.info)
  if (props.authDialog.info) {
    info.value = JSON.parse(JSON.stringify(props.authDialog.info))
    if (info.value.originUid) {
      showStatus.value = 1
      setTimeCount()
      getAuthReq()
    } else {
      showStatus.value = 3
    }
  }
  loading.value = false
})

// 弹窗关闭时，清空定时器
onBeforeUnmount(() => {
  // show.value = false
  clearTimer()
  setTimeCount()
})
</script>
<style lang="scss" scoped>
.dialog_content {
  width: 100%;
  padding: 16px;
  min-height: 260px;
}

.tab_tip {
  font-size: 14px;
  font-weight: 400;
  color: #606266;
  line-height: 17px;
  width: 100%;
  text-align: center;
  margin: 8px 0 28px;
}
.authSuccess_box {
  width: 100%;
  height: 289px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }

  .title {
    width: 100%;
    text-align: center;
    margin-top: 16px;
    font-size: 16px;
    font-weight: 400;
    color: #1f2329;
    line-height: 24px;
  }
}

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

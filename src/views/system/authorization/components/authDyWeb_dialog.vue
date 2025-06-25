<template>
  <div class="authDyWeb_dialog">
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="获客互动能力授权"
      width="420px"
      custom-class="xm_element_dialog"
    >
      <!-- 验证码授权  -->
      <template v-if="!isScanMode">
        <!--手机验证码登陆      -->
        <div class="container" v-if="!errorMsg">
          <div class="container_title">手机验证码授权</div>
          <el-form ref="formRef" :model="formData" :rules="formFormRules">
            <el-form-item label="" prop="phone">
              <el-input
                class="container_input"
                clearable
                v-model="formData.phone"
                oninput="value=value.replace(/[^\d]/g,'')"
                placeholder="请输入手机号"
              ></el-input>
            </el-form-item>
            <el-form-item label="" prop="code">
              <el-input
                class="container_input"
                v-model="formData.code"
                placeholder="请输入验证码"
                oninput="value=value.replace(/[^\d]/g,'')"
                maxlength="6"
              >
                <template #suffix>
                  <span class="suffix_text" v-if="showSecond">{{ second }}s</span>
                  <span class="suffix_text" v-else @click.stop="getCode">获取验证码</span>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
          <el-button type="primary" :loading="submitLoading" class="submit_btn" @click="submit">
            一键授权
          </el-button>
        </div>
        <!-- 手机验证码错误信息 -->
        <div class="container" style="justify-content: center" v-else>
          <img
            src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/4175a62930cf45558b962d9962f8c345_1682322422163.png"
            alt=""
            class="error_icon"
          />
          <div class="first_text">
            授权失败，
            <span class="main_color_font" @click="reset">重新授权</span>
          </div>
          <div class="second_text">{{ errorMsg }}</div>
        </div>
      </template>
      <!-- 扫码授权    -->
      <template v-else>
        <div class="container">
          <div class="container_title">请使用抖音扫码加入</div>
          <div
            class="code_loading"
            v-loading="showAuthReqLoading"
            element-loading-background="rgba(0,0,0,0.05)"
          >
            <div
              v-if="qrCode"
              class="code_img"
              v-loading="scan"
              element-loading-text="账号验证中"
              custom-class="loading_box"
            >
              <img style="width: 140px; height: 140px" v-if="qrCode" :src="qrCode" alt />
              <div v-if="(count === 0 || authErr) && !scan" class="mask flex_center">
                <img src="../../../../assets/images/auth/refresh.png" alt @click="refreshCode" />
              </div>
              <div v-if="scan" class="mask">
                <div class="success flex_center">
                  <i class="iconfont icon-wancheng wc_icon"></i>
                  <p>扫码成功</p>
                </div>
              </div>
            </div>
          </div>
          <div class="text" v-if="!scan && qrCode">
            <div v-if="authErr">
              <div>授权失败，点击重新加载</div>
              <div style="color: red; margin-top: 10px" v-if="authErrReason">
                {{ authErrReason || '' }}
              </div>
            </div>
            <div v-else>
              <template v-if="count > 0">
                <span style="color: #364fcd">{{ count }}S</span>
                后失效
              </template>
              <template v-else>已失效，点击重新加载</template>
            </div>
          </div>
        </div>
      </template>
      <!--  扫码登陆    -->
      <template #footer>
        <!--   验证码模式 有错误信息的时候不能切换     -->
        <!--        <span class="footer_text" @click="switchMode" v-show="!(!isScanMode && errorMsg)">-->
        <!--          {{ isScanMode ? '手机验证码授权' : '快捷扫码授权' }}-->
        <!--        </span>-->
      </template>
    </el-dialog>
    <!-- 获客互动能力授权提醒 -->
    <authDyWebRemindDialog
      v-if="remindDialog.show"
      :remindDialog="remindDialog"
      @updateRemindFun="getQRCode"
    />
  </div>
</template>
<script setup>
import authDyWebRemindDialog from '@/views/system/authorization/components/authDyWeb_remind_dialog.vue'
import {
  accountDyWebAuthFresh,
  accountDyWebAuthLink,
  dyWebLoginPhoneCodeSet,
  getDyWebCode,
  submitDyWebCode
} from '@/api/system_setting/authorization.js'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from '@/utils/tools.js'

const props = defineProps({
  modelValue: Boolean,
  info: {
    type: Object,
    default: () => {
      return {
        operationId: 0
      }
    },
    required: true
  }
})
const emits = defineEmits(['update:modelValue', 'success'])
const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    if (!value) {
      reset()
    }
    return emits('update:modelValue', value)
  }
})
// 是否是扫码登陆 扫码登陆 / 手机号登陆
const isScanMode = ref(false)
// const switchMode = debounce(() => {
//   isScanMode.value = !isScanMode.value
//   if (isScanMode.value) {
//     getQRCode()
//   }
//   reset()
// }, 700)

// 手机号授权 获取验证码
const formRef = ref(null)
const formData = reactive({
  phone: '',
  code: ''
})
const formFormRules = reactive({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) =>
        /^1[3456789][\d]{9}$/.test(value) ? callback() : callback(new Error('请输入正确的手机号'))
    }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
})
let timer = null
const second = ref(60)
const showSecond = ref(false)
const getCode = async () => {
  formRef.value.validateField('phone')
  if (!/^1[3456789][\d]{9}$/.test(formData.phone)) return
  const res = await getDyWebCode({
    phone: formData.phone,
    id: props.info.operationId,
    // 请求来源，区分小程序端跟PC端，小程序端的前端授权能力PC端暂不支持
    source: 'web'
  })
  if (res?.code !== 0) return
  formData.ticket = res.data.ticket
  // 开启倒计时
  showSecond.value = true
  timer = setInterval(() => {
    second.value--
    if (second.value <= 0) {
      second.value = 60
      showSecond.value = false
      clearInterval(timer)
    }
  }, 1000)
  tipsFlag = true
  // 开始轮询
  openPolling()
}

// 轮询
let pollingTimer = null
const errorMsg = ref('')
let tipsFlag = true
const openPolling = () => {
  pollingTimer && closePolling()
  pollingTimer = setInterval(() => {
    dyWebLoginPhoneCodeSet({
      ticket: formData.ticket
    }).then(res => {
      if (res.code === 0) {
        // 状态码 0:待发起 1：发起成功 2：待验证 3：登录成功 4：登录失败 5:发起失败 6:验证码错误,重新发起 7:手机号无UID
        const { status, errorMsg: msg } = res?.data || {}
        // 没有登陆成功 或者 失败就一直轮询
        // console.log(status, msg)
        if ([4, 5, 7].includes(status)) {
          errorMsg.value = msg
          closePolling()
        } else if ([6].includes(status)) {
          // 验证码错误 重新输入
          submitLoading.value = false
          if (tipsFlag) {
            // 验证码错误只提示一次
            tipsFlag = false
            ElMessage.error(msg || '验证码错误，请重新输入')
          }
        } else if ([3].includes(status)) {
          ElMessage.success('授权成功')
          emits('success')
          show.value = false
        }
      }
    })
  }, 2000)
}
const closePolling = () => {
  clearInterval(pollingTimer)
  pollingTimer = null
}

// 提交登陆
const submitLoading = ref(false)
const submit = () => {
  formRef.value.validate(valid => {
    if (valid) {
      if (isEmpty(pollingTimer)) {
        ElMessage.warning('请点击获取验证码')
        return
      }
      tipsFlag = true
      submitLoading.value = true
      submitDyWebCode({
        phone: formData.phone,
        code: formData.code,
        ticket: formData.ticket
      })
        .then(res => {
          console.log('提交验证码登陆', res)
        })
        .catch(() => {
          submitLoading.value = false
        })
    }
  })
}
// 重新授权
const reset = () => {
  // 清除表单与错误信息
  formData.code = ''
  formData.ticket = ''
  formData.phone = ''
  errorMsg.value = ''
  // 关闭loading 与 倒计时 并清除定时器
  submitLoading.value = false
  second.value = 60
  showSecond.value = false
  clearInterval(timer)
  closePolling()
  count.value = 60
  qrCode.value = ''
}
const clearAll = () => {
  clearInterval(timer)
  closePolling()
}
onBeforeUnmount(() => {
  clearAll()
  clearTimer()
})

// ----- 扫码授权 -----
const scan = ref(false)
const authErr = ref(false)
const authErrReason = ref('')
const qrCode = ref('')
const showAuthReqLoading = ref(false)
const getQRCode = debounce(() => {
  const id = props.info.operationId
  showAuthReqLoading.value = true
  authErr.value = false
  scan.value = false
  authErrReason.value = ''
  qrCode.value = ''
  accountDyWebAuthLink({ id })
    .then(res => {
      showAuthReqLoading.value = false
      if (res.code === 0) {
        const data = res.data
        qrCode.value = 'data:image/jpeg;base64,' + data.qrCode
        setTimer(data.token)
      } else if (res.code === 10028) {
        showRemindFun()
      }
    })
    .catch(err => {
      if (err.code === 10028) {
        showRemindFun()
      } else {
        ElMessage.error(err.msg)
      }
    })
}, 700)
const count = ref(60)
const setTimer = token => {
  count.value = 60
  timer = setInterval(() => {
    if (count.value === 0) {
      scan.value = false
      clearTimer()
    } else {
      count.value--
      if (count.value % 3 === 0) {
        accountDyWebAuthFresh({ token }).then(res => {
          // 0 初始化 1 扫码成功 2 授权成功 3授权错误
          if (res.data === '2') {
            ElMessage.success('授权成功')
            clearTimer()
            show.value = false
            emits('success')
          }
          if (res.data === '1') {
            scan.value = true
          }
          if (res.data === '3' || res.data === '4') {
            scan.value = false
            clearTimer()
            authErrReason.value = res.msg || ''
            authErr.value = true
          }
        })
      }
    }
  }, 1000)
}

const clearTimer = () => {
  timer && clearInterval(timer)
  timer = null
}

// ----- 授权失败提示 ----
const remindDialog = reactive({
  show: false,
  info: null
})

// 显示授权提示
function showRemindFun() {
  remindDialog.info = props.info
  remindDialog.show = true
}

const refreshCode = debounce(() => {
  const id = props.info.operationId
  qrCode.value = ''
  scan.value = false
  showAuthReqLoading.value = true
  accountDyWebAuthLink({ id })
    .then(res => {
      if (res.code === 0) {
        const data = res.data
        qrCode.value = 'data:image/jpeg;base64,' + data.qrCode
        setTimer(data.token)
        authErrReason.value = ''
        authErr.value = false
      }
      showAuthReqLoading.value = false
    })
    .catch(err => {
      ElMessage.error(err.msg)
      showAuthReqLoading.value = false
      authErrReason.value = ''
      authErr.value = false
    })
}, 700)
</script>
<style lang="scss" scoped>
.authDyWeb_dialog {
  font-family: PingFangSC-Regular, PingFang SC;
}

:deep(.el-input) {
  .el-input__inner {
    height: 44px;
    line-height: 44px;
  }
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;

  min-height: 224px;

  .container_title {
    text-align: center;
    height: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    margin-bottom: 16px;
  }

  .container_input {
    width: 320px;
    height: 44px;

    .suffix_text {
      cursor: pointer;
      line-height: 44px;
      color: $theme_color;
    }
  }

  .submit_btn {
    width: 320px;
    height: 44px;
    margin-top: 24px;
    margin-bottom: 12px;
    border-radius: 4px;
  }

  .error_icon {
    width: 52px;
    height: 52px;
  }

  .first_text {
    margin-top: 20px;

    .main_color_font {
      cursor: pointer;
      color: $theme_color;
    }
  }

  .second_text {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #df4545;
    line-height: 20px;
  }

  // 扫码授权
  .code_loading {
    width: 140px;
    height: 140px;
    margin-top: -8px;
    background-color: #d8d8d8;
    border-radius: 1px;
  }

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
    margin: 10px 0 0 0;
    text-align: center;
  }
}

.footer_text {
  cursor: pointer;
  height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: #364fcd;
  line-height: 20px;
}
</style>

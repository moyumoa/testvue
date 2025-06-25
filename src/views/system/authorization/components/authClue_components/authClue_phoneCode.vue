<template>
  <div class="phoneCode_box">
    <el-form
      class="form"
      :model="codeForm"
      :rules="codeFormRules"
      ref="codeFormRef"
      label-width="0"
      @keydown.enter="toAuthFun"
    >
      <el-form-item label="" prop="phone">
        <el-input
          v-model.trim="codeForm.phone"
          oninput="value=value.replace(/[^\d]/g,'')"
          maxlength="11"
          placeholder="请输入手机号"
        ></el-input>
      </el-form-item>
      <el-form-item label="" prop="checkCode">
        <div class="flex_center">
          <el-input
            v-model.trim="codeForm.checkCode"
            placeholder="请输入验证码"
            oninput="value=value.replace(/[^\d]/g,'')"
            maxlength="6"
          ></el-input>
          <div class="line"></div>
          <div class="send_code" v-if="sendTimer">
            {{ sendTimer ? countDown + 'S' : '' }}
          </div>
          <div class="send_code" @click.stop="handleSendCode" v-else>获取验证码</div>
        </div>
      </el-form-item>
    </el-form>
    <el-button
      :style="!isCheck ? 'background: rgba(253, 45, 84, 0.3);' : 'background: rgba(253, 45, 84,1);'"
      :loading="loading"
      :disabled="!isCheck"
      class="submit_btn"
      type="danger"
      @click="toAuthFun"
    >
      立即授权
    </el-button>
  </div>
</template>
<script setup>
import { sendSmsAuthCheckCode, smsAuth, getAuthRecord } from '@/api/system_setting/authorization.js'
import { throttle, encryptionFun } from '@/utils/tools'
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
const codeForm = reactive({
  phone: '',
  checkCode: ''
})
const emits = defineEmits(['update:disabled', 'updateStatus'])
const validtePhone = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3456789][\d]{9}$/.test(value)) {
    callback(new Error('手机号错误，请重新输入'))
  } else {
    callback()
  }
}
const codeFormRules = {
  phone: [{ required: true, validator: validtePhone, trigger: 'blur' }],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}
// 有些苹果手机设置了默认手机号 里面是带86的，所以为了统一，先截掉
function remove86(phone) {
  let data = ''
  if (phone && phone.indexOf('+86') > -1) {
    data = phone.substring(phone.length - 11)
  } else {
    data = phone
  }
  console.log('data', data)
  return data
}
// 校验手机号和验证码
const isCheck = computed(() => {
  return (
    codeForm.phone &&
    /^1[3456789][\d]{9}$/.test(remove86(codeForm.phone)) &&
    codeForm.checkCode &&
    codeForm.checkCode.length >= 4
  )
})
const codeFormRef = ref()
const loading = ref(false)
const sendTimer = ref(null)
const countDown = ref(60)

const authNo = ref(null) // 授权唯一号
const timer = ref(null) // 授权结果的定时器
const message = inject('$message')

// 发送验证码
function handleSendCode() {
  codeFormRef.value.validateField('phone')
  if (!codeForm.phone) {
    // message.warning('请输入正确的手机号！')
    return
  }
  if (!/^1[3456789][\d]{9}$/.test(codeForm.phone)) {
    // message.warning('请输入正确的手机号！')
    return
  }
  sendSmsAuthCheckCode({
    phone: encryptionFun('+86' + codeForm.phone),
    authType: 5,
    isAuth: 1,
    source: 2,
    targetAuthClueUid: info.value.originUid
  }).then(res => {
    sendTimer.value = setInterval(() => {
      --countDown.value
      if (countDown.value === 0) {
        clearSendTimer()
      }
    }, 1000)
  })
}
function clearSendTimer() {
  countDown.value = 60
  clearInterval(sendTimer.value)
  sendTimer.value = null
}
// 去授权
const toAuthFun = throttle(() => {
  codeFormRef.value.validate(valid => {
    if (valid) {
      emits('update:disabled', true)
      loading.value = true
      smsAuth({
        authType: 5,
        phone: encryptionFun('+86' + codeForm.phone),
        checkCode: encryptionFun(codeForm.checkCode),
        isAuth: 1,
        source: 2,
        targetAuthClueUid: info.value.originUid
      })
        .then(res => {
          if (res.code === 0) {
            authNo.value = res.data.authNo
            setTimer()
          } else {
            emits('update:disabled', false)
            loading.value = false
          }
        })
        .catch(() => {
          emits('update:disabled', false)
          loading.value = false
        })
    }
  })
}, 500)

// 设置定时器
const setTimer = () => {
  timer.value = setInterval(() => {
    getAuthRecord({ authNo: authNo.value })
      .then(res => {
        if (res.code === 0) {
          // authStatus   1待授权 2授权成功 3授权失败
          // 授权正常
          if (res.data.authStatus === 2) {
            clearTimer()
            emits('update:disabled', false)
            loading.value = false
            emits('updateStatus', 2)
            // 关闭弹窗刷新列表
          }
          // 授权失败
          if (res.data.authStatus === 3) {
            clearTimer()
            emits('update:disabled', false)
            loading.value = false
            message.error(res.data.errorMsg || '')
          }
        }
      })
      .catch(() => {
        clearTimer()
        emits('update:disabled', false)
        loading.value = false
      })
  }, 3000)
}
// 清空定时器
const clearTimer = () => {
  clearInterval(timer.value)
  timer.value = null
}

// 组件销毁时，清空定时器
onBeforeUnmount(() => {
  clearTimer()
  clearSendTimer()
})
</script>
<style lang="scss" scoped>
.send_code {
  position: absolute;
  top: 0px;
  right: 0px;

  color: #fd2d54;
  cursor: pointer;
  font-size: 12px;
  width: 84px;
  height: 44px;
  text-align: center;
  line-height: 44px;
}
.line {
  width: 1px;
  height: 18px;
  background: #a9abb0;
  border-radius: 1px;
  position: absolute;
  top: 13px;
  right: 84px;
}
.phoneCode_box {
  padding: 0 20px;
  .el-form-item__content {
    line-height: 44px !important;
  }
}
:deep(.el-form-item--default .el-form-item__content),
:deep(.el-input),
:deep(.el-input__inner) {
  line-height: 44px !important;
  height: 44px !important;
}
:deep(.el-form-item) {
  margin-bottom: 30px !important;
}
:deep(.el-form-item--default .el-form-item__error) {
  padding-top: 4px !important;
  padding-left: 2px !important;
}
.submit_btn {
  margin-top: -2px;
  width: 100%;
  height: 44px;
  // background: #fd2d54;
  border-radius: 4px;
  border: none;
  --el-button-bg-color: #fd2f54 !important;
  --el-button-border-color: #fd2f54 !important;
  --el-button-active-bg-color: #fd2f54 !important;
  --el-button-active-border-color: #fd2f54 !important;
}
</style>

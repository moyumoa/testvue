<template>
  <div class="page_layout login_page">
    <!-- 背景 -->
    <div class="page_back">
      <!-- 底色 -->
      <div class="back_back"></div>
      <!-- 左上 -->
      <img class="login_LT" src="@/assets/images/login/login_LeftTop.png" alt />
      <!-- 左下 -->
      <img class="login_LB" src="@/assets/images/login/login_LB.png" alt />
      <!-- 右下 -->
      <img class="login_RB" src="@/assets/images/login/login_RB.png" alt />
      <!-- 中间 -->
      <img class="login_C" src="@/assets/images/login/login_C.png" alt />
    </div>
    <div class="page_main" v-loading="loading">
      <div class="left">
        <img class="img_bg" src="@/assets/images/login/login_left.png" alt />
      </div>
      <div class="right">
        <div class="page_title">找回密码</div>
        <el-form
          class="form"
          :model="codeForm"
          :rules="codeFormRules"
          ref="codeFormRef"
          label-width="100px"
        >
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="codeForm.phone"
              oninput="value=value.replace(/[^\d]/g,'')"
              maxlength="11"
              placeholder="请输入手机号"
            ></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="checkCode">
            <div class="flex_center">
              <el-input
                v-model="codeForm.checkCode"
                placeholder="请输入验证码"
                oninput="value=value.replace(/[^\d]/g,'')"
                maxlength="6"
              ></el-input>
              <div class="send_code" v-if="sendTimer">{{ sendTimer ? countDown + 'S' : '' }}</div>
              <div class="send_code" @click.stop="handleSendCode" v-else>获取验证码</div>
            </div>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="codeForm.password" type="password" placeholder="新密码"></el-input>
          </el-form-item>
        </el-form>
        <el-button class="submit_btn" type="primary" @click="handleCodeLogin">确认修改</el-button>
        <el-link class="forget_pwd" type="primary" :underline="false" @click="toLogin">
          返回登录
        </el-link>
      </div>
    </div>
    <div class="copyright" v-if="!judgeOEA()">
      Copyright © 2020-{{ getNowYear() }}
      <el-link
        style="margin-left: 8px"
        href="https://beian.miit.gov.cn/#/Integrated/index"
        :underline="false"
        target="_blank"
        type="primary"
      >
        <span style="margin-right: 6px">杭州星麦云商科技有限公司</span>
        浙ICP备2020034941号-4
      </el-link>
    </div>
  </div>
</template>

<script setup>
import md5 from 'md5'
import { useRouter } from 'vue-router'
import { codeLogin } from '@/api/main/login'
import { sendCode } from '@/api/main/home'
import { getNowYear } from '@/utils/tools'
const judgeOEA = inject('$judgeOEA')
const router = useRouter()
const loading = ref(false)
const codeForm = reactive({
  phone: '',
  checkCode: '',
  password: ''
})
const codeFormRules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
}
const codeFormRef = ref(null)
const sendTimer = ref(null)
const countDown = ref(60)
const message = inject('$message')
function handleSendCode() {
  if (!codeForm.phone) {
    message.error('请填写手机号')
    return
  }
  sendCode({
    phone: codeForm.phone
  }).then(res => {
    sendTimer.value = setInterval(() => {
      --countDown.value
      if (countDown.value === 0) {
        countDown.value = 60
        clearInterval(sendTimer.value)
        sendTimer.value = null
      }
    }, 1000)
  })
}
function handleCodeLogin() {
  codeFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      loading.value = true
      const params = { ...codeForm }
      params.password = md5(params.password)
      codeLogin(params)
        .then(({ data }) => {
          router.push('/login')
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
function toLogin() {
  router.push('/login')
}
setSize()
function setSize() {
  let size = 100
  if (window.outerWidth < 1920 && window.outerWidth >= 1680) {
    size = 87
  } else if (window.outerWidth < 1680) {
    size = 71
  }
  document.querySelector('html').style = `font-size:${size}px`
}
onBeforeUnmount(() => {
  document.querySelector('html').style = 'font-size:12px'
})
</script>

<style lang="scss" scoped></style>

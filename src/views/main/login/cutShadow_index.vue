<template>
  <div class="page_layout login_page_self" v-loading="loading">
    <!-- 背景 -->
    <div class="login_back">
      <!-- 左上 -->
      <div class="login_LT"></div>
      <!-- 右下 -->
      <div class="login_RB"></div>
    </div>
    <img class="login_title" src="@/assets/images/login/top_title2.png" alt />
    <div class="login_page_self_main">
      <div class="left">
        <img class="img_bg" src="@/assets/images/login/login_left2.png" alt />
      </div>
      <div class="right">
        <div class="right-center">
          <div class="right_title">
            <img class="right_title_icon" src="@/assets/images/login/top_title3.png" alt="" />
            AIGC赋能企业短视频营销
          </div>
          <chooseBrand
            v-if="brandList && brandList.length > 0"
            :brandList="brandList"
            :loginCode="loginCode"
            v-model:loading="loading"
          >
            <template #cancelBtn>
              <el-button
                class="submit_btn"
                style="margin-left: 0; margin-top: 32px"
                @click="backFun"
              >
                返回上一步
              </el-button>
            </template>
          </chooseBrand>
          <div class="right-container" v-else>
            <div class="tabs">
              <div
                class="tab_panel"
                :class="{ active: activeTab === 'first' }"
                @click="changeTab('first')"
              >
                密码登录
              </div>
              <div
                class="tab_panel"
                :class="{ active: activeTab !== 'first' }"
                @click="changeTab('second')"
              >
                验证码登录
              </div>
            </div>
            <el-form
              class="form"
              :model="pwdForm"
              :rules="pwdFormRules"
              ref="pwdFormRef"
              label-width="100px"
              v-show="activeTab === 'first'"
              @keydown.enter="login"
            >
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model.trim="pwdForm.phone"
                  @input="pwdForm.phone = pwdForm.phone.replace(/[^\d]/g, '')"
                  maxlength="11"
                  placeholder="请输入手机号"
                ></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model.trim="pwdForm.password"
                  :type="pwdForm.pwdType"
                  placeholder="请输入密码"
                ></el-input>
                <template v-if="pwdForm.password">
                  <img
                    v-if="pwdForm.pwdType === 'password'"
                    class="pwd_img"
                    src="@/assets/images/login/pwd_show.png"
                    @click="pwdForm.pwdType = 'text'"
                  />
                  <img
                    v-else
                    class="pwd_img"
                    src="@/assets/images/login/pwd_hide.png"
                    @click="pwdForm.pwdType = 'password'"
                  />
                </template>
              </el-form-item>
            </el-form>
            <el-form
              class="form"
              :model="codeForm"
              :rules="codeFormRules"
              ref="codeFormRef"
              label-width="100px"
              v-show="activeTab !== 'first'"
            >
              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model.trim="codeForm.phone"
                  @input="codeForm.phone = codeForm.phone.replace(/[^\d]/g, '')"
                  maxlength="11"
                  placeholder="请输入手机号"
                ></el-input>
              </el-form-item>
              <el-form-item label="验证码" prop="checkCode">
                <div class="flex_center">
                  <el-input
                    v-model.trim="codeForm.checkCode"
                    placeholder="请输入验证码"
                    @input="codeForm.checkCode = codeForm.checkCode.replace(/[^\d]/g, '')"
                    maxlength="6"
                  ></el-input>
                  <div class="send_code" v-if="sendTimer">
                    {{ sendTimer ? countDown + 'S' : '' }}
                  </div>
                  <div class="send_code" @click.stop="handleSendCode" v-else>获取验证码</div>
                </div>
              </el-form-item>
            </el-form>
            <el-button
              class="submit_btn"
              v-if="activeTab === 'first'"
              :disabled="isEmpty(pwdForm.phone)"
              type="primary"
              @click="login"
            >
              登录
            </el-button>
            <el-button
              class="submit_btn"
              v-else
              :disabled="isEmpty(codeForm.phone)"
              type="primary"
              @click="login"
            >
              登录
            </el-button>
            <el-button class="dyshop_btn" type="primary" @click="loginByDyShop">
              <img class="" src="@/assets/images/login/login_btn_icon.png" alt />
              抖店快捷登录
            </el-button>
            <div class="right_tips">原：TagVV内容云</div>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright" v-if="!judgeOEA() && !judgeHWork()">
      Copyright © 2020-{{ getNowYear() }}
      <el-link
        style="margin-left: 8px; font-weight: normal"
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
import chooseBrand from '@/views/main/fly_book_auth/components/choose_brand.vue'
import md5 from 'md5'
import { sendCode } from '@/api/main/home'
import { getNowYear, isEmpty, throttle } from '@/utils/tools'
import { loginFun } from '@/utils/doLogin'
import { getQyQuickLoginUrl } from '@/api/system_setting/personal.js'
const brandList = ref([]) // 选择品牌的列表
const chooseBrandId = ref(null) // 选中的品牌ID
const loginCode = ref(null) // 选择品牌需要的loginCode
const judgeOEA = inject('$judgeOEA')
const judgeHWork = inject('$judgeHWork')
// const store = useStore()
const activeTab = ref('first')
const loading = ref(false)
const pwdForm = reactive({
  phone: '',
  password: '',
  pwdType: 'password',
  loginType: 1
})
const validtePhone = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3456789][\d]{9}$/.test(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}
const pwdFormRules = {
  phone: [{ required: true, validator: validtePhone, trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const codeForm = reactive({
  phone: '',
  checkCode: '',
  loginType: 1
})
const codeFormRules = {
  phone: [{ required: true, validator: validtePhone, trigger: 'blur' }],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}
const pwdFormRef = ref(null)
const codeFormRef = ref(null)
const sendTimer = ref(null)
const countDown = ref(60)
const login = throttle(() => {
  activeTab.value === 'first' ? handlePwdLogin() : handleCodeLogin()
}, 500)
const message = inject('$message')
function handleSendCode() {
  codeFormRef.value.validateField('phone')
  if (!codeForm.phone) {
    message.warning('请输入正确的手机号！')
    return
  }
  if (!/^1[3456789][\d]{9}$/.test(codeForm.phone)) {
    message.warning('请输入正确的手机号！')
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
function handlePwdLogin() {
  pwdFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      const params = { ...pwdForm }
      params.password = md5(params.password)
      params.loginType = 1
      loginFun(params)
        .then(res => {
          console.log('登陆返回过来的数据', res)
          if (res.opCode && res.opCode === 1) {
            chooseBrandId.value = res.data.chooseBrandId
            loginCode.value = res.data.loginCode
            brandList.value = res.data.brandList
          }
          loading.value = false
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}
function handleCodeLogin() {
  codeFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      loginFun(codeForm)
        .then(res => {
          console.log('登陆返回过来的数据', res)
          if (res.opCode && res.opCode === 1) {
            chooseBrandId.value = res.data.chooseBrandId
            loginCode.value = res.data.loginCode
            brandList.value = res.data.brandList
          }
          loading.value = false
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}

// 返回上一步
const backFun = throttle(() => {
  localStorage.clear()
  sessionStorage.clear()
  localStorage.setItem('systemVersion', 2)
  chooseBrandId.value = null
  loginCode.value = null
  brandList.value = []
})

// function toForget() {
//   router.push('/forget_password')
// }
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
onMounted(() => {
  localStorage.clear()
  localStorage.setItem('systemVersion', 2)
  sessionStorage.clear()
})
onBeforeUnmount(() => {
  document.querySelector('html').style = 'font-size:12px'
  clearInterval(sendTimer.value)
  sendTimer.value = null
})
// 切换登录方式
function changeTab(e) {
  activeTab.value = e
  pwdFormRef.value.resetFields()
  codeFormRef.value.resetFields()
  clearInterval(sendTimer.value)
  sendTimer.value = null
  countDown.value = 60
}
// 抖店快捷登录
const loginByDyShop = throttle(() => {
  getQyQuickLoginUrl({
    query: 'cutShadow=2'
  }).then(res => {
    if (res.code === 0) {
      location.href = res.data
    }
  })
}, 700)
</script>

<style lang="scss" scoped>
.login_page_self {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .login_title {
    position: absolute;
    left: 36px;
    top: 36px;
    width: 125px;
    height: 40px;
  }

  .login_back {
    width: 100vw;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .login_LT {
      position: absolute;
      left: 0;
      top: 0;
      //width: 12.33rem;
      width: 1223px;
      height: 100%;
      background: radial-gradient(farthest-corner at 0 0, #c0c8ee, transparent 70%, #ffffff);
    }

    .login_RB {
      position: absolute;
      right: 0;
      bottom: 0;
      opacity: 0.5;
      //width: 7.95rem;
      width: 795px;
      height: 89.35%;
      background: radial-gradient(
        farthest-corner at 100% 100%,
        #c0c8ee,
        transparent 70%,
        transparent
      );
    }
  }

  .login_page_self_main {
    z-index: 5;
    width: 1221px;
    height: 880px;
    background: transparent;
    border-radius: 4px;
    padding: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    position: relative;
    margin-left: -79px;

    .left {
      //flex-basis: 720px;
      //width: 720px;
      //height: 100%;
      display: inline-block;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;

      .img_bg {
        //position: absolute;
        //top: 10px;
        //left: 0;
        margin-top: -20px;
        width: 880px;
        height: 880px;
      }
    }

    .right {
      //display: inline-block;
      flex-basis: 420px;
      margin-left: -79px;
      //flex: 1;
      //position: relative;\
      display: flex;
      align-items: center;
      justify-content: center;

      .right-center {
        width: 440px;
        height: 480px;
        background-color: #fff;
        //position: absolute;
        //left: 50%;
        //top: 50%;
        //transform: translate(-50%, -50%);
        box-shadow: 0 04px 24px 0 rgba(146, 150, 165, 0.1);
        border-radius: 04px;
        //padding: 32px 46px;
        padding: 32px 0;
      }

      .right_title {
        //width: 341px;
        text-align: center;
        height: 30px;
        font-size: 22px;
        font-weight: bold;
        color: #303133;
        line-height: 30px;
        margin-top: 06px;
        margin-bottom: 32px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        .right_title_icon {
          display: flex;
          width: 88px;
          height: 28px;
          object-fit: contain;
          margin-right: 6px;
        }
      }

      .right-container {
        padding: 0 46px;
        .right_tips {
          //width: 100%;
          text-align: center;
          margin-top: 20px;
          height: 18px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #909399;
          line-height: 18px;
        }
      }

      .tabs {
        display: flex;
        margin-bottom: 30px;

        .tab_panel {
          color: #909299;
          font-size: 18px;
          font-weight: 500;

          line-height: 26px;
          margin-right: 28px;
          cursor: pointer;

          &.active {
            color: #303133;
            font-weight: 600;
            position: relative;

            &::before {
              content: ' ';
              position: absolute;
              left: 0;
              bottom: -4px;
              width: 100%;
              height: 2px;
              background: $theme_color;
            }
          }
        }
      }

      :deep(.form) {
        margin-bottom: 32px;

        .el-form-item {
          margin-bottom: 32px;
        }

        .el-form-item__label {
          display: none;
        }

        .el-form-item__content {
          height: 44px;
          line-height: 44px;
        }

        .el-form-item__content {
          height: 44px;
          line-height: 44px;
        }

        .el-input__inner {
          height: 44px;
          line-height: 44px;
        }

        .pwd_img {
          width: 14px;
          height: 14px;
          position: absolute;
          top: 15px;
          right: 12px;
          cursor: pointer;
        }

        .send_code {
          position: absolute;
          top: 13px;
          right: 16px;
          color: $theme_color;
          cursor: pointer;
          line-height: 20px;
          font-size: 14px;
        }
      }

      .submit_btn {
        margin-top: 0px;
        width: 100%;
        height: 44px;
      }

      .forget_pwd {
        margin-top: 10px;
        font-size: 12px;
        line-height: 17px;
        float: right;
      }
    }
  }

  .copyright {
    z-index: 5;
    position: fixed;
    color: #909399;
    bottom: 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;

    a {
      color: #909399;

      span {
        color: #909399;
      }

      &:hover {
        color: #909399;
      }
    }
  }

  @media screen and (min-width: 1440px) {
    .login_page_self_main {
      width: 1300px;
      //margin-left: unset;
      .left {
        img {
          margin-left: -30px;
        }
      }

      .right {
        margin-left: unset;
      }
    }
  }
}
.dyshop_btn {
  color: #3865f3;
  margin-top: 20px;
  margin-left: 0 !important;
  width: 100%;
  height: 44px;
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: rgba(56, 101, 243, 0.1);
  box-shadow: 0px 2px 15px 0px rgba(0, 0, 0, 0.02);
  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    display: flex;
    margin-right: 8px;
  }
  &:hover {
    background: rgba(56, 101, 243, 0.2);
  }
}
</style>

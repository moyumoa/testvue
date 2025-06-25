<template>
  <div>
    <div class="loading_page" v-if="loading">
      <div class="loading">
        <img src="/public/loading.gif" alt="" />
      </div>
    </div>
    <div class="page_layout login_page" v-else>
      <template v-if="brandList && brandList.length > 0">
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
          <chooseBrand
            :brandList="brandList"
            :loginCode="loginCode"
            v-model:loading="loading"
            :origin="props.origin"
          />
        </div>
        <div class="copyright" v-if="!judgeOEA()">
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
      </template>
      <div v-else>{{ errMsg || '' }}</div>
    </div>
  </div>
</template>
<script setup>
import chooseBrand from '@/views/main/fly_book_auth/components/choose_brand.vue'
import { getNowYear, getQueryVariable } from '@/utils/tools'

import { getAuthInfo, getWeChatAuthInfo } from '@/api/main/fly_book'

import { loginAfterFun } from '@/utils/doLogin'
const props = defineProps({
  origin: {
    type: String,
    default: ''
  }
})
localStorage.clear()
sessionStorage.clear()
const loading = ref(true)
const judgeOEA = inject('$judgeOEA')
const errMsg = ref('')
initAuth()
function initAuth() {
  const code = getQueryVariable('code')
  const state = getQueryVariable('state')
  const authPromise =
    props.origin === 'feishu'
      ? getAuthInfo({
          state,
          code
        })
      : getWeChatAuthInfo({
          state,
          code
        })

  authPromise
    .then(res => {
      if (res.code === 0) {
        loginAfterFun(res.data, props.origin)
          .then(res => {
            if (res.opCode && res.opCode === 1) {
              loginCode.value = res.data.loginCode
              brandList.value = res.data.brandList
            }
            loading.value = false
          })
          .catch(() => {
            loading.value = false
          })
      } else {
        errMsg.value = res.msg
        loading.value = false
      }
    })
    .catch(err => {
      errMsg.value = err.msg
      loading.value = false
    })
}
const brandList = ref([])
const loginCode = ref('')

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
</script>
<style lang="scss" scoped>
.loading_page {
  width: 100vw;
  height: 100vh;

  .loading {
    position: absolute;
    font-size: 50px;
    line-height: 50px;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);

    img {
      width: 60px;
      height: 60px;
    }
  }
}

.page_layout {
  .page_main {
    .right {
      flex: 1;
      // padding: 1.64rem 0.76rem 0 0.76rem;
      padding: 1.64rem 0.55rem 0 0.55rem;

      .tabs {
        display: flex;
        .tab_panel {
          color: #909299;
          font-size: 0.22rem;
          font-weight: 500;
          line-height: 0.3rem;
          margin-right: 0.32rem;
          cursor: pointer;
          &.active {
            color: #3e424a;
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
      .form {
        :deep(.el-form-item__label) {
          display: none;
        }
        :deep(.el-form-item__content) {
          height: 0.44rem;
          line-height: 0.44rem;
        }
        :deep(.el-form-item__content) {
          height: 0.44rem;
          line-height: 0.44rem;
        }
        :deep(.el-input__inner) {
          height: 0.44rem;
          line-height: 0.44rem;
        }
        .pwd_img {
          width: 0.14rem;
          height: 0.14rem;
          position: absolute;
          top: 0.15rem;
          right: 0.12rem;
          cursor: pointer;
        }
        .send_code {
          position: absolute;
          top: 0.13rem;
          right: 0.16rem;
          color: $theme_color;
          cursor: pointer;
          line-height: 0.2rem;
          font-size: 0.14rem;
        }
      }
      .submit_btn {
        margin-top: 0.28rem;
        width: 100%;
        height: 0.44rem;
      }
      .forget_pwd {
        margin-top: 10px;
        font-size: 12px;
        line-height: 17px;
        float: right;
      }
    }
  }
}

.info_name {
  font-size: 0.25rem;
  font-weight: 600;
  color: #303133;
  line-height: 0.32rem;
}
.info_company {
  margin: 0.12rem 0 0rem;
  font-size: 0.24rem;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 600;
  color: #303133;
  line-height: 0.33rem;
}
.info_phone {
  margin: 0.16rem 0 0rem;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  font-size: 0.14rem;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #303133;
  line-height: 0.2rem;
  .change_btn {
    font-size: 0.14rem;
    line-height: 0.2rem;
    margin-left: 0.08rem;
  }
}
:deep(.el-form-item.is-error .el-input__validateIcon) {
  display: none !important;
}
:deep(.el-form-item .el-input__validateIcon) {
  display: none !important;
}
</style>

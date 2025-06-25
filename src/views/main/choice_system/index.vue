<template>
  <div class="page_layout" v-loading="loading">
    <div class="layout_header">
      <div class="logo_section">
        <!-- <img class="logo" src="@/assets/images/choice_system/logo_mini.png" /> -->
        <img
          :style="
            brandRetainLogo
              ? 'object-fit: cover;width:106px;height:36px'
              : systemVersion == 2
              ? 'width:88px;height:32px'
              : ''
          "
          :src="
            brandRetainLogo
              ? brandRetainLogo
              : judgeOEA()
              ? 'https://tagvv-1256030678.file.myqcloud.com/202305150ak54.png'
              : systemVersion == 2
              ? 'https://tagvv-1256030678.file.myqcloud.com/202412050swkp.png'
              : 'https://tagvv-1256030678.file.myqcloud.com/20230529tqe67.png'
          "
          alt=""
          class="logo"
        />
      </div>
      <div class="operate_btns">
        <el-dropdown v-if="choiceBrand && brandList.length > 1">
          <span class="btn">
            {{ choiceBrand || '-' }}
            <el-icon class="el-icon--right">
              <i-arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(item, index) in brandList"
                :disabled="getNowChoose(item)"
                @click="handleChoiceBrand(item)"
                :key="index"
              >
                {{ item.brandName || '-' }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div class="btn" style="cursor: default" v-else>{{ choiceBrand }}</div>

        <el-dropdown class="special" placement="bottom-end">
          <span class="btn user">
            {{ userName || 'admin' }}
            <el-icon class="el-icon--right">
              <i-arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="togglePersonal" v-if="choiceBrand">
                个人信息
              </el-dropdown-item>

              <el-dropdown-item v-if="!judgeOEA()" @click="loginOut">
                退出&#12288;&#12288;
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="choice_content_wrapper" :class="[choiceBrand ? 'is_choice' : 'not_choice']">
      <div class="choice_content" :style="choiceBrand ? 'width:100vw' : ''">
        <div class="none_menu">
          <img
            class="none_menu_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/202212228idzm.png"
            alt
          />
          暂无菜单权限，请联系管理员进行开通
        </div>
      </div>
    </div>
    <div class="copyright" v-if="!judgeOEA()">
      Copyright © 2020-{{ getNowYear() }}
      <el-link
        style="margin-left: 8px; opacity: 0.8; font-size: 0.14rem"
        href="https://beian.miit.gov.cn/#/Integrated/index"
        :underline="false"
        target="_blank"
        type="primary"
      >
        杭州星麦云商科技有限公司 浙ICP备2020034941号-4
      </el-link>
    </div>
    <personalInfo
      v-if="infoDialog.show"
      :infoDialog="infoDialog"
      @updateUserName="updateUserName"
    ></personalInfo>
  </div>
</template>

<script setup>
import { loginFun } from '@/utils/doLogin'
import { throttle, getNowYear } from '@/utils/tools'
import personalInfo from '@/layout/components/personal_info/personal_info.vue'
import { getRoute } from '@/utils/getRoute'
import { model } from './model/index'
import { useStore } from 'vuex'
const { choiceBrand, brandList, loading, loginOut } = model()

const judgeOEA = inject('$judgeOEA')
// const store = useStore()
const userName = ref('')
userName.value = localStorage.getItem('userName')
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)
const brandRetainLogo = computed(() => store.state.user.brandRetainLogo)
const $message = inject('$message')
// 选择品牌
const handleChoiceBrand = throttle(item => {
  console.log(item)
  if (!getNowChoose(item)) {
    if (item.isValid) {
      loading.value = true
      const params = {
        brandId: item.brandId,
        userId: item.userId,
        loginType: 1
      }
      if (!localStorage.getItem('token') && sessionStorage.getItem('loginCode')) {
        params.loginCode = sessionStorage.getItem('loginCode')
      }
      loginFun(params, 'page_header')
        .then(res => {
          if (res.brandId) {
            choiceBrand.value = res.brandName
            userName.value = res.userName
          }
          console.log('登陆返回过来的数据', res)
          getRoute(loading, false, false, null, true)
        })
        .catch(() => {})
    } else {
      $message.error('该账号已被禁用')
    }
  }
}, 700)

const infoDialog = reactive({
  show: false
})
// 打开个人信息的弹窗
const togglePersonal = throttle(() => {
  infoDialog.show = true
}, 700)
// 更新用户名
function updateUserName(e) {
  userName.value = e || ''
}

onMounted(() => {
  if (choiceBrand.value) {
    getRoute(loading, false)
  }
})

// 查询哪个是当前品牌，禁用掉
function getNowChoose(brand) {
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null
  if (userInfo && brand.brandId === userInfo.brandId && brand.userId === userInfo.userId) {
    return true
  } else {
    return false
  }
}
</script>

<style lang="scss" scoped>
.page_layout {
  position: relative;
  color: #303133;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  .layout_header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.24rem;
    height: 0.6rem;
    border-bottom: 1px solid #e8e8e8;
    box-sizing: border-box;
    .logo_section {
      .logo {
        width: 1.06rem;
      }
    }
    .operate_btns {
      display: flex;
      align-items: center;
      font-size: 0.14rem;
      .btn {
        margin-right: 24px;
        &:hover {
          background-color: #f2f2f2;
          border-radius: 4px;
        }
        .exp_btn {
          font-size: 12px;
          width: 86px;
          height: 30px;
          color: #303133;
        }
      }

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.29rem;
        position: relative;
        height: 0.3rem;
        // width: 77px;
        padding: 0 0.1rem;
        border-radius: 0.04rem;
        outline: 0;
        cursor: pointer;
        font-size: 0.14rem;
        &:first-child {
          margin-right: 0.19rem;
        }
        &::after {
          content: ' ';
          position: absolute;
          width: 1px;
          height: 0.12rem;
          right: -0.1rem;
          top: 0.08rem;
          background: #e0e0e0;
        }
        &.user {
          margin-right: 0.16rem;
          &::after {
            width: 0;
          }
        }
        &:hover {
          background: #e9ebed;
        }
      }
    }
  }
  @media (max-height: 740px) {
    .choice_content_wrapper {
      margin-bottom: 0.2rem;
    }
  }
  .choice_content_wrapper {
    flex: 1;
    min-height: 6.2rem;
    display: flex;
    justify-content: center;
    &.is_choice {
      align-items: center;
      min-height: auto;
    }
    // &.not_choice {
    //   @media (max-width: 1330px) {
    //     width: 866px;
    //     margin: 0 auto;
    //     .page_content {
    //       grid-template-columns: repeat(2, 400px) !important;
    //     }
    //   }
    // }
    .choice_content {
      width: 13.28rem;
      div {
        box-sizing: border-box;
      }
      .page_title {
        padding: 0.32rem 0 0 0;
        margin-bottom: 0.48rem;
        font-size: 0.24rem;
        font-weight: 600;
      }

      .page_content {
        display: grid;
        grid-template-columns: repeat(3, 4rem);
        grid-column-gap: 0.64rem;
        .brand {
          cursor: pointer;
          position: relative;
          display: inline-block;
          height: 1.35rem;
          margin-bottom: 0.36rem;
          padding: 0.24rem 0.36rem;
          background: #fff;
          box-sizing: border-box;
          border-radius: 0.04rem;
          transition: box-shadow 0.3s;
          .brand_name {
            font-size: 0.2rem;
            line-height: 0.28rem;
          }
          .brand_bg {
            position: absolute;
            right: 0.16rem;
            bottom: 0.08rem;
            width: 0.88rem;
            height: 0.77rem;
          }
          &:hover {
            box-shadow: 0 0.07rem 0.3rem 0 rgba(97, 97, 97, 0.15);
          }
        }
      }
      .show_4_line {
        grid-template-columns: repeat(4, 3rem) !important;
        grid-column-gap: 0.43rem !important;
      }
      .module_list {
        display: grid;
        grid-template-columns: repeat(5, 2.4rem);
        grid-column-gap: 0.32rem;
        margin-top: 0.76rem;
        .module {
          position: relative;
          height: 2.8rem;
          padding: 0 0.22rem;
          border-radius: 0.08rem;
          border: 2px solid #ffffff;
          transition: all 0.5s ease;
          text-align: center;
          background: linear-gradient(180deg, #ebeef7 0%, #ffffff 100%);
          backdrop-filter: blur(4px);
          &.active {
            cursor: pointer;
            &:hover {
              background: linear-gradient(180deg, #ebeef7 0%, #ffffff 100%);
              box-shadow: 0 0.07rem 0.3rem 0 rgba(97, 97, 97, 0.15);
              border: 1px solid #ffffff;
              .module_icon {
                transform: translateX(-50%) translateZ(0) scale(1.2);
              }
              .arrow {
                color: #364fcd;
              }
            }
          }
          .module_icon {
            position: absolute;
            top: -0.32rem;
            left: 50%;
            transform: translateX(-50%);
            width: 0.72rem;
            height: 0.72rem;
            transition: all 0.5s ease;
            background-size: cover;
          }
          .module_name {
            line-height: 0.28rem;
            margin-top: 0.72rem;
            color: #303133;
            font-size: 0.2rem;
            font-weight: bold;
          }
          .module_desc {
            line-height: 0.2rem;
            margin-top: 0.2rem;
            color: #606266;
            font-size: 0.14rem;
          }
          .arrow {
            position: absolute;
            bottom: 0.35rem;
            left: 50%;
            transform: translateX(-50%);
            color: #c9c9cb;
            font-size: 0.24rem;
            &:hover {
              color: #364fcd;
            }
          }
          .lock_tips {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            border-radius: 0.08rem;
            opacity: 0;
            &:hover {
              opacity: 1;
            }
            .lock_img {
              width: 0.22rem;
              height: 0.25rem;
            }
            .text {
              margin-top: 0.1rem;
              font-size: 0.14rem;
              line-height: 0.2rem;
            }
          }
        }
      }
    }
  }
  .copyright {
    flex-shrink: 0;
    height: 0.48rem;
    line-height: 0.24rem;
    font-size: 0.14rem;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  @media (max-width: 1680px) {
    .data_desc,
    .data_label,
    .module_desc {
      transform: scale(0.9, 0.9);
      *font-size: 10px;
    }
    .arrow {
      bottom: 0.2rem !important;
    }
  }
  @media (max-width: 1800px) {
    .data_label {
      width: 0.98rem !important;
    }
  }
}
// :deep(.el-dropdown-menu__item) {
//   // width: 120px;
//   padding: 0 16px;
// }
// :deep(.el-dropdown-menu__item:not(.is-disabled):hover, .el-dropdown-menu__item:focus) {
//   --el-dropdown-menuItem-hover-fill: #f2f2f2;
//   --el-dropdown-menuItem-hover-color: #303133;
// }
.none_menu {
  width: 100vw;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  color: #8f939a;
  line-height: 22px;
  .none_menu_icon {
    width: 180px;
    height: 180px;
    object-fit: contain;
    margin-bottom: 8px;
  }
}
</style>

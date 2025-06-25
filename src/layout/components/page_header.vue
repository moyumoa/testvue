<template>
  <!-- 海尔项目：顶部菜单只保留下载中心和数据大屏 -->
  <div class="header_layout" :style="!judgeHWork() ? '' : 'justify-content: flex-end;'">
    <div class="header_logo" v-if="!judgeHWork()">
      <div class="logo_box" @click.stop="toHome">
        <img
          :style="brandRetainLogo ? '' : systemVersion == 2 ? 'width:88px;height:32px' : ''"
          class="logo_img"
          :src="
            brandRetainLogo
              ? brandRetainLogo
              : judgeOEA()
              ? 'https://tagvv-1256030678.file.myqcloud.com/202305150ak54.png'
              : systemVersion == 2
              ? 'https://tagvv-1256030678.file.myqcloud.com/20241203pbybk.png'
              : 'https://tagvv-1256030678.file.myqcloud.com/20250402scv06.png'
          "
          alt
        />
        <!-- 基础版 -->
        <!-- <img
        v-if="systemVersion == 2"
        class="logo_version"
        src="https://tagvv-1256030678.file.myqcloud.com/202406078zrka.png"
        alt=""
      /> -->
        <!-- 标准版 -->
        <!-- <img
          v-if="systemVersion == 1"
          class="logo_version"
          src="https://tagvv-1256030678.file.myqcloud.com/20240520i923z.png"
          alt=""
        /> -->
        <!-- 企业版 -->
        <!-- <img
          v-else-if="systemVersion == 3"
          class="logo_version"
          src="https://tagvv-1256030678.file.myqcloud.com/20240515w5ohh.png"
          alt=""
        /> -->
        <!-- 专业版 -->
        <!-- <img
          v-else-if="systemVersion == 4"
          class="logo_version"
          src="https://tagvv-1256030678.file.myqcloud.com/20240515j9l6h.png"
          alt=""
        /> -->
      </div>
    </div>
    <div class="header_tab" v-if="!judgeHWork()">
      <div
        :class="{
          tab_box: true,
          choose_tab_box: moduleName == item.scopeName,
          unChose_tab: moduleName != item.scopeName,
          last_tab: index === systemModule.length - 1
        }"
        v-for="(item, index) in systemModule"
        :key="index"
        :style="{
          width: `calc( ${100 / systemModule.length}% )`
        }"
      >
        <div class="one_tab_line" v-if="index > 0"></div>
        <div class="tab_tab" style="position: relative">
          <div
            :class="{
              one_tab: true,
              choose_tab: moduleName == item.scopeName
            }"
            @click="toDetail(item)"
          >
            <div class="one_tab_text">{{ item.scopeName }}</div>
          </div>

          <div class="left_border_box" v-if="index > 0">
            <div class="left_border_border"></div>
          </div>
          <div class="right_border_box">
            <div class="right_border_border"></div>
          </div>
        </div>
      </div>
      <!--  -->
    </div>
    <div class="header_action">
      <template v-if="dataScreenMoule && dataScreenMoule.length > 0">
        <div class="downLoad header_action_hover">
          <div class="btn_txt" @click="openScreenFun">
            <img
              style="width: 22px; margin-right: 8px"
              src="https://tagvv-1256030678.file.myqcloud.com/202304073jc8i.png"
              alt=""
            />
            数据大屏
          </div>
        </div>
        <div class="header_action_line"></div>
      </template>
      <div class="downLoad header_action_hover" ref="downloadButtonDom">
        <div class="btn_txt" @click="showDia" v-if="sta">
          <img
            style="width: 22px; margin-right: 8px"
            src="https://tagvv-1256030678.file.myqcloud.com/20221221h7bf0.png"
            alt=""
          />
          下载中心
        </div>
        <div class="btn_txt" @click="showDia" v-else>
          <img
            style="width: 22px; margin-right: 8px"
            src="https://tagvv-1256030678.file.myqcloud.com/20221221h7bf0.png"
            alt=""
          />
          下载中心
        </div>
        <!-- type: 1代表除中台外 2代表在中台 （为了初始定位） -->
        <exportCenter :showExport="showExport" @closeDia="closeDia" @status="status"></exportCenter>
      </div>
      <template v-if="!judgeHWork()">
        <div class="header_action_line"></div>
        <div class="header_company header_action_hover">
          <el-dropdown
            :popper-class="`xm_dropDown xm_dropDown_maxHeight ${judgeOEA() ? 'OEA_dropDown' : ''}`"
            v-if="brandList.length > 1"
          >
            <span class="btn_txt">
              <img
                style="width: 22px; margin-right: 6px"
                src="https://tagvv-1256030678.file.myqcloud.com/20221221n0mtq.png"
                alt=""
              />
              {{ brandInfo.brandName || '-' }}
              <el-icon class="el-icon--right">
                <i-arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="(item, index) in brandList"
                  :key="index"
                  :disabled="getNowChoose(item)"
                  @click="brandChange(item)"
                >
                  {{ item.brandName || '-' }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="btn_txt" v-else style="cursor: auto">
            <img
              style="width: 22px; margin-right: 6px"
              src="https://tagvv-1256030678.file.myqcloud.com/20221221n0mtq.png"
              alt=""
            />
            {{ brandInfo.brandName || '-' }}
          </div>
        </div>
        <div class="header_action_line"></div>
        <div class="header_action_hover">
          <el-dropdown :popper-class="`xm_dropDown ${judgeOEA() ? 'OEA_dropDown' : ''}`">
            <span class="btn_txt">
              {{ userName || 'admin' }}
              <el-icon class="el-icon--right">
                <i-arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="togglePersonal">个人信息</el-dropdown-item>
                <el-dropdown-item v-if="!judgeOEA()" @click="loginOut">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </div>
    <personalInfo
      v-if="infoDialog.show"
      :infoDialog="infoDialog"
      @updateUserName="updateUserName"
    ></personalInfo>
    <!-- 切影/基础版首次进入提示设置登录密码 -->
    <changePWDTipInfoDOM v-if="systemVersion == 2 && isInitPwd" />
  </div>
</template>

<script setup>
import changePWDTipInfoDOM from './personal_info/change_pwd_tip.vue'
import { getRoute, getJumpPath } from '@/utils/getRoute'
import personalInfo from './personal_info/personal_info.vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import exportCenter from './export/exportCenter.vue'
import Bus from '@/bus/bus.js'
import { loginFun } from '@/utils/doLogin'
import { selectUserInfo } from '@/api/system_setting/personal.js'

import { throttle } from '@/utils/tools'
const props = defineProps({
  moduleName: {
    type: String,
    default: ''
  }
})
const { moduleName } = toRefs(props)
const route = useRoute()
const router = useRouter()
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)
const isInitPwd = computed(() => store.state.user.isInitPwd)
const showExport = ref(false)
const systemModule = computed(() => {
  const newModule = store.getters.systemModule
  return newModule.filter(
    item => item.scopeCode !== 'public_authority' && item.scopeCode !== 'data_screen'
  )
})
const dataScreenMoule = computed(() => {
  const newModule = store.getters.systemModule
  return newModule.filter(item => item.scopeCode === 'data_screen')
})
console.log('systemModule', systemModule.value)
const brandList = computed(() => store.getters.userInfo.loginBrandVos || [])
const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
const brandRetainLogo = computed(() => store.state.user.brandRetainLogo)
// const userInfo = computed(() => store.getters.userInfo)
const userName = ref('')
const judgeOEA = inject('$judgeOEA')
const judgeHWork = inject('$judgeHWork')
const sta = ref(false)
const downloadButtonDom = ref(null)
// 获取下载中心距离右侧的距离
function getDownLoadCenterToRight() {
  Bus.$emit('getDownloadCenterOffsetLeft', { val: downloadButtonDom.value.offsetLeft })
}

Bus.$on('changeDownloadButtonDom', () => {
  getDownLoadCenterToRight()
})

// 组件卸载时，取消订阅
onUnmounted(() => {
  Bus.$off('changeDownloadButtonDom')
})

userName.value = localStorage.getItem('userName')
const userId = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null
  return userInfo ? userInfo.userId : null
})
// 打开下载中心弹窗
const showDia = throttle(() => {
  selectUserInfo({
    userId: userId.value
  })
    .then(res => {
      localStorage.setItem('userInfo', JSON.stringify(res.data))
    })
    .finally(() => {
      showExport.value = true
    })
}, 500)
// 关闭下载中心弹窗
function closeDia(val) {
  showExport.value = val
}

function status(val) {
  sta.value = val
}

const $message = inject('$message')
// 切换品牌
const brandChange = throttle(brand => {
  if (!getNowChoose(brand)) {
    if (brand.isValid) {
      loginFun(
        {
          brandId: brand.brandId,
          userId: brand.userId,
          loginType: 1
        },
        'page_header'
      )
        .then(res => {
          console.log('登陆返回过来的数据', res)
          getRoute(null, false, true, route.query && route.query.brandId ? brand.brandId : null)
        })
        .catch(() => {})
    } else {
      $message.error('该账号已被禁用')
    }
  }
}, 700)

function loginOut() {
  console.log(router, getJumpPath())
  store.dispatch('user/loginOut')
}
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
const emits = defineEmits(['updateMoudle'])
const menuOfKeepAlive = inject('$menuOfKeepAlive')
// 切换路由
const toDetail = throttle(data => {
  if (data.scopeName === moduleName.value) {
    return
  }
  changeRoute(data)
}, 700)
// 切换路由的具体操作
function changeRoute(data) {
  menuOfKeepAlive('set')
  console.log('切换路有', data)
  if (data.childrenMenuList && data.childrenMenuList.length > 0) {
    const routerPath = getMenuPath(data)
    if (routerPath) {
      // 如果打开的和当前的路由一样，就不跳转
      if (routerPath !== sessionStorage.getItem('menuActive')) {
        sessionStorage.setItem('menuActive', routerPath)
        sessionStorage.setItem('module', data.scopeName)
        console.log('qddddddd', data.scopeName)
        emits('updateMoudle', data.scopeName)
        router.push(`${data.scopeUrl}/${routerPath}`)
      }
    }
  }
}
// 根据一级菜单的系统权限获取路由
function getMenuPath(data) {
  let menuPath = ''
  const getPath = function (data) {
    if (data.childrenMenuList && data.childrenMenuList.length > 0) {
      getPath(data.childrenMenuList[0])
    } else {
      menuPath = data.scopeUrl
    }
  }
  getPath(data)
  return menuPath
}
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

// 打开数据大屏
const openScreenFun = throttle(() => {
  let brandInfo = localStorage.getItem('brandInfo')
  brandInfo = brandInfo ? JSON.parse(brandInfo) : {}
  window.open(
    `${location.origin}/largeview/comprehensive_data?token=${localStorage.getItem(
      'token'
    )}&brandId=${brandInfo.brandId}&brandName=${window.encodeURI(
      window.encodeURI(brandInfo.brandName)
    )}`
  )
})

// 回到首页
const toHome = throttle(() => {
  changeRoute(systemModule.value[0])
}, 500)
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.header_layout {
  width: 100vw;
  min-width: 1366px;
  padding: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  height: 100%;

  .header_logo {
    min-width: 210px;
    width: 210px;
    height: 100%;
    padding: 12px 0 10px 24px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
    .logo_box {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-end;
    }
    .logo_img {
      width: 128px;
      height: 36px;
      object-fit: contain;
      display: flex;
    }
    .logo_version {
      margin: 0 0 6px 4px;
      width: 41px;
      height: 16px;
      object-fit: contain;
      display: flex;
    }
  }
  .header_tab {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
    width: 0;
    .one_tab_line {
      min-width: 1px;
      width: 1px;
      height: 12px;
      background: #e0e0e0;
      opacity: 0;
      margin-bottom: 4px;
    }
    .tab_tab {
      width: 100%;
      min-width: 52px;
    }
    .one_tab {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      padding: 8px 20px 12px;
      height: 42px;
      font-size: 15px;
      font-weight: 400;
      color: #ffffff;
      line-height: 22px;
      cursor: pointer;
      overflow: hidden;
      .one_tab_text {
        width: 100%;
        height: 22px;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .left_radius {
      border-bottom-left-radius: 4px;
    }
    .right_radius {
      border-bottom-right-radius: 4px;
    }
    .choose_tab {
      border-radius: 8px 8px 0px 0px;
      background: #f7f8fa;
      font-weight: 600;
      color: #364fcd;
      line-height: 22px;
    }
    .left_border {
      position: absolute;
      width: 16px;
      height: 16px;
      bottom: 0px;
      left: 0;
      border-radius: 8px;
      box-shadow: -8px 8px 0px #f7f8fa;
    }
    .right_border {
      position: absolute;
      width: 16px;
      height: 16px;
      bottom: 0px;
      right: 0;
      border-radius: 8px;
      box-shadow: 8px 8px 0px #f7f8fa;
    }
    .last_tab {
      position: relative;
      .last_border {
        position: absolute;
        bottom: 0px;
        right: -16px;
        width: 16px;
        height: 16px;
        overflow: hidden;
        .last_border_border {
          width: 16px;
          height: 16px;
          border-radius: 8px;
          box-shadow: -8px 8px 0px #f7f8fa;
        }
      }
    }
    .tab_box {
      position: relative;
      max-width: max-content;
      min-width: 52px;
    }
    .left_border_box {
      position: absolute;
      bottom: 0px;
      left: -16px;
      width: 16px;
      height: 16px;
      overflow: hidden;
      .left_border_border {
        width: 16px;
        height: 16px;
        border-radius: 8px;
        // box-shadow: 8px 8px 0px #f7f8fa;
      }
    }
    .right_border_box {
      position: absolute;
      bottom: 0px;
      right: -16px;
      width: 16px;
      height: 16px;
      overflow: hidden;
      .right_border_border {
        width: 16px;
        height: 16px;
        border-radius: 8px;
        // box-shadow: -8px 8px 0px #f7f8fa;
      }
    }
    .choose_tab_box {
      .right_border_border {
        box-shadow: -8px 8px 0px #f7f8fa;
      }
      .left_border_border {
        box-shadow: 8px 8px 0px #f7f8fa;
      }
    }
    .unChose_tab {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      position: relative;
      .right_border_border {
        box-shadow: -8px 8px 0px rgba(255, 255, 255, 0);
      }
      .left_border_border {
        box-shadow: 8px 8px 0px rgba(255, 255, 255, 0);
      }
    }
    .unChose_tab + .unChose_tab {
      .one_tab_line {
        opacity: 1;
      }
    }
    .unChose_tab:hover {
      .one_tab_line {
        opacity: 0;
      }
      .one_tab {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px 8px 0px 0px;
      }
      .right_border_border {
        box-shadow: -8px 8px 0px rgba(255, 255, 255, 0.1);
      }
      .left_border_border {
        box-shadow: 8px 8px 0px rgba(255, 255, 255, 0.1);
      }
    }
    .unChose_tab:hover + .unChose_tab {
      .one_tab_line {
        opacity: 0;
      }
    }
  }
  .header_action {
    flex-shrink: 0;
    // width: 550px !important;
    height: 100%;
    padding-right: 16px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
    line-height: 20px;
    flex-wrap: wrap;
    .header_action_line {
      width: 1px;
      height: 12px;
      background: #e0e0e0;
      margin: 0 12px;
    }
    .header_action_hover {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 4px 10px;
      border-radius: 4px;
      &:hover {
        background: rgba($color: #000000, $alpha: 0.05);
      }
    }
    .btn_txt {
      cursor: pointer;
      font-size: 14px;
      font-weight: 400;
      color: #ffffff;
      line-height: 20px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>

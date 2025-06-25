<template>
  <el-menu
    :active-text-color="judgeOEA() ? '#364FCD' : '#5CFFFE'"
    :background-color="judgeOEA() ? '#fff' : '#364FCD'"
    class="page_menu"
    :default-active="defaultActive"
    :text-color="judgeOEA() ? '#303313' : '#fff'"
    :collapse="collapse"
    :collapse-transition="false"
    unique-opened
  >
    <template v-for="item in menuList">
      <el-sub-menu
        :index="item.scopeName"
        v-if="item.childrenMenuList && item.childrenMenuList.length > 0"
        :key="item.scopeName"
      >
        <template #title>
          <div class="menu_title_box">
            <icons
              v-if="item.scopeIcon && !item.scopeIcon.includes('icon-')"
              :iconName="item.scopeIcon"
            ></icons>
            <i v-else class="iconfont icon" :class="item.scopeIcon"></i>
            <span>{{ item.scopeName }}</span>
            <!-- 扩展标识 目前只有数字人、短视频生成 -->
            <img
              v-if="item.extendCode"
              :class="{ extend_icon: true, extend_OEA: judgeOEA() }"
              :src="item.extendCode"
              alt=""
            />
          </div>
        </template>
        <template v-for="child in item.childrenMenuList" :key="child.scopeName">
          <!-- 三级菜单 -->
          <el-sub-menu
            popper-class="thridMenu"
            :index="child.scopeUrl"
            v-if="child.childrenMenuList && child.childrenMenuList.length > 0"
          >
            <template #title>
              <div class="menu_title_box" style="padding-left: 56px">
                <span>{{ child.scopeName }}</span>
              </div>
            </template>
            <el-menu-item
              v-for="thrid in child.childrenMenuList"
              :key="thrid.scopeName"
              :index="thrid.scopeUrl"
              @click="menuSelect"
            >
              <div class="menu_title_box" style="padding-left: 66px">{{ thrid.scopeName }}</div>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="child.scopeUrl" style="padding: 0px" @click="menuSelect">
            <div class="menu_title_box" style="padding-left: 56px">{{ child.scopeName }}</div>
          </el-menu-item>
        </template>
      </el-sub-menu>
      <template v-else>
        <el-menu-item :index="item.scopeUrl" :key="item.childrenMenuList" @click="menuSelect">
          <template #title>
            <div class="menu_title_box">
              <icons
                v-if="item.scopeIcon && !item.scopeIcon.includes('icon-')"
                :iconName="item.scopeIcon"
              ></icons>
              <i v-else class="iconfont icon" :class="item.scopeIcon"></i>
              <span>{{ item.scopeName }}</span>
              <!-- 扩展标识 目前只有数字人 -->
              <img
                v-if="item.extendCode"
                :class="{ extend_icon: true, extend_OEA: judgeOEA() }"
                :src="item.extendCode"
                alt=""
              />
            </div>
          </template>
        </el-menu-item>
      </template>
    </template>
  </el-menu>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import icons from './icons.vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { resetPushState } from '@/utils/getRoute'
const props = defineProps({
  // 展开状态
  collapse: {
    type: Boolean,
    default: () => false
  },
  moduleName: {
    type: String,
    default: ''
  }
})
const { collapse } = toRefs(props)
const store = useStore()
const router = useRouter()
const route = useRoute()
// 设置选中菜单路由
const defaultActive = ref('')
defaultActive.value = sessionStorage.getItem('menuActive') || ''

const judgeOEA = inject('$judgeOEA')
// menu
const menuList = ref([])
const menuSelect = throttle(val => {
  let brandInfo = localStorage.getItem('brandInfo')
  brandInfo = brandInfo ? JSON.parse(brandInfo) : {}
  if (val.index === 'large_screen') {
    window.open(
      `${location.origin}/largeview/home?token=${localStorage.getItem('token')}&brandId=${
        brandInfo.brandId
      }&brandName=${window.encodeURI(window.encodeURI(brandInfo.brandName))}`
    )
    return
  } else if (val.index === 'live_large_screen') {
    window.open(
      `${location.origin}/largeview/current_live?token=${localStorage.getItem('token')}&brandId=${
        brandInfo.brandId
      }&brandName=${window.encodeURI(window.encodeURI(brandInfo.brandName))}`
    )
    return
  }
  sessionStorage.setItem('menuActive', val.index)
  const module = store.getters.systemModule.filter(item => item.scopeName === props.moduleName)
  const url = `${module[0].scopeUrl}/${val.index}`
  // 页面级菜单二次刷新
  // 二次刷新时要清空地址参数的页面地址列表
  const replaceUrlList = [
    '/sumwhy_video/create_by_template',
    '/sumwhy_video/create_by_script',
    '/sumwhy_video/create_by_foolish',
    '/sumwhy_video/template_space',
    '/sumwhy_video/create_imgText',
    '/system_manage/system_setting'
  ]
  console.log('页面为二次刷新', url, route.path, url === route.path, replaceUrlList.includes(url))
  if (url === route.path) {
    if (replaceUrlList.includes(url)) {
      resetPushState()
      router.replace({ query: {} })
      nextTick(() => {
        store.commit('page/setShowPage', false)
        nextTick(() => {
          store.commit('page/setShowPage', true)
        })
      })
    } else {
      store.commit('page/setShowPage', false)
      nextTick(() => {
        store.commit('page/setShowPage', true)
      })
    }
    return
  }
  // 如果是点击菜单进入智能拆解，就清除缓存
  const clearInfoList = ['/sumwhy_video/intelligent_material'] // 需要清空本地缓存的一些路由地址
  if (clearInfoList.includes(url)) {
    sessionStorage.removeItem('intelligent_tab')
  }
  store.commit('page/setIsMenuPush', true)
  router.push({
    path: url
  })
}, 500)
watch(
  () => route.path,
  val => {
    console.log(val, 'val')

    defaultActive.value = val.split('/')[2]
  },
  { deep: true, immediate: true }
)
watch(
  () => props.moduleName,
  val => {
    console.log(val, 'mooudle---menu')
    const systemModule = store.getters.systemModule
    menuList.value = systemModule.filter(item => item.scopeName === val)[0]?.childrenMenuList
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss">
div {
  box-sizing: border-box;
}
.page_menu {
  margin-top: 9px !important;
  border-right: 0 !important;
  --el-menu-border-color: $theme_color !important;
  --el-menu-active-color: #fff !important;
  &.el-menu--collapse {
    width: 100%;
  }
  .menu_title_box {
    width: 194px;
    height: 40px;
    margin: 4px 0 4px 8px;
    line-height: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    border-radius: 2px;
    padding-left: 16px;
    color: rgba(255, 255, 255, 0.8);
  }
  .extend_icon {
    max-width: 42px;
    height: 16px;
    object-fit: contain;
    margin-left: 8px;
  }
  .extend_OEA {
    background: #364fcd;
    border-top-left-radius: 8px;
    border-top-right-radius: 1px;
    border-bottom-left-radius: 1px;
    border-bottom-right-radius: 8px;
  }
  .el-menu-item {
    box-sizing: border-box;
    border-radius: 8px;
    height: 44px !important;
    line-height: 40px !important;
    padding: 0 !important;
    // padding: 0 12px;
    &:hover {
      background: none;
      .menu_title_box {
        font-weight: 500;
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
    &.is-active {
      background-color: rgba(0, 0, 0, 0.2);
      .menu_title_box {
        font-weight: 500;
        color: #fff;
      }
    }
    [class^='el-icon'] {
      margin-right: 10px;
    }
  }

  > .el-sub-menu {
    .el-sub-menu__title {
      height: 44px;
      line-height: 40px;
      padding: 0 !important;
      &:hover {
        background: none;
        .menu_title_box {
          font-weight: 500;
          background-color: rgba(0, 0, 0, 0.2);
        }
      }
    }
    // .el-menu-item {
    //   height: 48px;
    //   line-height: 48px;
    //   &:hover {
    //     background: none;
    //     .menu_title_box {
    //       background-color: #2d48ba;
    //     }
    //   }
    // }
  }
  .el-menu-item {
    &.is-active {
      background: none;
      .menu_title_box {
        color: #fff;
        font-weight: 500;
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
  }
  .iconfont {
    font-size: 20px;
    margin-right: 10px;
    vertical-align: middle;
  }
  .is-active > .el-sub-menu__title > .menu_title_box {
    color: #fff;
    font-weight: 500;
  }
}
</style>

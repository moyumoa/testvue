<template>
  <div
    :class="{
      layout: true,
      layout_OEA: judgeOEA() || judgeHWork(),
      no_menu_layout: isHideLeftMenu
    }"
  >
    <el-container style="height: 100%">
      <el-container>
        <el-header class="header" v-if="!isHideTopMenu">
          <page-header @updateMoudle="updateMoudle" :moduleName="moduleName" />
        </el-header>
        <div class="layout_content" :style="isHideTopMenu ? 'height:100vh !important' : ''">
          <el-aside v-if="!isHideLeftMenu" :width="collapse ? '60px' : '210px'" class="aside">
            <asideMenu :collapse="collapse" :moduleName="moduleName" />
            <!-- <div class="collapse_btn" @click="changeCollapse">{{ collapse ? '展开' : '收起' }}</div> -->
          </el-aside>
          <el-main class="layout_main">
            <!-- 下载中心入口 -- 目前只有海尔会用 -->
            <exportEntry v-if="judgeHWork()" />
            <!-- 面包屑 -->
            <div class="breadcrumb_box" v-if="breadList && breadList.length > 0 && !isHideTopMenu">
              <div class="breadcrumb_left_border" v-if="moduleIndex > 0 && !isHideLeftMenu"></div>
              <div class="one_breadcrumb" v-if="breadList[0].icon">
                <icons
                  v-if="breadList[0].icon && !breadList[0].icon.includes('icon-')"
                  :iconName="breadList[0].icon"
                ></icons>
                <i v-else class="iconfont breadcrumb_icon" :class="breadList[0].icon"></i>
              </div>
              <div class="one_breadcrumb" v-for="(item, index) in breadList" :key="index">
                <div
                  class="one_breadcrumb_line"
                  v-if="(breadList[0].icon && index === 0) || index > 0"
                >
                  /
                </div>
                <div
                  :class="{
                    one_breadcrumb_text: true,
                    text_click:
                      !(judgeOEA() || judgeHWork()) && item.path && index < breadList.length - 1
                  }"
                  :style="
                    !(judgeOEA() || judgeHWork()) && item.path && index < breadList.length - 1
                      ? 'cursor: pointer;'
                      : ''
                  "
                  @click="
                    !(judgeOEA() || judgeHWork()) && item.path && index < breadList.length - 1
                      ? toPage(item)
                      : null
                  "
                >
                  {{ item.title }}
                </div>
              </div>
            </div>
            <!-- 企业版AIGC一级菜单下或其他版本的视频模板菜单下显示客户端入口 -->
            <down-load-client
              v-if="
                (systemVersion === 3 &&
                  (moduleName === 'AIGC' || moduleScopeCode == 'contentProduction')) ||
                (systemVersion != 3 &&
                  breadList &&
                  breadList[1] &&
                  breadList[1].scopeCode == 'sumvideo:template_video')
              "
            ></down-load-client>
            <div class="main_main" :style="isHideTopMenu ? 'height:100%' : ''">
              <template v-if="isShow">
                <router-view v-slot="{ Component }">
                  <!-- <transition name="fade-transform" mode="out-in">
                  <keep-alive :include="['editCourse']">
                    <component :is="Component" />
                  </keep-alive>
                </transition> -->
                  <keep-alive>
                    <component
                      :is="Component"
                      :key="$route.fullPath"
                      v-if="$route.meta.keepAlive"
                    />
                  </keep-alive>

                  <component :is="Component" :key="$route.fullPath" v-if="!$route.meta.keepAlive" />
                </router-view>
              </template>
            </div>
          </el-main>
        </div>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import icons from './components/icons.vue'
import { throttle } from '@/utils/tools.js'
import { ROUTE_PATH } from '@/utils/dictionary/path'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import asideMenu from './components/aside_menu.vue'
import pageHeader from './components/page_header.vue'
import exportEntry from './components/export/exportEntry.vue'
const collapse = ref(false)
const store = useStore()
const route = useRoute()
const router = useRouter()
// function changeCollapse() {
//   collapse.value = !collapse.value
// }
const judgeOEA = inject('$judgeOEA')
const judgeHWork = inject('$judgeHWork')
const moduleName = ref(null)
const moduleScopeCode = ref(null)
const moduleIndex = ref(0)

if (sessionStorage.getItem('module')) {
  setMoudleName(sessionStorage.getItem('module'))
}
const isHideLeftMenu = store.getters.isHideLeftMenu
const isHideTopMenu = store.getters.isHideTopMenu
console.log('isHideTopMenu', isHideTopMenu, isHideLeftMenu)
function updateMoudle(e) {
  setMoudleName(e)
}
function setMoudleName(e) {
  const newModule = store.getters.systemModule
  const systemModule = newModule.filter(
    item => item.scopeCode !== 'public_authority' && item.scopeCode !== 'data_screen'
  )
  const index = systemModule.findIndex(x => x.scopeName === e)
  if (index > -1) {
    moduleScopeCode.value = systemModule[index].scopeCode
    moduleIndex.value = index
    moduleName.value = e
  }
}
// 根据侧边栏获取菜单路径
function getMenuPath(menu, name, len = [], firstPath = '') {
  const nodes = []
  const getPath = function (menu, name, len = []) {
    if (menu && menu.length > 0) {
      for (const x in menu) {
        if (menu[x].scopeUrl === name) {
          const pathlist = len.concat(menu[x])
          pathlist.forEach((y, i) => {
            const obj = {
              title: y.scopeName,
              icon: y.scopeIcon || '',
              scopeCode: y.scopeCode || ''
            }
            if (i === pathlist.length - 1) {
              obj.path = firstPath + '/' + y.scopeUrl
            }

            nodes.push(obj)
          })
          // nodes = len.concat(menu[x])
        } else {
          if (menu[x] && menu[x].childrenMenuList) {
            getPath(menu[x].childrenMenuList, name, len.concat(menu[x]), firstPath)
          }
        }
      }
    }
  }
  getPath(menu, name, len, firstPath)
  return nodes
}

const breadList = ref([]) // 面包屑列表
watch(
  () => route.path,
  val => {
    const valLength = val.split('/')
    const lastRoute = route.matched[route.matched.length - 1]
    const systemModule = store.getters.systemModule
    // 返回上一页后，跨菜单跳转会导致顶部菜单不对。
    if (sessionStorage.getItem('module')) {
      const sessionModule = sessionStorage.getItem('module')

      const sessionModuleUrl = systemModule.filter(item => item.scopeName === sessionModule)
      if (sessionModuleUrl && sessionModuleUrl.length > 0) {
        if ('/' + valLength[1] === sessionModuleUrl[0].scopeUrl) {
          console.log('layout_index---顶部菜单路由一致')
        } else {
          console.log('layout_index---顶部菜单路由不对', sessionModuleUrl[0].scopeUrl, valLength[1])
          systemModule.forEach((x, i) => {
            if (x.scopeUrl === '/' + valLength[1]) {
              moduleIndex.value = i
              moduleName.value = x.scopeName
              moduleScopeCode.value = x.scopeCode
              sessionStorage.setItem('module', x.scopeName)
            }
          })
        }
      }
    }
    // 有Meta.title代表这个页面不属于侧边栏，所以他的面包屑是侧边栏选中数据的完整路径+当前路径。
    if (lastRoute.meta && lastRoute.meta.title) {
      const sessionModule = sessionStorage.getItem('module') || ''
      const chooseModule = systemModule.filter(item => {
        if (sessionModule) {
          return item.scopeName === sessionModule
        } else {
          return item.scopeUrl === '/' + valLength[1]
        }
      })
      if (chooseModule && chooseModule.length > 0) {
        const menu = chooseModule[0].childrenMenuList
        breadList.value = getMenuPath(menu, valLength[2], [], '/' + valLength[1])
        // 如果上一级不是属于侧边栏的，就加上isParentGO，到时候跳转用go(-1)
        if (lastRoute.meta.parentInfo) {
          breadList.value.push({
            title: lastRoute.meta.parentInfo,
            path: ROUTE_PATH.getEN(lastRoute.meta.parentInfo),
            isParentGO: true
          })
        }
        breadList.value.push({
          title: lastRoute.meta.title
        })
      } else {
        breadList.value = []
      }
    } else {
      const sessionModule = sessionStorage.getItem('module') || ''
      const chooseModule = systemModule.filter(item => {
        if (sessionModule) {
          return item.scopeName === sessionModule
        } else {
          return item.scopeUrl === '/' + valLength[1]
        }
      })
      if (chooseModule && chooseModule.length > 0) {
        const menu = chooseModule[0].childrenMenuList
        breadList.value = getMenuPath(menu, valLength[valLength.length - 1], [], '/' + valLength[1])
      } else {
        breadList.value = []
      }
    }
  },
  { deep: true, immediate: true }
)

// 面包屑跳转
const toPage = throttle(e => {
  // 每平每屋和海尔不能使用面包屑跳转
  if (judgeOEA() || judgeHWork()) {
    return
  }
  if (
    store.state.page.fromPath &&
    store.state.page.fromPath !== '/' &&
    store.state.page.fromPath.split('?')[0] === e.path
  ) {
    console.log('通过go(-1)进入页面', store.state.page.fromPath, e.path)
    router.go(-1)
  } else {
    console.log('通过router.push进入页面', store.state.page.fromPath, e.path)
    router.push(e.path)
  }
}, 1000)
const isShow = computed(() => {
  return store.state.page.showPage
})
// 标准版才是智能短视频这个模块下才显示客户端
const systemVersion = computed(() => store.state.user.systemVersion)
</script>

<style lang="scss">
.aside {
  color: #fff;
  background: $theme_color;
  height: 100%;
  padding: 0 0 26px 0;
  position: relative;
  transition: 0.3s;
  overflow-x: hidden !important;
  .aside_head {
    width: 100%;
    height: 58px;
    padding-left: 24px;
    box-sizing: border-box;
    padding-top: 12px;
    .logo_img {
      width: 106px;
      cursor: pointer;
    }
    .module_name {
      font-size: 12px;
      color: #fff;
      line-height: 14px;
      padding: 1px 2px;
      background: #5e72d7;
      border-radius: 2px;
      // transform: translate(5px, -9px);
      display: inline-block;
      span {
        transform: scale(0.9);
        display: inline-block;
      }
    }
  }

  .collapse_btn {
    position: absolute;
    right: 20px;
    bottom: 20px;
  }
}
.header {
  width: 100%;
  height: 58px !important;
  padding: 0 !important;
  z-index: 1000;
  color: #fff;
  background: linear-gradient(135deg, #364fcd 0%, #6780ff 100%);
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.05);
}
.main {
  position: relative;
}
.layout {
  width: 100%;
  min-width: 1366px;
}
.no_menu_layout {
  min-width: 1200px !important;
}
.layout_content {
  width: 100% !important;
  height: calc(100vh - 58px) !important;
  display: flex !important;
  flex-direction: row !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
}
.layout_main {
  position: relative;
  padding: 0 !important;
  height: 100% !important;
  box-sizing: border-box;
  .main_main {
    padding: 0 16px 16px;
    height: calc(100% - 52px);
    box-sizing: border-box;
    // overflow-y: auto;
  }
}

.breadcrumb_box {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
  width: max-content;
  svg {
    margin: 0 !important;
  }
  .breadcrumb_icon {
    font-size: 20px;
    line-height: 1;
    margin-top: -1px;
  }
  .one_breadcrumb {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_breadcrumb_line {
      margin: 0 5px;
    }
  }
  .text_click {
    cursor: pointer;
    &:hover {
      color: rgba(48, 49, 51, 1);
    }
  }
  .breadcrumb_left_border {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 0px;
    left: 0;
    border-radius: 8px;
    box-shadow: -8px -8px 0px #364fcd;
  }
  .one_breadcrumb:last-child {
    .one_breadcrumb_text {
      font-weight: 600;
      color: rgba(48, 49, 51, 1);
    }
  }
}
</style>

import { createRouter, createWebHistory } from 'vue-router'
import NProgress from '@/utils/nprogress'
import routes from './routers'
import store from '@/store'
import track from '@/utils/tracking/index'
import { rewriteUrl, judgeOEA, judgeHWork, sumvideoNeedLogin } from '@/utils/OEA.js'
import { loginByHWorkFun } from '@/utils/doLogin'

// const store = useStore()

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(),
  routes
})

// OEA环境下，路由跳转不需要发送消息的页面列表(设当前页面地址为A，前一页地址为B；A要通过router.go(-1)返回到B，那就把A页面地址填进来)
const noSendPageList = [
  '/content_market/course_management/edit_course',
  '/content_market/course_management/edit_class',
  '/content_center/content_matrix_group/add_grouping',
  '/content_center/inspiration_library/brandVideo_detail',
  '/sumwhy_video/inspiration_library/brandVideo_detail',
  '/sumwhy_video/finish_product_store/works_detail',
  '/content_market/finish_product_store/works_detail',
  '/content_market/live_portal/detail',
  '/content_market/live_task/create_task',
  '/content_market/video_task/create_task',
  '/content_market/collecting_task/create_task',
  '/content_market/study_task/create_task',
  '/content_market/growth_setting/create',
  '/system_manage/content_config/edit_page',
  '/system_manage/role/per_config',
  '/sumwhy_video/matrix_manage/add_grouping'
]
// 不校验token的页面列表
const whiteList = [
  '/login',
  '/forget_password',
  '/fly_book_auth',
  '/enterprise_wechart_auth',
  '/loginTip',
  '/cutShadow_login'
]

const nextRoute = function (to, next) {
  if (whiteList.indexOf(to.path) > -1) {
    next()
  } else {
    if (localStorage.getItem('token') && localStorage.getItem('is_browser') === '1') {
      if (to.query.token) {
        next()
      } else {
        next({
          path: to.path,
          query: {
            ...to.query,
            token: localStorage.getItem('token')
          }
        })
      }
    } else if (localStorage.getItem('systemVersion') === '2') {
      // 切影[抖店]/基础版 要在路由里拼上cutshadow 保证对应页面里都显示切影的图标等信息
      if (to.query.cutShadow) {
        next()
      } else {
        next({
          path: to.path,
          query: {
            ...to.query,
            cutShadow: 2
          }
        })
      }
    } else {
      next()
    }
  }
}

router.beforeEach((to, _from, next) => {
  NProgress.start()
  if (whiteList.indexOf(to.path) > -1) {
    // 海尔环境下如果是进入登录页面就跳转到海尔专属的中间页
    if (judgeHWork()) {
      if (to.path !== '/loginTip') {
        localStorage.removeItem('token')
        localStorage.removeItem('hTime')
        next({
          path: '/loginTip',
          query: {
            envSource: localStorage.getItem('envSource') || 'hwork',
            tip: encodeURIComponent('登录过期，请重新进入！')
          }
        })
      } else {
        next()
      }
    } else {
      next()
    }

    return
  }
  if (!['login', 'cutShadow_login'].includes(to.name) && localStorage.getItem('token')) {
    // 刷新时处理
    if (!store.getters.userInfo.userId) {
      store
        .dispatch('user/getUserInfo')
        .then(data => {
          const brandInfo = localStorage.getItem('brandInfo')
            ? JSON.parse(localStorage.getItem('brandInfo'))
            : null
          if (brandInfo) {
            return store.dispatch('user/getSystemModule', { origin: 'refresh' })
          } else if (data.loginBrandVos.length === 0) {
            if (judgeHWork()) {
              next({
                path: '/loginTip',
                query: {
                  envSource: localStorage.getItem('envSource') || 'hwork'
                }
              })
            } else if (localStorage.getItem('systemVersion') === '2') {
              // 切影[抖店]/基础版 有专门的登录页
              next({
                path: '/cutShadow_login'
              })
            } else {
              next({
                path: '/login'
              })
            }
          } else {
            next({
              path: '/loading'
            })
          }
        })
        .then(data => {
          const moduleHis = sessionStorage.getItem('module')
          if (moduleHis && to.path !== '/') {
            next({
              path: to.path,
              query: to.query
            })
          } else {
            next({
              path: '/loading'
            })
          }
        })
    } else {
      if (to.meta && to.meta.useKeepAlive) {
        to.meta.keepAlive = true
      } else {
        to.meta.keepAlive = false
        store.commit('page/setIsMenuPush', false)
      }
      nextRoute(to, next)
    }
  } else if (
    !localStorage.getItem('token') &&
    !['login', 'cutShadow_login'].includes(to.name) &&
    whiteList.indexOf(to.path) === -1
  ) {
    console.log('没有token,给OEA发送消息')
    if (judgeOEA()) {
      sumvideoNeedLogin(rewriteUrl(to.fullPath))
    } else if (judgeHWork()) {
      // 走登录接口
      loginByHWorkFun({
        path: to.path,
        query: to.query
      })
        .then(res => {
          console.log('登陆返回过来的数据', res)
          // nextRoute(to, next)
        })
        .catch(err => {
          console.log('err', err)
          next({
            path: '/loginTip',
            query: {
              envSource: localStorage.getItem('envSource') || 'hwork',
              tip:
                err.msg || err.requestID
                  ? encodeURIComponent(`【${err.requestID || ''}】${err.msg}`)
                  : ''
            }
          })
        })
    } else if (localStorage.getItem('systemVersion') === '2') {
      // 切影[抖店]/基础版 有专门的登录页
      next({
        path: '/cutShadow_login'
      })
    } else {
      next({
        path: '/login'
      })
    }
  } else {
    nextRoute(to, next)
  }
})

router.afterEach((to, _from) => {
  console.log('afterEach', to.path, to)
  if (judgeOEA()) {
    // 判断要前往的路由地址是否存在不发送消息列表里
    let has = false
    noSendPageList.forEach(x => {
      if (to.path.indexOf(x) > -1) {
        has = true
      }
    })
    if (!has) {
      console.log('OEA-监听路由跳转发送消息:', 'to', to.fullPath, to, 'form', _from.path)
      // 发urlchange消息
      window.parent.postMessage(
        {
          metaData: { event: 'historyChange' },
          data: {
            type: 'push',
            url: rewriteUrl(to.fullPath)
          }
        },
        '*'
      )
    }
  }
  store.commit('page/setFromPath', _from.fullPath)
  // 当有token时再去埋点。
  if (localStorage.getItem('token')) {
    track.leavePage(_from)
    track.enterPage(to)
  }
  const name = to.meta && to.meta.title ? to.meta.title : to.name
  document.title = `星麦云 - ${name || ''}`
  NProgress.done()
  document.getElementById('app_loading').style.display = 'none'
  document.getElementById('app').style.display = 'block'
  document.querySelector('.el-main') && document.querySelector('.el-main').scrollTo(0, 0)
})
export default router

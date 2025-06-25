import { createApp } from 'vue'
import router from '@/router'
import store from '@/store'
import '@/assets/style/reset.css'
import '@/styles/index.scss'
// import elementPlus, { ElMessage } from 'element-plus'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import i18n from './locale'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'vue-global-api'
// 统一导入el-icon图标
import * as ElIconModules from '@element-plus/icons'
// 导入转换图标名称的函数
import { transElIconName, confirmAlert } from './utils/tools'
import { rewriteUrl, judgeOEA, judgeHWork, showSystemName } from './utils/OEA'
import { menuOfKeepAlive } from '@/utils/keep_Alive.js'
import components from '@/components/index'

import { getQueryVariable } from '@/utils/tools'
import tracking from '@/utils/tracking/index.js'

import Cookies from 'js-cookie'

dayjs.locale('zh-cn')

const app = createApp(App)
// 注册全局方法
app.config.globalProperties.$tracking = tracking
// 统一注册el-icon图标
for (const iconName in ElIconModules) {
  app.component(transElIconName(iconName), ElIconModules[iconName])
}
init()
// 注册统一弹出
app.provide('$confirm', confirmAlert)
app.provide('$message', ElMessage)
app.provide('$tracking', tracking)
app.provide('$judgeOEA', judgeOEA)
app.provide('$judgeHWork', judgeHWork)
app.provide('$showSystemName', showSystemName)
app.provide('$menuOfKeepAlive', menuOfKeepAlive)
app.use(ElementPlus).use(components).use(router).use(store).use(i18n).mount('#app')

function init() {
  // 如果是切影[抖店]，那一定是基础版
  const cutShadow = getQueryVariable('cutShadow')
  if (cutShadow && cutShadow === '2') {
    localStorage.setItem('systemVersion', cutShadow)
  }
  // envSource mpmw 就代表是OEA过来的 hwork 海尔过来的
  const envSource = getQueryVariable('envSource')
  console.log('init-envSource：', envSource, '|', window?.self !== window?.top)
  if (window?.self !== window?.top) {
    if (envSource) {
      localStorage.setItem('envSource', envSource)
      if (envSource === 'mpmw') {
        const hideHeader = getQueryVariable('hideHeader')
        const hideAside = getQueryVariable('hideHeader')
        if (hideHeader) {
          localStorage.setItem('hideHeader', hideHeader)
        }
        if (hideAside) {
          localStorage.setItem('hideAside', hideAside)
        }
        if (window?.self !== window?.top && envSource === 'mpmw') {
          //  window.open拦截
          const originOpen = window.open
          window.open = (url, name, features) => {
            console.log('OEA-window.open拦截', url, name, features)
            // --如果是下载操作，那就发送下载的消息
            if (features && features === 'download') {
              console.log('OEA-下载发送消息:', url)
              window.parent.postMessage(
                {
                  metaData: {
                    event: 'download'
                  },
                  data: {
                    url: url
                  }
                },
                '*'
              )
              return null
            }

            // --如果打开的是外部网址 那就不发送消息
            // eslint-disable-next-line prefer-regex-literals
            const reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/)
            const result = url.match(reg)
            if (result && result.length > 0 && result[0] !== location.origin) {
              return originOpen(url)
            }
            // --否则就发送消息
            // const newUrl = url
            // if (typeof url === 'string') {
            //   // 如果需要处理url地址，可以在这⾥处理
            //   console.log(rewriteUrl(url), 'url')
            //   newUrl = url
            // }
            // 发urlchange消息
            console.log('OEA-window.open发送消息:', url)
            window.parent.postMessage(
              {
                metaData: {
                  event: 'urlChange'
                },
                data: {
                  target: name || '_blank',
                  url: rewriteUrl(url)
                }
              },
              '*'
            )
            if (name === '_self') {
              return originOpen(rewriteUrl(url), name)
            } else {
              return null
            }
          }
          // --a标签拦截
          document.body.addEventListener('click', event => {
            const target = event?.target
            if (
              target &&
              target?.nodeName?.toLocaleLowerCase() === 'a' &&
              target?.getAttribute('href')
            ) {
              console.log('OEA-a标签拦截', target?.getAttribute('href'))
              const downUrl = target?.getAttribute('href')
              // 如果下载的链接是blob二进制流就不发送消息
              if (downUrl && downUrl.indexOf('blob') === -1) {
                event?.preventDefault()
                // 发urlchange消息
                window.parent.postMessage(
                  {
                    metaData: {
                      event: 'urlChange'
                    },
                    data: {
                      target: target?.getAttribute('target') || '_blank',
                      url: target?.getAttribute('href')
                    }
                  },
                  '*'
                )
              }
            }
          })
        }
      } else if (envSource === 'hwork') {
        if (window?.self !== window?.top && envSource === 'hwork') {
          // 因为海尔过来的没有我们系统token，是通过需要hwork调接口获取token才能打开页面，所以把hwork存起来
          const oldHToken = localStorage.getItem('hToken')
          if (oldHToken) {
            if (oldHToken !== getQueryVariable('hToken')) {
              localStorage.removeItem('token')
              localStorage.removeItem('hTime')
            }
          } else {
            localStorage.removeItem('token')
            localStorage.removeItem('hTime')
          }
          localStorage.setItem('hToken', getQueryVariable('hToken'))
          // 如果储存的日期和今天不是同一天，那就删除token重新走登录
          const localTime = localStorage.getItem('hTime')
          if (localTime) {
            const now = new Date()
            const year = now.getFullYear() // 年
            const month = now.getMonth() + 1 // 月
            const date = now.getDate() // 日
            const nowTime = `${year}${month}${date}`
            if (localTime !== nowTime) {
              localStorage.removeItem('token')
            }
          } else {
            localStorage.removeItem('token')
          }
          console.log('海尔过来了，准备走登录')
          //  window.open拦截
          const originOpen = window.open
          window.open = (url, name, features) => {
            console.log('海尔-window.open拦截', url, name, features)

            // --如果打开的是外部网址 那就不发送消息
            // eslint-disable-next-line prefer-regex-literals
            const reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/)
            const result = url.match(reg)
            if (result && result.length > 0 && result[0] !== location.origin) {
              return originOpen(url)
            }
            // 否则就走路由跳转router.push
            // 裁剪掉location.origin
            // 因为sumvideo和大屏都不属于这个项目，所以要用location.href
            if (url.indexOf('/sumvideo/') > -1 || url.indexOf('/largeview/') > -1) {
              if (url.indexOf('?') > -1) {
                location.href = url + '&envSource=' + localStorage.getItem('envSource')
              } else {
                location.href = url + '?envSource=' + localStorage.getItem('envSource')
              }
            } else {
              if (url.indexOf(location.origin) > -1) {
                const reUrl = url.split(location.origin)[1]
                router.push(reUrl)
              } else {
                router.push(url)
              }
            }
          }
          // --a标签拦截
          document.body.addEventListener('click', event => {
            const target = event?.target
            if (
              target &&
              target?.nodeName?.toLocaleLowerCase() === 'a' &&
              target?.getAttribute('href')
            ) {
              const downUrl = target?.getAttribute('href')
              console.log(
                '海尔-a标签拦截',
                target?.getAttribute('href'),
                downUrl && downUrl.indexOf('blob') === -1
              )

              // 如果下载的链接是blob二进制流就不发送消息
              if (downUrl && downUrl.indexOf('blob') === -1) {
                event?.preventDefault()

                const url = target?.getAttribute('href')
                // --如果打开的是外部网址 那就不发送消息
                // eslint-disable-next-line prefer-regex-literals
                const reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/)
                const result = url.match(reg)
                if (result && result.length > 0 && result[0] !== location.origin) {
                  return originOpen(url)
                }
                // 否则就走路由跳转router.push
                // 裁剪掉location.origin
                // 因为sumvideo和大屏都不属于这个项目，所以要用location.href
                if (url.indexOf('/sumvideo/') > -1 || url.indexOf('/largeview/') > -1) {
                  if (url.indexOf('?') > -1) {
                    location.href = url + '&envSource=' + localStorage.getItem('envSource')
                  } else {
                    location.href = url + '?envSource=' + localStorage.getItem('envSource')
                  }
                } else {
                  if (url.indexOf(location.origin) > -1) {
                    const reUrl = url.split(location.origin)[1]
                    router.push(reUrl)
                  } else {
                    router.push(url)
                  }
                }
              }
            }
          })
        }
      }
    }
  } else {
    localStorage.removeItem('hToken')
    localStorage.removeItem('envSource')
    localStorage.removeItem('hideHeader')
    localStorage.removeItem('hideAside')
    // 如果是切影[抖音]/基础版 window.open 系统地址都要拼上cutShadow
    if (localStorage.getItem('systemVersion') === '2' || (cutShadow && cutShadow === '2')) {
      const originOpen = window.open
      window.open = (url, name, features) => {        
        console.log('切影-window.open拦截', url, name, features)
        // eslint-disable-next-line prefer-regex-literals
        const reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/)
        const result = url.match(reg)
        let lastUrl = ''
        if (result && result.length > 0 && result[0] !== location.origin) {
          lastUrl = url
        } else {
          if (url.indexOf('?') > -1) {
            lastUrl = url + '&cutShadow=' + localStorage.getItem('systemVersion')
          } else {
            lastUrl = url + '?cutShadow=' + localStorage.getItem('systemVersion')
          }
        }
        return originOpen(lastUrl, name)
      }
    }
  }
  // omg跳转
  if (getQueryVariable('token')) {
    // 将local storage里的token更新
    localStorage.setItem('token', getQueryVariable('token'))
    localStorage.removeItem('userInfo')
    store.commit('user/clearUserInfo')
    // 还要更改cookie里存的token
    Cookies.set('token', getQueryVariable('token'), { expires: 30 })
    sessionStorage.clear()
  }
  location.pathname.split('/')[2] &&
    sessionStorage.setItem('menuActive', location.pathname.split('/')[2])
  const module = getQueryVariable('module')
  if (module) {
    sessionStorage.setItem('module', window.decodeURI(window.decodeURI(module)))
  }
}

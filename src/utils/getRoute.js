import store from '@/store'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { sendHrefMessage, judgeHWork } from './OEA.js'
import { isNotEmpty } from './tools.js'
/**
 * @description 获取第一个菜单
 */
export function getFirstMenu(data) {
  let route = ''
  let hasChild = null
  data.forEach(x => {
    if (!hasChild && x.children && x.children.length > 0) {
      hasChild = x
    }
  })

  if (hasChild) {
    sessionStorage.setItem('menuActive', hasChild.children[0].path)
    sessionStorage.setItem('module', hasChild.name)
    route = `${hasChild.path}/${hasChild.children[0].path}`
  }
  return route
}
/**
 * @param {Array} data  路由列表
 * @description 根据所有路由，选出第一个有子项的路由并跳转
 * @return {String} route 要跳转的路由地址
 */
export function getJumpPath(data, pathObj) {
  let route = ''
  if (data && data.length > 0) {
    // 如果是海尔他们初次打开某个页面，是需要登录之后打开的，那就从子到父筛选出路径，设置菜单
    if (pathObj) {
      const pathF = pathObj.path.substring(1)
      const queryF = pathObj.query
      const pathList = pathF && pathF.length > 0 ? pathF.split('/') : []
      console.log('pathf', pathF, pathList)
      let queryParam = ''
      if (pathObj && isNotEmpty(pathObj)) {
        for (const i in queryF) {
          if (!(i === 'hToken' || i === 'envSource')) {
            queryParam += `&${i}=${queryF[i]}`
          }
        }
      }

      if (pathList && pathList.length > 0) {
        let menuActive = ''
        let modulePath = ''
        // 根据路径设置菜单
        data.forEach(x => {
          if (x.path === '/' + pathList[0]) {
            modulePath = x.name
            if (x.children && x.children.length > 0 && pathList[1]) {
              x.children.forEach(y => {
                if (y.path === pathList[1]) {
                  menuActive = pathList[1]
                }
              })
            } else {
              menuActive = pathList[0]
            }
          }
        })
        if (menuActive && modulePath) {
          sessionStorage.setItem('menuActive', menuActive)
          sessionStorage.setItem('module', modulePath)
          route = `${pathObj.path}${queryParam ? '?' + queryParam.substring(1) : ''}`
        }
      } else {
        route = getFirstMenu(data)
      }
    } else {
      route = getFirstMenu(data)
    }
  }
  return route
}

/**
 * @description 路由跳转
 * @param {Object} pathObj 要跳转的页面地址信息{path,query} 目前只有海尔登录那一刻用到
 */
export function getRoute(loading, showMessage = true, reload = false, brandId, refresh, pathObj) {
  console.log(loading, 'loading0', pathObj)
  let pathAction = null
  if (refresh) {
    pathAction = { origin: 'refresh' }
  }
  store
    .dispatch('user/getSystemModule', pathAction)
    .then(data => {
      console.log('获取到的路由', data)
      if (data && data.length === 1) {
        if (data[0].name === '公共权限') {
          noPathFun(loading, showMessage)
          return
        }
      }
      const routeData = getJumpPath(data, pathObj)
      console.log(
        '要调整的地址',
        window?.self !== window?.top,
        routeData,
        localStorage.getItem('envSource')
      )
      if (routeData) {
        // 因为海尔不需要切换品牌，所以这里的Location.href不要管
        if (reload) {
          if (brandId) {
            location.href = location.origin + routeData + '?brandId=' + brandId
          } else {
            // OEA环境下  location.href要发送消息
            if (localStorage.getItem('envSource')) {
              const url = location.origin + routeData
              sendHrefMessage(url)
            } else {
              location.href = location.origin + routeData
            }
          }
        } else {
          router.push(routeData)
        }
      } else {
        noPathFun(loading, showMessage)
      }
    })
    .catch(() => {
      noPathFun(loading, showMessage)
    })
}

/**
 * @description 找不到对应菜单
 */
export function noPathFun(loading, showMessage) {
  if (showMessage) {
    ElMessage.warning('暂无菜单权限，请联系管理员进行开通')
  }
  // 如果是海尔找不到菜单就进入专门的提示页面 里面只有提示语 没有品牌切换等其他信息。
  if (judgeHWork()) {
    router.push('/loginTip?envSource=' + (localStorage.getItem('envSource') || 'hwork'))
  } else {
    router.push('/choice_system')
  }
  if (loading) {
    loading.value = false
  }
}

/**
 * @description 封装pushState 如果是切影[抖店]/基础版过来的要在地址栏里加上cutShadow
 * @param {String} param - 携带参数
 */
export function resetPushState(param) {
  const url = window.location.href
  const newUrl = url.split('?')[0]
  let newQuery = ''
  const systemVersion = localStorage.getItem('systemVersion')
  if (systemVersion === '2') {
    newQuery = (param ? '&' : '?') + 'cutShadow=' + systemVersion
  }
  history.pushState(null, null, newUrl + (param || '') + newQuery)
}

import { getSystemPermission, setLoginOut } from '@/api/main/login'
import { getSupportedPublishWays } from '@/api/main/home.js'
import { getOutsiderConfig, isShowEmployeeId } from '@/api/market/operate_analysis.js'
import { aliasList } from '@/api/system_setting/section'
import { isEnableGrowth, userGrowthLevel } from '@/api/market/growth_system.js'
import { getUserInfoFun } from '@/utils/doLogin'
import { selectBrand } from '@/api/system_setting/brand_info.js'
import { getSumvideoClientDownloadUrl } from '@/api/market/sumvideo'
import router from '@/router'
import { getQueryVariable } from '@/utils/tools'
import { getBusinessEntity } from '@/api/system_setting/business_entity.js'

const state = {
  userInfo: {}, // 用户信息
  systemModule: [], // 系统模块权限
  levelAlias: [], // 组织架构的别名
  outsiderState: false, // 外部达人功能的开关
  employeeGrowthSystemState: false, // 员工成长体系的开关
  employeeGrowthLevelList: [], // 员工成长等级
  brandViewMode: 1, // 品牌视角模式 1是兼容 2是留资
  sumvideoDownloadUrl: '', // sumvideo客户端下载地址
  showEmployeeId: false, // 是否显示员工id
  canEditThirdPartyStaffId: false, // 是否可以编辑第三方员工id
  dyVersion: 1, // // 1 代发 2扫码发布 3下载/话题发布 4APP分享发布 5剪映代发 1
  businessEntityList: [], // 业务主体类型列表
  systemVersion: 3, // 系统版本： 1 标准版 2 基础版  3 企业版 4 专业版
  brandLogo: '', // 品牌LOGO
  brandRetainLogo: '', // 系统左上角标识
  accountDataAuthHide: false, // 是否隐藏数据授权提示
  isInitPwd: 0, // 是否需要显示设置密码登录提示
  allowDyMcnAuth: false, // 是否允许抖音高级数据授权
  allowCluesAuth: false, // 是否允许抖音线索授权
  isAdmin: false, // 是否是管理员角色
}
const mutations = {
  setStateUserInfo(state, val) {
    localStorage.setItem('userInfo', JSON.stringify(val))
    // 存储品牌logo
    if (val.brandLogo) {
      localStorage.setItem('brandLogo', val.brandLogo)
      state.brandLogo = val.brandLogo
    } else {
      localStorage.removeItem('brandLogo')
      state.brandLogo = ''
    }
    // 存储系统左上角标识
    if (val.brandRetainLogo) {
      localStorage.setItem('brandRetainLogo', val.brandRetainLogo)
      state.brandRetainLogo = val.brandRetainLogo
    } else {
      localStorage.removeItem('brandRetainLogo')
      state.brandRetainLogo = ''
    }
    // 存储用户不再提示数据获取授权
    if (val.noticeConfig) {
      const noticeConfig = JSON.parse(val.noticeConfig)
      if (noticeConfig.accountDataAuthHide) {
        localStorage.setItem('accountDataAuthHide', '1')
      } else {
        localStorage.removeItem('accountDataAuthHide')
      }
      state.accountDataAuthHide = noticeConfig.accountDataAuthHide
    } else {
      localStorage.removeItem('accountDataAuthHide')
      state.accountDataAuthHide = false
    }
    state.userInfo = val
  },
  clearUserInfo(state) {
    localStorage.removeItem('userInfo')
    state.userInfo = JSON.parse(JSON.stringify({}))
  },
  setBrandLogo(state, val) {
    state.brandLogo = val
  },
  setAccountDataAuthHide(state, val) {
    state.accountDataAuthHide = val
  },
  setSystemModule(state, val) {
    state.systemModule = val
  },
  setSystemVersion(state, val) {
    console.log('系统版本', val)
    state.systemVersion = val
  },
  setIsInitPwd(state, val) {
    state.isInitPwd = val
  },
  setLevelAlias(state, val) {
    console.log('最终的别名', val)
    state.levelAlias = val
  },
  setOutsiderState(state, val) {
    console.log('外部达人的开关', val)
    state.outsiderState = val
  },
  setEmployeeGrowthSystemState(state, val) {
    console.log('员工成长体系的开关', val)
    state.employeeGrowthSystemState = val
  },
  setEmployeeGrowthLevelList(state, val) {
    console.log('员工成长等级', val)
    state.employeeGrowthLevelList = val
  },
  setBrandViewMode(state, val) {
    console.log('品牌经营形态', val)
    state.brandViewMode = val
  },
  setSumvideoDownloadUrl(state, val) {
    console.log('客户端地址', val)
    state.sumvideoDownloadUrl = val
  },
  setIsShowEmployeeId(state, val) {
    console.log('setIsShowEmployeeId', val)
    state.showEmployeeId = val
  },
  setCanEditThirdPartyStaffId(state, val) {
    state.canEditThirdPartyStaffId = val
  },
  setDyVersion(state, val) {
    state.dyVersion = val
  },
  setBusinessEntityList(state, data) {
    state.businessEntityList = data
  },
  setAllowDyMcnAuth(state, data) {
    console.log("是否显示高级数据权限",data)
    state.allowDyMcnAuth = data
  },
  setAllowCluesAuth(state, data) {
    console.log("是否显示线索数据权限",data)
    state.allowCluesAuth = data
  },
  setIsAdmin(state, data) {
    console.log("是否是管理员角色",data)
    state.isAdmin = data
  }
}
const actions = {
  loginOut({ commit }, e) {
    setLoginOut()
      .then(() => {
        if (localStorage.getItem('is_browser') === '1') {
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          localStorage.removeItem('brandInfo')
          localStorage.removeItem('userName')
        } else if (localStorage.getItem('systemVersion') === '2') {
          // 切影[抖店]/基础版 退出登录后要有一个标识存在本地缓存，防止跳转到其他版本
          localStorage.clear()
          localStorage.setItem('systemVersion', 2)
        } else {
          const envSource = getQueryVariable('envSource')
          localStorage.clear()
          if (window?.self !== window?.top && envSource) {
            localStorage.setItem('envSource', envSource)
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
      })
      .finally(() => {
        sessionStorage.clear()
        if (localStorage.getItem('is_browser') === '1' && e && e.exit) {
          if (
            localStorage.getItem('is_browser_fly') === '1' ||
            localStorage.getItem('isFlyBook') === '1'
          ) {
            location.href =
              location.origin + '/api/v1/system/account/oauth/render/feishu?loginType=1'
          } else if (
            localStorage.getItem('is_browser_weChat') === '1' ||
            localStorage.getItem('isWeChat') === '1'
          ) {
            location.href =
              location.origin + '/api/v1/system/account/oauth/render/weChatEnterprise?loginType=1'
          } else {
            location.reload()
            location.href = location.href.split('?')[0]
          }
        } else if (localStorage.getItem('systemVersion') === '2') {
          // 切影[抖店]/基础版 有专门的登录页
          location.href =
            location.origin + '/cutShadow_login?cutShadow=' + localStorage.getItem('systemVersion')
        } else {
          location.reload()
          location.href = location.href.split('?')[0]
        }
      })
  },
  // 获取登录用户信息
  getUserInfo({ commit }) {
    return new Promise(resolve => {
      getUserInfoFun(
        localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).userId : '',
        'refresh'
      )
        .then(data => {
          resolve(data)
        })
        .catch(() => {
          resolve()
        })
    })
  },
  // 获取系统模块权限
  getSystemModule({ dispatch, commit }, config) {
    console.log('获取系统权限的config', config)
    return new Promise((resolve, reject) => {
      const { userInfo } = { ...state }
      const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
      console.log(brandInfo)
      // commit('setBrandViewMode', brandInfo && brandInfo.brandViewMode ? brandInfo.brandViewMode : 1)
      router.addRoute({
        path: '/:catchAll(.*)',
        redirect: '/404',
        name: 'NotFound'
      })
      // 获取组织机构的别名
      dispatch('getAliasFun')
      dispatch('getTalentSwitch')
      dispatch('getEmployeeSwitch')
      dispatch('getEmployeeLevel')
      dispatch('getSumVideoDownloadUrl')
      dispatch('getShowEmployeeId')
      dispatch('getDyVersion')
      dispatch('getBrandInfo')
      if (!config && sessionStorage.getItem('systemModule') && sessionStorage.getItem('menu')) {
        const menu = JSON.parse(sessionStorage.getItem('menu'))
        setModule(menu)
        addRoutes(menu)
        commit('setSystemModule', JSON.parse(sessionStorage.getItem('systemModule')))
        resolve(menu)
      } else {
        getSystemPermission({
          userId: userInfo.userId,
          brandId: brandInfo.brandId
        }).then(({ data }) => {
          const menu = []
          // 剔除模块
          data.forEach(item => {
            const obj = {}
            obj.path = item.scopeUrl
            obj.name = item.scopeName
            obj.component = item.scopeFileUrl || '/'
            obj.icon = item.scopeIcon
            obj.children = menuReset(item.childrenMenuList, [])
            menu.push(obj)
          })
          setModule(menu)
          // // 存储权限及菜单 加快刷新展现速度
          sessionStorage.setItem('menu', JSON.stringify(menu))
          sessionStorage.setItem('systemModule', JSON.stringify(data))
          addRoutes(menu)
          commit('setSystemModule', data)
          resolve(menu)
        })
      }
    })
  },
  // 获取组织架构别名
  getAliasFun({ commit }) {
    aliasList()
      .then(res => {
        if (res.code === 0) {
          const list = res.data || []
          list.sort((a, b) => {
            return a.level - b.level
          })
          // 防止只返回一级部门、二级部门、四级部门的出现
          const levelList = new Array(parseInt(list.length > 0 ? list[list.length - 1].level : 0))
          list.forEach(x => {
            levelList[parseInt(x.level) - 1] = x.alias
          })
          commit('setLevelAlias', levelList.length > 0 ? levelList : ['事业部', '零售中心', '大区'])
        } else {
          commit('setLevelAlias', ['事业部', '零售中心', '大区'])
        }
      })
      .catch(() => {
        commit('setLevelAlias', ['事业部', '零售中心', '大区'])
      })
  },
  getTalentSwitch({ commit }) {
    getOutsiderConfig().then(res => {
      if (res.code === 0) {
        commit('setOutsiderState', res.data && res.data.outsiderState === 1)
      }
    })
  },
  getEmployeeSwitch({ commit }) {
    isEnableGrowth().then(res => {
      if (res.code === 0) {
        commit('setEmployeeGrowthSystemState', !!res.data)
        console.log('获取到的成长等级开关', res.data)
      }
    })
  },
  getEmployeeLevel({ commit }) {
    userGrowthLevel({ isDetail: false }).then(res => {
      if (res.code === 0) {
        const data = res.data || []
        commit('setEmployeeGrowthLevelList', data)
      }
    })
  },
  getSumVideoDownloadUrl({ commit }) {
    getSumvideoClientDownloadUrl()
      .then(res => {
        if (res.code === 0) {
          const data = res.data || {}
          const isMac = /macintosh|mac os x/i.test(navigator.userAgent)
          const url = isMac ? data.armMacUrl || '' : data.windowsUrl || ''
          commit('setSumvideoDownloadUrl', url)
        }
      })
      .catch(() => {})
  },
  getShowEmployeeId({ commit }) {
    isShowEmployeeId()
      .then(res => {
        if (res.code === 0) {
          commit('setIsShowEmployeeId', res.data)
        }
      })
      .catch(() => {})
  },
  getBrandViewMode({ commit }) {
    const { brandId, companyCode } = JSON.parse(localStorage.getItem('brandInfo'))
    selectBrand({
      pureData: 1,
      brandId,
      compannyCode: companyCode
    }).then(res => {
      if (res.code === 0) {
        const brandInfo = res.data || {}
        localStorage.setItem(
          'brandViewMode',
          brandInfo && brandInfo.brandViewMode ? brandInfo.brandViewMode : 1
        )
        commit(
          'setBrandViewMode',
          brandInfo && brandInfo.brandViewMode ? brandInfo.brandViewMode : 1
        )
      }
    })
  },
  getBrandInfo({ commit }) {
    selectBrand({}).then(res => {
      if (res.code === 0 && res.data && res.data.xuserConfig) {
        const xuserConfig = JSON.parse(res.data.xuserConfig)

        commit('setAllowDyMcnAuth', !!(xuserConfig && xuserConfig.allowDyMcnAuth))
        commit('setAllowCluesAuth', !!(xuserConfig && xuserConfig.allowCluesAuth))
      }
    })
  },
  getDyVersion({ commit }, taskId = undefined) {
    getSupportedPublishWays()
      .then(res => {
        if (res.code === 0) {
          // 虽然接口返回每个平台配置  但是目前都以 抖音配置为准  1 代发 2扫码发布 3下载/话题发布 4APP分享发布 5剪映代发
          const [dySupport = 1] = res.data?.dySupport || []
          commit('setDyVersion', dySupport)
        } else {
          commit('setDyVersion', 2)
        }
      })
      .catch(() => {
        commit('setAllVersion', {
          dy: 1
        })
      })
  },
  // 获取业务主体类型
  getBusinessEntityFun({ commit }) {
    return new Promise(resolve => {
      getBusinessEntity()
        .then(res => {
          if (res.code === 0) {
            const list = (res.data || []).filter(x => x.isOpen)
            console.log('获取业务主体类型', list)
            commit('setBusinessEntityList', list)
            resolve()
          } else {
            resolve()
          }
        })
        .catch(() => {
          resolve()
        })
    })
  }
}
const menuReset = (oldMenu, newMenu) => {
  oldMenu.forEach(item => {
    const obj = {}
    obj.path = item.scopeUrl
    obj.name = item.scopeName
    obj.component = item.scopeFileUrl
    obj.icon = item.scopeIcon
    obj.useKeepAlive = item.useKeepAlive
    if (item.childrenMenuList.length) {
      obj.children = menuReset(item.childrenMenuList, newMenu)
    } else {
      newMenu.push(obj)
    }
    // if (item.childrenPermissionList.length) {
    //   obj.children = menuReset(item.childrenPermissionList, newMenu)
    // } else {
    //   newMenu.push(obj)
    // }

    // 跳转时标记模块
    // if (
    //   obj.children &&
    //   obj.children.filter(item => location.pathname.indexOf(item.path) > -1).length > 0
    // ) {
    //   sessionStorage.setItem('module', item.parentName)
    // }
  })
  return newMenu
}
// 设置当前页面的系统
const setModule = menu => {
  const currentPath = location.pathname
  for (const menuItem of menu) {
    for (const child of menuItem.children) {
      if (currentPath.indexOf(child.path) > -1) {
        sessionStorage.setItem('module', menuItem.name)
        return
      }
    }
  }
}

const dynamicViewsModules = import.meta.glob('../../views/**/*.vue')
const modulesKeys = Object.keys(dynamicViewsModules)
// const layout = import.meta.glob('../../layout/layout_index.vue')
/**
 *
 * @param {*} routes 路由元数据
 * @param {*} parentName 父name
 * @description 动态添加路由
 */
const addRoutes = (routes, parentName) => {
  routes.forEach(item => {
    if (item.path && item.component) {
      const route = {
        path: item.path,
        // redirect: item.redirect,
        name: item.name,
        meta: {
          useKeepAlive: item.useKeepAlive === 1
        }
        // meta: item.meta
      }
      if (item.children && item.children.length) {
        route.component = () => import('@/layout/layout_index.vue')
      } else {
        const matchKeys = modulesKeys.filter(key => {
          const k = key.replace('../../views', '')
          return k.startsWith(`${item.component}`) || k.startsWith(`/${item.component}`)
        })
        route.component = dynamicViewsModules[matchKeys[0]]
      }

      parentName ? router.addRoute(parentName, route) : router.addRoute(route)

      if (item.children && item.children.length) {
        addRoutes(item.children, item.name)
      }
    }
  })
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

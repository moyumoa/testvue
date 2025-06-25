import { loginByPhone, loginByHaier } from '@/api/main/login'
import { selectUserInfo, getUserBrandInfo } from '@/api/system_setting/personal.js'
import { getRoute } from '@/utils/getRoute'
import store from '@/store'
import { getUpgradeInfo, getBusinessEntity, loadFontFun, isNotEmpty } from '@/utils/tools'
import { ElMessage } from 'element-plus'
import { judgeHWork } from '@/utils/OEA'
import { getFontList } from '@/api/sumvideo/creative_templateSpectroscope'
import { getBrandKOCMinigram } from '@/api/market/operate_analysis.js'
/**
 * @param {Object} param - 入参
 * @param {string} origin - 来源 refresh 刷新页面时 page_header 页面右上角切换品牌 feishu 飞书工作台进入 weChatEnterprise 企微工作台进入
 * @description 登录接口
 * @returns
 */
export function loginFun(param, origin) {
  return new Promise((resolve, reject) => {
    loginByPhone(param)
      .then(res => {
        if (res.code === 0) {
          loginAfterFun(res.data, origin)
            .then(loginRes => {
              resolve(loginRes)
            })
            .catch(loginErr => {
              reject(loginErr)
            })
        } else {
          reject(new Error())
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * @param {Object} data - 登录返回的数据
 * @param {string} origin - 来源 refresh 刷新页面时 page_header 页面右上角切换品牌 feishu 飞书工作台进入 weChatEnterprise 企微工作台进入
 * @description 登录之后 如果opcode===0那就获取个人信息 否则就跳转到选品牌
 * @returns
 */
export function loginAfterFun(data, origin, pathObj) {
  return new Promise((resolve, reject) => {
    if (data.opCode === 1) {
      // 在当前页面进行选择品牌的操作
      if (data.loginBrandVos && data.loginBrandVos.length > 0) {
        resolve({
          opCode: data.opCode,
          data: {
            chooseBrandId: data.loginBrandVos[0].brandId,
            loginCode: data.loginCode,
            brandList: data.loginBrandVos
          }
        })
      } else {
        ElMessage.error('该账号未开通权限')
        reject(new Error())
      }
    } else if (data.opCode === 0) {
      if (data.tokenName && data.tokenValue) {
        localStorage.setItem(data.tokenName, data.tokenValue)
        // 如果是海尔过来的，存取一下token获取的日期
        if (judgeHWork()) {
          const now = new Date()
          const year = now.getFullYear() // 年
          const month = now.getMonth() + 1 // 月
          const date = now.getDate() // 日
          localStorage.setItem('hTime', `${year}${month}${date}`)
        }
      }
      // 从顶部菜单切换品牌 要清空路由相关信息
      if (origin === 'page_header') {
        store.commit('user/setSystemModule', JSON.parse(JSON.stringify([])))
        sessionStorage.clear()
      }
      getUserInfoFun(data.userId, origin, pathObj)
        .then(userRes => {
          resolve(userRes)
        })
        .catch(userErr => {
          reject(userErr)
        })
    }
  })
}

/**
 * @param {Number} userId - 用户ID
 * @param {string} origin - 来源 refresh 刷新页面时 page_header 页面右上角切换品牌 feishu 飞书工作台进入 weChatEnterprise 企微工作台进入
 * @description  登录成功，获取个人信息，然后根据用户菜单进行页面跳转
 * feishu/weChatEnterprise：在本地缓存里设置is_browser[代表是工作台进入的]
 * page_header：将所选的品牌信息返回
 * refresh：页面刷新，会调这个，然后将用户信息返回。
 * @returns
 */

export function getUserInfoFun(userId, origin, pathObj) {
  return new Promise((resolve, reject) => {
    selectUserInfo({
      userId: userId
    })
      .then(res => {
        console.log('获取个人信息成功', res)
        if (res.code === 0) {
          const data = res.data
          if (data.loginBrandVos && data.loginBrandVos.length > 0) {
            const chooseBrand = data.loginBrandVos.filter(x => x.brandId === data.brandId)
            if (chooseBrand && chooseBrand.length > 0) {
              // 直接进入菜单页
              store.commit('user/setStateUserInfo', data)
              if (origin === 'feishu') {
                localStorage.removeItem('isWeiXin')
                localStorage.removeItem('isWeChat')
                localStorage.removeItem('is_browser_weChat')
                localStorage.setItem('isFlyBook', 1)
                localStorage.setItem('is_browser', 1)
                localStorage.setItem('is_browser_fly', 1)
              } else if (origin === 'weChatEnterprise') {
                localStorage.removeItem('isWeiXin')
                localStorage.removeItem('isFlyBook')
                localStorage.removeItem('is_browser_fly')

                localStorage.setItem('isWeChat', 1)

                localStorage.setItem('is_browser', 1)
                localStorage.setItem('is_browser_weChat', 1)
              } else {
                if (
                  chooseBrand[0].architectureMode === 3 ||
                  chooseBrand[0].architectureMode === 4
                ) {
                  localStorage.setItem('isWeChat', 1)
                  localStorage.removeItem('isFlyBook')
                  localStorage.removeItem('isWeiXin')
                } else if (chooseBrand[0].architectureMode === 5) {
                  localStorage.setItem('isWeiXin', 1)
                  localStorage.removeItem('isWeChat')
                  localStorage.removeItem('isFlyBook')
                } else {
                  localStorage.setItem('isFlyBook', 1)
                  localStorage.removeItem('isWeChat')
                  localStorage.removeItem('isWeiXin')
                }
              }
              localStorage.setItem('userName', data.userBrandName || '')
              localStorage.setItem('brandInfo', JSON.stringify(chooseBrand[0]))
              localStorage.setItem('brandViewMode', chooseBrand[0].brandViewMode || 1)
              localStorage.setItem('systemVersion', data.systemVersion || 3)
              store.commit('user/setBrandViewMode', chooseBrand[0].brandViewMode || 1)
              store.commit('user/setSystemVersion', data.systemVersion || 3)
              store.commit('user/setIsInitPwd', data.isInitPwd || 0)
              store.commit('user/setCanEditThirdPartyStaffId', data.canEditThirdPartyStaffId)
              // 海尔登录的是要隐藏菜单
              if (judgeHWork()) {
                store.commit('page/setisHideLeftMenu', true)
                store.commit('page/setisHideTopMenu', true)
              }
              getUpgradeInfo()
              initFontFun()
              getKOCInfo()
              getUserRoleInfo()
              // 等业务主体类型获取完成后再加载页面，防止筛选项里丢失组织架构
              getBusinessEntity().then(() => {
                if (origin && origin === 'page_header') {
                  resolve({
                    brandName: data.brandName || '-',
                    brandId: data.brandId,
                    userName: data.userBrandName || '-'
                  })
                } else if (origin && origin === 'refresh') {
                  resolve(data)
                } else if (origin && origin === 'hwork') {
                  // 海尔从哪个页面走的登录 登录成功之后要跳转到那个页面
                  getRoute(false, true, false, data.brandId, false, pathObj)
                  resolve()
                } else {
                  getRoute()
                  resolve()
                }
              })
            } else {
              ElMessage.error('查询不到该品牌的信息，请联系管理员')
              reject(new Error())
            }
          } else {
            // 海尔登录的如果提示这个，就直接清空token
            if (judgeHWork()) {
              localStorage.removeItem('hTime')
              localStorage.removeItem('token')
            }
            ElMessage.error('该账号未开通权限，请联系管理员')
            reject(new Error())
          }
        } else {
          reject(new Error())
        }
      })
      .catch(err => {
        console.log('获取个人信息失败', err)
        reject(err)
      })
  })
}
/**
 * @description 海尔的登录接口
 * @returns
 */
export function loginByHWorkFun(pathObj) {
  return new Promise((resolve, reject) => {
    loginByHaier({
      loginType: 1,
      hworkToken: localStorage.getItem('hToken')
    })
      .then(res => {
        console.log('海尔登录结果1', res)
        if (res.code === 0) {
          loginAfterFun(res.data, 'hwork', pathObj)
            .then(loginRes => {
              resolve(loginRes)
            })
            .catch(loginErr => {
              reject(loginErr)
            })
        } else {
          reject(new Error())
        }
      })
      .catch(err => {
        console.log('海尔登录结果2', err)
        reject(err)
      })
  })
}

// 获取字体文件并加载
// 字体的fontfmaily增加xm 是因为封面制作那保存为图片的时候，如果是数字开头，保存会失效
export function initFontFun() {
  getFontList({
    pageNo: 1,
    pageSize: 1000
  }).then(res => {
    if (res.code === 0 && res.data.records && res.data.records.length > 0) {
      ;(res.data.records || []).forEach(x => {
        loadFontFun(x.fontUrl, 'xm' + x.fontKey)
      })
    }
  })
}

// 获取品牌KOC定制小程序
export function getKOCInfo() {
  getBrandKOCMinigram().then(res => {
    if (res.code === 0) {
      if (isNotEmpty(res.data)) {
        store.commit('app/setKOCInfo', {
          hasKOC: true,
          isValid: res.data.isValid,
          invalidType: res.data.invalidType
        })
      } else {
        store.commit('app/setKOCInfo', {
          hasKOC: false,
          isValid: 0,
          invalidType: 0
        })
      }
    }
  })
}

// 获取用户角色信息
export function getUserRoleInfo() {
  getUserBrandInfo({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : '',
    userId: localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo')).userId
      : ''
  }).then(res => {
    if (res.code === 0) {
      store.commit('user/setIsAdmin', res?.data?.userIsAdminRole === 1)
    }
  })
}

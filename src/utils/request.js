import axios from 'axios'
import store from '@/store'
import { ElMessage } from 'element-plus'
import { judgeOEA, judgeHWork } from '@/utils/OEA.js'

const baseURL = import.meta.env.VITE_BASE_URL
const service = axios.create({
  baseURL: baseURL,
  timeout: 180000,
  headers: {
    'Cache-Control': 'no-cache'
  }
})
service.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

const pending = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const whiteList = [
  '/mission/operationalAnalysis/coreTargets',
  '/v1/brand/app/appAttachment/saveOrUpdateAttachment',
  '/v1/system/account/buriedPoint/add',
  '/cgp/web/oss/ali/getSts',
  '/cgp/web/media/material/v2/upload',
  '/cgp/web/media/creation/v2/upload',
  '/cgp/web/dict/findChildrenByKey',
  '/mission/operationalAnalysis/organizationalStructureInfo',
  '/v1/system/account/business/principalList',
  '/v1/sumvideo/sv/pipeline/script/saveScriptClip',
  '/v1/sumvideo/sv/pipeline/script/removeScriptClip',
  '/v1/system/account/role/selectRoleList',
  '/cgp/web/media/material/tag/list',
  '/v1/sumvideo/sv/pipeline/image/getImageTextPipelineDetail',
  '/v1/sumvideo/sv/pipeline/image/saveImagePipelineConfig',
  '/v1/system/account/auth/wxMcn/listWxMcnAuths',
  '/v1/system/account/auth/wxMcn/getBrandDefaultMcnConfigV2',
  '/mission/audit/video/getAuditTaskUser'
] // 不取消的接口list

// 不走全局默认错误提示接口
const notShowErrorMessageList = [
  '/mission/task/newTask',
  '/mission/task/updateTask',
  '/cgp/web/account/liveRecordControl',
  '/v1/system/account/dept/deleteDeptRelation',
  '/cgp/web/account/extraDyInfoPullControl',
  '/v1/system/account/auth/accountDyWebAuthLink'
]

const CancelToken = axios.CancelToken
// 拼接ajax唯一标识
const splicFlag = config => {
  const _paramStr = JSON.stringify(config.data)
  return `${config.url}&${config.method}&${_paramStr}`
}
const removePending = ever => {
  for (const p in pending) {
    if (pending[p].u === splicFlag(ever)) {
      // 当当前请求在数组中存在时执行函数体
      pending[p].f() // 执行取消操作
      pending.splice(p, 1) // 把这条记录从数组中移除
    }
  }
}
// 请求前的统一处理
service.interceptors.request.use(
  config => {
    config.headers.brandId = localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : 13
    // token处理
    if (localStorage.getItem('token')) {
      config.headers.token = localStorage.getItem('token')
      const brandInfo = localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo'))
        : null
      brandInfo && (config.headers.brandId = brandInfo.brandId)
      const userId = localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null
      userId && (config.headers.userId = userId.userId)
    }
    // 白名单内的接口可重复请求
    if (whiteList.indexOf(config.url) === -1) {
      removePending(config) // 在一个ajax发送前执行一下取消操作
      config.cancelToken = new CancelToken(c => {
        // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
        pending.push({ u: splicFlag(config), f: c })
        // console.log([...pending])
      })
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    // const res = {
    //   success: false,
    //   code: 1,
    //   msg: '错误信息:矩阵号直播录制余额已不足，请充值后再开启录制,【 错误码 11475528 】',
    //   requestID: '7761a6ba4149410daa09321408be575c'
    // }
    // console.log('response:', response)
    // content-type !== application/json时 不限制code值并返回原始数据
    if (!res.code && response.headers['content-type'] !== 'application/json') {
      return response
    } else if (res.code === 0) {
      return res
    } else {
      if (!notShowErrorMessageList.includes(response.config.url)) {
        showError(res, false)
      }
      return Promise.reject(res)
    }
  },
  error => {
    const badMessage = error.message || error
    const code = parseInt(
      badMessage.toString().replace('Error: Request failed with status code ', '')
    )
    console.log(error, code, '请求错误码he error')
    error.toString() !== 'Cancel' && showError({ code, message: badMessage }, true)
    return Promise.reject(error)
  }
)
// token过期和登录码失效的操作
function errAction(msg) {
  // to re-login
  if (localStorage.getItem('is_browser') === '1') {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('brandInfo')
    localStorage.removeItem('userName')
    if (
      localStorage.getItem('is_browser_fly') === '1' ||
      localStorage.getItem('isFlyBook') === '1'
    ) {
      location.href = location.origin + '/api/v1/system/account/oauth/render/feishu?loginType=1'
    } else if (
      localStorage.getItem('is_browser_weChat') === '1' ||
      localStorage.getItem('isWeChat') === '1'
    ) {
      location.href =
        location.origin + '/api/v1/system/account/oauth/render/weChatEnterprise?loginType=1'
    } else {
      store.dispatch('user/loginOut', { exit: true })
    }
  } else {
    console.log('登录过期', '是否是每平每屋', judgeOEA(), '是否是海尔', judgeHWork())
    // 如果是OEA 登录过期，需要通知父级走免登逻辑
    if (judgeOEA()) {
      console.log('OEA-免登发送消息:', location.href)
      window.parent.postMessage(
        {
          metaData: {
            event: 'needLogin'
          },
          data: {
            url: location.href
          }
        },
        '*'
      )
    } else if (judgeHWork()) {
      console.log('海尔登录过期')
      localStorage.removeItem('token')
      location.href =
        location.origin +
        '/loginTip?type=2&envSource=' +
        (localStorage.getItem('envSource') || 'hwork') +
        '&tip=' +
        encodeURIComponent(msg)
    } else {
      // 退出登录的接口需要token，没有token就会走到403又触发一次该方法，所以没有Token 直接页面刷新
      if (localStorage.getItem('token')) {
        store.dispatch('user/loginOut', { exit: true })
      } else {
        location.reload()
      }
    }
  }
}
// 错误处理
function showError(error, networkErr) {
  console.log(error, 'error')
  console.log(networkErr, 'networkErr')
  // token过期，清除本地数据，并跳转至登录页面
  if (
    error.code === 403 ||
    error.code === 200002 ||
    (error.msg && error.msg.indexOf('Token无效') > -1)
  ) {
    if (error.code === 200002 || (error.msg && error.msg.indexOf('Token无效') > -1)) {
      ElMessage({
        message: error.msg || error.message || '系统繁忙',
        type: 'error',
        duration: 3 * 1000
      })
      setTimeout(() => {
        errAction(`【${error.code}】${error.msg || '系统繁忙'}`)
      }, 1000)
    } else {
      errAction(`【${error.code}】${error.msg || '系统繁忙'}`)
    }
  } else {
    if (networkErr) {
      ElMessage({
        message: '网络请求失败，请检查网络连接后重试',
        type: 'error',
        duration: 3 * 1000
      })
    } else {
      if (error.msg || error.message) {
        ElMessage({
          message: error.msg || error.message,
          type: 'error',
          duration: 3 * 1000
        })
      }
    }
  }
}

export default service

import axios from 'axios'
import router from '../router'
import { Message } from 'element-ui'
import Store from 'electron-store'

const store = new Store();
const baseURL = process.env.VUE_APP_BASE_API
const service = axios.create({
  // 设置超时时间
  // timeout: 30000,
  baseURL: baseURL,
  headers: {
    'Cache-Control': 'no-cache'
  }
})
service.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

const pending = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const whiteList = ['/sv/material/upload'] // 不取消的接口list
const CancelToken = axios.CancelToken
const removePending = ever => {
  for (const p in pending) {
    if (pending[p].u === ever.url + '&' + ever.method) {
      // 当当前请求在数组中存在时执行函数体
      pending[p].f() // 执行取消操作
      pending.splice(p, 1) // 把这条记录从数组中移除
    }
  }
}

/**
 * 请求前拦截
 * 用于处理需要在请求前的操作
 */
let isLogin = false
service.interceptors.request.use(
  (config) => {
    isLogin = config.isLogin
    // localStorage.getItem('USERTOKEN')
    let token = store.get('USERTOKEN');
    if (token) {
      config.headers.token = token
    }
    // 白名单内的接口可重复请求
    if (whiteList.indexOf(config.url) === -1) {
      removePending(config) // 在一个ajax发送前执行一下取消操作
      config.cancelToken = new CancelToken(c => {
        // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
        pending.push({ u: config.url + '&' + config.method, f: c })
        // console.log([...pending])
      })
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
/**
 * 请求响应拦截
 * 用于处理需要在请求返回后的操作
 */
service.interceptors.response.use(
  (response) => {
    removePending(response.config) //在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    // console.log(response)
    const responseCode = response.status
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    // 否则的话抛出错误
    let code = response.data ? response.data.code : null
    switch (responseCode) {
      case 201:
        if (router.currentRoute.path === '/login') return
        // 清除token
        router.push({
          path: '/login',
          query: {
            redirect: router.currentRoute.fullPath
          }
        })
        break
      // 401：未登录
      case 401:
      // 403: token过期
      // eslint-disable-next-line no-fallthrough
      case 403:
        if (router.currentRoute.path === '/login') return
        // 清除token
        router.push({
          path: '/login',
          query: {
            redirect: router.currentRoute.fullPath
          }
        })
        break
    }
    if (code === 0) {
      return Promise.resolve(response.data || {})
    } else if(code === 201){
      // 清除token
      store.delete('USERTOKEN')
      router.push({
        path: '/login',
        query: {
          redirect: router.currentRoute.fullPath
        }
      })
    }else if(isLogin){
      return Promise.reject(response.data || {})
    }else {
      Message({
          message: response.data.msg,
          type: 'error',
          duration: 3000
      })
      return Promise.reject(response.data || {})
    }
  },
  (error) => {
    if(!error.message){
      return
    }
    // 服务器返回不是 2 开头的情况，会进入这个回调
    // 可以根据后端返回的状态码进行不同的操作
    const responseCode = error.response ? error.response.status : ''
    switch (responseCode) {
      // 401：未登录
      case 401:
        // 跳转登录页
        router.replace({
          path: '/login',
          query: {
            redirect: router.currentRoute.fullPath
          }
        })
        break
      // 403: token过期
      case 403:
        // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
        store.delete('USERTOKEN')
        setTimeout(() => {
          router.replace({
            path: '/login',
            query: {
              redirect: router.currentRoute.fullPath
            }
          })
        }, 1000)
        break
      // 404请求不存在
      case 404:
        // errorMsg('网络请求不存在')
        Message({
          message: '网络请求不存在',
          type: 'error',
          duration: 3000
        })
        break
      // 其他错误，直接抛出错误提示
      default:
        Message({
          message: error.data || error,
          type: 'error',
          duration: 3000
        })
        // error.response && errorMsg(error.response.data.message)
    }
    return Promise.reject(error.data || error)
  }
)

//图片上传
export const uploadFile = (formData) => {
  const res = service.request({
    method: 'post',
    url: '/utils/upload/img',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res
}
export default service

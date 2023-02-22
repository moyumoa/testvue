import service from '@/libs/request'

export default {
  // 登录
  loginAccount: (param) => {
    return service.post('/system/account/loginByPhone', param,{isLogin: true})
  },
  // 获取验证码
  getCode: (param) => {
    return service.post('/system/account/sendCheckCode', param,{isLogin: true})
  },
  // 验证码登录
  codeLogin: (param) => {
    return service.post('/system/account/loginByPhone', param,{isLogin: true})
  },
}
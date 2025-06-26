import service from '@/libs/request'

export default {
  // 登录
  getSts: (param) => {
    return service.post('/cgp/web/oss/ali/getSts', param)
  },
  listTagFolder:(param) => {
    return service.post('/cgp/web/media/tag/listTagFolder',param)
  }
}
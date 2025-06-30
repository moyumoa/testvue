import service from '@/libs/request'

export default {
  // 登录
  getSts: (param) => {
    return service.post('/cgp/web/oss/ali/getSts', param)
  },
  listTagFolder:(param) => {
    return service.post('/cgp/web/media/tag/listTagFolder',param)
  },
   // 初始化生成客户端上传任务，返回任务id
  initUploadTask:(param) => {
    return service.post('/cgp/web/material/uploadtask/initUploadTask',param)
  },
  // 上传任务关联子任务
  addAssociatedSubTask:(param) => {
    return service.post('/cgp/web/material/uploadtask/addAssociatedSubTask',param)
  },
  // 获取子任务状态
  getSubtaskStatus:(param) => {
    return service.post('/cgp/web/material/uploadtask/getSubtaskStatus',param)
  }
}
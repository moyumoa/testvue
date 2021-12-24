import service from '@/libs/request'

export default {
  // 流水线列表
  getPipelineList: (param) => {
    return service.post('/sumvideo/sv/pipeline/list', param)
  },
  // 新增创意
  addCreate: (param) => {
    return service.post('/sumvideo/sv/factory/create', param)
  },
  // 检测创意是否存在
  checkCreate: (param) => {
    return service.post('/sumvideo/sv/factory/check', param)
  },
  // 删除创意
  delCreate: (param) => {
    return service.get(`/sumvideo/sv/factory/delete?id=${param}`)
  },
  // 删除创意
  uploadFile: (param) => {
    return service.post('/sumvideo/sv/material/upload', param)
  },
  // 查询流水线的上传素材
  getPipelineCreate: (param) => {
    return service.get(`/sumvideo/sv/factory/path?pipelineId=${param}`)
  },
}
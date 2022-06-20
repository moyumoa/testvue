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
  // 上传创意
  uploadFile: (param) => {
    return service.post('/sumvideo/sv/material/upload', param)
  },
  // 查询流水线的上传素材
  getPipelineCreate: (param) => {
    return service.get(`/sumvideo/sv/factory/path?pipelineId=${param}`)
  },
  // 获取品牌列表
  getBrandList: (param) => {
    return service.get('/sumvideo/sv/sys/list/brand',param)
  },
  // 获取品牌信息
  selectBrand: (param) => {
    return service.post('/system/account/selectBrand',param)
  },
  // 判断上传文件完成之后调用
  isFiniteAdd: (param) => {
    return service.post('/sumvideo/sv/creative/addCreative',param)
  },
  // 判断上传文件完成之后调用（websdk逻辑）
  isFiniteWebsdkAdd: (param) => {
    return service.post('/sumvideo/sv/creative/addJyWebsdkCreative',param)
  },
}
import request from '@/utils/request'

// 意向用户列表
export const getCustomList = data => {
  return request.post(`/scrm/client/list`, data)
}

// 意向客户详情
export const getCustomDetail = data => {
  return request.post(`/scrm/client/detail`, data)
}
// 意向客户详情基础信息修改
export const updateCustomDetail = data => {
  return request.post(`/scrm/client/base/edit`, data)
}

export const customExportExcel = data => {
  return request.post(`/scrm/client/list/export`, data, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    responseType: 'arraybuffer'
  })
}

// 意向客户详情导出
export const customExportExcelV2 = data => {
  return request.post(`/scrm/client/list/exportV2`, data)
}
// 获取留资项目
export const getCustomerSetting = data => {
  return request.post(`/scrm/setting/clueDispatch`, data)
}
// 设置留资项目
export const setClueDispatch = data => {
  return request.post(`/scrm/setting/clueDispatch/set`, data)
}
// 分配
export const userDispatch = data => {
  return request.post(`/scrm/client/user/dispatch`, data)
}
// 批量分配给目标客户，返回值为 0 表示全部成功，大于 0 表示失败数量
export const userBatchDispatch = data => {
  return request.post(`/scrm/client/user/dispatch/batch`, data)
}
// 一键开启
export const oneKeyOpen = data => {
  return request.post(`/scrm/account/interaction/strategy/oneKeyOpen`, data)
}

// 客户功能设置
export const customerSetting = data => {
  return request.post(`/scrm/account/interaction/strategy/oneKeyOpen`, data)
}

// 客户管理-潜客管理-下载关键词模板
export const resourceTemplate = data => {
  return request({
    url: '/scrm/resource/template/关键词批量上传.xlsx',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}

// 获取评论
export const getComment = data => {
  return request.post(`/scrm/videoComment/getComment`, data)
}

// 添加评论
export const replyComment = data => {
  return request.post(`/scrm/videoComment/replyComment`, data)
}

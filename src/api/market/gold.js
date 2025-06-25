import request from '@/utils/request'

// 下面是金币商城订单部分接口
// 金币分页明细
export const getListByPage = data => {
  return request.post(`/mission/gold/change/detail/listByPage`, data)
}

// 下面是商城订单部分接口
// 金币商城订单记录分页查询
export const getOrderList = data => {
  return request.post(`/mission/gold/exchange/record/listByPage`, data)
}

// 金币商城订单 批量导入时的导出模板接口
export const getExportDataBatchAdd = data => {
  return request({
    url: '/mission/gold/exchange/record/exportByForm',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}
export const getExportData = data => {
  return request.post(`/mission/gold/exchange/record/exportByFormV2`, data)
  // return request({
  //   url: '/mission/gold/exchange/record/exportByFormV2',
  //   method: 'POST',
  //   data: data,
  //   responseType: 'arraybuffer'
  // })
}
// 修改物流信息
export const modifyTrackingInfo = data => {
  return request.post(`/mission/gold/exchange/record/modifyTrackingInfo`, data)
}

// 虚拟商品核销状态
export const writeOffOrder = data => {
  return request.post(`/mission/gold/exchange/record/writeOff`, data)
}

// 获取金币类型列表
export const goldTypeList = data => {
  return request.post(`/mission/gold-type/goldList`, data)
}

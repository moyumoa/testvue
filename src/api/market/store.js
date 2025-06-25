import request from '@/utils/request'

// 修改门店标识
export const changeDepartmentStoreMark = data => {
  return request.post(`/v1/system/account/dept/changeDepartmentStoreMark`, data)
}

// 门店列表
export const getStoreList = data => {
  return request.post(`/v1/system/account/dept/storeList`, data)
}

// POI导出模板
export const exportPoITemplate = data => {
  return request({
    url: '/v1/system/account/dept/exportStorePoiTemplate',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}
// 设置门店位置
export const setStorePOI = data => {
  return request.post(`/v1/system/account/dept/setStorePoi`, data)
}

// POI 导出门店
export const batchExportPOI = data => {
  return request.post(`/v1/system/account/dept/exportStoreListV2`, data)
}
// 获取已经设置门店poi的列表
export const getPOIListById = data => {
  return request.post(`/v1/system/account/dept/storePoiListByStoreId`, data)
}

// 导入地址
export const uploadPOIUrl = '/api/v1/system/account/dept/importStorePoi'

// 门店列表--矩阵号管理-发布视频用到
export const listPoi = data => {
  return request.post(`/v1/system/account/dept/listPoi`, data)
}
// POI位置
export const poiLocation = data => {
  return request.post(`/mission/miniApp/poi/location`, data)
}
// 小红书POI位置
export const xhsLocation = data => {
  return request.post(`/mission/miniApp/poi/xhsLocation`, data)
}

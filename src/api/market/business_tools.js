import request from '@/utils/request'

// 分页查询留资商品列表
export const getListAppointmentByPage = data => {
  return request.post(`/mission/appointment/listAppointmentByPage`, data)
}

// 更新当前活动的状态
export const updateAppointmentStatus = data => {
  return request.post(`/mission/appointment/updateAppointmentStatus`, data)
}

// 跟新或保存活动
export const saveOrUpdateAppointment = data => {
  return request.post(`/mission/appointment/saveOrUpdateAppointment`, data)
}

// 删除活动
export const deleteAppointmentById = id => {
  return request.post(`/mission/appointment/deleteAppointmentById?activityId=${id}`)
}

// 根据留资活动 id 查询活动详情信息
export const getAppointmentInfoById = id => {
  return request.get(`/mission/appointment/getAppointmentInfoById?activityId=${id}`)
}

// 根据品牌号拉取留资配置
export const getListAppointmentConfig = data => {
  return request.post(`/mission/appointmentConfig/listAppointmentConfig`, data)
}

// 保存/更新留资配置
export const saveOrUpdateAppointmentConfig = data => {
  return request.post(`/mission/appointmentConfig/saveOrUpdateAppointmentConfig`, data)
}

// 获取行政区划
export const getAdministrativeZoning = data => {
  return request.post(`/mission/administrativeZoning/getAdministrativeZoning`, data)
}

// 获取留资订单列表 (留资线索)
export const getListAppointmentOrderByPage = data => {
  return request.post(`/mission/appointment/listAppointmentOrderByPage`, data)
}

// 根据订单 id 查询留资订单详情
export const getAppointmentOrderDetail = id => {
  return request.post(`/mission/appointment/appointmentOrderDetail?orderId=${id}`)
}

// 根据条件导出留资订单
export const exportAppointmentOrderList = data => {
  return request({
    url: '/mission/appointment/exportAppointmentOrderList',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}
// 下载中心 根据条件导出留资订单
export const exportAppointmentOrderListV2 = data => {
  return request.post(`/mission/appointment/exportAppointmentOrderListV2`, data)
}

// 直播传送门列表
export const getLivePoartalList = data => {
  return request.post('/mission/portal/list', data)
}
// 直播传送门详情
export const getLivePoartalDetail = data => {
  return request.post('/mission/portal/info', data)
}
// 更新/新建直播传送门
export const updateLivePoartal = data => {
  return request.post('/mission/portal/add', data)
}
// 删除直播传送门
export const delLivePoartal = data => {
  return request.post('/mission/portal/delete', data)
}
// 通过uid获取抖音账号信息
export const getUIDInfo = uid => {
  return request.post('/mission/portal/uidInfo', { uid })
}

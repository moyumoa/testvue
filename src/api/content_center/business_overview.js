import request from '@/utils/request'

//  账号视角-经营概览-实时数据
export function accountViewData(data) {
  return request.post(`/cgp/web/xuser/accountViewData`, data)
}

//  成员视角-经营概览-实时数据
export function userViewData(data) {
  return request.post(`/cgp/web/xuser/userViewData`, data)
}

//  业务主体视角-经营概览-实时数据
export function principalViewData(data) {
  return request.post(`/cgp/web/xuser/principalViewData`, data)
}

// 账号视角-数据总览-获取折线图 柱状图数据
export function accountViewTrends(data) {
  return request.post(`/cgp/web/xuser/accountViewTrends`, data)
}

// 账号视角-数据总览-获取折线图 柱状图数据
export function userViewTrends(data) {
  return request.post(`/cgp/web/xuser/userViewTrends`, data)
}

// 账号视角-数据总览-获取折线图 柱状图数据
export function principalViewTrends(data) {
  return request.post(`/cgp/web/xuser/principalViewTrends`, data)
}

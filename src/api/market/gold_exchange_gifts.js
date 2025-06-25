import request from '@/utils/request'

// 金币换礼-获取是否开启无库存自动下架
export const getByKey = data => {
  return request.post(`/mission/sys/config/getByKey?configKey=auto_withdraw_when_empty_stock`, data)
}
export const getByKeyLimit = data => {
  return request.post(`/mission/sys/config/getByKey?configKey=global_exchange_limit_config`, data)
}
// 金币换礼-更新无库存自动下架
export const updateConfig = data => {
  return request.post(`/mission/sys/config/updateConfig`, data)
}

// 金币换礼-列表
export const listByPage = data => {
  return request.post(`/mission/gold/goods/listByPage`, data)
}
// 金币换礼-删除商品
export const deleteGood = data => {
  return request.post(`/mission/gold/goods/delete${data.query}`)
}
// 金币换礼-新建商品
export const saveGood = data => {
  return request.post(`/mission/gold/goods/save`, data)
}

// 金币换礼-编辑商品
export const updateGood = data => {
  return request.post(`/mission/gold/goods/update`, data)
}
// 金币换礼-更新商品权重和开启状态
export const updateWeightAndStatus = data => {
  return request.post(`/mission/gold/goods/updateWeightAndStatus`, data)
}

// 获取金币列表
export const getGoldList = data => {
  return request.post(`/mission/gold-type/goldList`, data)
}

// 删除金币类
export const deleteGold = data => {
  return request.post(`/mission/gold-type/delete`, data)
}

// 添加金币类型
export const addGold = data => {
  return request.post(`/mission/gold-type/save`, data)
}

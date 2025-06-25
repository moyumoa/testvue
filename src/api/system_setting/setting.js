import request from '@/utils/request'

// 获取品牌账号等级规则列表
export function getGradeRules(data) {
  return request.post(`/v1/system/account/gradeRule/getGradeRules`, data)
}
// 保存更新等级的规则
export function saveGradeRules(data) {
  return request.post(`/v1/system/account/gradeRule/saveGradeRules`, data)
}
// 获取规则配置
export function getGradeRuleConfig(data) {
  return request.post(`/v1/system/account/gradeRule/getGradeRuleConfig`, data)
}

// 设置矩阵号授权规则
export function updateBrandConfig(data) {
  return request.post(`/v1/system/account/brand/updateBrandConfig`, data)
}

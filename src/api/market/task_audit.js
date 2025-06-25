import request from '@/utils/request'
// 获取审核列表
export const getAuditDetail = data => {
  return request.post(`/mission/audit/video/getAuditVideoList`, data)
}
// 审核接口
export const updateAuditInfo = data => {
  return request.post(`/mission/audit/video/auditVideoBatch`, data)
}

// 根据审核id获取任务详情
export const getAuditTaskDetail = data => {
  return request.post(`/mission/audit/video/getAuditTaskDetail`, data)
}

// 根据审核id获取视频详情
export const getAuditVideoDetail = data => {
  return request.post(`/mission/audit/video/getAuditVideoDetail`, data)
}

// 判断是否有审核节点
export const isHaveAuditNode = data => {
  return request.post('/mission/audit/video/isHaveAuditNode', data)
}

// 素材详情
export const getMaterialInfo = data => {
  return request.post('/mission/audit/video/getAuditCollectDetail', data)
}
// 素材分镜数，可替换分镜数
export const getCreativeReplaceCnt = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/getCreativeReplaceCnt', data)
}

// KOS视频审核记录列表
export const listAuditRecord = data => {
  return request.post('/mission/audit/record/listAuditRecord', data)
}

// KOS获取视频审核详情
export const getKOSAuditDetail = data => {
  return request.post('/mission/audit/record/getAuditDetail', data)
}

// KOS人工审核
export const doAudit = data => {
  return request.post('/mission/audit/record/doAudit', data)
}

// KOS获取审核记录
export const listAuditDetailRecord = data => {
  return request.post('/mission/audit/record/listAuditDetailRecord', data)
}

// 获取下一个审核详情
export const getNextAuditDetail = data => {
  return request.post('/mission/audit/record/getNextAuditDetail', data)
}


import request from '@/utils/request'

// 根据创意id查询创意素材
export const getStructureDetail = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/getCreativeRplaceByCreativeId', data)
}
// 获取分镜规则 分页
export const getStructureDetailByPage = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/getCreativeRplaceByCreativeIdPage', data)
}
// 修改备注
export const modifyRelationInfo = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/modifyRemark', data)
}
// 修改名字
export const modifyReplaceName = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/modifyReplaceName', data)
}
// 修改分镜脚本字段
export const modifyScript = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/modifyScript', data)
}
// 替换
export const updateStrRelOvwStu = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/replace', data)
}
// 新增创意
export const addEditingProject = data => {
  return request.post('/v1/sumvideo/sv/editing/project/addEditingProject', data)
}
// 模板转换为创意
export const templateToProject = data => {
  return request.post('/v1/sumvideo/sv/creative/templateToProject', data)
}

// 获取分镜规则
export const getCreativeRplaceById = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/getCreativeRplaceById', data)
}

// 设置模板分镜规则
export const setReplaceRule = data => {
  return request.post('/v1/sumvideo/sv/creativeReplace/setReplaceRule', data)
}
// 字幕的---字体列表
export const getFontList = data => {
  return request.post('/v1/sumvideo/sv/overprint/fontList', data)
}

// 查询降重策略信息
export const getStrategyConfigByCreativeId = data => {
  return request.post('/v1/sumvideo/sv/creative/getStrategyConfigByCreativeId', data)
}
// 修改降重策略信息
export const updateStrategyConfig = data => {
  return request.post('/v1/sumvideo/sv/creative/updateStrategyConfig', data)
}

// 获取分镜（组）列表
export const listGroupClip = data => {
  return request.post('/v1/sumvideo/sv/creative/group/listGroupClip', data)
}
// 分镜绑定到分镜组
export const bindClipGroup = data => {
  return request.post('/v1/sumvideo/sv/creative/group/bindClipGroup', data)
}
// 取消分镜组绑定
export const cancelBindClipGroup = data => {
  return request.post('/v1/sumvideo/sv/creative/group/cancelBindClipGroup', data)
}
// 修改分组信息
export const updateCreativeGroup = data => {
  return request.post('/v1/sumvideo/sv/creative/group/updateCreativeGroup', data)
}
// 调整分组顺序
export const updateGroupOrder = data => {
  return request.post('/v1/sumvideo/sv/creative/group/updateGroupOrder', data)
}
// 分组添加分镜
export const addGroupClip = data => {
  return request.post('/v1/sumvideo/sv/creative/group/addGroupClip', data)
}
// 是否显示分组内的非替换项分镜
export const noReplaceClipSwitch = data => {
  return request.post('/v1/sumvideo/sv/creative/noReplaceClipSwitch', data)
}

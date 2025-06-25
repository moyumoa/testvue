import request from '@/utils/request'

// 任务详情-视频/直播任务-参与明细
export const getVideoTaskJoinList = data => {
  return request.post(`/mission/task/videoTaskJoinList`, data)
}
// 任务详情-视频任务-视频列表
export const getDetailVideoList = data => {
  return request.post(`/mission/task/detailVideoList`, data)
}
// 任务详情-视频任务-视频更新记录列表
export const getVideoList = data => {
  return request.post(`/mission/task/videoUpdateLogList`, data)
}
// 任务详情-数据分析-顶部数据
export const getTopDataAnalysis = data => {
  return request.post(`/mission/task/v2/topDataAnalysis`, data)
}
// 任务详情-直播任务-直播列表
export const getDetailLiveList = data => {
  return request.post(`/mission/task/detailLiveList`, data)
}
// 任务列表
export const getVTaskList = data => {
  return request.post(`/mission/task/list`, data)
}
// 开停止任务
export const setTask = data => {
  return request.post(`/mission/task/operate`, data)
}
// 删除任务
export const deleteTask = data => {
  return request.post(`/mission/task/delete`, data)
}
// 获取创建任务配置信息
export const getTaskConfig = data => {
  return request.post('/mission/task/initTask', data)
}
// 任务详情
export const getTaskInfo = data => {
  return request.post('/mission/task/getTaskInfoById', data)
}
// 创建任务
export const createNewTask = data => {
  return request.post('/mission/task/newTask', data)
}
// 编辑任务
export const updateTask = data => {
  return request.post('/mission/task/updateTask', data)
}
// 获取分发人员数量
export const getDelivernum = data => {
  return request.post('/mission/task/delivernum', data)
}
// 任务数据详情页的任务详情
export const getTaskInfoView = data => {
  return request.post('/mission/task/getTaskInfoViewById', data)
}
// 获取授权过抖音的用户
export const getAuthDyList = data => {
  return request.post('/mission/task/getAuthAccountByAccountName', data)
}
// 折线图
export const getDataAnalysisChart = data => {
  return request.post('/mission/task/v2/bottomDataAnalysisChart', data)
}
// 获取飞书通知人数
export const getNoticeNumOfTask = data => {
  return request.post('/mission/task/getNoticeNumOfTask', data)
}
// 飞书通知
export const sendLarkNoticeOfTask = data => {
  return request.post('/mission/task/sendLarkNoticeOfTask', data)
}
// 查询品牌小程序信息
export const getBrandAppInfo = data => {
  return request.post('/v1/brand/app/appInfo/getLoginBrandAppInfo', data)
}
// 查询品牌小程序 diyPage 分页列表
export const getDiyPageList = data => {
  return request.post('/v1/brand/app/appDiyPage/getDiyPageList', data)
}
// 查询公共小程序 diyPage 分页列表
export const getCommonDiyPageList = data => {
  return request.post('/v1/brand/app/appDiyPage/getCommonDiyPageList', data)
}
// 查询预约活动list
export const getAppointmentList = data => {
  return request.post('/mission/appointment/listAppointmentActivityBase', data)
}
// 分页获取转发视频列表(web)
export const getForwardVideoList = data => {
  return request.post('/mission/task/pageForwardVideoList', data)
}
// 获取标签名字列表(web)
export const getTagNameList = data => {
  return request.post('/mission/task/pageTagNameList', data)
}
// 获取任务数据权限列表
export const getOrgPermissionList = data => {
  return request.post('/mission/task/permissionOrgIds', data)
}
// 获取sumvideo流水线列表
export const getPipelineList = data => {
  return request.post('/v1/sumvideo/sv/pipeline/page', data)
}
// 根据流水线查询标签
export const getPipelineLabelList = data => {
  return request.post('/v1/sumvideo/sv/label/getPipelineLabelList', data)
}
// 任务详情-征集任务-素材列表
export const getCollectMaterialList = data => {
  return request.post('/mission/task/collectList', data)
}

// 任务列表-导出任务列表
export const exportTaskList = data => {
  return request.post('/mission/task/exportTaskV2', data)
  // return request({
  //   url: '/mission/task/exportTaskV2',
  //   method: 'POST',
  //   data: data,
  //   responseType: 'arraybuffer'
  // })
}
// 任务详情-导出参与明细
export const exportTaskJoinList = data => {
  return request.get('/mission/task/exportTaskJoinListV2' + data)
  //   return request({
  //     url: '/mission/task/exportTaskJoinListV2',
  //     method: 'POST',
  //     data: data,
  //     responseType: 'arraybuffer'
  //   })
}
// 任务详情-学习任务-作业列表
export const homeworkTaskUserList = data => {
  return request.post('/mission/task/homeworkTaskUserList', data)
}
// 任务详情-学习任务-点评
export const commentCourseTask = data => {
  return request.post('/mission/task/commentCourseTask', data)
}

// 任务详情-学习任务-用户的提交记录
export const getHomeWorkDetail = data => {
  return request.post('/mission/task/getHomeWorkDetail', data)
}

// 任务详情-转发视频-从创意模板选择：检查模板的数量，数量为0的警告一下
export const checkVideo = data => {
  return request.post('/mission/task/creative/tagvvcreation/check', data)
}

// 成长学院-作业列表
export const homeWorkCommentCenterList = data => {
  return request.post('/mission/homework/homeWorkCommentCenterList', data)
}

// 一键转发-计算限制转发数量后剩余可用数量
export const remainTemplateNum = data => {
  return request.post('/mission/miniApp/creative/tagvvcreation/remainTemplateNum', data)
}

// 抖音话题历史记录
export const listHistory = data => {
  return request.post('/mission/topic/history/listHistory', data)
}

// 搜索小红书话题
export const searchTopic = data => {
  return request.post('/cgp/web/mountHistory/searchMount', data)
}

// 搜索小红书用户
export const searchUser = data => {
  return request.post('/cgp/web/mountHistory/searchUser', data)
}

// 搜索抖音话题 全平台的
export const searchDyTopic = data => {
  return request.post('/cgp/web/mountHistory/searchDyMount', data)
}

// 搜索抖音用户 全平台的
export const searchDyUser = data => {
  return request.post('/cgp/web/mountHistory/searchDyUser', data)
}
// 多平台获取AI生成标题
export const miniTitleGenByPlatform = data => {
  return request.post('/v1/sumvideo/sv/ai/miniTitleGenByPlatform', data)
}

// 多平台获取AI生成标题 - 创建视频任务时使用
export const createAiTitle = data => {
  return request.post('/v1/sumvideo/sv/intelligent/createAiTitle', data)
}

import request from '@/utils/request'

export default {
  // 矩阵号列表
  getMatrixList: param => {
    return request.post(`/cgp/web/account/getUserList`, param)
  },
  // 批量标记品牌号
  editMatrixList: param => {
    return request.post(`/cgp/web/account/batchEditDyUserType`, param)
  },
  // 矩阵号信息
  getMatrixInfo: param => {
    return request.post(`/cgp/web/account/getDyAccountData`, param)
  },
  // 近三十天直播数据概览
  getliveOverviewMonth: param => {
    return request.post(`/cgp/web/liveroom/liveOverview`, param)
  },
  // 近三十天视频数据概览
  getVideoDataMonth: param => {
    return request.post(`/cgp/web/video/videoOverview`, param)
  },
  // 数据概览新增数据
  getDatAddDate: param => {
    return request.post(`/cgp/web/account/mewData`, param)
  },
  // 近10个视频作品数据概览
  getVideoContrast: param => {
    return request.post(`/cgp/web/video/videoContrast`, param)
  },
  // 直播分析 直播数据概览
  getLiveDateStat: param => {
    return request.post(`/cgp/web/liveroom/getLiveDateStat`, param)
  },
  // 直播分析 直播数据图表
  getLiveDateChart: param => {
    return request.post(`/cgp/web/liveroom/getLiveDateChart`, param)
  },
  // 直播分析 直播列表
  getLiveTableList: param => {
    return request.post(`cgp/web/liveroom/getRoomList`, param)
  },
  // 账号详情-视频分析-数据概览
  dyUserVideoData: param => {
    return request.post(`/cgp/web/account/dyUserVideoData`, param)
  },
  // 矩阵号分组
  // 矩阵号查询分组
  getGroupList: param => {
    return request.post(`/cgp/web/xUserGroup/listGroup`, param)
  },
  // 部门树结构查询--12.29不用了
  // getGroupTree: param => {
  //   return request.post(`/cgp/web/xUserGroup/getDepartmentTree`, param)
  // },
  // 矩阵账号列表查询
  getGroupTable: param => {
    return request.post(`/cgp/web/xUserGroup/listXUsers`, param)
  },

  // 获取新增分组的列表
  getNewGroupList: param => {
    return request.post(`/cgp/web/xUserGroup/list`, param)
  },
  // 删除对应新增的分组
  delNewGroupList: param => {
    return request.post(`/cgp/web/xUserGroup/delete`, param)
  },
  // 查询对应分组的详情
  getNewGroupDetail: param => {
    return request.post(`/cgp/web/xUserGroup/group/detail`, param)
  },
  // 保存新增分组
  saveNewGroup: param => {
    return request.post(`/cgp/web/xUserGroup/save`, param)
  },
  // 统计筛选出符合条件的矩阵号
  statisticalNum: param => {
    return request.post(`/cgp/web/account/group/module/dyName/check`, param)
  },
  // 统计筛选出符合条件的矩阵号
  checkGroup: param => {
    return request.post(`/cgp/web/account/group/module/check`, param)
  },
  // 加入分组
  joinGroup: param => {
    return request.post(`/cgp/web/account/group/join`, param)
  },
  // 直播小组分析
  getLiveGroupStatistics: param => {
    return request.post(`/cgp/web/liveroom/live/group/statistics`, param)
  },
  // 直播小组汇总统计
  getAllLiveGroupStatistics: param => {
    return request.post(`/cgp/web/liveroom/live/group/statistics/page`, param)
  },
  // 直播录屏开关
  liveRecordControl: param => {
    return request.post(`/cgp/web/account/liveRecordControl`, param)
  },
  // 抖音数据抓取开关
  liveCommentControl: param => {
    return request.post(`/cgp/web/account/extraDyInfoPullControl`, param)
  },
  // 矩阵号概览信息查询
  getAccountCountData: param => {
    return request.post(`/cgp/web/account/accountCountData`, param)
  },
  // 矩阵号等级分布
  getAccountGradeGroup: param => {
    return request.post(`/cgp/web/account/accountGradeGroup`, param)
  },
  // 矩阵号等级
  getGradeRuleByBrandId: param => {
    return request.post(`/v1/system/account/gradeRule/getGradeRuleByBrandId`, param)
  },
  // 添加矩阵号时候的搜索
  searchMar: param => {
    return request.post(`/cgp/web/account/getUserListByDyNickName`, param)
  },
  // 发布视频的相关接口：
  // 保存视频发布信息
  saveVideoPublishInfo: param => {
    return request.post(`/cgp/web/videoPublish/saveVideoPublishInfo`, param)
  },
  // 视频发布记录查询
  listSubmitedVideo: param => {
    return request.post(`/cgp/web/videoPublish/listSubmitedVideo`, param)
  }
}
// 分组模板下载列表
export const getExportData = data => {
  return request({
    url: '/cgp/web/xUserGroup/template/download',
    method: 'get',
    data: data,
    responseType: 'arraybuffer'
  })
}

// 下载导入模板
export const downloadTemplate = data => {
  return request({
    url: '/cgp/web/xUserGroup/template/xuser/download',
    method: 'get',
    data: data,
    responseType: 'arraybuffer'
  })
}

// 下载导入异常
export const downloadError = data => {
  return request({
    url: '/cgp/web/xUserGroup/xuser/download',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}
// 批量导入得URL
export const batchUploadUrl = '/api/cgp/web/xUserGroup/template/batch/upload'

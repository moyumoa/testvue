/*
 * @Author: Dong wen hao
 * @Date: 2021-12-30 09:46:05
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-06-06 11:08:04
 * @Description:任务相关字典
 */

import Dictionary from './Dictionary'

// 任务状态
const TASK_STATUS = new Dictionary()
TASK_STATUS.add(0, '', '未审核')
TASK_STATUS.add(1, '', '未开启') // 审核通过未开启
TASK_STATUS.add(2, '', '审核不通过')
TASK_STATUS.add(3, '', '未开始')
TASK_STATUS.add(4, '', '进行中')
TASK_STATUS.add(5, '', '已暂停')
TASK_STATUS.add(6, '', '已关闭')
TASK_STATUS.add(7, '', '已结束')

// 分发类型
const TASK_DELIVER_TYPE = new Dictionary()
TASK_DELIVER_TYPE.add(0, 'all', '全部分发')
TASK_DELIVER_TYPE.add(1, 'department', '部门分发')
TASK_DELIVER_TYPE.add(2, 'Talent', '外部达人')

// 任务类型
const TASK_TYPE = new Dictionary()
TASK_TYPE.add(1, 'video', '视频')
TASK_TYPE.add(2, 'live', '直播')
TASK_TYPE.add(3, 'collection', '征集')
TASK_TYPE.add(5, 'study', '学习')
TASK_TYPE.add(6, 'imgText', '图文')

// 任务审核方法
const TASK_AUDIT = new Dictionary()
TASK_AUDIT.add(0, 'none', '无需审核')
TASK_AUDIT.add(1, 'default', '默认审核')
TASK_AUDIT.add(2, 'multistage', '多级审核')

// 任务视频状态
const VIDEO_STATUS = new Dictionary()
VIDEO_STATUS.add(0, '', '发布中')
VIDEO_STATUS.add(1, '', '审核中')
VIDEO_STATUS.add(2, '', '已发布')
VIDEO_STATUS.add(3, '', '已删除')

// 任务视频审核状态
const VIDEO_AUDIT_STATUS = new Dictionary()
VIDEO_AUDIT_STATUS.add(0, '', '未审核')
VIDEO_AUDIT_STATUS.add(1, '', '审核通过')
VIDEO_AUDIT_STATUS.add(2, '', '审核不通过')

// 视频发布方式
const RELEASE_TYPE = new Dictionary()
RELEASE_TYPE.add(1, 'upload', '上传直接发布')
RELEASE_TYPE.add(2, 'shoot', '拍摄直接发布')
RELEASE_TYPE.add(3, 'sumvideo', '创意脚本')
RELEASE_TYPE.add(4, 'forward', '一键转发')

// 征集素材任务素材类型
const MATERIAL_TYPE = new Dictionary()
MATERIAL_TYPE.add(1, 'video', '视频')
MATERIAL_TYPE.add(2, 'audio', '音频')
MATERIAL_TYPE.add(3, 'text', '文本')
MATERIAL_TYPE.add(4, 'filter', '滤镜')
MATERIAL_TYPE.add(5, 'effect', '特效')
MATERIAL_TYPE.add(6, 'sticker', '贴纸')
MATERIAL_TYPE.add(7, 'transition', '转场')
MATERIAL_TYPE.add(8, 'image', '图片')

// 任务参与状态
const DELIVERY_STATUS = new Dictionary()
DELIVERY_STATUS.add(0, '', { label: '未参与', class: '' })
DELIVERY_STATUS.add(1, '', { label: '已参与', class: 'blue_circle' })
DELIVERY_STATUS.add(2, '', { label: '已完成', class: 'green_circle' })
// DELIVERY_STATUS.add(3, '', { label: '已过期', class: '' })
DELIVERY_STATUS.add(3, '', { label: '未参与', class: '' })

// 学习任务的学习形式
const STUDY_TYPE = new Dictionary()
STUDY_TYPE.add('1', '', '在线课程')
STUDY_TYPE.add('2', '', '线下课程')

// 学习任务的作业类型
const STUDY_JOB_TYPE = new Dictionary()
STUDY_JOB_TYPE.add('1', '', '视频作业')
STUDY_JOB_TYPE.add('2', '', '图文作业')

// 成长任务类型
const GROWTH_TASK_TYPE = new Dictionary()
GROWTH_TASK_TYPE.add(1, 'video', {
  label: '视频发布',
  icon: 'https://tagvv-1256030678.file.myqcloud.com/20220808vh9wq.png',
  mark: '发布视频'
})
GROWTH_TASK_TYPE.add(2, 'live', {
  label: '直播',
  icon: 'https://tagvv-1256030678.file.myqcloud.com/2022080825bo0.png',
  mark: '开始直播'
})
GROWTH_TASK_TYPE.add(5, 'study', {
  label: '学习',
  icon: 'https://tagvv-1256030678.file.myqcloud.com/20220808ucdjs.png',
  mark: '学习内容'
})

// 成长任务任务参与状态[成长任务和营销任务都用这个参与状态]
const GROWTH_DELIVERY_STATUS = new Dictionary()
GROWTH_DELIVERY_STATUS.add(0, '', { label: '未参与', class: '' })
GROWTH_DELIVERY_STATUS.add(1, '', { label: '已参与', class: 'blue_circle' })
GROWTH_DELIVERY_STATUS.add(2, '', { label: '参与成功', class: 'blue_circle' })
GROWTH_DELIVERY_STATUS.add(3, '', { label: '未参与', class: '' })
GROWTH_DELIVERY_STATUS.add(4, '', { label: '已完成', class: 'green_circle' })

export {
  TASK_STATUS,
  TASK_TYPE,
  TASK_DELIVER_TYPE,
  TASK_AUDIT,
  VIDEO_STATUS,
  VIDEO_AUDIT_STATUS,
  RELEASE_TYPE,
  MATERIAL_TYPE,
  DELIVERY_STATUS,
  STUDY_TYPE,
  STUDY_JOB_TYPE,
  GROWTH_TASK_TYPE,
  GROWTH_DELIVERY_STATUS
}

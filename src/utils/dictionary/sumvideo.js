import Dictionary from './Dictionary'

// 元素类型
const ELEMENT_TYPE = new Dictionary()
ELEMENT_TYPE.add(1, '', '视频')
ELEMENT_TYPE.add(2, '', '图片')
ELEMENT_TYPE.add(3, '', '音频')
ELEMENT_TYPE.add(4, '', '文本')

// 元素来源
const ELEMENT_ORIGIN = new Dictionary()
ELEMENT_ORIGIN.add(1, '', '营销任务上传')
ELEMENT_ORIGIN.add(2, '', '流水线上传')
ELEMENT_ORIGIN.add(7, '', '剪辑页上传')
ELEMENT_ORIGIN.add(3, '', '原料库上传')
ELEMENT_ORIGIN.add(6, '', '云原料')
ELEMENT_ORIGIN.add(10, '', '封面制作上传')
ELEMENT_ORIGIN.add(13, '', '智能拆解')
ELEMENT_ORIGIN.add(11, '', '模板式生成上传')
ELEMENT_ORIGIN.add(12, '', '剧本式生成上传')
ELEMENT_ORIGIN.add(14, '', '智能混剪上传')
ELEMENT_ORIGIN.add(30, '', '原料合并')
ELEMENT_ORIGIN.add(31, '', '原料拆分')

// 资源类型
const RESOURCE_TYPE = new Dictionary()
RESOURCE_TYPE.add(4, '', 'BGM')
RESOURCE_TYPE.add(5, '', '字体')
RESOURCE_TYPE.add(6, '', '字体')
RESOURCE_TYPE.add(2, '', '音效')
RESOURCE_TYPE.add(3, '', '贴纸')

// 资源来源
const RESOURCE_ORIGIN = new Dictionary()
RESOURCE_ORIGIN.add(5, '', '本地上传')
RESOURCE_ORIGIN.add(6, '', '从原料库导入')

// 分镜素材的类型
const MEDIA_TYPE = new Dictionary()
MEDIA_TYPE.add(1, '', '视频')
MEDIA_TYPE.add(2, '', '音频')
MEDIA_TYPE.add(3, '', '文本')
MEDIA_TYPE.add(4, '', '滤镜')
MEDIA_TYPE.add(5, '', '特效')
MEDIA_TYPE.add(6, '', '贴纸')
MEDIA_TYPE.add(7, '', '转场')
MEDIA_TYPE.add(8, '', '图片')

// 合成任务状态
const SYNTHESISTASK_STATUS = new Dictionary()
SYNTHESISTASK_STATUS.add(0, '', { label: '进行中', class: 'blue_circle' })
SYNTHESISTASK_STATUS.add(1, '', { label: '进行中', class: 'blue_circle' })
SYNTHESISTASK_STATUS.add(2, '', { label: '进行中', class: 'blue_circle' })
SYNTHESISTASK_STATUS.add(3, '', { label: '已完成', class: 'green_circle' })
SYNTHESISTASK_STATUS.add(4, '', { label: '已终止', class: 'red_circle' })
SYNTHESISTASK_STATUS.add(10, '', { label: '预览中', class: 'orange_circle' })

// 合成任务方式
const SYNTHESISTASK_TYPE = new Dictionary()
SYNTHESISTASK_TYPE.add(1, '', '流水线生成')
SYNTHESISTASK_TYPE.add(2, '', '模板式生成')
SYNTHESISTASK_TYPE.add(3, '', '剧本式生成')
SYNTHESISTASK_TYPE.add(4, '', '智能混剪')
SYNTHESISTASK_TYPE.add(6, '', '图文合成')

// 内容分发-批量发布的任务状态
const BATCHPUBLISH_TASKSTATUS = new Dictionary()
BATCHPUBLISH_TASKSTATUS.add(0, '', { label: '等待中', class: 'grey_circle' })
BATCHPUBLISH_TASKSTATUS.add(1, '', { label: '处理中', class: 'blue_circle' })
BATCHPUBLISH_TASKSTATUS.add(2, '', { label: '已完成', class: 'green_circle' })
BATCHPUBLISH_TASKSTATUS.add(3, '', { label: '任务异常', class: 'red_circle' })
BATCHPUBLISH_TASKSTATUS.add(4, '', { label: '任务异常', class: 'red_circle' })
BATCHPUBLISH_TASKSTATUS.add(5, '', { label: '已关闭', class: 'grey_circle' })

// 内容分发-批量发布的发布状态
const BATCHPUBLISH_PUBLISHSTATUS = new Dictionary()
BATCHPUBLISH_PUBLISHSTATUS.add(1, '', { label: '等待发布', class: 'grey_circle' })
BATCHPUBLISH_PUBLISHSTATUS.add(2, '', { label: '发布中', class: 'blue_circle' })
BATCHPUBLISH_PUBLISHSTATUS.add(3, '', { label: '发布成功', class: 'green_circle' })
BATCHPUBLISH_PUBLISHSTATUS.add(4, '', { label: '发布失败', class: 'red_circle' })
BATCHPUBLISH_PUBLISHSTATUS.add(5, '', { label: '任务已关闭', class: 'grey_circle' })

// 内容分发-二维码发布状态
const QRCODE_PUBLISHSTATUS = new Dictionary()
QRCODE_PUBLISHSTATUS.add(1, '', { label: '未启用', class: 'orange_circle' })
QRCODE_PUBLISHSTATUS.add(2, '', { label: '发布中', class: 'blue_circle' })
QRCODE_PUBLISHSTATUS.add(3, '', { label: '已失效', class: 'grey_circle' })

// 智能拆解-拆解记录状态
const INTELLIGENT_RECORD_STATUS = new Dictionary()
INTELLIGENT_RECORD_STATUS.add(0, '', '未开始')
INTELLIGENT_RECORD_STATUS.add(1, '', '处理中')
INTELLIGENT_RECORD_STATUS.add(2, '', '处理成功')
INTELLIGENT_RECORD_STATUS.add(3, '', '处理失败')
// 素材库-使用形式
const WORK_USEWAY = new Dictionary()
WORK_USEWAY.add(1, '', '视频任务转发') // 分发-老数据
WORK_USEWAY.add(2, '', '素材库下载') // 下载-老数据
WORK_USEWAY.add(21, '', '素材库下载')
WORK_USEWAY.add(22, '', '小程序下载')
WORK_USEWAY.add(111, '', '视频任务转发') // 转发任务-成品库
WORK_USEWAY.add(112, '', '视频任务转发') // 转发任务-模板转发
WORK_USEWAY.add(121, '', '成长任务转发') // 成长转发任务-成品库
WORK_USEWAY.add(122, '', '成长任务转发') // 成长转发任务-模板转发
WORK_USEWAY.add(131, '', '矩阵列表发布') // PC后台发布
WORK_USEWAY.add(132, '', '批量发布') // 批量发布任务
WORK_USEWAY.add(141, '', '小程序发视频') // 小程序首页转发-成品库
WORK_USEWAY.add(142, '', '小程序发视频') // 小程序首页转发-模板转发
WORK_USEWAY.add(143, '', '二维码发布下载') // 小程序首页转发-模板转发

export {
  ELEMENT_TYPE,
  ELEMENT_ORIGIN,
  RESOURCE_TYPE,
  RESOURCE_ORIGIN,
  MEDIA_TYPE,
  SYNTHESISTASK_STATUS,
  SYNTHESISTASK_TYPE,
  BATCHPUBLISH_TASKSTATUS,
  BATCHPUBLISH_PUBLISHSTATUS,
  INTELLIGENT_RECORD_STATUS,
  WORK_USEWAY,
  QRCODE_PUBLISHSTATUS
}

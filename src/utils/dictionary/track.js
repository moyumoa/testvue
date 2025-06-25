/*
 * @Author: Dong wen hao
 * @Date: 2022-03-01 15:04:13
 * @LastEditors: Dong wen hao
 * @LastEditTime: 2022-03-24 09:43:38
 * @Description: 埋点事件枚举
 */

import Dictionary from './Dictionary'

// 埋点事件id
const TRACK_EVENT_ID = new Dictionary()
TRACK_EVENT_ID.add(101, '', 'TagVV进入页面')
TRACK_EVENT_ID.add(102, '', 'TagVV离开页面')
TRACK_EVENT_ID.add(103, '', '查看录屏')
TRACK_EVENT_ID.add(104, '', '直播数据导出')
TRACK_EVENT_ID.add(105, '', '视频数据导出')
TRACK_EVENT_ID.add(106, '', '视频质检按钮')
TRACK_EVENT_ID.add(107, '', '直播质检按钮')
TRACK_EVENT_ID.add(108, '', '销售报表导出')
TRACK_EVENT_ID.add(109, '', '商品报表导出')
TRACK_EVENT_ID.add(110, '', '运营-汇总报表导出')
TRACK_EVENT_ID.add(111, '', '运营-矩阵号报表导出')
TRACK_EVENT_ID.add(112, '', '创建视频任务')
TRACK_EVENT_ID.add(113, '', '创建直播任务')
TRACK_EVENT_ID.add(114, '', '成员数据导出')
TRACK_EVENT_ID.add(115, '', '任务数据导出')
TRACK_EVENT_ID.add(116, '', '部门数据导出')
TRACK_EVENT_ID.add(117, '', '创建征集任务')
TRACK_EVENT_ID.add(118, '', '客户管理导出')
TRACK_EVENT_ID.add(201, '', '小程序进入页面')
TRACK_EVENT_ID.add(202, '', '小程序离开页面')
TRACK_EVENT_ID.add(203, '', '任务立即参与按钮')
TRACK_EVENT_ID.add(204, '', '矩阵号管理导出')
TRACK_EVENT_ID.add(205, '', '微信架构下成员列表导出')
TRACK_EVENT_ID.add(206, '', '矩阵获客-成员跟进报表导出')
TRACK_EVENT_ID.add(207, '', '团购数据订单导出')
TRACK_EVENT_ID.add(208, '', '团购数据券导出')
TRACK_EVENT_ID.add(209, '', '批量发布导出')
TRACK_EVENT_ID.add(210, '', '内容分发-发布记录导出')
TRACK_EVENT_ID.add(211, '', '二维码发布记录导出')
TRACK_EVENT_ID.add(212, '', '合成任务导出')
TRACK_EVENT_ID.add(213, '', '用户管理列表导出')

export { TRACK_EVENT_ID }

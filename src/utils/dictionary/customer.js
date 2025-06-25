/*
 * @Author: Dong wen hao
 * @Date: 2022-04-27 10:34:56
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-04-27 10:34:56
 * @Description: 公司级别通用字段
 */

import Dictionary from './Dictionary'

// 客户关系
const CUSTOMER_RELATE = new Dictionary()
CUSTOMER_RELATE.add(1, '', '粉丝')
CUSTOMER_RELATE.add(0, '', '非粉丝')
CUSTOMER_RELATE.add(2, '', '--')

// 列表显示的意向客户 与筛选一致 又叫客户类型 当一个客户的 意向度变成 高的 时候 他的类型 自动变为 高意向客户类型
const CUSTOMER_INTENT_STATUS_3 = new Dictionary()
CUSTOMER_INTENT_STATUS_3.add(200, '', '潜在客户')
CUSTOMER_INTENT_STATUS_3.add(300, '', '高意向客户')
CUSTOMER_INTENT_STATUS_3.add(400, '', '中意向客户')
CUSTOMER_INTENT_STATUS_3.add(500, '', '低意向客户')
CUSTOMER_INTENT_STATUS_3.add(1, '', '未知意向客户')

// 客户意向度 详情里的
const CUSTOMER_INTENT_STATUS = new Dictionary()
CUSTOMER_INTENT_STATUS.add(1, '', '--')
CUSTOMER_INTENT_STATUS.add(2, '', '高意向')
CUSTOMER_INTENT_STATUS.add(3, '', '中意向')
CUSTOMER_INTENT_STATUS.add(4, '', '低意向')
CUSTOMER_INTENT_STATUS.add(5, '', '--')

// 客户来源
const CUSTOMER_SOURCE = new Dictionary()
// CUSTOMER_SOURCE.add(1, '', '视频')
// CUSTOMER_SOURCE.add(2, '', '私信')
// CUSTOMER_SOURCE.add(3, '', '关注')
// CUSTOMER_SOURCE.add(4, '', '点赞')
// CUSTOMER_SOURCE.add(5, '', '主页')
// CUSTOMER_SOURCE.add(6, '', '直播')
// CUSTOMER_SOURCE.add(7, '', '--')
// CUSTOMER_SOURCE.add(8, '', '其他')
CUSTOMER_SOURCE.add(110, '', '视频评论')
CUSTOMER_SOURCE.add(111, '', '评论恢复')
CUSTOMER_SOURCE.add(112, '', '私信')
CUSTOMER_SOURCE.add(113, '', '关注')
CUSTOMER_SOURCE.add(114, '', '取消关注')
CUSTOMER_SOURCE.add(115, '', '进入会话')
CUSTOMER_SOURCE.add(116, '', '点赞')
CUSTOMER_SOURCE.add(117, '', '取消点赞')
CUSTOMER_SOURCE.add(118, '', '主页互动')
CUSTOMER_SOURCE.add(119, '', '创建视频')
CUSTOMER_SOURCE.add(120, '', '授权')
CUSTOMER_SOURCE.add(121, '', '取消授权')
CUSTOMER_SOURCE.add(211, '', '直播间礼物')
CUSTOMER_SOURCE.add(212, '', '直播间关注')
CUSTOMER_SOURCE.add(213, '', '直播间分享')
CUSTOMER_SOURCE.add(214, '', '直播间点赞')

CUSTOMER_SOURCE.add(210, '', '直播间')
CUSTOMER_SOURCE.add(215, '', '视频评论消息')
CUSTOMER_SOURCE.add(216, '', '私信')
CUSTOMER_SOURCE.add(310, '', '主页')
CUSTOMER_SOURCE.add(311, '', '视频')
CUSTOMER_SOURCE.add(312, '', '直播间')
CUSTOMER_SOURCE.add(313, '', '私信')

// 客户跟进状态
const CUSTOMER_FOLLOW_STATUS = new Dictionary()
CUSTOMER_FOLLOW_STATUS.add(1, '', '待跟进')
CUSTOMER_FOLLOW_STATUS.add(2, '', '跟进中')
CUSTOMER_FOLLOW_STATUS.add(3, '', '结束跟进')

// 客户阶段
const CUSTOMER_STEP_STATUS = new Dictionary()
CUSTOMER_STEP_STATUS.add(1, '', '新客户')
CUSTOMER_STEP_STATUS.add(2, '', '初步接触')
CUSTOMER_STEP_STATUS.add(3, '', '有意向')
CUSTOMER_STEP_STATUS.add(4, '', '已到店')
CUSTOMER_STEP_STATUS.add(5, '', '已成交')
CUSTOMER_STEP_STATUS.add(6, '', '已转出') // 目前没有这个阶段了
CUSTOMER_STEP_STATUS.add(7, '', '无效')

// 最后互动类型
const LAST_EVENT_TYPE = new Dictionary()
LAST_EVENT_TYPE.add(1, '', '视频评论')
LAST_EVENT_TYPE.add(2, '', '可以无视')
LAST_EVENT_TYPE.add(3, '', '私信')
LAST_EVENT_TYPE.add(4, '', '关注')
LAST_EVENT_TYPE.add(5, '', '取关')
LAST_EVENT_TYPE.add(6, '', '进入会话')
LAST_EVENT_TYPE.add(7, '', '点赞')
LAST_EVENT_TYPE.add(8, '', '取消点赞')
LAST_EVENT_TYPE.add(9, '', '主页')

// 跟进记录
const RECORD_TYPE = new Dictionary()
RECORD_TYPE.add(1, '', '新客户创建')
RECORD_TYPE.add(2, '', '客户留资')
RECORD_TYPE.add(3, '', '跟进记录')
RECORD_TYPE.add(4, '', '客户阶段变更')
RECORD_TYPE.add(5, '', '客户意向变更')
RECORD_TYPE.add(6, '', '管理员操作客户意向变更')
RECORD_TYPE.add(7, '', '取消标记无效')
RECORD_TYPE.add(8, '', '客户重新分配')
RECORD_TYPE.add(9, '', '客户回收')

export {
  CUSTOMER_RELATE,
  CUSTOMER_INTENT_STATUS,
  CUSTOMER_SOURCE,
  CUSTOMER_FOLLOW_STATUS,
  CUSTOMER_STEP_STATUS,
  LAST_EVENT_TYPE,
  RECORD_TYPE,
  CUSTOMER_INTENT_STATUS_3
}

/*
 * @Author: Dong wen hao
 * @Date: 2022-05-06 10:11:19
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-06-23 18:31:34
 * @Description: 会话管理相关字典
 */

import Dictionary from './Dictionary'

// 消息类型
const MESSAGE_TYPE = new Dictionary()
MESSAGE_TYPE.add(1, 'video_comment', '视频评论')
MESSAGE_TYPE.add(2, 'comment_reply', '视频评论的评论')
MESSAGE_TYPE.add(3, 'im_message', '私信消息')
MESSAGE_TYPE.add(4, 'follow', '关注')
MESSAGE_TYPE.add(5, 'unfollow', '取关')

// 互动策略类型 - 包括消息类型
const POLICY_TYPE = new Dictionary()
POLICY_TYPE.add(110, 'video_comment', '视频评论')
POLICY_TYPE.add(112, 'im_message', '私信')
POLICY_TYPE.add(113, 'follow', '关注')
POLICY_TYPE.add(114, 'unfollow', '取消关注')
POLICY_TYPE.add(115, 'im_in', '进入会话')
POLICY_TYPE.add(116, 'digg', '点赞')
POLICY_TYPE.add(117, 'un_digg', '取消点赞')
POLICY_TYPE.add(118, 'home_interaction', '主页互动')
POLICY_TYPE.add(210, 'unfollow', '直播弹幕')
POLICY_TYPE.add(211, 'im_in', '直播赠礼')
POLICY_TYPE.add(212, 'digg', '直播关注')
POLICY_TYPE.add(213, 'un_digg', '直播分享')
POLICY_TYPE.add(214, 'home_interaction', '直播点赞')
POLICY_TYPE.add(215, 'home_interaction', '视频评论')
POLICY_TYPE.add(216, 'home_interaction', '私信')

// 回复类型
const REPLY_TYPE = new Dictionary()
REPLY_TYPE.add('text', 'text', '文本')
// REPLY_TYPE.add('emoji', 'emoji', '表情')
REPLY_TYPE.add('image', 'image', '图片')
REPLY_TYPE.add('card', 'card', '消息卡片')
// REPLY_TYPE.add('video', 'video', '视频')
REPLY_TYPE.add('group_invite', 'groupInvite', '群聊邀请')

const TRIGGER_STATUS = new Dictionary()
TRIGGER_STATUS.add(0, 'not_trigger', '未发送')
TRIGGER_STATUS.add(1, 'triggering', '发送中')
TRIGGER_STATUS.add(2, 'trigger_success', '成功')
TRIGGER_STATUS.add(3, 'trigger_fail', '失败')

// 触达记录-用户互动类型
const USER_INTERACTION_TYPE = new Dictionary()
USER_INTERACTION_TYPE.add(110, 'video_comment', '视频评论')
USER_INTERACTION_TYPE.add(111, 'video_comment', '视频评论')
USER_INTERACTION_TYPE.add(112, 'im_message', '私信')
USER_INTERACTION_TYPE.add(210, 'live_screen', '直播弹幕')
USER_INTERACTION_TYPE.add(215, 'video_comment', '视频评论')
export { MESSAGE_TYPE, POLICY_TYPE, REPLY_TYPE, TRIGGER_STATUS, USER_INTERACTION_TYPE }

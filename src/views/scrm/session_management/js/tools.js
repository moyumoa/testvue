import { dateFormat } from '@/utils/tools'
// import { createSession, readMessage } from '@/api/scrm/session_management'
import { readMessage } from '@/api/scrm/session_management'
import store from '@/store'
import { transInlineImg } from '@/utils/emoji.js'

// 将日期转为消息展现格式 date=yyyy-MM-dd HH:mm:ss
function transDate(date) {
  if (!date) return ''
  const ONE_DAY = 24 * 60 * 60 * 1000
  const toDate = new Date(date).setHours(0, 0, 0, 0)
  const today = new Date().setHours(0, 0, 0, 0)
  const yesterday = new Date(new Date().getTime() - ONE_DAY).setHours(0, 0, 0, 0)

  const resultTime = dateFormat(new Date(date), 'hh:mm')
  const resultDate = dateFormat(new Date(date), 'MM-DD')

  if (toDate === today) {
    return `今天${resultTime}`
  }
  if (toDate === yesterday) {
    return `昨天${resultTime}`
  }
  return resultDate
}

/**
 * 计算间隔时间
 * @param {String} startDate - 开始时间 YYYY-MM-DD hh:mm:ss
 * @param {String} endDate - 结束时间
 *
 * @returns 间隔时间 单位秒
 */
function computedIntervalTime(startDate, endDate) {
  const start = new Date(startDate).getTime() / 1000
  const end = new Date(endDate).getTime() / 1000
  return parseInt(end - start)
}

/**
 * 创建新聊天会话
 * @param {Object} from 和store里chat.js的currentChatUser一致
 * @param {Object} to 和store里chat.js的currentChatMineInfo一致
 * @param {Function} callback
 * @param {Function} readCallback 已读后处理
 */
function createNewChat(from, to, callback, readCallback) {
  readMessage({
    fromUserId: from.openId,
    toUserId: to.openId,
    ts: dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss')
  }).then(() => readCallback && readCallback())
  // createSession({ fromOpenId: from.openId, toOpenId: to.openId })
  store.commit('chat/setNewChatInfo', {
    currentChatUser: from,
    currentChatMineInfo: to
  })
  callback && callback()
}

// 处理消息数据
// {
//   "version": "v2",
//   "msgType": 1,
//   "msgId": 271,
//   "itemId": null,
//   "itemName": null,
//   "replyCommentContent": null,
//   "content": null,
//   "sendType": null,
//   "actTime": "2022-05-30 10:48:05",
//   "isRead": null,
//   "fromOpenId": "875c36bf-c849-4e89-82f8-aa27d99165b8",
//   "brandId": "16",
//   "toOpenId": "0b5ddea1-b6d0-49b0-a273-27b56c66b3b6",
//   "fromAvatar": "https://p3.douyinpic.com/aweme/720x720/aweme-avatar/tos-cn-i-0813_6315ee9fdb7349c49f5417dc9160b861.jpeg?from=4010531038",
//   "fromNickName": "YiYa",
//   "toNickName": null,
//   "toAvatar": null,
//   "msgContent": {
//           "msgSubType": "",
//           "itemId": "@9Vxc0aqXSsM5b2D0dt41Qc791W3oNfuDOJdxqwOgK1MVafj+60zdRmYqig357zEBy2JJHniLNtZdKCz/R6fGjg==",
//           "itemName": null,
//           "replyCommentContent": null,
//           "content": "没有什么波澜的生活，要自己创造快乐"
//   }
// }
function handleMessageVo(data, imgSize = 100, platform = 1) {
  if (!data || !data.msgContent) return
  if (data.msgContent.msgSubType === 'text') {
    data.msgContent.content = htmlEscape(data.msgContent.content || '')
    data.msgContent.replyCommentContent = htmlEscape(data.msgContent.replyCommentContent || '')
    data.msgContent.content = transInlineImg(data.msgContent.content, platform)
    data.msgContent.replyCommentContent = transInlineImg(
      data.msgContent.replyCommentContent,
      platform
    )
  } else if (data.msgContent.msgSubType === 'emoji') {
    // data.msgContent.content = `<img style="width:${imgSize}px;" src="${data.msgContent.content}" />`
    data.msgContent.content = `你收到一条新消息，请打开${platform === 1 ? '抖音' : '小红书'}APP查看`
  } else if (data.msgContent.msgSubType === 'image') {
    data.msgContent.content = `你收到一条新消息，请打开${platform === 1 ? '抖音' : '小红书'}APP查看`
    // data.msgContent.content = '[图片]'
  } else if (data.msgContent.msgSubType === 'card') {
    data.msgContent.content = `你收到一条新消息，请打开${platform === 1 ? '抖音' : '小红书'}APP查看`
    // data.msgContent.content = '[卡片消息]'
  } else if (data.msgContent.msgSubType === 'group_invite') {
    data.msgContent.content = `你收到一条新消息，请打开${platform === 1 ? '抖音' : '小红书'}APP查看`
    // data.msgContent.content = '[群聊邀请]'
  }
}

function htmlEscape(htmlStr) {
  return htmlStr.replace(/<|>|"|&/g, match => {
    switch (match) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case '&':
        return '&amp;'
    }
  })
}

export { transDate, computedIntervalTime, createNewChat, handleMessageVo }

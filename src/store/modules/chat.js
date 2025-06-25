export default {
  namespaced: true,
  state: {
    // 当前会话用户
    currentChatUser: {
      openId: '',
      name: '',
      avatar: ''
    },
    // 企业号未读消息变化
    unreadMessageChange: {
      t: '', // 时间戳
      openId: '',
      setNum: 0, // 设置未读消息
      changeNum: 0 // 未读消息变化
    },
    // 当前会话的企业号信息
    currentChatMineInfo: {
      openId: '',
      name: '',
      avatar: ''
    },
    // 发送的消息
    sendMessageInfo: {},
    // 是否精准定位某个会话
    isIntended: false,
    // 互动策略选择的用户openId
    policyOpenId: '',
    policyDyWebUid: null // 抖音webUid scrm五期
  },
  mutations: {
    // 设置新会话信息
    setNewChatInfo(state, chatInfo) {
      state.currentChatUser = chatInfo.currentChatUser
      state.currentChatMineInfo = chatInfo.currentChatMineInfo
    },
    initChatInfo(state) {
      state.currentChatUser = {
        openId: '',
        name: '',
        avatar: ''
      }
      state.currentChatMineInfo = {
        openId: '',
        name: '',
        avatar: ''
      }
      state.sendMessageInfo = {
        fromOpenId: '',
        actTime: '',
        content: ''
      }
    },
    setSendMessageInfo(state, messageInfo) {
      state.sendMessageInfo = messageInfo
    },
    needIntendedChat(state, status) {
      state.isIntended = status
    },
    setPolicyOpenId(state, openId) {
      state.policyOpenId = openId
    },
    setUnreadMessageChange(state, data) {
      data.t = new Date().getTime()
      state.unreadMessageChange = data
    },
    // 存储dyWebUid
    setDyWebUid(state, dyWebUid) {
      state.policyDyWebUid = dyWebUid
    }
  }
}

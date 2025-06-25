const state = {
  platform: null // 平台 null 全部 1抖音 2视频号 （内容中台-->内容概览-->数据来源切换时的平台，用于子组件的请求入参
}
const mutations = {
  setPlatform(state, val) {
    console.log('state val -->', val)
    state.platform = val
  }
}
const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

const state = {
  platform: null, // 平台 null 全部 1抖音 2视频号 （视频发布任务任务-->查看数据-->数据分析-->切换来源时平台的请求入参
  aiCreateLoading: false, // 任务标题仿写ai文案生成中
}
const mutations = {
  setPlatform(state, val) {
    console.log('state val -->', val)
    state.platform = val
  },
  setAiCreateLoading(state, val) {
    state.aiCreateLoading = val
  }
}
const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

const state = {
  lang: '',
  KOCInfo: {
    hasKOC: false, // 是否开通KOC程序
    isValid: 0, // KOC是否有效 1授权有效 0授权失效
    invalidType: 0 // KOC无效的原因 0默认值[不用管] 1token过期无法刷新 2用户取消授权
  } // KOC信息
}
const mutations = {
  setLang(state, val) {
    state.lang = val
  },
  setKOCInfo(state, val) {
    state.KOCInfo = val
  }
}
const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

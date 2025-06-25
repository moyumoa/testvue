export default {
  namespaced: true,
  state: {
    classIndex: -1, // 课节标识
    classInfo: null // 课节内容信息
  },
  mutations: {
    setClassIndex(state, index) {
      state.classIndex = index
    },
    setClassInfo(state, data) {
      state.classInfo = data
    }
  }
}

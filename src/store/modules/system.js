import { unReadMsgList } from '@/api/main/home'
import { judgeOEA, judgeHWork } from '@/utils/OEA'
const state = {
  upgradeInfo: {
    show: false,
    content: ''
  }, // 升级公告的信息
  editBusinessEntity: 1 // 新增- 可编辑的业务主体类型 三个业务主体类型，同时只能有一个在编辑的状态
}
const mutations = {
  setShowUpgrade(state, data) {
    console.log('版本升级的信息', data)
    state.upgradeInfo = data
  },
  setEditBusinessEntity(state, data) {
    state.editBusinessEntity = data
  }
}
const actions = {
  getUpgradeInfo({ commit }) {
    if (judgeOEA() || judgeHWork()) {
      return
    }
    unReadMsgList({
      msgType: 2
    })
      .then(res => {
        if (res.code === 0) {
          console.log('版本更新', res.data)
          if (res.data && res.data.length > 0) {
            const ids = res.data.map(x => x.id)
            const content = res.data[0].msgText
            commit('setShowUpgrade', {
              show: true,
              content: content.replace(/↵/g, '\n'),
              ids: ids
            })
          } else {
            commit('setShowUpgrade', {
              show: false,
              content: ''
            })
          }
        } else {
          commit('setShowUpgrade', {
            show: false,
            content: ''
          })
        }
      })
      .catch(() => {
        commit('setShowUpgrade', {
          show: false,
          content: ''
        })
      })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

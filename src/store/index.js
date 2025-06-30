import Vue from 'vue'
import Vuex from 'vuex'

import user from './module/user'
import app from './module/app'
import Store from 'electron-store'
const store = new Store();

Vue.use(Vuex)

const userName = store.get('USERNAME')
export default new Vuex.Store({
  state: {
    // 用户名
    userName: userName ? userName : null,
    // 头部信息
    blueHead: false,
  },
  mutations: {
    //
    setUserName: (state, name) => {
      state.userName = name
    },
    getBlueHead:(state, value) => {
      state.blueHead = value
    }
  },
  actions: {
    //
  },
  modules: {
    user,
    app
  }
})

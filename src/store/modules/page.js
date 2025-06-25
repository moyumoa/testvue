const state = {
  isCollapse: true, // 菜单是否展开
  routeLoading: false, // 页面跳转时的动画
  fromPath: '', // 上一级的路由
  showPage: true, // 是否显示页面--用于所有页面级菜单二次点击刷新功能
  isMenuPush: false, // 是否是从菜单进入的
  isHideLeftMenu: false, // 是否隐藏左侧菜单--目前是为海尔提供setisHideTopMenu
  isHideTopMenu: false, // 是否隐藏顶部菜单+面包屑--目前是为海尔提供setisHideTopMenu
  exportEntryDis: false // 海尔项目-sumvideo的iframe打开弹窗时，要禁用下载入口
}
const mutations = {
  setCollapse(state, val) {
    state.isCollapse = val
  },
  setLoading(state, val) {
    state.routeLoading = val
  },
  setFromPath(state, val) {
    state.fromPath = val
  },
  setShowPage(state, val) {
    state.showPage = val
  },
  setIsMenuPush(state, val) {
    state.isMenuPush = val
  },
  setisHideLeftMenu(state, val) {
    state.isHideLeftMenu = val
  },
  setisHideTopMenu(state, val) {
    state.isHideTopMenu = val
  },
  setExportEntryDis(state, val) {
    state.exportEntryDis = val
  }
}
const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

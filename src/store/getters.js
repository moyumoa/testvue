const getters = {
  userInfo: state => state.user.userInfo,
  systemModule: state => state.user.systemModule,
  isCollapse: state => state.page.isCollapse,
  routeLoading: state => state.page.routeLoading,
  isMenuPush: state => state.page.isMenuPush,
  isHideLeftMenu: state => state.page.isHideLeftMenu,
  isHideTopMenu: state => state.page.isHideTopMenu
}

export default getters

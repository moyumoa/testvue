import store from '@/store'
/**
 * @description keepAlive下，菜单点击的相关操作 type:judge判断是否是菜单进入的，reset清空判断菜单进入的条件 set设置是菜单进入的
 * @return {Boolean}
 */
export function menuOfKeepAlive(type) {
  if (type === 'judge') {
    return store.getters.isMenuPush
  } else if (type === 'reset') {
    store.commit('page/setIsMenuPush', false)
  } else if (type === 'set') {
    store.commit('page/setIsMenuPush', true)
  }
}

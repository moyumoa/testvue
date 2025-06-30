import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router'
import _Store from 'electron-store'
import store from '../store'

const { ipcRenderer } = window.require('electron');

Vue.use(VueRouter)
const _store = new _Store();

const router = new VueRouter({
  routes,
  mode: process.env.NODE_ENV=='development'?'history':'hash'
})
router.beforeEach((to, from, next) => {
  store.commit("getBlueHead", to.meta.blueHead?to.meta.blueHead:false);
  if (to.path === "/login" || to.path === "/login_company" ) {
    next();
  } else {
    // localStorage.getItem('USERTOKEN')
    let token = _store.get('USERTOKEN');
    if (token == undefined || token === "") {
      next("/login");
    } else {
      next();
    }
  }
})
router.afterEach((to) => {
  window.scrollTo(0, 0)
  // 发送路由变化事件到主进程
  ipcRenderer.send('route-change', to.path);
})
export default router

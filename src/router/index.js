import Vue from 'vue'
import Router from 'vue-router'
import routes from './router'
import _Store from 'electron-store'
import store from '../store'

Vue.use(Router)
const _store = new _Store();

const router = new Router({
  routes,
  mode: process.env.NODE_ENV=='development'?'history':'hash'
})
router.beforeEach((to, from, next) => {
  store.commit("getBlueHead", to.meta.blueHead?to.meta.blueHead:false);
  if (to.path === "/login") {
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
router.afterEach(() => {
  window.scrollTo(0, 0)
})
export default router

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import importDirective from '@/directives'
// import api from './api/index'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/style/index.less';
// import './libs/rem.js'
import store from './store'

Vue.use(ElementUI);
Vue.config.productionTip = false
// Vue.prototype.$api = api
importDirective(Vue)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

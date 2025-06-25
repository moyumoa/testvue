import pageSetupEditor from './page_setup_editor.vue'

// import { ElMessage } from 'element-plus'
export default {
  editor: markRaw(pageSetupEditor),
  data: {
    name: '页面设置',
    type: 'pageSetup',
    category: 'basic',
    meta: {},
    params: {
      title: '', // 页面标题
      diyColor: '1', // 1默认 2自定义
      backgroundColor: '#fff',
      follow: false // 是否关注品牌号
    },
    validate: function (e) {
      return true
      // if (this.data.params.title) {
      //   return true
      // } else {
      //   ElMessage({
      //     type: 'warning',
      //     message: '请输入页面标题'
      //   })
      //   return false
      // }
    }
  }
}

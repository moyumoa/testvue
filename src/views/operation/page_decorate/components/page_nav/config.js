import pageNavEditor from './page_nav_editor.vue'

// import { ElMessage } from 'element-plus'
export default {
  editor: markRaw(pageNavEditor),
  data: {
    name: '页面设置',
    type: 'pageNav',
    category: 'basic',
    meta: {},
    params: {
      pageStyle: 'normal', // 样式选择 tmall 天猫 normal 默认选择
      backImg: '', // 背景图片
      backgroundColor: '#fff', // 背景颜色
      showSearch: false, // 是否显示搜索框
      position: 'left', // 位置选择
      showTitle: true, // 是否显示标题设置
      color: '#333', // 文字颜色
      fontSize: 16 // 字体大小
    },
    validate: function (e) {
      return true
    }
  }
}

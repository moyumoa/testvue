import goodsSearch from './goods_search.vue'
import goodsSearchEditor from './goods_search_editor.vue'

// import { ElMessage } from 'element-plus'
export default {
  content: markRaw(goodsSearch),
  editor: markRaw(goodsSearchEditor),
  data: {
    name: '商品搜索',
    type: 'goodsSearch',
    category: 'basic',
    meta: {},
    params: {
      position: 'normal', // 显示位置  normal 正常模式  scroll 滚动至顶部固定
      searchStyle: 'square', // 框体样式 square 方形 circle 圆形
      textAlign: 'left', // 文本位置
      height: 32 // 框体高度
    },
    validate: function (e) {
      return true
    }
  }
}

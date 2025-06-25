import goodsGroup from './goods_group.vue'
import goodsGroupEditor from './goods_group_editor.vue'

import { ElMessage } from 'element-plus'
export default {
  content: markRaw(goodsGroup),
  editor: markRaw(goodsGroupEditor),
  data: {
    name: '商品分组',
    type: 'goodsGroup',
    category: 'basic',
    meta: {},
    params: {
      groupList: [],

      goodsNum: 5,
      listStyle: 'big', // 列表样式  big 大图模式 two 一行两个 three 一行三个 list 详细列表 hybrid 一大两小 swipe 横向滑动

      goodsStyle: 'none', // 商品样式 none 无边白底 shadow 卡片投影 stroke 描边白底 transparent 无边透明底
      imgAngle: 'round', // 商品倒角
      scale: '1.00', // 图片比例  '0.67'3:2  '1.00' 1:1  '1.33' 3:4  '0.56' 16:9
      fill: 'cover', // 填充方式
      fontWeight: 'normal', // 文本样式
      textAlign: 'left', // 文本对齐
      pmargin: 14, // 页面边距
      imargin: 8, // 商品间距
      showTitle: true, // 商品名称
      showPrice: true // 商品价格
    },
    validate: function (e) {
      if (this.data.params.groupList.length > 0) {
        return true
      } else {
        ElMessage({
          type: 'warning',
          message: '请选择商品分组'
        })
        return false
      }
    }
  }
}

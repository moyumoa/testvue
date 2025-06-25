import goods from './goods.vue'
import goodsEditor from './goods_editor.vue'

export default {
  content: markRaw(goods),
  editor: markRaw(goodsEditor),
  data: {
    name: '商品',
    type: 'goods',
    category: 'basic',
    meta: {},
    params: {
      goodsSource: 'goods', // 商品来源 goods 商品  goodsGroup 商品分组
      goodsData: [], // 商品
      groupId: null, // 商品分组ID
      goodsNum: 5,
      listStyle: 'big', // 列表样式  big 大图模式 two 一行两个 three 一行三个 list 详细列表 hybrid 一大两小 swipe 横向滑动

      goodsStyle: 'none', // 商品样式 none 无边白底 shadow 卡片投影 stroke 描边白底 transparent 无边透明底
      imgAngle: 'round', // 商品倒角
      scale: '0.67', // 图片比例  '0.67'3:2  '1.00' 1:1  '1.33' 3:4  '0.56' 16:9
      fill: 'cover', // 填充方式
      fontWeight: 'normal', // 文本样式
      textAlign: 'left', // 文本对齐
      pmargin: 14, // 页面边距
      imargin: 8, // 商品间距
      showTitle: true, // 商品名称
      showPrice: true // 商品价格
    },
    validate: function (e) {
      if (
        (this.data.params.goodsSource === 'goods' && this.data.params.goodsData.length > 0) ||
        (this.data.params.goodsSource === 'goodsGroup' && this.data.params.groupId != null)
      ) {
        return true
      } else {
        return '请选择商品'
      }
    }
  }
}

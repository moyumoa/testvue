import imageAds from './image_ads.vue'
import imageAdsEditor from './image_ads_editor.vue'

export default {
  content: markRaw(imageAds),
  editor: markRaw(imageAdsEditor),
  data: {
    name: '图片广告',
    type: 'imageAds',
    category: 'basic',
    meta: {},
    params: {
      imgList: [], // 图片
      templateStyle: '1', // 模板样式 '1'一行一个 '2'轮播海报 '3'绘制热区
      pmargin: 0, // 页面边距
      imargin: 0, // 图片间距
      imgStyle: 'normal', // 图片样式 normal 常规  shadow 投影
      imgAngle: 'angle', // 图片倒角 angle 直角  round 圆角
      fill: 'cover', // 填充方式（一行一个无） cover 填充  contain 周边留白
      indicator: true // 指示器 （一行一个无） true 有  false 无指示器
    },
    validate: function (e) {
      if (this.data.params.imgList.length > 0) {
        return true
      } else {
        return '请设置图片广告'
      }
    }
  }
}

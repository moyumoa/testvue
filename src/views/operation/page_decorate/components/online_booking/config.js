import onlineBooking from './online_booking.vue'
import onlineBookingEditor from './online_booking_editor.vue'

export default {
  content: markRaw(onlineBooking),
  editor: markRaw(onlineBookingEditor),
  data: {
    name: '在线预约',
    type: 'onlineBooking',
    category: 'basic',
    meta: {},
    params: {
      // goodsSource: 'booking',
      goodsData: [], // 活动id列表
      activityData: [], // 活动列表
      listStyle: 'big', // 列表样式  big 大图模式 two 一行两个 three 一行三个 list 详细列表 hybrid 一大两小 swipe 横向滑动

      goodsStyle: 'none', // 活动样式 none 无边白底 shadow 卡片投影 stroke 描边白底 transparent 无边透明底
      imgAngle: 'round', // 活动倒角
      scale: '0.67', // 图片比例  '0.67'3:2  '1.00' 1:1  '1.33' 3:4  '0.56' 16:9
      fill: 'cover', // 填充方式
      fontWeight: 'normal', // 文本样式
      textAlign: 'left', // 文本对齐
      pmargin: 14, // 页面边距
      imargin: 8, // 活动间距
      showTitle: true, // 活动名称
      showPrice: true // 活动价格
    },
    validate: function (e) {
      if (this.data.params.goodsData.length > 0) {
        return true
      } else {
        return '请设置在线预约'
      }
    }
  }
}

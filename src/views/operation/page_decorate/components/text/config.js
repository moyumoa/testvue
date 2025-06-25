import Text from './text.vue'
import TextEditor from './text_editor.vue'

export default {
  content: markRaw(Text),
  editor: markRaw(TextEditor),
  data: {
    name: '文本',
    type: 'text',
    category: 'basic',
    meta: {},
    params: {
      text: '', // 文本
      fontSize: '14px', // 字体大小
      color: '#909399', // 文本颜色
      backgroundColor: '#fff', // 背景颜色
      textAlign: 'left', // 显示位置
      link: null, // 链接 {type:'page',url:"",title:''}
      showBottomLine: false, // 底部分割线
      fontWeight: 'normal' // 文本样式 normal 正常 bold 粗体
    },
    validate: function (e) {
      if (this.data.params.text) {
        return true
      } else {
        return '请输入文本'
      }
    }
  }
}

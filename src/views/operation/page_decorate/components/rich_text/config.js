import richText from './rich_text.vue'
import richTextEditor from './rich_text_editor.vue'

export default {
  content: markRaw(richText),
  editor: markRaw(richTextEditor),
  data: {
    name: '富文本',
    type: 'richText',
    category: 'basic',
    meta: {},
    params: {
      content: '', // 文本
      backgroundColor: '#fff' // 背景颜色
    },
    validate: function (e) {
      if (this.data.params.content) {
        return true
      } else {
        return '请输入富文本内容'
      }
    }
  }
}

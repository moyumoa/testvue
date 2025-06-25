import imageNav from './image_nav.vue'
import imageNavEditor from './image_nav_editor.vue'

// import { ElMessage } from 'element-plus'
export default {
  content: markRaw(imageNav),
  editor: markRaw(imageNavEditor),
  data: {
    name: '图文导航',
    type: 'imageNav',
    category: 'basic',
    meta: {},
    params: {
      templateStyle: '1', // 模板样式 '1' '2'
      backgroundColor: '#fff', // 背景颜色
      color: '#303133', // 文本颜色
      pmargin: 0, // 页面边距
      navList: [
        {
          name: '导航一',
          imgurl: '',
          link: null
        },
        {
          name: '导航二',
          imgurl: '',
          link: null
        },
        {
          name: '导航三',
          imgurl: '',
          link: null
        },
        {
          name: '导航四',
          imgurl: '',
          link: null
        }
      ]
    },
    validate: function (e) {
      let stu = true
      let errImg = false
      let errText = false
      let errLink = false
      if (this.data.params.navList.length > 0) {
        this.data.params.navList.forEach(x => {
          if (!x.imgurl && this.data.params.templateStyle === '1') {
            errImg = true
            stu = false
          }
          if (!x.name) {
            errText = true
            stu = false
          }
          if (!x.link) {
            errLink = true
            stu = false
          }
          // if (this.data.params.templateStyle === '1') {
          //   if (!(x.name && x.imgurl && x.link)) {
          //     stu = false
          //   }
          // } else {
          //   if (!(x.name && x.link)) {
          //     stu = false
          //   }
          // }
        })
      } else {
        stu = false
      }
      if (stu) {
        return true
      } else {
        return errImg
          ? '请添加图片'
          : errText
          ? '请设置标题'
          : errLink
          ? '请设置链接'
          : '请设置图文导航'
      }
    }
  }
}

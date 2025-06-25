import text from '../components/text/config.js'
import richText from '../components/rich_text/config.js'
import imageAds from '../components/image_ads/config.js'
import imageNav from '../components/image_nav/config.js'
import goods from '../components/goods/config.js'
import goodsGroup from '../components/goods_group/config.js'
import goodsSearch from '../components/goods_search/config.js'
import onlineBooking from '../components/online_booking/config.js'
import pageSetup from '../components/page_setup/config.js'
import pageNav from '../components/page_nav/config.js'

import { ElMessageBox } from 'element-plus'

export const useDetail = () => {
  const rightList = reactive([
    { title: '页面设置', icon: 'yemianshezhi', type: 'pageSetup' },
    { title: '顶部导航', icon: 'dingbudaohang', type: 'pageNav' }
  ])
  const rightComponents = reactive({ pageSetup, pageNav })
  const asideList = reactive([
    {
      title: '图文类',
      isShow: true,
      list: [
        { title: '标题文本', icon: 'biaotiwenben', type: 'text' },
        { title: '富文本', icon: 'fuwenben', type: 'richText' },
        { title: '图片广告', icon: 'tupianguanggao', type: 'imageAds' },
        { title: '图文导航', icon: 'tuwendaohang', type: 'imageNav' }
      ]
    },
    // {
    //   title: '视频类',
    //   isShow: true,
    //   list: [
    //     { title: '单个视频', icon: 'dangeshipin', type: 11 },
    //     { title: '品牌视频', icon: 'pinpaishipin', type: 22 }
    //   ]
    // },
    {
      title: '商品类',
      isShow: true,
      list: [
        { title: '商品', icon: 'shangpin', type: 'goods' },
        // { title: '商品组', icon: 'shangpinzu', type: 'goodsGroup' },
        { title: '商品搜索', icon: 'shangpinsousuo', type: 'goodsSearch' }
      ]
    },
    {
      title: '营销工具',
      isShow: true,
      list: [{ title: '在线预约', icon: 'shangpin', type: 'onlineBooking' }]
    }
  ])
  // 工具组件
  const components = reactive({
    text,
    richText,
    imageAds,
    imageNav,
    goods,
    goodsGroup,
    goodsSearch,
    onlineBooking
  })
  // 显示的组件列表
  const componentList = ref([])
  // 选中的组件
  const currentCom = ref({
    data: {}
  })
  // 添加组件
  const addCom = (type, data, stu) => {
    // 添加组件先验证是否已有内容
    // if (
    //   componentList.value.length > 0 &&
    //   !componentList.value[componentList.value.length - 1].validate()
    // ) {
    //   return
    // }
    const item = {
      content: components[type].content,
      editor: components[type].editor,
      data: data || JSON.parse(JSON.stringify(components[type].data)),
      validate: components[type].data.validate,
      type
    }
    componentList.value.push(item)
    if (!stu) {
      toggleCom(item)
    }
  }
  // 切换组件
  const toggleCom = item => {
    console.log(item)
    console.log(Object.keys(item).length)
    if (Object.keys(item).length === 0) {
      addPageCom('pageSetup')
    } else {
      // 切换之前，先判断验证是否通过
      // if (currentCom.value.validate) {
      //   if (currentCom.value.validate()) {
      //     currentCom.value = {}
      //     setTimeout(() => {
      //       currentCom.value = item
      //     }, 20)
      //   }
      // } else {
      currentCom.value = {}
      nextTick(() => {
        currentCom.value = item
      })
      // }
    }
  }
  const delCom = index => {
    console.log(234)
    ElMessageBox.confirm('是否确认删除', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      componentList.value.splice(index, 1)
      toggleCom({})
    })
  }

  // 页面设置
  const pageInfo = ref({ info: {}, nav: [] })
  function addPageCom(e) {
    const data = {
      type: e,
      params: e === 'pageNav' ? pageInfo.value.nav : pageInfo.value.info
    }
    // 切换之前，先判断验证是否通过
    // if (
    //   componentList.value.length > 0 &&
    //   !componentList.value[componentList.value.length - 1].validate()
    // ) {
    //   return
    // }
    currentCom.value = {}
    setTimeout(() => {
      currentCom.value = {
        editor: rightComponents[e].editor,
        data: data,
        validate: rightComponents[e].data.validate,
        e
      }
    }, 20)
  }
  // 回显组件
  const echoCom = json => {
    componentList.value = []
    const data = JSON.parse(json)
    if (data.component) {
      data.component.forEach(ele => {
        addCom(ele.type, ele, true)
      })
    }
    if (data.pageInfo) {
      pageInfo.value = data.pageInfo
    } else {
      pageInfo.value = {
        info: {
          title: '', // 页面标题
          diyColor: '1', // 1默认 2自定义
          backgroundColor: '#fff',
          follow: false // 是否关注品牌号
        },
        nav: {
          pageStyle: 'normal', // 样式选择 tmall 天猫 normal 默认选择
          backImg: '', // 背景图片
          backgroundColor: '#fff', // 背景颜色
          showSearch: false, // 是否显示搜索框
          position: 'left', // 位置选择
          showTitle: true, // 是否显示标题设置
          color: '#333', // 文字颜色
          fontSize: 16 // 字体大小
        }
      }
    }

    addPageCom('pageSetup')
    return componentList.value
  }

  return {
    pageInfo,
    addPageCom,
    rightList,
    asideList,
    componentList,
    currentCom,
    toggleCom,
    delCom,
    addCom,
    echoCom
  }
}

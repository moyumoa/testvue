import { saveOrUpdateAppExtJson, getAppExtJson } from '@/api/operation/diy.js'
import { ElMessage } from 'element-plus'

export const useNav = () => {
  const currentId = ref(null)
  // 顶部导航样式
  const navBarInfo = ref({
    bgColor: '#fff',
    titleColor: 0
  })
  // 底部导航样式
  const tabbarInfo = ref({
    bgColor: '#fff',
    lineColor: 'white',
    textColor: '#909399',
    selectedTextColor: '#2F363F',
    navList: [
      {
        name: '首页',
        link: '首页',
        pagePath: '/pages/index/index',
        icon: 'shouye',
        color: '#2F363F',
        colorText: 'black',
        default: true,
        key: 1
      },
      {
        name: '分类',
        link: '【页面】：分类页',
        icon: 'qingdan',
        color: '#2F363F',
        colorText: 'black',
        pagePath: '/pages/category/index',
        key: 2
      },
      {
        name: '品牌号',
        link: '【页面】：品牌号',
        icon: 'VIP',
        color: '#2F363F',
        colorText: 'black',
        pagePath: '/pages/brand/index',
        key: 3
      },
      {
        name: '我的',
        link: '【页面】：我的',
        icon: 'gerenzhongxin',
        color: '#2F363F',
        colorText: 'black',
        pagePath: '"/pages/mine/index',
        key: 4
      }
    ],
    currentNav: 0
  })
  const toggleTabbar = index => {
    tabbarInfo.value.currentNav = index
  }
  const addNav = () => {
    tabbarInfo.value.navList.push({
      name: '',
      link: '',
      icon: '',
      key: tabbarInfo.value.navList.length + 1
    })
  }
  const delNav = index => {
    tabbarInfo.value.navList.splice(index, 1)
  }
  // 链接,图标
  const modal = reactive({
    show: false,
    current: 0,
    showList: ['page', 'diyPage'],
    iconShow: false,
    colorText: '',
    icon: ''
  })
  const update = (index, type) => {
    modal.current = index
    if (type === 1) {
      modal.show = true
    } else {
      modal.icon = tabbarInfo.value.navList[index].icon
      modal.colorText = tabbarInfo.value.navList[index].colorText
      modal.iconShow = true
    }
  }
  const upLink = data => {
    tabbarInfo.value.navList[modal.current].link = data.label
    tabbarInfo.value.navList[modal.current].pagePath = data.url
  }
  const selectIcon = data => {
    tabbarInfo.value.navList[modal.current].icon = data.icon
    tabbarInfo.value.navList[modal.current].color = data.color
    tabbarInfo.value.navList[modal.current].colorText = data.colorText
  }

  const onSave = () => {
    const tempList = tabbarInfo.value.navList.map(i => !!(i.name && i.link && i.icon))
    if (tempList.indexOf(false) !== -1) {
      return ElMessage.warning('请完善导航信息')
    }
    const { brandId } = JSON.parse(localStorage.getItem('brandInfo'))
    saveOrUpdateAppExtJson({
      json: JSON.stringify({
        extEnable: true,
        ext: {
          brandId,
          paramObj: {
            diypage: 1 // 微页面id
          }
        },
        window: {
          navigationBarTextStyle: navBarInfo.value.titleColor === 0 ? 'black' : 'white',
          navigationBarBackgroundColor: navBarInfo.value.bgColor
        },
        tabBar: {
          backgroundColor: tabbarInfo.value.bgColor,
          borderStyle: tabbarInfo.value.lineColor,
          color: tabbarInfo.value.textColor,
          selectedColor: tabbarInfo.value.selectedTextColor,
          list: tabbarInfo.value.navList.map(i => ({
            text: i.name,
            iconPath: `static/images/tabbar/${i.icon}.png`,
            selectedIconPath: `static/images/tabbar/${i.icon}_${i.colorText}.png`,
            pagePath: i.pagePath.slice(1)
          }))
        }
      }),
      page: JSON.stringify({
        nav: navBarInfo.value,
        tab: tabbarInfo.value
      }),
      type: 0,
      id: currentId.value
    }).then(res => {
      if (res.data === true) {
        ElMessage.success('保存成功')
        getData()
      }
    })
  }
  const copyNav = ref('')
  const copyTab = ref('')
  const getData = () => {
    getAppExtJson({}).then(res => {
      currentId.value = res.data.id
      if (res.data.page) {
        const data = JSON.parse(res.data.page)
        navBarInfo.value = data.nav
        tabbarInfo.value = data.tab
      }
      copyNav.value = JSON.stringify(navBarInfo.value)
      copyTab.value = JSON.stringify(tabbarInfo.value)
    })
  }
  getData()

  return {
    modal,
    navBarInfo,
    tabbarInfo,
    copyNav,
    copyTab,
    addNav,
    toggleTabbar,
    delNav,
    update,
    upLink,
    selectIcon,
    onSave
  }
}

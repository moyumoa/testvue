import { getFloatWinPage, saveOrUpDiyPage, getAppBrandUserList } from '@/api/operation/diy.js'

import { ElMessage } from 'element-plus'

export const useFloat = () => {
  const currentId = ref(null)
  const nameList = ref([])
  const modal = reactive({
    show: false
  })
  // 启用页面
  const configInfo = ref({
    isUse: true,
    checkAll: true,
    checkList: [
      { label: '首页', value: true },
      { label: '分类页', value: true },
      { label: '品牌页', value: true },
      // { label: '个人页', value: true },
      { label: '我的', value: true }
    ]
  })
  // 直播间窗口
  const liveList = ref([
    {
      photo:
        'https://starshow-1256030678.cos.ap-chengdu.myqcloud.com/6ac066db75b24dd38ca23999b07c53f2.png?imageMogr2/rquality/70/thumbnail/750x1334',
      name: '',
      uid: ''
    }
  ])
  const addLive = () => {
    liveList.value.push({
      photo:
        'https://starshow-1256030678.cos.ap-chengdu.myqcloud.com/6ac066db75b24dd38ca23999b07c53f2.png?imageMogr2/rquality/70/thumbnail/750x1334',
      name: '',
      uid: ''
    })
  }
  const delLive = index => {
    liveList.value.splice(index, 1)
  }
  // 跳转窗口
  const linkPageInfo = ref({
    photo:
      'https://system-account-1256030678.cos.ap-chengdu.myqcloud.com/c2f63cea9e6a4818923cc2217e907a99.png?imageMogr2/rquality/70/thumbnail/750x1334',
    link: '',
    linkPath: ''
  })
  const addLink = () => {
    modal.show = true
  }
  const delLink = () => {
    linkPageInfo.value.link = ''
    linkPageInfo.value.linkPath = ''
  }
  const upLink = data => {
    linkPageInfo.value.link = data.label
    linkPageInfo.value.linkPath = data
  }
  const onSave = () => {
    if (configInfo.value.isUse) {
      const tempList = liveList.value.map(i => !!(i.name && i.uid && i.photo))
      if (tempList.indexOf(false) !== -1) {
        return ElMessage.warning('请完善直播间信息')
      }
    }
    saveOrUpDiyPage({
      id: currentId.value,
      type: 7,
      pageType: 7,
      data: JSON.stringify({
        liveList: liveList.value,
        linkPageInfo: linkPageInfo.value,
        configInfo: configInfo.value,
        checkedList: configInfo.value.checkList.filter(i => i.value).map(i => i.label)
      })
    }).then(res => {
      if (res.data === true) {
        ElMessage.success('保存成功')
        fetchInfo()
      }
    })
  }
  const copyLive = ref('')
  const copyLink = ref('')
  const copyConfig = ref('')
  // 回显
  const fetchInfo = () => {
    getFloatWinPage().then(res => {
      if (res.data.length > 0) {
        currentId.value = res.data[0].id
        const data = JSON.parse(res.data[0].data)
        liveList.value = data.liveList
        linkPageInfo.value = data.linkPageInfo
        configInfo.value = data.configInfo
        copyLive.value = JSON.stringify(liveList.value)
        copyLink.value = JSON.stringify(linkPageInfo.value)
        copyConfig.value = JSON.stringify(configInfo.value)
      }
    })
  }
  fetchInfo()

  // 昵称列表
  function getList() {
    getAppBrandUserList({
      pageNumber: 1,
      pageSize: 999
    }).then(res => {
      nameList.value = res.data.records
    })
  }
  getList()

  return {
    copyConfig,
    copyLink,
    copyLive,
    nameList,
    configInfo,
    liveList,
    linkPageInfo,
    addLink,
    delLink,
    modal,
    upLink,
    onSave,
    delLive,
    addLive
  }
}

import {
  saveOrUpVideoDiy,
  getVideoDiy,
  pageBrandVideoList,
  getUserVideoList
} from '@/api/operation/diy.js'
import { ElMessage } from 'element-plus'

export const useBrand = () => {
  const currentId = ref(null)
  // 字典
  const dict = reactive({
    listStyle: [
      { label: '瀑布流', value: 1 },
      { label: '一行两列', value: 2 }
    ],
    kpysList: [
      { label: '卡片投影', value: '0px 1px 6px 0px rgba(0, 0, 0, 0.1)' },
      { label: '无边白底', value: '' }
    ],
    kpdjList: [
      { icon: 'zhijiao', label: '直角', value: '0' },
      { icon: 'yuanjiao', label: '圆角', value: '4px' }
    ],
    wbysList: [
      { icon: 'changguiti', label: '正常', value: '400' },
      { icon: 'jiacu', label: '加粗', value: '600' }
    ]
  })
  const configInfo = reactive({
    // 添加方式 0自动 1手动
    saveType: 0,
    // 自动添加列表
    autoList: [],
    // 手动添加列表
    manualList: [],
    // 账号列表
    accountList: [],
    // 展示列表
    videoList: [],
    // 列表样式 1瀑布流 2一行两列
    listStyle: 1,
    boxShadow: '0px 1px 6px 0px rgba(0, 0, 0, 0.1)',
    borderRadius: '0',
    fontWeight: '400'
  })
  // 视频拖拽
  const drag = ref(false)
  const dialogInfo = reactive({
    show: false, // 视频
    accountVisible: false // 账号
  })
  // 添加方式切换
  const typeChange = val => {
    configInfo.videoList = val === 1 ? configInfo.manualList : configInfo.autoList
  }
  const addVideo = () => {
    if (configInfo.saveType === 0) {
      dialogInfo.show = true
    } else {
      dialogInfo.accountVisible = true
    }
  }
  const delVideo = index => {
    if (configInfo.saveType === 0) {
      configInfo.autoList.splice(index, 1)
      configInfo.videoList = configInfo.autoList
    } else {
      configInfo.accountList.splice(index, 1)
      getVideoData()
    }
  }
  // 选择视频
  const selectVideo = val => {
    configInfo.autoList = val
    configInfo.videoList = val
  }
  // 选择账号
  const selectAccount = val => {
    configInfo.accountList = val
    getVideoData()
  }
  // 账号获取视频接口
  const getVideoData = () => {
    getUserVideoList({ userIds: configInfo.accountList.map(i => i.id) }).then(res => {
      configInfo.manualList = res.data.records
      configInfo.videoList = res.data.records
    })
  }
  // 保存
  const onSave = () => {
    if (configInfo.videoList.length === 0) {
      return ElMessage.warning('请先添加视频')
    }
    const ids =
      configInfo.saveType === 0
        ? configInfo.videoList.map(i => i.id)
        : configInfo.accountList.map(i => i.id)
    const data = {
      id: currentId.value,
      saveType: configInfo.saveType,
      data: JSON.stringify({
        listStyle: configInfo.listStyle,
        boxShadow: configInfo.boxShadow,
        borderRadius: configInfo.borderRadius,
        fontWeight: configInfo.fontWeight
      }),
      saveIds: ids.join(',')
    }
    saveOrUpVideoDiy(data).then(res => {
      if (res.data === true) {
        ElMessage.success('保存成功')
        getBrand()
      }
    })
  }
  const copyData = ref('')
  // 获取品牌号页面
  const getBrand = () => {
    getVideoDiy().then(res => {
      if (res.data.data) {
        currentId.value = res.data.id
        const data = JSON.parse(res.data.data)
        for (const key in data) {
          configInfo[key] = data[key]
        }
        configInfo.saveType = res.data.saveType
        if (configInfo.saveType === 1) {
          configInfo.accountList = res.data.appBrandUserVos
        }
        pageBrandVideoList({ pageNumber: 1, pageSize: 999 }).then(res => {
          if (configInfo.saveType === 0) {
            configInfo.autoList = res.data.records
          } else {
            configInfo.manualList = res.data.records
          }
          configInfo.videoList = res.data.records
          copyData.value = JSON.stringify(configInfo)
        })
      }
    })
  }
  getBrand()

  return {
    dict,
    configInfo,
    copyData,
    drag,
    addVideo,
    delVideo,
    selectVideo,
    selectAccount,
    dialogInfo,
    typeChange,
    onSave
  }
}

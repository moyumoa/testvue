import { reactive, ref } from 'vue'
import { getDetailVideoList, getVideoList, getDetailLiveList } from '@/api/market/task.js'
import { useRoute, useRouter } from 'vue-router'
import { getQuery } from '@/utils/get_query'

export default function (type) {
  const route = useRoute()
  const router = useRouter()

  // 手机号显示隐藏
  function showTel(index, bool) {
    tableForm.listData[index].showPhone = bool
  }
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '成员姓名',
      val: '',
      placeholder: '请输入成员姓名',
      filed: 'employeeName'
    },
    {
      type: 'input',
      label: '手机号',
      val: '',
      placeholder: '请输入手机号码',
      filed: 'employeePhoneNum'
    },
    {
      type: 'input',
      label: '矩阵号',
      val: '',
      placeholder: '请输入矩阵号昵称',
      filed: 'douYinAccount',
      hiddenItem: type === 'video' || type === 'imgText'
    },
    {
      type: 'select',
      label: '视频所属平台',
      placeholder: '请选择视频所属平台',
      val: -1,
      defaultVal: -1,
      filed: 'platform',
      hiddenItem: type === 'lives' || type === 'imgText',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '抖音',
          value: 1
        },
        {
          label: '视频号',
          value: 2
        },
        {
          label: '小红书',
          value: 3
        },
        {
          label: '快手',
          value: 4
        }
      ]
    },
    {
      type: 'select',
      label: '图文所属平台',
      placeholder: '请选择图文所属平台',
      val: -1,
      defaultVal: -1,
      filed: 'platform',
      hiddenItem: type === 'lives' || type === 'video',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '抖音',
          value: 1
        },
        {
          label: '小红书',
          value: 3
        }
      ]
    }
  ])
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })
  // 跳转员工详情页
  function goUser() {
    router.push({
      path: '/content_market/member_data'
    })
  }
  const sortInfo = reactive({
    taskId: route.query.itemId,
    queryType: route.query.type
  })
  // 获取视频列表数据
  function getTaskVideoInfo() {
    tableForm.loading = true
    const searchForm = {
      pageNum: tableForm.page.index,
      pageSize: tableForm.page.size
    }
    const condition = getQuery(searchComponents.value, ['startTime', 'endTime'])
    Object.assign(condition, sortInfo)
    searchForm.condition = condition
    getDetailVideoList(searchForm)
      .then(res => {
        tableForm.listData = transformStatus(res.data.records || [])
        tableForm.page.total = res.data.total || 0
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.loading = false
      })
  }
  // 获取直播列表数据
  function getTaskLiveInfo() {
    tableForm.loading = true
    const searchForm = {
      pageNum: tableForm.page.index,
      pageSize: tableForm.page.size
    }
    const condition = getQuery(searchComponents.value)
    Object.assign(condition, sortInfo)
    searchForm.condition = condition
    getDetailLiveList(searchForm)
      .then(res => {
        tableForm.listData = transformStatus(res.data.records || [])
        tableForm.page.total = res.data.total || 0
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.loading = false
      })
  }
  // 转换任务状态
  function transformStatus(res) {
    const listData = res.map(function (item) {
      item.phone = item.phoneNum
      return item
    }, this)
    return listData
  }
  // 播放视频
  function playVideo(row) {
    if (row.platform === 2 && row.videoUrl) {
      window.open(row.videoUrl)
    } else {
      row.shareUrl ? window.open(row.shareUrl) : window.open(row.videoUrl)
    }
  }
  // 视频更新记录列表
  const videoId = ref('')
  const videoPlatform = ref(null)
  // 获取视频更新记录
  const updateForm = reactive({
    loading: false,
    page: {
      index: 1,
      size: 10,
      total: 0
    },
    updateList: []
  })
  function getUpdateList() {
    updateForm.loading = true
    const updata = {
      itemId: videoId.value,
      pageNum: updateForm.page.index,
      pageSize: updateForm.page.size,
      platform: videoPlatform.value
    }
    // console.log(updata)
    getVideoList(updata)
      .then(res => {
        // console.log(res)
        if (res.code === 0) {
          if (res.data.records === null) {
            updateForm.updateList = []
          } else {
            updateForm.updateList = res.data.records
            updateForm.page.total = res.data.total || 0
          }
        } else {
          if (updateForm.page.index === 1) {
            updateForm.updateList = []
          }
        }
        updateForm.loading = false
      })
      .finally(() => {
        updateForm.loading = false
      })
    // console.log('视频更新记录接口写这里')
  }
  // 查看更改记录
  const dialogTableVisible = ref(false)
  function handleEdit(row, bool) {
    // debugger
    updateForm.page.index = 1
    updateForm.page.size = 10

    videoId.value = row.itemId
    videoPlatform.value = row.platform
    getUpdateList()
    dialogTableVisible.value = bool
  }
  // 刷新
  function updatedVideo() {
    getTaskVideoInfo()
  }
  return {
    tableForm,
    dialogTableVisible,
    updateForm,
    searchComponents,
    handleEdit,
    getTaskVideoInfo,
    showTel,
    playVideo,
    updatedVideo,
    getTaskLiveInfo,
    goUser,
    getUpdateList
  }
}

/**
 * 获取抖店商品列表数据
 */
import { useStore } from 'vuex'
import { reactive } from 'vue'
import { isNotEmpty } from '@/utils/tools'
import { getWorkLibraryListV2 } from '@/api/content_center/content_repository.js'
import { getQuery, checkNumberRange } from '@/utils/get_query.js'
import { setBusinessChooseParam } from '@/utils/search.js'

export function pageList() {
  const chooseFileId = ref(null) // 选中的fileId
  const changeFileLoading = ref(true) // 是否是更新文件夹触发的loading
  const store = useStore()
  // 基础版只显示矩阵号等级规则，其余版本显示完整
  const systemVersion = computed(() => store.state.user.systemVersion)

  // 筛选条件
  const searchComponents1 = ref([
    {
      type: 'select',
      label: '素材来源',
      placeholder: '请选择素材来源',
      filed: 'sources',
      val: -1,
      defaultVal: -1,
      selects: getSourcesSelect()
    },
    {
      type: 'select',
      label: '素材类型',
      placeholder: '请选择素材类型',
      filed: 'type',
      val: -1,
      defaultVal: -1,
      selects:
        systemVersion.value === 3
          ? [
              {
                label: '全部',
                value: -1
              },
              {
                label: '视频',
                value: 1
              },
              {
                label: '图片',
                value: 2
              },
              {
                label: '图文',
                value: 99
              }
            ]
          : [
              {
                label: '全部',
                value: -1
              },
              {
                label: '视频',
                value: 1
              },
              {
                label: '图片',
                value: 2
              }
            ]
    },
    {
      type: 'input',
      label: '素材名称',
      val: '',
      placeholder: '请输入素材名称',
      filed: 'name'
    },
    // {
    //   type: 'input',
    //   label: systemVersion.value === 1 ? '素材名称' : '视频名称',
    //   val: '',
    //   placeholder: systemVersion.value === 1 ? '请输入素材名称' : '请输入视频名称',
    //   filed: 'name'
    // },
    {
      hiddenItem: systemVersion.value !== 3,
      showLabelTip: true,
      type: 'select',
      label: '开放素材',
      placeholder: '请选择是否为开放素材',
      filed: 'isOpen',
      val: -1,
      defaultVal: -1,
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ]
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      hiddenItem: systemVersion.value === 1,
      type: 'input',
      label: '任务名称',
      val: '',
      placeholder: '请输入任务名称',
      filed: 'pipelineTaskName'
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'newLabelFilter',
      label: '素材标签',
      val: [],
      placeholder: '请输入标签关键词',
      filed: 'tags1'
    },

    {
      shrink: true, // 是否支持将筛选项折叠
      hiddenItem: systemVersion.value === 1,
      type: 'input',
      label: '关联模板或剧本',
      val: '',
      placeholder: '请输入关联模板或剧本',
      filed: 'templateName'
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'input',
      label: '上传批次号',
      val: '',
      placeholder: '请输入上传批次号',
      filed: 'batchNumber'
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'dateRange', // 组件类型
      label: '创建时间', // label展示
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      defaultVal: [],
      val: [], // 默认是近七天的数据 new Date(new Date().setDate(new Date().getDate() - 7)), new Date()
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'numberRange',
      label: '使用次数',
      minVal: '',
      maxVal: '',
      isNumber: true,
      minFiled: 'useTimesMin',
      maxFiled: 'useTimesMax',
      placeholder: ['最低次数', '最高次数']
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'input',
      label: '来源成员',
      val: '',
      placeholder: '请输入素材来源成员姓名',
      filed: 'brandUserName'
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'chooseDept',
      label: '来源部门',
      val: [],
      filed: 'areaIds',
      multiple: true,
      isUsePermission: false
    }
  ])

  function getSourcesSelect() {
    const list = [
      {
        label: '全部',
        value: -1
      },
      {
        label: '流水线',
        value: 2
      },
      {
        label: '手动上传',
        value: 3
      },
      {
        label: '征集任务',
        value: 1 // 运营策略是1，选择1的时候增加入参subSource=12才能是征集任务
      },
      {
        label: '第三方平台',
        value: 4
      },
      {
        label: '模板式生成',
        value: 11
      },
      {
        label: '剧本式生成',
        value: 12
      },
      {
        label: '智能混剪',
        value: 14
      },
      {
        label: '图文模板生成',
        value: 16 // 目前只有企业版才有
      }
    ]
    let hideItem = []
    if (systemVersion.value === 2) {
      hideItem = [1, 2, 4, 14, 16]
    } else if (systemVersion.value === 1 || systemVersion.value === 4) {
      hideItem = [1, 2, 4, 16]
    }
    return list.filter(x => !hideItem.includes(x.value))
  }

  // 表格的查询条件
  const tableForm = reactive({
    sources: '',
    isOpen: null, // 开放状态
    type: null, // 媒体类型
    batchNumber: '', // 上传批次号
    pipelineTaskName: '',
    createTimeMin: '',
    createTimeMax: '',
    templateName: '',
    tags1: [],
    useTimesMax: undefined, // 使用次数（最高次数）
    useTimesMin: undefined, // 使用次数（最低次数）
    page: {
      loading: true,
      index: 1,
      size: 24,
      total: null
    },
    videoData: {},
    dataChose: false, // 获取数据后是否赋值为选中--批量操作所有时，关闭弹窗再加载数据需要为true
    choseList: [] // 批量操作，选择的列表
  })
  // 选择的tab
  const chooseTab = ref('DESC:create_time')
  const tabDetail = reactive({
    sortMethods: '', // 选择的tab
    tabList: [
      {
        name: 'DESC:create_time',
        label: '最新创建'
      },
      {
        name: 'DESC:use_times',
        label: '最多使用'
      }
    ]
  })
  // 公共的查询参数
  function getBatchActionCondition() {
    const data = getQuery(searchComponents.value, ['createTimeMin', 'createTimeMax'])
    const condition = {
      brandUserName: data.brandUserName || '',
      areaIds: data.areaIds && data.areaIds.length > 0 ? data.areaIds : [],

      folderIds: [chooseFileId.value || '0'],
      createTimeMax: data.createTimeMax,
      createTimeMin: data.createTimeMin,
      name: data.name || '',
      batchNumber: data.batchNumber || '',
      isOpen: data.isOpen,
      type: data.type ? [data.type] : null,
      pipelineTaskName: data.pipelineTaskName,
      sources: data.sources ? [data.sources] : data.type && data.type === 99 ? [16] : null,
      tags1: data.tags1,
      templateName: data.templateName,
      useTimesMax: data.useTimesMax,
      useTimesMin: data.useTimesMin,
      isDelete: 0,
      orderSetting: chooseTab.value || 'DESC:create_time'
    }
    if (condition.sources && condition.sources.includes(1)) {
      condition.subSource = 12
      condition.sources = null
    } else {
      condition.subSource = null
    }

    if (isNotEmpty(data.businessQueryParams)) {
      condition.businessQueryParams = data.businessQueryParams
    }
    return condition
  }
  // 获取线索列表数据
  function getList() {
    const stu = checkNumberRange(searchComponents.value)
    if (stu) {
      return
    }
    tableForm.page.loading = true
    const params = getBatchActionCondition()
    params.pageNo = tableForm.page.index
    params.pageSize = tableForm.page.size

    // 发送请求
    getWorkLibraryListV2(params)
      .then(res => {
        if (res.code === 0) {
          // tableForm.page.loading = false
          res.data.records = (res.data.records || []).map(item => {
            return {
              ...item,
              itemChose: (tableForm.choseList || []).some(choseItem => choseItem.id === item.id) // 获取别的分页回显选中
            }
          })
          tableForm.videoData = res.data
          // console.log('tableForm.videoData', tableForm.videoData)
          tableForm.page.total = res.data.total

          tableForm.page.loading = false
          changeFileLoading.value = false
        } else {
          tableForm.page.loading = false
          changeFileLoading.value = false
        }
      })
      .catch(() => {
        changeFileLoading.value = false
        tableForm.page.loading = false
      })
  }
  // 校验作品大小
  const workSizeOk = ref(true)
  function isWorkSizeOk() {
    const { maxCapacity, minCapacity } = tableForm
    // console.log(maxCapacity, minCapacity)
    if (maxCapacity && minCapacity && minCapacity > maxCapacity) {
      workSizeOk.value = false
    } else if (maxCapacity === 0 && minCapacity && minCapacity > maxCapacity) {
      workSizeOk.value = false
    } else {
      workSizeOk.value = true
    }
  }
  // 校验使用次数
  const useTimesOk = ref(true)
  function isUseTimesOk() {
    const { minNum, maxNum } = tableForm
    // console.log(maxNum, minNum)
    if (maxNum && minNum && minNum > maxNum) {
      useTimesOk.value = false
    } else if (maxNum === 0 && minNum && minNum > maxNum) {
      useTimesOk.value = false
    } else {
      useTimesOk.value = true
    }
  }
  // 下载图文需要将图文数据的图片和文本依次拆开
  function getImgTextDownloadList(info, isBatch = true) {
    const urlList = []
    let picLen = 0
    // 图文类型 把图片和文本依次下载
    if (isNotEmpty(info.pictures)) {
      const pictureList = JSON.parse(info.pictures)
      picLen = pictureList.length
      pictureList.forEach((onePic, picI) => {
        urlList.push({
          name: (isBatch ? info.name : '') + (picI + 1),
          url: onePic.url,
          content: ''
        })
      })
    }
    if (isNotEmpty(info.imageTextTitle) || isNotEmpty(info.mount)) {
      const imageTextTitle = isNotEmpty(info.imageTextTitle) ? JSON.parse(info.imageTextTitle) : {}
      const mount = isNotEmpty(info.mount) ? JSON.parse(info.mount) : {}
      const title = imageTextTitle.title || ''
      const desc = imageTextTitle.description || ''
      let mountText = ''
      if (
        isNotEmpty(mount) &&
        ((mount.dyTopic && mount.dyTopic.length > 0) ||
          (mount.xhsTopic && mount.xhsTopic.length > 0) ||
          (mount.xhsAt && mount.xhsAt.length > 0))
      ) {
        if (mount.dyTopic && mount.dyTopic.length > 0) {
          mount.dyTopic.forEach(x => {
            mountText += '#' + x.name
          })
        }
        if (mount.xhsTopic && mount.xhsTopic.length > 0) {
          mount.xhsTopic.forEach(x => {
            mountText += '#' + x.name
          })
        }
        if (mount.xhsAt && mount.xhsAt.length > 0) {
          mount.xhsAt.forEach(x => {
            mountText += '@' + x.name
          })
        }
      }
      urlList.push({
        name: (isBatch ? info.name : '') + (picLen + 1),
        url: '',
        content: title + (title ? '\n' : '') + desc + (desc ? '\n' : '') + mountText
      })
    }
    return urlList
  }
  // 因为有涉及到KeepAlive，所以就先复制一份，后续可用
  const searchComponents = ref(searchComponents1.value)
  // 因为有涉及到KeepAlive，所以就先复制一份，后续可用
  // 更新业务主体筛选项
  const initSearch = function () {
    const list = setBusinessChooseParam(null, true)
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  return {
    searchComponents,
    searchComponents1,
    tableForm,
    getList,
    chooseTab,
    tabDetail,
    useTimesOk,
    isUseTimesOk,
    workSizeOk,
    isWorkSizeOk,
    chooseFileId,
    changeFileLoading,
    systemVersion,
    getImgTextDownloadList,
    getBatchActionCondition
  }
}

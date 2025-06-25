/**
 * 获取抖店商品列表数据
 */
import { reactive } from 'vue'
import { getWorkLibraryList } from '@/api/content_center/content_repository.js'
import { getQuery, checkNumberRange } from '@/utils/get_query.js'
export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '作品名称',
      val: '',
      placeholder: '请输入作品名称',
      filed: 'worksName'
    },
    {
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
      type: 'select',
      label: '作品来源',
      placeholder: '请选择作品来源',
      filed: 'originType',
      val: -1,
      defaultVal: -1,
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '运营策略中心',
          value: 1
        },
        {
          label: '智能短视频合成',
          value: 2
        },
        {
          label: '手动上传',
          value: 3
        },
        {
          label: '第三方平台',
          value: 4
        },
        {
          label: '公开模板跟拍',
          value: 9
        },
        {
          label: '灵感跟拍',
          value: 8
        }
      ]
    },
    {
      type: 'input',
      label: '作品标签',
      val: '',
      placeholder: '请输入作品标签',
      filed: 'tagKeywords'
    },
    {
      type: 'numberRange',
      label: '作品大小(MB)',
      minVal: '',
      maxVal: '',
      isNumber: true,
      minFiled: 'minCapacity',
      maxFiled: 'maxCapacity',
      placeholder: ['最小容量', '最大容量']
    },
    {
      type: 'numberRange',
      label: '使用次数',
      minVal: '',
      maxVal: '',
      isNumber: true,
      minFiled: 'minNum',
      maxFiled: 'maxNum',
      placeholder: ['最低次数', '最高次数']
    }
  ])
  // 如果飞书架构下，隐藏灵感跟拍
  function getArchitectureMode() {
    const architectureMode = localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).architectureMode
      : null
    if (architectureMode === 2) {
      searchComponents.value[2].selects = searchComponents.value[2].selects.splice(
        0,
        searchComponents.value[2].selects.length - 1
      )
    }
  }
  getArchitectureMode()
  // 表格的查询条件
  const tableForm = reactive({
    maxCapacity: undefined, // 作品大小（最大容量）
    minCapacity: undefined, // 作品大小（最小容量）
    maxNum: undefined, // 使用次数（最高次数）
    minNum: undefined, // 使用次数（最低次数）
    page: {
      loading: false,
      index: 1,
      size: 35,
      total: null
    },
    videoData: {}
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
  // 获取线索列表数据
  function getList() {
    const stu = checkNumberRange(searchComponents.value)
    if (stu) {
      return
    }
    // 处理请求参数
    const data = getQuery(searchComponents.value)
    // const { minCapacity, maxCapacity, maxNum, minNum } = tableForm
    tableForm.page.loading = true
    const params = {
      name: data.worksName,
      createTimeMin: data.liveStartTimeFrom,
      createTimeMax: data.liveStartTimeTo,
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      sources: data.originType ? [data.originType] : null,
      tagName: data.tagKeywords || null,
      sizeMax: data.maxCapacity ? data.maxCapacity * 1024 * 1024 : data.maxCapacity,
      sizeMin: data.minCapacity ? data.minCapacity * 1024 * 1024 : data.minCapacity,
      useTimesMax: data.maxNum,
      useTimesMin: data.minNum,
      isDelete: 0,
      orderSetting: chooseTab.value
    }
    console.log('获取作品库列表的参数', params)
    // 发送请求
    getWorkLibraryList(params)
      .then(res => {
        if (res.success) {
          tableForm.page.loading = false
          tableForm.videoData = res.data
          tableForm.page.total = res.data.total
        }
        tableForm.page.loading = false
      })
      .catch(() => {
        tableForm.page.loading = false
      })
  }
  // 校验作品大小
  const workSizeOk = ref(true)
  function isWorkSizeOk() {
    const { maxCapacity, minCapacity } = tableForm
    console.log(maxCapacity, minCapacity)
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
    console.log(maxNum, minNum)
    if (maxNum && minNum && minNum > maxNum) {
      useTimesOk.value = false
    } else if (maxNum === 0 && minNum && minNum > maxNum) {
      useTimesOk.value = false
    } else {
      useTimesOk.value = true
    }
  }

  return {
    searchComponents,
    tableForm,
    getList,
    chooseTab,
    tabDetail,
    useTimesOk,
    isUseTimesOk,
    workSizeOk,
    isWorkSizeOk
  }
}

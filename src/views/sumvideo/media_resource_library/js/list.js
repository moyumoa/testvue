/**
 *
 */
import { reactive } from 'vue'
import { list } from '@/api/content_center/material_library.js'
import { getQuery } from '@/utils/get_query.js'

// 批量操作

import { throttle, getCWidth } from '@/utils/tools.js'
export function pageList() {
  const chooseFileId = ref(null) // 选中的fileId
  const showBatch = ref(false)
  const chooseList = ref([]) // 选中的数据
  // 选择的tab
  const chooseTab = ref(-1)
  const tabList = ref([
    {
      label: '全部',
      value: -1
    },
    {
      label: 'BGM',
      value: 4
    },
    {
      label: '字体',
      value: 5
    },
    {
      label: '音效',
      value: 2
    },
    {
      label: '贴纸',
      value: 3
    }
  ])
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '资源名称',
      val: '',
      placeholder: '请输入资源名称',
      filed: 'name'
    },
    {
      type: 'select',
      label: '资源类型',
      placeholder: '请选择资源类型',
      filed: 'specificType1',
      val: -1,
      defaultVal: -1,
      selects: tabList.value
    },

    {
      type: 'select',
      label: '资源来源',
      placeholder: '请选择资源来源',
      filed: 'subSource',
      val: -1,
      defaultVal: -1,
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '本地上传',
          value: 5
        },
        {
          label: '从原料库导入',
          value: 6
        }
      ]
    },
    {
      type: 'input',
      label: '上传批次号',
      val: '',
      placeholder: '请输入上传批次号',
      filed: 'batchNumber'
    },
    {
      type: 'newLabelFilterV2',
      label: '资源标签',
      behavior: '选择',
      val: [], // 选择数据
      choseName: '标签',
      placeholder: '请输入标签关键词',
      filed: 'tags',
      addTagInfo: {
        type: 19,
        hideTitleSpan: false,
        id: null,
        index: [],
        source: null
      } // addTag的需要的相关数据，比如回显等，不会在入参内
    },
    {
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
      type: 'dateRange', // 组件类型
      label: '创建时间', // label展示
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      defaultVal: [],
      val: [], // 默认是近七天的数据 new Date(new Date().setDate(new Date().getDate() - 7)), new Date()
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    }
  ])

  // 表格的查询条件
  const tableForm = reactive({
    loading: true,
    listData: [],
    newListData: [],
    page: {
      index: 1,
      size: 50,
      total: 0
    }
  })

  const columns = ref([])
  const arrIndex = ref([])
  function listChange(list) {
    list.forEach(x => {
      // 只有图片是1:1 其他都是22:15
      x.showWidth = 220
      x.showHeight = 220 * (x.type === 2 ? 1 : 0.6818)
      x.top = ''
    })
    return list
  }
  function getParams(type) {
    console.log('ttt', type)
    const params = getQuery(searchComponents.value, ['createTimeMin', 'createTimeMax'])
    params.isDelete = 0
    params.sources = [6, 17]
    params.folderIds = ['0']
    params.tagType = 10
    if (params.specificType1) {
      params.specificTypes = params.specificType1 === 5 ? [5, 6] : [params.specificType1]
      if (params.specificType1 === 5) {
        params.fontApplyType = 1 // 表示只展示剪辑页使用的字体
      }
    } else {
      params.specificTypes = []
    }
    if (params.subSource) {
      params.subSource = [params.subSource]
    } else {
      params.subSource = [5, 6]
    }
    if (type && type !== 'batchSearch') {
      console.log('params.specificType1', params.specificType1 || -1)
      chooseTab.value = parseInt(params.specificType1 || -1)
      console.log('params.specificType1-chooseTab.value', chooseTab.value)
    }
    if (type && type === 'batchSearch') {
      params.sources = [17]
    }

    return params
  }
  // 获取线索列表数据
  function getList(type) {
    return new Promise((resolve, reject) => {
      tableForm.loading = true
      // params. folderIds= [chooseFileId.value || '0']
      const params = getParams(type)

      params.pageNo = tableForm.page.index
      params.pageSize = tableForm.page.size
      console.log('params', params.originType)
      // 如果开启批量操作，就过滤内置的
      if (showBatch.value || type === 'batchSearch') {
        params.pageSize = 200
      }
      // 发送请求
      list(params)
        .then(res => {
          const arr = []
          res.data.records.forEach(item => {
            arr.push(item.tagList)
          })

          if (res.code === 0) {
            ;(res.data.records || []).forEach(x => {
              x.isChecked = chooseList.value.findIndex(y => y.id === x.id) > -1
            })
            if (tableForm.page.index === 1) {
              tableForm.listData = listChange(res.data.records || [])
              tableForm.page.total = res.data.total || 0
            } else {
              tableForm.newListData = listChange(res.data.records || [])
              tableForm.listData = tableForm.listData.concat(tableForm.newListData)
            }
          } else {
            if (tableForm.page.index === 1) {
              tableForm.listData = []
              tableForm.page.total = 0
            }
          }
          tableForm.loading = false
          resolve()
        })
        .catch(() => {
          if (tableForm.page.index === 1) {
            tableForm.listData = []
            tableForm.page.total = 0
          }
          tableForm.loading = false
          resolve()
        })
    })
  }

  function getMinHeight(arr) {
    const a = []
    for (let i = 0; i < arr.length; i++) {
      a.push(parseInt(arr[i].showHeight || 0) + parseInt(arr[i].top || 0))
    }
    return Math.min.apply(null, a)
  }
  function getMinIndex(val) {
    for (let i = 0; i < columns.value.length; i++) {
      const showHeight =
        columns.value[i].columnArr.length > 0
          ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
          : 0
      const top =
        columns.value[i].columnArr.length > 0
          ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
          : 0
      if (parseInt(showHeight) + parseInt(top) === val) {
        arrIndex.value.push(i)
      }
    }
  }
  const listWidth = ref()
  const oneWidth = ref(220)

  function init() {
    columns.value = []
    const contentLen = tableForm.listData.length
    const cLen = parseInt(listWidth.value / 234) // 256=UI图的单个宽度220+每个单图间距14

    // 初始化每一列的第一行原料
    for (let i = 0; i < cLen; i++) {
      if (i < tableForm.listData.length) {
        tableForm.listData[i].top = 0 // 预设距离顶部值为0
        columns.value.push({ columnArr: [tableForm.listData[i]] })
      } else {
        columns.value.push({
          columnArr: []
        })
      }
    }

    // 对剩余原料的判断，应该放到哪一列
    for (let index = cLen; index < contentLen; index++) {
      arrIndex.value = []
      const arr = [] // 找到高度最小的一列，可能有多个
      let minHeight = 0 // 高度最小的一列的高度
      let pushIndex = 0 // 高度最小的一列所在位置的索引

      for (let i = 0; i < columns.value.length; i++) {
        arr.push({
          showHeight:
            columns.value[i].columnArr.length > 0
              ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
              : 0,
          top:
            columns.value[i].columnArr.length > 0
              ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
              : 0
        })
      }

      minHeight = getMinHeight(arr)
      getMinIndex(minHeight)

      if (arrIndex.value.length > 0) {
        pushIndex = Math.min.apply(null, arrIndex.value) // 出现高度一样的，去索引最小的
      }

      tableForm.listData[index].top = minHeight + 20
      columns.value[pushIndex].columnArr.push(tableForm.listData[index])
    }
  }

  function getContentWidth() {
    listWidth.value = getCWidth() - 32 - 24 - 7 - 7 //
    const cLen = parseInt(listWidth.value / 234) // 256=UI图的单个宽度220+每个单图间距14
    oneWidth.value = Math.floor(listWidth.value / cLen) - 14
  }
  const load = throttle(function () {
    if (tableForm.loading) return
    tableForm.loading = true
    tableForm.page.index++
    getList().then(() => {
      //  从接口最新获取的原料push到目前高度最小的一列
      for (let index = 0; index < tableForm.newListData.length; index++) {
        arrIndex.value = []
        const arr = [] // 找到高度最小的一列，可能有多个
        let minHeight = 0 // 高度最小的一列的高度
        let pushIndex = 0 // 高度最小的一列所在位置的索引
        for (let i = 0; i < columns.value.length; i++) {
          arr.push({
            showHeight:
              columns.value[i].columnArr.length > 0
                ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].showHeight
                : 0,

            top:
              columns.value[i].columnArr.length > 0
                ? columns.value[i].columnArr[columns.value[i].columnArr.length - 1].top
                : 0
          })
        }

        minHeight = getMinHeight(arr)
        getMinIndex(minHeight)
        if (arrIndex.value.length > 0) {
          pushIndex = Math.min.apply(null, arrIndex.value) // 出现高度一样的，去索引最小的
        }

        tableForm.newListData[index].top = minHeight + 20
        columns.value[pushIndex].columnArr.push(tableForm.newListData[index])
        tableForm.loading = false
      }
    })
  }, 1000)

  return {
    showBatch,
    chooseList,
    init,
    columns,
    load,
    listChange,
    searchComponents,
    tableForm,
    getList,
    getParams,
    chooseTab,
    tabList,
    chooseFileId,
    listWidth,
    oneWidth,
    getContentWidth
  }
}

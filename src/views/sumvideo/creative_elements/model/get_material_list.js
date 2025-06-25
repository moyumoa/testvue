/**
 * 获取抖店商品列表数据
 */
import { reactive } from 'vue'
import { list, saveStatLog } from '@/api/content_center/material_library.js'
import { getQuery } from '@/utils/get_query.js'
import { useStore } from 'vuex'
import { setBusinessChooseParam } from '@/utils/search.js'

// 批量操作

import { throttle, getCWidth, isNotEmpty } from '@/utils/tools.js'
export function pageList() {
  const chooseFileId = ref(null) // 选中的fileId
  const showBatch = ref(false)
  // 选择的tab
  const chooseTab = ref(-1)
  const store = useStore()
  // 基础版只显示矩阵号等级规则，其余版本显示完整
  const systemVersion = computed(() => store.state.user.systemVersion)
  const tabList = ref([
    {
      name: -1,
      label: '全部'
    },
    {
      name: 1,
      label: '视频'
    },
    {
      name: 2,
      label: '图片'
    },
    {
      name: 3,
      label: '音频'
    },
    {
      name: 4,
      label: '文本'
    }
  ])
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '原料名称',
      val: '',
      placeholder: '请输入原料名称',
      filed: 'name'
    },
    {
      type: 'select',
      label: '原料类型',
      placeholder: '请选择原料类型',
      filed: 'type',
      val: -1,
      defaultVal: -1,
      selectDefultName: ['name', 'label'],
      selects: tabList.value
    },
    {
      type: 'select',
      label: '原料来源',
      placeholder: '请选择原料来源',
      filed: 'sources',
      val: null,
      defaultVal: null,
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      selects: getSourcesSelect()
    },
    {
      type: 'input',
      label: '上传批次号',
      val: '',
      placeholder: '请输入上传批次号',
      filed: 'batchNumber'
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'newLabelFilter',
      label: '原料标签',
      val: [],
      placeholder: '请输入标签关键词',
      filed: 'tags'
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'numberRange2',
      label: '使用次数',
      minVal: '',
      maxVal: '',
      style: 'width: 120px',
      isNumber: true,
      minFiled: 'useTimesMin',
      maxFiled: 'useTimesMax',
      placeholder: ['最低使用次数', '最高使用次数']
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'dateRange', // 组件类型
      label: '创建时间', // label展示
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      val: null,
      // defaultVal: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
      // val: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()], // 默认是近七天的数据
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'input',
      label: '来源成员',
      val: '',
      placeholder: '请输入原料来源成员姓名',
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
        label: '营销任务上传',
        value: 1
      },
      {
        label: '流水线上传',
        value: 2
      },
      {
        label: '剪辑页上传',
        value: 7
      },
      {
        label: '原料库上传',
        value: 3
      },
      {
        label: '云原料',
        value: 6
      },
      {
        label: '封面制作上传',
        value: 10
      },
      {
        label: '智能拆解',
        value: 13
      },
      {
        label: '模板式生成上传',
        value: 11
      },
      {
        label: '智能混剪上传',
        value: 14
      },
      // {
      //   label: '剧本式生成上传',
      //   value: 12
      // }
      {
        label: '原料合并',
        value: 30
      },
      {
        label: '原料拆分',
        value: 31
      }
    ]
    let hideItem = []
    if (systemVersion.value === 2) {
      hideItem = [1, 2, 14]
    } else if (systemVersion.value === 1) {
      hideItem = [1, 2]
    } else if (systemVersion.value === 4) {
      hideItem = [2]
    }
    return list.filter(x => !hideItem.includes(x.value))
  }

  // 表格的查询条件
  const tableForm = reactive({
    // useTimesMax: undefined, // 使用次数（最高次数）
    // useTimesMin: undefined, // 使用次数（最低次数）
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
      if (x.type === 1 || x.type === 2) {
        const showHeight = x.wight ? (176 / x.wight) * x.height : 126
        x.showHeight = showHeight < 126 ? 126 : showHeight
      } else if (x.type === 3) {
        x.showHeight = 198
      } else if (x.type === 4) {
        x.showHeight = 230
      } else {
        x.showHeight = 126
      }
      x.top = ''
    })
    return list
  }

  // 获取线索列表数据
  function getList() {
    return new Promise((resolve, reject) => {
      // 判断是否可以发送请求
      // 处理请求参数
      const data = getQuery(searchComponents.value)
      // const { useTimesMax, useTimesMin } = tableForm
      chooseTab.value = data.type === null ? -1 : data.type
      tableForm.loading = true
      const params = {
        brandUserName: data.brandUserName || '',
        areaIds: data.areaIds && data.areaIds.length > 0 ? data.areaIds : [],
        folderIds: [chooseFileId.value || '0'],
        isDelete: 0,
        name: data.name,
        createTimeMin: data.liveStartTimeFrom,
        createTimeMax: data.liveStartTimeTo,
        pageNo: tableForm.page.index,
        pageSize: tableForm.page.size,
        sources: data.sources && data.sources.length > 0 ? data.sources : null,
        tagName: data.tagName,
        useTimesMin: data.useTimesMin,
        useTimesMax: data.useTimesMax,
        type: chooseTab.value === -1 ? [] : [chooseTab.value],
        tags: data.tags,
        batchNumber: data.batchNumber,
        subSource: [1, 0] // 限定原料的子来源  1是 原料征集 0是未指定子来源的原料
      }
      // 如果标签有内容 就记录标签查询记录
      if (isNotEmpty(data.tags)) {
        saveTagLog(data.tags)
      }
      if (isNotEmpty(data.businessQueryParams)) {
        params.businessQueryParams = data.businessQueryParams
      }
      // 发送请求
      list(params)
        .then(res => {
          const arr = []
          res.data.records.forEach(item => {
            arr.push(item.tagList)
          })
          // console.log(arr, 'list res')
          if (res.code === 0) {
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

  const saveTagLog = list => {
    saveStatLog(
      list.map(item => {
        return {
          key: `query_tag_${item}`,
          value: item
        }
      })
    )
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
  // const containerWidth = ref(null)
  function init() {
    // console.log(container.value.clientWidth)
    columns.value = []
    const contentLen = tableForm.listData.length
    // 根据可视区域的宽度判断需要几列
    const cLen = Math.floor((getCWidth() - 32 - 48 - 84) / 176)
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

  // 更新业务主体筛选项
  const initSearch = function () {
    const list = setBusinessChooseParam(null, true)
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  return {
    showBatch,
    init,
    columns,
    load,
    listChange,
    searchComponents,
    tableForm,
    getList,
    chooseTab,
    tabList,
    chooseFileId
  }
}

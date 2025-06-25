/**
 * 获取抖店商品列表数据 - 该文件未用到
 */
import { reactive } from 'vue'
import { list, batchOpr, batchAddRemove } from '@/api/content_center/material_library.js'
import { getQuery } from '@/utils/get_query.js'
import { ElMessage } from 'element-plus'
// 批量操作

import { throttle, getCWidth } from '@/utils/tools.js'
export function pageList() {
  // 选择的tab
  const chooseTab = ref(-1)
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
      label: '名称',
      val: '',
      placeholder: '请输入名称',
      filed: 'name'
    },
    {
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
      type: 'select',
      label: '类型',
      placeholder: '全部',
      filed: 'type',
      val: -1,
      defaultVal: -1,
      selectDefultName: ['name', 'label'],
      selects: tabList.value
    },
    {
      type: 'select',
      label: '作品来源',
      placeholder: '全部',
      filed: 'sources',
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
          label: 'Sumvideo上传',
          value: 2
        },
        {
          label: '手动上传',
          value: 3
        },
        {
          label: '第三方平台',
          value: 4
        }
      ]
    },
    {
      type: 'newLabelFilter',
      label: '标签',
      val: [],
      placeholder: '请输入标签关键词',
      filed: 'tags'
    },
    {
      type: 'input',
      label: '上传批次号',
      val: '',
      placeholder: '请输入上传批次号',
      filed: 'batchNumber'
    }
  ])
  // 表格的查询条件
  const tableForm = reactive({
    useTimesMax: undefined, // 使用次数（最高次数）
    useTimesMin: undefined, // 使用次数（最低次数）
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
        const showHeight = x.wight ? (220 / x.wight) * x.height : 108
        x.showHeight = showHeight < 108 ? 108 : showHeight
      } else if (x.type === 3) {
        x.showHeight = 132
      } else if (x.type === 4) {
        x.showHeight = 182
      } else {
        x.showHeight = 108
      }
      x.top = ''
    })
    return list
  }
  // 批量删除
  const batchInit = ref(false)
  function batchOprD(params) {
    batchOpr(params).then(res => {
      if (res.code === 0) {
        // 删除成功,退出批量，重新获取列表
        ElMessage.success('删除成功！')
        batchInit.value = true
        getList().then(() => {
          init()
        })
      }
    })
  }
  // 批量打标去标
  function batchAddRemoveS(params) {
    batchAddRemove(params).then(res => {
      console.log(res, '批量操作')
      if (res.code === 0) {
        // 删除成功,退出批量，重新获取列表
        ElMessage.success('操作成功！')
        batchInit.value = true
        getList().then(() => {
          init()
        })
      }
    })
  }

  // 获取线索列表数据
  function getList() {
    return new Promise((resolve, reject) => {
      // 判断是否可以发送请求
      // 处理请求参数
      const data = getQuery(searchComponents.value)
      const { useTimesMax, useTimesMin } = tableForm
      chooseTab.value = data.type === null ? -1 : data.type
      tableForm.loading = true
      const params = {
        isDelete: 0,
        name: data.name,
        createTimeMin: data.liveStartTimeFrom,
        createTimeMax: data.liveStartTimeTo,
        pageNo: tableForm.page.index,
        pageSize: tableForm.page.size,
        sources: data.sources ? [data.sources] : null,
        tagName: data.tagName,
        useTimesMin: useTimesMin,
        useTimesMax: useTimesMax,
        type: chooseTab.value === -1 ? [] : [chooseTab.value],
        tags: data.tags,
        batchNumber: data.batchNumber
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

    // 假设图片宽度为100px
    // containerWidth.value = getCWidth() - 32 - 48 - 84
    const cLen = Math.floor((getCWidth() - 32 - 48 - 84) / 220)
    // 初始化每一列的第一行元素
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

    // 对剩余元素的判断，应该放到哪一列
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
    tableForm.loading = true
    tableForm.page.index++
    getList().then(() => {
      //  从接口最新获取的元素push到目前高度最小的一列
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
    init,
    columns,
    load,
    listChange,
    searchComponents,
    tableForm,
    getList,
    chooseTab,
    tabList,
    batchOprD,
    batchInit,
    batchAddRemoveS
  }
}

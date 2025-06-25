/**
 * 金币换礼--列表
 */
import { reactive } from 'vue'
import { listByPage } from '@/api/market/gold_exchange_gifts.js'
import { getQuery } from '@/utils/get_query.js'
export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '商品名称',
      val: '',
      placeholder: '请输入商品名称',
      filed: 'goodsName'
    },
    {
      type: 'select',
      label: '状态',
      val: null,
      placeholder: '请选择状态',
      filed: 'openStatus',
      selects: [
        {
          label: '全部',
          value: null
        },
        {
          label: '开启兑换',
          value: 1
        },
        {
          label: '未开启兑换',
          value: 0
        }
      ]
    },
    {
      type: 'select',
      label: '秒杀商品',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择状态',
      filed: 'isSecKill',
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
  // 处理部门，回显组件选择：showDeptIds:[[id,id,id],[id,id]] 列表显示字段
  function getManagement(dtos) {
    const showDeptIds = [] // 组件回显用
    let orgInfo = '' // 列表显示用
    if (!Array.isArray(dtos) || !dtos) return { showDeptIds, orgInfo }
    dtos.forEach(item => {
      showDeptIds.push(item.deptIds)
      orgInfo += item.deptNames.join('/') + ';'
    })
    return {
      showDeptIds,
      orgInfo: orgInfo.slice(0, -1) // 删除最后一个分号
    }
  }

  function getList() {
    const data = getQuery(searchComponents.value)
    data.searchCount = true
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.orderSetting = ''
    listByPage(data)
      .then(res => {
        if (res.code === 0) {
          const list = res.data.records || []
          list.forEach(x => {
            x.isEdit = false
            x.goodsSort = x.weight
            x.isOpen = x.openStatus === 1
            x.orgInfo = getManagement(x.orgInfoDTOS).orgInfo
            x.showDeptIds = getManagement(x.orgInfoDTOS).showDeptIds
          })
          // console.log('处理后的数据', list)
          tableForm.listData = list
          tableForm.page.total = res.data.total || 0
        } else {
          if (tableForm.page.index === 1) {
            tableForm.listData = []
          }
        }
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.loading = false
      })
  }
  return { searchComponents, tableForm, getList }
}

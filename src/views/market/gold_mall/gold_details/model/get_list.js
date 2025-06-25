/**

 */
import { reactive } from 'vue'
import { getListByPage } from '@/api/market/gold.js'
import { getQuery } from '@/utils/get_query'
import { getGoldList } from '@/api/market/gold_exchange_gifts.js'
import { useStore } from 'vuex'

export function pageList() {
  const store = useStore()
  // 基础版只显示矩阵号等级规则，其余版本显示完整
  const systemVersion = computed(() => store.state.user.systemVersion)

  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '用户名',
      val: '',
      placeholder: '请输入用户名',
      filed: 'name'
    },
    {
      type: 'input',
      label: '手机号码',
      val: '',
      placeholder: '请输入手机号码',
      filed: 'telephone'
    },
    {
      type: 'dateRange',
      label: '变更日期', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'select',
      label: '变更原因',
      placeholder: '请选择变更原因',
      val: -1,
      defaultVal: -1,
      filed: 'type',
      selects:
        systemVersion.value === 4
          ? [
              {
                label: '全部',
                value: -1
              },
              {
                label: '完成指标',
                value: 1
              },
              // {
              //   label: '完成任务',
              //   value: 2
              // },
              {
                label: '兑换礼品',
                value: 3
              },
              // {
              //   label: '直播质检',
              //   value: 4
              // },
              {
                label: '手动变更',
                value: 5
              },
              {
                label: '金币过期',
                value: 9
              }
            ]
          : [
              {
                label: '全部',
                value: -1
              },
              {
                label: '完成指标',
                value: 1
              },
              // {
              //   label: '完成任务',
              //   value: 2
              // },
              {
                label: '兑换礼品',
                value: 3
              },
              // {
              //   label: '直播质检',
              //   value: 4
              // },
              {
                label: '手动变更',
                value: 5
              },
              {
                label: '金币过期',
                value: 9
              },
              {
                label: '成长等级提升',
                value: 8
              }
              // {
              //   label: '金币清零',
              //   value: 6
              // },
              // {
              //   label: '删除视频',
              //   value: 7
              // }
            ]
    },
    {
      type: 'select',
      label: '金币类型',
      val: -1,
      defaultVal: -1,
      filed: 'goldTypeId',
      selects: [
        {
          label: '全部',
          value: -1
        }
      ]
    },
    {
      type: 'input',
      label: '备注',
      placeholder: '请输入关键词',
      val: '',
      filed: 'reason'
    }
  ])
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 5,
      total: 0
    }
  })

  function getList() {
    tableForm.loading = true
    const data = getQuery(searchComponents.value, ['changeBeginTime', 'changeEndTime'])
    data.searchCount = true
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    getListByPage(data)
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = transformStatus(res.data.records) || []
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

  function transformStatus(res) {
    const listData = res.map(function (item) {
      item.showPhone = false
      const typeNum = {
        1: '完成指标',
        3: '兑换礼品',
        5: '手动变更',
        6: '金币清零',
        8: '成长等级升级',
        9: '金币过期'
      }
      item.typeName = typeNum[item.type] ?? '完成指标'

      return item
    }, this)
    return listData
  }
  function showTel(index, bool) {
    tableForm.listData[index].showPhone = bool
  }
  // 获取金币类型
  onBeforeMount(() => {
    console.log(searchComponents.value)
    getGoldList({}).then(res => {
      if (res?.code === 0) {
        let options = res.data || []
        options = options.map(item => {
          return {
            label: item.name,
            value: item.id
          }
        })
        options = [{ label: '全部', value: -1 }].concat(options)
        searchComponents.value.find(item => item.filed === 'goldTypeId').selects = options
      }
    })
  })

  return { searchComponents, tableForm, getList, showTel }
}

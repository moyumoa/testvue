/**
 * 获取直播中心列表数据
 */
import { reactive } from 'vue'
import { videoList } from '@/api/content_center/inspection.js'
import { getQuery } from '@/utils/get_query.js'

export function pageList() {
  // tab选择
  const chooseTab = ref('cv.create_time')
  const tabList = ref([
    {
      name: 'cv.create_time',
      label: '默认排序' // 视频发布时间
    },
    {
      name: 'cv.play_count',
      label: '播放数排序'
    },
    {
      name: 'cv.digg_count',
      label: '点赞数排序'
    },
    {
      name: 'cv.comment_count',
      label: '评论数排序'
    },
    {
      name: 'cv.share_count',
      label: '分享数排序'
    },

    {
      name: 'clue_cnt',
      label: '线索数排序'
    }
    // {
    //   name: 'add_fans_num',
    //   label: '已获得金币数排序'
    // },
  ])
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '视频标题',
      val: '',
      placeholder: '请输入视频标题',
      filed: 'title'
    },
    {
      type: 'input',
      label: '矩阵号昵称',
      val: '',
      placeholder: '请输入矩阵号昵称',
      filed: 'nickname'
    },
    {
      type: 'select',
      label: '质检状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择质检状态',
      filed: 'checkStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '未质检',
          value: 0
        },
        {
          label: '质检合格',
          value: 1
        },
        {
          label: '质检不合格',
          value: 2
        }
      ]
    },
    {
      type: 'select',
      label: '风险项',
      val: '',
      defaultVal: '',
      placeholder: '请选择',
      filed: 'riskCondition',
      selects: [
        {
          label: '点赞播放比低于0.1%（播放数>1000）',
          value: 1
        }
      ]
    },
    {
      type: 'numberRange',
      label: '播放数',
      minVal: '',
      maxVal: '',
      isNumber: true,
      minFiled: 'playNumStart',
      maxFiled: 'playNumEnd'
    },
    {
      type: 'numberRange',
      label: '点赞数',
      minVal: '',
      maxVal: '',
      isNumber: true,
      minFiled: 'diggNumStart',
      maxFiled: 'diggNumEnd'
    },
    {
      type: 'dateRange', // 组件类型
      label: '视频发布时间', // label展示
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
      label: '是否任务视频',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择',
      filed: 'isRelatedTask',
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
      type: 'select',
      label: '所属平台',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择',
      filed: 'platform',
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
  const statusList = reactive(
    new Map([
      [0, { label: '未质检', class: '' }],
      [1, { label: '质检合格', class: 'green_circle' }],
      [2, { label: '质检不合格', class: 'red_circle' }]
    ])
  )

  function getList() {
    let data = getQuery(searchComponents.value, ['publishTimeStart', 'publishTimeEnd'])
    data.searchCount = true
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    // data.diggNumStart = Number(data.diggNumStart)
    // 如果是空字符串，就传null
    const itemList = JSON.stringify(data)
    const result = itemList.replace(/""/g, 'null')
    data = JSON.parse(result)
    // 如果点赞数和播放量的起始值大于终止值，提示并返回
    data.orderSetting = 'DESC:' + chooseTab.value
    videoList(data)
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = res.data.records || []
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

  return { searchComponents, tableForm, statusList, getList, chooseTab, tabList }
}

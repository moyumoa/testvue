import {
  listUserForPc,
  deleteUserInfo,
  changeUserInfo,
  exportUserData
} from '@/api/system_setting/account'
import { selectUserInfoData } from '@/api/system_setting/personal'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getQuery } from '@/utils/get_query.js'
import { isNotEmpty } from '@/utils/tools'
import { getProductUseInfo } from '@/api/system_setting/brand_info.js'
import Track from '@/utils/tracking'
import { exportFileV2 } from '@/utils/exportFile'
import { setBusinessChooseParam } from '@/utils/search.js'

export const useAccount = () => {
  const searchComponents = ref([
    {
      type: 'input',
      label: '用户',
      val: '',
      placeholder: '请输入用户名、手机号',
      filed: 'userName'
    },
    {
      type: 'select',
      label: '状态',
      placeholder: '请选择状态',
      filed: 'status',
      val: -1,
      defaultVal: -1,
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '已启用',
          value: 1
        },
        {
          label: '已禁用',
          value: 0
        }
      ]
    },
    {
      type: 'select',
      label: '后台账号',
      placeholder: '请选择开启状态',
      filed: 'loginBack',
      val: -1,
      defaultVal: -1,
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '开启',
          value: 1
        },
        {
          label: '关闭',
          value: 0
        }
      ]
    },
    {
      type: 'select',
      label: 'AI终端账号',
      placeholder: '请选择开启状态',
      filed: 'loginMini',
      val: -1,
      defaultVal: -1,
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '开启',
          value: 1
        },
        {
          label: '关闭',
          value: 0
        }
      ]
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'select',
      label: '角色',
      placeholder: '请选择角色',
      filed: 'roleIdList',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      val: null,
      selectDefultName: ['roleId', 'roleName'],
      selects: []
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'input',
      label: '员工',
      val: '',
      placeholder: '请输入员工姓名',
      filed: 'fsName'
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'input',
      label: '员工ID',
      val: '',
      placeholder: '请输入员工ID',
      filed: 'thirdPartyStaffId'
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'chooseDept',
      label: '组织架构',
      val: [],
      filed: 'depIds',
      multiple: false,
      isUsePermission: true
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'dateRange', // 组件类型
      label: '创建时间', // label展示
      val: '', // 响应式绑定
      // disabledDate(time) {
      //   return time.getTime() > Date.now()
      // }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    }
  ])

  // 更新业务主体筛选项
  const initSearch = function () {
    const list = setBusinessChooseParam(null, true)
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  const state = reactive({
    loading: false,
    searchParams: {},
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 10
    }
  })
  const userTable = ref(null)

  const $data = reactive({
    pcClientNumber: 0, // 后台账号数量上限
    pcClientRealRemainNum: 0, // 后台账号剩余可用数-真实的
    pcClientRemainNum: 0, // 后台账号剩余可用数
    miniClientNumber: 0, // AI终端账号数量-上限
    miniClientRealRemainNum: 0, // ai终端账号剩余可用数-真实的
    miniClientRemainNum: 0, // ai终端账号剩余可用数
    showBatch: false, // 是否显示批量操作按钮
    showBatchLoading: false,
    loginBackLoading: false, // 开关后台账号的loading
    loginMiniLoading: false, // 开关AI终端账号的loading
    isAll: false, // 表格是否全选
    isAllTotal: 0, // 失效账号数
    chooseList: [] // 选中的用户
  })

  // 设置表格全选
  async function setCheck(check) {
    state.listData.forEach(y => {
      if (y.isValid === 1) {
        userTable.value?.$refs.table.toggleRowSelection(y, check)
      } else {
        userTable.value?.$refs.table.toggleRowSelection(y, false)
      }
    })
    const unSelectTotal = (await getListBeforeBatch(null, true)) || 0
    $data.isAllTotal = state.page.total - unSelectTotal
  }

  // 获取账号使用详情
  function getProductUseInfoFn() {
    getProductUseInfo().then(res => {
      if (res.code === 0) {
        $data.pcClientNumber = res.data?.pcClientNumber || 0
        $data.pcClientRealRemainNum = res.data?.pcClientRealRemainNum || 0
        $data.pcClientRemainNum = res.data?.pcClientRemainNum || 0
        $data.miniClientNumber = res.data?.miniClientNumber || 0
        $data.miniClientRealRemainNum = res.data?.miniClientRealRemainNum || 0
        $data.miniClientRemainNum = res.data?.miniClientRemainNum || 0
      }
    })
  }
  // 详请数据
  const detailData = reactive({
    show: false,
    title: '详情',
    row: {},
    userId: ''
  })

  const resetSelect = () => {
    $data.isAll = false
    userTable.value?.$refs.table.clearSelection()
  }
  const searchList = (params = {}) => {
    resetSelect()
    state.page.index = 1
    getList()
  }
  function setTime(e) {
    if (e) {
      const len = e.split(' ')
      return len[0] + 'T' + len[1]
    } else {
      return null
    }
  }

  function getListParams() {
    const data = getQuery(searchComponents.value, ['createStartTime', 'createEndTime'])
    data.createEndTime = setTime(data.createEndTime)
    data.createStartTime = setTime(data.createStartTime)
    data.depIds = isNotEmpty(data.depIds) ? [data.depIds] : []
    data.pageNumber = state.page.index
    data.pageSize = state.page.size
    return data
  }

  function updateChooseList() {
    // 如果当前页有已选的数据，就更新下
    if ($data.chooseList && $data.chooseList.length > 0) {
      $data.chooseList = $data.chooseList
        .map(x => {
          const index = state.listData.findIndex(xx => xx.userId === x.userId)
          if (index > -1) {
            if (state.listData[index]?.isValid === 1) {
              return state.listData[index]
            } else {
              const item = state.listData[index]
              userTable.value?.$refs.table.toggleRowSelection(item, false) // 取消选择并从chooseList删除
              return undefined
            }
          }
          return x
        })
        .filter(item => item !== undefined)
    }
  }

  const getList = () => {
    state.loading = true
    const data = getListParams()
    state.searchParams = data
    listUserForPc(data)
      .then(res => {
        const list = res.data.records || []
        list.forEach(x => {
          if (x.fsAccount) {
            if (x.fsAccount.departmentList) {
              x.fsAccount.showDepartment = x.fsAccount.departmentList.map(i => i.name).join('/')
            } else {
              x.fsAccount.showDepartment = ''
            }
          }
        })
        state.listData = list
        state.page.total = res.data.total
        // 如果选择了全选，那每次切换页面，都要全选
        nextTick(() => {
          if ($data.isAll) {
            setCheck(true)
          } else {
            updateChooseList()
          }
        })

        state.loading = false
      })
      .catch(() => {
        state.loading = false
      })
  }
  // 批量操作开启前，获取关闭的账号信息 isStatus是否获取失效列表
  function getListBeforeBatch(isMini = false, isStatus = false) {
    return new Promise((resolve, reject) => {
      const data = getListParams()
      data.pageNumber = 1 // 获取第一页就行
      if (isStatus) {
        data.status = 0
      } else {
        if (isMini) {
          data.loginMini = 0
        } else {
          data.loginBack = 0
        }
      }

      listUserForPc(data)
        .then(res => {
          resolve(res?.data?.total || 0)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
  // const queryList = params => {
  //   state.page.index = 1
  //   getList(params)
  // }
  //
  const handleToggle = (userBrandId, account, isValid, params) => {
    if (account && account.staffStatus === 2 && isValid === 0) {
      ElMessageBox.confirm('当前账号绑定员工已离职，开启后该手机号将允许登录系统，是否启用', {
        confirmButtonText: '启用',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeStatus(userBrandId, params)
      })
    } else {
      changeStatus(userBrandId, params)
    }
  }
  const changeStatus = (userBrandId, params) => {
    changeUserInfo({ userBrandId }).then(res => {
      ElMessage.success('切换成功')
      getList()
      getProductUseInfoFn()
    })
  }

  const handleDel = (userBrandId, params) => {
    deleteUserInfo({ userBrandId }).then(res => {
      ElMessage.success('删除成功')
      getList()
    })
  }
  // 查询用户详情
  const selectData = (brandId, companyCode, userId) => {
    selectUserInfoData({
      brandId: brandId,
      userId: userId
    }).then(res => {
      detailData.row = res.data
    })
  }

  const toDetail = row => {
    detailData.show = true
    detailData.userId = row.userId
    const { brandId, companyCode } = JSON.parse(localStorage.getItem('brandInfo'))
    selectData(brandId, companyCode, row.userId, row.userId)
  }

  // 导出数据
  const exportData = () => {
    Track.clickBtn(213)
    const data = getQuery(searchComponents.value, ['createStartTime', 'createEndTime'])
    data.createEndTime = setTime(data.createEndTime)
    data.createStartTime = setTime(data.createStartTime)
    data.depIds = isNotEmpty(data.depIds) ? [data.depIds] : []
    return exportFileV2(exportUserData, data, '用户管理数据导出', 'xlsx')
  }

  return {
    searchComponents,
    state,
    getList,
    searchList,
    handleToggle,
    handleDel,
    selectData,
    detailData,
    toDetail,
    getProductUseInfoFn,
    $data,
    userTable,
    setCheck,
    resetSelect,
    getListBeforeBatch,
    exportData
  }
}

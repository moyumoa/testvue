import {
  getShopAccount,
  accountAuthLink,
  cancelDyAccountAuth,
  accountByAuthLink,
  cancelByAccountAuth,
  uptAuthOperation,
  cancelDyWebAccountAuth,
  exportAccountListV2,
  delAuthAccount,
  cancelClueAuth,
  updateAccountDataAuth,
  checkCanAuth,
  listWxMcnAuths
} from '@/api/system_setting/authorization'
import api from '@/api/content_center/content_matrix.js'
import { exportFileV2 } from '@/utils/exportFile'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce, getUserMenu, getUserParentMenu, isNotEmpty, throttle } from '@/utils/tools'
import { sendHrefMessage } from '@/utils/OEA.js'
import { PLATFORM } from '@/utils/dictionary/company.js'
import { useStore } from 'vuex'
import { setBusinessChooseParam } from '@/utils/search.js'
import { getQuery } from '@/utils/get_query'

export const useAccountAuth = (emits, platformEN, addAuthBefore) => {
  const message = inject('$message')
  const store = useStore()
  // 基础版不显示矩阵号详情
  // const systemVersion = computed(() => store.state.user.systemVersion)
  // 是否隐藏数据授权提示
  const accountDataAuthHide = computed(() => {
    return store.state.user.accountDataAuthHide
  })
  const userTable = ref(null)
  const $data = reactive({
    showBatch: false, // 是否显示批量操作按钮
    showBatchLoading: false,
    loginBackLoading: false, // 开关后台账号的loading
    loginMiniLoading: false, // 开关AI终端账号的loading
    isAll: false, // 表格是否全选
    isAllTotal: 0, // 失效账号数
    chooseList: [] // 选中的用户
  })

  const state = reactive({
    bindOperatorList: [
      {
        id: -1,
        label: '全部'
      },
      {
        id: 1,
        label: '是'
      },
      {
        id: 0,
        label: '否'
      }
    ], // 是否有运营者的筛选项
    dyAccountType: [
      {
        id: -1,
        label: '全部'
      },
      {
        id: 1,
        label: '认证企业号'
      },
      {
        id: 2,
        label: '员工号-认证企业号'
      },
      {
        id: 3,
        label: '普通企业号'
      },
      {
        id: 4,
        label: '个人号'
      }
    ], // 抖音号类型的筛选项
    dyStatusList: [
      {
        id: -1,
        label: '全部'
      },
      {
        id: 1,
        label: '已授权'
      },
      {
        id: 2,
        label: '授权失效'
      }
    ],
    statusList: [
      {
        id: -1,
        label: '全部'
      },
      {
        id: 1,
        label: '已授权'
      },
      {
        id: 0,
        label: '未授权'
      },
      {
        id: 2,
        label: '授权失效'
      }
    ],
    statusPermieeionList: [
      {
        id: -1,
        label: '全部'
      },
      {
        id: 1,
        label: '开启'
      },
      {
        id: 0,
        label: '未开启'
      }
    ],
    statusListXhsSph: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '已授权',
        value: 1
      },
      {
        label: '已授权（停止更新播放量）',
        value: 3
      },
      {
        label: '授权失效',
        value: 2
      }
      // {
      //   label: '授权失效90天以上',
      //   value: 4
      // }
    ],
    statusListSphKs: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '已授权',
        value: 1
      },
      {
        label: '授权失效',
        value: 2
      }
    ],
    searchForm: {
      deptIds: [],
      authName: '',
      dyAuthStatus: -1,
      dyAuthStatusList: [],
      // buyinAuthStatus: -1,
      dyWebAuthStatus: -1,
      dyClueAuthStatus: -1,
      operator: '',
      dyAccountType: -1,
      isBindOperator: -1
    },
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    },
    dialog: {
      confirmVisible: false,
      setVisible: false,
      current: {}
    },
    // 权限记录弹窗相关
    empowerRecords: {
      show: false,
      openId: null,
      showSearch: true
    },
    // 获取哪个平台的列表 1抖音授权3小红书授权2视频号授权 4快手
    platform: 1,
    // 授权消耗提示弹框控制属性
    costDialog: {
      show: false,
      type: null,
      target: null,
      isEmployeeAuth: false,
      platform: null,
      refreshAuth: false, // 是否是重新授权过来的 否则基本上去点击新增按钮过来的
      refreshAccountInfo: {} // 需要重新授权的账号信息
    },
    // 取消授权提示框
    cancelAuthDialog: {
      show: false,
      row: null
    },
    // 重新授权提示框
    reAuthDialog: {
      show: false,
      row: null,
      platform: null
    },
    xhsAuthDialog: {
      show: false
    },
    ksAuthDialog: {
      show: false
    },
    sphAuthDialog: {
      show: false
    }
  })
  const searchComponents = ref([
    {
      type: 'input',
      label: `${PLATFORM.getCN(platformEN)}${platformEN === 2 ? '' : '号'}`,
      val: '',
      placeholder:
        platformEN === 1
          ? '请输入抖音号、抖音昵称'
          : platformEN === 2
          ? '请输入视频号昵称、视频号ID'
          : platformEN === 3
          ? '请输入小红书昵称、小红书号'
          : platformEN === 4
          ? '请输入快手昵称'
          : '',
      filed: 'authName'
    },
    {
      type: 'chooseDept',
      label: '矩阵号部门',
      val: [],
      filed: 'deptIds',
      multiple: true,
      isUsePermission: true
    },
    {
      type: 'select',
      label: '矩阵号分组',
      placeholder: '请选择矩阵号分组',
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      val: null,
      selects: [],
      selectDefultName: ['id', 'groupName']
    },
    {
      hiddenItem: platformEN !== 1,
      type: 'select',
      label: '抖音号类型',
      placeholder: '请选择抖音号类型',
      filed: 'dyAccountType',
      val: -1,
      defaultVal: -1,
      selects: state.dyAccountType,
      selectDefultName: ['id', 'label']
    },
    {
      hiddenItem: platformEN !== 3,
      type: 'select',
      label: '授权状态',
      placeholder: '请选择授权状态',
      filed: 'dyAuthStatus',

      val: -1,
      defaultVal: -1,
      selects: state.statusListXhsSph
    },
    {
      hiddenItem: platformEN === 3,
      type: 'select',
      label: platformEN !== 1 ? '授权状态' : '抖音授权状态',
      placeholder: platformEN !== 1 ? '请选择授权状态' : '请选择抖音授权状态',
      filed: 'dyAuthStatus',
      val: -1,
      defaultVal: -1,
      selects: platformEN === 1 ? state.dyStatusList : state.statusListSphKs,
      selectDefultName: platformEN === 1 ? ['id', 'label'] : null
    },
    {
      hiddenItem: !(platformEN === 1 && store.state.user.allowDyMcnAuth), // 如果抖音平台 并且 系统设置里未配置高级数据权限则隐藏
      type: 'select',
      label: '高级数据权限状态',
      placeholder: '请选择高级数据权限状态',
      filed: 'mcnAuthStatus',
      val: -1,
      defaultVal: -1,
      selects: state.statusPermieeionList,
      selectDefultName: ['id', 'label']
    },
    // {
    //   hiddenItem: !(platformEN === 1 && systemVersion.value === 3),
    //   type: 'select',
    //   label: '百应授权状态',
    //   placeholder: '请选择百应授权状态',
    //   filed: 'buyinAuthStatus',
    //   val: -1,
    //   defaultVal: -1,
    //   selects: state.statusList,
    //   selectDefultName: ['id', 'label']
    // },
    {
      hiddenItem: !(platformEN === 1 && store.state.user.allowCluesAuth), // 如果抖音平台 并且 系统设置里未配置线索权限则隐藏
      type: 'select',
      label: '线索数据权限状态',
      placeholder: '请选择线索数据权限状态',
      filed: 'dyClueAuthStatus',
      val: -1,
      defaultVal: -1,
      selects: state.statusPermieeionList,
      selectDefultName: ['id', 'label']
    },
    {
      type: 'select',
      label: '是否有运营者',
      placeholder: '请选择是否有运营者',
      filed: 'isBindOperator',
      val: -1,
      defaultVal: -1,
      selects: state.bindOperatorList,
      selectDefultName: ['id', 'label']
    },
    {
      type: 'input',
      label: '运营者',
      val: '',
      placeholder: '请输入手机号、姓名',
      filed: 'operator'
    }
  ])
  function getNewGroupList() {
    api.getNewGroupList({}).then(res => {
      if (res.code === 0) {
        searchComponents.value.forEach(item => {
          if (item.filed === 'groupIds') {
            item.selects = res.data || []
          }
        })
      }
    })
  }
  // 更新业务主体筛选项
  const initSearch = function () {
    getNewGroupList()
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  const _getList = () => {
    state.page.index = 1
    getList()
  }

  const getList = noLoading => {
    if (!noLoading) {
      state.loading = true
    }
    const data = getQuery(searchComponents.value)
    data.pageNumber = state.page.index
    data.pageSize = state.page.size
    data.platform = platformEN
    // 小红书授权 如果授权状态选择的是 已授权（停止更新播放量） dyAuthStatus要改成1 并且 nativeAuth=0
    if (platformEN === 3 && data.dyAuthStatus === 3) {
      data.dyAuthStatus = 1
      data.nativeAuth = 0
    }
    getShopAccount(data).then(res => {
      state.listData = res.data.records
      state.page.total = res.data.total
      state.loading = false
    })
  }
  const chooseDeptSearchRef = ref()
  const reset = () => {
    chooseDeptSearchRef.value?.clearFun()
    state.searchForm = {
      deptIds: [],
      authName: '',
      dyAuthStatus: -1,
      dyAuthStatusList: [],
      // buyinAuthStatus: -1,
      dyWebAuthStatus: -1,
      dyClueAuthStatus: -1,
      operator: '',
      dyAccountType: -1,
      isBindOperator: -1
    }
    state.page.index = 1
    getList()
  }
  const exportFiles = () => {
    const params = getQuery(searchComponents.value)
    params.platform = platformEN
    // 小红书授权 如果授权状态选择的是 已授权（停止更新播放量） dyAuthStatus要改成1 并且 nativeAuth=0
    if (platformEN === 3 && params.dyAuthStatus === 3) {
      params.dyAuthStatus = 1
      params.nativeAuth = 0
    }
    const fileName = `${
      state.platform === 1
        ? '抖音'
        : state.platform === 2
        ? '视频号'
        : state.platform === 3
        ? '小红书'
        : state.platform === 4
        ? '快手'
        : ''
    }授权列表导出`
    return exportFileV2(exportAccountListV2, params, fileName, 'xlsx')
  }
  const _accountAuthLink = (hasParams = false, params) => {
    if (hasParams) {
      accountAuthLink(params).then(res => {
        console.log('抖音授权，需要区分企业号还是个人号', res)
        window.open(res.data)
        state.dialog.confirmVisible = true
      })
    } else {
      accountAuthLink().then(res => {
        window.open(res.data)
        state.dialog.confirmVisible = true
      })
    }
  }
  // 新增授权
  const addAuth = (type, target = null, isEmployeeAuth = false, employeeFn) => {
    // checkCanAuth({
    //   brandId: store.state.user.userInfo.brandId,
    //   platform: 1
    // }).then(res => {
    //   if (res.code === 0) {
    //     if (res.data.result) {
    if (isEmployeeAuth) {
      employeeFn()
      return
    }
    if (type === 1) {
      // target: 1 个人号；2 企业号 3 员工号
      console.log('抖音授权', target)
      if (target !== null) {
        _accountAuthLink(true, { authType: target })
      } else {
        _accountAuthLink(false)
      }
    } else {
      accountByAuthLink({}).then(res => {
        window.open(res.data)
        state.dialog.confirmVisible = true
      })
    }
    //     } else {
    //       message.error(res.data.refuseMsg)
    //     }
    //   }
    // })
  }
  // 取消授权
  const removeAuth = debounce((openId, type) => {
    // 抖音、快手、小红书、视频号
    if (type === 1 || type === 4 || type === 3 || type === 6) {
      cancelDyAccountAuth({ openId, platform: type === 6 ? 2 : type }).then(res => {
        if (res.data === true) {
          ElMessage.success('取消成功')
          operationSuccessFun(true)
        }
      })
    } else if (type === 2) {
      cancelByAccountAuth({ openId }).then(res => {
        if (res.data === true) {
          ElMessage.success('取消成功')
          _getList()
        }
      })
      // }
      // else if (type === 3) {
      //   cancelDyWebAccountAuth({ openId: openId, platform: 1 }).then(res => {
      //     if (res.data === true) {
      //       ElMessage.success('取消成功')
      //       _getList()
      //     }
      //   })
    } else if (type === 5) {
      cancelClueAuth({ openId: openId, platform: 1 }).then(res => {
        if (res.data === true) {
          ElMessage.success('取消成功')
          getList()
        }
      })
    } else if (type === 7) {
      cancelDyWebAccountAuth({ openId: openId, platform: 1 }).then(res => {
        if (res.data === true) {
          ElMessage.success('取消成功')
          _getList()
        }
      })
    }
  })
  // 设置运营者
  const setOperators = row => {
    state.dialog.setVisible = true
    state.dialog.current = row
    // sectionShow.show = true
  }

  // 选择运营者
  const sectionShow = reactive({
    show: false,
    searchPhone: true,
    data: null
  })

  function setSection(data) {
    sectionShow.show = false
    uptAuthOperation({
      // accountId: data.accountId,
      userId: data.userId,
      operationId: state.dialog.current.operationId
    }).then(res => {
      getList()
      ElMessage.success('修改成功')
    })
  }

  // 打开权限记录弹窗, showSearch:true显示授权类型搜索和列表授权类型列，false两者都不显示
  function openEmpowerRecords(openId, showSearch) {
    if (!openId) ElMessage.error('无法获取权限记录【不存在的openId】')
    state.empowerRecords.openId = openId
    state.empowerRecords.showSearch = showSearch
    state.empowerRecords.show = true
  }
  // 关闭权限记录弹窗
  function empowerRecordsDialogClose() {
    state.empowerRecords.show = false
    state.empowerRecords.showSearch = true
    state.empowerRecords.openId = null
  }

  // 跳转详情
  function toAccontDetail(openId, systemModule) {
    // 跨菜单跳转 begin
    const menu = getUserMenu('content:matrix:manage')
    const parentMenu = menu ? getUserParentMenu(menu.parentId) : null
    if (menu && parentMenu) {
      sessionStorage.setItem('menuActive', menu?.scopeUrl)
      sessionStorage.setItem('module', parentMenu?.parentName || parentMenu?.scopeName)
      sendHrefMessage(location.origin + '/content_center/content_matrix/details?openId=' + openId)
    }
    // 跨菜单跳转 end
  }

  // 删除矩阵号
  const delFun = id => {
    ElMessageBox.confirm('删除后不可恢复，确认删除?', '系统提醒', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      delAuthAccount({
        openId: id
      }).then(res => {
        if (res.code === 0) {
          ElMessage.success('删除成功')
          operationSuccessFun(true)
        }
      })
    })
  }
  // 获取部门信息
  function updateDeptIds(e) {
    state.searchForm.deptIds = e || []
  }

  // 矩阵号的增删操作成功 需要更新顶部的数据统计
  function operationSuccessFun(isRefresh, noLoading) {
    if (isRefresh) {
      _getList()
    } else {
      getList(noLoading)
    }
    emits('updateTotal')
  }

  // 批量授权或者取消授权
  const batchOperate = (platform, type, isAll, list) => {
    console.log('batchOperate', platform, type, isAll, list)
    if (type === 1) {
      checkCanAuth({
        brandId: store.state.user.userInfo.brandId,
        platform: platform
      }).then(res => {
        if (res.code === 0) {
          if (res.data.result) {
            confirmBatchOp(platform, type, isAll, list)
          } else {
            message.error(res.data.refuseMsg)
          }
        }
      })
    } else {
      confirmBatchOp(platform, type, isAll, list)
    }
  }

  function confirmBatchOp(platform, type, isAll, list) {
    ElMessageBox.confirm(
      type === 1
        ? `确认批量授权所选矩阵号?
        <br/>
        <p style="font-size: 14px;margin-top: 8px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;font-size:12px">1、授权后将自动获取数据，获取数据将消耗1星力值/矩阵号/天
        <br/>
       2、成功接入的矩阵号长期有效，可手动解除授权，授权失效状态下停止扣除星力值</p>`
        : '解除授权后，将停止更新账号所有数据，同时停止扣除星力值，再次授权需重新扫码',
      type === 1 ? '提示' : '解除授权',
      {
        closeOnClickModal: false,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: '',
        customClass: 'drawer_systemBox drawer_systemBox_dialog drawer_systemBox_dialog2',
        dangerouslyUseHTMLString: true
      }
    ).then(() => {
      const params = getQuery(searchComponents.value)
      params.platform = platformEN
      updateAccountDataAuth({
        form: params, // 批量，带上筛选条件
        isOpeAll: isAll,
        opType: type,
        openIds: list.map(a => a.openId),
        platform: platform
      }).then(res => {
        if (res.code === 0) {
          if (res.data.failNumber === 0 || res.data.successNumber) {
            if (type === 1) {
              ElMessage.success(`成功授权${res.data.successNumber || 0}个矩阵号`)
            } else {
              ElMessage.success(`成功解除${res.data.successNumber || 0}个矩阵号授权`)
            }
          } else {
            ElMessage.warning(
              '部分失败,失败个数：' + res.data.failNumber + ',失败原因：' + res.data.errorMsg
            )
          }
          emits('updateTotal')
          reset()
          $data.isAll = false
          userTable.value.$refs.table.clearSelection()
        }
      })
    })
  }
  /**
   * 授权消耗提示弹框控制属性事件
   * @param type -- 1 抖音 平台
   * @param target -- 目前是抖音 1  授权个人号/普通企业号（非蓝V） 2 授权认证企业号（蓝V） 3  授权员工号
   * @param isEmployeeAuth 员工号授权
   * @param platform 平台
   * @param refreshAuth 是否是重新授权过来的
   * @param refreshAccountInfo 需要重新授权的账号信息
   */
  const costWarn = (
    type,
    target,
    isEmployeeAuth = false,
    platform,
    refreshAuth = false,
    refreshAccountInfo
  ) => {
    state.costDialog.show = true
    state.costDialog.type = type
    state.costDialog.target = target
    state.costDialog.isEmployeeAuth = isEmployeeAuth
    state.costDialog.platform = platform
    state.costDialog.refreshAuth = refreshAuth
    state.costDialog.refreshAccountInfo = refreshAccountInfo
  }

  /**
   * 取消授权按钮触发事件
   * @param to
   * @param row
   */
  const cancelAuth = (platform, row) => {
    state.cancelAuthDialog.show = true
    state.cancelAuthDialog.row = row
  }
  // 校验是否可以授权 比如星力值是否足够
  function checkCanAuthorize(platform) {
    return new Promise((resolve, reject) => {
      checkCanAuth({
        brandId: store.state.user.userInfo.brandId,
        platform: platform
      })
        .then(res => {
          if (res.code === 0) {
            if (res.data.result) {
              resolve()
            } else {
              message.error(res.data.refuseMsg)
              reject(new Error())
            }
          } else {
            reject(new Error())
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }
  /**
   * 重新授权按钮触发事件
   * @param to
   * @param row
   */
  const reAuth = (platform, row) => {
    console.log('重新授权按钮触发事件', platform, row)
    checkCanAuthorize(platform)
      .then(() => {
        // 检测是否隐藏数据授权提示，
        if (accountDataAuthHide.value) {
          // 隐藏就直接授权
          if (platform === 1) {
            // 失效原因为“星力值不足" ，直接调接口该状态，否则出二维码弹窗
            if (row.dyAuthInvalidType === 9) {
              singleAccountOp(1, row)
            } else {
              addAuthBefore(1, row)
            }
          } else if (platform === 2) {
            // 如果是失效原因是星力值不足且当前平台真实授权状态为有效 ，直接调接口该状态，否则出二维码弹窗
            if (row.dyAuthInvalidType === 9 && row.nativeAuth === 1) {
              singleAccountOp(1, row)
            } else {
              showSphAuthDialog()
            }
          } else if (platform === 3) {
            // 失效原因为“星力值不足" ，直接调接口该状态，否则出二维码弹窗
            if (row.xhsAuthInvalidType === 9) {
              singleAccountOp(1, row)
            } else {
              state.xhsAuthDialog.show = true
            }
          } else if (platform === 4) {
            // 如果是失效原因是星力值不足且当前平台真实授权状态为有效 ，直接调接口该状态，否则出二维码弹窗
            if (row.dyAuthInvalidType === 9 && row.nativeAuth === 1) {
              singleAccountOp(1, row)
            } else {
              state.ksAuthDialog.show = true
            }
          }
        } else {
          // 没有隐藏就显示弹窗，弹窗里点击确认再去授权
          costWarn(null, null, null, platform, true, row)
        }
      })
      .catch(() => {})
  }

  // 增加状态，批量开关开启关闭时，为了页面上的开关表现不受影响
  const batchHandelBefore = () => {
    return new Promise(resolve => {
      userTable.value.$refs.table.clearSelection()
      $data.isAll = false
      $data.isAllTotal = 0
      $data.chooseList = []
      $data.showBatchLoading = true
      nextTick(() => {
        resolve(true)
        $data.showBatchLoading = false
      })
    })
  }

  // 点击全选的按钮
  const allChooseFun = throttle(() => {
    if ($data.isAll) {
      userTable.value.$refs.table.clearSelection()
    } else {
      setCheck(true)
    }
    nextTick(() => {
      $data.isAll = !$data.isAll
    })
  }, 500)

  // 设置表格全选
  async function setCheck(check) {
    // debugger
    state.listData.forEach(y => {
      userTable.value?.$refs.table.toggleRowSelection(y, check)
    })
    // const unSelectTotal = (await getListBeforeBatch(null, true)) || 0
    $data.isAllTotal = state.page.total
  }

  // 允许/禁止表格选择
  const handleCheckSelectable = row => {
    if ($data.isAll) {
      return false
    } else {
      // 全都能选 return true
      // 已禁用账号不能选
      return true
    }
  }
  // 当选择项发生变化时
  const handleSelectionChange = e => {
    $data.chooseList = e
  }

  const batchOpFun = throttle((type, platform = 1) => {
    // platform,type,isAll,list
    if (!$data.isAll) {
      if (!isNotEmpty($data.chooseList)) {
        message.warning('请选择矩阵号')
        return
      }
    }
    batchOperate(platform, type, $data.isAll, $data.chooseList)
  })
  /**
   * 开始授权
   * @param type
   * @param target
   */
  const startAuth = throttle((type, target, isEmployeeAuth = false, employeeFn) => {
    checkCanAuthorize(platformEN).then(() => {
      // 检测是否隐藏数据授权提示，
      if (accountDataAuthHide.value) {
        addAuth(type, target, isEmployeeAuth, employeeFn)
      } else {
        costWarn(type, target, isEmployeeAuth)
      }
    })
  }, 300)

  const singleOpFun = throttle((type, row) => {
    if (type === 1) {
      checkCanAuth({
        brandId: store.state.user.userInfo.brandId,
        platform: row.platform
      }).then(res => {
        if (res.code === 0) {
          if (res.data.result) {
            singleAccountOp(type, row)
          } else {
            message.error(res.data.refuseMsg)
          }
        }
      })
    } else {
      singleAccountOp(type, row)
    }
  })
  function singleAccountOp(type, row) {
    updateAccountDataAuth({
      isOpeAll: false,
      opType: type,
      openIds: [row.openId],
      platform: row.platform
    }).then(res => {
      if (res.code === 0) {
        emits('updateTotal')
        ElMessage.success('操作成功')
        reset()
      }
    })
  }
  // 新增小红书授权
  const addXhsAuth = throttle(() => {
    checkCanAuthorize(platformEN).then(() => {
      // 检测是否隐藏数据授权提示，
      if (accountDataAuthHide.value) {
        state.xhsAuthDialog.show = true
      } else {
        costWarn(null, null, null, platformEN)
      }
    })
  }, 300)

  // 新增快手授权
  const addKsAuth = throttle(() => {
    checkCanAuthorize(platformEN).then(() => {
      // 检测是否隐藏数据授权提示，
      if (accountDataAuthHide.value) {
        state.ksAuthDialog.show = true
      } else {
        costWarn(null, null, null, platformEN)
      }
    })
  }, 300)
  // 新增视频号授权
  const addSphAuth = throttle(() => {
    checkCanAuthorize(platformEN).then(() => {
      // 检测是否隐藏数据授权提示，
      if (accountDataAuthHide.value) {
        showSphAuthDialog()
      } else {
        costWarn(null, null, null, platformEN)
      }
    })
  }, 300)
  // 进行视频号授权
  function showSphAuthDialog() {
    console.log('视频号授权弹窗')
    listWxMcnAuths({
      authStatus: 0,
      pageNo: 1,
      pageSize: 10,
      showDefaultMcn: true
    }).then(res => {
      if (res.code === 0) {
        const total = res.data?.total
        if (total) {
          state.sphAuthDialog.show = true
        } else {
          message.warning('请先授权机构号！')
        }
      }
    })
  }
  return {
    searchComponents,
    state,
    getList,
    _getList,
    reset,
    exportFiles,
    addAuth,
    setOperators,
    removeAuth,
    sectionShow,
    setSection,
    openEmpowerRecords,
    empowerRecordsDialogClose,
    toAccontDetail,
    delFun,
    chooseDeptSearchRef,
    updateDeptIds,
    operationSuccessFun,
    batchOperate,
    cancelAuth,
    reAuth,
    costWarn,
    $data,
    batchHandelBefore,
    allChooseFun,
    userTable,
    handleCheckSelectable,
    handleSelectionChange,
    batchOpFun,
    startAuth,
    singleOpFun,
    showSphAuthDialog,
    addXhsAuth,
    addKsAuth,
    addSphAuth,
    singleAccountOp,
    checkCanAuthorize,
    accountDataAuthHide
  }
}

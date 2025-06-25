import { reactive, ref } from 'vue'
import {
  listAuditNode,
  getAuditTaskUser,
  addAuditTaskUser,
  // addAuditNodeUser,
  getListUserInfo,
  deleteAuditTaskUser,
  deleteAuditNode
} from '@/api/market/operation.js'
import { getConfigurationByKey, updateConfig } from '@/api/market/operation_setting.js'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

export function pageList(tabName, auditType) {
  const store = useStore()
  // 基础版只显示矩阵号等级规则，其余版本显示完整
  const systemVersion = computed(() => store.state.user.systemVersion)
  const tabList = [
    // {
    //   name: 'active_setting',
    //   label: '活动设置'
    // },
    {
      name: 'video',
      label: '视频审核设置',
      show: true
    },
    {
      name: 'task',
      label: '任务审核设置',
      show: true
    },
    {
      name: 'material',
      label: '征集视频与素材审核设置',
      show: systemVersion.value === 3
    }
    // {
    //   name: 'tag',
    //   label: '任务标签设置'
    // },
    // {
    //   name: 'homework',
    //   label: '作业点评设置'
    // }
  ]
  const chooseTab = ref('video')
  // 下载模式下 视频审核设置
  if (store.state.user.dyVersion === 3) {
    // const target = tabList.find(item=> item.name === 'video')
    // target.show = false
    // chooseTab.value = 'task'
  }
  // 公共配置模块
  const params = ref({
    key: 'null',
    id: 0
  })
  function commonSetting() {
    if (tabName === 'task') {
      if (auditType === 2) params.value.key = 'audit_task_json_str'
      if (auditType === 3) params.value.key = 'audit_collect_json_str'
    }
    if (tabName === 'video') {
      params.value.key = 'audit_video_json_str'
    }
    if (tabName === 'homework') {
      params.value.key = 'comment_homework_json_str'
    }
    getConfigurationByKey({ key: params.value.key }).then(res => {
      const temporary = {
        isAuditVideoNotice: '0',
        auditVideoNoticeTime: 1,
        isSendAuditResult: '0'
      }
      const _common = res.data?.value ? JSON.parse(res.data.value) : temporary
      params.value.id = res.data?.id ?? 0
      // auditVideoNoticeTime 改为number类型
      _common.auditVideoNoticeTime = +_common?.auditVideoNoticeTime
      common.value = _common ?? temporary
      if (res?.data?.value && tabName === 'homework') {
        // 接口返回不为空
        const {
          isCommentHomeworkNotice: isAuditVideoNotice,
          commentHomeworkNoticeTime: auditVideoNoticeTime,
          isSendCommentHomeworkResult: isSendAuditResult
        } = common.value
        common.value = { isAuditVideoNotice, auditVideoNoticeTime, isSendAuditResult }
      }
    })
  }
  const lockTime = ref(false)
  watchEffect(
    () => {
      if (common.value.isAuditVideoNotice === '1') {
        lockTime.value = true
      } else {
        lockTime.value = false
      }
    },
    {
      flush: 'post'
    }
  )
  function commonSwitch(val) {
    let value = common.value
    if (tabName === 'homework') {
      const {
        isAuditVideoNotice: isCommentHomeworkNotice,
        auditVideoNoticeTime: commentHomeworkNoticeTime,
        isSendAuditResult: isSendCommentHomeworkResult
      } = common.value
      value = { isCommentHomeworkNotice, commentHomeworkNoticeTime, isSendCommentHomeworkResult }
    }
    const configValue = JSON.stringify(value)
    const configKey = params.value.key
    const id = params.value.id ?? null
    updateConfig({
      configKey,
      configValue,
      id
    }).then(res => {
      console.log(res)
    })
  }
  const common = ref({
    isAuditVideoNotice: '0',
    auditVideoNoticeTime: 1,
    isSendAuditResult: '0'
  })
  // 手机号显示隐藏功能
  function showPhoneFun(e, i) {
    e.showPhone = !e.showPhone
  }
  // 表单
  const form = reactive({
    name: '',
    region: '',
    date1: '',
    date2: '',
    delivery: 0,
    type: [],
    resource: '',
    desc: '',
    num: ''
  })

  // 获取任务审核人信息
  const memberDate = ref([])
  function AuditTaskUser() {
    getAuditTaskUser({ type: auditType }).then(res => {
      memberDate.value = transformName(res.data)
    })
  }
  function transformName(res) {
    const result = res.map(item => {
      item.name = item.userBrandName
      item.headImg = item.userPhoto
      item.showPhone = false
      return item
    })
    return result
  }
  // 获取审核节点列表信息
  const auditNode = ref(null)
  function getAuditNode() {
    listAuditNode().then(res => {
      auditNode.value = transformNode(res.data)
    })
  }
  function transformNode(data) {
    const result = data.map(function (i) {
      switch (i.auditLevel) {
        case 1:
          i.level = '一级审核'
          break
        case 2:
          i.level = '二级审核'
          break
        case 3:
          i.level = '三级审核'
          break
        case 4:
          i.level = '四级审核'
          break
        case 5:
          i.level = '五级审核'
          break
      }
      return i
    })
    return result
  }
  // 查询员工
  const searchMember = ref('')
  const restaurants = ref([])
  const auditList = ref([])
  const querySearchAsync = (queryString, cb) => {
    let results = []
    if (searchMember.value) {
      getListUserInfo({
        userBrandName: searchMember.value,
        staffStatus: 1,
        staffType: 1,
        isValid: 1
      }).then(res => {
        results = transformValue(res.data)
        cb(results)
      })
    } else {
      cb(results)
    }
  }
  // const createFilter = queryString => {
  //   return restaurant => {
  //     return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
  //   }
  // }
  const handleSelect = res => {
    // if (tabName === 'video') {
    //   let result = false
    //   if (auditList.value.length === 10) {
    //     ElMessage.warning('每层级上限10个审核员')
    //     return
    //   }
    //   if (auditList.value) {
    //     result = auditList.value.some(item => {
    //       return item.userId === res.userId
    //     })
    //   }
    //   if (!result) {
    //     auditList.value.push({ name: res.value, userId: res.userId })
    //   } else {
    //     ElMessage.warning('请勿重复添加')
    //   }
    // } else {
      member.userIds = []
      member.userIds.push(res.userId)
    // }
  }
  function handleChange() {
    getListUserInfo({
      userBrandName: searchMember.value,
      staffStatus: 1,
      staffType: 1,
      isValid: 1
    }).then(res => {
      restaurants.value = transformValue(res.data)
    })
  }
  function transformValue(data) {
    const result = data.map(function (item) {
      item.value = item.userBrandName
      return item
    })
    return result
  }
  function deleteItem(index) {
    auditList.value.splice(index, 1)
  }
  // 添加审核人
  const addMemberShow = ref(false)
  const member = reactive({
    userIds: [],
    nodeId: null
  })
  function changeAddShow(row) {
    addMemberShow.value = true
    if (tabName === 'video' && row.id) {
      member.nodeId = JSON.parse(JSON.stringify(row.id))
      auditList.value = JSON.parse(JSON.stringify(row.auditNames))
    }
  }
  function _addAuditTaskUser() {
    // 任务
    if (tabName === 'task' || tabName === 'homework' || tabName === 'video') {
      if (member.userIds.length === 0) {
        ElMessage.warning('请添加正确的用户信息')
        return
      }
      const hasUser = memberDate.value.some(item => {
        return item.userId === member.userIds[0]
      })
      if (hasUser) {
        ElMessage.warning('请勿重复添加')
        return
      }
      if (auditType) {
        member.type = auditType
      }
      addAuditTaskUser(member)
        .then(res => {
          if (res.code === 0) {
            ElMessage.success('添加成功')
            AuditTaskUser()
            member.userIds = []
          }
        })
        .finally(() => {
          addMemberShow.value = false
        })
    }
    // 视频
    // else if (tabName === 'video') {
    //   if (auditNode.value.length === 5 && member.nodeId === null) {
    //     ElMessage.warning('添加失败，最多为五级审核')
    //   } else {
    //     if (auditList.value.length === 0) {
    //       ElMessage.warning('请添加正确的用户信息')
    //       return
    //     }
    //     member.userIds = []
    //     auditList.value.forEach(item => {
    //       member.userIds.push(item.userId)
    //     })
    //     addAuditNodeUser(member)
    //       .then(res => {
    //         if (res.code === 0) {
    //           ElMessage.success('添加成功')
    //           auditList.value = []
    //           member.userIds = []
    //           getAuditNode()
    //         }
    //       })
    //       .finally(() => {
    //         addMemberShow.value = false
    //       })
    //   }
    // }
    searchMember.value = ''
  }
  // 删除审核人
  const deleteMemberShow = ref(false)
  const deleteUserInfo = ref([])
  function changeDeleteShow(i) {
    deleteMemberShow.value = true
    deleteUserInfo.value.push(i.userId)
  }
  function deleteUser() {
    const params = { userIds: deleteUserInfo.value }
    if (auditType) {
      params.type = auditType
    }
    deleteAuditTaskUser(params)
      .then(res => {
        ElMessage.success('删除成功')
        AuditTaskUser()
      })
      .finally(() => {
        deleteMemberShow.value = false
      })
  }
  // 删除审核节点
  const deleteNodeShow = reactive({
    show: false,
    node: null,
    nodeId: null
  })
  function changeDeleteNode(row) {
    deleteNodeShow.show = true
    deleteNodeShow.node = row.level
    deleteNodeShow.nodeId = row.id
  }
  function deleteNode() {
    deleteAuditNode({ nodeId: deleteNodeShow.nodeId })
      .then(res => {
        ElMessage.success('删除成功')
        getAuditNode()
      })
      .finally(() => {
        deleteNodeShow.show = false
      })
  }
  function clear() {
    searchMember.value = ''
    auditList.value = []
    member.nodeId = null
  }
  const query = reactive({
    taskId: '',
    status: null,
    remark: '',
    type: ''
  })
  const isShow = ref(false)

  // 验证规则
  const validateReason = (rule, value, callback) => {
    if (query.remark.length !== 0) {
      callback()
    } else {
      return callback(new Error('请输入不通过理由'))
    }
  }
  const rules = reactive({
    reason: [
      {
        required: true,
        validator: validateReason,
        trigger: 'blur'
      }
    ]
  })
  return {
    memberDate,
    addMemberShow,
    deleteMemberShow,
    deleteNodeShow,
    auditNode,
    handleChange,
    handleSelect,
    searchMember,
    AuditTaskUser,
    getAuditNode,
    changeAddShow,
    changeDeleteShow,
    changeDeleteNode,
    _addAuditTaskUser,
    querySearchAsync,
    showPhoneFun,
    form,
    tabList,
    query,
    isShow,
    chooseTab,
    deleteUser,
    rules,
    auditList,
    deleteItem,
    deleteNode,
    commonSetting,
    common,
    commonSwitch,
    lockTime,
    member,
    clear
  }
}

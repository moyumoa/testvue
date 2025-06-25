import { selectRole, addOrUptRole, deleteRole } from '@/api/system_setting/role'
import router from '@/router/index'
import { ElMessage } from 'element-plus'
import { debounce } from '@/utils/tools'

export const useList = () => {
  const state = reactive({
    // 列表相关
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 10
    },
    // 弹框相关数据
    visible: false,
    title: '',
    roleName: '',
    roleId: null
  })

  const getList = () => {
    state.loading = true
    selectRole({
      pageSize: state.page.size,
      pageNumber: state.page.index
    })
      .then(res => {
        state.listData = res.data.records
        state.page.total = res.data.total
        state.loading = false
      })
      .catch(() => {
        state.loading = false
      })
  }

  const handleAdd = () => {
    state.roleName = ''
    state.roleId = null
    state.title = '创建角色'
    state.visible = true
  }
  const rename = row => {
    state.roleName = row.roleName
    state.roleId = row.roleId
    state.title = '修改角色'
    state.visible = true
  }
  const linkTo = (roleId, roleName) => {
    sessionStorage.setItem('roleInfo', JSON.stringify({ roleId, roleName }))
    router.push('role/per_config')
  }
  // 增删改
  const confirm = debounce(() => {
    addOrUptRole({
      roleName: state.roleName,
      roleId: state.roleId || undefined
    }).then(res => {
      ElMessage.success(!state.roleId ? '新增成功' : '修改成功')
      state.visible = false
      getList()
    })
  })
  const delRole = debounce((id, num) => {
    if (num > 0) {
      return ElMessage.error('存在关联角色，无法删除')
    }
    deleteRole({ roleId: id }).then(res => {
      ElMessage.success('删除成功')
      getList()
    })
  })
  return { state, getList, confirm, delRole, rename, handleAdd, linkTo }
}

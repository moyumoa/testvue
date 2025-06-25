import {
  addKeywordApi,
  addKeywordGroupApi,
  getKeywordGroupApi,
  getKeywordList
} from '@/api/scrm/intention_screening.js'
import { ElMessage, ElMessageBox } from 'element-plus'

// keyType high 1 low 2
export function useKeyword(keyType) {
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    queryParam: {},
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })

  function restList() {
    tableForm.page.index = 1
    tableForm.queryParam = {}
    selectValue.value = {
      id: '-1',
      groupName: '全部'
    }
    getList()
  }

  function getList() {
    const data = {
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      keyType,
      ...tableForm.queryParam
    }
    getKeywordList(data).then(res => {
      if (res?.code === 0) {
        tableForm.listData = res?.data?.records || []
        tableForm.page.total = res?.data?.total || 0
      }
      tableForm.loading = false
    })
  }

  // 修改关键词组
  const dialogConfig = ref({
    show: false,
    title: '编辑关键词',
    placeholder: '请输入关键词'
  })
  const openEditDialog = (key, row) => {
    switch (key) {
      case 'addKeyword':
        dialogConfig.value = {
          type: 'addKeyword',
          show: true,
          showSelect: keyType === 1,
          title: '新增关键词',
          placeholder: '请输入关键词',
          keywordGroupList: option
        }
        break
      case 'updateKeyword':
        dialogConfig.value = {
          type: 'updateKeyword',
          show: true,
          showSelect: keyType === 1,
          title: '编辑关键词',
          placeholder: '请输入关键词',
          keywordGroupList: option,
          initialValue: row.keyName,
          selectValue: row
        }
        break
      case 'addKeywordGroup':
        dialogConfig.value = {
          type: 'addKeywordGroup',
          show: true,
          title: '新增关键词组',
          placeholder: '请输入关键词组',
          keywordGroupList: option
        }
        break

      case 'updateKeywordGroup':
        dialogConfig.value = {
          type: 'updateKeywordGroup',
          show: true,
          title: '编辑关键词组',
          placeholder: '请输入关键词组',
          initialValue: selectValue.value.groupName
        }
        break
    }
  }
  const onConfirm = value => {
    switch (dialogConfig.value.type) {
      case 'addKeyword':
        addKeyword(value)
        break
      case 'updateKeyword':
        updateKeyword(value)
        break
      case 'addKeywordGroup':
        addKeywordGroup(value)
        break
      case 'updateKeywordGroup':
        updateKeywordGroup(value)
        break
    }
  }
  // 关键词组的增删改
  const selectValue = ref({
    id: '-1',
    groupName: '全部'
  })
  const option = ref([])
  const getKeywordGroup = () => {
    getKeywordGroupApi({}).then(res => {
      if (res.code === 0) {
        option.value = res?.data || []
        selectValue.value =
          option.value.find(item => item.id === selectValue.value.id) || selectValue.value
      }
    })
  }
  const addKeywordGroup = value => {
    addKeywordGroupApi({ groupName: value }).then(res => {
      ElMessage.success('添加成功')
      getKeywordGroup()
    })
  }
  const updateKeywordGroup = value => {
    addKeywordGroupApi({
      id: selectValue.value.id,
      groupName: value
    }).then(res => {
      getKeywordGroup()
      getList()
      ElMessage.success('修改成功')
    })
  }
  const deleteKeywordGroup = () => {
    addKeywordGroupApi({
      isDel: 1,
      id: selectValue.value.id
    }).then(res => {
      ElMessage.success('删除成功')
      selectValue.value = {
        id: '-1',
        groupName: '全部'
      }
      getKeywordGroup()
      restList()
    })
  }
  if (keyType === 1) {
    getKeywordGroup()
  }
  // 关键词的增删改
  const addKeyword = value => {
    if (keyType === 2) {
      value = {
        keyName: value
      }
    }
    value.keyType = keyType
    addKeywordApi(value).then(res => {
      ElMessage.success('添加成功')
      restList()
    })
  }
  const updateKeyword = value => {
    const param = typeof value !== 'object' ? { keyName: value } : value
    param.id = dialogConfig.value?.selectValue?.id
    param.keyType = keyType
    addKeywordApi(param).then(res => {
      restList()
      ElMessage.success('修改成功')
    })
  }

  function deleteKeyword(item) {
    ElMessageBox.confirm('删除关键词', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        addKeywordApi({
          isDel: 1,
          keyName: item.keyName,
          id: item.id
        }).then(res => {
          ElMessage.success('删除成功')
          restList()
        })
      })
      .catch(() => {})
  }

  return {
    selectValue,
    option,
    getList,
    tableForm,
    dialogConfig,
    openEditDialog,
    onConfirm,
    getKeywordGroup,
    addKeywordGroup,
    updateKeywordGroup,
    deleteKeywordGroup,
    addKeyword,
    updateKeyword,
    deleteKeyword
  }
}

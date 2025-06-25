<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="choose_part_dialog "
    destroy-on-close
    v-model="show"
    :title="dialogTitle"
    width="828px"
  >
    <div class="dialog_content">
      <div class="dialog_left">
        <el-input
          style="margin: 0"
          class="search_input"
          v-model.trim="partInput"
          clearable
          placeholder="请输入部门名称"
          @change="filterText"
          @clear="changePageByTree"
        />
        <div class="left_content" ref="searchRef">
          <div
            style="min-height: 100%"
            v-loading="loading && ((isSearch && searchParam.pageNumber === 1) || !isSearch)"
          >
            <template v-if="isSearch">
              <template v-if="searchList && searchList.length > 0">
                <div
                  class="search_box"
                  :infinite-scroll-delay="500"
                  v-infinite-scroll="loadFun"
                  :infinite-scroll-distance="50"
                  :infinite-scroll-immediate="false"
                  :infinite-scroll-disabled="searchList.length >= searchParam.total"
                >
                  <el-checkbox
                    :title="item.name"
                    @change="searchCheckChange($event, item, index)"
                    v-for="(item, index) in searchList"
                    :key="item.id"
                    :label="item.id"
                    v-model="item.checked"
                  >
                    {{ item.name }}
                  </el-checkbox>
                  <div class="xm_pullUpToLoadMore">
                    <img
                      src="/public/loading.gif"
                      v-if="loading && searchParam.pageNumber > 1"
                      alt=""
                    />
                    {{
                      loading
                        ? searchParam.pageNumber === 1
                          ? ''
                          : '加载中...'
                        : searchList.length >= searchParam.total
                        ? searchList.length > 10
                          ? '已经到底了~'
                          : ''
                        : '上拉加载更多~'
                    }}
                  </div>
                </div>
              </template>
              <div
                class="xm_noneData"
                style="height: 300px"
                v-if="!(searchList && searchList.length > 0) && !loading && isSearch"
              >
                暂无数据
              </div>
            </template>
            <template v-else>
              <el-tree
                ref="departTree"
                show-checkbox
                node-key="fullIds"
                :default-checked-keys="chooseFullIds"
                :expand-on-click-node="false"
                check-on-click-node
                lazy
                :load="loadNode"
                :props="{
                  label: 'name',
                  isLeaf: 'leaf'
                }"
                @check-change="treeCheckChange"
                :check-strictly="true"
              >
                <template #default="{ node }">
                  <span class="tree_node line-hidden1">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20220111qk48z.png"
                      class="tree_icon"
                    />
                    <span :title="node.label" class="line-hidden1">{{ node.label }}</span>
                  </span>
                </template>
              </el-tree>
            </template>
          </div>
        </div>
      </div>
      <div class="dialog_right">
        <div class="right_top">
          <div>
            已选：
            <span>{{ chooseNode.length }}</span>
            个部门
          </div>
          <el-link type="primary" @click="clearFun">清空</el-link>
        </div>
        <div class="right_content">
          <div class="one_content" v-for="(item, index) in chooseNode" :key="item.id">
            <div class="right_left">
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20220111qk48z.png"
                class="tree_icon"
              />
              <div class="right_left_content">
                <div class="right_name1">{{ getLastName(item.name) }}</div>
                <div :title="getFirstName(item)" class="right_name2 line-hidden1">
                  {{ getFirstName(item) }}
                </div>
              </div>
            </div>
            <div class="right_right" @click="cancelNode(item, index)">
              <el-icon><i-close /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { queryChildrenDeptIdsPage } from '@/api/market/operate_analysis.js'
import { getLazyDeptTree, queryDepartment } from '@/api/main/dept.js'
import { throttle } from '@/utils/tools.js'
// 整个组件，因为会存在子部门ID一样，但有多个父部门的情况，
// 所以我们添加的话是一个个添加，但删除的话，是会把所有相关的子部门都删掉。例如A/C和B/C 删除C部门会把A/C和B/C都删掉
const props = defineProps({
  dialogTitle: {
    type: String,
    default: '选择部门'
  },
  deptDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        checkNode: []
        // 格式
        // [{
        //   fullIds:'0/0',//全路径ID ☆fullPath:'',//全路径名称 ☆id:'',//直属部门ID  ☆name:'',//部门名称
        // }]
      }
    },
    required: true
  },
  isUsePermission: {
    type: Boolean,
    default: false
  }, // 是否受数据权限控制
  getAllChild: {
    type: Boolean,
    default: false
  }, // 是否获取所有子部门
  allowEmpty: {
    type: Boolean,
    default: false
  }, // 是否允许选择数据为空
  isSearchSelf: {
    type: Boolean,
    default: null
  }, // 是否只加载某个父部门下的子部门
  isSearchSelfById: {
    type: String || Number,
    default: null
  }, // 要加载哪个父部门下的子部门
  isConfigPermission: {
    type: Boolean,
    default: false
  } // 是不是在用户管理里配置组织架构权限 true/false
})
const message = inject('$message')
const emits = defineEmits(['updateDept', 'updateDeptChild'])
const dialog = ref()
const departTree = ref(null) // 树组件DOM
const show = toRef(props.deptDialog, 'show')
const {
  dialogTitle,
  isUsePermission,
  getAllChild,
  allowEmpty,
  isSearchSelf,
  isSearchSelfById,
  isConfigPermission
} = toRefs(props)

const chooseNode = ref([]) // 选中的数据完整信息列表 包含了id name 等
const chooseKeys = ref([]) // 选中的数组Id列表
const chooseFullIds = ref([]) // 选中的数组全路径Id列表
const loading = ref(true) // 获取部门数据的loading
const btnLoading = ref(false) // 确定按钮的loading
const partInput = ref('') // 输入框内容
const isSearch = ref(false) // 是否通过输入框搜索显示的多选框列表
const searchList = ref([]) // 搜索后的多选框列表
const searchParam = ref({
  pageNumber: 1,
  pageSize: 20,
  total: 0
}) // 多选框列表分页查询数据
const searchRef = ref() // 多选框列表DOM

// 组件初始化 设置选中的数据
function init() {
  if (props.deptDialog.checkNode && props.deptDialog.checkNode.length > 0) {
    chooseNode.value = JSON.parse(JSON.stringify(props.deptDialog.checkNode))
    chooseKeys.value = chooseNode.value.map(x => x.id)
    let fullll = []
    chooseNode.value.forEach(x => {
      const full = x.fullIds || x.parentIds
      x.fullIds = full
      if (full) {
        if (full.indexOf(';') > -1) {
          fullll = fullll.concat(full.split(';'))
        } else {
          fullll.push(full)
        }
      }
    })
    chooseFullIds.value = fullll
  } else {
    chooseNode.value = []
    chooseKeys.value = []
    chooseFullIds.value = []
  }
  changePageByTree()
}
init()

// 弹窗的确定按钮
const handleConfirm = throttle(() => {
  btnLoading.value = true
  // 如果不允许选中数据为空，那就先判断选中数量
  if (!allowEmpty.value && !(chooseNode.value && chooseNode.value.length > 0)) {
    message.warning('请选择部门')
    btnLoading.value = false
    return
  }

  if (chooseNode.value && chooseNode.value.length > 0) {
    // 是否要获取所有子部门
    if (getAllChild.value) {
      // 调接口获取所有子部门
      _getChildDepart(chooseKeys.value)
    } else {
      const chooseList = []
      const chooseIdList = []
      chooseNode.value.forEach(x => {
        const nameList = x.name.indexOf('/') > -1 ? x.name.split('/') : [x.name]
        x.name = nameList[nameList.length - 1]
        chooseList.push(x)
        chooseIdList.push(x.id)
      })
      emits('updateDept', chooseList, chooseIdList)
      dialog.value.handleClose()
      btnLoading.value = false
    }
  } else {
    emits('updateDept', [])
    dialog.value.handleClose()
    btnLoading.value = false
  }
}, 700)

// 根据部门ID获取子部门
function _getChildDepart(nodes) {
  queryChildrenDeptIdsPage({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : null,
    departmentIds: nodes
  })
    .then(res => {
      if (res.code === 0) {
        const chooseList = []
        chooseNode.value.forEach(x => {
          const nameList = x.name.indexOf('/') > -1 ? x.name.split('/') : [x.name]
          x.name = nameList[nameList.length - 1]
          chooseList.push(x)
        })
        emits('updateDept', chooseList)
        emits('updateDeptChild', res.data && res.data.length > 0 ? res.data.join(',') : '')

        dialog.value.handleClose()
        btnLoading.value = false
      }
    })
    .catch(() => {})
}
// 关闭弹出
function closeDialog() {
  dialog.value.handleClose()
}

// 显示树形结构的页面
function changePageByTree() {
  isSearch.value = false
}

// 通过输入框筛选部门
const filterText = () => {
  loading.value = true
  if (partInput.value) {
    isSearch.value = true
    searchParam.value.pageNumber = 1
    // 第一次请求 ，要让滚动条回到顶部
    searchRef.value?.scrollTo(0, 0)
    getSearchList()
  } else {
    changePageByTree()
  }
}

// 通过输入框内容获取对应的多选框列表数据
function getSearchList() {
  queryDepartment({
    deptName: partInput.value,
    pageNumber: searchParam.value.pageNumber,
    pageSize: searchParam.value.pageSize,
    isUsePermission: !!isUsePermission.value,
    parentIdsContainsSelf: true,
    parentId: isSearchSelf.value ? isSearchSelfById.value : null // 只返回该部门下的子部门
  })
    .then(res => {
      if (res.code === 0) {
        const list = changeData(res.data.records || [])
        if (searchParam.value.pageNumber === 1) {
          searchList.value = list
        } else {
          searchList.value = searchList.value.concat(list)
        }
        searchParam.value.total = res.data.total
      }
    })
    .finally(x => {
      nextTick(() => {
        loading.value = false
      })
    })
}
// 上拉加载更多的多选框列表
function loadFun() {
  loading.value = true
  searchParam.value.pageNumber++
  getSearchList()
}
// 对数据进行重命名
function changeData(data) {
  data.forEach(x => {
    x.fullPath = x.name
    const nameL = x.name.split('/')
    if (nameL && nameL.length > 1) {
      x.name = nameL.slice(1).join('/')
    }
    x.fullIds = x.parentIds
      ? x.parentIds.substring(x.parentIds.length - 1) === '/'
        ? x.parentIds + x.departmentId
        : x.parentIds
      : x.departmentId
    // 因为多个父部门会有同个子部门，所以chooseNode里的fullIds：如果多个就是;分隔
    let check = false
    chooseNode.value.forEach(y => {
      if (y.fullIds) {
        if (y.fullIds.indexOf(';') > -1) {
          const fl = y.fullIds.split(';')
          if (fl.findIndex(xxx => xxx === x.fullIds) > -1) {
            check = true
          }
        } else {
          if (y.fullIds === x.fullIds) {
            check = true
          }
        }
      } else {
        if (y.id === x.departmentId) {
          check = true
        }
      }
    })
    x.checked = check
    x.id = x.departmentId
  })
  return data
}
// 通过懒加载方式加载树形结构数据
function loadNode(node, resolve) {
  const { level, data } = node
  getLazyDeptTree({
    self: level === 0 ? (isSearchSelf.value ? isSearchSelfById.value : null) : null,
    deptId: level === 0 ? null : data.id,
    deptIdParentPath: data.parentIds || '',
    isUsePermission: !!isUsePermission.value,
    isConfigPermission: !!isConfigPermission.value
  })
    .then(res => {
      if (res.code === 0) {
        loading.value = false
        const list = res.data || []
        list.forEach(x => {
          x.fullIds = x.parentIds
            ? x.parentIds.indexOf(';') > -1
              ? x.parentIds.split(';')[0]
              : x.parentIds.substring(x.parentIds.length - 1) === '/'
              ? x.parentIds + x.id
              : x.parentIds
            : x.id
          x.leaf = !x.hasChildren // 是否有下一级
        })
        // 设置选中
        resolve(list)
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}
// 显示部门的最后一级名字
function getLastName(name) {
  if (name) {
    const list = name.split('/')
    return list[list.length - 1]
  } else {
    return ''
  }
}
// 显示每一级的全部门名称 删除跟部门和直属部门的那种
function getOneName(data) {
  if (data.indexOf(';') > -1) {
    const lll = data.split(';')
    const nameL = []
    lll.forEach(x => {
      let namex = ''
      const fullPathList = x ? x.split('/') : []

      if (fullPathList && fullPathList.length > 2) {
        namex = fullPathList.slice(1, fullPathList.length - 1).join('/')
      }
      nameL.push(namex)
    })
    return nameL.join(';')
  } else {
    let name = ''
    const fullPathList = data ? data.split('/') : []

    if (fullPathList && fullPathList.length > 2) {
      name = fullPathList.slice(1, fullPathList.length - 1).join('/')
    }

    return name
  }
}
// 选中的列表要显示所属父部门名称
function getFirstName(data) {
  if (data.fullPath) {
    return getOneName(data.fullPath)
  } else {
    const name = data.name
    if (name) {
      const list = name.split('/')
      return list.slice(0, list.length - 1).join('/')
    } else {
      return ''
    }
  }
}
// 树的点击事件
function treeCheckChange(data1, check) {
  const data = JSON.parse(JSON.stringify(data1))
  // 选中 添加是一个个添加，
  if (check) {
    const hasIndex = chooseKeys.value.findIndex(x => x === data.id)
    if (hasIndex === -1) {
      chooseNode.value.push(data)
      chooseKeys.value.push(data.id)
      chooseFullIds.value.push(data.fullIds)
    } else {
      chooseNode.value[hasIndex].fullPath =
        chooseNode.value[hasIndex].fullPath +
        (chooseNode.value[hasIndex].fullPath ? ';' : '') +
        data.fullPath
      chooseNode.value[hasIndex].fullIds =
        chooseNode.value[hasIndex].fullIds +
        (chooseNode.value[hasIndex].fullIds ? ';' : '') +
        data.fullIds
      chooseFullIds.value.push(data.fullIds)
    }
  } else {
    // 未选中 删除是一次性删同个子部门
    clearTreeCheckFun(data)
    const index = chooseKeys.value.indexOf(data.id)
    if (index > -1) {
      chooseNode.value.splice(index, 1)
      chooseKeys.value.splice(index, 1)
    }
  }
}

// 多选框的选中事件
function searchCheckChange(check, data1, index) {
  const data = JSON.parse(JSON.stringify(data1))
  // 选中 添加是一个个添加
  if (check) {
    searchList.value[index].checked = check
    const hasIndex = chooseKeys.value.findIndex(x => x === data.id)
    if (hasIndex === -1) {
      chooseNode.value.push(data)
      chooseKeys.value.push(data.id)
      chooseFullIds.value.push(data.fullIds)
    } else {
      chooseNode.value[hasIndex].fullPath =
        chooseNode.value[hasIndex].fullPath +
        (chooseNode.value[hasIndex].fullPath ? ';' : '') +
        data.fullPath
      chooseNode.value[hasIndex].fullIds =
        chooseNode.value[hasIndex].fullIds +
        (chooseNode.value[hasIndex].fullIds ? ';' : '') +
        data.fullIds
      chooseFullIds.value.push(data.fullIds)
    }
  } else {
    // 未选中  删除是一次性删同个子部门
    searchList.value.forEach(x => {
      if (x.id === data.id) {
        x.checked = check
      }
    })
    const index = chooseKeys.value.indexOf(data.id)
    if (index > -1) {
      chooseNode.value.splice(index, 1)
      chooseKeys.value.splice(index, 1)
    }
    clearTreeCheckFun(data)
  }
}
// 清空树的某个值选中 如果要删除的子部门相同，那就都删掉
function clearTreeCheckFun(data) {
  const indexL = []
  const lll = []
  chooseFullIds.value.forEach((x, ii) => {
    const splitList = x.split('/')
    if (parseInt(splitList[splitList.length - 1]) === data.id) {
      indexL.push(ii)
    } else {
      lll.push(x)
    }
  })

  if (indexL && indexL.length > 0) {
    indexL.forEach(x => {
      departTree.value?.setChecked(chooseFullIds.value[x], false)
    })

    chooseFullIds.value = JSON.parse(JSON.stringify(lll))
  }
}
// 取消单个选中
const cancelNode = throttle((e, index) => {
  clearTreeCheckFun(e)
  chooseNode.value.splice(index, 1)
  chooseKeys.value.splice(index, 1)
  if (isSearch.value) {
    searchList.value.forEach(x => {
      if (x.id === e.id) {
        x.checked = false
      }
    })
  }
}, 500)

// 清除所有选中
const clearFun = throttle(() => {
  departTree.value?.setCheckedKeys([], false)
  chooseNode.value = []
  chooseKeys.value = []
  chooseFullIds.value = []
  if (isSearch.value) {
    searchList.value.forEach(x => {
      x.checked = false
    })
  }
}, 500)
defineExpose({
  clearFun
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  .dialog_left {
    border-right: 1px solid #dcdfe6;
    flex: 1;
    max-width: 50%;
    padding: 24px 24px 0;
    height: 409px;
    .left_content {
      padding-top: 10px;
      height: calc(100% - 32px);
      overflow-y: auto;
      .tree_node {
        display: flex;
        align-items: center;
        .tree_icon {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          margin-right: 8px;
        }
        > span {
          color: #323233;
          font-size: 13px;
        }
      }
    }
  }
  .dialog_right {
    flex: 1;
    max-width: 50%;
    padding: 24px 24px 0;
    height: 409px;
    .right_top {
      padding-right: 8px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align: center;

      font-size: 14px;
      font-weight: 500;
      color: #333333;
      line-height: 20px;
      margin-bottom: 4px;
      span {
        color: #364fcd;
      }
    }
    .right_content {
      width: 100%;
      height: calc(100% - 32px);
      overflow-y: auto;
      .one_content {
        margin-top: 12px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .right_left {
          width: 80%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .tree_icon {
            width: 26px;
            height: 26px;
            margin-right: 8px;
          }
          .right_left_content {
            width: calc(100% - 25px);
            .right_name1 {
              font-size: 14px;
              font-weight: 400;
              color: #323233;
              line-height: 20px;
            }
            .right_name2 {
              margin-top: 2px;
              font-size: 12px;
              font-weight: 400;
              color: #909399;
              line-height: 20px;
            }
          }
        }
        .right_right {
          padding-right: 8px;
          width: 20%;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
          cursor: pointer;

          font-size: 20px;
          color: #909399;
          &:hover {
            color: #f85151;
          }
        }
      }
    }
  }
}
.search_box {
  :deep(.el-checkbox) {
    width: 100%;
    margin-right: 0;
    .el-checkbox__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.xm_pullUpToLoadMore {
  padding-bottom: 15px;
}

:deep(.search_input .el-input__inner) {
  border-color: #dcdfe6 !important;
}
</style>

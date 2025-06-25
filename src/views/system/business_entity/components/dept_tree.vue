<template>
  <div class="dept_tree" v-loading="loading">
    <!--  搜索框  -->
    <div class="tree_search_input">
      <el-input
        v-model="queryParams.deptName"
        @keyup.enter="searchInfo"
        placeholder="请输入部门名称搜索"
      >
        <template #suffix>
          <el-icon class="el-input__icon" @click="searchInfo" style="cursor: pointer">
            <i-search />
          </el-icon>
        </template>
      </el-input>
    </div>
    <!-- 占位符 -->
    <div style="height: calc(100vh - 281px)" v-if="!isInitOver"></div>
    <div
      v-if="isInitOver"
      v-loading="showSearchList && listLoading && queryParams.pageNumber === 1"
    >
      <!--  树形结构 -->
      <div class="tree_container" v-if="!showSearchList">
        <el-tree
          class="tree_box"
          show-checkbox
          ref="departTree"
          node-key="parentIds"
          @check-change="treeCheck"
          :default-checked-keys="defaultCheckedKeys"
          :expand-on-click-node="false"
          :check-strictly="true"
          :props="{ label: 'name', isLeaf: 'leaf' }"
          lazy
          :load="loadNode"
        ></el-tree>
      </div>
      <!--   搜索的列表 -->
      <div
        class="tree_container"
        style="padding: 4px 0 0"
        v-infinite-scroll="loadMore"
        :infinite-scroll-distance="100"
        :infinite-scroll-disabled="listFinished"
        v-else
      >
        <el-tree
          class="tree_box"
          :data="queryResultList"
          show-checkbox
          ref="departListTree"
          node-key="parentIds"
          @check-change="treeCheck"
          :default-checked-keys="defaultCheckedKeys"
          :expand-on-click-node="false"
          :check-strictly="true"
          :props="{ label: 'name' }"
        ></el-tree>
        <div class="xm_pullUpToLoadMore">
          <img src="/public/loading.gif" v-if="listLoading && queryParams.pageNumber > 1" alt="" />
          {{
            listLoading
              ? queryParams.pageNumber === 1
                ? ''
                : '加载中...'
              : listFinished
              ? queryResultList.length > 10
                ? '已经到底了~'
                : ''
              : '上拉加载更多~'
          }}
        </div>
      </div>
    </div>
    <!--   保存与取消按钮 -->
    <div class="bottom_btn">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { getLazyDeptTree, queryDepartment, listAllBusinessBody } from '@/api/main/dept.js'
import { changeDepartmentStoreMark } from '@/api/market/store'
import { isEmpty } from '@/utils/tools.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  // 门店信息
  info: {
    type: Object,
    default: () => {
      return {
        principalType: 1,
        principalName: '门店'
      }
    }
  },
  chooseNodes: {
    type: Array,
    default() {
      return []
    }
  }
})

const emits = defineEmits(['update', 'update:modelValue', 'cancel'])
const { info } = toRefs(props)
const loading = ref(true)

// 默认选中的节点
const defaultCheckedKeys = ref([])
const isInitOver = ref(false) // 是否获取默认数据完成
function init() {
  listAllBusinessBody({
    principalType: info.value.principalType
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        const resultList = res.data || []
        if (resultList && resultList.length > 0) {
          let chooseParentIds = []
          resultList.forEach(x => {
            if (x.parentIds) {
              if (x.parentIds.indexOf(';') > -1) {
                chooseParentIds = chooseParentIds.concat(x.parentIds.split(';'))
              } else {
                chooseParentIds.push(x.parentIds)
              }
            }
          })
          defaultCheckedKeys.value = chooseParentIds
        }
      }
      isInitOver.value = true
    })
    .catch(() => {
      isInitOver.value = true
    })
}
init()
// 依次加载树形结构
function loadNode(node, resolve) {
  const { level, data } = node
  getLazyDeptTree({
    deptId: level === 0 ? null : data.id,
    deptIdParentPath: data.parentIds || '',
    isUsePermission: false
  }).then(res => {
    if (res.code === 0) {
      const list = res.data || []
      list.forEach(x => {
        x.disabled = level === 0
        x.pcKey = x.parentIds
        x.leaf = !x.hasChildren // 是否有下一级
      })
      loading.value = false
      nextTick(() => {
        if (level === 0) {
          const node3 = departTree.value?.getNode(list[0].parentIds)
          if (node3) {
            node3.loaded = false
            node3.expand()
          }
        }
      })
      resolve(list)
    }
  })
}
const departTree = ref(null)
// 取消 返回
const cancel = () => {
  emits('update:modelValue', false)
  emits('cancel')
}
// 保存
const submit = () => {
  loading.value = true
  changeDepartmentStoreMark({
    isBatchOpt: true,
    deptIds: Array.from(new Set(defaultCheckedKeys.value.map(item => item.split('/').at(-1)))),
    principalType: info.value.principalType
  }).then(res => {
    if (res.code === 0) {
      ElMessage.success('操作成功')
      loading.value = false
      // emits('update:modelValue', false)
      emits('update')
    }
  })
}

// 显示查询列表
const showSearchList = ref(false)

const queryParams = reactive({
  pageNumber: 1,
  pageSize: 20,
  name: ''
})
const queryResultList = ref([])
const listFinished = ref(true)
const listLoading = ref(false)
const departListTree = ref(null)
watch(
  () => queryParams.deptName,
  value => {
    if (isEmpty(value)) {
      showSearchList.value = false
    }
  }
)

// 搜索列表显示
const searchInfo = () => {
  showSearchList.value = true
  queryResultList.value = []
  queryParams.pageNumber = 0
  getList()
}

const loadMore = () => {
  if (listLoading.value || listFinished.value) {
    return
  }
  // 先将已经勾选的保存
  if (departListTree.value) {
    defaultCheckedKeys.value = Array.from(
      new Set(defaultCheckedKeys.value.concat(departListTree.value.getCheckedKeys()))
    )
  }
  getList()
}
// 查询信息列表结构查询
const getList = () => {
  queryParams.pageNumber++
  listLoading.value = true
  queryParams.isUsePermission = false
  queryParams.parentIdsContainsSelf = true
  queryDepartment(queryParams)
    .then(res => {
      if (res.code === 0) {
        const { records: resultList = [], total } = res?.data || {}
        resultList.forEach(item => {
          // 没有父节点的根节点或者 跟部门 不可以被选中
          if (!item.parentIds || item.parentIds === '0') {
            item.disabled = true
          }
          item.name =
            item.name.indexOf('/') > -1 ? item.name.split('/').slice(1).join('/') : item.name
          item.id = item.departmentId
        })
        if (queryParams.pageNumber === 1) {
          queryResultList.value = resultList
        } else {
          queryResultList.value = queryResultList.value.concat(resultList)
        }
        listFinished.value = queryResultList.value.length >= total
        listLoading.value = false
      } else {
        listLoading.value = false
      }
    })
    .catch(() => {
      listLoading.value = false
    })
}

const treeCheck = (node, isChecked) => {
  console.log('treecheck', node, isChecked, defaultCheckedKeys.value)
  //  选中 添加是一个个添加
  if (isChecked) {
    defaultCheckedKeys.value.push(node.parentIds)
  } else {
    // 未选中  删除是一次性删同个子部门
    const ref = showSearchList.value ? departListTree.value : departTree.value
    const indexL = []
    const lll = []
    defaultCheckedKeys.value.forEach((x, ii) => {
      const splitList = x.split('/')
      if (parseInt(splitList[splitList.length - 1]) === node.id) {
        indexL.push(ii)
      } else {
        lll.push(x)
      }
    })
    if (indexL && indexL.length > 0) {
      indexL.forEach(x => {
        ref?.setChecked(defaultCheckedKeys.value[x], false)
      })
      defaultCheckedKeys.value = JSON.parse(JSON.stringify(lll))
    }
  }
}
</script>

<style lang="scss" scoped>
.dept_tree {
  .tree_search_input {
    padding: 0 24px;
  }

  .tree_container {
    overflow: scroll;
    height: calc(100vh - 281px);
    padding: 4px 24px 0;
  }

  .bottom_btn {
    position: relative;
    z-index: 10; // 解决树形结构滚动遮住 box-shadow
    height: 56px;
    background: #ffffff;
    box-shadow: 0 0 7px 0 rgba(224, 224, 224, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.xm_pullUpToLoadMore {
  padding-bottom: 15px;
}
.tree_box {
  :deep(.el-tree-node) {
    max-width: 100vw;
    width: max-content;
    min-width: 100%;
  }
}
</style>

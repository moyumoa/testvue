<template>
  <div>
    <xm_search :searchComponents="searchComponents" @getData="getList" @reset="resetSearch" />
    <div class="page_main mt_16">
      <div class="page_btns">
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </div>
      <xm_table
        v-loading="tableState.loading"
        :data="tableState.listData"
        v-model:page="tableState.page"
        @getTableData="getList"
      >
        <el-table-column label="序号" prop="num" />
        <el-table-column label="姓名" prop="name" />
        <el-table-column label="操作" fixed="right" width="120" align="center" header-align="right">
          <template #default="scope">
            <el-link type="primary" @click="handleEdit(scope.row)">编辑</el-link>
            <el-popconfirm title="确定要删除吗" @confirm="confirmDelete(scope.row)">
              <template #reference>
                <el-link type="primary" class="ml_16">删除</el-link>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <addModal :editModal="editModal" v-if="editModal.show" @getTableData="getList" />
  </div>
</template>

<script setup>
import addModal from './add_modal.vue'
// import { getData } from '@/api/main/home'
const searchComponents = ref([
  {
    type: 'dateRange', // 组件类型
    label: '日期选择', // label展示
    val: '', // 响应式绑定
    filed: 'dateRange' // 查询字段名
  },
  {
    type: 'input',
    label: '姓名',
    val: '',
    filed: 'username'
  },
  {
    type: 'select',
    label: '类型',
    val: '',
    filed: 'userType',
    selects: [
      {
        label: '选择1',
        value: 1
      },
      {
        label: '选择2',
        value: 2
      },
      {
        label: '选择3',
        value: 3
      }
    ]
  },
  {
    type: 'input',
    label: '年龄',
    val: '',
    filed: 'age'
  },
  {
    type: 'input',
    label: '性别',
    val: '',
    filed: 'sex'
  }
])
const tableState = reactive({
  loading: false,
  listData: [
    {
      num: 1,
      name: '张三'
    },
    {
      num: 2,
      name: '李四'
    }
  ],
  page: {
    index: 1,
    size: 10,
    total: 10
  }
})

function getList(obj) {
  // getData().then(data => {
  //   tableState.listData = []
  // })
}
function resetSearch() {}
const editModal = reactive({
  show: false,
  title: '新增',
  row: null
})
function handleAdd() {
  editModal.title = '新增数据'
  editModal.show = true
}
function handleEdit(row) {
  editModal.title = '编辑'
  editModal.row = row
  editModal.show = true
}
function confirmDelete(row) {}
</script>

<style lang="scss" scoped></style>

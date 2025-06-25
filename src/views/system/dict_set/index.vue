<template>
  <div class="page_layout">
    <div class="base_type">
      <div class="title">基础类别列表</div>
      <div class="type_list">
        <div
          class="type_item"
          v-for="item in dictTypeList"
          :key="item.value"
          :class="{ active: item.dimType === choiceType }"
          @click="handleCheckType(item)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="type_child">
      <div class="title">类别信息</div>
      <div class="section">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-table v-loading="state.loading" ref="table" class="mt_16" :data="state.data">
          <el-table-column type="index" label="排序" width="60" align="center" />
          <el-table-column label="名称" align="center" prop="name" />
          <el-table-column label="值" align="center" prop="code" />
          <el-table-column label="状态" align="center">
            <template #default="scope">
              {{ scope.row.isValid === 1 ? '有效' : '无效' }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
            align="right"
            header-align="right"
          >
            <template #default="scope">
              <el-link type="primary" @click="handleEdit(scope.row)">编辑</el-link>
              <el-popconfirm title="确定要删除吗" @confirm="confirmDelete(scope.row)">
                <template #reference>
                  <el-link type="danger" class="ml_16">删除</el-link>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <addModal
      :editModal="editModal"
      :brandId="brandInfo.brandId"
      :dimType="choiceType"
      :choiceTypeName="choiceTypeName"
      :dictList="state.data"
      v-if="editModal.show"
      @getTableData="getChild"
    />
  </div>
</template>

<script setup>
import { getDictType, getDictChildList, delDictChild } from '@/api/system_setting/dict'
import addModal from './add_modal.vue'

const dictTypeList = ref()
const choiceType = ref()
const state = reactive({
  loading: true,
  data: []
})
const editModal = reactive({
  show: false,
  title: '新增类别',
  row: null
})
const choiceTypeName = computed(
  () => dictTypeList.value.filter(item => choiceType.value === item.dimType)[0].name
)
getList()
function getList() {
  getDictType().then(({ data }) => {
    dictTypeList.value = data
    if (data.length > 0) {
      choiceType.value = data[0].dimType
      getChild()
    }
  })
}
function handleCheckType(item) {
  choiceType.value = item.dimType
  getChild()
}
function getChild() {
  state.loading = true
  getDictChildList(choiceType.value)
    .then(({ data }) => {
      state.data = data
    })
    .finally(() => {
      state.loading = false
    })
}
function handleAdd() {
  editModal.title = '新增类别'
  editModal.show = true
}
function handleEdit(row) {
  editModal.title = '编辑类别'
  editModal.row = row
  editModal.show = true
}
const message = inject('$message')
const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
function confirmDelete(item) {
  console.log(item)
  delDictChild(
    {
      brandId: brandInfo.brandId,
      dimId: item.id
    },
    choiceType.value
  ).then(res => {
    message.success('操作成功')
    getChild()
  })
}
</script>

<style lang="scss" scoped>
.page_layout {
  min-height: calc(100%);
  display: flex;
  line-height: 1;
  .base_type {
    border-radius: 4px;
    flex-basis: 200px;
    width: 200px;
    overflow-y: auto;
    background: #fff;
    margin-right: 20px;
    .type_list {
      .type_item {
        padding: 14px 24px;
        font-size: 14px;
        border-top: 1px solid #f7f8fa;
        cursor: pointer;
        margin-bottom: 2px;
        &.active,
        &:hover {
          color: $theme_color;
          background: #eff3fd;
        }
      }
    }
  }
  .type_child {
    border-radius: 4px;
    flex: 1;
    background: #fff;
    .section {
      padding: 15px 24px 0 24px;
    }
  }
  .title {
    font-size: 16px;
    font-weight: 600;
    padding: 30px 24px 13px 24px;
  }
}
:deep .el-table__cell {
  height: 56px !important;
}
</style>

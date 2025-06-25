<template>
  <div>
    <xm_search>
      <div class="search_item">
        <label class="item_label">员工姓名</label>
        <div class="item_content">
          <el-input v-model="search.username" placeholder="请输入员工姓名"></el-input>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">部门</label>
        <div class="item_content">
          <el-cascader
            v-model="search.value"
            :options="sectionOptions"
            clearable
            style="width: 100%"
          />
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">创建日期</label>
        <div class="item_content">
          <el-date-picker
            v-model="search.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </div>
      </div>
      <div class="search_item">
        <el-button type="primary">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </xm_search>
    <div class="page_main mt_16">
      <div class="page_btns">
        <el-button type="primary" @click="handleAdd">添加员工</el-button>
        <el-button type="primary" @click="handleAdd">批量添加</el-button>
      </div>
      <xm_table
        class="pic_table"
        v-loading="tableState.loading"
        :data="tableState.listData"
        v-model:page="tableState.page"
        @getTableData="getList"
      >
        <el-table-column label="序号" prop="num" width="80" />
        <el-table-column label="员工信息" prop="name">
          <template #default="scope">
            <div class="table_photo">
              <img :src="scope.row.photo" alt="" />
              <div>{{ scope.row.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="phone" width="240" />
        <el-table-column label="部门" prop="section" />
        <el-table-column label="创建时间" prop="date" width="240" />
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
const search = reactive({
  username: '',
  value: [],
  date: ''
})
const sectionOptions = ref([])
const tableState = reactive({
  loading: false,
  listData: [
    {
      num: 1,
      name: '陶桑桑',
      phone: '18664906543',
      section: '星麦云商/产品研发中心/产品一部',
      date: '2021-11-09 16:01:40',
      photo: 'https://p3.douyinpic.com/aweme/100x100/241ce0003adea87b15704.jpeg?from=4010531038'
    },
    {
      num: 2,
      name: '陶桑桑',
      phone: '18664906543',
      section: '星麦云商/产品研发中心/产品一部',
      date: '2021-11-09 16:01:40',
      photo: 'https://p3.douyinpic.com/aweme/100x100/241ce0003adea87b15704.jpeg?from=4010531038'
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
  title: '添加员工',
  row: null
})
function handleAdd() {
  editModal.title = '添加员工'
  editModal.show = true
}
function handleEdit(row) {
  editModal.title = '编辑员工'
  editModal.row = row
  editModal.show = true
}
function confirmDelete(row) {}
</script>

<style lang="scss" scoped></style>

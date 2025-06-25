<template>
  <div>
    <xm_search>
      <div class="search_item">
        <label class="item_label">门店编号</label>
        <div class="item_content">
          <el-input v-model="search.username" placeholder="请输入门店编号"></el-input>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">门店名称</label>
        <div class="item_content">
          <el-input v-model="search.username" placeholder="请输入门店名称"></el-input>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">所属上级</label>
        <div class="item_content">
          <el-select
            v-model="search.username"
            placeholder="请选择上级"
            style="width: 100%"
          ></el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">地址</label>
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
        <el-button type="primary" @click="getList">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </xm_search>
    <div class="page_main mt_16">
      <div class="page_btns">
        <el-button type="primary" @click="handleAdd">添加门店</el-button>
        <el-button type="primary" @click="handleBatchAdd">批量添加</el-button>
      </div>
      <xm_table
        class="pic_table"
        v-loading="tableState.loading"
        :data="tableState.listData"
        v-model:page="tableState.page"
        @getTableData="getList"
      >
        <el-table-column label="门店名称" prop="num" width="240">
          <template #default="scope">
            <div>
              <el-tooltip class="item" effect="dark" :content="scope.row.name" placement="top">
                <div class="ellipsis table_ellipsis">{{ scope.row.name }}</div>
              </el-tooltip>
              <div class="ellipsis table_ellipsis">编号：{{ scope.row.num }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属上级" prop="section" min-width="150" />
        <el-table-column label="门店类型" prop="type" width="120" />
        <el-table-column label="门店系列" prop="xilie" width="240">
          <template #default="scope">
            <el-tooltip class="item" effect="dark" :content="scope.row.xilie" placement="top">
              <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
                {{ scope.row.xilie }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="门店地址" prop="address" width="120">
          <template #default="scope">
            <el-tooltip class="item" effect="dark" :content="scope.row.xilie" placement="top">
              <div class="ellipsis table_ellipsis" style="-webkit-line-clamp: 2">
                {{ scope.row.address }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="员工数" prop="staffNum" width="120" />
        <el-table-column label="操作" fixed="right" width="150" align="center" header-align="right">
          <template #default="scope">
            <el-link type="primary" @click="handleEdit(scope.row)">编辑</el-link>
            <el-link type="primary" class="ml_16" @click="settingRow(scope.row)">员工管理</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <storeEmployees :editModal="editModal" v-if="editModal.show" @getTableData="getList" />
    <batchImport :showModal="importModal" v-if="importModal.show" @importData="importData" />
  </div>
</template>

<script setup>
import storeEmployees from './store_employees.vue'
import batchImport from '@/views/system/components/batch_import/index.vue'
import { useRouter } from 'vue-router'
import { getData } from '@/api/system_setting/employees'
const router = useRouter()
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
      num: '800012314',
      name: '河北肃宁靖宁街多品类势能店河北肃宁靖宁街多品类势能店',
      section: '星麦云商/产品研发中心/产品一部',
      type: '品类势能店',
      xilie: '布艺睿致,布艺床,布艺缤纷,顾家功能,睡眠中心,顾家工艺,顾家功能,睡眠中心,顾家工艺',
      address: '河北省沧州市肃宁县河北省沧州市太湖去',
      staffNum: 20
    }
  ],
  page: {
    index: 1,
    size: 10,
    total: 10
  }
})
const editModal = reactive({
  show: false,
  row: null
})
function getList(obj) {
  console.log(1)
  getData().then(data => {
    tableState.listData = []
  })
}
function resetSearch() {}
function handleAdd() {
  router.push('/organization/section_set')
}
function settingRow(row) {
  editModal.row = row
  editModal.show = true
}
const importModal = reactive({
  show: false,
  title: '门店'
})
function handleBatchAdd() {
  importModal.show = true
}
function importData() {}
</script>

<style lang="scss" scoped>
.table_ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
</style>

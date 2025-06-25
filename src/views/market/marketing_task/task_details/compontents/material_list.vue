<template>
  <div>
    <xm_search
      :searchComponents="data.searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_main mt_16">
      <xm_table
        class="pic_table"
        v-loading="data.loading"
        :data="data.listData"
        v-model:page="data.page"
        @getTableData="getList"
        tableType="video"
      >
        <el-table-column :label="collectType == 1 ? '视频' : '原料'" width="150">
          <template #default="{ row }">
            <material-item v-if="collectType == 1" :materialInfo="row" type="video"></material-item>
            <material-item v-else :materialInfo="row"></material-item>
          </template>
        </el-table-column>
        <el-table-column label="成员信息" width="180">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row"
              showPhone
              :showDyNum="false"
              :showLeaving="row.staffStatus && row.staffStatus == 2"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="部门信息">
          <template v-slot="{ row }">
            <table_column_department_info
              :departmentName="row.userDept"
              v-if="row.userDept"
              connectStr="/"
              divisionStr=";"
              trigger="hover"
            ></table_column_department_info>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="上传时间">
          <template v-slot="{ row }">{{ row.gmtUpdate }}</template>
        </el-table-column>
        <el-table-column label="状态">
          <template v-slot="{ row }">{{ statusEnums[row.auditStatus] }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { getCollectMaterialList } from '@/api/market/task'
import materialItem from '@/views/market/components/material_item.vue'

const route = useRoute()
const props = defineProps({
  collectType: Number // 1 视频 2 原料
})
const { collectType } = toRefs(props)

const data = reactive({
  searchComponents: [
    {
      type: 'input',
      label: '成员姓名',
      val: '',
      filed: 'employeeName'
    },
    {
      type: 'input',
      label: '手机号',
      val: '',
      filed: 'employeePhoneNum'
    }
  ],
  loading: false,
  listData: [],
  searchParams: {},
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
const statusEnums = {
  0: '未审核',
  1: '审核通过',
  2: '审核未通过',
  3: '审核中'
}

// 搜索
function searchList(searchData) {
  data.page.index = 1
  data.searchParams = searchData
  getList()
}

// 重置
function resetSearch() {
  data.page.index = 1
  data.searchParams = {}
  getList()
}

function getList() {
  const parma = {
    taskId: route.query.itemId,
    queryType: 3
  }
  getCollectMaterialList({
    condition: Object.assign(parma, data.searchParams),
    pageNum: data.page.index,
    pageSize: data.page.size
  }).then(res => {
    if (res.data.records) {
      data.listData = res.data.records.map(e => {
        e.avatar = e.userHead
        e.phone = e.userPhone
        return e
      })
    } else {
      data.listData = []
    }
    data.page.total = res.data.total
  })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped></style>

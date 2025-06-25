<template>
  <!-- 离职成员 -->
  <div class="quit_page">
    <xm_table
      ref="staffTable"
      rowKey="userId"
      class="pic_table"
      tableType="avatar"
      :data="listData"
      v-model:page="page"
      max-height="530"
      @getTableData="getList"
      v-loading="loading"
    >
      <el-table-column label="成员信息" prop="name" min-width="150">
        <template #default="{ row }">
          <div class="table_photo">
            <img class="photo_img" v-if="row.photo" :src="row.photo" alt />
            <template v-else>
              <default-photo
                class="photo_img"
                type="selfBuilt"
                v-if="architectureMode == 4"
                :name="row.name"
              />
              <img class="photo_img" v-else src="@/assets/images/content_center/default_user.png" />
            </template>
            <div class="namePhone_box">
              <div class="name_name">
                <div class="name_box" :style="row.staffStatus === 2 ? '' : 'max-width:100%'">
                  {{ row.name }}
                </div>
                <span v-if="row.staffStatus === 2" class="g_departure">已离职</span>
              </div>
              <table_column_phone v-if="row.phone" :phone="row.phone"></table_column_phone>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="部门" min-width="150">
        <template #default="{ row }">
          <template v-if="row.departmentList && row.departmentList.length > 0">
            <span v-for="(item, index) in row.departmentList" :key="item">
              {{ item }}
              <template v-if="index + 1 !== row.departmentList.length">/</template>
            </span>
          </template>
          <template v-else>--</template>
        </template>
      </el-table-column>
      <el-table-column label="离职时间" min-width="100">
        <template #default="{ row }">
          {{ row.resignTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作离职人" min-width="100">
        <template #default="{ row }">
          {{ row.resignOperatedUserName || '-' }}
        </template>
      </el-table-column>
    </xm_table>
  </div>
</template>
<script setup>
import DefaultPhoto from '@/views/system/components/default_photo/index.vue'

import { deptStaffPage } from '@/api/system_setting/account'

const props = defineProps({
  id: {
    type: Number,
    default: null
  },
  isDirect: {
    type: Boolean,
    default: true
  } // 是否查询直属部门
})
const architectureMode = computed(() => {
  return localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).architectureMode
    : null
})
const listData = ref([])
const page = reactive({
  index: 1,
  size: 10,
  total: 0
})
const loading = ref(false)
function getList() {
  loading.value = true
  deptStaffPage({
    pageNumber: page.index,
    pageSize: page.size,
    departmentId: props.id,
    staffStatus: 2,
    isDirect: props.isDirect ? 1 : 0
  })
    .then(res => {
      loading.value = false
      listData.value = res.data.records
      page.total = res.data.total
    })
    .catch(() => {
      loading.value = false
    })
}
function init() {
  page.index = 1
  page.size = 10
  getList()
}
init()
</script>
<style lang="scss" scoped>
@import './scss/framework_table.scss';
</style>

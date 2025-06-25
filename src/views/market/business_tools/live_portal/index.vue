<template>
  <div class="page">
    <xm_search :searchComponents="$data.searchComponents" @getData="queryList" @reset="resetList">
      <template #searchBtn>
        <el-button @click="createLivePortal" type="primary">新建传送门</el-button>
      </template>
    </xm_search>
    <div class="page_main mt_16">
      <xm_table
        tableType="avatar"
        v-loading="$data.loading"
        :data="$data.tableData"
        v-model:page="$data.page"
        @getTableData="getList"
      >
        <el-table-column label="抖音信息" min-width="150">
          <template #default="{ row }">
            <div class="user_info">
              <img class="avatar" :src="row.headImg ? row.headImg : avatarImg" alt />
              <div class="info">
                <div class="name">{{ row.name }}</div>
                <div class="dy_num">抖音号：{{ row.dyId || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="UID">
          <template v-slot="{ row }">{{ row.uid }}</template>
        </el-table-column>
        <el-table-column label="传送流量">
          <template #default="scope">
            <div>{{ scope.row.clickCount || '-' }}</div>
          </template>
        </el-table-column>
        <!-- 活动状态 -->
        <el-table-column label="创建时间">
          <template #default="scope">
            <div>{{ scope.row.gmtCreate || '-' }}</div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" align="right" min-width="110">
          <template #default="scope">
            <!-- <el-link type="primary" class="ml_16" @click="edit(scope.row)">查看</el-link> -->
            <el-link type="danger" class="ml_16" @click="del(scope.row, 2)">删除</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import avatarImg from '@/assets/images/content_center/default_user.png'
import { getQuery } from '@/utils/get_query.js'
import { useRouter } from 'vue-router'
import { getLivePoartalList, delLivePoartal } from '@/api/market/business_tools'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const $data = reactive({
  searchComponents: [
    {
      type: 'input',
      label: '抖音昵称',
      val: '',
      filed: 'name',
      placeholder: '请输入抖音昵称'
    },
    {
      type: 'input',
      label: 'UID',
      val: '',
      filed: 'uid',
      placeholder: '请输入抖音UID'
    },
    {
      type: 'dateRange',
      label: '创建时间',
      val: '',
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange'
    }
  ],
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

function createLivePortal() {
  router.push({
    path: '/content_market/live_portal/detail'
  })
}

function getList() {
  $data.loading = true
  const searchParam = getQuery($data.searchComponents, ['startTime', 'endTime'])
  const params = Object.assign(searchParam, {
    pageSize: $data.page.size,
    pageNo: $data.page.index
  })
  getLivePoartalList(params)
    .then(res => {
      $data.tableData = res.data.records
      $data.page.total = res.data.total
    })
    .finally(() => {
      $data.loading = false
    })
}

function queryList() {
  $data.page.index = 1
  getList()
}

function resetList() {
  $data.page.index = 1
  $data.searchParams = {}
  getList()
}

// function edit() {}

function del(row) {
  ElMessageBox.confirm('是否删除该直播传送门', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delLivePoartal({
      id: row.id
    }).then(res => {
      ElMessage.success(res.msg)
      getList()
    })
  })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.user_info {
  display: flex;
  align-items: center;
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  .info {
    margin-left: 12px;
    .name {
      font-size: 14px;
      color: #303133;
      line-height: 17px;
      font-weight: bold;
    }
    .dy_num {
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
      line-height: 17px;
    }
  }
}
</style>

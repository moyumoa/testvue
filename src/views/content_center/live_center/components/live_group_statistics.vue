<template>
  <div>
    <xm_search :searchComponents="$data.searchComponents" @getData="getList"></xm_search>
    <div class="page_main mt_16">
      <xm_table
        tableType="avatar"
        v-loading="$data.loading"
        :data="$data.tableData"
        :showPage="false"
        @getTableData="getList"
      >
        <el-table-column label="姓名" min-width="200">
          <template #default="{ row }">
            <div class="user_info">
              <img class="avatar" :src="row.avatar" />
              <div class="info_right">
                <div class="name">{{ row.name }}</div>
                <div class="role" v-if="row.positionName">{{ row.positionName }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="小组" min-width="150">
          <template #default="{ row }">
            <el-tag v-if="row.groupName">{{ row.groupName }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="时长（分钟）" min-width="120">
          <template #default="{ row }">{{ wanSliceFormat(row.liveTime) }}</template>
        </el-table-column>
        <el-table-column label="付款金额" min-width="120">
          <template #default="{ row }">{{ wanSliceFormat(row.payAmount / 100) }}</template>
        </el-table-column>
        <el-table-column label="付款件数" min-width="120">
          <template #default="{ row }">{{ wanSliceFormat(row.payNum) }}</template>
        </el-table-column>
        <el-table-column label="退款金额" min-width="120">
          <template #default="{ row }">{{ wanSliceFormat(row.refundAmount / 100) }}</template>
        </el-table-column>
        <el-table-column label="退款件数" min-width="120">
          <template #default="{ row }">{{ wanSliceFormat(row.refundNum) }}</template>
        </el-table-column>
        <el-table-column label="客单价" min-width="120">
          <template #default="{ row }">{{ wanSliceFormat(row.customerPrice) }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import api from '@/api/content_center/content_matrix.js'
import { useRoute } from 'vue-router'
import { getQuery } from '@/utils/get_query.js'
import { wanSliceFormat } from '@/utils/tools.js'

const route = useRoute()
const $data = reactive({
  searchComponents: [
    {
      type: 'input',
      label: '姓名',
      val: '',
      filed: 'name'
    },
    {
      type: 'select',
      label: '职位',
      val: '',
      filed: 'position',
      selects: [
        {
          label: '管理员',
          value: '管理员'
        },
        {
          label: '主播',
          value: '主播'
        },
        {
          label: '运营',
          value: '运营'
        },
        {
          label: '场控',
          value: '场控'
        },
        {
          label: '中控',
          value: '中控'
        },
        {
          label: '财务',
          value: '财务'
        },
        {
          label: '投手',
          value: '投手'
        }
      ]
    }
  ],
  tableData: [],
  loading: false
})

function getList() {
  const queryParam = getQuery($data.searchComponents)
  queryParam.roomId = route.query.roomId || ''
  $data.loading = true
  api
    .getLiveGroupStatistics(queryParam)
    .then(res => {
      $data.tableData = res.data
    })
    .finally(() => {
      $data.loading = false
    })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.user_info {
  display: flex;

  .avatar {
    flex-shrink: 0;
    height: 48px;
    width: 48px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .info_right {
    flex: 1;

    .name {
    }

    .role {
      display: inline-block;
      margin-top: 8px;
      padding: 0 6px;
      line-height: 18px;
      font-size: 12px;
      background: #fff0f6;
      border: 1px solid #ffadd2;
      color: #eb2f96;
      border-radius: 10px;
    }
  }
}
</style>

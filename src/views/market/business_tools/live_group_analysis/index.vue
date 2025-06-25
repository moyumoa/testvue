<template>
  <div>
    <xm_search
      :searchComponents="$data.searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_main mt_16">
      <xm_table
        tableType="avatar"
        v-loading="$data.loading"
        :data="$data.tableData"
        v-model:page="$data.page"
        @getTableData="getList"
        :pageSizes="[5, 10, 20]"
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
// import { accountListQuery } from '@/api/content_center/operate_report.js'
import { fetchGroup } from '@/api/market/group.js'
import { getQuery } from '@/utils/get_query.js'
import { wanSliceFormat } from '@/utils/tools.js'

const MONTH = 1000 * 60 * 60 * 24 * 30
const NOW = new Date().getTime()
const $data = reactive({
  searchComponents: [
    // {
    //   type: 'select',
    //   label: '矩阵号',
    //   val: null,
    //   filed: 'xuserIds',
    //   multiple: true,
    //   filterable: true,
    //   remote: true,
    //   remoteMethod: getAccountList(),
    //   'collapse-tags': true,
    //   'collapse-tags-tooltip': true,
    //   selects: []
    // },
    {
      type: 'datetimerange',
      label: '时间',
      val: [new Date(NOW - MONTH), new Date()],
      defaultVal: [new Date(NOW - MONTH), new Date()],
      defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)],
      isDisEdit: true,
      clearable: false,
      placeholder: ['开始时间', '结束时间'],
      filed: 'datetimerange'
    },
    {
      type: 'select',
      label: '小组',
      val: null,
      filed: 'groupId',
      multiple: true,
      filterable: true,
      remote: true,
      remoteMethod: getGroupList(),
      'collapse-tags': true,
      'collapse-tags-tooltip': true,
      selects: []
    },
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
      multiple: true,
      'collapse-tags': true,
      'collapse-tags-tooltip': true,
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
  tableData: [
    {
      avatar:
        'https://img1.baidu.com/it/u=902830885,4052311299&fm=253&fmt=auto&app=120&f=JPEG?w=889&h=500',
      name: '大花园',
      role: '管理员',
      groupName: '小组'
    }
  ],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})

// 矩阵号列表
// function getAccountList(value) {
//   accountListQuery({
//     dyNickname: value
//   }).then(res => {
//     if (res.data && res.data.length) {
//       $data.searchComponents.forEach(item => {
//         if (item.label === '矩阵号') {
//           item.selects = res.data.map(e => {
//             return {
//               label: e.dyNickname,
//               value: e.xuserId
//             }
//           })
//         }
//       })
//     }
//   })
// }

// 分组列表
function getGroupList() {
  fetchGroup({
    pageNumber: 1,
    pageSize: 9999
  }).then(res => {
    if (res.data && res.data.dataList.length) {
      $data.searchComponents.forEach(item => {
        if (item.label === '小组') {
          item.selects = res.data.dataList.map(e => {
            return {
              label: e.groupName,
              value: e.groupId
            }
          })
        }
      })
    }
  })
}

function getList() {
  const queryParam = getQuery($data.searchComponents, ['startTime', 'endTime'])
  queryParam.pageSize = $data.page.size
  queryParam.pageNo = $data.page.index
  $data.loading = true
  api
    .getAllLiveGroupStatistics(queryParam)
    .then(res => {
      $data.tableData = res.data.records
      $data.page.total = res.data.total
    })
    .finally(() => {
      $data.loading = false
    })
}
function searchList() {
  $data.page.index = 1
  getList()
}
function resetSearch() {
  searchList()
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

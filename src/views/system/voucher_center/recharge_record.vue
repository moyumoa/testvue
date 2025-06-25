<template>
  <div>
    <xm_search
      :searchComponents="$data.searchComponents"
      :useOwnReset="true"
      @getData="getList"
      @reset="resetSearch"
    ></xm_search>
    <div class="page_main mt_16">
      <xm_table
        v-loading="$data.loading"
        :data="$data.tableData"
        v-model:page="$data.page"
        @getTableData="getList"
      >
        <el-table-column label="订单编号" prop="orderId" min-width="150"></el-table-column>
        <!-- <el-table-column label="充值说明">
          <template #default="{ row }">{{ row.desc || '-' }}</template>
        </el-table-column> -->
        <el-table-column label="充值类型" min-width="170">
          <template #default="{ row }">
            {{ row.goodsName || getGoodsId(row.goodsId) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="充值数量" min-width="120">
          <template #default="{ row }">
            {{ row.num || '-' }}{{ getUnit(row.goodsId, row) || '' }}
          </template>
        </el-table-column>
        <el-table-column label="订单金额(元)" min-width="120">
          <template #default="{ row }">{{ row.payAmount / 100 }}</template>
        </el-table-column>
        <el-table-column label="订单状态" min-width="120">
          <template #default="{ row }">{{ enums.orderStatus[row.orderStatus] }}</template>
        </el-table-column>
        <el-table-column label="支付方式" min-width="120">
          <template #default="{ row }">{{ enums.payType[row.payChannel] }}</template>
        </el-table-column>
        <el-table-column label="支付时间" min-width="170">
          <template #default="{ row }">{{ row.payTime || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作人" min-width="120">
          <template #default="{ row }">{{ row.buyerName || '--' }}</template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import { getQuery } from '@/utils/get_query.js'
import { getListOrder } from '@/api/system_setting/brand_info'
import { useStore } from 'vuex'

const store = useStore()

const systemVersion = computed(() => store.state.user.systemVersion)
const $data = reactive({
  searchComponents: [
    {
      type: 'input',
      label: '订单编号',
      val: '',
      filed: 'orderId'
    },
    {
      type: 'select',
      label: '充值类型',
      val: -1,
      defaultVal: -1,
      filed: 'goodsId',
      selects: getGoodsIdSelect()
    },
    {
      type: 'dateRange',
      label: '支付时间',
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
    total: 10
  }
})

function getGoodsIdSelect() {
  const list = [
    {
      label: '全部',
      value: -1
    },
    {
      label: '矩阵号接入数（III类）',
      value: 'xuser'
    },
    {
      label: '矩阵号接入数（II类）',
      value: 'xuser_employee'
    },
    {
      label: '矩阵号接入数（I类）',
      value: 'xuser_e'
    },
    {
      label: '直播录屏分钟数',
      value: 'liverecord'
    },
    {
      label: 'AI智能合成星力值',
      value: 'sumvideo'
    },
    {
      label: 'AI文案创作券',
      value: 'ai_creation_ticket'
    },
    {
      label: '员工AI终端',
      value: 'mini_client'
    }
  ]
  let hideItem = []
  if (systemVersion.value === 2) {
    hideItem = [
      'xuser',
      'xuser_employee',
      'xuser_e',
      'liverecord',
      'ai_creation_ticket',
      'mini_client'
    ]
  } else if (systemVersion.value === 1 || systemVersion.value === 4) {
    hideItem = ['xuser', 'xuser_employee', 'xuser_e', 'liverecord', 'ai_creation_ticket']
  }
  return list.filter(x => !hideItem.includes(x.value))
}

// 显示充值数量单位
function getUnit(goodsId, e) {
  const obj = {
    xuser_e: '个',
    xuser: '个',
    xuser_employee: '个',
    liverecord: '分钟',
    sumvideo: '星力值',
    ai_creation_ticket: '张',
    mini_client: '个'
  }
  // 套餐类商品的单位统一是份，其余不变
  return e.packages ? '份' : obj[goodsId] || null
}
// 显示充值类型
function getGoodsId(goodsId) {
  if (!goodsId) return null
  const obj = {
    xuser: '矩阵号接入数（III类）',
    xuser_e: '矩阵号接入数（I类）',
    xuser_employee: '矩阵号接入数（II类）',
    liverecord: '直播录屏分钟数',
    sumvideo: 'AI智能合成星力值',
    ai_creation_ticket: 'AI文案创作券',
    mini_client: '员工AI终端'
  }
  return obj[goodsId] || null
}

const enums = reactive({
  payType: {
    1: '支付宝',
    2: '微信'
  },
  orderStatus: {
    1: '待支付',
    2: '支付成功',
    3: '支付失败'
  }
})

function getList() {
  $data.loading = true
  const params = getQuery($data.searchComponents, ['payTimeStart', 'payTimeEnd'])
  params.pageNo = $data.page.index
  params.pageSize = $data.page.size
  params.orderSetting = 'DESC:order_create_time'
  getListOrder(params)
    .then(res => {
      $data.tableData = res.data.records || []
      $data.page.total = res.data.total
    })
    .finally(() => {
      $data.loading = false
    })
}

function resetSearch() {
  $data.page.index = 1
  $data.page.size = 10
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped></style>

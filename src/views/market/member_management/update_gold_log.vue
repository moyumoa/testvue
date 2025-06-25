<template>
  <div class="page_main">
    <xm_table
      tableType="avatar"
      v-loading="data.loading"
      :data="data.tableData"
      v-model:page="data.page"
      @getTableData="getList"
    >
      <el-table-column label="操作时间" prop="gmtCreate" min-width="200"></el-table-column>
      <el-table-column label="操作人" prop="gmtCreate" min-width="200">
        <template #default="{ row }">
          <div class="user_info">
            <img class="avatar" :src="row.operatorAvatar" />
            <div class="name">{{ row.operatorName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作类型" prop="gmtCreate" min-width="150">
        <template #default="{ row }">{{ data.changeType[row.type] }}</template>
      </el-table-column>
      <el-table-column label="操作数值" prop="changeGold" min-width="150">
        <template #default="{ row }">{{ row.changeGold }}</template>
      </el-table-column>
      <el-table-column label="被操作人号码" prop="phoneNum" min-width="150">
        <template #default="{ row }">
          <div class="phone_box" v-if="row.phoneNum">
            <div v-if="row.showPhone">{{ row.phoneNum }}</div>
            <div v-else>{{ row.phoneNum.substring(0, 3) }}****{{ row.phoneNum.substring(7) }}</div>
            <!-- <div class="eye_icon" @click="row.showPhone = !row.showPhone">
              <img v-if="row.showPhone" src="@/assets/images/operate/yanjing_xianshi.png" alt />
              <img v-else src="@/assets/images/operate/yanjing_yincang.png" alt />
            </div> -->
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作理由" prop="reason" min-width="200">
        <template #default="{ row }">{{ row.reason || '-' }}</template>
      </el-table-column>
    </xm_table>
  </div>
</template>

<script setup>
import { getUpdateGoldLog } from '@/api/market/operate_analysis.js'

const data = reactive({
  tableData: [],
  loading: false,
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  changeType: {
    0: '单个变更',
    1: '批量变更'
  }
})

function getList() {
  data.loading = true
  getUpdateGoldLog({
    pageSize: data.page.size,
    pageNum: data.page.index
  })
    .then(res => {
      data.tableData = res.data.records
      data.page.total = res.data.total || 0
    })
    .finally(() => {
      data.loading = false
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
    margin-right: 10px;
  }
  .name {
    @include mult_line(2);
  }
}

.phone_box {
  font-size: 12px;
  line-height: 17px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .eye_icon {
    width: 12px;
    height: 12px;
    margin-left: 5px;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      display: flex;
    }
  }
}
</style>

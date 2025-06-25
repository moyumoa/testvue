<template>
  <div class="note_wrapper">
    <div class="g_bg note_header">
      <div class="remain_note">
        剩余短信：
        <span>10000条</span>
      </div>
      <p>如需充值，请联系顾问</p>
    </div>
    <xm_search class="mt_16">
      <div class="search_item">
        <label class="item_label" style="line-height: 20px">活动/任务类型</label>
        <div class="item_content">
          <el-select v-model="dyCode" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in nameList"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">短信状态</label>
        <div class="item_content">
          <el-select v-model="dyCode" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in nameList"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="search_item">
        <label class="item_label">发送时间</label>
        <div class="item_content">
          <el-date-picker
            v-model="dyCode"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :clearable="false"
          />
        </div>
      </div>
      <div class="search_item">
        <el-button type="primary" @click="getList">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </xm_search>
    <div class="g_bg mt_16">
      <xm_table
        showIndex
        v-loading="loading"
        :data="listData"
        v-model:page="page"
        @getTableData="getList"
      >
        <el-table-column label="发送日期" prop="sendDate" />
        <el-table-column label="发送手机号" prop="sendDate" />
        <el-table-column label="发送短信文案" prop="sendDate" />
        <el-table-column label="短信状态" prop="status">
          <template #default="{ row }">
            <span class="table_point" v-if="row.status === 1">发送成功</span>
            <span class="table_point reverse" v-else>发送失败</span>
          </template>
        </el-table-column>
        <el-table-column label="活动/任务类型" prop="sendDate" />
        <el-table-column label="消耗条数" prop="sendDate" />
        <el-table-column label="备注" prop="sendDate" />
      </xm_table>
    </div>
  </div>
</template>

<script setup>
const dyCode = ref('')
const nameList = [{ label: '选项一', value: 1 }]

const tableInfo = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
const { loading, listData, page } = toRefs(tableInfo)

const getList = () => {
  loading.value = true
  setTimeout(() => {
    listData.value = [
      {
        sendDate: 'xxx',
        status: 0
      },
      {
        sendDate: 'xxx',
        status: 1
      }
    ]
    loading.value = false
  }, 1000)
}
const reset = () => {}

onMounted(getList)
</script>

<style lang="scss" scoped>
.note_header {
  display: flex;
  justify-content: space-between;
  padding: 24px 32px;
}
</style>

<template>
  <div>
    <slot name="default">
      <el-button type="primary" @click="data.isShowDialog = true" v-if="!appointInfo">
        设置
      </el-button>
      <div class="selected" v-else>
        <span>【预约活动】：{{ appointInfo.activityTitle }}</span>
        <el-icon style="cursor: pointer" @click="cancelSelect">
          <i-delete color="#f85151" />
        </el-icon>
      </div>
    </slot>

    <el-dialog v-model="data.isShowDialog" title="Tips" :width="950">
      <template #title>
        <div class="dialog_title">
          <span class="title">选择页面</span>
        </div>
      </template>
      <div class="page_link_dialog">
        <xm_search :searchComponents="data.searchComponents" @getData="searchList"></xm_search>
        <xm_table
          v-loading="data.loading"
          :data="data.tableData"
          v-model:page="data.page"
          @getTableData="getList"
          :pageSizes="[5, 10, 20]"
        >
          <el-table-column label="标题" prop="activityTitle"></el-table-column>
          <el-table-column label="创建时间" prop="createTime"></el-table-column>
          <el-table-column label="操作" align="right">
            <template #default="scope">
              <el-link type="primary" @click="select(scope.row)">选择</el-link>
            </template>
          </el-table-column>
        </xm_table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.isShowDialog = false">取消</el-button>
          <el-button type="primary" @click="data.isShowDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getAppointmentList } from '@/api/market/task'

const props = defineProps({
  appointInfo: Object
})
const appointInfo = toRef(props, 'appointInfo')
const emits = defineEmits(['update:appointInfo'])
const data = reactive({
  isShowDialog: false,
  loading: false,
  searchComponents: [
    {
      type: 'input',
      label: '活动标题',
      val: '',
      placeholder: '请输入活动标题',
      filed: 'activityTitle'
    }
  ],
  searchParams: {},
  page: {
    index: 1,
    size: 5,
    total: 0
  },
  tableData: [],
  brandAppInfo: {}
})

// 搜索
function searchList(searchData) {
  data.page.index = 1
  data.searchParams = searchData
  getList()
}

// 获取自定义页面列表
function getList() {
  data.loading = true
  const params = Object.assign(data.searchParams, {
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : null,
    status: 1,
    pageSize: data.page.size,
    pageNo: data.page.index
  })
  getAppointmentList(params)
    .then(res => {
      data.tableData = res.data.records || []
      data.page.total = res.data.total || 0
    })
    .finally(() => {
      data.loading = false
    })
}

// 选择页面
function select(row) {
  emits('update:appointInfo', row)
  data.isShowDialog = false
}

// 取消选择
function cancelSelect() {
  emits('update:appointInfo', null)
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
:deep .el-dialog__header {
  padding: 0;
  border-bottom: 1px solid #eff1f4;
  .dialog_title {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 24px;
    .title {
      font-size: 20px;
      color: #333;
      margin-right: 8px;
    }
  }
}
:deep .el-dialog__footer {
  border-top: 1px solid #eff1f4;
}
:deep .xm_search {
  padding: 0 0 8px 0;
}
.selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 30px;
  padding: 0 12px;
  border-radius: 2px;
  border: 1px solid #dcdfe6;
  > span {
    @include mult_line(1);
  }
}
.page_link_dialog {
  .select_page_type {
    margin-top: 10px;
  }
}
</style>

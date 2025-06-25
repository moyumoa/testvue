<template>
  <div class="page">
    <div class="search_box">
      <div class="search_item">
        <label class="item_label">标题</label>
        <div class="item_content">
          <el-input
            v-model.trim="tableForm.title"
            @blur="retEmit($event)"
            placeholder="请输入标题"
            clearable
          />
        </div>
      </div>
      <div class="search_item" style="justify-content: flex-end">
        <el-button type="primary" @click="searchList">查询</el-button>
        <el-button @click="resetList">重置</el-button>
      </div>
    </div>

    <xm_table
      max-height="400"
      v-loading="tableForm.loading"
      :data="tableForm.listData"
      v-model:page="tableForm.page"
      @getTableData="getList"
    >
      <el-table-column min-width="180" label="页面名称">
        <template #default="scope">
          <div class="line-hidden1">
            {{ scope.row.title || '--' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="创建时间">
        <template #default="scope">
          {{ scope.row.gmtCreateTime ? String(scope.row.gmtCreateTime).replace(/T/, ' ') : '--' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" align="center" header-align="center">
        <template #default="scope">
          <div class="table_btn">
            <el-link type="primary" class="one_btn" @click="chooseFun(scope.row)">选择</el-link>
          </div>
        </template>
      </el-table-column>
    </xm_table>
  </div>
</template>
<script setup>
import { page } from '../../page.js'
import { getDiyPage } from '@/api/operation/page_decorate.js'
import { throttle } from '@/utils/tools.js'
const tableForm = reactive({
  loading: false,
  title: '',
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
// 查询
const searchList = throttle(() => {
  tableForm.page.index = 1
  tableForm.loading = true
  getList()
}, 300)
// 重置
const resetList = throttle(() => {
  tableForm.title = ''
  tableForm.page.index = 1
  tableForm.page.size = 10
  tableForm.loading = true
  getList()
}, 300)
resetList()
function getList() {
  const data = {
    nickName: tableForm.title,
    pageNumber: tableForm.page.index,
    pageSize: tableForm.page.size,
    searchCount: true
  }
  getDiyPage(data)
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}

const emits = defineEmits(['upPage'])
// 选择页面
const chooseFun = throttle(e => {
  const data = {
    type: 'diyPage',
    name: 'diyPage',
    label: `【微页面】：${e.title}`,
    url: `${page.get('diyPage').url}?${page.get('diyPage').query}=${e.id}`
  }
  emits('upPage', data)
}, 300)

// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  tableForm.title = e.target.value.replace(reg, '')
}
</script>
<style lang="scss" scoped>
.search_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0 20px;
  .search_item {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .item_label {
      margin-right: 14px;
      text-align: right;
    }
  }
}
</style>

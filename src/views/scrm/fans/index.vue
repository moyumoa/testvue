<template>
  <div class="page">
    <!-- 筛选条件 -->
    <xm_search
      :searchComponents="searchComponents"
      @getData="searchList"
      :useOwnReset="true"
      @reset="resetSearch"
    />
    <!-- 列表 -->
    <div class="table_box">
      <div class="btn_box">注：每个矩阵号只能获取到最新5000个粉丝</div>
      <xm_table
        class="pic_table"
        tableType="live"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
        pageLayout="sizes, prev, pager, next , jumper"
      >
        <el-table-column min-width="220" label="粉丝信息">
          <template #default="scope">
            <div class="one_td">
              <el-image class="user_img" :src="scope.row.fansAvatar" alt>
                <template #error>
                  <div class="user_img errImg_box"></div>
                </template>
              </el-image>
              <div class="user_content">
                <div class="user_content1 line-hidden1">
                  {{ scope.row.fansNickname || '--' }}
                </div>
                <!-- <div class="user_content2 line-hidden1">{{ scope.row.fansOpenId || '--' }}</div> -->
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="220" label="关联矩阵号">
          <template #default="scope">
            <div class="one_td">
              <el-image class="user_img" :src="scope.row.headUrl" alt>
                <template #error>
                  <div class="user_img errImg_box"></div>
                </template>
              </el-image>
              <div class="user_content">
                <div class="user_content1 line-hidden1">
                  {{ scope.row.nickName || '--' }}
                </div>
                <div class="user_content2 line-hidden1">
                  抖音号：{{ scope.row.displayId || '--' }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="170" label="最近互动时间">
          <template #default="scope">
            {{ scope.row.lastInteractionTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column min-width="170" label="操作">
          <template #default="scope">
            <el-link type="primary" :disabled="!scope.row.imEnable" @click="openChat(scope.row)">
              发起会话
            </el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import { list } from '@/api/scrm/fans.js'
import { getQuery } from '@/utils/get_query.js'
import { useRouter } from 'vue-router'
import { createNewChat } from '../session_management/js/tools'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()
// 筛选条件
const searchComponents = ref([
  {
    type: 'input',
    label: '粉丝信息',
    val: '',
    placeholder: '请输入粉丝昵称',
    filed: 'fansName'
  },
  {
    type: 'input',
    label: '关联矩阵号',
    val: '',
    placeholder: '请输入关联矩阵号',
    filed: 'nickName'
  },
  {
    type: 'dateRange', // 组件类型
    label: '最近互动时间', // label展示
    val: '', // 响应式绑定
    disabledDate(time) {
      return time.getTime() > Date.now()
    }, // 禁用日期
    isDisEdit: true, // 是否禁用文本框输入
    placeholder: ['开始时间', '结束时间'],
    filed: 'dateRange' // 查询字段名
  }
])
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
// 重置
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 10
  getList()
}
resetSearch()
// 查询
function searchList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
function getList() {
  const data = getQuery(searchComponents.value, ['interactionMin', 'interactionMax'])
  data.pageNo = tableForm.page.index
  data.pageSize = tableForm.page.size
  list(data)
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
    })
    .finally(() => {
      tableForm.loading = false
    })
}
const openChat = throttle(function (e) {
  const fromUser = {
    openId: e.fansOpenId,
    avatar: e.fansAvatar,
    name: e.fansNickname
  }
  const toUser = {
    openId: e.openId,
    avatar: e.headUrl,
    name: e.nickName
  }
  createNewChat(fromUser, toUser, () => {
    router.push({ path: '/scrm/session_management' })
    store.commit('chat/needIntendedChat', true)
  })
}, 500)
</script>

<style lang="scss" scoped>
@import '../components/scss/diy_table.scss';
.table_box {
  margin: 16px 0;
  background: #fff;
  padding: 22px 24px 24px;
  border-radius: 4px;
  .btn_box {
    color: #364fcd;
    margin-bottom: 22px;
  }
}
</style>

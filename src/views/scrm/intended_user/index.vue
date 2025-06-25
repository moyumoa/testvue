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
      <div class="btn_box">
        注：意向用户是指在抖音 app 内与企业号发生互动（包括私信，留资等）的用户
      </div>
      <xm_table
        class="pic_table"
        tableType="live"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
        pageLayout="sizes, prev, pager, next , jumper"
      >
        <el-table-column min-width="220" label="用户信息">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row.userInfo"
              :showDyNum="false"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column min-width="220" label="关联企业号">
          <template #default="{ row }">
            <table_column_matrix_account :info="row.enterpriseInfo"></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column min-width="130" label="用户状态">
          <template #default="scope">
            {{ scope.row.isFollow ? '粉丝' : '非粉丝' }}
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
import { list } from '@/api/scrm/intended_user.js'
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
    label: '用户信息',
    val: '',
    placeholder: '请输入用户昵称',
    filed: 'enName'
  },
  {
    type: 'input',
    label: '关联企业号',
    val: '',
    placeholder: '请输入关联企业号',
    filed: 'nickName'
  },
  {
    type: 'select',
    label: '用户状态',
    placeholder: '全部',
    filed: 'leadsLevelOp',
    val: -1,
    defaultVal: -1,
    selects: [
      {
        label: '全部',
        value: -1
      },
      {
        label: '粉丝',
        value: 'eq'
      },
      {
        label: '非粉丝',
        value: 'not'
      }
    ]
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
      const list = res.data.records || []
      list.forEach(e => {
        e.showPhone = false
        e.enterpriseInfo = {
          dyAvatar: e.headUrl,
          dyName: e.nickName,
          dyNum: e.displayId
        }
        e.userInfo = {
          dyAvatar: e.userAvatar,
          dyName: e.userNickname
        }
      })
      tableForm.listData = list
      tableForm.page.total = res.data.total || 0
    })
    .finally(() => {
      tableForm.loading = false
    })
}
const openChat = throttle(function (e) {
  const fromUser = {
    openId: e.userOpenId,
    avatar: e.userAvatar,
    name: e.userNickname
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
// 手机号的显示隐藏
// function showPhoneFun(index) {
//   tableForm.listData[index].showPhone = !tableForm.listData[index].showPhone
// }
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

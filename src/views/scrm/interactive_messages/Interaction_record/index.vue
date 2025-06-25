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
        v-loading="listLoading"
        :data="list"
        v-model:page="page"
        @getTableData="getTableList"
      >
        <el-table-column label="矩阵号信息" width="260px">
          <template #default="{ row }">
            <table_column_matrix_account :info="row.enterpriseInfo"></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" width="200px">
          <template #default="{ row }">
            <table_column_matrix_account
              :info="row.userInfo"
              :showDyNum="false"
            ></table_column_matrix_account>
          </template>
        </el-table-column>
        <el-table-column label="用户互动行为">
          <template #default="{ row }">{{ USER_INTERACTION_TYPE.getCN(row.eventType) }}</template>
        </el-table-column>
        <el-table-column label="用户互动内容">
          <template #default="{ row }">
            <div class="more_text" :title="row.eventStr">{{ row.eventStr }}</div>
          </template>
        </el-table-column>
        <el-table-column label="触达状态">
          <template #default="{ row }">
            <div class="message_type">
              <!--状态值1表示成功，0表示失败-->
              <span>{{ row.status === 1 ? '成功' : '失败' }}</span>
              <el-tooltip
                v-if="row.failReason"
                popper-class="tooltip-class"
                :content="row.failReason"
              >
                <el-icon><i-question-filled color="#bfc4cd" /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="触达内容">
          <template #default="{ row }">
            <div class="more_text" :title="row.replyWord">{{ row.replyWord }}</div>
          </template>
        </el-table-column>
        <el-table-column label="触达时间" width="180px">
          <template #default="{ row }">{{ row.gmtCreate }}</template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="100">
          <template #default="{ row }">
            <el-link type="primary" class="ml_16" @click="toSession(row)">进入会话</el-link>
          </template>
        </el-table-column>
      </xm_table>
    </div>
  </div>
</template>

<script setup>
import tableList from '@/utils/com_composition/table_list.js'
import { getTriggerList } from '@/api/scrm/session_management'
import { getQuery } from '@/utils/get_query'
import { USER_INTERACTION_TYPE } from '@/utils/dictionary/session-management'
import { throttle } from '@/utils/tools.js'
import { createNewChat } from '@/views/scrm/session_management/js/tools.js'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getUserGroup } from '@/api/market/operate_analysis'

const store = useStore()
const router = useRouter()
const { query } = useRoute()
const message = inject('$message')
const $data = reactive({
  searchComponents: [
    {
      type: 'input',
      label: '矩阵号',
      val: '',
      placeholder: '请输入矩阵号昵称、抖音号',
      filed: 'accountName'
    },
    {
      type: 'select',
      label: '分组',
      val: null,
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      remote: true,
      remoteMethod: getUserGroupList(),
      'collapse-tags': true,
      'collapse-tags-tooltip': true,
      selects: []
    },
    {
      type: 'select',
      label: '用户互动行为',
      val: -1,
      defaultVal: -1,
      filed: 'eventType',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '视频评论',
          value: 110
        },
        {
          label: '私信',
          value: 112
        },
        {
          label: '直播弹幕',
          value: 210
        }
      ]
    },
    {
      type: 'dateRange',
      label: '触达时间',
      val: '',
      isDisEdit: true,
      disabledDate(time) {
        return (
          new Date(new Date().toLocaleDateString()).getTime() - 60 * 24 * 3600 * 1000 >
            time.getTime() || time.getTime() > Date.now()
        )
      }, // 禁用日期
      placeholder: ['开始时间', '结束时间']
    }
  ]
})

// 获取矩阵号分组
function getUserGroupList(value) {
  getUserGroup({
    groupName: value
  }).then(res => {
    $data.searchComponents.forEach(item => {
      if (item.label === '分组') {
        item.selects = res.data.map(e => {
          return {
            label: e.groupName,
            value: e.id
          }
        })
      }
    })
  })
}

function getList(page) {
  const param = getQuery($data.searchComponents, ['startTime', 'endTime'])
  param.pageNo = page.index
  param.pageSize = page.size
  if (!param.groupIds) {
    param.groupIds = []
  }
  return getTriggerList(param).then(res => {
    let _list = res.data.records
    _list = _list.map(e => {
      e.enterpriseInfo = {
        dyAvatar: e.dyHeadUrl,
        dyName: e.dyNickname,
        dyNum: e.dyDisplayId
      }
      e.userInfo = {
        dyAvatar: e.clientAvatar,
        dyName: e.clientNickname
      }
      return e
    })
    page.total = res.data.total
    return _list
  })
}
const { page, list, getTableList, listLoading, searchList, resetSearch } = tableList(getList)

const toSession = throttle(function (e) {
  if (!e.enterImStatus) {
    message.warning('该矩阵号当前未授权抖音web端')
    return
  }
  const fromUser = {
    openId: e.fromUserId,
    avatar: e.fromAvatar,
    name: e.fromNickname,
    clientUserId: e.clientId, // scrm 多存储一个用于请求互动记录
    source: e.source // 多存储一个来源
  }
  const toUser = {
    openId: e.toUserId,
    avatar: e.dyHeadUrl,
    name: e.dyNickname
  }
  createNewChat(fromUser, toUser, () => {
    router.push({
      path: '/scrm/session_management',
      query: { fromUserId: e.fromUserId, toUserId: e.toUserId, clientUserId: e.clientId }
    })
    store.commit('chat/needIntendedChat', true)
  })
}, 500)

onMounted(() => {
  const nowTime = new Date().getTime()
  const WEEK = 24 * 60 * 60 * 1000 * 6
  $data.searchComponents.forEach(e => {
    if (e.label === '回复时间') {
      e.val = [new Date(nowTime - WEEK), new Date()]
      e.defaultVal = [new Date(nowTime - WEEK), new Date()]
    }
    if (e.label === '矩阵号') {
      if (query.dyNickname) {
        e.val = query.dyNickname
      }
    }
  })
  getTableList()
})
</script>

<style lang="scss" scoped>
.page_main {
  padding-bottom: 20px;
}
.message_type {
  display: flex;
  align-items: center;
  > span {
    margin-right: 5px;
  }
}
.more_text {
  overflow: hidden; // 溢出隐藏
  text-overflow: ellipsis; // 溢出用省略号显示
  display: -webkit-box; // 作为弹性伸缩盒子模型显示。
  -webkit-box-orient: vertical; // 设置伸缩盒子的子元素排列方式：从上到下垂直排列
  -webkit-line-clamp: 2; // 显示的行数
}
</style>

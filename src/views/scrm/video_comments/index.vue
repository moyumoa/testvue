<template>
  <div class="management_page">
    <div class="management_left">
      <div class="left_title">评论筛选项</div>
      <div class="left_from">
        <div class="one_form one_form_radio">
          <div class="form_title">是否高意向</div>
          <div class="form_content">
            <el-radio-group v-model="form.isHigh">
              <el-radio :label="-1">全部</el-radio>
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="one_form one_form_radio">
          <div class="form_title">回复状态</div>
          <div class="form_content">
            <el-radio-group v-model="form.isReply">
              <el-radio :label="-1">全部</el-radio>
              <el-radio :label="1">已回复</el-radio>
              <el-radio :label="0">未回复</el-radio>
            </el-radio-group>
          </div>
        </div>

        <div class="one_form">
          <div class="form_title">评论内容</div>
          <div class="form_content">
            <el-input
              clearable
              @blur="retEmit($event, 'commentContent')"
              v-model.trim="form.commentContent"
              placeholder="请输入评论内容"
              type="text"
              maxlength="20"
            ></el-input>
          </div>
        </div>
        <div class="one_form">
          <div class="form_title">评论用户</div>
          <div class="form_content">
            <el-input
              clearable
              @blur="retEmit($event, 'commentUserName')"
              v-model.trim="form.commentUserName"
              placeholder="请输入用户昵称"
              type="text"
              maxlength="20"
            ></el-input>
          </div>
        </div>
        <div class="one_form">
          <div class="form_title">来源矩阵号</div>
          <div class="form_content">
            <el-input
              clearable
              @blur="retEmit($event, 'fromOpenNickname')"
              v-model.trim="form.fromOpenNickname"
              placeholder="请输入矩阵号昵称"
              type="text"
              maxlength="20"
            ></el-input>
          </div>
        </div>
        <div class="one_form">
          <div class="form_title">矩阵号部门</div>
          <div class="form_content">
            <choose_dept_search
              ref="chooseDeptSearchRef"
              @updateDeptIds="onChangeDepartment"
              :multiple="true"
              :isUsePermission="true"
              searchLabel="矩阵号部门"
            />
          </div>
        </div>
        <div class="one_form">
          <div class="form_title">评论时间</div>
          <div class="form_content">
            <el-date-picker
              v-model="form.commentTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              unlink-panels
              :editable="false"
              :disabled-date="tableForm.disabledDate"
            ></el-date-picker>
          </div>
        </div>
        <div class="one_form from_btn">
          <el-button @click="resetFun">重置</el-button>
          <el-button type="primary" @click="searchFun">查询</el-button>
        </div>
      </div>
    </div>
    <div class="management_right" ref="tableParentRef">
      <xm_table
        :maxTableHeight="tableHeight"
        rowKey="id"
        tableType="avatar"
        v-loading="tableForm.loading"
        :data="tableForm.list"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <el-table-column min-width="220" label="评论内容" prop="content">
          <template #header>
            <div class="column_header">
              <span>评论内容</span>
              <el-tooltip placement="top">
                <template #content>
                  <div style="max-width: 350px">“红点”代表该评论未回复</div>
                </template>
                <div
                  class="xm_tooltipOfRight"
                  style="width: max-content; color: #303133 !important"
                ></div>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div :class="{ not_read_box: row.replyStatus === 0 }">
              <div class="red_icon" v-if="row.replyStatus === 0"></div>
              <div class="keyword_box line-hidden2" :title="row.content || ''">
                <div class="one_keyword" v-if="row.keyword">{{ row.keyword }}</div>
                {{ row.content || '--' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="150" label="评论时间">
          <template #default="{ row }">
            <div class="time">{{ row.commentTime || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column min-width="150" label="评论用户">
          <template #default="{ row }">
            <div class="user_box">
              <img
                v-if="row.commentUserAvatar"
                :src="row.commentUserAvatar"
                class="user_head"
                alt=""
              />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                class="user_head"
                alt=""
              />
              <div class="user_content">
                <div class="content_text">
                  {{ row.commentUserNickname || '匿名客户' }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="166" align="right" header-align="right" label="操作">
          <template #default="{ row }">
            <div class="btn_box">
              <!-- 进入会话： 未被删除 &&（视频潜客-认证企业号/员工号 || 私信潜客-认证企业号/员工号 || 历史内容中台线索来源-认证企业号/员工号）&& 矩阵号未被删除 -->
              <template
                v-if="
                  row.xuserIsDelete === 0 &&
                  (row.clientSource == 112 ||
                    row.clientSource == 110 ||
                    row.clientSource == 310 ||
                    row.clientSource == 311 ||
                    row.clientSource == 312 ||
                    row.clientSource == 313) &&
                  (row.eaccountRole == 'EAccountS' ||
                    row.eaccountRole == 'EAccountK' ||
                    row.enterpriseType)
                "
              >
                <el-link type="primary" @click="openChat(row)">进入会话</el-link>
                <div class="ling"></div>
              </template>
              <el-link type="primary" @click="toDetails(row)">视频详情</el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 视频详情 -->
    <transition name="drawer-transform">
      <detailDOM :detailInfo="detailInfo" v-if="detailInfo.show" />
    </transition>
  </div>
</template>
<script setup>
import { videoCommentList } from '@/api/scrm/interactive_management.js'
import detailDOM from './detail.vue'
import { createNewChat } from '../session_management/js/tools'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { throttle, dateFormat } from '@/utils/tools'

const store = useStore()
const router = useRouter()
const form = ref({
  isHigh: 1,
  isReply: -1,
  commentContent: '',
  commentUserName: '',
  fromOpenNickname: '',
  commentTime: [new Date(new Date().setDate(new Date().getDate() - 29)), new Date()]
})
const tableForm = reactive({
  disabledDate(time) {
    return (
      time.getTime() > Date.now() ||
      time.getTime() <= new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    )
  }, // 禁用日期

  page: {
    index: 1,
    size: 10,
    total: 0
  },
  loading: true,
  list: []
})
const chooseDeptSearchRef = ref(null)

// 部门修改
function onChangeDepartment(e) {
  console.log('矩阵号部门修改', e)
  form.value.department = e || null
  // $data.currentDepartment = isNotEmpty(e) ? e : ''
  // getAccountLevel()
}

function retEmit(e, key) {
  // form.value[key] = e.target.value.replace(
  //   // eslint-disable-next-line no-misleading-character-class
  //   /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi,
  //   ''
  // )
}

// 重置
const resetFun = throttle(() => {
  closeDetail()
  tableForm.page = {
    index: 1,
    size: 10,
    total: 0
  }
  form.value = {
    isHigh: 1,
    isReply: -1,
    commentContent: '',
    commentUserName: '',
    fromOpenNickname: '',
    commentTime: [new Date(new Date().setDate(new Date().getDate() - 29)), new Date()],
    department: []
  }
  nextTick(() => {
    chooseDeptSearchRef.value?.clearFun()
  })
  getList()
}, 500)
// 查询
const searchFun = throttle(() => {
  closeDetail()
  tableForm.page = {
    index: 1,
    size: 10,
    total: 10
  }
  getList()
}, 500)
function getList() {
  tableForm.loading = true

  videoCommentList({
    commentContent: form.value.commentContent || '',
    commentUserName: form.value.commentUserName || '',
    startTime:
      form.value.commentTime && form.value.commentTime.length > 1
        ? dateFormat(form.value.commentTime[0]) + ' 00:00:00'
        : '',
    endTime:
      form.value.commentTime && form.value.commentTime.length > 1
        ? dateFormat(form.value.commentTime[1]) + ' 23:59:59'
        : '',
    fromOpenNickname: form.value.fromOpenNickname || '',
    highIntention: form.value.isHigh === -1 ? null : form.value.isHigh,
    replayStatus: form.value.isReply === -1 ? null : form.value.isReply,
    deptIds: form.value.department,
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        tableForm.list = res.data.records || []
        tableForm.page.total = res.data.total
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
// 发起会话
const openChat = throttle(function (e) {
  const fromUser = {
    openId: e.fromUid || e.fromUserId,
    avatar: e.commentUserAvatar,
    name: e.commentUserNickname,
    clientUserId: e.clientUserId, // scrm 多存储一个用于请求互动记录
    source: e.clientSource // scrm五期是否显示icon
  }
  const toUser = {
    openId: e.toUid || e.toUserId,
    avatar: e.fromXUserAvatar,
    name: e.fromXUserNickname
  }
  createNewChat(fromUser, toUser, () => {
    router.push({
      path: '/scrm/session_management',
      query: { fromUserId: fromUser.openId, toUserId: toUser.openId, clientUserId: e.clientUserId }
    })
    store.commit('chat/needIntendedChat', true)
  })
}, 700)

const detailInfo = reactive({
  show: false,
  id: null,
  itemId: ''
})
// 打开详情
const toDetails = throttle(e => {
  if (e.id) {
    detailInfo.openId = e.toUserId
    detailInfo.id = e.id
    detailInfo.itemId = e.replyToItemId || ''
    detailInfo.show = true
  }
}, 500)
function closeDetail() {
  detailInfo.show = false
  detailInfo.openId = ''
  detailInfo.id = null
  detailInfo.itemId = ''
}
// 获取表格高度
const tableParentRef = ref()
const tableHeight = ref(null)
function onResize() {
  tableHeight.value = tableParentRef.value.clientHeight - 44 - 56
}
onMounted(() => {
  resetFun()
  onResize()
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>
<style lang="scss" scoped>
@import '../components/scss/interactive_management.scss';
.not_read_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .red_icon {
    width: 8px;
    height: 8px;
    background: #f85151;
    margin-right: 8px;
    margin-top: 6px;
    border-radius: 100%;
  }
  .keyword_box {
    max-width: calc(100% - 16px);
  }
}
.xm_tooltipOfRight::after {
  margin-left: 8px;
  width: 16px;
  height: 16px;
}
.column_header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
</style>

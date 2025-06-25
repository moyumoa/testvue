<template>
  <div class="management_page">
    <div class="management_left">
      <div class="left_title">弹幕筛选项</div>
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
        <div class="one_form">
          <div class="form_title">弹幕内容</div>
          <div class="form_content">
            <el-input
              clearable
              @blur="retEmit($event, 'chatContent')"
              v-model.trim="form.chatContent"
              placeholder="请输入弹幕内容"
              type="text"
              maxlength="20"
            ></el-input>
          </div>
        </div>
        <div class="one_form">
          <div class="form_title">发送用户</div>
          <div class="form_content">
            <el-input
              clearable
              @blur="retEmit($event, 'chatUserName')"
              v-model.trim="form.chatUserName"
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
          <div class="form_title">发送时间</div>
          <div class="form_content">
            <el-date-picker
              v-model="form.sendTime"
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
        <el-table-column min-width="220" label="直播弹幕内容">
          <template #default="{ row }">
            <div class="keyword_box line-hidden2" :title="row.content || ''">
              <div class="one_keyword" v-if="row.keyword">{{ row.keyword }}</div>
              {{ row.content || '--' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="150" label="发送时间">
          <template #default="{ row }">
            <div class="time">{{ row.msgSendTime || '--' }}</div>
          </template>
        </el-table-column>

        <el-table-column min-width="150" label="发送用户">
          <template #default="{ row }">
            <div class="user_box">
              <img v-if="row.avatar" :src="row.avatar" class="user_head" alt="" />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                class="user_head"
                alt=""
              />
              <div class="user_content">
                <div class="content_text">
                  {{ row.nickname || '匿名客户' }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="150" align="right" header-align="right" label="操作">
          <template #default="{ row }">
            <div class="btn_box">
              <el-link type="primary" @click="toDetails(row)">弹幕详情</el-link>
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <!-- 弹幕详情 -->
    <transition name="drawer-transform">
      <detailDOM :detailInfo="detailInfo" v-if="detailInfo.show" />
    </transition>
  </div>
</template>
<script setup>
import { liveChatMessageList } from '@/api/scrm/interactive_management.js'
import detailDOM from './detail.vue'
import { throttle, dateFormat } from '@/utils/tools'

const form = ref({
  isHigh: 1,
  chatContent: '',
  chatUserName: '',
  fromOpenNickname: '',
  sendTime: [new Date(new Date().setDate(new Date().getDate() - 29)), new Date()]
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
    chatContent: '',
    chatUserName: '',
    fromOpenNickname: '',
    sendTime: [new Date(new Date().setDate(new Date().getDate() - 29)), new Date()],
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
  liveChatMessageList({
    chatContent: form.value.chatContent || '',
    chatUserName: form.value.chatUserName || '',

    startTime:
      form.value.sendTime && form.value.sendTime.length > 1
        ? dateFormat(form.value.sendTime[0]) + ' 00:00:00'
        : '',
    endTime:
      form.value.sendTime && form.value.sendTime.length > 1
        ? dateFormat(form.value.sendTime[1]) + ' 23:59:59'
        : '',
    fromOpenNickname: form.value.fromOpenNickname || '',
    highIntention: form.value.isHigh === -1 ? null : form.value.isHigh,
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

const detailInfo = reactive({
  show: false,
  id: null,
  roomId: ''
})
// 打开详情
const toDetails = throttle(e => {
  if (e.id) {
    detailInfo.id = e.id
    detailInfo.roomId = e.roomId || ''
    detailInfo.show = true
  }
}, 500)
function closeDetail() {
  detailInfo.show = false
  detailInfo.id = null
  detailInfo.roomId = ''
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
</style>

<template>
  <div class="user_box tab_box">
    <div class="tab_head">客户信息</div>
    <div class="tab_content">
      <div class="content1">
        <el-image class="content1_left" :src="$data.userInfo.avatar">
          <template #error>
            <div class="content1_left errImg_box"></div>
          </template>
        </el-image>
        <div class="content1_right">
          <div class="right_name line-hidden1" v-if="toChatInfo.openId">
            {{ $data.userInfo.nickname || '匿名客户' }}
          </div>
          <div class="right_name line-hidden1" v-else>
            {{ $data.userInfo.nickname || '-' }}
          </div>
          <!-- <div class="right_id line-hidden1">
            {{ $data.userInfo.province }} - {{ $data.userInfo.city }}
          </div> -->
        </div>
      </div>
      <div class="content2">
        <div>客户关系：</div>
        <div class="both_text" v-if="$data.userInfo.openId">
          {{ CUSTOMER_RELATE.getCN($data.userInfo.isFollow) || '--' }}
        </div>
        <div class="both_text" v-else>-</div>
      </div>
      <!-- scrm新增 潜在客户意向下拉 -->
      <div class="content4">
        <div class="content_select">
          意向标签：
          <el-select
            :disabled="!fromChatInfo.openId || !toChatInfo.openId"
            v-model="selectIntentionVal"
            class="m-2"
            placeholder="选择标签"
            @change="IntentionChange"
          >
            <el-option
              v-for="item in intentionList"
              :key="item.value"
              :label="item.label || '-'"
              :value="item.value"
              v-show="item.value == 1 || item.value == 2 || item.value == 3"
            />
          </el-select>
        </div>
      </div>
      <div class="content3">
        <div>备注信息：</div>
        <el-input
          class="content_input"
          v-model="$data.remark"
          type="textarea"
          :maxlength="100"
          :autosize="false"
          @blur="autoSaveRemark"
          placeholder="输入文字"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { saveRemark, getUserDetail, changeDetail } from '@/api/scrm/session_management.js'
import { CUSTOMER_RELATE } from '@/utils/dictionary/customer.js'
const $store = useStore()
const message = inject('$message')
const $data = reactive({
  userInfo: {},
  remark: ''
})

// 用户信息
const fromChatInfo = computed(() => {
  return $store.state.chat.currentChatUser
})
// 聊天自己
const toChatInfo = computed(() => {
  return $store.state.chat.currentChatMineInfo
})

// 初始化
function init() {
  clear()
  _getUserDetail()
}

function clear() {
  $data.userInfo = {}
  $data.remark = $data.userInfo.remark || ''
}

function _getUserDetail() {
  getUserDetail({
    fromUserId: fromChatInfo.value.openId,
    toUserId: toChatInfo.value.openId
  }).then(res => {
    $data.userInfo = res.data || {}
    $data.remark = res.data.remark
    // 回显用户意向clientIntentStatus
    console.log(res.data.clientIntentStatus, 'res.data.clientIntentStatus')
    if (res.data.clientIntentStatus) {
      selectIntentionVal.value = res.data.clientIntentStatus - 1
    }
  })
}

// 保存备注
function autoSaveRemark(e) {
  if (!fromChatInfo.value.openId || !toChatInfo.value.openId) return
  if (!$data.remark) return
  // const reg =
  //   /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  // $data.remark = e.target.value.replace(reg, '')
  saveRemark({
    fromUserId: fromChatInfo.value.openId,
    remark: $data.remark,
    toUserId: toChatInfo.value.openId
  })
    .then(res => {
      if (res.code === 0) {
        message.success('保存成功')
        $data.userInfo.remark = $data.remark
      } else {
        $data.remark = $data.userInfo.remark
      }
    })
    .catch(() => {
      $data.remark = $data.userInfo.remark
    })
}

const selectIntentionVal = ref(null)
const intentionList = [
  {
    // label: 潜在高意向,
    label: null,
    value: 0
  },
  {
    label: '高意向',
    value: 1
  },
  {
    label: '中意向',
    value: 2
  },
  {
    label: '低意向',
    value: 3
  },
  {
    label: '--',
    value: 4
  }
]
function IntentionChange(val) {
  console.log('当前选中val', selectIntentionVal.value, val, fromChatInfo.value, toChatInfo.value)
  if (!fromChatInfo.value.openId || !toChatInfo.value.openId) return
  changeDetail({
    fromUserId: fromChatInfo.value.openId,
    toUserId: toChatInfo.value.openId,
    clientIntentStatus: val + 1,
    consultModifyFlag: 6
  }).then(res => {
    console.log('更改粉丝标签的res=>', res)
    if (res.code === 0) {
      message.success('更改成功')
    }
  })
}

watch(
  () => fromChatInfo.value,
  newVal => {
    if (newVal && newVal.openId) {
      init()
    } else {
      clear()
    }
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
.user_box {
  background: #ffffff;
  border-radius: 4px;
  margin-bottom: 16px;
  .tab_content {
    padding: 20px 24px;
    .content1 {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .content1_left {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 50%;
      }
      .content1_right {
        width: calc(100% - 52px);
        margin-left: 12px;
        .right_name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          line-height: 20px;
        }
        .right_id {
          margin-top: 2px;
          font-size: 14px;
          font-weight: 400;
          color: #8f939a;
          line-height: 20px;
        }
      }
    }
    .content2 {
      margin: 16px 0;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;
      .both_text {
        font-weight: 500;
        color: #303133;
        padding-left: 11px;
      }
    }
    .content3 {
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;

      :deep(.el-textarea__inner) {
        margin-top: 12px;
        height: 76px;
        resize: none;
        background: #f6f8fa;
        border-radius: 4px;
        border: none;
      }
    }

    .content4 {
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      .content_select {
        display: flex;
        align-items: center;
        height: 14px;
      }
      :deep() .el-select {
        --el-select-border-color-hover: unset;
        --el-select-disabled-border: unset;
        --el-select-font-size: unset;
        --el-select-close-hover-color: unset;
        --el-select-input-color: unset;
        --el-select-multiple-input-color: unset;
        --el-select-input-focus-border-color: unset;
        width: 116px;
        color: #303133;
      }
      :deep() .el-input__inner {
        border: unset;
        outline: unset;
        background-color: #ffffff;
        color: #303133;
        font-weight: 500;
      }
      :deep().el-icon {
        color: #606266;
      }
    }
  }
}
</style>

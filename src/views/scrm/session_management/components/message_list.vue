<template>
  <div class="left_page">
    <enterprise-account-list
      ref="enterpriseAccountListRef"
      type="message"
      collapse
      @change="onChangeAccount"
      @getmatrixNumberList="getMatrixNumberList"
      @changeNewMessageInList="changeNewMessageInList"
      :newMessageInList="newMessageInList"
    ></enterprise-account-list>
    <div class="tabs_wrapper">
      <!-- 选择账户 -->
      <div class="left_top">
        <div class="top_title_area">
          <div class="top_title_area_left">
            <div class="top_title">消息</div>
            <div class="clear_area" v-if="$data.messageForm.list.length > 0" @click="clearNoRead">
              <el-tooltip class="box-item" effect="dark" placement="top" content="清除消息">
                <img src="https://tagvv-1256030678.file.myqcloud.com/20230413xbgvy.png" />
              </el-tooltip>
            </div>
          </div>
          <div class="top_title_area_right">
            <el-tooltip placement="top">
              <template #content>
                <div style="max-width: 350px">
                  开启后，客户发送的第一条私信，包含营销、推广、引流等关键词时，在当前列表被过滤不显示
                </div>
              </template>
              <div class="xm_tooltipOfRight" style="width: max-content">过滤无效私信</div>
            </el-tooltip>
            <el-switch
              style="margin-left: 8px"
              v-model="$data.isFilter"
              @change="changeFilter"
              :disabled="$data.messageForm.loading"
              active-text="开"
              inactive-text="关"
              inline-prompt
            ></el-switch>
          </div>
        </div>

        <div class="account_info">
          <div style="position: relative">
            <el-image class="avatar" :src="$data.currentAccountInfo.dyHeadUrl">
              <template #error>
                <div class="user_img errImg_box"></div>
              </template>
            </el-image>
            <!--     抖音授权失效 或者抖音web授权失效给出提示，优先显示抖音授权失效       -->
            <el-tooltip
              v-if="$data.currentAccountInfo.isDel !== 0"
              :content="
                $data.currentAccountInfo.isDel !== 0
                  ? `${
                      $data.currentAccountInfo.platform
                        ? PLATFORM.getCN($data.currentAccountInfo.platform)
                        : '抖音'
                    }授权失效`
                  : ''
              "
              placement="top"
            >
              <!--   有信息才显示       -->
              <div class="warn_icon" v-if="$data.currentAccountInfo.dyHeadUrl"></div>
            </el-tooltip>
            <div class="platform_icon_box" v-if="$data.currentAccountInfo.platform">
              <div :class="[`xm_platformIcon_${$data.currentAccountInfo.platform}`]"></div>
            </div>
          </div>
          <div class="name">{{ $data.currentAccountInfo.dyNickname || '' }}</div>
          <div class="action_btn" @click="toPolicy" v-if="$data.accountOpenId">
            <!-- <el-icon>
              <i-chat-dot-round />
            </el-icon> -->
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20230608silns.png"
              alt
              class="chat_icon"
            />
            <span style="margin-left: 4px">获客策略</span>
          </div>
        </div>
        <div class="table_form">
          <el-input
            clearable
            v-model="$data.searchNickName"
            @input="onChangeNickName"
            placeholder="搜索客户昵称"
            :prefix-icon="transElIconName('Search')"
          ></el-input>
        </div>
      </div>
      <!-- 列表筛选项 -->
      <div class="tab_box">
        <div
          :class="{ one_tab: true, choose_tab: $data.chooseListOfTab == item.value }"
          v-for="(item, index) in $data.listOfTabList"
          :key="index"
          @click="changeListOfTab(item.value)"
        >
          {{ item.label }}
        </div>
      </div>
      <!-- 列表 -->
      <div
        class="left_bottom"
        v-loading="$data.messageForm.loading"
        element-loading-text="加载中..."
      >
        <!-- 有数据 -->
        <div
          class="have_list"
          v-if="$data.messageForm.list.length > 0 && !$data.messageForm.loading"
          v-infinite-scroll="loadNextList"
          :infinite-scroll-immediate="false"
        >
          <div
            class="one_item"
            :class="{
              active:
                item.fromUserId === $data.selectedChatUser.fromUserId &&
                item.toNickName == $data.selectedChatUser.toNickName
            }"
            v-for="(item, index) in $data.messageForm.list"
            :key="index"
            @click="selectChatUser(item)"
          >
            <el-badge
              :value="item.unreadMessageCount"
              :hidden="!item.unreadMessageCount"
              :max="99"
              class="user_badge_box"
            >
              <el-image class="user_img" :src="item.fromAvatar">
                <template #error>
                  <div class="user_img errImg_box"></div>
                </template>
              </el-image>
            </el-badge>
            <div class="user_content">
              <div class="content_top">
                <!-- <el-tooltip
                  class="box-item"
                  effect="dark"
                  placement="top"
                  :content="item.fromNickName || '匿名客户'"
                >
                  <div class="user_name line-hidden1">{{ item.fromNickName || '匿名客户' }}</div>
                </el-tooltip> -->
                <div class="user_name line-hidden1">{{ item.fromNickName || '匿名客户' }}</div>
                <div class="user_time">
                  {{ item.lastMsgDetail.actTime ? transDate(item.lastMsgDetail.actTime) : '--' }}
                </div>
              </div>
              <div class="content_right" v-if="item.lastMsgDetail && item.lastMsgDetail.msgContent">
                <div
                  class="line-hidden1 msg_content"
                  v-html="item.lastMsgDetail.msgContent.content"
                ></div>
              </div>
            </div>
          </div>
          <!-- 提示文案 -->
          <div class="one_mark" v-if="$data.messageForm.list.length >= 10">
            {{ $data.messageForm.hasNext ? '加载中...' : '已经到底啦' }}
          </div>
        </div>
        <!-- 没数据 -->
        <div
          class="no_list"
          v-else-if="!$data.messageForm.loading && $data.messageForm.list.length == 0"
        >
          <img src="@/assets/images/content_center/no_data.png" />
          <div>
            <p>暂无会话</p>
            <p v-if="!$data.accountOpenId">请先选择矩阵号</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { PLATFORM } from '@/utils/dictionary/company.js'
import { transElIconName, debounce, throttle } from '@/utils/tools.js'
import { transDate, createNewChat, handleMessageVo } from '../js/tools'
// import { MESSAGE_TYPE } from '@/utils/dictionary/session-management'
import { pullXhsMessage, getMessageList, clearUnread } from '@/api/scrm/session_management'
// import { getMessageList, getTabsUnread } from '@/api/scrm/session_management'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import enterpriseAccountList from '@/views/scrm/interactive_messages/message_policy/enterprise_account_list.vue'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const $store = useStore()
const $router = useRouter()
const props = defineProps({
  newMessage: Object,
  newMessageInList: Boolean // 是否需要显示刷新按钮
})
const route = useRoute()
const { newMessage } = toRefs(props)
const emits = defineEmits(['changeTab', 'updateList', 'updatePlatform', 'getmatrixNumberList'])
const enterpriseAccountListRef = ref(null)
const $data = reactive({
  chooseTabType: 3,
  tabs: [
    {
      label: '全部',
      value: 1
    },
    {
      label: '私信',
      value: 3
    },
    {
      label: '评论',
      value: 2
    },
    {
      label: '关注',
      value: 4
    }
  ],
  currentAccountInfo: {},
  accountOpenId: null, // 企业号openId
  dyUId: null, // 矩阵号可能存在的ID
  searchNickName: '', // 搜索人
  messageForm: {
    index: 1,
    pageSize: 20,
    loading: false,
    hasNext: true,
    list: []
  },
  selectedChatUser: {},
  isFilter: false,
  listOfTabList: [
    {
      value: -1,
      label: '全部'
    },
    {
      value: 1,
      label: '未回复'
    },
    {
      value: 2,
      label: '已留资'
    }
  ],
  chooseListOfTab: -1
})

// 是否打开
function clearNoRead() {
  ElMessageBox.confirm('确认要清除所有未读消息吗？（小程序上也会同步清除）', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(res => {
      clearUnread({
        toOpenId: $data.messageForm.list[0].toOpenId,
        toUid: $data.messageForm.list[0].toUid
      }).then(res => {
        if (res?.code === 0) {
          clearUnreadMessageCount()
          ElMessage.success('清除未读成功')
        }
      })
    })
    .catch(() => {}) // 添加错误捕获
}

function clearUnreadMessageCount() {
  $data.messageForm.list.forEach(item => {
    if (item.unreadMessageCount > 0) {
      console.log('清理成功')
      $store.commit('chat/setUnreadMessageChange', {
        openId: item.toOpenId || item.toUserId,
        setNum: 0
      })
      item.unreadMessageCount = 0
    }
  })
}

// 搜索
const onChangeNickName = debounce(function (value) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  $data.searchNickName = value.replace(reg, '')
  resetList()
}, 500)
// 查询列表
function getList(callback) {
  if (!$data.accountOpenId) {
    $data.messageForm.loading = false
    return
  }
  let enterConversationUserId = ''
  // 页表在第一页  从其他页面跳转并携带了route.query.fromUserId参数
  if ($data.messageForm.index === 1 && route.query.fromUserId) {
    enterConversationUserId = route.query.fromUserId
  }
  const toUserIds = []
  if ($data.accountOpenId) {
    toUserIds.push($data.accountOpenId)
  }
  // if ($data.dyWebUid) {
  //   toUserIds.push($data.dyWebUid)
  // }
  console.log('$data.currentAccountInfo.platform', $data.currentAccountInfo.platform)
  const param = {
    pageNo: $data.messageForm.index,
    pageSize: $data.messageForm.pageSize,
    flowType: $data.chooseTabType,
    toUserIds: toUserIds,
    fromNickname: $data.searchNickName || '',
    enterConversationUserId: enterConversationUserId
  }
  if ($store.state.chat.isIntended && $store.state.chat.currentChatUser.openId) {
    param.fromOpenId = $store.state.chat.currentChatUser.openId
  }
  // 列表的全部/未回复/已留资筛选
  if ($data.chooseListOfTab && $data.chooseListOfTab !== -1) {
    param.filterCondition = $data.chooseListOfTab
  }
  // 列表是否过滤无效私信
  param.filterInvalidIm = $data.isFilter
  getMessageList(param)
    .then(res => {
      if (
        res.data.records &&
        res.data.records.length > 0 &&
        res.data.records[0].toNickName === $data.currentAccountInfo.dyNickname
      ) {
        const _list = res.data.records || []
        _list.forEach(e => {
          if (e.lastMsgDetail && e.lastMsgDetail.msgContent) {
            handleMessageVo(e.lastMsgDetail, 20, $data.currentAccountInfo.platform)
          }
          if ($store.state.chat.isIntended) {
            $store.commit('chat/needIntendedChat', false)
            $data.selectedChatUser = e
          }
        })
        // 如果选中的参数存在的话，就显示列表返回的第一项
        if (enterConversationUserId) {
          selectChatUser(_list[0])
        }
        $data.messageForm.list = $data.messageForm.list.concat(_list)
        $data.messageForm.hasNext = res.data.hasNext
        emits('updateList', $data.messageForm.list)
        callback && callback()
      }
    })
    .finally(() => {
      $data.messageForm.loading = false
    })
}
// 上拉加载列表
function loadNextList() {
  if ($data.messageForm.hasNext) {
    $data.messageForm.index++
    getList()
  }
}
// 重置列表
function resetList() {
  emits('changeTab', $data.chooseTabType)
  $data.messageForm.list = []
  $data.messageForm.index = 1
  $data.messageForm.loading = true
  // _getTabsUnread()
  getList()
}

// 创建会话
function selectChatUser(item) {
  // 携带参数的话直接放行
  if (
    !route.query.fromUserId &&
    $data.selectedChatUser.fromUserId === item.fromUserId &&
    $data.selectedChatUser.toNickName === item.toNickName
  ) {
    return
  }
  $data.selectedChatUser = item
  $store.commit('chat/setUnreadMessageChange', {
    openId: item.toOpenId || item.toUserId,
    changeNum: item.unreadMessageCount * -1
  })
  const fromUser = {
    openId: item.fromOpenId || item.fromUserId,
    avatar: item.fromAvatar,
    name: item.fromNickName,
    source: item.source, // 多存储一个来源
    clientUserId: item.clientUserId // scrm 多存储一个用于请求互动记录
  }
  const toUser = {
    openId: item.toOpenId || item.toUserId,
    avatar: item.toAvatar,
    name: item.toNickName,
    isOpenStrategyIm: $data.currentAccountInfo.isOpenStrategyIm || 0
  }
  const isNeedRefresh = item.unreadMessageCount
  createNewChat(fromUser, toUser, null, () => {
    if (isNeedRefresh) {
      // _getTabsUnread()
    }
  })
  item.unreadMessageCount = 0
  console.log('创建会话成功', item)
  // // 调用子组件方法更改等级
  // nextTick(() => {
  //   enterpriseAccountListRef.value.toInPage('S', 2000, null)
  // })
}

// 选择企业号
function onChangeAccount(data) {
  console.log('xunzeqiyehao', data)
  if (data.platform) {
    emits('updatePlatform', data.platform)
    if (data.platform === 3) {
      setXHSTimer(data)
    } else {
      clearXHSTimer()
    }
  } else {
    clearXHSTimer()
  }
  $data.selectedChatUser = {}
  $data.currentAccountInfo = data
  $data.accountOpenId = data.dyOpenId
  $data.dyWebUid = data.dyWebUid // 如果存在这个字段在请求聊天列表的时候需要传入
  $data.searchNickName = '' // 清空矩阵号的搜索项
  $data.chooseListOfTab = -1
  $data.isFilter = false
  resetList()
  // 如果是小红书平台就创建定时器
}
// 小红书平台创建定时器
const timerOfXhs = ref(null)
function setXHSTimer(data) {
  const openId = data.dyOpenId
  const chatUserId = '' // 如果传了数据 就只能获取当前窗口里的消息
  // 只有小红书才执行该定时器
  if (data.platform !== 3) {
    clearXHSTimer()
    return
  }
  clearXHSTimer()
  pullXhsMessage({
    openId,
    chatUserId
  })
  timerOfXhs.value = setInterval(() => {
    pullXhsMessage({
      openId,
      chatUserId
    })
  }, 5000)
}
function clearXHSTimer() {
  timerOfXhs.value && clearInterval(timerOfXhs.value)
  timerOfXhs.value = null
}
// 组件销毁的时候 也要清空定时器
onBeforeUnmount(() => {
  clearXHSTimer()
  document.removeEventListener('visibilitychange', pageShowFun)
})
function pageShowFun() {
  const pageHidden = document.hidden
  if (pageHidden) {
    clearXHSTimer()
  } else {
    $data.currentAccountInfo && setXHSTimer($data.currentAccountInfo)
  }
}
function toPolicy() {
  $router.push({
    path: '/scrm/message_policy',
    query: {
      // openId: $data.accountOpenId,
      dyNickname: $data.currentAccountInfo.dyNickname
    }
  })
}

// 传递矩阵号的判断
function getMatrixNumberList(list) {
  emits('getmatrixNumberList', list)
}

// 传递是否显示右上角横幅的判断
function changeNewMessageInList(val) {
  emits('changeNewMessageInList', val)
}

// 获取最新消息
watch(
  () => newMessage.value,
  newVal => {
    if (newVal && newVal.data && !newVal.isEventMessage) {
      const info = JSON.parse(JSON.stringify(newVal.data))
      console.log('消息列表新消息', newVal)
      const isAlready = $data.messageForm.list.filter(
        e => e.fromUserId === info[0].fromUserId && e.toUserId === info[0].toUserId
      )
      if (isAlready && isAlready.length > 0) {
        // 如果这个消息存在消息列表中才需要做处理
        for (const i in $data.messageForm.list) {
          const item = $data.messageForm.list[i]
          if (item.fromUserId === info[0].fromUserId && item.toUserId === info[0].toUserId) {
            $data.messageForm.list.splice(i, 1)
            // 对这些数据进行处理
            isAlready[0].lastMsgDetail.msgContent.content = newVal.data.lastMsgDetail.content
            isAlready[0].lastMsgDetail.actTime = newVal.data.lastMsgDetail.msgTime
            // 不是当前页面的才＋1
            if ($data.selectedChatUser.fromUserId !== info[0].fromUserId) {
              isAlready[0].unreadMessageCount += 1
            }
          }
        }
      }
      $data.messageForm.list.unshift(isAlready[0])
    }
  },
  { deep: true, immediate: true }
)

// 获取聊天窗自己发的最新消息
watch(
  () => $store.state.chat.sendMessageInfo,
  newVal => {
    if (newVal && newVal.fromUserId) {
      $data.messageForm.list.forEach(item => {
        item.lastMsgTime = newVal.actTime
        if (item.fromUserId === newVal.fromUserId) {
          item.lastMsgDetail = newVal
        }
      })
    }
  },
  { deep: true, immediate: true }
)

watch(
  () => $data.tabs,
  newVal => {
    const _count = newVal.filter(e => e.unreadCount).length
    if (_count === 1) {
      $data.tabs[0].unreadCount = 0
    }
  },
  { deep: true }
)

onMounted(() => {
  if (!$store.state.chat.currentChatMineInfo.openId) {
    resetList()
  }
  document.addEventListener('visibilitychange', pageShowFun)
})

// 过滤无效私信的开关
function changeFilter(e) {
  console.log(e, $data.isFilter)
  resetList()
}
// 选择列表筛选项
const changeListOfTab = throttle(e => {
  if ($data.messageForm.loading) {
    return
  }
  if (e === $data.chooseListOfTab) {
    return
  }
  $data.chooseListOfTab = e
  resetList()
}, 500)
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.top_title_area {
  display: flex;
  padding: 16px 16px 0px 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .top_title_area_left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .top_title_area_right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
    line-height: 18px;
  }
  .top_title {
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 600;
    color: #303133;
    line-height: 22px;
  }

  .clear_area {
    width: 32px;
    height: 24px;
    border-radius: 16px;
    cursor: pointer;
    line-height: 24px;
    text-align: center;
    margin-left: 8px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #606266;
    background: #f2f3f5;

    img {
      width: 16px;
      height: 16px;
      vertical-align: -3px;
    }
  }
}

.left_page {
  width: 100%;
  height: 100%;
  display: flex;
  .tabs_wrapper {
    flex-shrink: 0;
    width: 320px;
    margin-left: 15px;
    background: #fff;
    border-radius: 4px;
    .left_top {
      width: 100%;
      :deep(.el-tabs__item) {
        padding: 16px 25px;
      }
      :deep(.el-tabs__header) {
        margin: 0;
      }
      :deep(.el-tabs--bottom .el-tabs__item.is-bottom:last-child),
      :deep(.el-tabs--bottom .el-tabs__item.is-top:last-child),
      :deep(.el-tabs--top .el-tabs__item.is-bottom:last-child),
      :deep(.el-tabs--top .el-tabs__item.is-top:last-child) {
        padding-right: 24px;
      }
      :deep(.el-tabs--bottom .el-tabs__item.is-bottom:nth-child(2)),
      :deep(.el-tabs--bottom .el-tabs__item.is-top:nth-child(2)),
      :deep(.el-tabs--top .el-tabs__item.is-bottom:nth-child(2)),
      :deep(.el-tabs--top .el-tabs__item.is-top:nth-child(2)) {
        padding-left: 24px;
      }
      :deep(.el-tabs__nav-wrap::after) {
        border-color: #dcdee0;
      }
      .account_info {
        display: flex;
        align-items: center;
        padding: 12px 16px 10px 16px;
        .avatar {
          position: relative;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          margin-right: 12px;
          border-radius: 8px;
        }
        .warn_icon {
          position: absolute;
          top: -7px;
          right: 7px;
          width: 14px;
          height: 14px;
          background-image: url('https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/7c3629b869264b12a8118bc0c375227c_1687919655478.png');
          background-size: contain;
        }
        .platform_icon_box {
          position: absolute;
          bottom: 0px;
          right: 8px;
        }
        .name {
          @include mult_line(1);
          flex: 1;
          font-size: 16px;
          font-weight: bold;
          height: 40px;
          line-height: 40px;
        }
        .action_btn {
          border-radius: 4px;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          // width: 94px;
          // height: 28px;
          // line-height: 28px;
          color: #606266;
          transition: all 0.3s;
          padding: 4px 8px;
          &:hover {
            background: #f2f3f5;
          }
          .chat_icon {
            width: 16px;
            height: 16px;
          }
        }
      }
      .table_form {
        padding: 0px 24px 12px 16px;
      }
    }
    .tab_box {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      padding-left: 16px;
      padding-bottom: 12px;
      .one_tab {
        cursor: pointer;
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
        line-height: 18px;
        padding: 3px 6px;
        border-radius: 4px;
        background: #f2f3f5;
        color: #606266;
      }
      .one_tab + .one_tab {
        margin-left: 12px;
      }
      .one_tab:hover {
        background: #e9edfb;
      }
      .choose_tab {
        background: #364fcd !important;
        color: #ffffff;
      }
    }
    .left_bottom {
      width: 100%;
      height: calc(100% - 198px);
      // padding: 12px;
      .have_list {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 0 12px;
        .one_mark {
          text-align: center;
          font-size: 14px;
          font-weight: 400;
          color: #8f939a;
          line-height: 20px;
        }
        .one_item {
          cursor: pointer;
          border-radius: 4px;
          padding: 12px 12px 12px 12px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          &.active {
            background: #e9edfb;
          }
          &:hover {
            background: #f6f7f8;
          }
          .user_badge_box {
            width: 48px;
            height: 48px;
            margin-right: 12px;
            :deep(.el-badge__content.is-fixed) {
              right: 20px;
              top: 4px;
            }
            :deep(.el-badge__content--danger) {
              background-color: #d40000;
              border: 1px solid #fff;
            }
          }
          .user_img {
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 50%;
          }
          .user_content {
            width: calc(100% - 60px);
            .content_top {
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 6px;
              .user_name {
                width: 60%;
                //padding-top: 4px;
                font-size: 16px;
                font-weight: 500;
                color: #303133;
                line-height: 22px;
              }
              .user_time {
                font-size: 12px;
                font-weight: 400;
                color: #c0c4cc;
                line-height: 18px;
              }
            }
            .content_right {
              width: 80%;
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;
              font-size: 14px;
              font-weight: 400;
              color: #8f939a;
              line-height: 20px;
              img {
                width: 20px !important;
                height: 20px !important;
                object-fit: cover;
                margin-right: 4px;
              }
            }
          }
        }
        .one_item + .one_item {
          margin-top: 2px;
        }
        &::-webkit-scrollbar {
          display: none;
        }
      }

      .no_list {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        font-weight: 400;
        color: #8f939a;
        line-height: 20px;
        text-align: center;
        img {
          width: 72px;
          height: 52px;
          margin-bottom: 8px;
        }
      }
    }
  }
}

.msg_content {
  display: flex;
  align-items: center;
}
:deep .msg_content {
  > img {
    width: 20px !important;
  }
}
</style>

<style lang="scss">
.el-badge {
  .el-badge__content--danger {
    background-color: #d40000 !important;
  }
}
</style>

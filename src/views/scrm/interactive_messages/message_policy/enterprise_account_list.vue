<template>
  <div class="enterprise_section">
    <el-tooltip placement="top" :style="{ 'margin-left': '4px' }">
      <template #content>
        <p>仅支持抖音认证企业号及其员工号、小红书专业号</p>
      </template>
      <div class="top_title_left">
        矩阵号列表
        <img
          src="@/assets/images/operate/tip_line.png"
          style="width: 16px; height: 16px; margin-left: 6px"
        />
      </div>
    </el-tooltip>

    <div class="small_section" v-if="collapse">
      <div class="search">
        <el-input
          v-model="$data.nickName"
          ref="searchInputRef"
          placeholder="搜索矩阵号"
          :prefix-icon="transElIconName('Search')"
          @change="onShowLargeList"
        />
      </div>
      <div v-if="newMessageInList" @click="refreshList" class="top_new_tip">
        您有新的消息，点击刷新
      </div>
      <div class="platform_section">
        <div
          v-for="(item, index) in $data.platformList"
          :key="index"
          @click="changePlatformFun(item.value)"
          :class="{ one_platform: true, choose_platform: $data.choosePlatform === item.value }"
          :style="$data.loading ? 'cursor: no-drop' : ''"
        >
          {{ item.label }}
        </div>
      </div>
      <div
        class="account_list_partent"
        element-loading-text="加载中..."
        v-loading="$data.loading && $data.listSetting.current == 1"
      >
        <template v-if="$data.list && $data.list.length > 0">
          <div
            class="account_list"
            style="height: 100%"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="onMessageScroll"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="!$data.listSetting.hasNext"
          >
            <div class="account_item2_paretnt" v-for="(item, index) in $data.list" :key="index">
              <div class="account_item account_item2" @click="selectItem(item, index, 'listItem')">
                <!-- 右上角的信息图标-->
                <div class="active" v-if="item.dyOpenId === $data.activeIndex"></div>
                <el-badge
                  :value="item.unreadMessageCount"
                  :hidden="!(item.unreadMessageCount && item.unreadMessageCount > 0)"
                  class="item"
                  v-if="type === 'message'"
                >
                  <img class="avatar" :src="item.dyHeadUrl" />
                </el-badge>
                <img v-else class="avatar" :src="item.dyHeadUrl" />
                <div class="account_item_text">
                  <div>
                    <div>{{ item.dyNickname }}</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 提示文案 -->
            <!-- <div class="one_mark" v-if="$data.list.length > 15">
            {{ $data.listSetting.hasNext ? '加载中...' : '已经到底啦' }}
          </div> -->
            <div class="loading_library">
              {{
                $data.loading
                  ? $data.listSetting.current === 1
                    ? ''
                    : '加载中...'
                  : !$data.listSetting.hasNext
                  ? $data.list && $data.list.length > 15
                    ? '已经到底啦'
                    : ''
                  : '加载中...'
              }}
            </div>
          </div>
        </template>
        <div
          class="xm_noneData"
          style="height: 100%"
          v-if="!$data.loading && !($data.list && $data.list.length > 0)"
        >
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无矩阵号
        </div>
      </div>
    </div>
    <div
      v-if="!collapse || $data.showLarge"
      class="large_section"
      :class="{
        large_collapse: collapse,
        large_collapse_allHiehgt: isHideTopMenu
      }"
      v-click-outside="onClickOutside"
    >
      <div class="account_list" v-loading="$data.loading">
        <div
          class="account_item"
          v-for="(item, index) in $data.filterList"
          :key="index"
          :class="{ active: item.dyOpenId === $data.activeIndex }"
          @click="selectItem(item, index, 'searchItem', 'searchAfter')"
        >
          <el-badge
            :value="item.unreadMessageCount"
            :hidden="!item.unreadMessageCount"
            class="item"
            v-if="type === 'message'"
          >
            <img class="avatar" :src="item.dyHeadUrl" />
          </el-badge>
          <img v-else class="avatar" :src="item.dyHeadUrl" />
          <div class="name">{{ item.dyNickname }}</div>
          <div class="desc" v-if="type === 'policy'">
            <span style="color: #364fcd; margin-right: -2px">{{ item.openStrategyCount }}</span>
            种策略已开启
          </div>
        </div>
        <!-- 没数据 -->
        <div class="no_list" v-if="!($data.filterList && $data.filterList.length)">
          <img src="@/assets/images/content_center/no_data.png" />
          <div>
            <p>暂无矩阵号</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { transElIconName, throttle } from '@/utils/tools.js'
import { getAccountListV1, getAccountSearchList } from '@/api/scrm/session_management'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { ClickOutside } from 'element-plus'

const props = defineProps({
  // 类型 policy 策略模式，message 消息模式
  type: {
    type: String,
    default: 'policy'
  },
  collapse: Boolean,
  newMessageInList: Boolean // 是否需要显示刷新按钮
})
const { type } = toRefs(props)
const store = useStore()
const route = useRoute()
const emits = defineEmits(['change', 'changeNewMessageInList', 'getmatrixNumberList'])

const isHideTopMenu = store.getters.isHideTopMenu

const $data = reactive({
  platformList: [
    {
      value: 1,
      label: '抖音'
    },
    {
      value: 3,
      label: '小红书'
    }
  ],
  choosePlatform: 1,
  isSearch: false, // 是否执行了搜索矩阵号
  list: [],
  loading: false,
  nickName: '',
  activeIndex: -1,
  showLarge: false,
  filterList: [], //  过滤后的列表
  listSetting: {
    current: 1, // 当前页面
    hasNext: false, // 是否存在下一页
    hasPrevious: false // 是否存在上一页
  },
  userChooseList: [], // 用户选择列表
  userDyOpenIdList: [], // 用户选择了列表-传递后端过滤
  haveNewInformation: false, // 是否存在新的消息
  dyWebUid: null // 仅仅用来轮巡
})

// 选择矩阵号
const selectItem = throttle(function selectItem(item, index, type, searchAfter) {
  if ($data.activeIndex === index) return
  if ($data.activeIndex !== -1) {
    store.commit('chat/initChatInfo')
  }
  if (!item) return
  $data.activeIndex = item.dyOpenId
  store.commit('chat/setPolicyOpenId', item.dyOpenId)
  // 存储setDyWebUid 目前仅用做匹配加入的新消息
  store.commit('chat/setDyWebUid', item.dyWebUid)
  emits('change', item)
  if (type === 'searchItem') {
    const itemChoosed = $data.userDyOpenIdList.indexOf(item.dyOpenId)
    // 被选中的不存在缓存列表中 那就塞到前端存储列表中
    // 被选中的存在缓存列表中 就调换顺序
    if (itemChoosed === -1) {
      // 当用户点击后,在当前页面做用户筛选到的值的暂存
      $data.userChooseList.unshift(item)
      $data.userDyOpenIdList.unshift(item.dyOpenId)
    } else {
      let obj = {}
      $data.userChooseList.forEach((itemIn, indexIn) => {
        if (itemIn.dyOpenId === item.dyOpenId) {
          obj = itemIn
          $data.userChooseList.splice(indexIn, 1)
        }
      })
      $data.userChooseList.unshift(obj)
    }
    // 重新渲染需要展示的列表
    $data.list = $data.userChooseList
    $data.listSetting.current = 1
    if (searchAfter && searchAfter === 'searchAfter') {
      $data.isSearch = true
    }
    getList()
    // 关闭窗口，清空输入的查询信息
    $data.showLarge = false
    $data.nickName = ''
  }
  // 切换了矩阵号的话需要对轮巡的登记做降级处理，降级为A级
  console.log('item.dyWebUid', item.dyWebUid)
  $data.dyWebUid = item.dyWebUid
  toInPage('A', 10000, item.dyWebUid)
}, 600)

// 获取矩阵号列表
function getList() {
  $data.loading = true
  let enterConversationUserId = ''
  // 页表在第一页   用户没有手动选择  从其他页面跳转并携带了route.query.toUserId参数
  // if (
  //   $data.listSetting.current === 1 &&
  //   $data.userDyOpenIdList.length === 0 &&
  //   route.query.toUserId
  // ) {
  enterConversationUserId = route.query.toUserId || ''
  // }
  getAccountListV1({
    platform: $data.choosePlatform || '',
    // accountType: 1,   // 传1表示企业号   在scrm五期中删除不做传参
    isStatOpenStrategyCnt: 1,
    isStatUnReadMsgCnt: 1,
    pageNo: $data.listSetting.current,
    pageSize: 100,
    enterConversationUserId: enterConversationUserId,
    notInUserIds: $data.userDyOpenIdList // 用户选择了的列表就要排除在外
  })
    .then(res => {
      let list = []
      if ($data.listSetting.current === 1 && res.data.extra && res.data.extra.length > 0) {
        //  因为搜索矩阵号后，会把搜过的自行存起来，所以查询列表里是否存在该用户
        let has = false
        $data.list.forEach(x => {
          if (x.id === res.data.extra[0].id) {
            has = true
          }
        })
        if (!has) {
          list = list.concat(res.data.extra)
        }
      }
      list = list.concat(res.data.records)
      $data.list = $data.list.concat(list)
      $data.listSetting.current = res.data.current
      $data.listSetting.hasNext = res.data.hasNext
      $data.listSetting.hasPrevious = res.data.hasPrevious
      emits('getmatrixNumberList', $data.list)
      if ($data.activeIndex === -1) {
        // 如果没有选中状态的时候默认选中第一个
        selectItem(list[0], 0, 'listItem')
      }
    })
    .finally(() => {
      $data.loading = false
    })
}

const searchInputRef = ref(null)
function onShowLargeList() {
  // 搜索矩阵号信息
  setTimeout(() => {
    getFilterListList()
  }, 200)
}

// 过滤后的矩阵号列表(做新弹窗弹出)
function getFilterListList() {
  // 如果不输入文本就直接关闭
  if ($data.nickName === '') {
    $data.showLarge = false
    return
  }
  getAccountSearchList({
    platform: $data.choosePlatform || '',
    accountType: 1,
    isStatOpenStrategyCnt: 1,
    isStatUnReadMsgCnt: 1,
    nickName: $data.nickName
  })
    .then(res => {
      $data.showLarge = true
      $data.filterList = res.data
    })
    .finally(() => {})
}

function onClickOutside() {
  $data.showLarge = false
  $data.nickName = ''
}

// 滚动加载更多的数据
function onMessageScroll() {
  if ($data.listSetting.hasNext) {
    $data.listSetting.current++
    getList()
  }
}

function updateList() {
  getList()
}

// 点击了手动刷新的按钮 stu=true 清空消息列表 通过接口获取成功后取第一个矩阵号
function refreshList(stu) {
  // 刷新矩阵号列表和当前的矩阵号聊天内容列表
  let choosedInfo = null
  // 记住当前状态
  if ($data.activeIndex) {
    choosedInfo = $data.list.filter(item => item.dyOpenId === $data.activeIndex)
  }
  $data.list = []
  $data.listSetting.current = 1
  $data.listSetting.hasNext = false
  $data.listSetting.hasPrevious = false
  $data.userChooseList = [] // 清空被选中的东西
  $data.userDyOpenIdList = [] // 清空被选中的东西
  getList()
  if (!stu) {
    selectItem(choosedInfo[0], -1, 'listItem')
  }
  emits('changeNewMessageInList', false)
}

const timer = ref(null)
function toInPage(val, times, ID) {
  // 进入页面的轮巡，在会话聊天列表传A轮巡,时长为10秒
  // 打开聊天页面的时候传s轮巡,间隔时长为2秒
  console.log('进入页面的轮巡', ID, $data.dyWebUid)
  // SCRM十期：暂时先隐藏
  // if (!ID || !$data.dyWebUid) return
  // changeTime({ changePullGrade: val, toUserId: ID || $data.dyWebUid })
  // clearInterval(timer.value)
  // timer.value = null
  // timer.value = setInterval(() => {
  //   changeTime({ changePullGrade: val, toUserId: ID || $data.dyWebUid })
  // }, times)
}

// 未读消息状态
watch(
  () => store.state.chat.unreadMessageChange,
  val => {
    if (type.value === 'message') {
      $data.list.forEach((item, index) => {
        if (item.dyOpenId === val.openId || item.dyWebUid === val.openId) {
          if (val.changeNum) {
            item.unreadMessageCount += val.changeNum
            if (val.changeNum > 0) {
              $data.list.unshift($data.list.splice(index, 1)[0])
            }
            // data.unshift(data.splice(index , 1)[0])
          } else if (val.setNum || val.setNum === 0) {
            item.unreadMessageCount = val.setNum
          }
        }
      })
    }
  },
  {
    deep: true
  }
)

defineExpose({
  updateList,
  toInPage
})

onBeforeMount(() => {
  getList()
})
onBeforeUnmount(() => {
  // 离开时关闭轮询
  clearInterval(timer.value)
})

// 切换平台
const changePlatformFun = throttle(function (e) {
  if ($data.loading) return
  $data.choosePlatform = e
  $data.activeIndex = -1
  refreshList(true)
  store.commit('chat/initChatInfo')
})
</script>

<script>
export default {
  directives: { ClickOutside }
}
</script>

<style lang="scss" scoped>
.top_title_left {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 600;
  color: #303133;
  line-height: 22px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.enterprise_section {
  position: relative;
  flex-shrink: 0;
  height: 100%;
  background: #ffffff;
  width: 184px;
  padding: 16px 16px 0;
  border-radius: 4px;

  .small_section {
    position: relative;
    height: calc(100% - 34px);

    ::-webkit-scrollbar {
      display: none;
    }

    .search {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      border-radius: 4px;

      &:hover {
        //background-color: #e9edfb;
      }
    }

    .account_list {
      //position: absolute;
      //top: 32px;
      //bottom: 0;
      padding-left: 4px;
      width: 100%;
      height: calc(100% - 72px);
      overflow-y: scroll;

      .account_item {
        position: relative;
        cursor: pointer;
        width: 100%;
        margin-top: 20px;
        display: inline-block;

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 4px;
        }

        .active {
          display: inline-block;
          width: 100%;
          height: 44px;
          position: absolute;
          top: -2px;
          left: -2px;
          z-index: 0;
          background: #e9edfb;
          border-radius: 4px;
          border: 1px solid rgba(54, 79, 205, 0.6);
        }

        .account_item_text {
          position: absolute;
          display: inline-block;
          width: 90px;
          height: 36px;
          margin: 2px 8px;
          font-size: 12px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #303133;
          line-height: 18px;

          > div {
            display: flex;
            width: 90px;
            height: 36px;
            align-items: center;
            vertical-align: middle;

            > div {
              overflow: hidden; // 溢出隐藏
              text-overflow: ellipsis; // 溢出用省略号显示
              display: -webkit-box; // 作为弹性伸缩盒子模型显示。
              -webkit-box-orient: vertical; // 设置伸缩盒子的子元素排列方式：从上到下垂直排列
              -webkit-line-clamp: 2; // 显示的行数
            }
          }
        }
      }

      .one_mark {
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        color: #8f939a;
        line-height: 20px;
        margin-top: 10px;
      }
      .loading_library {
        color: #8f939a;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        margin-top: 15px;
        padding-bottom: 15px;
        img {
          height: 25px;
          margin-right: 4px;
        }
      }
    }
  }

  .large_section {
    width: 184px;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: #fff;
    overflow: hidden;

    &.large_collapse {
      position: absolute;
      top: 90px;
      left: 0px;
      height: auto;
      //max-height: calc(100vh - 192px);
      max-height: calc(100vh - 207px);
      box-shadow: 0px 2px 8px 0px rgba(200, 201, 204, 0.5);
      z-index: 4;

      .account_list {
        max-height: calc(100vh - 320px);
      }
    }
    &.large_collapse_allHiehgt {
      max-height: calc(100vh - 147px) !important;
      .account_list {
        max-height: calc(100vh - 220px) !important;
      }
    }
    .account_list {
      height: calc(100% - 32px);
      overflow-y: auto;
      margin-top: 10px;

      .account_item {
        cursor: pointer;
        width: 100%;
        margin-bottom: 4px;
        padding: 12px 0;
        border-radius: 2px;
        transition: all 0.3s;
        box-sizing: border-box;
        text-align: center;

        &.active {
          //background: #e9edfb;
        }

        &:hover {
          //background: #f6f7f8;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 8px;
        }

        .name {
          @include mult_line(1);
          line-height: 20px;
          margin-top: 8px;
          font-weight: bold;
        }

        .desc {
          line-height: 20px;
          margin-top: 4px;
          color: #606266;
        }
      }
    }
  }

  .no_list {
    width: 100%;
    height: 100%;
    display: flex;
    //margin-top: 30vh;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    color: #8f939a;
    line-height: 20px;

    img {
      width: 72px;
      height: 52px;
      margin-bottom: 8px;
    }
  }
}
// 新消息的文案提示
.top_new_tip {
  //width: calc(100% - 8px);
  width: 100%;
  //margin: 8px 0px;
  margin-top: 8px;
  text-align: center;
  height: 22px;
  background: #e9edfb;
  border-radius: 2px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #364fcd;
  line-height: 18px;
  cursor: pointer;
}
</style>

<style lang="scss">
.account_item {
  .el-badge {
    .el-badge__content--danger {
      background-color: #d40000 !important;
    }
  }

  .el-badge__content.is-fixed {
    z-index: 2;
  }

  .el-badge__content.is-fixed {
    position: absolute;
    top: 0;
    right: 15px;
    transform: translateY(-30%) translateX(100%);
  }
}
.account_list_partent {
  width: 100%;
  height: calc(100% - 80px);
}
.platform_section {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 12px 0 6px;
  .one_platform {
    cursor: pointer;
    padding: 3px 6px;
    background: #f2f3f5;
    border-radius: 4px;
    font-weight: 400;
    font-size: 12px;
    color: #606266;
    line-height: 18px;
  }
  .choose_platform {
    color: #ffffff;
    background: #364fcd;
  }
  .one_platform + .one_platform {
    margin-left: 12px;
  }
}
.account_item2_paretnt {
  margin-top: 12px !important;
  .account_item2 {
    margin-top: 6px !important;
  }
}
.account_item2_paretnt:nth-child(1) {
  margin-top: 0 !important;
}
</style>

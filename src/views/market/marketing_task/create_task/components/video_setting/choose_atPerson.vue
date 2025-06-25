<template>
  <div>
    <el-popover
      @click="showOrHidePopver"
      :visible="visible"
      placement="bottom"
      popper-class="dept_search_popper"
      trigger="click"
      ref="popoverRef"
    >
      <template #reference>
        <div
          @click="setInputFocus"
          v-click-outside="onClickOutside"
          class="input_box"
          :style="props.disabled ? 'background:#f5f7fa' : visible ? 'border-color:#364fcd' : ''"
        >
          <!-- 创建的@的人列表tag -->

          <div class="input_choose_box" v-if="atPersonList && atPersonList.length > 0">
            <div class="one_choose" v-for="(item, index) in atPersonList" :key="index">
              <!-- line-hidden1 -->
              <div class="one_choose_name" :title="item.name">
                {{ item.name || '' }}
              </div>

              <el-icon
                v-if="!props.disabled"
                class="one_choose_icon"
                @click.stop="delTopicFun(item, index)"
              >
                <i-close />
              </el-icon>
            </div>
          </div>

          <!-- 输入框 获取焦点的时候就打开弹出框  -->
          <el-input
            ref="inputRef"
            :disabled="props.disabled"
            class="input_input"
            :placeholder="atPersonList && atPersonList.length > 0 ? '' : props.placeholder"
            type="text"
            v-model.trim="inputValue"
            @keyup.enter="inputEnterFun"
            @input="inputFun"
            @blur="inputBlurFun"
            @focus="showPopver"
          ></el-input>
        </div>
      </template>
      <div
        class=""
        :style="{
          width: `${
            props.width
              ? props.width
              : props.origin === 'task2'
              ? '542px'
              : props.origin === 'task'
              ? '416px'
              : '360px'
          }`
        }"
        v-loading="searchLoading && searchParam.pageNumber === 1"
      >
        <div class="select_content" ref="searchRef" style="max-height: 200px">
          <template v-if="searchList && searchList.length > 0">
            <div
              class="list_box"
              :infinite-scroll-delay="500"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="searchList.length >= searchParam.total"
            >
              <div
                :class="{
                  one_list: true,
                  dis_list: atPersonList.length >= 3,
                  choose_list: atPersonList.findIndex(x => x.userId == item.userId) > -1
                }"
                @click.stop="chooseTopicFun(item, index)"
                v-for="(item, index) in searchList"
                :key="index"
              >
                <img
                  v-if="props.type != 'dy'"
                  class="user_head"
                  :src="item.image || defaultPhoto"
                  alt=""
                />
                <div
                  :style="props.type == 'dy' ? 'width:100%' : ''"
                  class="user_name"
                  v-html="isRedFun(item.name)"
                ></div>
              </div>
              <div class="xm_pullUpToLoadMore">
                <img
                  src="/public/loading.gif"
                  v-if="searchLoading && searchParam.pageNumber > 1"
                  alt=""
                />
                {{
                  searchLoading
                    ? searchParam.pageNumber === 1
                      ? ''
                      : '加载中...'
                    : searchList.length >= searchParam.total
                    ? searchList.length > 5
                      ? '已经到底了~'
                      : ''
                    : '上拉加载更多~'
                }}
              </div>
            </div>
          </template>
          <div
            class="xm_noneData"
            style="height: 100px"
            v-if="!(searchList && searchList.length > 0) && !searchLoading && visible"
          >
            无匹配结果
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script setup>
import { ElMessage, ClickOutside as vClickOutside } from 'element-plus'
import { isNotEmpty, isEmpty, throttle } from '@/utils/tools'

import { getAuthDyList, searchUser, searchDyUser, listHistory } from '@/api/market/task.js'
const props = defineProps({
  atPersonList: {
    type: Array,
    default: () => {
      return []
    }
  }, // 需要初始化的数据
  type: {
    type: String,
    default: '' // 来源类型 dy 抖音 xhs 小红书 dyPlatform 抖音全平台
  },
  origin: {
    type: String,
    default: '' // 来源
  },
  placeholder: {
    type: String,
    default: '请选择@的人，以回车键查询，最多可添加3个@的人'
  },
  disabled: {
    type: Boolean,
    default: false // 是否可以禁用
  },
  clearable: {
    type: Boolean,
    default: false // 是否可以清除筛选项
  },
  historyType: {
    type: Number,
    default: 1
  }, // 1历史数据 2 话题式任务数据
  width: String // 选项宽度
})
const defaultPhoto = ref('https://tagvv-1256030678.file.myqcloud.com/20220402eaa5p.png')

const popoverRef = ref()
const inputValue = ref() // 输入框内容

const visible = ref(false) // 是否显示弹出框
const atPersonList = ref([])
const searchLoading = ref(true) // 数据的请求Loading
const searchList = ref([]) // 搜索后的列表
const searchParam = reactive({
  pageNumber: 1,
  pageSize: 10,
  total: 0
}) // 分页查询数据
const emits = defineEmits(['update:atPersonList'])
watch(
  () => atPersonList.value,
  val => {
    emits('update:atPersonList', val)
  },
  {
    deep: true
  }
)

// 输入框输入内容-请求@的人列表
// --抖音是实时查询，小红书是回车查询
function inputFun(e) {
  // 因为小红书和抖音用户昵称都支持表情的 所以去掉正则
  // const reg =
  //   // eslint-disable-next-line no-misleading-character-class
  //   /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  // inputValue.value = inputValue.value.replace(reg, '')
  if (isEmpty(inputValue.value)) {
    resetFun()
  } else {
    if (props.type === 'dy') {
      resetFun()
    }
  }
}
// 输入框回车键-如果输入框有内容就进行创建
function inputEnterFun() {
  if (props.type !== 'dy') {
    resetFun()
  }
}
// 输入框失去焦点-如果输入框有内容就进行创建
function inputBlurFun() {
  console.log('inputBlurFun', inputValue.value)
}

const inputRef = ref()
function setInputFocus() {
  inputRef.value.focus()
}
// 创建@的人 无论是否创建，最后都需要清空输入框内容
// 1.如果输入的@的人内容已经存在了，就不进行创建了
// 2.如果输入的@的人内容在列表中已经存在了，看是否需要进行勾选
// 3.@的人最多3个
function createTopicFun(item) {
  const index = atPersonList.value.findIndex(x => x.userId === item.userId)
  if (index === -1) {
    // 判断@的人个数，超过就提示
    if (atPersonList.value.length >= 3) {
      ElMessage.warning('最多添加3个@的人')
      // inputValue.value = ''

      return
    }

    // 都满足条件就进行创建
    atPersonList.value.push(item)
    // inputValue.value = ''
  } else {
    // inputValue.value = ''
    // 如果是从记录列表选择了已选取的话题 就将他从话题列表取消
    atPersonList.value.splice(index, 1)
  }
}
// 删除已创建的@的人
function delTopicFun(item, index) {
  atPersonList.value.splice(index, 1)
  visible.value = false
  inputValue.value = ''
}
// 从记录列表选择@的人
const chooseTopicFun = throttle((item, index) => {
  createTopicFun(item)
}, 0)

// @的人列表，将搜索框内容对应的文字进行标红
function isRedFun(str) {
  if (isNotEmpty(inputValue.value)) {
    let text = ''
    str.split('').forEach(x => {
      if (inputValue.value.includes(x)) {
        text += `<span style="color:red">${x}</span>`
      } else {
        text += x
      }
    })
    return text
    // return str.replace(
    //   new RegExp(inputValue.value, 'gi'),
    //   match => `<span style="color:red">${match}</span>`
    // )
  } else {
    return str
  }
}

const searchRef = ref()
const searchTypeNum = ref(1)
// 查询历史选择@的人记录列表
function getSearchList(isLoad) {
  searchLoading.value = true
  let searchType = null
  if (isLoad) {
    searchType = searchTypeNum.value
  } else {
    searchType = isEmpty(inputValue.value)
      ? 1
      : props.type === 'dy'
      ? 3
      : props.type === 'dyPlatform'
      ? 4
      : 2 // 1 是查询历史记录 2 是查询小红书用户 3 是查询系统内的抖音用户 4 是查询抖音平台的抖音用户
    searchTypeNum.value = searchType
  }

  const personPromise =
    searchType === 3
      ? getAuthDyList({
          name: inputValue.value || '',
          platform: 1
        })
      : searchType === 1
      ? listHistory({
          historyType: props.historyType ? props.historyType : 1,
          pageNo: searchParam.pageNumber,
          pageSize: searchParam.pageSize,
          platform: ['dy', 'dyPlatform'].includes(props.type) ? 1 : 3,
          type: 2
        })
      : searchType === 4
      ? searchDyUser({
          keyword: inputValue.value || '',
          page: searchParam.pageNumber,
          pageSize: 30
        })
      : searchUser({
          keyword: inputValue.value || '',
          page: searchParam.pageNumber,
          pageSize: 30
        })
  personPromise
    .then(res => {
      if (res.code === 0) {
        let resData = []
        if (searchType === 1) {
          resData = (res.data.records || []).map(x => {
            if (x.extra) {
              const resList = JSON.parse(x.extra)
              if (props.type === 'dyPlatform') {
                return {
                  ...resList,
                  image:
                    isNotEmpty(resList.avatarThumb) && isNotEmpty(resList.avatarThumb.urlList)
                      ? resList.avatarThumb.urlList[0]
                      : '',
                  name: resList.nickname,
                  userId: resList.uid
                }
              } else {
                if (resList.openId) {
                  resList.userId = resList.openId
                }
                return resList
              }
            } else {
              return ''
            }
          })
        } else if (searchType === 3) {
          resData = (res.data || []).map(e => {
            return {
              image: e.authAccountPhoto,
              name: e.authAccountName,
              openId: e.openId,
              userId: e.openId
            }
          })
        } else if (searchType === 4) {
          resData = (res.data && res.data.userList ? res.data.userList : []).map(e => {
            return {
              ...e,
              image:
                isNotEmpty(e.avatarThumb) && isNotEmpty(e.avatarThumb.urlList)
                  ? e.avatarThumb.urlList[0]
                  : '',
              name: e.nickname,
              userId: e.uid
            }
          })
        }
        if (searchParam.pageNumber === 1) {
          // 第一次请求 ，要让滚动条回到顶部
          searchRef.value?.scrollTo(0, 0)
          if (searchType === 1 || searchType === 3 || searchType === 4) {
            searchList.value = resData
          } else {
            searchList.value = (res.data.userInfoDtos || []).map(x => {
              if (x.userBaseDto) {
                return {
                  name: x.userBaseDto.userNickname || '',
                  userId: x.userBaseDto.userId || '',
                  image: x.userBaseDto.image || ''
                }
              } else {
                return {}
              }
            })
          }
          // 抖音全平台的抖音用户查询结果没有总数total 只能通过hasmore来判断是否还有下一页
          if (searchType === 4) {
            searchParam.total = res.data.hasMore
              ? searchList.value.length + 1
              : searchList.value.length
          } else {
            searchParam.total =
              searchType === 3 || searchType === 4
                ? resData.length
                : searchType === 1
                ? res.data.total
                : (res.data.userInfoDtos || []).length
          }
        } else {
          searchList.value = searchList.value.concat(resData)
          if (searchType === 4) {
            searchParam.total = res.data.hasMore
              ? searchList.value.length + 1
              : searchList.value.length
          }
        }
      } else {
        if (searchParam.pageNumber === 1) {
          searchList.value = []
        }
      }
      searchLoading.value = false
    })
    .catch(() => {
      searchLoading.value = false
    })
}

function init() {
  if (isNotEmpty(props.atPersonList)) {
    atPersonList.value = JSON.parse(JSON.stringify(props.atPersonList))
  }
}
init()

function resetFun() {
  // searchLoading.value = true
  searchParam.pageNumber = 1
  getSearchList()
}
function loadFun() {
  //  searchLoading.value = true
  searchParam.pageNumber++
  getSearchList(true)
}

const onClickOutside = e => {
  if (visible.value && !unref(popoverRef).popperRef.contentRef.contains(e.target)) {
    visible.value = false
    clearPopver()
  }
}

// 打开弹出框
function showPopver() {
  resetFun()

  visible.value = true
  nextTick(() => {
    unref(popoverRef).popperRef?.popperInstanceRef?.update()
  })
}
// 显示或隐藏弹出框
function showOrHidePopver() {
  if (props.disabled) {
    return
  }
  if (visible.value) {
    clearPopver()
    visible.value = false
  } else {
    visible.value = true
    nextTick(() => {
      unref(popoverRef).popperRef?.popperInstanceRef?.update()
    })
  }
}
// 清空弹出框的数据
function clearPopver() {
  searchParam.pageNumber = 1
  inputValue.value = ''
  searchList.value = []
}
</script>

<style lang="scss" scoped>
@import './css/choose.scss';

.select_content {
  .list_box {
    .one_list {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      padding: 6px 20px 6px 16px;
      color: #606266;
      .user_head {
        width: 36px;
        height: 36px;
        object-fit: cover;
        margin-right: 8px;
        border-radius: 100%;
      }
      .user_name {
        width: calc(100% - 44px);
        font-size: 14px;

        line-height: 20px;
      }
    }
  }
}
.xm_pullUpToLoadMore {
  margin-top: 6px;
  padding-bottom: 10px;
}
</style>

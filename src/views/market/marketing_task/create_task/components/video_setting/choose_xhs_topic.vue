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
          <!-- 创建的话题列表tag -->

          <div class="input_choose_box" v-if="topicList && topicList.length > 0">
            <div class="one_choose" v-for="(item, index) in topicList" :key="index">
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
            :placeholder="topicList && topicList.length > 0 ? '' : props.placeholder"
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
          width: `${props.width ? props.width : props.origin === 'task2' ? '542px' : props.origin === 'task' ? '416px' : '360px'}`
        }"
        v-loading="searchLoading && searchParam.pageNumber === 1"
      >
        <div class="select_content" ref="searchRef">
          <template v-if="searchList && searchList.length > 0">
            <div
              ref="searchRef"
              class="list_box topic_list"
              :infinite-scroll-delay="500"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="searchList.length >= searchParam.total"
            >
              <div
                :class="{
                  one_list: true,
                  dis_list: topicList.length >= 3,
                  choose_list: isChoose(item)
                }"
                @click.stop="chooseTopicFun(item, index)"
                v-for="(item, index) in searchList"
                :key="index"
              >
                <div class="list_topic" v-html="isRedFun(item.name)"></div>
                <div class="list_num">{{ numberFormat2(item.viewNum) }}次浏览</div>
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
import { isNotEmpty, throttle, isEmpty, numberFormat2 } from '@/utils/tools'
import { searchTopic, listHistory } from '@/api/market/task'

const props = defineProps({
  topicList: {
    type: Array,
    default: () => {
      return []
    }
  }, // 需要初始化的数据
  origin: {
    type: String,
    default: '' // 来源 task2 下载发布任务要求
  },
  placeholder: {
    type: String,
    default: '请输入话题名称，以回车键查询，最多可添加3个话题'
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
    default: 1 // 1非话题式任务 2话题式任务
  },
  width: String // 选项宽度
})
const popoverRef = ref()
const inputValue = ref() // 输入框内容

const visible = ref(false) // 是否显示弹出框
const topicList = ref([])
const searchLoading = ref(true) // 数据的请求Loading
const searchList = ref([]) // 搜索后的列表
const searchParam = reactive({
  pageNumber: 1,
  pageSize: 7,
  total: 0
}) // 分页查询数据
const emits = defineEmits(['update:topicList'])
watch(
  () => topicList.value,
  val => {
    emits('update:topicList', val)
  },
  {
    deep: true
  }
)

// 输入框输入内容-请求话题列表
function inputFun(e) {
  // const reg =
  //   // eslint-disable-next-line no-misleading-character-class
  //   /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  // inputValue.value = inputValue.value.replace(reg, '')
  if (isEmpty(inputValue.value)) {
    resetFun()
  }
}
// 输入框回车键-如果输入框有内容就进行创建
function inputEnterFun() {
  resetFun()
}
// 输入框失去焦点-如果输入框有内容就进行创建
function inputBlurFun() {
  console.log('inputBlurFun', inputValue.value)
}

const inputRef = ref()
function setInputFocus() {
  inputRef.value.focus()
}
// 创建话题 无论是否创建，最后都需要清空输入框内容
// 1.如果输入的话题内容已经存在了，就不进行创建了
// 2.如果输入的话题内容在列表中已经存在了，看是否需要进行勾选
// 3.话题最多3个
function createTopicFun(topicValue) {
  const index = topicList.value.findIndex(x => x.id === topicValue.id)
  if (index === -1) {
    // 判断话题个数，超过就提示
    if (topicList.value.length >= 3) {
      ElMessage.warning('最多添加3个话题')
      // inputValue.value = ''

      return
    }

    // 都满足条件就进行创建
    topicList.value.push(topicValue)
    // inputValue.value = ''
  } else {
    // inputValue.value = ''
    topicList.value.splice(index, 1)
  }
}
// 删除已创建的话题
function delTopicFun(item, index) {
  topicList.value.splice(index, 1)
  visible.value = false
  inputValue.value = ''
}
// 从记录列表选择话题
const chooseTopicFun = throttle((item, index) => {
  createTopicFun(item, 'searchList')
}, 0)

// 话题列表，将搜索框内容对应的文字进行标红
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
// 查询历史选择话题记录列表
function getSearchList(isLoad) {
  searchLoading.value = true
  const searchType = isLoad ? 1 : isEmpty(inputValue.value) ? 1 : 2 // 1 是查询历史记录 2 是查询小红书话题
  const topicPromise =
    searchType === 1
      ? listHistory({
          pageNo: searchParam.pageNumber,
          pageSize: searchParam.pageSize,
          platform: props.origin === 'task2' ? 1 : 3,
          historyType: props.historyType ? props.historyType : 1,
          type: 1
        })
      : searchTopic({
          keyword: inputValue.value || '',
          page: searchParam.pageNumber,
          pageSize: searchParam.pageSize
        })
  topicPromise
    .then(res => {
      if (res.code === 0) {
        let resData = []
        if (searchType === 1) {
          resData = (res.data.records || []).map(x => {
            if (x.extra) {
              return JSON.parse(x.extra)
            } else {
              return ''
            }
          })
        }
        if (searchParam.pageNumber === 1) {
          // 第一次请求 ，要让滚动条回到顶部
          searchRef.value?.scrollTo(0, 0)

          searchList.value = searchType === 1 ? resData : res.data.topicInfoDtos || []
          searchParam.total =
            searchType === 1 ? res.data.total : (res.data.topicInfoDtos || []).length
        } else {
          searchList.value = searchList.value.concat(resData)
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
  if (isNotEmpty(props.topicList)) {
    topicList.value = JSON.parse(JSON.stringify(props.topicList))
  }
}
init()

function resetFun() {
  searchLoading.value = true
  searchParam.pageNumber = 1
  getSearchList()
}
function loadFun() {
  searchLoading.value = true
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
function isChoose(item) {
  return topicList.value.findIndex(x => x.id === item.id) > -1
}
</script>

<style lang="scss" scoped>
@import './css/choose.scss';

.xm_pullUpToLoadMore {
  margin-top: 6px;
  padding-bottom: 10px;
}
</style>

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
              <div class="one_choose_name line-hidden1" :title="item">
                {{ item || '' }}
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

          <!-- 输入框 获取焦点的时候就打开弹出框-->
          <el-input
            ref="inputRef"
            :disabled="props.disabled"
            class="input_input"
            :placeholder="topicList && topicList.length > 0 ? '' : props.placeholder"
            type="text"
            v-model.trim="inputValue"
            @focus="inputFocusFun"
            @keyup.enter="inputEnterFun"
            @input="inputFun"
            @blur="inputBlurFun"
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
                  choose_list: topicList.includes(item.content)
                }"
                @click.stop="chooseTopicFun(item, index)"
                v-for="(item, index) in searchList"
                :key="index"
              >
                <div class="list_topic" style="max-width: 100%">{{ item.content || '' }}</div>
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
                    ? searchList.length > 6
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
import { listHistory } from '@/api/market/task'

const props = defineProps({
  topicList: {
    type: Array,
    default: () => {
      return []
    }
  }, // 需要初始化的数据
  origin: {
    type: String,
    default: '' // 来源
  },
  type: {
    type: String,
    default: ''
  }, // 类型 keyword 关键词  默认为空是话题

  historyType: {
    type: Number,
    default: 1
  }, // 1历史数据 2 话题式任务数据
  maxSize: {
    type: Number,
    default: 20
  }, // 单个词的不超过字数
  placeholder: {
    type: String,
    default: '请输入话题名称，以回车键确认，最多可添加3个话题'
  },
  disabled: {
    type: Boolean,
    default: false // 是否可以禁用
  },
  clearable: {
    type: Boolean,
    default: false // 是否可以清除筛选项
  },
  topicType: {
    type: Number,
    default: 1
  }, // 话题返回类型 1：['',''] 2：[{},{}]
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
    // 兼容下载发布的话题格式
    if (props.topicType && props.topicType === 2) {
      const list = []
      val.forEach(x => {
        list.push({
          id: '',
          link: '',
          name: x,
          smart: false,
          type: '',
          viewNum: 0
        })
      })
      emits('update:topicList', list)
    } else {
      emits('update:topicList', val)
    }
  },
  {
    deep: true
  }
)

// 输入框输入内容-如果输入框有内容，那就关闭历史记录。输入框无内容就显示记录
function inputFun(e) {
  // const reg =
  //   // eslint-disable-next-line no-misleading-character-class
  //   /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  // inputValue.value = inputValue.value.replace(reg, '')
  if (isNotEmpty(inputValue.value) && visible.value) {
    visible.value = false
  } else if (isEmpty(inputValue.value)) {
    visible.value = props.type !== 'keyword'
  }
}
// 输入框回车键-如果输入框有内容就进行创建
function inputEnterFun() {
  if (isNotEmpty(inputValue.value)) {
    createTopicFun(inputValue.value)
    nextTick(() => {
      setInputFocus()
    })
  }
}
// 输入框失去焦点-如果输入框有内容就进行创建
function inputBlurFun() {
  if (isNotEmpty(inputValue.value)) {
    createTopicFun(inputValue.value)
  }
}
function inputFocusFun() {
  if (visible.value) return
  showPopver()
}
const inputRef = ref()
function setInputFocus() {
  inputRef.value.focus()
}
// 创建话题 无论是否创建，最后都需要清空输入框内容
// 1.如果输入的话题内容已经存在了，就不进行创建了
// 2.如果输入的话题内容在列表中已经存在了，看是否需要进行勾选
// 3.话题最多3个，单个话题不超过20字
function createTopicFun(topicValue, source) {
  const index = topicList.value.findIndex(x => x === topicValue)
  if (index === -1) {
    // 判断话题个数，超过就提示
    if (topicList.value.length >= 3) {
      ElMessage.warning(`最多添加3个${props.type === 'keyword' ? '关键词' : '话题'}`)
      inputValue.value = ''
      if (source === 'searchList') {
        // visible.value = false
      }
      return
    }
    // 判断话题字数,超过就提示
    const maxSize = props.maxSize ? props.maxSize : 20
    if (topicValue.length > maxSize) {
      if (props.type === 'keyword') {
        ElMessage.warning(`每个关键词不超过${maxSize}个字`)
      } else {
        ElMessage.warning(`单个话题不超过${maxSize}字`)
      }

      // inputValue.value = ''
      return
    }
    // 都满足条件就进行创建
    topicList.value.push(topicValue)
    inputValue.value = ''
    if (source === 'searchList') {
      // visible.value = false
    } else {
      inputRef.value.blur()
    }
  } else {
    inputValue.value = ''
    if (source === 'searchList') {
      // 如果是从记录列表选择了已选取的话题 就将他从话题列表取消
      topicList.value.splice(index, 1)
    }
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
  createTopicFun(item.content, 'searchList')
}, 0)
const searchRef = ref()
// 查询历史选择话题记录列表
function getSearchList() {
  searchLoading.value = true
  // 抖音下载发布的关键词--暂时关键词没有历史记录 platform是1 historyType是2
  listHistory({
    pageNo: searchParam.pageNumber,
    pageSize: searchParam.pageSize,
    platform: 1,
    type: 1,
    historyType: props.historyType === 2 ? 2 : 1
  })
    .then(res => {
      if (res.code === 0) {
        if (searchParam.pageNumber === 1) {
          // 第一次请求 ，要让滚动条回到顶部
          searchRef.value?.scrollTo(0, 0)
          searchList.value = res.data.records || []
          searchParam.total = res.data.total
        } else {
          const newListData = res.data.records || []
          searchList.value = searchList.value.concat(newListData)
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
    if (props.topicType && props.topicType === 2) {
      topicList.value = JSON.parse(JSON.stringify(props.topicList)).map(x => x.name)
    } else {
      topicList.value = JSON.parse(JSON.stringify(props.topicList))
    }
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
  getSearchList()
}

const onClickOutside = e => {
  if (visible.value && !unref(popoverRef).popperRef.contentRef.contains(e.target)) {
    visible.value = false
    clearPopver()
  }
}

// 打开弹出框
function showPopver() {
  // 抖音下载发布模式下 关键词不需要历史记录
  if (props.type === 'keyword') {
    return
  }
  console.warn('showPopver', props.type)
  resetFun()

  visible.value = true
  nextTick(() => {
    unref(popoverRef).popperRef?.popperInstanceRef?.update()
  })
}
// 显示或隐藏弹出框
function showOrHidePopver() {
  // 抖音下载发布模式下 关键词不需要历史记录
  if (props.type === 'keyword') {
    return
  }
  console.warn('showOrHidePopver', props.type)
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
.xm_pullUpToLoadMore {
  margin-top: 6px;
  padding-bottom: 10px;
}
.select_content {
  max-height: 224px;
  min-height: 100px;
  overflow-y: auto;
  .list_box {
    .one_list {
      line-height: 20px;
      min-height: 32px;
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>

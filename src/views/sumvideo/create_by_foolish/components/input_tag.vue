<template>
  <!-- 组件： 输入框回车创建标签，点击可选列表创建标签 -->
  <div class="input_tag_page">
    <!-- 输入区 -->
    <div :class="{ input_box: true, input_err: !!errTip }" @click="setInputFocus">
      <!-- 已生成的标签列表 -->
      <div class="input_tag_box" v-if="tagList && tagList.length > 0">
        <div class="one_tag" v-for="(item, index) in tagList" :key="index">
          <div class="one_tag_name line-hidden1" :title="item">
            {{ item || '' }}
          </div>

          <el-icon v-if="!props.disabled" class="one_tag_icon" @click.stop="delFun(item, index)">
            <i-close />
          </el-icon>
        </div>
      </div>
      <!-- 输入框-->
      <el-input
        ref="inputRef"
        class="input_input"
        :placeholder="tagList && tagList.length > 0 ? '' : placeholder"
        type="text"
        v-model.trim="inputValue"
        @keyup.enter="inputEnterFun"
        @blur="inputBlurFun"
        :maxlength="maxWord"
      ></el-input>
    </div>

    <!-- 错误提示 -->
    <div class="err_tip" v-if="errTip">{{ errTip }}</div>
    <!-- 可选列表 -->
    <div class="select_box" v-if="allSelectList && allSelectList.length > 0">
      <div
        class="one_select"
        @click="addFun(item)"
        v-for="(item, index) in showSelectList"
        :key="index"
      >
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240529gbdxx.png" alt="" />
        {{ item }}
      </div>
      <div
        class="one_select select_btn"
        @click="getNextThreeItems"
        v-if="allSelectList && allSelectList.length > 3"
      >
        <img src="https://tagvv-1256030678.file.myqcloud.com/202405233fz2q.png" alt="" />
        换一批
      </div>
    </div>
    <!-- 可选列表加载中 -->
    <div class="select_box select_loading" v-if="props.loading">
      <img src="/public/loading.gif" alt="" />
      加载中...
    </div>
  </div>
</template>
<script setup>
import { isNotEmpty, isEmpty, throttle } from '@/utils/tools'
const emits = defineEmits(['update:list', 'update:errTip'])
const message = inject('$message')
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }, // 是否处于加载推荐列表中
  validRequired: {
    type: Boolean,
    default: false
  }, // 是否必填
  label: {
    type: String,
    default: ''
  }, // 标签类型名称 商品小类等
  errTip: {
    type: String,
    default: ''
  }, // 错误提示
  disabled: {
    type: Boolean,
    default: false
  }, // 是否禁用
  placeholder: {
    type: String,
    default: ''
  }, // 输入框提示内容
  list: {
    type: Array,
    default: () => {
      return []
    }
  }, // 已创建的标签列表
  selectList: {
    type: Array,
    default: () => {
      return []
    }
  }, // 用于换一批的列表/可选列表
  minWord: {
    type: Number,
    default: null
  }, // 输入框最小字数
  maxWord: {
    type: Number,
    default: null
  }, // 输入框最大字数
  maxCount: {
    type: Number,
    default: null
  } // 最多可创建几个
})
const { validRequired, label, placeholder, minWord, maxWord, maxCount } = toRefs(props)
const maxCountName = ref('') // 最多可创建的中文数字
const errTip = ref('') // 校验失败的提示
const tagList = ref([]) // 已添加的标签列表
const inputValue = ref('') // 输入框的内容
const inputRef = ref()
function setInputFocus() {
  inputRef.value.focus()
}

// 删除已创建的
function delFun(item, index) {
  tagList.value.splice(index, 1)
  inputValue.value = ''
  if (validRequired.value && isEmpty(tagList.value)) {
    errTip.value = `请输入${parseInt(maxCount.value) > 1 ? '至少一个' : ''}${label.value}`
    emits('update:errTip', errTip.value)
  } else {
    errTip.value = ''
    emits('update:errTip', errTip.value)
  }
}
// 输入框输入内容-进行正则校验，禁止表情输入
function inputValidFun() {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  inputValue.value = inputValue.value.replace(reg, '')

  if (inputValue.value.length > 0) {
    // 允许输入/选择最多5个关键词的情况下，已达上限时，点击关键词不生效
    if (parseInt(maxCount.value) > 1 && tagList.value.length >= parseInt(maxCount.value)) {
      console.log('创建列表个数超过禁止创建')
      message.warning(`最多支持${maxCountName.value}个${label.value}`)
      errTip.value = ''
      emits('update:errTip', errTip.value)
      inputValue.value = ''
      return
    }
    // 校验是否重复添加
    const index = tagList.value.findIndex(x => x === inputValue.value)
    if (index > -1 && isNotEmpty(tagList.value)) {
      message.warning(`请勿添加重复的${label.value}`)
      errTip.value = ''
      emits('update:errTip', errTip.value)
      inputValue.value = ''
      return
    }

    if (
      inputValue.value.length >= parseInt(minWord.value) &&
      inputValue.value.length <= parseInt(maxWord.value)
    ) {
      // 字数正确，进行创建
      console.log('字数正确，进行创建')
      if (parseInt(maxCount.value) > 1) {
        tagList.value.push(inputValue.value)
      } else {
        // 只允许输入/选择一个关键词的情况下，已经有关键词，再次选择进行直接替换，或删除后进行重新输入/选择

        tagList.value = [inputValue.value]
      }

      errTip.value = ''
      emits('update:errTip', errTip.value)
      nextTick(() => {
        inputValue.value = ''
      })
    } else {
      // 提示字数不正确，并标红
      console.log('提示字数不正确，并标红')
      if (parseInt(minWord.value) === 1) {
        errTip.value = `标签不超过${maxWord.value}个字`
      } else {
        errTip.value = `每个标签在${minWord.value}-${maxWord.value}个字之间`
      }

      emits('update:errTip', errTip.value)
    }
  } else {
    if (validRequired.value && isEmpty(tagList.value)) {
      errTip.value = `请输入${parseInt(maxCount.value) > 1 ? '至少一个' : ''}${label.value}`
      emits('update:errTip', errTip.value)
    } else {
      errTip.value = ''
      emits('update:errTip', errTip.value)
    }
  }
}
// 输入框回车键-如果输入框有内容就进行创建
function inputEnterFun() {
  console.log('输入框回车')
  inputValidFun()
}
// 输入框失去焦点-如果输入框有内容就进行创建
function inputBlurFun() {
  console.log('输入框失去焦点')
  inputValidFun()
}
// 从可选列表中添加数据到标签列表
const addFun = throttle(e => {
  // 允许输入/选择最多5个关键词的情况下，已达上限时，点击关键词不生效
  if (parseInt(maxCount.value) > 1 && tagList.value.length >= parseInt(maxCount.value)) {
    console.log('创建列表个数超过禁止创建')
    message.warning(`最多支持${maxCountName.value}个${label.value}`)
    errTip.value = ''
    emits('update:errTip', errTip.value)
    return
  }
  // 校验是否重复添加
  const index = tagList.value.findIndex(x => x === e)
  if (index > -1 && isNotEmpty(tagList.value)) {
    message.warning(`请勿添加重复的${label.value}`)
    errTip.value = ''
    emits('update:errTip', errTip.value)
    inputValue.value = ''
    return
  }
  if (parseInt(maxCount.value) > 1) {
    tagList.value.push(e)
  } else {
    // 只允许输入/选择一个关键词的情况下，已经有关键词，再次选择进行直接替换，或删除后进行重新输入/选择
    tagList.value = [e]
  }

  errTip.value = ''
  emits('update:errTip', errTip.value)
}, 0)
// 获取最新的错误提示
watch(
  () => props.errTip,
  val => {
    errTip.value = val
  },
  {
    immediate: true
  }
)
// 实时监听数据，并返回
watch(
  () => tagList.value,
  val => {
    emits('update:list', val)
  },
  {
    deep: true
  }
)
const allSelectList = ref([]) // 所有可选列表
const showSelectList = ref([]) // 按顺序获取三个可选列表在页面上显示
const showIndex = ref(0) // 获取的index
watch(
  () => props.selectList,
  val => {
    showIndex.value = 0
    if (isNotEmpty(val)) {
      allSelectList.value = val
      getNextThreeItems()
    } else {
      allSelectList.value = []
      showSelectList.value = []
    }
  },
  {
    immediate: true,
    deep: true
  }
)

// 按顺序获取三条数据
function getNextThreeItems() {
  const result = []
  for (let i = 0; i < 3; i++) {
    if (showIndex.value >= allSelectList.value.length) {
      showIndex.value = 0 // 重置索引到数组开始
    }
    result.push(allSelectList.value[showIndex.value])
    showIndex.value++
  }
  showSelectList.value = result
}

// 初始化
onMounted(() => {
  if (isNotEmpty(props.list)) {
    tagList.value = JSON.parse(JSON.stringify(props.list))
  }
  maxCountName.value = maxCount.value === 1 ? '一' : maxCount.value === 5 ? '五' : '一'
})

// 清空输入框内容
function clearInputValue() {
  inputValue.value = ''
}
defineExpose({
  clearInputValue
})
</script>
<style lang="scss" scoped>
.input_box {
  width: 100%;
  background: #fff;
  border: 1px solid rgb(220, 223, 230);
  border-radius: 4px;
  display: flex !important;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  flex-wrap: wrap;
  .input_tag_box {
    padding-right: 6px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }
  .one_tag {
    margin: 5px 0 5px 6px;
    color: rgb(144, 147, 153);
    font-size: 12px;
    background: rgb(240, 242, 245);
    border-radius: 4px;

    line-height: 22px;
    padding: 0 5px 0 9px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    word-break: break-all;
    .one_tag_icon {
      margin-left: 2px;
      cursor: pointer;
      &:hover {
        background: #909399;
        border-radius: 100%;
        width: 12px;
        height: 12px;
        color: #fff;
      }
    }
  }

  .input_input {
    flex: 1;
    min-width: 150px;
  }
  :deep(.el-input__inner) {
    border: none !important;
    padding-right: 0 !important;
  }
}
.input_err {
  border-color: #f56c6c;
}
.err_tip {
  font-weight: 400;
  font-size: 12px;
  color: #f56c6c;
  line-height: 18px;
}
.input_box + .select_box {
  margin-top: 12px;
}
.err_tip + .select_box {
  margin-top: 2px;
}
.select_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .one_select {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: 400;
    font-size: 12px;
    color: #364fcd;
    line-height: 18px;
    margin-right: 16px;
    cursor: pointer;
    img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      display: flex;
      margin-right: 2px;
    }
  }
  .one_select:hover {
    opacity: 0.9;
  }
  .select_btn {
    color: #909399 !important;
  }
}
.select_loading {
  align-items: center;
  // justify-content: center;

  color: #909399;
  font-size: 12px;
  img {
    height: 18px;
    margin-right: 4px;
  }
}
</style>

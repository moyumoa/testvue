<template>
  <div class="fourth_page">
    <img class="icon" src="https://tagvv-1256030678.file.myqcloud.com/20240328j7mnh.png" alt="" />
    <div class="title" @click="handleTitleClick" v-if="canClick">
      <div v-html="renderedTitle"></div>
    </div>
    <div class="title" v-html="title" v-else></div>
    <div class="tip">
      此页面
      <span>{{ time }}s</span>
      后自动关闭
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  title: {
    type: String,
    default:
      '合成任务已提交，请至<span style="font-weight: 600;">【合成任务】</span>查看合成进度和结果'
  },
  canClick: {
    type: Boolean,
    default: true
  }, // 是否可点击

  countTime: {
    type: Number,
    default: 5
  } // 倒计时
})
const { title, canClick } = toRefs(props)
const renderedTitle = ref(null)
const time = ref(0)
const timer = ref()
function init() {
  time.value = props.countTime
  if (props.countTime > 0) {
    setTimerFun()
  }
}
init()
const emits = defineEmits(['closeFun', 'toRecords'])
function setTimerFun() {
  timer.value = setInterval(() => {
    time.value--
    if (time.value < 1) {
      clearTimeFun()
      emits('closeFun')
    }
  }, 1000)
}
function clearTimeFun() {
  time.value = 0
  clearInterval(timer.value)
  timer.value = null
}
const toRecords = throttle(function () {
  emits('toRecords')
}, 500)

const handleTitleClick = event => {
  event.preventDefault()
  // 检查点击的是否是 a 标签
  if (event.target?.tagName.toLowerCase() === 'a') {
    toRecords()
  }
}
onMounted(() => {
  // 使用 DOM 操作来替换事件监听器
  const span = title.value.match(/<span[^>]*>([^<]+)<\/span>/)[1]
  renderedTitle.value = title.value.replace(span, `<a href="#" @click="toRecords">${span}</a>`)
})
onBeforeUnmount(() => {
  clearTimeFun()
})
</script>
<style lang="scss" scoped>
.fourth_page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
    display: flex;
    margin-bottom: 20px;
  }
  .title {
    margin-bottom: 12px;
    padding: 0 16px;
    text-align: center;
    font-weight: 400;
    font-size: 16px;
    color: #323233;
    line-height: 20px;

    :deep(a) {
      color: #364fcd;
      cursor: pointer;
    }
  }
  .tip {
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    line-height: 20px;
    span {
      color: rgba(54, 79, 205, 1);
    }
  }
}
</style>

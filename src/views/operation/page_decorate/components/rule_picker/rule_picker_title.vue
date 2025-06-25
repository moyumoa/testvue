<template>
  <div class="rule_title">
    <div class="content_top flex_between">
      <div class="label">{{ props.title }}</div>
      <div class="content_box" v-if="showLabel">
        {{ list[chooseIndex].label }}
      </div>
    </div>
    <div class="content_bottom">
      <div class="rule_box picker_title">
        <div
          :class="{
            one_rule: true,
            cehck_rule: item.value == chooseValue
          }"
          :style="{
            width: `calc(100% / ${list.length})`,
            padding: '0'
          }"
          v-for="(item, index) in list"
          :key="index"
          @click="changeRule(item.value, index)"
        >
          <div class="icon_mark" v-if="item.icon" :class="`iconfont ${item.icon}`"></div>
          <div v-else>{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  ruleList: {
    type: Array,
    default: () => {
      return []
    }
  },
  chooseValue: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})
const list = ref([])
const chooseValue = ref()
const chooseIndex = ref(0)
const showLabel = ref(true)
function init() {
  if (props.chooseValue != null) {
    chooseValue.value = props.chooseValue
  }
  if (props.type === 'listStyle') {
    list.value = [
      {
        label: '大图模式',
        value: 'big',
        icon: 'icon-shangpin-datumoshi'
      },
      {
        label: '一行两个',
        value: 'two',
        icon: 'icon-shangpin-yihangliangge'
      },
      {
        label: '一行三个',
        value: 'three',
        icon: 'icon-shangpin-yihangsange'
      },
      {
        label: '详细列表',
        value: 'list',
        icon: 'icon-shangpin-xiangxiliebiao'
      },
      {
        label: '一大两小',
        value: 'hybrid',
        icon: 'icon-shangpin-yidaliangxiao'
      },
      {
        label: '横向滑动',
        value: 'swipe',
        icon: 'icon-shangpin-hengxianghuadong'
      }
    ]
  } else if (props.type === 'goodsStyle') {
    list.value = [
      {
        label: '无边白底',
        value: 'none'
      },
      {
        label: '卡片投影',
        value: 'shadow'
      },
      {
        label: '描边白底',
        value: 'stroke'
      },
      {
        label: '无边透明底',
        value: 'transparent'
      }
    ]
  } else {
    list.value = props.ruleList
  }
  list.value.forEach((x, i) => {
    if (i === 0 && x.hideLabel) {
      showLabel.value = false
    }
    if (x.value === chooseValue.value) {
      chooseIndex.value = i
    }
  })
}
init()
// 选择
const emits = defineEmits(['update:chooseValue', 'updateListStyle'])
const changeRule = throttle((e, index) => {
  chooseValue.value = e
  chooseIndex.value = index
  if (props.type === 'listStyle') {
    emits('updateListStyle', e)
  } else {
    emits('update:chooseValue', e)
  }
}, 300)
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
.rule_picker {
  width: 100%;
}
</style>

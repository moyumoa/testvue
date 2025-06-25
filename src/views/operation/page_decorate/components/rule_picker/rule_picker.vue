<template>
  <div :class="{ rule_picker: true, flex_between: showLabel, flex_end: !showLabel }">
    <div class="content_text" v-if="showLabel">
      {{ list[chooseIndex].label }}
    </div>
    <div class="rule_box text_size">
      <div
        :class="{
          one_rule: true,
          cehck_rule: item.value == chooseValue,
          one_rule_size: type == 'fontSize',
          one_rule_label: type != 'fontSize' && item.hideLabel,
          one_rule_dis: props.disValue
        }"
        :style="{
          cursor: props.disValue ? 'no-drop' : 'pointer'
        }"
        v-for="(item, index) in list"
        :key="index"
        @click="changeRule(item.value, index)"
      >
        <div v-if="type == 'fontSize'">A</div>
        <div v-else-if="type != 'fontSize' && item.hideLabel">{{ item.label }}</div>
        <div
          class="icon_mark"
          :style="item.fontSize ? `font-size:${item.fontSize}px` : ''"
          v-else
          :class="`iconfont ${item.icon}`"
        ></div>
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
  disValue: {
    type: Boolean,
    default: false
  }
})
const list = ref([])
const type = toRef(props, 'type')
const chooseValue = ref()
const chooseIndex = ref(0)
const showLabel = ref(true)
function init() {
  if (props.chooseValue != null) {
    chooseValue.value = props.chooseValue
  }
  if (props.type === 'fontWeight') {
    list.value = [
      {
        label: '常规体',
        value: 'normal',
        icon: 'icon-changguiti'
      },
      {
        label: '加粗体',
        value: 'bold',
        icon: 'icon-jiacu'
      }
    ]
  } else if (props.type === 'textAlign') {
    list.value = [
      {
        label: '居左显示',
        value: 'left',
        icon: 'icon-juzuo'
      },
      {
        label: '居中显示',
        value: 'center',
        icon: 'icon-juzhong'
      },
      {
        label: '居右显示',
        value: 'right',
        icon: 'icon-juyou'
      }
    ]
  } else if (props.type === 'imgAngle') {
    list.value = [
      {
        label: '直角',
        value: 'angle',
        icon: 'icon-zhijiao'
      },
      {
        label: '圆角',
        value: 'round',
        icon: 'icon-yuanjiao'
      }
    ]
  } else if (props.type === 'fill') {
    list.value = [
      {
        label: '填充',
        value: 'cover',
        icon: 'icon-shangpin-tianchong'
      },
      {
        label: '周边留白',
        value: 'contain',
        icon: 'icon-shangpin-zhoubianliubai'
      }
    ]
  } else if (props.type === 'imgScale') {
    list.value = [
      {
        label: '3:2',
        value: parseFloat(2 / 3).toFixed(2),
        icon: 'icon-a-shangpin-32'
      },
      {
        label: '1:1',
        value: parseFloat(1).toFixed(2),
        icon: 'icon-a-shangpin11',
        fontSize: 18
      },
      {
        label: '3:4',
        value: parseFloat(4 / 3).toFixed(2),
        icon: 'icon-a-shangpin34',
        fontSize: 18
      },
      {
        label: '16:9',
        value: parseFloat(9 / 16).toFixed(2),
        icon: 'icon-a-shangpin169',
        fontSize: 11
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
const emits = defineEmits(['update:chooseValue', 'upBackground'])
const changeRule = throttle((e, index) => {
  if (!props.disValue) {
    chooseValue.value = e
    chooseIndex.value = index
    emits('update:chooseValue', e)
  }
  if (props.type === 'pageBackground') {
    emits('upBackground')
  }
}, 300)

watch(
  () => props.chooseValue,
  newVal => {
    console.log('new', props.type, newVal)
    if (props.type === 'imgScale') {
      chooseValue.value = newVal
      chooseIndex.value = list.value.map(x => x.value).indexOf(newVal)
    }
  }
)
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
.rule_picker {
  width: 100%;
}
</style>

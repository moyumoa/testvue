<template>
  <div class="tip_chose_terminal" :class="showCless ? 'tip_chose_terminal_showCless' : ''">
    <el-checkbox-group v-model="checkList" @change="checkListChange" :disabled="disabled">
      <el-checkbox label="抖音" />
      <el-checkbox label="视频号" />
      <el-checkbox label="小红书" />
      <el-checkbox label="快手" />
      <!-- <el-checkbox label="百应" v-if="systemVersion == 3" /> -->
      <el-checkbox label="抖音线索" v-if="systemVersion == 3" />
      <!-- <el-checkbox disabled label="抖音发布能力" /> -->
    </el-checkbox-group>
  </div>
</template>
<script setup>
import { debounce } from '@/utils/tools'
import { useStore } from 'vuex'

const props = defineProps({
  loseEfficacyTips: {
    type: Boolean,
    default: true
  },
  authTypeIds: {
    type: String, // 已选择
    default: '1,2,3,4,7'
  },
  from: {
    type: String,
    default: 'auto' // auto自动提醒下的选择，hand手动提醒弹窗的选择
  },
  noticeResizeWidth: {
    type: String,
    default: '827.5px'
  }
})
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)
const labelObj = {
  1: '抖音',
  2: '视频号',
  3: '小红书',
  4: '快手',
  7: '抖音线索'
  // 6: '百应',
  // 5: '抖音发布能力'
}
const valueObj = {
  抖音: 1,
  视频号: 2,
  小红书: 3,
  快手: 4,
  抖音线索: 7
  // 百应: 6,
  // 抖音发布能力: 5
}
const { authTypeIds, from } = toRefs(props)
const checkList = ref([]) // 当前页选中list
const disabled = ref(false) // 自动提醒开关关闭禁止选择
const emit = defineEmits(['tipsChoseChange'])
const showCless = ref(true) // false：正常显示不换行 true：换行显示

// 选中值改变
const checkListChange = debounce(() => {
  const resultCheckIds = getOptions()
  emit('tipsChoseChange', resultCheckIds, from.value)
}, 700)

// 监听传入的宽度
// watch(
//   () => props.noticeResizeWidth,
//   val => {
//     console.log('props.from ', props.from)
//     if (props.from === 'auto') {
//       const nowWidth = parseInt(val || 0)
//       if (nowWidth < 665) {
//         showCless.value = true
//       } else {
//         showCless.value = false
//       }
//     }
//   },
//   { deep: true, immediate: true }
// )
// 监听选中回显
watch(
  () => props.authTypeIds,
  () => {
    checkList.value = showOptions() // 回显
  },
  { deep: true, immediate: true }
)
// 回显选中
function showOptions() {
  let authTypeIdsArr = authTypeIds.value ? (authTypeIds.value || '').split(',') : []
  if (systemVersion.value !== 3) {
    const unsetList = ['6', '7']
    authTypeIdsArr = authTypeIdsArr.filter(x => !unsetList.includes(x))
  }
  // 清除发布能力授权的勾选状态
  const unsetList2 = ['5']
  authTypeIdsArr = authTypeIdsArr.filter(x => !unsetList2.includes(x))

  console.log('authTypeIds', authTypeIds.value, authTypeIdsArr)
  return authTypeIdsArr.map(item => {
    return labelObj[Number(item)]
  })
}
// 处理选中
function getOptions() {
  return checkList.value
    .map(item => {
      return valueObj[item]
    })
    .join(',')
}
</script>
<style lang="scss" scoped>
.tip_chose_terminal {
  display: flex;
  align-items: center;
  :deep() .el-checkbox-group {
    display: flex;
    align-items: center;
    .el-checkbox {
      margin-right: 24px;
    }
  }
}
// 换行显示
.tip_chose_terminal_showCless {
  :deep() .el-checkbox-group {
    flex-wrap: wrap;
    .el-checkbox {
      margin-top: 4px;
      margin-bottom: 12px;
    }
    .el-checkbox:last-child {
      // margin-top: 8px;
    }
  }
}
</style>

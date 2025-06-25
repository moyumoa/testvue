<template>
  <div class="search_tag_box">
    <div
      :class="{ one_tag: true, choose_tag: item.isChoose }"
      v-for="(item, index) in list"
      :key="index"
      @click="chooseFun(item, index)"
    >
      {{ item.name || '' }}
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'
const props = defineProps({
  industryList: {
    type: Object,
    default() {
      return []
    }
  }
})

const list = ref([
  {
    name: '全部',
    id: 'xm_quanbu',
    isChoose: true // 默认选中全部
  }
]) // 行业列表

const chooseId = ref([]) // 选中的行业

onMounted(() => {
  if (props.industryList && props.industryList.length > 0) {
    const l = JSON.parse(JSON.stringify(props.industryList))
    list.value = list.value.concat(l)
  }
})
const emits = defineEmits(['updateIndustry'])
// 单选
const chooseFun = throttle((e, i) => {
  if (!e.isChoose) {
    list.value.forEach(x => {
      x.isChoose = x.id === e.id
    })
    chooseId.value = e.id === 'xm_quanbu' ? [] : [e.id]
    emits('updateIndustry', chooseId.value)
  }
})

// // 多选
// const chooseFun = throttle((e, i) => {
//   // 如果选的是全部
//   if (e.id === 'xm_quanbu') {
//     // 点击之前已经是非选中的状态 :就把状态改成选中，并且其他的都改成非选中。如果之前已经是选中状态，就不做任何操作
//     if (!e.isChoose) {
//       chooseId.value = []
//       list.value.forEach(x => {
//         x.isChoose = x.id === e.id
//       })
//       emits('updateIndustry', chooseId.value)
//     }
//     return
//   }
//   // 不是全部 无论之前是否是选中状态，都需要把全部的状态改成非选中，并且当前KEY的状态改为非当前状态
//   list.value[0].isChoose = false

//   if (e.isChoose) {
//     const indx = chooseId.value.findIndex(x => x === e.id)
//     if (indx > -1) {
//       chooseId.value.splice(indx, 1)
//     }
//   } else {
//     chooseId.value.push(e.id)
//   }

//   list.value[i].isChoose = !list.value[i].isChoose
//   // 如果最后一个都没选中，那就选中全部。
//   if (!(chooseId.value && chooseId.value.length > 0)) {
//     list.value[0].isChoose = true
//   }
//   emits('updateIndustry', chooseId.value)
// }, 300)
</script>
<style lang="scss" scoped>
.search_tag_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  .one_tag {
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    border-radius: 4px;
    padding: 2px 6px;
    margin: 4px 8px 4px 0;
  }
  .choose_tag {
    background: rgba(0, 0, 0, 0.1);
    color: #303133;
  }
}
</style>

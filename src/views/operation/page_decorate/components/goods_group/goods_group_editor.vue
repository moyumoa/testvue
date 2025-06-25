<template>
  <div class="decorate">
    <div class="title">商品</div>
    <!-- 内容 -->
    <div class="content">
      <!-- 商品分组 -->
      <div class="add_box">
        <div class="" v-if="props.templateStyle != '3' && componentData.groupList.length > 0">
          <draggable
            v-model="componentData.groupList"
            group="goods_group"
            item-key="id"
            animation="300"
          >
            <template #item="{ element, index }">
              <div class="one_box">
                {{ element }}

                <el-icon class="close_box" @click="delFun(index)">
                  <i-circle-close-filled />
                </el-icon>
              </div>
            </template>
          </draggable>
        </div>
        <div class="" v-else></div>
        <div class="one_upload" @click="showGroupFun" v-if="componentData.groupList.length < 15">
          <div class="text1">
            <el-icon class="icon_mark"><i-plus /></el-icon>
            添加分组
          </div>
          <div>最多添加10个，可拖动调整顺序</div>
        </div>
        <div></div>
      </div>
      <goodsCommonEditor v-model:componentData="componentData"></goodsCommonEditor>
    </div>
    <chooseGoodGroup
      v-if="groupModal.show"
      :modal="groupModal"
      v-model:groupList="componentData.goodsData"
    ></chooseGoodGroup>
  </div>
</template>

<script setup>
import goodsCommonEditor from '../goods_common/goods_common_editor.vue'
import chooseGoodGroup from '../choose_goodGroup_multiple/choose_goodGroup_multiple.vue'

defineComponent(goodsCommonEditor, chooseGoodGroup)
const props = defineProps({
  componentData: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const componentData = ref()
// 初始化
function init() {
  if (props.componentData) {
    componentData.value = JSON.parse(JSON.stringify(props.componentData))
  }
}
init()

const emits = defineEmits(['update:componentData'])
watch(
  () => componentData.value,
  newVal => {
    emits('update:componentData', newVal)
  },
  { deep: true }
)
const groupModal = ref({
  show: false,
  groupList: []
})
function showGroupFun() {
  groupModal.value.groupList = componentData.value.groupList
  groupModal.value.show = true
}
// 删除商品
// function delImg(index) {
//   componentData.value.goodsData.splice(index, 1)
// }
// const addModal = ref({
//   show: false,
//   chooseList: []
// })
// 添加商品
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
div {
  box-sizing: border-box;
}
</style>

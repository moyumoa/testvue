<template>
  <div class="decorate">
    <div class="title">商品</div>
    <!-- 内容 -->
    <div class="content">
      <!-- 商品来源 -->
      <div class="one_content flex_between">
        <div class="label">商品来源</div>
        <div class="content_box">
          <el-radio-group v-model="componentData.goodsSource" @change="sourceChange">
            <el-radio label="goods">商品</el-radio>
            <el-radio label="goodsGroup">商品分组</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="add_good" v-if="componentData.goodsSource == 'goods'">
        <!-- <div class="one_good" v-for="(item, index) in componentData.goodsData" :key="index"> -->

        <draggable
          animation="300"
          style="display: flex; flex-wrap: wrap"
          v-model="componentData.goodsData"
          group="goods"
          item-key="id"
        >
          <template #item="{ element, index }">
            <div class="one_good a">
              <img v-if="element.img" class="good_cover" :src="element.img" alt="" />
              <img
                class="good_cover"
                v-else
                src="@/assets/images/content_center/default_cover.png"
                alt=""
              />
              <el-icon class="close_box" @click="delImg(index)">
                <i-circle-close-filled />
              </el-icon>
            </div>
          </template>

          <template #footer>
            <div class="one_good add_one" @click="addImg">
              <el-icon class="icon_mark"><i-plus /></el-icon>
              <p>请添加商品</p>
            </div>
          </template>
        </draggable>

        <!-- </div> -->
      </div>
      <div class="add_group" v-else>
        <div class="one_group">
          <div class="group_one">
            <div class="label">商品分组</div>
            <div class="group_content">
              <el-select
                style="width: 100%"
                v-model="componentData.groupId"
                placeholder="请选择商品分组"
              >
                <el-option
                  v-for="(item, index) in groupsList"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </div>
          </div>
          <div class="group_one">
            <div class="label">显示个数</div>
            <div class="group_content">
              <el-input
                v-model.trim="goodsNum"
                maxlength="4"
                @blur="retEmit($event)"
                placeholder="请输入显示个数"
                type="text"
              ></el-input>
              <div class="group_mark">最多显示50个</div>
            </div>
          </div>
        </div>
      </div>
      <goodsCommonEditor v-model:componentData="componentData"></goodsCommonEditor>
    </div>
    <chooseGood
      v-if="addModal.show"
      :modal="addModal"
      v-model:goods="componentData.goodsData"
    ></chooseGood>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import { selectSimpleList } from '@/api/content_center/good_store.js'

import goodsCommonEditor from '../goods_common/goods_common_editor.vue'
import chooseGood from '../choose_goods_multiple/choose_goods_multiple.vue'

defineComponent(goodsCommonEditor, chooseGood, draggable)
const props = defineProps({
  componentData: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const componentData = ref()
const goodsNum = ref(5)
// 初始化
function init() {
  if (props.componentData) {
    componentData.value = JSON.parse(JSON.stringify(props.componentData))
    goodsNum.value = componentData.value.goodsNum
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

// 商品来源切换
function sourceChange(e) {
  if (e === 'goods') {
    componentData.value.groupId = null
  } else if (e === 'goodsGroup') {
    componentData.value.goodsData = []
  }
}

const groupsList = ref()
// 获取商品分组
function getGroupList() {
  selectSimpleList().then(res => {
    if (res.code === 0) {
      const list = res.data || []
      groupsList.value = list
    }
  })
}
getGroupList()
// 删除商品
function delImg(index) {
  componentData.value.goodsData.splice(index, 1)
}
const addModal = ref({
  show: false,
  chooseList: []
})
// 添加商品
function addImg() {
  addModal.value.chooseList = componentData.value.goodsData
  addModal.value.show = true
}

const message = inject('$message')
function retEmit(e) {
  const regE = /^[1-9]\d*$/g
  if (regE.test(goodsNum.value)) {
    if (parseInt(goodsNum.value) > 50) {
      goodsNum.value = 50
      componentData.value.goodsNum = 50
      message.warning('只能输入1到50的正整数')
    } else {
      componentData.value.goodsNum = goodsNum.value
    }
  } else {
    goodsNum.value = 1
    componentData.value.goodsNum = 1
    message.warning('只能输入1到50的正整数')
  }
}
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
div {
  box-sizing: border-box;
}
</style>

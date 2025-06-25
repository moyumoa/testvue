<template>
  <div class="decorate">
    <div class="title">在线预约</div>
    <!-- 内容 -->
    <div class="content">
      <div class="add_good">
        <draggable
          animation="300"
          style="display: flex; flex-wrap: wrap"
          v-model="componentData.activityData"
          group="goods"
          item-key="id"
        >
          <template #item="{ element, index }">
            <div class="one_good a">
              <img v-if="element.img" class="good_cover" :src="element.img" alt />
              <img
                class="good_cover"
                v-else
                src="@/assets/images/content_center/default_cover.png"
                alt
              />
              <el-icon class="close_box" @click="delImg(index)">
                <i-circle-close-filled />
              </el-icon>
            </div>
          </template>

          <template #footer>
            <div class="one_good add_one" @click="addImg">
              <el-icon class="icon_mark">
                <i-plus />
              </el-icon>
              <p>添加活动</p>
            </div>
          </template>
        </draggable>

        <!-- </div> -->
      </div>
      <goodsCommonEditor type="booking" v-model:componentData="componentData"></goodsCommonEditor>
    </div>
    <chooseBooking
      v-if="addModal.show"
      :modal="addModal"
      v-model:goods="componentData.activityData"
    ></chooseBooking>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import goodsCommonEditor from '../goods_common/goods_common_editor.vue'
import chooseBooking from '../choose_booking_multiple/choose_booking_multiple.vue'
import { getAppointmentInfoListByIds } from '@/api/content_center/retain_activity.js'
defineComponent(goodsCommonEditor, chooseBooking, draggable)
const props = defineProps({
  componentData: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const componentData = ref()
// const activityData = ref([])
// 初始化
function init() {
  if (props.componentData) {
    componentData.value = JSON.parse(JSON.stringify(props.componentData))
    // componentData.value.goodsData = [3, 4, 5]
    if (componentData.value.goodsData && componentData.value.goodsData.length) {
      getAppointmentInfoListByIds({ activityIds: componentData.value.goodsData }).then(res => {
        if (res.code === 0) {
          // componentData.value.activityData = res.data
          const list = res.data || []
          const arr = []
          list.forEach(item => {
            arr.push({
              img: JSON.parse(item.activityHeadImg)[0],
              name: item.activityTitle,
              discountPrice: item.presentPrice,
              marketPrice: item.originalPrice,
              gmtCreate: item.createTime,
              id: item.activityId
            })
          })
          componentData.value.activityData = arr
          // componentData.value.activityData = [
          //   {
          //     img: 'https://p9-aio.ecombdimg.com/obj/temai/71b6e5e464bcc36afd92c8be4041e680260d1247www400-400',
          //     name: '实拍韩国chic小众抽绳连衣裙简约feel气质长款裙子',
          //     discountPrice: 999800,
          //     marketPrice: 999800,
          //     gmtCreate: '2022-1-12',
          //     id: '3427556920385525481'
          //   }
          // ]
          // handleGoodsData()
        }
      })
    } else {
      componentData.value.activityData = []
    }
  }
}
init()
function handleGoodsData() {
  const arr = []
  componentData.value.activityData.forEach(item => {
    arr.push(item.id)
  })
  componentData.value.goodsData = arr
}
const emits = defineEmits(['update:componentData'])
watch(
  () => componentData.value,
  newVal => {
    emits('update:componentData', newVal)
  },
  { deep: true }
)
watch(
  () => componentData.value.activityData,
  newVal => {
    handleGoodsData()
  },
  { deep: true }
)
// 删除商品
function delImg(index) {
  componentData.value.activityData.splice(index, 1)
}
const addModal = ref({
  show: false,
  chooseList: []
})
// 添加商品
function addImg() {
  addModal.value.chooseList = componentData.value.activityData
  addModal.value.show = true
}
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
div {
  box-sizing: border-box;
}
</style>

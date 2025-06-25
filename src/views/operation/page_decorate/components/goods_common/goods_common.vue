<template>
  <div :class="{ goods_common: true, overWidth: props.componentData.listStyle == 'swipe' }">
    <div
      :class="`good_box ${props.componentData.listStyle}`"
      :style="{
        'padding-left': props.componentData.pmargin + 'px',
        'padding-right': props.componentData.pmargin + 'px'
      }"
    >
      <div
        v-for="(item, index) in showGoodList"
        :key="index"
        class="one_box"
        :style="{
          'margin-top': props.componentData.imargin + 'px',
          'margin-bottom': props.componentData.imargin + 'px'
        }"
      >
        <div :class="`one_good ${props.componentData.goodsStyle} ${props.componentData.imgAngle}`">
          <div class="good_img_box" :style="{ paddingTop: props.componentData.scale * 100 + '%' }">
            <div
              v-if="item.img"
              class="good_img"
              :style="{
                backgroundImage: 'url(' + item.img + ')',
                backgroundSize: props.componentData.fill
              }"
            ></div>
            <div
              v-else
              class="good_img"
              :style="{
                backgroundImage: 'url(' + cover + ')',
                backgroundSize: props.componentData.fill
              }"
            ></div>
          </div>
          <div
            class="good_content"
            v-if="props.componentData.showTitle || props.componentData.showPrice"
          >
            <div
              v-if="props.componentData.showTitle"
              class="good_title one_con line-hidden1"
              :style="{
                textAlign: props.componentData.textAlign,
                fontWeight: props.componentData.fontWeight
              }"
            >
              {{ item.name || `这里是${props.type === 'booking' ? '活动' : '商品'}名称` }}
            </div>
            <template v-if="props.type === 'booking'">
              <div
                class="good_price one_con"
                :style="{
                  textAlign: props.componentData.textAlign
                }"
                v-if="props.componentData.showPrice"
              >
                <template v-if="showGoodList.length > 0 && item.discountPrice != null">
                  ￥{{ changeTwoDecimal(item.discountPrice) }}
                  <span v-if="item.marketPrice != null">
                    ￥{{ changeTwoDecimal(item.marketPrice) }}
                  </span>
                </template>
                <template v-if="showGoodList.length == 0">
                  ￥368.00
                  <span>￥368.00</span>
                </template>
              </div>
            </template>
            <template v-else>
              <div
                class="good_price one_con"
                :style="{
                  textAlign: props.componentData.textAlign
                }"
                v-if="props.componentData.showPrice"
              >
                ￥{{
                  item.showPrice == 1
                    ? item.discountPrice
                      ? changeTwoDecimal(item.discountPrice)
                      : '368.00'
                    : '368.00'
                }}
                <!-- <span v-if="props.type === 'booking'">
                  ￥{{ item.marketPrice ? changeTwoDecimal(item.marketPrice) : '0.00' }}
                </span>-->
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { selectList } from '@/api/content_center/good_store.js'
import cover from '@/assets/images/operate/defalut_img.png'
import { changeTwoDecimal } from '@/utils/tools.js'
const props = defineProps({
  type: {
    type: String,
    default: ''
  },
  componentData: {
    type: Object
  }
})
watch(
  () => props.componentData,
  newVal => {
    if (newVal.goodsSource === 'goodsGroup') {
      getGood()
    }
  },
  { deep: true }
)
// 如果是商品分组，则掉接口去获取商品
const goodList = ref([])
function getGood() {
  if (props.componentData.goodsNum > 0 && props.componentData.groupId) {
    const data = {
      groupsId: props.componentData.groupId,
      name: '',
      status: 0,
      pageNo: 1,
      pageSize: props.componentData.goodsNum,
      searchCount: true
    }
    selectList(data)
      .then(res => {
        if (res.code === 0) {
          goodList.value = res.data.records || []
        }
      })
      .catch(() => {})
  }
}
function init() {
  getGood()
}
init()

const showGoodList = computed(() => {
  // 如果选择商品，则直接取goodsData||3 ,否则，如果goodList有数据，则展示goodList，反之默认展示3个(goodsNum>3就展示3，否则就按goodsNum展示)，
  if (props.type === 'booking') {
    return props.componentData.activityData.length > 0 ? props.componentData.activityData : 3
  } else {
    return props.componentData.goodsSource !== 'goodsGroup'
      ? props.componentData.goodsData.length > 0
        ? props.componentData.goodsData
        : 3
      : goodList.value.length > 0
      ? goodList.value
      : props.componentData.goodsNum > 3
      ? 3
      : props.componentData.goodsNum
  }
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.overWidth {
  width: 100%;
  overflow-x: auto;
}
.good_box {
  width: 100%;
  .good_img_box {
    position: relative;
  }
  .good_img {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    background-position: 50%;
    background-repeat: no-repeat;
  }
}
.good_content {
  padding: 12px 6px 12px;
  .good_title {
    font-size: 12px;
    font-weight: 400;
    color: #333333;
    line-height: 17px;
  }
  .good_price {
    font-size: 14px;
    font-weight: 500;
    color: #fc254a;
    line-height: 25px;
    white-space: nowrap;
    span {
      text-decoration: line-through;
      color: #babbbc;
      // font-size: 10px;
    }
  }
  .one_con + .one_con {
    margin-top: 4px;
  }
}
.round {
  border-radius: 5px;
  overflow: hidden;
}
// 列表样式
.big {
  .one_good {
    width: 100%;
  }
}
.two {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  flex-wrap: wrap;
  .one_box {
    width: 50%;
  }
}
.three {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  flex-wrap: wrap;
  .one_box {
    width: 33.33%;
  }
}
.list {
  .one_box {
    .one_good {
      display: flex;
      flex-direction: revert;
      justify-content: flex-start;
      align-items: center;
      height: 111px;
      .good_img_box {
        width: 111px;
        height: 111px;
        padding: 0 !important;
      }
      .good_content {
        width: calc(100% - 111px);
        height: 111px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        padding: 12px;
        .good_title,
        .good_price {
          width: 100%;
        }
        .line-hidden1 {
          word-break: break-all;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          white-space: inherit;
        }
      }
    }
  }
}
.hybrid {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  flex-wrap: wrap;
  .one_box {
    width: 100%;
  }
  .one_box:nth-child(3n + 2),
  .one_box:nth-child(3n + 3) {
    width: 50%;
  }
}
.swipe {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .one_good {
    width: 130px;
  }
}
//  商品样式
.none {
  background: #fff;
}
.shadow {
  background: #fff;
  box-shadow: 0px 4px 6px 0px rgba(95, 104, 147, 0.1);
}
.stroke {
  border: 1px solid #e7eaee;
  background: #fff;
}
.transparent {
  background: transparent;
}
</style>

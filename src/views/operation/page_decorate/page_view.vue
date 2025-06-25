<template>
  <div class="phone_view_wrapper">
    <!-- {{ props.pageInfo }} -->
    <div
      class="phone_view"
      :style="{
        backgroundColor: props.pageInfo.info ? props.pageInfo.info.backgroundColor : ''
      }"
    >
      <template v-if="props.pageInfo.nav">
        <template v-if="props.pageInfo.nav.pageStyle == 'tmall'">
          <div class="page_back">
            <img
              class="page_back_img"
              v-if="props.pageInfo.nav.backImg"
              :src="props.pageInfo.nav.backImg"
              alt=""
            />
            <img
              class="page_back_icon"
              v-else
              src="@/assets/images/operate/default_img_icon.png"
              alt=""
            />
            <div class="page_back_zhe"></div>
            <div class="page_back_search">
              <div class="search_box search_start" style="width: 205px">
                <el-icon><i-search /></el-icon>
                搜索商品
              </div>
            </div>
          </div>
        </template>
        <div
          v-else
          class="page_header_back"
          :style="{
            backgroundColor: props.pageInfo.nav.backgroundColor
          }"
        ></div>
      </template>

      <img
        v-if="props.pageInfo.nav && props.pageInfo.nav.pageStyle == 'tmall'"
        class="phone_header"
        src="@/assets/images/diy/phone_header_white.png"
        alt=""
      />
      <img v-else class="phone_header" src="@/assets/images/diy/phone_header.png" alt="" />
      <template v-if="props.pageInfo.nav && props.pageInfo.nav.pageStyle == 'normal'">
        <div class="page_header">
          <!-- 搜索和商品都有 -->
          <template v-if="props.pageInfo.nav.showTitle && props.pageInfo.nav.showSearch">
            <!-- 搜索居左 -->
            <!-- <template v-if="props.pageInfo.nav.position == 'left'"> -->
            <div :class="props.pageInfo.nav.position == 'left' ? 'both_left' : 'both_center'">
              <div class="search_box search_center">
                <el-icon><i-search /></el-icon>
                搜索商品
              </div>
            </div>
            <div :class="props.pageInfo.nav.position == 'left' ? 'both_center' : 'both_left'">
              <div
                class="title line-hidden1"
                :style="{
                  color:
                    props.pageInfo.nav && props.pageInfo.nav.pageStyle == 'normal'
                      ? props.pageInfo.nav.color
                      : '#fff',
                  fontSize:
                    props.pageInfo.nav && props.pageInfo.nav.pageStyle == 'normal'
                      ? props.pageInfo.nav.fontSize + 'px'
                      : '14px'
                }"
              >
                {{ props.pageInfo.info ? props.pageInfo.info.title : '' }}
              </div>
            </div>
            <!-- </template> -->
          </template>

          <!-- 搜索和商品二选一 -->
          <template v-else>
            <div
              :class="{
                header_center:
                  (props.pageInfo.nav.showSearch && props.pageInfo.nav.position == 'center') ||
                  props.pageInfo.nav.showTitle,
                header_left: props.pageInfo.nav.showSearch && props.pageInfo.nav.position == 'left'
              }"
            >
              <div
                class="search_box search_start"
                style="width: 160px"
                v-if="props.pageInfo.nav.showSearch"
              >
                <el-icon><i-search /></el-icon>
                搜索商品
              </div>

              <div
                v-if="props.pageInfo.nav.showTitle"
                class="title line-hidden1"
                :style="{
                  color:
                    props.pageInfo.nav && props.pageInfo.nav.pageStyle == 'normal'
                      ? props.pageInfo.nav.color
                      : '#fff',
                  fontSize:
                    props.pageInfo.nav && props.pageInfo.nav.pageStyle == 'normal'
                      ? props.pageInfo.nav.fontSize + 'px'
                      : '14px'
                }"
              >
                {{ props.pageInfo.info ? props.pageInfo.info.title : '' }}
              </div>
            </div>
          </template>
        </div>
      </template>
      <div style="width: 100%; height: 80px"></div>
      <!-- 品牌号 -->
      <div class="brand_box" v-if="props.pageInfo.info ? props.pageInfo.info.follow : false">
        <div class="brand_left">
          <img :src="brandInfo.img" alt="" />
          <div class="brand_info">
            <div>{{ brandInfo.title || '' }}</div>
            <div>{{ brandInfo.fans || 0 }}位粉丝数</div>
          </div>
        </div>
        <div class="brand_right">关注</div>
      </div>
      <draggable
        v-model="list"
        group="page_view"
        @start="drag = true"
        @end="end"
        item-key="type"
        :disabled="disabled"
      >
        <template #item="{ element, index }">
          <div
            class="com_wrapper"
            :class="{ active: props.current === element, disabled }"
            @click="toggleCom(element)"
          >
            <component :is="element.content" :componentData="element.data.params" />
            <div class="com_card">
              <span class="name">{{ element.data.name }}</span>
              <span class="del" @click.stop="delCom(index)">
                {{ disabled ? element.data.name : '删除' }}
              </span>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
defineComponent(draggable)
const drag = ref(true)

const props = defineProps({
  data: { type: Array, default: () => [] }, // 组件列表
  current: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false }, // 禁用
  pageInfo: {
    type: Object,
    default: () => {
      return {
        info: {}
      }
    }
  } // 页面设置
})
const emits = defineEmits(['change', 'del', 'update:data'])
const list = ref([])

watch(
  () => props.data,
  (val, oldVal) => {
    list.value = val
  },
  { immediate: true }
)
// 切换选中的组件
const toggleCom = ele => {
  emits('change', ele)
}
// 删除组件
const delCom = index => {
  emits('del', index)
}
// 拖拽结束
const end = () => {
  drag.value = false
  emits('update:data', list.value)
}

// 品牌好信息
const brandInfo = ref({
  img: '',
  title: JSON.parse(localStorage.getItem('brandInfo')).brandName,
  fans: 0
})
</script>

<style lang="scss" scoped>
div::-webkit-scrollbar {
  width: 0;
}
.phone_view_wrapper {
  overflow: auto;
  height: 100%;
  /*修改滚动条样式*/
}
.phone_view {
  position: relative;
  margin: 0 auto;
  width: 375px;
  min-height: 701px;
  background: #f8f9fa;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
  .phone_header {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
  .com_wrapper {
    position: relative;
    // margin-bottom: 12px;
    border: 1px solid transparent;
    &.active {
      border: 1px solid #364fcd;
      &:hover {
        border: 1px solid #364fcd;
      }
    }
    &:hover {
      border: 1px dashed #364fcd;
      cursor: move;
      .com_card {
        padding: 0;
        > .name {
          display: none;
        }
        > .del {
          padding: 4px 6px;
          display: block;
        }
      }
    }
    &.disabled {
      &:hover {
        cursor: default;
      }
    }
    .com_card {
      cursor: pointer;
      position: absolute;
      right: -85px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 9;
      font-size: 12px;
      text-align: center;
      font-family: PingFangSC-Regular, PingFang SC;
      color: #303133;
      line-height: 17px;
      width: 70px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0px 4px 8px 0px rgba(95, 104, 147, 0.1);
      padding: 4px 0;
      &:before {
        content: '';
        left: -4px;
        transform: translate(-50%, -50%);
        top: 50%;
        position: absolute;
        border-top: 4px solid transparent;
        border-right: 10px solid #fff;
        border-bottom: 4px solid transparent;
        border-style: solid;
        border-left: 0 solid black;
      }
      &:hover {
        padding: 0;
      }
      > .del {
        display: none;
      }
    }
  }
}
.page_back {
  width: 100%;
  height: 270px;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: #a0a9be;
  // background: linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, #364fcd 100%);
  .page_back_img {
    width: 100%;

    height: 270px;
    display: flex;
  }
  .page_back_icon {
    width: 48px;
    height: 48px;
    object-fit: cover;
  }
  .page_back_zhe {
    width: 100%;

    height: 270px;

    position: absolute;
    left: 0;
    top: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, #ffffff 100%);
  }

  .page_back_search {
    // width: 100%;

    height: 40px;

    position: absolute;
    left: 0;
    top: 40px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding-left: 16px;
    align-items: center;
  }
}
.page_header_back {
  width: 100%;
  height: 80px;
  position: absolute;
  left: 0;
  top: 0;
}
.page_header {
  position: absolute;
  left: 0;
  top: 40px;
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .header_center {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .title {
      width: 180px;
    }
  }
  .header_left {
    width: 100%;
    padding-left: 16px;
  }
  .both_left {
    width: 104px;
    height: 40px;
    position: absolute;
    left: 16px;
    top: 0px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .both_center {
    width: 103px;
    height: 40px;
    position: absolute;
    left: 136px;
    top: 0px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .title {
    height: 40px;
    width: 100%;
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    line-height: 40px;
    color: #ffffff;
  }
}

.search_box {
  width: 98px;
  height: 27px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  line-height: 27px;
  font-size: 12px;
  font-weight: 400;
  color: #fff;
  text-align: center;
  .el-icon {
    margin-right: 4px;
  }
}
.search_start {
  padding-left: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.search_center {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.brand_box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 69px;
  .brand_left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: calc(100% - 64px);
    height: 40px;
    img {
      width: 40px;
      height: 40px;
      object-fit: cover;
      display: flex;
    }
    .brand_info {
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
      line-height: 17px;
      width: calc(100% - 16px);
      div + div {
        margin-top: 5px;
      }
    }
  }
  .brand_right {
    width: 64px;
    height: 25px;
    border-radius: 16px;
    border: 1px solid #ffffff;
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
    line-height: 25px;
    text-align: center;
  }
}
</style>

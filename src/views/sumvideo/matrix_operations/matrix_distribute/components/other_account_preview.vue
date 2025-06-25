<template>
  <el-dialog
    append-to-body
    v-model="info.show"
    custom-class="hide_footer_line info_dialog"
    title="运营矩阵号"
    width="300px"
    @close="close"
  >
    <div class="photos_dialog" v-if="!props.infinite">
      <div class="photo_item" v-for="(item, index) in info.list" :key="item.operatorId || index">
        <div :class="{ g_failure: isInvalid(item) }" style="position: relative" class="big">
          <img :src="item.dyHeadUrl || item.headUrl" alt />
          <div
            :class="[`xm_platformIcon_${item.platform}`]"
            style="width: 20px; height: 20px"
          ></div>
        </div>
        <span style="margin-left: 16px">{{ item.dyNickname || item.nickname }}</span>
      </div>
    </div>

    <div
      class="photos_dialog"
      v-else
      :infinite-scroll-delay="500"
      v-infinite-scroll="loadFun"
      :infinite-scroll-distance="50"
      :infinite-scroll-immediate="false"
      :infinite-scroll-disabled="info.page.total <= info.list.length"
    >
      <div class="photo_item" v-for="(item, index) in info.list" :key="item.operatorId || index">
        <div :class="{ g_failure: isInvalid(item) }" style="position: relative" class="big">
          <img :src="item.dyHeadUrl || item.headUrl" alt />
          <div
            :class="[`xm_platformIcon_${item.platform}`]"
            style="width: 20px; height: 20px"
          ></div>
        </div>
        <span style="margin-left: 16px">{{ item.dyNickname || item.nickname }}</span>
      </div>
      <!-- 提示 -->
      <div class="loading_library" v-if="info.list && info.list.length > 0">
        <img src="/public/loading.gif" v-if="info.loading && info.page.index > 1" alt="" />
        {{
          info.loading
            ? info.page.index === 1
              ? ''
              : '加载中...'
            : info.list.length >= info.page.total
            ? '已经到底了~'
            : '上拉加载更多~'
        }}
      </div>
    </div>
    <div class="loading_warp" v-loading="info.loading"></div>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        list: [],
        show: false
      }
    }
  },
  infinite: {
    type: Boolean,
    default: false // 是否支持滚动到底获取数据
  },
  origin: {
    type: String,
    default: '' // qrcodePublish 二维码发布过来的
  }
})
const { info } = toRefs(props)
const emits = defineEmits(['close', 'getList'])
// 矩阵号是否授权有效
const isInvalid = item => {
  if (props.origin && props.origin === 'qrcodePublish') {
    return false
  } else {
    // 0 有效 1无效 非0都为无效
    return item.isDel !== 0
  }
}
function close() {
  emits('close')
}
function loadFun() {
  console.log('触发到底')
  emits('getList')
}
</script>

<style lang="scss" scoped>
.loading_library {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
  img {
    height: 25px;
    margin-right: 4px;
  }
}
.photos_dialog {
  display: flex;
  flex-direction: column;
  height: 364px;
  overflow-y: auto;
  padding: 22px 24px;

  .photo_item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    position: relative;
    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
  }
}
.loading_warp {
  height: 364px;
  width: 100%;
  position: absolute;
  top: 52px;
  left: 0;
  z-index: -1;
}
</style>

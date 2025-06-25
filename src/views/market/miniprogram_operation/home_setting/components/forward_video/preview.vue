<template>
  <div
    :class="[
      'one_preview',
      'forward_video_preview',
      props.data.err ? 'err_preview' : '',
      props.chooseTab === 'current_version_recommend' ? 'choose_preview' : ''
    ]"
    v-if="list.length > 0"
  >
    <div class="preview_title">
      <img
        class="title_img"
        v-if="props.data && props.data.defaultTitle"
        :src="props.data.defaultTitle"
        alt=""
      />
    </div>
    <div class="list_video_warp">
      <div class="video_item" v-for="(item, index) in list" :key="index">
        <img :src="item.coverUrl" alt="" class="cover" />
      </div>
    </div>

    <div class="tip" v-if="list.length >= 6">预览效果只显示前6条视频</div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    data() {
      return {}
    }
  },
  chooseTab: {
    type: String,
    default: ''
  },
  somePreviewInfo: {
    type: Object,
    default: () => {
      return {
        followVideoList: []
      }
    }
  }
})

const list = computed(() => {
  let list = props.somePreviewInfo.followVideoList || []
  if (list.length > 6) {
    list = list.slice(0, 6)
  }
  return list
})
</script>

<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';

.forward_video_preview {
  margin-top: 12px;
  border-radius: 12px;
  .list_video_warp {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 12px;
    background: #fff;
    .video_item {
      width: 159px;
      height: 264px;
      margin-bottom: 9px;
      border-radius: 8px;
      .cover {
        border-radius: 8px;
        width: 100%;
        height: 100%;
        display: flex;
        object-fit: cover;
      }
    }
  }
  .tip {
    text-align: center;
    background: #fff;
    color: #909399;
    border-radius: 0 0 12px 12px;
    font-size: 12px;
    padding: 7px 0 16px 0;
  }
}
</style>

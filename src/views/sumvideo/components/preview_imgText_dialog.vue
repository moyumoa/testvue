<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="xm_element_dialog"
    destroy-on-close
    v-model="show"
    width="560px"
    title="图文详情"
  >
    <div class="dialog_content">
      <div class="content_left">
        <el-image
          class="left_img"
          :src="urlList[imgIndex]"
          fit="contain"
          :preview-src-list="urlList"
          :initial-index="imgIndex"
        >
          <template #placeholder>
            <div class="image_placeholder_loading">
              <div class="image_placeholder_icon"></div>
            </div>
          </template>
        </el-image>

        <div class="left_change">
          <img
            v-if="imgIndex > 0"
            @click="changeImg(2)"
            class="change_icon change_icon_active"
            src="https://tagvv-1256030678.file.myqcloud.com/20240914ptdvg.png"
            alt=""
          />
          <img
            v-else
            class="change_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240914t8sth.png"
            alt=""
          />
          <div class="change_num">{{ imgIndex + 1 }}/{{ urlList.length }}</div>
          <img
            v-if="imgIndex < urlList.length - 1"
            @click="changeImg(1)"
            class="change_icon change_icon_active"
            src="https://tagvv-1256030678.file.myqcloud.com/20240914yusou.png"
            alt=""
          />
          <img
            v-else
            class="change_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240914ir3n7.png"
            alt=""
          />
        </div>
      </div>
      <div
        class="content_right"
        v-if="
          title ||
          desc ||
          (mount && mount.dyTopic && mount.dyTopic.length > 0) ||
          (mount && mount.xhsTopic && mount.xhsTopic.length > 0) ||
          (mount && mount.xhsAt && mount.xhsAt.length > 0)
        "
      >
        <div class="title">{{ title || '' }}</div>
        <div class="desc">
          {{ desc || '' }}
          <div class="content_mount">
            <template v-if="mount && mount.dyTopic && mount.dyTopic.length > 0">
              <span v-for="(a, b) in mount.dyTopic" :key="b">#{{ a.name }}</span>
            </template>
            <template v-if="mount && mount.xhsTopic && mount.xhsTopic.length > 0">
              <span v-for="(a, b) in mount.xhsTopic" :key="b">#{{ a.name }}</span>
            </template>
            <template v-if="mount && mount.xhsAt && mount.xhsAt.length > 0">
              <span v-for="(a, b) in mount.xhsAt" :key="b">@{{ a.name }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools'

const props = defineProps({
  previewDialog: {
    type: Object,
    default: () => {
      return {
        title: '', // 弹窗标题
        desc: '',
        mount: {},
        show: false, // 是否显示弹窗
        urlList: [] //
      }
    },
    required: true
  }
})

const { show, title, desc, mount, urlList } = toRefs(props.previewDialog)
const imgIndex = ref(0)
// 切换图片
const changeImg = throttle(e => {
  console.log('changeImg', imgIndex.value, e)
  if (e === 1) {
    // 下一张
    if (imgIndex.value <= urlList.value.length - 1) {
      imgIndex.value += 1
    }
  } else {
    // 上一张
    if (imgIndex.value >= 1) {
      imgIndex.value -= 1
    }
  }
}, 300)
</script>
<style lang="scss" scoped>
.dialog_content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  .content_left {
    width: 192px;
    .left_img {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 192px;
      height: 256px;
      border-radius: 4px;
      background: #f2f3f5;
      img {
        border-radius: 4px;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: flex;
      }
    }
    .left_change {
      margin-top: 14px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .change_icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
        display: flex;
        cursor: not-allowed;
      }
      .change_icon_active:hover {
        background: rgba(54, 79, 205, 0.1);
        border-radius: 100%;
      }
      .change_icon_active {
        cursor: pointer;
      }
      .change_num {
        width: 120px;

        font-weight: 400;
        font-size: 14px;
        color: #606266;
        line-height: 20px;
        text-align: center;
      }
    }
  }
  .content_right {
    height: 294px;
    overflow-y: auto;
    margin-left: 20px;
    width: calc(100% - 212px);
    .title {
      font-weight: 600;
      font-size: 16px;
      color: #323233;
      line-height: 22px;
      word-break: break-all;
    }
    .desc {
      font-weight: 400;
      font-size: 14px;
      color: #606266;
      line-height: 20px;
      word-break: break-all;
    }
    .title + .desc {
      margin-top: 4px;
    }
  }
}

:deep(.el-image__inner) {
  border-radius: 4px;
}
.content_mount {
  span {
    margin-right: 4px;
    color: #364fcd;
  }
}
</style>

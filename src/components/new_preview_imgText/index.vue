<template>
  <div>
    <el-dialog
      :close-on-click-modal="false"
      ref="dialog"
      custom-class="xm_preview_dialog"
      destroy-on-close
      v-model="show"
      :width="showText ? '960px' : '672px'"
    >
      <!-- 关闭按钮 -->
      <img
        src="https://tagvv-1256030678.file.myqcloud.com/20250427j1lzt.png"
        class="dialog_close"
        @click.stop="closeFun"
      />
      <div class="dialog_container">
        <div class="container_left">
          <div class="left_img_box">
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
          </div>
          <template v-if="urlList.length > 1">
            <!-- 上一张 -->
            <div
              :class="{ pre_img: true, active_img: imgIndex > 0, dis_img: imgIndex == 0 }"
              @click="changeImg(2)"
            >
              <img src="https://tagvv-1256030678.file.myqcloud.com/202504276tq6n.png" />
            </div>

            <!-- 下一张 -->
            <div
              :class="{
                next_img: true,
                active_img: imgIndex < urlList.length - 1,
                dis_img: imgIndex == urlList.length - 1
              }"
              @click="changeImg(1)"
            >
              <img src="https://tagvv-1256030678.file.myqcloud.com/20250427w5ojd.png" />
            </div>

            <!-- 总数 -->
            <div class="change_num">{{ imgIndex + 1 }}/{{ urlList.length }}</div>
          </template>
        </div>
        <div class="container_right" v-if="showText">
          <div class="right1" v-if="info.videoTitle">{{ info.videoTitle || '' }}</div>
          <div class="right2" v-if="info.videoCopywriting" v-html="info.videoCopywriting"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { isNotEmpty, throttle } from '@/utils/tools'
const props = defineProps({
  showText: Boolean, // 是否显示右侧的标题正文
  imgDialog: {
    type: Object,
    default: () => {
      return {
        info: null,
        show: true // 是否显示弹窗
      }
    }
  }
})
const show = toRef(props.imgDialog, 'show')
const info = toRef(props.imgDialog, 'info')
const { showText } = toRefs(props)
const urlList = ref([])
const imgIndex = ref(0)
// 切换图片
const changeImg = throttle(e => {
  console.log('changeImg', imgIndex.value, e)
  if (e === 1) {
    // 下一张
    if (imgIndex.value < urlList.value.length - 1) {
      imgIndex.value += 1
    }
  } else {
    // 上一张
    if (imgIndex.value >= 1) {
      imgIndex.value -= 1
    }
  }
}, 300)
onMounted(() => {
  if (props.imgDialog.info) {
    console.log('xxxxx', props.imgDialog.info, props.imgDialog.info.pictures)
    urlList.value = isNotEmpty(props.imgDialog.info.pictures)
      ? props.imgDialog.info.pictures.map(x => x.url)
      : []
  }
})
const dialog = ref()
const closeFun = throttle(() => {
  dialog.value.handleClose()
}, 300)
</script>
<style lang="scss" scoped>
.dialog_container {
  height: 672px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  border-radius: 8px;
  align-items: flex-start;
  background: #f7f8fa;
  .container_left {
    flex-shrink: 0;
    height: 100%;
    position: relative;
    .left_img_box {
      width: 640px;
      height: 640px;
      margin: 16px;
    }
    .left_img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      display: flex;
    }

    .change_num {
      position: absolute;
      bottom: 28px;
      right: 50%;
      transform: translateX(50%);
      width: max-content;
      padding: 1px 6px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      font-weight: 600;
      font-size: 12px;
      color: #ffffff;
      line-height: 18px;
    }
    .pre_img {
      width: 48px;
      height: 48px;
      display: flex;
      border-radius: 100%;
      position: absolute;
      left: 36px;
      top: calc((100% - 48px) / 2);
      background: rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        display: flex;
        width: 36px;
        height: 36px;
        display: flex;
        object-fit: contain;
      }
    }
    .next_img {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      right: 36px;
      top: calc((100% - 48px) / 2);
      width: 48px;
      height: 48px;
      display: flex;
      border-radius: 100%;
      background: rgba(0, 0, 0, 0.1);
      img {
        display: flex;
        width: 36px;
        height: 36px;
        display: flex;
        object-fit: contain;
      }
    }
    .active_img {
      cursor: pointer;
      &:hover {
        background: rgba(0, 0, 0, 0.2);
      }
    }
    .dis_img {
      cursor: not-allowed;
    }
  }
  .container_right {
    border-radius: 8px;
    background: #fff;
    width: 280px;
    margin: 8px 8px 8px 0;
    height: 656px;
    padding: 16px 20px;
    overflow-y: auto;
    .right1 {
      font-weight: 600;
      font-size: 18px;
      color: #303133;
      line-height: 25px;
    }
    .right1 + .right2 {
      margin-top: 4px;
    }
    .right2 {
      white-space: pre-wrap;
      font-weight: 400;
      font-size: 16px;
      color: #303133;
      line-height: 22px;
    }
  }
}
.dialog_close {
  cursor: pointer;
  position: absolute;
  top: -20px;
  right: -52px;
  width: 32px;
  height: 32px;
  display: flex;
}
:deep(.el-overlay) {
  background: rgba(0, 0, 0, 0.4);
}
</style>

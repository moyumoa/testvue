<template>
  <el-dialog
    ref="dialog"
    append-to-body
    destroy-on-close
    title="图文详情"
    width="569px"
    v-model="show"
    custom-class="rule_setting_dialog show_header_line"
  >
    <div class="preview_box">
      <div class="top_box">
        <div class="preview_title">{{ info.videoTitle || info.title || info.name || '--' }}</div>
        <div class="preview_mark" v-if="info.description || info.videoDesc">
          {{ info.description || info.videoDesc || '' }}
        </div>
      </div>
      <template v-if="imgList && imgList.length > 0">
        <div class="preview_imgBox">
          <img
            @click="backFun"
            :class="{ img_btn: true, dis_btn: chooseIndex == 0 }"
            src="https://tagvv-1256030678.file.myqcloud.com/20230921alhey.png"
            alt=""
          />

          <div class="img_center">
            <!-- <img :src="imgList[chooseIndex]" @load="imgLoad" alt="" /> -->
            <el-image class="one_img" :src="imgList[chooseIndex]" fit="contain">
              <template #placeholder>
                <div class="image-slot" v-loading="true">
                  <!-- Loading
                  <span class="dot">...</span> -->
                </div>
              </template>
            </el-image>
          </div>

          <img
            @click="toFun"
            :class="{ img_btn: true, dis_btn: chooseIndex == imgList.length - 1 }"
            src="https://tagvv-1256030678.file.myqcloud.com/202309218cphg.png"
            alt=""
          />
        </div>
        <div class="preview_num">{{ chooseIndex + 1 }}/{{ imgList.length }}</div>
      </template>
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
        show: false, // 是否显示弹窗
        info: ''
      }
    },
    required: true
  }
})
const chooseIndex = ref(0) // 当前选中第几个
const imgList = ref([])
const { show, info } = toRefs(props.previewDialog)
onMounted(() => {
  chooseIndex.value = 0
  if (props.previewDialog.info) {
    const info = JSON.parse(JSON.stringify(props.previewDialog.info))
    const list = []
    const pictures = info.pictures ? JSON.parse(info.pictures) : []
    if (pictures && pictures.length > 0) {
      pictures.forEach(x => {
        if (x.url && x.url) {
          list.push(x.url)
        } else if (x.urlList && x.urlList.length > 0) {
          list.push(x.urlList[0])
        }
      })
    }
    imgList.value = list
  }
})
const backFun = throttle(() => {
  if (chooseIndex.value > 0) {
    chooseIndex.value = chooseIndex.value - 1
  }
}, 300)
const toFun = throttle(() => {
  if (chooseIndex.value < imgList.value.length - 1) {
    chooseIndex.value = chooseIndex.value + 1
  }
}, 300)

// function imgLoad(e) {
//   console.log('imgLoad', e)
// }
</script>
<style lang="scss" scoped>
.preview_box {
  padding: 16px;
  max-height: calc(85vh - 120px);
  overflow-y: auto;
}
.preview_title {
  font-size: 16px;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
}
.preview_mark {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 400;
  color: #606266;
  line-height: 20px;
}
.preview_imgBox {
  padding: 16px 0px 12px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .img_btn {
    width: 36px;
    height: 36px;
    cursor: pointer;
    object-fit: contain;
  }
  .dis_btn {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .img_center {
    margin: 0 24px;
    width: 400px;
    height: 400px;
    overflow: hidden;
    border-radius: 2px;
    img,
    .one_img {
      display: flex;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
.preview_num {
  width: 100%;
  text-align: center;

  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
}
// .top_box{
//   width: 100%;
//   max-height: 100px;
//   overflow-y: auto;
// }
//
.image-slot {
  position: absolute;
  left: 0;
  height: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>

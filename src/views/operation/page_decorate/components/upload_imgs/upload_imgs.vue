<template>
  <div>
    <div class="add_box">
      <div class="" v-if="props.templateStyle != '3' && imgList.length > 0">
        <draggable v-model="imgList" group="upload_img1" item-key="id" animation="300">
          <template #item="{ element, index }">
            <div class="one_box">
              <template
                v-if="
                  (props.type == 'image_nav' && props.templateStyle == '1') ||
                  props.type != 'image_nav'
                "
              >
                <div class="one_image" v-if="element.imgurl">
                  <img :src="element.imgurl" class="img_cover" alt="" />
                  <div class="img_mark" @click="showUploadFun(1, index)">更换图片</div>
                </div>
                <div class="one_image none_image" v-else @click="showUploadFun(1, index)">
                  <el-icon style="font-size: 14px; margin-bottom: 6px" class="icon_mark">
                    <i-plus />
                  </el-icon>
                  <p>添加图片</p>
                </div>
              </template>
              <div
                class="one_box_content"
                :style="
                  (props.type == 'image_nav' && props.templateStyle == '1') ||
                  props.type != 'image_nav'
                    ? ''
                    : 'width:100%'
                "
              >
                <div class="content_one">
                  <p>标题</p>
                  <el-input
                    clearable
                    placeholder="建议10个字以内"
                    style="width: calc(100% - 44px)"
                    v-model="element.name"
                  ></el-input>
                </div>
                <div class="content_one">
                  <p>链接</p>
                  <template v-if="element.link">
                    <div class="choose_link">
                      <div class="choose_link_text line-hidden1" @click="showModalFun(index)">
                        {{ element.link.label || '--' }}
                      </div>
                      <div class="choose_link_icon">
                        <el-icon @click="clearLink(index)"><i-close /></el-icon>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <el-link type="primary" @click="showModalFun(index)">设置链接</el-link>
                  </template>
                </div>
              </div>
              <el-icon class="close_box" @click="delFun(index)">
                <i-circle-close-filled />
              </el-icon>
            </div>
          </template>
        </draggable>
      </div>
      <div class="area_box" v-else>
        <draggable v-model="imgList" group="upload_img2" item-key="id" animation="300">
          <template #item="{ element, index }">
            <div class="one_area">
              <img class="area_img" :src="element.imgurl" alt="" />
              <div class="img_mark" @click="showUploadFun(1, index)">更换图片</div>
            </div>
          </template>
        </draggable>
      </div>
      <div class="one_upload" @click="showUploadFun" v-if="imgList.length < 10">
        <div class="text1">
          <el-icon class="icon_mark"><i-plus /></el-icon>
          {{
            props.type == 'image_nav' ? '添加导航' : props.type == 'image_ads' ? '添加广告图' : ''
          }}
        </div>
        <div v-if="props.type == 'image_ads'">最多添加10个广告图可拖动调整顺序</div>
        <div v-if="props.type == 'image_ads'">建议宽度750像素，广告高度由上传图片决定</div>
        <div v-if="props.type == 'image_nav'">最多添加10个，可拖动调整顺序</div>
      </div>
      <div></div>
    </div>
    <uploadModal v-if="uploadForm.show" :uploadModal="uploadForm" @upImg="upImg"></uploadModal>
    <chooseModal v-if="modal.show" :modal="modal" @upLink="upLink"></chooseModal>
  </div>
</template>
<script setup>
import draggable from 'vuedraggable'
import chooseModal from '@/views/operation/components/choose_modal/choose_modal.vue'
import uploadModal from '@/views/operation/components/upload_modal/upload_modal.vue'

defineComponent(draggable, uploadModal, chooseModal)
const props = defineProps({
  imgList: {
    type: Object,
    default: () => {
      return []
    }
  },
  templateStyle: {
    type: String,
    default: '1'
  },
  type: {
    type: String,
    default: ''
  }
})
const imgList = ref([])
function init() {
  imgList.value = props.imgList || []
}
init()
// 删除图文广告
function delFun(index) {
  imgList.value.splice(index, 1)
}
// 选择页面的弹窗
const modal = ref({
  show: false,
  index: null
})
function showModalFun(index) {
  modal.value.index = index
  modal.value.show = true
}
// 选中的链接
function upLink(e) {
  imgList.value[modal.value.index].link = e
}
function clearLink(index) {
  imgList.value[index].link = ''
}
// 选择图片的弹窗
const uploadForm = ref({
  show: false,
  chooseNum: null,
  type: '' // all//是直接往数组里加图片，1//是往第一个数据里更换图片
})
// 显示弹窗
function showUploadFun(num, index) {
  // 图文导航--模板为文字导航时直接添加，不需要显示弹窗
  if (props.type === 'image_nav' && props.templateStyle !== '1') {
    if (imgList.value.length < 10) {
      imgList.value.push({
        imgurl: '',
        link: '',
        name: ''
      })
    }
    return
  }
  uploadForm.value = {
    chooseNum: num === 1 ? 1 : 10 - imgList.value.length,
    type: num === 1 ? index : 'all',
    show: true
  }
}
// 更换图片
function upImg(e) {
  if (uploadForm.value.type === 'all') {
    e.forEach(x => {
      imgList.value.push({
        imgurl: x,
        link: '',
        name: ''
      })
    })
  } else {
    imgList.value[uploadForm.value.type].imgurl = e.slice(0, 1)[0]
  }
}

const emits = defineEmits(['update:imgList'])
watch(
  () => imgList.value,
  newVal => {
    emits('update:imgList', newVal)
  },
  { deep: true }
)
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
div {
  box-sizing: border-box;
}
.add_box {
  margin-top: 24px;
  padding: 16px;
  background: #f6f8fa;

  .one_box {
    position: relative;
    margin-bottom: 16px;
    padding: 16px;
    width: 100%;
    min-height: 100px;
    background: #ffffff;
    box-shadow: 0px 2px 4px 0px rgba(95, 104, 147, 0.1);
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .close_box {
      opacity: 0;
      cursor: pointer;
      position: absolute;
      right: -10px;
      top: -10px;
      color: #bbb;
      background: #fff;
      border-radius: 100%;
      font-size: 24px;
    }
    .none_image {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #364fcd;
      background: #f6f8fa;
      border-radius: 2px;
      border: 1px solid #364fcd;
      font-size: 10px;
      p {
        transform: scale(0.8);
      }
    }
    .one_image {
      width: 68px;
      height: 68px;
      margin-right: 24px;
      border-radius: 2px;
      border: 1px solid #364fcd;
      position: relative;
      .img_cover {
        width: 68px;
        height: 68px;
        border-radius: 2px;
        object-fit: cover;
        display: flex;
      }
    }
    .one_box_content {
      width: calc(100% - 92px);
      height: 68px;
      .content_one {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        p {
          margin-right: 16px;
          font-size: 14px;
          font-weight: 400;
          color: #333333;
          line-height: 20px;
        }
      }
      .content_one + .content_one {
        margin-top: 15px;
      }
    }
  }
  .one_box:hover {
    .close_box {
      opacity: 1;
    }
  }

  .one_upload {
    cursor: pointer;
    width: 100%;
    height: 90px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
    line-height: 17px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid #364fcd;
    .text1 {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      margin-bottom: 4px;
      color: #333333;
      line-height: 20px;
      .icon_mark {
        font-size: 16px;
        color: #364fcd;
        margin-right: 4px;
        font-weight: bold;
      }
    }
  }
  :deep(.choose_link) {
    max-width: calc(100% - 44px) !important;
  }
  :deep(.choose_link_text) {
    height: 22px !important;
    line-height: 21px !important;
    font-size: 12px !important;
  }
  :deep(.choose_link_icon) {
    height: 22px !important;
    font-size: 14px !important;
  }
}
.img_mark {
  cursor: pointer;
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 68px;
  height: 18px;
  background: rgba(29, 31, 37, 0.4);
  border-radius: 0px 0px 2px 2px;
  font-size: 10px;
  font-weight: 400;
  color: #ffffff;
  line-height: 14px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.area_box {
  width: 100%;
  .one_area {
    position: relative;
    width: 100%;
    .area_img {
      width: 100%;
      display: flex;
    }
    .img_mark {
      width: 100%;
      bottom: 0;
    }
  }
}
</style>

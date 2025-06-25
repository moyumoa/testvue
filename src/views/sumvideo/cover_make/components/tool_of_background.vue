<template>
  <div class="tool_page">
    <div class="tool_left flex_box">
      <div class="one_tool flex_box">
        <div class="tool_label">画布背景：</div>
        <div class="tool_content">
          <el-popover
            placement="bottom-start"
            :width="234"
            trigger="click"
            popper-class="tool_popver"
            :show-arrow="false"
            :offset="8"
          >
            <template #reference>
              <div class="canvasBack_tool tool_pointer">
                <!-- 图片背景 -->
                <template v-if="form && form.backgroundStyle && form.backgroundStyle.url">
                  <!-- 四张图 -->
                  <div
                    class="four_img"
                    v-if="
                      form &&
                      form.backgroundStyle &&
                      form.backgroundStyle.urlList &&
                      form.backgroundStyle.urlList.length == 4
                    "
                  >
                    <img
                      v-for="(item, index) in form.backgroundStyle.urlList"
                      :key="index"
                      class="one_back picture_back"
                      :src="item.url"
                      alt=""
                    />
                  </div>
                  <!-- 三张图 -->
                  <div
                    class="three_img"
                    v-else-if="
                      form &&
                      form.backgroundStyle &&
                      form.backgroundStyle.urlList &&
                      form.backgroundStyle.urlList.length == 3
                    "
                  >
                    <img
                      v-for="(item, index) in form.backgroundStyle.urlList"
                      :key="index"
                      class="one_back picture_back"
                      :src="item.url"
                      alt=""
                    />
                  </div>
                  <!-- 两张图 -->
                  <div
                    class="two_img"
                    v-else-if="
                      form &&
                      form.backgroundStyle &&
                      form.backgroundStyle.urlList &&
                      form.backgroundStyle.urlList.length == 2
                    "
                  >
                    <img
                      v-for="(item, index) in form.backgroundStyle.urlList"
                      :key="index"
                      class="one_back picture_back"
                      :src="item.url"
                      alt=""
                    />
                  </div>
                  <!-- 一张图 -->
                  <img
                    class="one_back picture_back"
                    v-else
                    :src="form.backgroundStyle.url"
                    alt=""
                  />
                </template>
                <!-- 透明背景 -->

                <img
                  v-else
                  class="one_back transparent_back"
                  src="https://tagvv-1256030678.file.myqcloud.com/20231023bfkad.png"
                  alt=""
                />
              </div>
            </template>
            <div
              class="canvasBack_box flex_box"
              :style="
                origin === 'cloud_cover_management' ? 'padding-bottom:12px' : 'padding-bottom:16px'
              "
            >
              <!-- 透明背景 -->
              <el-tooltip popper-class="tooltip-class" placement="bottom" content="透明背景">
                <div class="canvasBack_tool tool_pointer" @click="chooseTransparentFun">
                  <img
                    class="one_back transparent_back"
                    src="https://tagvv-1256030678.file.myqcloud.com/20231023bfkad.png"
                    alt=""
                  />
                </div>
              </el-tooltip>
              <!-- 图片背景 云封面支持1或4张背景图-->
              <div class="marginLeft20">
                <uploadImg
                  v-loading="uploadLoading"
                  ref="uploadRef"
                  origin="sumvideo"
                  :showLoading="true"
                  :index="0"
                  :limit="origin === 'cloud_cover_management' ? 4 : 1"
                  :multiple="origin === 'cloud_cover_management'"
                  @success="uploadImgSuccess"
                  :maxSize="maxSize"
                  :acceptTypeList="['image/jpeg', 'image/jpg', 'image/png']"
                  :commonErrTipInfo="uploadCommonErrTipInfo"
                >
                  <el-button>上传背景图</el-button>
                </uploadImg>
                <!-- <div class="tipp" v-if="origin === 'cloud_cover_management'">
                  请上传1张或4张背景图
                </div> -->
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
    <div class="tool_right"></div>
  </div>
</template>
<script setup>
import { save, batchSave } from '@/api/content_center/material_library.js'
import { throttle } from '@/utils/tools'
import uploadImg from '@/views/sumvideo/components/material/upload_material_dialog.vue'

const props = defineProps({
  origin: String, // 页面来源 cloud_cover_management 云封面管理
  form: {
    type: Object,
    default: () => {}
  },
  newForm: {
    type: Object,
    default: () => {}
  },
  canvasW: {
    type: Number,
    default: 375
  },
  canvasH: {
    type: Number,
    default: 666.666
  }
})

const { form, newForm, canvasW, canvasH, origin } = toRefs(props)
console.log('origin', origin.value)
const uploadCommonErrTipInfo = ref({
  maxSize: '每张图片不超过50M',
  type: '仅支持JPEG、JPG、PNG格式图片',
  limit: '每次最多选择4张图片'
})
const maxSize = ref(50 * 1024) // 背景图片最大50M
// 背景图片比例缩放，保持原有尺寸比例。但部分内容可能被剪切。 等同于css：object-fit:cover
function imgScaleConversion(w, h, canvasW, canvasH) {
  let width = null
  let height = null
  let x = 0
  let y = 0
  if (w > 0 && h > 0) {
    if (w / h < canvasW / canvasH) {
      width = canvasW
      height = (canvasW / w) * h
      x = -((width - canvasW) / 2)
      y = -((height - canvasH) / 2)
    } else {
      height = canvasH
      width = (canvasH / h) * w
      h = -((height - canvasH) / 2)
      x = -((width - canvasW) / 2)
    }
  }
  return {
    width,
    height,
    x,
    y
  }
}
const emits = defineEmits(['updateImgMaterial'])
// 上传封面成功
const uploadLoading = ref(false)
function uploadImgSuccess(e) {
  // 封面管理 是单选 只返回对象
  if (origin.value !== 'cloud_cover_management' && e && e.url) {
    uploadLoading.value = true
    save({ source: 10, type: 2, url: e.url })
      .then(res => {
        if (res.code === 0) {
          form.value.backgroundStyle = JSON.parse(JSON.stringify({}))
          emits('updateImgMaterial')
          const data = res.data || {}
          const whInfo = imgScaleConversion(data.wight, data.height, canvasW.value, canvasH.value)
          const param = {
            active: false,
            flip: '',
            height: whInfo.height,
            level: 0,
            locked: 0,
            tagvvMediaId: data.id,
            url: data.url,
            width: whInfo.width,
            x: whInfo.x,
            y: whInfo.y
          }
          nextTick(() => {
            form.value.backgroundStyle = JSON.parse(JSON.stringify(param))
            newForm.value.backgroundStyle = JSON.parse(JSON.stringify(param))
            uploadLoading.value = false
            newForm.value.backgroundSize = 1
          })
        } else {
          uploadLoading.value = false
        }
      })
      .catch(() => {
        uploadLoading.value = false
      })
  }
  // 云封面管理是多选，返回数组 如果小于四张，只取第一张 否则就是四张
  if (origin.value === 'cloud_cover_management' && e && e.length > 0) {
    uploadLoading.value = true
    const uploadList = e
    const params = []
    uploadList.forEach(x => {
      params.push({
        source: 10,
        type: 2,
        url: x.url
      })
    })
    batchSave(params)
      .then(res => {
        if (res.code === 0) {
          console.log('上传成功')
          const resData = res.data || []
          const params = {
            active: false,
            flip: '',
            height: 0,
            level: 0,
            locked: 0,
            tagvvMediaId: resData[0].id,
            url: resData[0].url,
            urlList: [],
            width: 0,
            x: 0,
            y: 0
          }
          // 一张直接取url 四张是取urlList里
          if (resData.length === 1) {
            const whInfo = imgScaleConversion(
              resData[0].wight,
              resData[0].height,
              canvasW.value,
              canvasH.value
            )
            params.width = whInfo.width
            params.height = whInfo.height
            params.x = whInfo.x
            params.y = whInfo.y
            params.tagvvMediaId = resData[0].id
            params.url = resData[0].url
          } else {
            // 四张图按照左上、右上、左下、右下顺序摆放，所以它的对应的宽高都是原始的一般
            resData.forEach((data, i) => {
              let whInfo = {}
              if (resData.length === 4) {
                whInfo = imgScaleConversion(
                  data.wight,
                  data.height,
                  canvasW.value / 2,
                  canvasH.value / 2
                )
              } else if (resData.length === 3) {
                whInfo = imgScaleConversion(
                  data.wight,
                  data.height,
                  canvasW.value,
                  canvasH.value / 3
                )
              } else if (resData.length === 2) {
                whInfo = imgScaleConversion(
                  data.wight,
                  data.height,
                  canvasW.value / 2,
                  canvasH.value
                )
              }
              params.urlList.push({
                height: whInfo.height,
                tagvvMediaId: data.id,
                url: data.url,
                width: whInfo.width,
                x: whInfo.x,
                y: whInfo.y
              })
            })
          }
          console.log('保存的数据', params)
          nextTick(() => {
            form.value.backgroundStyle = JSON.parse(JSON.stringify(params))
            newForm.value.backgroundStyle = JSON.parse(JSON.stringify(params))
            newForm.value.backgroundSize = resData.length
            uploadLoading.value = false
          })
        } else {
          uploadLoading.value = false
        }
      })
      .catch(() => {
        uploadLoading.value = false
      })
  }
}
// 选择透明背景
const chooseTransparentFun = throttle(() => {
  form.value.backgroundStyle = {}
  newForm.value.backgroundStyle = {}
  newForm.value.backgroundSize = 1
}, 300)
</script>
<style lang="scss" scoped>
@import '../scss/tool.scss';
.tipp {
  font-weight: 400;
  font-size: 12px;
  color: #909399;
  line-height: 18px;
  margin-top: 8px;
}

.four_img {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .one_back {
    width: 26px;
    height: 12px;
    object-fit: cover;
    display: flex;
  }
}
.three_img {
  .one_back {
    width: 52px;
    height: 8px;
    object-fit: cover;
    display: flex;
  }
}
.two_img {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .one_back {
    width: 26px;
    height: 24px;
    object-fit: cover;
    display: flex;
  }
}
</style>

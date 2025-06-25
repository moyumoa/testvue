<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="上传实拍图"
      width="560px"
      :before-close="onBeforeDialogClose"
      custom-class="xm_element_dialog"
    >
      <div class="dialog_content">
        <!-- 选择类型区域 -->
        <div class="choose_box">
          <el-radio-group v-model="type" @change="changeType">
            <el-radio :label="1">
              <div>上传需要替换人脸的模特实拍图、人台图</div>
              <div class="tip" v-if="type == 1">
                支持JPEG、JPG、PNG、WEBP格式图片，每次最多选择10张，每张不超过100M
              </div>
            </el-radio>
            <el-radio :label="2">
              <div>上传无需替换人脸的产品实拍图</div>
              <div class="tip" v-if="type == 2">
                支持JPEG、JPG、PNG、WEBP格式图片，每次最多选择10张，每张不超过100M
              </div>
            </el-radio>
          </el-radio-group>
        </div>
        <!-- 上传图片区域 -->
        <div class="upload_box">
          <div class="one_img" v-for="(item, index) in imgList" :key="index">
            <!-- :preview-src-list="[item]" -->
            <el-image class="img_cover" :src="item.url" alt fit="cover">
              <template #error>
                <div class="img_cover errImg_box"></div>
              </template>
            </el-image>

            <!-- 选择保留区域 要替换的才显示 如果有保留区域了就鼠标挪上去才显示 -->
            <div
              :class="{ img_choose: true, img_choose_opa: item.markUrl }"
              v-if="item.resizeSuccess && !item.loading"
              @click="showCanvasFun(item, index)"
            >
              选择商品区域
            </div>
            <!--  预处理失败          -->
            <div v-if="!item.resizeSuccess && !item.loading" class="mark_img">
              <img
                class="mark_img_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20241115pafhk.png"
                alt=""
              />
              <div class="mark_img_text">图片处理失败</div>
            </div>
            <!--  预处理loading          -->
            <div v-if="item.loading" class="mark_img">
              <img
                class="mark_img_icon mark_img_icon_animation"
                src="https://tagvv-1256030678.file.myqcloud.com/20241115aa5kh.png"
                alt=""
              />
              <div class="mark_img_text">图片处理中...</div>
            </div>
            <div class="img_del" @click="delImgFun(index)">
              <img src="https://tagvv-1256030678.file.myqcloud.com/2024032998kkl.png" alt="" />
            </div>
          </div>
          <div class="one_upload" v-loading="uploadLoading">
            <uploadMaterial
              ref="uploadRef"
              :showLoading="false"
              :imgMaxSize="102400"
              :index="1"
              :limit="10"
              :multiple="true"
              :newImageInfo="true"
              :acceptVideoImg="true"
              :imgRatio="uploadImgRatio"
              :imgRatioCompare="1"
              :imgResolution="uploadImgResolution"
              :imgResolutionCompare="3"
              :commonErrTipInfo="uploadCommonErrTipInfo"
              v-model:uploadLoading="uploadLoading"
              @success="uploadSuccessFun"
              @error="uploadErrFun"
              :acceptTypeList="acceptTypeList"
            >
              <div class="one_upload2">
                <el-icon class="icon-plus">
                  <i-plus />
                </el-icon>
                <div>上传图片</div>
              </div>
            </uploadMaterial>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog_footer">
          <div class="footer_left">
            已添加数量：
            <span>{{ imgList.length || 0 }}</span>
          </div>
          <div class="footer_right">
            <el-button :disabled="btnDis" @click="closeDialog">取消</el-button>
            <el-button
              type="primary"
              :disabled="submitDisabled"
              :loading="btnLoading"
              @click="handleConfirm"
            >
              确定
            </el-button>
          </div>
        </span>
      </template>
    </el-dialog>
    <shootCanvasDOM
      v-if="canvasDialog.show"
      :canvasDialog="canvasDialog"
      @updateFun="upateCanvasFun"
    />
  </div>
</template>
<script setup>
import {
  uploadShoot,
  submitInteractiveFullSegmentationAdvanceTask,
  resizeImg,
  webp2Png
} from '@/api/sumvideo/product_shooting_library'
import { ElMessageBox } from 'element-plus'
import shootCanvasDOM from './shoot_canvas_dialog.vue'
import uploadMaterial from '@/views/sumvideo/components/material/upload_material_dialog.vue'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools'

const dialog = ref()

const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        mannequinId: null, // 模特ID
        productId: null, // 商品ID
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const { show, mannequinId, productId } = toRefs(props.addDialog)

// --选择类型
const type = ref(1)

function changeType() {
  imgList.value = []
  uploadImgRatio.value = null
  uploadImgResolution.value = []
  acceptTypeList.value = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  uploadCommonErrTipInfo.value = {
    maxSize: '每张图片不超过100M',
    type: '仅支持JPEG、JPG、PNG、WEBP格式图片',
    imgRatio: '',
    imgResolution: '',
    limit: '每次最多选择10张图片'
  }
}

// --选择类型end
// -- 上传图片
const uploadLoading = ref(false)
const uploadCommonErrTipInfo = ref({
  maxSize: '每张图片不超过100M',
  type: '仅支持JPEG、JPG、PNG、WEBP格式图片',
  imgRatio: '每张图片分辨率不低于256×256像素且不超过4096×4096像素，长宽比大于1',
  imgResolution: '每张图片分辨率不低于256×256像素且不超过4096×4096像素，长宽比大于1',
  limit: '每次最多选择10张图片'
})
const uploadImgResolution = ref([])
const acceptTypeList = ref(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const uploadImgRatio = ref([])
const imgList = ref([])
watch(
  () => uploadLoading.value,
  val => {
    btnDis.value = val
  },
  {
    deep: true
  }
)
// 是否禁用提交按钮
const submitDisabled = computed(() => {
  let result = isEmpty(imgList.value) || btnDis.value

  // imgList 没有处理成功的图片
  result =
    result ||
    isEmpty(imgList.value.find(item => item?.resizeSuccess)) ||
    isNotEmpty(imgList.value.find(item => item?.loading)) // 有预处理的图片也不能提交

  return result
})

// 上传成功
function uploadSuccessFun(data) {
  console.log('上传成功', data)
  // if (type.value === 1) {
  preprocessImages(data)
  //   return
  // }
  // submitInteractiveFullSegmentationAdvanceTask(data)
  //   .then(res => {
  //     if (res.code === 0) {
  //       console.log('成功', data)
  //       ;(data || []).forEach(item => {
  //         imgList.value.push({
  //           url: item.url,
  //           width: item.width,
  //           height: item.height,
  //           markUrl: '', // 保留区域生成的二值图像
  //           indexList: [] // 需要保留区域的图片index
  //         })
  //       })
  //     }
  //     uploadLoading.value = false
  //   })
  //   .catch(() => {
  //     uploadLoading.value = false
  //   })
}
// webp转png
function webpToPngFun(webpUrl) {
  return new Promise((resolve, reject) => {
    if (type.value === 2 && webpUrl.indexOf('.webp') > -1) {
      webp2Png({
        urls: [webpUrl]
      })
        .then(res => {
          if (res.code === 0 && res.data && res.data.length > 0) {
            resolve(res.data[0].url)
          } else {
            reject(res)
          }
        })
        .catch(err => {
          reject(err)
        })
    } else {
      resolve(webpUrl)
    }
  })
}
// type === 1的时候预处理并且上传
const preprocessImages = data => {
  imgList.value = imgList.value.concat(
    data.map(item => {
      return {
        hasAlpha: item.hasAlpha,
        url: item.url,
        width: item.width,
        height: item.height,
        size: item.size,
        markUrl: '', // 保留区域生成的二值图像
        indexList: [], // 需要保留区域的图片index
        loading: true, // 处理中
        errMsg: null, // 处理失败的信息
        resizeSuccess: false, // 是否处理成功
        isNeedReplaceFace: type.value === 1 ? 1 : 0 // 是否需要替换人脸 0否 1是
      }
    })
  )
  uploadLoading.value = false
  data.forEach(item => {
    const indexx = imgList.value.findIndex(x => x.url === item.url)
    // 如果是物品实拍图，并且图片后缀名是.webp的，要先调接口转成png格式后，再进行后续处理
    webpToPngFun(item.url)
      .then(url => {
        item.url = url
        resizeImg({
          imageList: [item],
          scene: type.value === 1 ? 1 : 6
        })
          .then(res => {
            if (res.code === 0 && isNotEmpty(res?.data)) {
              const [data] = res?.data
              item.url = data.url
              imgList.value[indexx].errMsg = data?.errMsg
              imgList.value[indexx].oldUrl = imgList.value[indexx].url
              imgList.value[indexx].url = data.url
              imgList.value[indexx].resizeSuccess = data.resizeSuccess
              imgList.value[indexx].width = data.width
              imgList.value[indexx].height = data.height
              submitInteractiveFullSegmentationAdvanceTask([item]).then(res2 => {
                if (res2.code === 0) {
                  imgList.value[indexx].loading = false
                }
              })
            } else {
              imgList.value[indexx].resizeSuccess = false
              imgList.value[indexx].loading = false
            }
          })
          .catch(() => {
            imgList.value[indexx].resizeSuccess = false
            imgList.value[indexx].loading = false
          })
      })
      .catch(() => {
        imgList.value[indexx].resizeSuccess = false
        imgList.value[indexx].loading = false
      })
  })
}

// 本地上传失败
function uploadErrFun() {
  console.log('上传失败')
  uploadLoading.value = false
}

// function uploadImgSuccess(e, i, name) {
//   imgList.value.push(e)
// }
// 删除图片
const delImgFun = throttle(i => {
  imgList.value.splice(i, 1)
}, 700)

// -- 上传图片 end

function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}

const emits = defineEmits(['updateFun'])

const message = inject('$message')

// 弹窗的确定事件
const btnDis = ref(false) // 按钮是否禁用
const btnLoading = ref(false)
const handleConfirm = throttle(() => {
  if (btnLoading.value) return
  btnLoading.value = true
  if (isEmpty(imgList.value)) {
    btnLoading.value = false
    message.warning('请上传图片')
    return
  }
  // 如果是要替换的，检查是否有替换区域，没有就弹窗提示，并且不让他关闭
  // 上传非人像实拍图 ，针对其中png\webp格式的透明底图片 不做选区校验
  // if (type.value === 1) {
  const resizeSuccessList = imgList.value.filter(x => x.resizeSuccess)
  // const markList =.filter(x => x.markUrl)
  let resizeSuccessNum = 0
  resizeSuccessList.forEach(x => {
    if (x.markUrl) {
      resizeSuccessNum++
    } else if (
      type.value === 2 &&
      (x.url.indexOf('.png') > -1 || x.url.indexOf('.webp') > -1) &&
      x.hasAlpha
    ) {
      // 上传非人像实拍图并保存时，针对其中png\webp格式的图片不做选区校验
      resizeSuccessNum++
    }
  })
  // 过滤掉处理失败的 再判断是否有没有成功的
  console.log('过滤掉失败', resizeSuccessList.length, resizeSuccessNum)
  if (isNotEmpty(resizeSuccessList) && resizeSuccessNum === resizeSuccessList.length) {
    imgList.value.forEach(x => {
      if (x.resizeSuccess) {
        x.indexs = x.indexList.join(',')
      }
    })
    saveImg()
    return
  }
  // 就是将未设置替换区的往前排
  imgList.value.sort((a, b) => {
    if (
      type.value === 2 &&
      (a.url.indexOf('.png') > -1 || a.url.indexOf('.webp') > -1) &&
      a.hasAlpha
    )
      return 1
    if (
      type.value === 2 &&
      (b.url.indexOf('.png') > -1 || b.url.indexOf('.webp') > -1) &&
      b.hasAlpha
    )
      return -1
    // 如果a的替换区不是null，返回1，使其排在后面
    if (isNotEmpty(a.markUrl)) return 1
    // 如果b的替换区不是null，返回-1，使其排在后面
    if (isNotEmpty(b.markUrl)) return -1
    // 如果都不是null，则按a的替换区和b的替换区的值进行排序
    return a.markUrl - b.markUrl
  })
  btnLoading.value = false
  ElMessageBox.confirm('存在未设置选区的图片，请选择保留区域', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox3 hide_footer_line'
  })
    .then(() => {
      btnLoading.value = false
    })
    .catch(() => {
      btnLoading.value = false
    })
  // } else {
  //   saveImg()
  // }
}, 700)

// 弹窗关闭之前
const onBeforeDialogClose = done => {
  if (isNotEmpty(imgList.value.find(item => item?.loading))) {
    ElMessageBox.confirm(`图片正在预处理中，是否确定结束上传？`, {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      done()
    })
  } else {
    done()
  }
}

function saveImg() {
  imgList.value.forEach(x => {
    x.mannequinId = mannequinId.value
    x.productId = productId.value
  })
  const list = imgList.value.filter(x => x.resizeSuccess)
  // if (type.value === 1) {
  // list = imgList.value
  // }
  uploadShoot(list)
    .then(res => {
      if (res.code === 0) {
        console.log('上传成功')
        message.success('实拍图上传成功')
        emits('updateFun', imgList.value)
        dialog.value.handleClose()
      }
      btnLoading.value = false
    })
    .catch(() => {
      btnLoading.value = false
    })
}

// --选择保留区域
const canvasDialog = ref({ show: false })
const showCanvasFun = throttle((item, index) => {
  canvasDialog.value = {
    isNeedReplaceFace: type.value === 1 ? 1 : 0,
    show: true,
    url: item.url,
    width: item.width,
    height: item.height,
    markUrl: item.markUrl,
    indexList: item.indexList,
    imgIndex: index
  }
})

function upateCanvasFun(url, indexList, isSave, yellowUrl) {
  imgList.value[canvasDialog.value.imgIndex].markUrl = url || ''
  imgList.value[canvasDialog.value.imgIndex].indexList = indexList || []
  imgList.value[canvasDialog.value.imgIndex].redrawYellowUrl = yellowUrl || ''
}

// --选择保留区域end
</script>
<style lang="scss" scoped>
.dialog_content {
  width: calc(100% + 16px);
}

.upload_box {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;

  .one_img {
    // cursor: pointer;
    margin: 0 12px 12px 0;
    width: 120px;
    height: 160px;
    border-radius: 2px;
    position: relative;

    .img_cover {
      border-radius: 2px;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: flex;
      overflow-clip-margin: border-box;
      -webkit-overflow-clip-margin: border-box;
    }

    .img_choose {
      position: absolute;
      left: 16px;
      top: 66px;
      width: 89px;
      height: 28px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 14px;
      cursor: pointer;
      font-weight: 400;
      font-size: 12px;
      color: #ffffff;
      line-height: 28px;
      text-align: center;
    }

    .mark_img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.4);

      .mark_img_icon {
        width: 28px;
        height: 28px;
      }

      .mark_img_icon_animation {
        animation: rotate infinite 1s linear;
      }

      /* 定义无限旋转的关键帧 */
      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .mark_img_text {
        font-size: 12px;
        color: #ffffff;
        line-height: 18px;
        text-align: center;
        margin-top: 8px;
      }
    }

    .img_choose_opa {
      opacity: 0;
    }

    .img_del {
      position: absolute;
      right: 8px;
      bottom: 8px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.4);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
      }
    }
  }

  .one_img:hover {
    .img_choose_opa {
      opacity: 1;
    }
  }

  .img_del:hover {
    background: rgba(0, 0, 0, 0.4);
  }

  .one_upload {
    margin: 0px 12px 12px 0;
    width: 120px;
    height: 160px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px dashed #d8d8d8;
    overflow: hidden;

    .one_upload2 {
      width: 120px;
      height: 160px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      font-weight: 400;
      font-size: 12px;
      color: #909399;
      line-height: 18px;
    }

    .icon-plus {
      margin-bottom: 8px;
      color: #333;
      font-size: 18px;
    }
  }
}

.form_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .form_label {
    margin-right: 8px;
    width: max-content;
    height: 20px;
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
  }

  .form_content {
    width: calc(100% - 140px);
  }
}

.dialog_footer {
  padding: 12px 0 0 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .footer_left {
    font-weight: 400;
    font-size: 14px;
    color: #606266;
    line-height: 20px;
    display: flex;

    span {
      color: #364fcd;
      font-weight: 600;
    }
  }
}

:deep(.el-radio-group) {
  width: 100%;
  height: max-content;

  .el-radio {
    width: 100%;
    align-items: flex-start;
    height: max-content;

    .el-radio__label {
      color: #303133;

      .tip {
        width: 500px;
        font-weight: 400;
        font-size: 12px;
        color: #909399;
        line-height: 18px;
        word-break: break-all;
        white-space: normal;
        margin-top: 4px;
      }
    }
  }

  .el-radio + .el-radio {
    margin-top: 16px;
  }
}
</style>

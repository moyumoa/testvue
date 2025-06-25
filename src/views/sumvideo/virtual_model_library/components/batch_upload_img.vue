<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="uploadDialog.title"
    width="820px"
    :before-close="onBeforeDialogClose"
    custom-class="xm_element_dialog"
  >
    <template #title>
      <div class="dialog_title">
        {{ uploadDialog?.title }}
        <span class="dialog_title_subtitle">
          {{ uploadDialog?.subtitle }}
        </span>
      </div>
    </template>
    <div class="dialog_content">
      <!-- 上传图片区域 -->
      <div class="upload_box">
        <!-- 已上传列表 -->
        <div class="one_img" v-for="(item, index) in imgList" :key="index">
          <!-- 上传的图片地址 -->
          <img class="img_cover" :src="item.url" alt="" />
          <!-- 预处理失败 -->
          <div v-if="!item.resizeSuccess && !item.loading" class="mark_img">
            <img
              class="mark_img_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20241115pafhk.png"
              alt=""
            />
            <div class="mark_img_text">图片处理失败</div>
          </div>
          <!-- 预处理中 -->
          <div v-if="item.loading" class="mark_img">
            <img
              class="mark_img_icon mark_img_icon_animation"
              src="https://tagvv-1256030678.file.myqcloud.com/20241115aa5kh.png"
              alt=""
            />
            <div class="mark_img_text">图片处理中...</div>
          </div>
          <!-- 删除按钮 -->
          <div class="img_del" @click="delImgFun(index)">
            <img src="https://tagvv-1256030678.file.myqcloud.com/2024032998kkl.png" alt="" />
          </div>
        </div>
        <!-- 添加图片入口 -->
        <div class="one_upload" v-loading="uploadLoading" v-if="imgList && imgList.length < 50">
          <uploadMaterial
            ref="uploadRef"
            :showLoading="false"
            :imgMaxSize="102400"
            :index="1"
            :limit="50"
            :multiple="true"
            :newImageInfo="true"
            :acceptVideoImg="true"
            commonErrTip="每次最多添加50个文件，图片支持JPG、JPEG、PNG、WEBP,每张图不超过100M"
            v-model:uploadLoading="uploadLoading"
            @success="uploadSuccessFun"
            @error="uploadErrFun"
            :imgResolution="[]"
            :imgResolutionCompare="3"
            :acceptTypeList="['image/jpeg', 'image/jpg', 'image/png', 'image/webp']"
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
      <div class="upload_tip">
        支持批量添加，每次最多添加50个文件，图片支持JPEG、JPG、PNG、WEBP格式图片，每张不超过100M
      </div>
      <!-- 模特分类  -->
      <div class="tag_box">
        <div class="tag_label">模特分类：</div>
        <div class="tag_content">
          <el-radio-group v-model="categoryId">
            <el-radio v-for="item in categoryList" :key="item.id" :label="item.id">
              {{ item.name }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <!-- 批量打标  -->
      <div class="tag_box">
        <div class="tag_label">批量打标：</div>
        <div class="tag_content">
          <batchMarking
            origin="productScene"
            :tagType="9"
            :useTagType="true"
            @choseOptions="choseOptions"
          />
        </div>
      </div>
      <!-- 上传批次号 -->
      <div class="tag_box">
        <div class="tag_label">上传批次号：</div>
        <div class="tag_content">
          <div class="tag_input">{{ batchNumber || '' }}</div>
          <div class="tag_tip">上传批次号便于查找批量上传的同批虚拟模特，批量进行删除操作</div>
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
            上传
          </el-button>
        </div>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { ElMessageBox } from 'element-plus'
import uploadMaterial from '@/views/sumvideo/components/material/upload_material_dialog.vue'
import { isNotEmpty, isEmpty, throttle } from '@/utils/tools.js'
import batchMarking from '@/views/content_center/content_repository/components/batch_marking.vue'
import { getBatchNum, batchSave } from '@/api/content_center/material_library.js'
import { resizeImg } from '@/api/sumvideo/product_shooting_library'

const props = defineProps({
  uploadDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const categoryId = ref('')
const { show, categoryList } = toRefs(props.uploadDialog)
// -- 模特分类
if (isNotEmpty(categoryList.value)) {
  categoryId.value = categoryList.value[0].id
}
// -- 上传图片
const uploadLoading = ref(false)

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
  // 进行图片预处理
  imgList.value = imgList.value.concat(
    data.map(item => {
      return {
        url: item.url,
        width: item.width,
        height: item.height,
        size: item.size,
        loading: true, // 处理中
        errMsg: null, // 处理失败的信息
        resizeSuccess: false // 是否处理成功
      }
    })
  )
  uploadLoading.value = false
  data.forEach(item => {
    const indexx = imgList.value.findIndex(x => x.url === item.url)
    resizeImg({
      imageList: [item],
      scene: 4
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
          imgList.value[indexx].loading = false
        } else {
          imgList.value[indexx].errMsg = '接口报错'
          imgList.value[indexx].resizeSuccess = false
          imgList.value[indexx].loading = false
        }
      })
      .catch(err => {
        console.log('err', err)
        imgList.value[indexx].errMsg = '接口报错'
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
// -- 标签操作
const choseLabelIds = ref([]) // 批量打标-选择的标签ids
// 批量打标-选择的标签回调
function choseOptions(val) {
  choseLabelIds.value = val
}
// -- 标签操作 end

// -- 批次号操作
// 获取上传批次号
const batchNumber = ref('') // 上传批次号，每次打开弹窗都不同

function fetBatchNumInit() {
  getBatchNum({ type: 99, batchNumber: '' }).then(res => {
    if (res.code === 0) batchNumber.value = res.data?.batchNumber
  })
}
// -- 批次号操作 end

function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
const emits = defineEmits(['showSuccessFun'])
const message = inject('$message')
// 弹窗的确定事件
const btnDis = ref(false) // 按钮是否禁用
const btnLoading = ref(false)
const handleConfirm = throttle(() => {
  if (btnLoading.value) return
  btnLoading.value = true
  const params = []
  console.log(choseLabelIds.value)
  // console.log((choseLabelIds.value || []).concat(chooseFileId.value))
  imgList.value.forEach(x => {
    if (x.resizeSuccess) {
      params.push({
        batchNumber: batchNumber.value,
        tags: choseLabelIds.value.concat([categoryId.value]),
        source: 22,
        type: 2,
        url: x.url,
        coverUrl: x.url,
        name: x.fileName,
        subSource: 11
      })
    }
  })
  batchSave(params)
    .then(res => {
      if (res.code === 0) {
        message.success('虚拟模特批量上传成功')
        emits('showSuccessFun')
        dialog.value.handleClose()
      }
      btnLoading.value = false
    })
    .catch(() => {
      btnLoading.value = false
    })
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

onMounted(() => {
  fetBatchNumInit()
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.dialog_title {
  .dialog_title_subtitle {
    color: #909399;
    line-height: 20px;
    font-weight: 400;
    font-size: 14px;
  }
}

.dialog_content {
  .upload_box {
    width: 100%;
    height: 276px;
    padding: 0 12px 12px;
    background: #f6f8fa;
    overflow-y: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_img {
      cursor: pointer;
      margin: 12px 12px 0 0;
      width: 120px;
      height: 120px;
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
      .img_del {
        position: absolute;
        right: 8px;
        bottom: 8px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        border-radius: 4px;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: flex;
        }
      }
    }
    .img_del:hover {
      background: rgba(0, 0, 0, 0.4);
    }
    .one_upload {
      margin: 12px 12px 0 0;
      width: 120px;
      height: 120px;
      background: #ffffff;
      border-radius: 2px;
      border: 1px dashed #d8d8d8;
      overflow: hidden;

      .one_upload2 {
        width: 120px;
        height: 120px;
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
  .upload_tip {
    margin-top: 8px;
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    line-height: 20px;
  }
  .tag_box {
    margin-top: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .tag_label {
      width: 100px;
      padding-right: 8px;
      text-align: right;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      line-height: 34px;
    }
    .tag_content {
      width: calc(100% - 100px);
      .tag_input {
        width: 100%;
        height: 32px;
        background: #f6f8fa;
        border-radius: 4px;
        border: 1px solid #dcdee0;
        font-weight: 400;
        font-size: 14px;
        color: #333333;
        line-height: 32px;
        padding-left: 12px;
      }
      .tag_tip {
        margin-top: 12px;
        font-weight: 400;
        font-size: 14px;
        color: #909399;
        line-height: 20px;
      }
    }
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
    span {
      color: #364fcd;
      font-weight: 600;
    }
  }
}
</style>

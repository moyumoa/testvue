<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="isAdd ? '添加商品' : '编辑商品信息'"
    width="560px"
    custom-class="xm_element_dialog"
    :before-close="handleClose"
  >
    <div class="dialog_content" v-loading="dialogLoading">
      <el-form @submit.prevent :model="form" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="商品图：">
          <div class="cover_box" v-if="form.coverUrl">
            <img class="img_cover" :src="form.coverUrl" alt="" />
            <div class="img_del" @click="delImgFun">
              <img src="https://tagvv-1256030678.file.myqcloud.com/2024032998kkl.png" alt="" />
            </div>
          </div>
          <!-- 添加图片 -->
          <uploadImage
            v-else
            :maxSize="15360"
            :index="0"
            origin="sumvideo"
            :useCommonReason="true"
            @success="uploadImgSuccess"
            @updateLoading="
              val => {
                uploadLoading = val
              }
            "
            :showLoading="true"
          >
            <div class="cover_upload">
              <el-icon class="icon-plus">
                <i-plus />
              </el-icon>
              <div>上传图片</div>
            </div>
          </uploadImage>
        </el-form-item>
        <el-form-item label="商品名称：" prop="name">
          <div class="name_box">
            <el-input
              class="name_input"
              show-word-limit
              maxlength="20"
              @blur="retEmitEmj($event)"
              v-model.trim="form.name"
              placeholder="请输入商品名称"
            ></el-input>

            <div v-if="!isAdd" class="name_btn" @click.stop="delFun">删除商品</div>
          </div>
        </el-form-item>
        <el-form-item label="批量打标：">
          <batchMarking
            style="width: 360px"
            origin="productShootByGood"
            placeholder="请选择标签"
            :tagType="6"
            :useTagType="true"
            :chooseTags="form.tags"
            @choseOptions="choseOptions"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog_footer">
        <div class="footer_right">
          <el-button :disabled="dialogLoading" @click="closeDialog">取消</el-button>
          <el-button
            type="primary"
            :disabled="dialogLoading"
            :loading="btnLoading"
            @click="handleConfirm"
          >
            确定
          </el-button>
        </div>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { saveProduct, updateProduct, deleteProduct } from '@/api/sumvideo/product_shooting_library'
import batchMarking from '@/views/content_center/content_repository/components/batch_marking.vue'
import { ElMessageBox } from 'element-plus'
import uploadImage from '@/views/market/miniprogram_operation/components/upload_image.vue'
import { throttle, isNotEmpty } from '@/utils/tools'

const message = inject('$message')
const emits = defineEmits(['updateFun', 'updateAllGoodFun'])

const dialogLoading = ref(true) // 弹窗的全局Loading
const props = defineProps({
  goodDialog: {
    type: Object,
    default: () => {
      return {
        isAdd: false, // 是否是添加商品
        show: false,
        info: null
      }
    }
  }
})
const { isAdd, show, chooseFileId } = toRefs(props.goodDialog)
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    {
      min: 1,
      max: 20,
      message: '请输入商品名称，最多20个字',
      trigger: 'blur'
    }
  ]
}
const form = ref({
  coverUrl: '', // 商品图片
  name: '', // 商品图片
  tags: [] // 商品标签
})

// --上传图片
const uploadLoading = ref(false)
function uploadImgSuccess(e, i, name) {
  form.value.coverUrl = e.imgUrl
}
// 删除图片
const delImgFun = throttle(i => {
  form.value.coverUrl = ''
}, 700)
// --上传图片 end

// --商品名称
// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  form.value.name = e.target.value.replace(reg, '')
}
// --商品名称 end

// 删除商品
const idDel = ref(false)
const delFun = throttle(() => {
  ElMessageBox.confirm(
    `删除实拍商品后，该商品相关的所有实拍图都会被删除，是否确定删除？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: '',
      customClass: 'drawer_systemBox3 hide_footer_line',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          // dialogLoading.value = true
          deleteProduct({
            id: form.value.id
          })
            .then(res => {
              if (res.code === 0) {
                idDel.value = false

                done()
                instance.confirmButtonLoading = true

                message.success(`商品删除成功`)
                emits('updateAllGoodFun')
                dialog.value.handleClose()
              } else {
                done()
                instance.confirmButtonLoading = true
              }
            })
            .catch(() => {
              done()
              instance.confirmButtonLoading = true
            })
        } else {
          done()
        }
      }
    }
  )
    .then(res => {
      console.log('res', res)
    })
    .catch(err => {
      console.log('err', err)
    })
}, 700)

// 批量打标-选择的标签回调
function choseOptions(val) {
  form.value.tags = val
}

// --弹窗的取消和确定
const dialog = ref()
const btnLoading = ref(false)
const ruleForm = ref(null)
function closeDialog() {
  dialog.value.handleClose()
}
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      btnLoading.value = true
      const params = JSON.parse(JSON.stringify(form.value))
      if (isAdd.value) {
        params.tags.push(chooseFileId.value)
      }
      const productPromise = isAdd.value ? saveProduct(params) : updateProduct(params)
      productPromise
        .then(res => {
          if (res.code === 0) {
            message.success(`商品${isAdd.value ? '创建' : '编辑'}成功`)
            if (isAdd.value) {
              emits('updateAllGoodFun')
            } else {
              emits('updateFun')
            }

            btnLoading.value = false
            dialog.value.handleClose()
          } else {
            btnLoading.value = false
          }
        })
        .catch(() => {
          btnLoading.value = false
        })
    }
  })
}, 700)

// --弹窗的取消和确定 end

onMounted(() => {
  dialogLoading.value = true
  if (props.goodDialog.info) {
    const info = JSON.parse(JSON.stringify(props.goodDialog.info))
    info.coverUrl = info.cover
    info.tags = isNotEmpty(info.tagList) ? info.tagList.map(x => x.id) : []
    form.value = info
    dialogLoading.value = false
  } else {
    dialogLoading.value = false
  }
})

function handleClose(done) {
  if (dialogLoading.value) {
    message.warning('商品加载中，禁止关闭')
  } else {
    done()
  }
}
</script>
<style lang="scss" scoped>
.cover_box {
  width: 120px;
  height: 120px;
  border-radius: 2px;
  position: relative;
  .img_cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: flex;
    border-radius: 2px;
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
    &:hover {
      background: rgba(0, 0, 0, 0.4);
    }
  }
}
.cover_upload {
  width: 120px;
  height: 120px;
  border-radius: 2px;
  border: 1px dashed #d8d8d8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: 400;
  font-size: 12px;
  color: #909399;
  line-height: 18px;
  .icon-plus {
    margin-bottom: 8px;
    color: #333;
    font-size: 18px;
  }
}

.name_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .name_input {
    width: 360px;
  }
  .name_btn {
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    color: #d40000;
    line-height: 20px;
    margin-left: 12px;
  }
}
:deep(.el-form-item__label) {
  padding-right: 8px;
}
</style>

<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="isAdd ? '添加实拍模特' : '编辑模特信息'"
      width="560px"
      custom-class="xm_element_dialog"
    >
      <div class="dialog_content" v-loading="dialogLoading">
        <el-form @submit.prevent :model="form" :rules="rules" ref="ruleForm" label-width="90px">
          <el-form-item label="模特姓名：" prop="name" v-if="!isAdd">
            <div class="name_box">
              <el-input
                class="name_input"
                show-word-limit
                maxlength="20"
                @blur="retEmitEmj($event)"
                v-model.trim="form.name"
                placeholder="请输入实拍模特姓名"
              ></el-input>
              <div v-if="false" class="name_btn" @click.stop="delFun">删除实拍模特</div>
            </div>
          </el-form-item>
          <el-form-item label="选择模特：" prop="id" v-else>
            <div class="name_box">
              <el-select
                style="width: 320px"
                v-model="form.id"
                filterable
                remote
                clearable
                :remote-method="getModelFun"
                default-first-option
                :reserve-keyword="false"
                placeholder="请选择实拍模特"
                :loading="modelLoading"
              >
                <el-option
                  v-for="item in modelList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
              <div class="add_box">
                或
                <span @click="createFun">创建实拍模特</span>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="批量打标：">
            <batchMarking
              :style="{ width: !isAdd ? '100%' : '320px' }"
              origin="productShootByModel"
              placeholder="请选择标签"
              :tagType="7"
              :useTagType="true"
              :chooseTags="form.tags"
              @choseOptions="choseOptions"
            />
          </el-form-item>
          <el-form-item label="添加范围：" prop="range" class="noneValite" v-if="isAdd">
            <div>
              <el-radio-group @change="rangeChange" v-model="form.range">
                <el-radio :label="1">部分商品</el-radio>
                <el-radio :label="2">本商品</el-radio>
                <el-radio :label="3">全部商品</el-radio>
              </el-radio-group>

              <div class="choose_box" v-if="form.range == 1">
                <el-button type="primary" @click="chooseFun">选择商品</el-button>
                <div class="choose_tip">
                  已选择商品件数：
                  <span>{{ form.products.length || 0 }}</span>
                </div>
              </div>
            </div>
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
    <!-- 选择商品 -->
    <chooseGoodDOM
      v-if="chooseDialog.show"
      :chooseDialog="chooseDialog"
      @updateFun="updateGoodFun"
    />
    <!-- 创建实拍模特 -->
    <addModelDOM v-if="addDialog.show" :addDialog="addDialog" @updateFun="updateModelFun" />
  </div>
</template>
<script setup>
import {
  bindMannequin,
  updateMannequin,
  nameList,
  deleteMannequin
} from '@/api/sumvideo/product_shooting_library'

import addModelDOM from './add_model_dialog.vue'
import chooseGoodDOM from './choose_good_dialog.vue'
import batchMarking from '@/views/content_center/content_repository/components/batch_marking.vue'
import { ElMessageBox } from 'element-plus'
import { throttle, isNotEmpty } from '@/utils/tools'

const message = inject('$message')
const emits = defineEmits(['updateFun', 'updateAllGoodFun'])

const dialogLoading = ref(true) // 弹窗的全局Loading
const props = defineProps({
  modelDialog: {
    type: Object,
    default: () => {
      return {
        isAdd: false, // 是否是添加模特
        show: false,
        goodId: null // 点击的商品ID
      }
    }
  }
})
const { isAdd, show, goodId } = toRefs(props.modelDialog)
const rules = {
  name: [
    { required: true, message: '请输入实拍模特姓名', trigger: 'blur' },
    {
      min: 1,
      max: 20,
      message: '请输入实拍模特姓名，最多20个字',
      trigger: 'blur'
    }
  ],
  id: [{ required: true, message: '请选择实拍模特', trigger: 'change' }],
  range: [
    {
      required: true,
      validator: () => {
        return new Promise((resolve, reject) => {
          if (isAdd.value && form.value.range === 1) {
            if (isNotEmpty(form.value.products)) {
              resolve()
            } else {
              reject(new Error(`请选择商品`))
            }
          } else {
            resolve()
          }
        })
      },
      trigger: 'change'
    }
  ]
}
const form = ref({
  id: null, // 选择的模特ID
  name: '', // 模特姓名
  tags: [], // 模特标签
  range: 2, // 添加范围
  products: []
})
// --模特姓名
// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  form.value.name = e.target.value.replace(reg, '')
}
// --模特姓名 end

// 删除模特

const delFun = throttle(() => {
  ElMessageBox.confirm(
    `删除实拍模特后，该实拍模特相关的所有实拍图都会被删除，是否确定删除？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: '',
      customClass: 'drawer_systemBox3 hide_footer_line',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          deleteMannequin({
            id: form.value.id
          })
            .then(res => {
              if (res.code === 0) {
                message.success(`实拍模特删除成功`)
                // 因为目前删除模特，就是要把模特从模特列表中删除，并解除跟所有商品绑定的关系。
                emits('updateAllGoodFun')
                dialog.value.handleClose()
              }
              done()
              instance.confirmButtonLoading = false
            })
            .catch(() => {
              done()
              instance.confirmButtonLoading = false
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

// --修改范围
function rangeChange(e) {
  if (e === 1) {
    form.value.products = []
  } else if (e === 2) {
    form.value.products = [goodId.value]
  } else {
    form.value.products = []
  }
}
// 选择商品
const chooseDialog = ref({
  show: false
})
const chooseFun = throttle(() => {
  chooseDialog.value = {
    show: true,
    ids: form.value.products || []
  }
}, 700)
function updateGoodFun(ids) {
  form.value.products = ids || []
  ruleForm.value.validateField('range')
}
// --修改范围 end

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
      const savePromise = isAdd.value
        ? bindMannequin({
            id: form.value.id,
            tags: form.value.tags,
            products: form.value.products,
            bindAllProducts: form.value.range === 3
          })
        : updateMannequin({
            id: form.value.id,
            name: form.value.name,
            tags: form.value.tags
          })

      savePromise
        .then(res => {
          if (res.code === 0) {
            message.success(`实拍模特${isAdd.value ? '添加' : '编辑'}成功`)
            emits('updateAllGoodFun')
            dialog.value.handleClose()
          }
          btnLoading.value = false
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
  getModelFun()
  // 如果是新建，那默认要选中本商品
  if (props.modelDialog.isAdd) {
    form.value.products = [props.modelDialog.goodId]
  } else {
    if (props.modelDialog.info) {
      const info = JSON.parse(JSON.stringify(props.modelDialog.info))
      info.tags = isNotEmpty(info.tagList) ? info.tagList.map(x => x.id) : []
      form.value = info
    }
  }
  nextTick(() => {
    dialogLoading.value = false
  })
})

// function handleClose(done) {
//   if (dialogLoading.value) {
//     message.warning(idDel.value ? '模特删除中，禁止关闭' : '模特加载中，禁止关闭')
//   } else {
//     done()
//   }
// }

// -- 创建实拍模特 begin
const addDialog = reactive({
  show: false
})
const createFun = throttle(() => {
  addDialog.show = true
}, 700)
// 模特创建成功 更新模特列表
function updateModelFun() {
  getModelFun()
}
// -- 创建实拍模特 end

// --选择实拍模特 begin
const modelList = ref([])
const modelLoading = ref(false)

// function getModelList(value) {
//   getModelFun(value)

// }
function getModelFun(value) {
  nameList({ name: value })
    .then(res => {
      if (res.code === 0) {
        modelList.value = res.data
      } else {
        modelList.value = []
      }
      modelLoading.value = false
    })
    .catch(err => {
      modelLoading.value = false
      console.log(err, 'err')
    })
}
// --选择实拍模特 end
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
    width: 100%;
    :deep(.el-input__inner) {
      padding-right: 58px;
    }
  }
  .name_btn {
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    color: #d40000;
    line-height: 20px;
    margin-left: 12px;
  }
  .add_box {
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    line-height: 20px;
    margin-left: 12px;
    span {
      color: #364fcd;
      cursor: pointer;
    }
  }
}
:deep(.el-form-item__label) {
  padding-right: 8px;
}
:deep(.noneValite .el-form-item__label:before) {
  display: none;
}
.choose_box {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .choose_tip {
    margin-left: 20px;
    font-weight: 400;
    font-size: 14px;
    color: #606266;
    line-height: 20px;
    span {
      font-weight: 600;
      color: #364fcd;
    }
  }
}
</style>

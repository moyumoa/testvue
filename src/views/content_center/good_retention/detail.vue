<template>
  <div class="retention_detail page_detail">
    <el-form class="detail_box" :model="form" :rules="rules" ref="ruleForm" label-width="20%">
      <div class="one_detail">
        <div class="title_box">新建留资商品</div>
        <el-form-item label="商品名称" prop="name">
          <el-input
            @blur="retEmit($event, 'name')"
            maxlength="20"
            v-model="form.name"
            show-word-limit
            placeholder="请输入商品名称，最多20个字符"
          ></el-input>
        </el-form-item>
        <el-form-item label="主图" prop="imageList">
          <div>
            <div class="mark" style="line-height: 32px">
              首张主图将作为商品封面图，建议图片大小控制在500K以内，尺寸为500*500px。
            </div>
            <div class="file_box">
              <div class="one_file" v-for="(item, index) in form.imageList" :key="index">
                <img class="file_cover" :src="item.img" alt />
                <div class="file_action">
                  <div class="check_icon" @click="showFile(item)">预览</div>
                  <div class="del_icon" @click="delFile(item, index)">
                    <img src="@/assets/images/content_center/inspection_del.png" alt />
                  </div>
                </div>
              </div>
              <el-upload
                v-loading="fileLoading"
                v-if="form.imageList.length < 5"
                :show-file-list="false"
                accept="image/jpeg, image/jpg, image/png"
                :action="uploadUrl"
                :headers="headers"
                list-type="picture"
                :on-success="handleSuccess"
                :on-error="handleError"
                :before-upload="beforeUploadFile"
              >
                <div class="upload_text">
                  <img src="@/assets/images/content_center/inspection_add.png" alt />
                  点击上传
                </div>
              </el-upload>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="商品详情" prop="description">
          <div id="richText" style="max-width: 518px; width: 80%"></div>
        </el-form-item>
        <el-form-item label="价格展示" prop="showPrice">
          <el-radio-group v-model="form.showPrice" @change="showPriceChange">
            <el-radio v-for="item in showData" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="售卖价" prop="discountPrice1" v-if="form.showPrice === 1">
          <el-input
            type="number"
            v-model="form.discountPrice1"
            placeholder="必须大于0，最多保留两位小数"
          ></el-input>
        </el-form-item>
        <el-form-item
          class="noContent_item"
          label="划线价"
          prop="marketPrice1"
          v-if="form.showPrice === 1"
        >
          <el-input
            type="number"
            v-model="form.marketPrice1"
            placeholder="划线价需高于售卖价，最多保留两位小数"
          ></el-input>
        </el-form-item>
      </div>

      <div class="one_detail config_detail">
        <div class="title_box">留资信息设置</div>
        <el-form-item prop="info" label-width="0%">
          <div class="info_all">
            <div class="info_box">
              <div :class="{ label: true, choose_label: form.info.length == 0 }">
                {{ form.info.length > 0 ? '已设置信息' : '未设置信息' }}
              </div>
              <div class="content" style="height: 32px; line-height: 30px">
                <el-link type="primary" @click="showModal">
                  {{ form.info.length > 0 ? '重新设置' : '设置' }}
                </el-link>
              </div>
            </div>
            <template v-if="form.info.length > 0">
              <template v-for="(item, index) in form.info" :key="index">
                <div class="info_box" v-if="item.configIsShow == 1">
                  <div :class="{ label: true, choose_label: item.configIsMust == 1 }">
                    {{ item.configTitle }}
                  </div>
                  <div class="content">
                    <el-input
                      maxlength="20"
                      style="width: 264px"
                      :placeholder="
                        item.configType == '地理位置'
                          ? '请选择地理位置'
                          : item.configType == '手机'
                          ? '请输入手机号'
                          : '请输入' + item.configTitle
                      "
                    ></el-input>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <div
      class="detail_btn"
      :style="{
        left: `${isCollapse ? '210px' : '63px'}`,
        width: `calc(100% - ${isCollapse ? '210px' : '63px'})`
      }"
    >
      <el-button @click="closePage">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">保存</el-button>
    </div>
    <el-dialog title="查看附件" v-model="checkDialog" destroy-on-close>
      <div class="check_modal">
        <img :src="dialogFile.url" alt />
      </div>
    </el-dialog>
    <!-- 留资弹窗设置 -->
    <retentionModal @updateConfig="getConfigFun" v-if="modal.show" :modal="modal"></retentionModal>
  </div>
</template>
<script setup>
import { useStore } from 'vuex'
import { getConfig, saveOrUpdateLIProduct } from '@/api/content_center/good_retention.js'
import retentionModal from './components/retention_modal.vue'
import E from 'wangeditor'
import { useRouter } from 'vue-router'
defineComponent(retentionModal)
const router = useRouter()
const store = useStore()
const message = inject('$message')
const ruleForm = ref(null)
const loading = ref(false) // 弹窗的Loading
const fileLoading = ref(false) // 附件的loading
const editor = ref(null)
const modal = reactive({
  show: false
})
const isCollapse = store.getters.isCollapse
const uploadUrl = ref('')
uploadUrl.value = '/v1/system/account/uploadImage'
const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token')
})
onMounted(() => {
  editor.value = new E('#richText')
  editor.value.config.menus = [
    'head',
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'foreColor',
    'justify',
    'image'
  ]
  // 设置编辑区域高度为 500px
  editor.value.config.height = 280
  editor.value.config.zIndex = 3
  editor.value.config.fontSize = 14
  editor.value.config.uploadImgServer = '/api/v1/system/account/uploadImage'
  editor.value.config.uploadFileName = 'file'
  editor.value.config.uploadImgHooks = {
    customInsert: function (insertImgFn, result) {
      if (result.code === 0) {
        insertImgFn(result.data)
      }
    }
  }

  // 配置 onchange 回调函数
  editor.value.config.onchange = function (newHtml) {
    form.description = newHtml
  }
  // 配置触发 onchange 的时间频率，默认为 200ms
  editor.value.config.onchangeTimeout = 500 // 修改为 500ms
  editor.value.create()
  // editor.value.txt.html('1232')

  getConfigFun()
})

// 价格展示
const showData = ref([
  {
    label: '不展示',
    value: 0
  },
  {
    label: '展示',
    value: 1
  }
])
// 表单相关数据
const form = reactive({
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : '', // 品牌Id
  name: '', // 商品名称
  imageList: [], // 主图
  description: '', // 商品详情
  showPrice: 0, // 价格展示
  discountPrice1: null, // 售卖价
  marketPrice1: null, // 划线价
  info: []
})
// 主图的验证
const validateImg = (rule, value, callback) => {
  if (form.imageList.length > 0) {
    callback()
  } else {
    callback(new Error('请上传图片'))
  }
}
// 商品详情的验证
const validateDesc = (rule, value, callback) => {
  const textHtml = editor.value.txt.html()
  const text = editor.value.txt
    .text()
    .replace(/&nbsp;/g, '')
    .replace(/ /g, '')
  if (!text && !textHtml.includes('<img')) {
    return callback(new Error('商品详情不能为空'))
  } else {
    const reg =
      /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
    if (reg.test(text)) {
      return callback(new Error('商品详情不能输入表情'))
    } else {
      callback()
    }
  }
}
const validatePrice1 = (rule, value, callback) => {
  if (form.showPrice === 1) {
    const regE = /^([1-9]\d*(\.\d{1,2})?|([0](\.([0][1-9]|[1-9]\d{0,1}))))$/
    if (regE.test(form.discountPrice1)) {
      callback()
    } else {
      return callback(new Error('请输入售卖价，售卖价必须大于0，最多保留两位小数'))
    }
  } else {
    callback()
  }
}
const validatePrice2 = (rule, value, callback) => {
  if (form.showPrice === 1) {
    const regE = /^([1-9]\d*(\.\d{1,2})?|([0](\.([0][1-9]|[1-9]\d{0,1}))))$/
    if (regE.test(form.marketPrice1)) {
      if (parseFloat(form.marketPrice1) > parseFloat(form.discountPrice1)) {
        callback()
      } else {
        return callback(new Error('划线价需高于售卖价，最多保留两位小数'))
      }
    } else {
      return callback(new Error('请输入划线价，划线价需高于售卖价，最多保留两位小数'))
    }
  } else {
    callback()
  }
}
const validateInfo = (rule, value, callback) => {
  if (form.info && form.info.length > 0) {
    callback()
  } else {
    return callback(new Error('请设置留资信息'))
  }
}
const rules = {
  name: [
    {
      required: true,
      message: '请输入商品名称，最多20个字符',
      trigger: 'blur'
    },
    {
      min: 1,
      max: 20,
      message: '请输入商品名称，最多20个字符',
      trigger: 'blur'
    }
  ],
  imageList: [{ required: true, validator: validateImg, trigger: 'change' }],
  description: [{ required: true, validator: validateDesc, trigger: 'blur' }],
  showPrice: [{ required: true, message: '请选择价格是否展示', trigger: 'change' }],
  discountPrice1: [{ required: true, validator: validatePrice1, trigger: 'blur' }],
  marketPrice1: [{ required: true, validator: validatePrice2, trigger: 'blur' }],
  info: [{ required: true, validator: validateInfo, trigger: 'blur' }]
}
// 文件上传之前
function beforeUploadFile(file) {
  const size = file.size
  if (size > 500000) {
    message({
      type: 'warning',
      message: '图片大小不能超过500K'
    })
    return false
  }
  fileLoading.value = true
}

// 文件上传成功
function handleSuccess(res, file) {
  if (res.code === 0) {
    if (form.imageList.length >= 5) {
      return message.warning('最多上传5张图片')
    }
    form.imageList.push({
      img: res.data,
      url: res.data
    })
  } else {
    message.warning('图片上传失败')
  }

  fileLoading.value = false
}
// 文件上传失败
function handleError() {
  fileLoading.value = false
}

// 表单提交
function handleConfirm() {
  ruleForm.value.validate(valid => {
    if (valid) {
      loading.value = true
      const imgL = form.imageList.map(x => {
        return x.img
      })
      form.img = imgL.join(',')
      form.discountPrice = form.showPrice === 1 ? (form.discountPrice1 || 0) * 100 : null
      form.marketPrice =
        form.showPrice === 1 && form.marketPrice1 != null ? (form.marketPrice1 || 0) * 100 : null
      saveOrUpdateLIProduct([form])
        .then(res => {
          if (res.code === 0) {
            message({
              type: 'success',
              message: '创建成功'
            })
            router.push({
              path: '/content_center/good_retention'
            })
            loading.value = false
          } else {
            loading.value = false
          }
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}
// 页面取消
function closePage() {
  router.push({
    path: '/content_center/good_retention'
  })
}
const checkDialog = ref(false) // 是否显示查看附件的弹窗
// 查看附件相关数据
const dialogFile = ref({
  type: '', // 附件属性 video/image
  img: '', // 附件的封面图
  url: '' // 附件地址
}) // 查看附件的data

// 查看附件
function showFile(e) {
  checkDialog.value = true
  dialogFile.value = e
}
// 删除附件
function delFile(e, index) {
  form.imageList.splice(index, 1)
}
// 打开弹窗
function showModal() {
  modal.show = true
}
// 检查是否有表情包
function retEmit(e, name) {
  const val = e.target.value
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  form[name] = val.replace(reg, '')
}
// 价格展示的修改
function showPriceChange() {
  if (form.showPrice === 0) {
    form.discountPrice1 = null
    form.marketPrice1 = null
  }
}
// 获取留资配置
function getConfigFun() {
  getConfig().then(res => {
    if (res.code === 0 && res.data && res.data.length > 0) {
      form.info = res.data
    }
  })
}
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.retention_detail {
  width: 100%;
  .detail_box {
    margin-bottom: 60px;
    width: 100%;
    .one_detail {
      width: 100%;
      background: #fff;
      border-radius: 4px;
      margin-bottom: 16px;
      padding-bottom: 32px;
    }
    .info_all {
      width: 100%;
      .info_box {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        .label {
          width: 20%;
          text-align: right;
          font-size: 14px;
          color: #606266;
          line-height: 32px;
          padding-right: 14px;
        }
        .choose_label:before {
          content: '*';
          color: var(--el-color-danger);
          margin-right: 4px;
        }
        .content {
          width: 80%;
          line-height: 32px;
        }
      }
      .info_box + .info_box {
        margin-top: 22px;
      }
    }
    .title_box {
      width: calc(100% - 24px);
      height: 56px;
      line-height: 56px;
      padding-left: 24px;
      font-size: 18px;
      font-weight: 600;
      color: #323233;
      border-bottom: 1px solid #e8e8e8;
      margin-bottom: 28px;
    }
    :deep(.el-input__count) {
      --el-color-info: #c0c4cc;
    }
    .mark {
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
    :deep(.el-form-item__content) {
      min-height: 32px;
      height: auto;
      &:first-child {
        margin-bottom: 14px !important;
      }
    }
    .file_box {
      margin-top: 8px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .one_file {
        width: 120px;
        height: 120px;
        margin-right: 14px;
        margin-bottom: 14px;
        position: relative;

        border-radius: 4px;
        overflow: hidden;
        .file_cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }
        .file_action {
          opacity: 0;
          width: 120px;
          height: 120px;
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          // padding: 0 8px 8px 0;

          background: rgba(0, 0, 0, 0.4);
          font-size: 14px;
          font-weight: 400;
          color: #ffffff;
          line-height: 20px;
          .check_icon {
            width: 120px;
            height: 40px;
            padding: 8px;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
          }
          .del_icon {
            position: absolute;
            bottom: 0px;
            right: 0px;
            width: 120px;
            height: 40px;
            padding: 0 8px 8px 0;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            justify-content: flex-end;
            align-items: flex-end;
            img {
              width: 16px;
              height: 16px;
              display: flex;
            }
          }
          &:hover {
            opacity: 1;
          }
        }
      }
      :deep(.el-upload--picture) {
        margin-bottom: 14px;
        width: 118px;
        height: 118px;
        border-radius: 4px;
        border: 1px dashed #dbdfe7;
        background: #fff;
        &:hover {
          border-color: $theme_color;
        }
      }
      .upload_text {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
        img {
          width: 20px;
          height: 20px;
          margin-bottom: 16px;
        }
      }
    }
    .check_modal {
      width: 100%;
      height: 400px;
      padding-left: 24px;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      video {
        width: 100%;
        height: 100%;
      }
    }
  }
  .detail_btn {
    z-index: 99;
    width: calc(100% - 210px);
    padding: 10px 0;
    background: #fff;
    position: fixed;
    left: 210px;
    bottom: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
}
.check_modal {
  width: 100%;
  height: 400px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  video {
    width: 100%;
    height: 100%;
  }
}
:deep(.el-input) {
  max-width: 518px;
  width: 80%;
}
.noContent_item {
  :deep(.el-form-item__label:before) {
    display: none;
  }
}
.config_detail {
  :deep(.el-form-item__error) {
    margin-left: 20%;
  }
}
</style>

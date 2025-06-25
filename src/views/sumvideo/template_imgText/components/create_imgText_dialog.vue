<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="`${origin == 'batchCreate' ? '图文生成' : '创建模板'}`"
    width="560px"
    custom-class="xm_element_dialog"
  >
    <div class="dialog_content">
      <el-form @submit.prevent :model="form" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item v-if="!origin" label="模板名称：" prop="name">
          <el-input
            style="width: 360px"
            class="input_box"
            placeholder="请输入模板名称"
            type="text"
            v-model.trim="form.name"
            @blur="inputBlur"
            maxlength="20"
            clearable
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          :label="`${origin == 'batchCreate' ? '图文' : '模板'}类型：`"
          prop="imageReplaceType"
        >
          <div class="type_box">
            <div class="type_btn">
              <div
                :class="{ one_type: true, choose_type: form.imageReplaceType == item.value }"
                v-for="(item, index) in replaceTypeList"
                :key="index"
                @click="form.imageReplaceType = item.value"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          :label="`${origin == 'batchCreate' ? '图文' : '模板'}结构：`"
          prop="creativeStruct"
        >
          <div class="type_box">
            <div class="type_btn">
              <div
                :class="{ one_type: true, choose_type: form.creativeStruct == item.value }"
                v-for="(item, index) in typeList"
                :key="index"
                @click="chooseTypeFun(item)"
              >
                {{ item.label }}
              </div>
            </div>
            <div class="type_tip">
              {{
                form.creativeStruct == 1
                  ? '适合朋友圈、买家秀等场景'
                  : '适合小红书、朋友圈、买家秀等场景'
              }}
            </div>
            <div class="size_box">
              <div
                :class="{ one_size: true, choose_size: form.imageCnt == item.value }"
                v-for="(item, index) in sizeList"
                :key="index"
                @click="chooseSizeFun(item)"
              >
                <div class="size_label">{{ item.label }}</div>
                <img :src="item.img" alt="" />
                <div class="size_text" v-if="form.creativeStruct == 2">文本内容</div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog_footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { saveImageCreative } from '@/api/sumvideo/template_imgText'
import { useRouter } from 'vue-router'
import { throttle, isNotEmpty } from '@/utils/tools'
const router = useRouter()
const props = defineProps({
  origin: String, // 来源  batchCreate 批量生成过来 否则就是图文模板过来
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const { origin } = toRefs(props)
const show = toRef(props.addDialog, 'show')
const replaceTypeList = reactive([
  {
    label: '换脸换背景',
    value: 1
  },
  {
    label: '只换背景',
    value: 2
  }
])
const typeList = reactive([
  {
    label: '仅图片',
    value: 1
  },
  {
    label: '图片+文本',
    value: 2
  }
])
const sizeList = reactive([
  {
    label: '单图',
    value: 1,
    img: 'https://tagvv-1256030678.file.myqcloud.com/2024091487ckw.png'
  },
  {
    label: '三张图',
    value: 3,
    img: 'https://tagvv-1256030678.file.myqcloud.com/20240914nsmg8.png'
  },
  {
    label: '六张图',
    value: 6,
    img: 'https://tagvv-1256030678.file.myqcloud.com/20240914dshac.png'
  },
  {
    label: '九张图',
    value: 9,
    img: 'https://tagvv-1256030678.file.myqcloud.com/20240914yji2x.png'
  }
])
const form = ref({
  name: '', // 组图名称
  imageReplaceType: 1,
  creativeStruct: 1,
  imageCnt: 1
})
const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  imageReplaceType: [{ required: true, message: '请输入模板类型', trigger: 'change' }],
  creativeStruct: [
    {
      required: true,
      validator: () => {
        return new Promise((resolve, reject) => {
          if (isNotEmpty(form.value.creativeStruct) && isNotEmpty(form.value.imageCnt)) {
            resolve()
          } else {
            reject(new Error(`请选择模板结构`))
          }
        })
      },
      trigger: 'change'
    }
  ]
}
// 输入框内容校验
function inputBlur() {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  form.value.name = form.value.name.replace(reg, '')
}

// 选择结构类型
const chooseTypeFun = throttle(item => {
  if (item.value === form.value.creativeStruct) return
  form.value.creativeStruct = item.value
  form.value.imageCnt = 1
}, 700)

// 选择数量
const chooseSizeFun = throttle(item => {
  if (item.value === form.value.imageCnt) return
  form.value.imageCnt = item.value
})

const dialog = ref()
const btnLoading = ref(false)
const ruleForm = ref(null)
const emits = defineEmits(['updateFun'])
// const message = inject('$message')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  // console.log('新建：', selectForm.value)
  ruleForm.value.validate(valid => {
    if (valid) {
      btnLoading.value = true
      if (origin.value && origin.value === 'batchCreate') {
        emits('updateFun', form, btnLoading, dialog)
        return
      }
      const tagList = form.value.tag ? form.value.tag.split(';') : []
      if (tagList.length > 0) {
        form.value.labelList = [...new Set(tagList)].filter(x => x !== '')
      } else {
        form.value.labelList = []
      }

      saveImageCreative(form.value)
        .then(res => {
          if (res.code === 0) {
            router.push(`/sumwhy_video/template_imgText/detail?id=${res.data}`)
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
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
.type_box {
  width: 100%;
  .type_btn {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_type {
      margin-right: 16px;
      border-radius: 4px;
      border: 1px solid #dcdee0;
      padding: 4px 8px;
      font-weight: 400;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      line-height: 20px;
    }
    .choose_type {
      background: #364fcd;
      border: 1px solid #364fcd;
      color: #ffffff;
    }
  }
  .type_tip {
    font-weight: 400;
    font-size: 12px;
    color: #909399;
    line-height: 18px;
    margin-top: 12px;
  }
  .size_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_size {
      cursor: pointer;
      width: 172px;
      height: 140px;
      border: 1px solid transparent;
      border-radius: 4px;
      margin: 16px 16px 0px 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      padding-top: 8px;
      .size_label {
        width: 100%;
        text-align: center;
        font-weight: 400;
        font-size: 12px;
        color: #303133;
        line-height: 18px;
        margin-bottom: 6px;
      }
      img {
        width: 124px;
        height: 72px;
        object-fit: contain;
        display: flex;
      }
      .size_text {
        margin-top: 8px;
        width: 64px;
        height: 20px;
        background: #f2f3f5;
        border-radius: 2px;
        font-weight: 400;
        font-size: 12px;
        color: #bfc4cd;
        line-height: 20px;
        text-align: center;
      }
    }
    .one_size:hover {
      background: #f6f8fa;
      border: 1px solid #f6f8fa;
    }
    .choose_size {
      border: 1px solid #364fcd !important;
      background: rgba(54, 79, 205, 0.1) !important;
    }
  }
}
.dialog_footer {
  padding: 12px 0px 0 16px;
}
</style>

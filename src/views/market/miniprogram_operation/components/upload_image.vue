<template>
  <div class="upload_image">
    <el-upload
      v-loading="loading"
      :show-file-list="false"
      :accept="props.accept || 'image/jpeg, image/jpg, image/png'"
      :action="props.origin == 'sumvideo' ? uploadImage : uploadFileURL"
      list-type="picture"
      :on-success="handleHeadSuccess"
      :on-error="handleHeadError"
      :before-upload="beforeHeadUploadFile"
      :disabled="disabled"
      :headers="requestHeaders"
    >
      <slot></slot>
    </el-upload>
  </div>
</template>
<script setup>
import { uploadFileURL, uploadImage } from '@/api/upload.js'
import { ElMessage } from 'element-plus'
const props = defineProps({
  origin: {
    type: String,
    default: ''
  },
  index: Number,
  accept: {
    type: String,
    default: 'image/jpeg, image/jpg, image/png'
  },
  acceptList: {
    type: Array,
    default: () => {
      return []
    }
  },
  maxSize: {
    type: Number,
    default: 500
  }, // 最大上传的单位k
  disabled: {
    type: Boolean,
    default: false
  },
  showLoading: {
    type: Boolean,
    default: false
  }, // 是否显示Loading
  useCommonReason: {
    type: Boolean,
    default: false
  }, // 是否使用统一的错误原因
  commonReason: {
    type: String,
    default: ''
  } // 统一的错误原因
})
const requestHeaders = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token'),
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : '',
  userId: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')).userId
    : ''
})
const loading = ref(false)
const chooseFileName = ref('')
const emits = defineEmits(['success', 'updateLoading'])
// const uploadLoading = ref(false)
const handleHeadSuccess = res => {
  if (res && res.data) {
    emits('success', res.data, props.index, chooseFileName.value)
  } else {
    ElMessage.warning(`${res.msg}`)
  }
  loading.value = false
}
const handleHeadError = err => {
  console.error('handleHeadError', err)
  loading.value = false
}
const beforeHeadUploadFile = file => {
  console.log('file', file)
  chooseFileName.value = file.name
  const typeList =
    props.acceptList && props.acceptList.length > 0
      ? props.acceptList
      : ['image/jpeg', 'image/jpg', 'image/png']
  if (typeList.indexOf(file.type) === -1) {
    if (props.useCommonReason && props.commonReason) {
      ElMessage.warning(props.commonReason)
    } else {
      ElMessage.warning('仅支持png、jpg、jpeg格式的图片')
    }
    return false
  }
  console.log('上传文件的格式', file.type)
  if (file.size > 1024 * parseInt(props.maxSize)) {
    let limitStr = props.maxSize + 'K'
    if (props.maxSize > 1024) {
      limitStr = `${parseInt(props.maxSize / 1024)}M`
    }
    if (props.useCommonReason && props.commonReason) {
      ElMessage.warning(props.commonReason)
    } else {
      ElMessage.warning(`上传图片大小不能超过${limitStr}`)
    }
    return false
  }
  if (props.showLoading) {
    loading.value = true
  }
}
watch(
  () => loading.value,
  val => {
    emits('updateLoading', val)
  },
  {
    deep: true
  }
)
</script>
<style lang="scss" scoped></style>

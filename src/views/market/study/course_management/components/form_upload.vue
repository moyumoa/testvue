<template>
  <div class="upload_com">
    <div class="tip" v-if="tips">{{ tips }}</div>
    <template v-if="styleType === 'form'">
      <div class="upload_list">
        <div class="upload_item_wrapper" v-for="(item, index) in uploadFiles" :key="index">
          <!-- <img class="upload_item" :src="url" /> -->
          <el-image
            style="width: 100%; height: 100%"
            :src="item.url"
            fit="cover"
            :preview-src-list="previewList"
            :initial-index="index"
          ></el-image>
          <div class="close" @click="deleteItem(index)">
            <el-icon>
              <i-circle-close-filled />
            </el-icon>
          </div>
        </div>
        <div class="upload_item_wrapper" v-if="uploadFiles.length < count">
          <el-upload
            class="uploader"
            :disabled="$data.uploading"
            :action="uploadInfo.uploadUrl"
            :accept="uploadInfo.accept"
            :show-file-list="false"
            :on-success="
              res => {
                return handleSuccess(res, item)
              }
            "
            :before-upload="beforeUpload"
          >
            <div class="upload_btn" v-loading="$data.uploading">
              <el-icon size="24" color="#999">
                <i-plus />
              </el-icon>
              <div class="upload_btn_text">{{ btnText }}</div>
            </div>
          </el-upload>
        </div>
      </div>
    </template>
    <template v-else>
      <el-upload
        class="uploader"
        :disabled="$data.uploading"
        :action="uploadInfo.uploadUrl"
        :accept="uploadInfo.accept"
        :show-file-list="false"
        :on-success="
          res => {
            return handleSuccess(res, item)
          }
        "
        :before-upload="beforeUpload"
      >
        <el-button type="primary" :loading="$data.uploading">{{ btnText }}</el-button>
      </el-upload>
    </template>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
const props = defineProps({
  // 样式类型 form or btn
  styleType: {
    type: String,
    default: 'form'
  },
  // 用于外部双向绑定，与$data.uploadList数据一致
  uploadFiles: {
    type: Array,
    default: () => []
  },
  // 上传文件类型 image OR video
  uploadType: {
    type: String,
    default: 'image'
  },
  maxSize: Number, // 最大上传文件限制 单位KB
  count: Number, // 最大上次个数
  tips: String, // 上传提示
  // 上传按钮文字
  btnText: {
    type: String,
    default: '上传'
  }
})
const { styleType, uploadFiles, uploadType, maxSize, count, tips, btnText } = toRefs(props)
const emits = defineEmits('update:uploadFiles', 'success')
const enums = {
  image: {
    name: '图片',
    uploadUrl: '/api/mission/file/upload',
    accept: 'image/png,image/jpeg,image/jpg,image/gif'
  },
  video: {
    name: '视频',
    uploadUrl: '/api/mission/file/videoUploadReturnImg',
    accept: 'video/mp4'
  }
}
const uploadInfo = enums[uploadType.value]
const $data = reactive({
  uploading: false
})

// 挂载信息
const previewList = computed(() => {
  return uploadFiles.value.map(e => e.url)
})

// 删除
function deleteItem(index) {
  $data.uploading = false
  uploadFiles.value.splice(index, 1)
}
// 上传文件大小限制
function beforeUpload(file) {
  if (!maxSize.value) {
    $data.uploading = true
    return true
  }
  const isLimit = file.size / 1024 < maxSize.value
  let limitStr
  if (maxSize.value > 1024) {
    limitStr = `${parseInt(maxSize.value / 1024)}M`
  } else {
    limitStr = `${maxSize.value}K`
  }
  if (!isLimit) {
    ElMessage.error(`${uploadInfo.name}大小不能超过${limitStr}`)
  }
  $data.uploading = isLimit
  return isLimit
}
// 上传成功
function handleSuccess(res) {
  $data.uploading = false
  let fileInfo
  if (uploadType.value === 'image') {
    fileInfo = { url: res.data }
  } else if (uploadType.value === 'video') {
    fileInfo = res.data
  }
  if (count.value === 1) {
    emits('update:uploadFiles', [fileInfo])
  } else {
    uploadFiles.value.push(fileInfo)
  }
  emits('success', res)
}
</script>

<style lang="scss" scoped>
.tip {
  color: #c0c4cc;
  font-size: 14px;
}
.upload_list {
  display: flex;
  flex-wrap: wrap;
  .upload_item_wrapper {
    position: relative;
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    margin-right: 12px;
    margin-bottom: 12px;
    .upload_item {
      cursor: pointer;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .close {
      cursor: pointer;
      position: absolute;
      top: -10px;
      right: -10px;
      font-size: 20px;
      color: #f56c6c;
    }
  }
}
:deep .uploader {
  .upload_btn {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px dashed #d8d8d8;
    .upload_btn_text {
      font-size: 14px;
      margin-top: 5px;
      color: #333;
    }
  }
}
</style>

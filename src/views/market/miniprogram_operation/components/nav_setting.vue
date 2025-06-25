<template>
  <div class="nav_setting">
    <div class="container_title">标题栏设置</div>
    <div class="nav_box">
      <div class="nav_top">
        <el-image
          class="nav_img"
          :src="props.title"
          fit="cover"
          style="background: #fff"
          :preview-src-list="[props.title]"
        ></el-image>
        <div class="nav_btn">
          <div
            :class="{ default_btn: true, disabled_btn: props.title === props.defaultTitle }"
            @click="useDefaultFun"
          >
            恢复默认
          </div>

          <el-upload
            v-loading="uploadLoading"
            :show-file-list="false"
            accept="image/jpeg, image/jpg, image/png"
            :action="uploadFileURL"
            list-type="picture"
            :on-success="handleHeadSuccess"
            :on-error="handleHeadError"
            :before-upload="beforeHeadUploadFile"
          >
            <div class="default_btn">更改</div>
          </el-upload>
        </div>
      </div>
      <div class="nav_bottom">建议尺寸为702*108px，大小不超过500K，支持png、jpg、jpeg</div>
    </div>
  </div>
</template>
<script setup>
import { uploadFileURL } from '@/api/upload.js'
import { ElMessage } from 'element-plus'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  defaultTitle: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['updateTitle'])
const useDefaultFun = throttle(() => {
  if (props.title !== props.defaultTitle) {
    emits('updateTitle', props.defaultTitle)
  }
})

const uploadLoading = ref(false)
const handleHeadSuccess = res => {
  emits('updateTitle', res.data)
}
const handleHeadError = err => {
  console.error('handleHeadError', err)
}
const beforeHeadUploadFile = file => {
  console.log('file')
  const typeList = ['image/jpeg', 'image/jpg', 'image/png']
  if (typeList.indexOf(file.type) === -1) {
    ElMessage.warning('仅支持png、jpg、jpeg格式的图片')
    return false
  }
  console.log('上传文件的格式', file.type)
  if (file.size > 1024 * 500) {
    ElMessage.warning('上传图片大小不能超过500K')
    return false
  }
}
</script>
<style lang="scss" scoped>
@import './css/setting_page.scss';
.nav_setting {
  margin-bottom: 20px;
  .nav_box {
    width: 573px;
    height: 124px;
    background: #f6f7f8;
    border-radius: 4px;
    padding: 16px 0 16px 16px;
    .nav_bottom {
      margin-top: 16px;

      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
    .nav_top {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      .nav_img {
        width: 375px;
        height: 56px;
      }
      .nav_btn {
        width: calc(100% - 375px);
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        .default_btn {
          cursor: pointer;

          font-size: 14px;
          font-weight: 400;
          color: #364fcd;
          line-height: 20px;
          padding: 0 16px 4px 4px;
        }
        .disabled_btn {
          cursor: not-allowed;
          color: rgba(54, 79, 205, 0.3);
        }
      }
    }
  }
}
</style>

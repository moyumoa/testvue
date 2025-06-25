<template>
  <div class="decorate">
    <div class="title">
      <div>顶部导航</div>
      <div class="title_mark">
        顶部导航配置仅在一级页面生效，二级页面情况下，左上角统一展 示固定的“主页”和“返回”。
        <!-- <a>查看示例</a>
        -->
        <el-tooltip popper-class="title_tip" placement="top" effect="light">
          <template #content>
            <img style="width: 380px" src="@/assets/images/operate/second_page.png" alt="" />
          </template>
          <span>查看示例</span>
        </el-tooltip>
      </div>
    </div>
    <!-- 内容 -->
    <div class="content">
      <!-- 样式选择 -->
      <div class="one_content flex_between">
        <div class="label">样式选择</div>
        <div class="content_box">
          <rulePicker
            :ruleList="styleList"
            v-model:chooseValue="componentData.pageStyle"
          ></rulePicker>
        </div>
      </div>
      <!-- 背景图片 -->
      <div class="one_content" v-if="componentData.pageStyle == 'tmall'">
        <div class="label">背景图片</div>
        <div class="upload_box">
          <div class="one_upload" v-if="componentData.backImg">
            <img class="upload_img" :src="componentData.backImg" alt="" />
            <el-icon class="close_box" @click="delFun(index)">
              <i-circle-close-filled />
            </el-icon>
          </div>
          <div class="one_upload" v-else>
            <el-upload
              v-loading="fileLoading"
              ref="upload"
              :show-file-list="false"
              accept="image/jpeg, image/jpg, image/png, image/gif"
              :action="action"
              :on-success="handleSuccess"
              :on-error="handleError"
              :before-upload="beforeUploadFile"
            >
              <div class="upload_mark">
                <el-icon style="font-size: 14px; margin-bottom: 6px" class="icon_mark">
                  <i-plus />
                </el-icon>
                <p>上传背景图</p>
              </div>
            </el-upload>
          </div>
          <div class="upload_text">背景图大小为750px*540px,图片大小不得大于1M</div>
        </div>
      </div>
      <div v-else>
        <!-- 背景颜色 -->
        <div class="one_content flex_between">
          <div class="label">背景颜色</div>
          <div class="content_box flex_end">
            <colorPicker
              ref="colorPickerB"
              v-model:color="componentData.backgroundColor"
            ></colorPicker>
          </div>
        </div>
        <!-- 搜索框 -->
        <div class="one_content flex_between">
          <div class="label">搜索框</div>
          <div class="content_box flex_between">
            <div>{{ componentData.showSearch ? '显示' : '不显示' }}</div>
            <el-checkbox v-model="componentData.showSearch"></el-checkbox>
          </div>
        </div>
        <!-- 显示位置 -->
        <div class="one_content flex_between">
          <div class="label">显示位置</div>
          <div class="content_box">
            <rulePicker
              :ruleList="positionList"
              v-model:chooseValue="componentData.position"
            ></rulePicker>
          </div>
        </div>

        <!-- 标题设置 -->
        <div class="one_content flex_between">
          <div class="label">标题设置</div>
          <div class="content_box flex_between">
            <div>{{ componentData.showTitle ? '显示' : '不显示' }}</div>
            <el-checkbox v-model="componentData.showTitle"></el-checkbox>
          </div>
        </div>
        <!-- 字体颜色 -->
        <div class="one_content flex_between">
          <div class="label">字体颜色</div>
          <div class="content_box flex_end">
            <colorPicker ref="colorPickerB" v-model:color="componentData.color"></colorPicker>
          </div>
        </div>
        <!-- 字体大小 -->
        <div class="one_content flex_between">
          <div class="label">字体大小</div>
          <div class="content_box">
            <sliderPicker v-model:slider="componentData.fontSize" :min="0" :max="30"></sliderPicker>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import rulePicker from '../rule_picker/rule_picker.vue'
import colorPicker from '../color_picker/color_picker.vue'
import sliderPicker from '../slider_picker/slider_picker.vue'

defineComponent(colorPicker, rulePicker, sliderPicker)
const props = defineProps({
  componentData: {
    type: Object
  }
})
const componentData = computed(() => {
  return props.componentData
})
const styleList = ref([
  {
    label: '天猫样式',
    value: 'tmall',
    hideLabel: true
  },
  {
    label: '默认样式',
    value: 'normal',
    hideLabel: true
  }
])
const positionList = ref([
  {
    label: '居左',
    value: 'left',
    icon: 'icon-juzuo'
  },
  {
    label: '居中',
    value: 'center',
    icon: 'icon-juzhong'
  }
])
const message = inject('$message')
// 上传图片
const upload = ref()
const action = '/api/v1/brand/app/appDiyPage/uploadImg'
const fileLoading = ref(false) // 图片的loading

// 文件上传之前
function beforeUploadFile(file) {
  console.log(file)
  const size = file.size
  if (size > 1000000) {
    message({
      type: 'warning',
      message: '图片大小不能超过1M'
    })

    upload.value.clearFiles()
    return false
  }
  fileLoading.value = true
}

// 文件上传成功
function handleSuccess(res, file) {
  console.log('成功')
  console.log(res)
  console.log(file)
  if (res.code === 0) {
    message.success('图片上传成功')
    componentData.value.backImg = res.data
  } else {
    message.warning('图片上传失败')
  }
  console.log(res, file)

  fileLoading.value = false
  upload.value.clearFiles()
}
// 文件上传失败
function handleError() {
  fileLoading.value = false
  upload.value.clearFiles()
}
// 删除图片
function delFun() {
  componentData.value.backImg = ''
}
const emits = defineEmits(['upPageSetup'])
watch(
  () => componentData.value,
  newVal => {
    console.log('detaiaaa', newVal)
    emits('upPageSetup', newVal)
  },
  { deep: true }
)
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
.title_mark {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
  line-height: 17px;
  position: relative;
  span {
    color: #364fcd;
    cursor: pointer;
    &:hover {
      img {
        position: relative;
      }
    }
  }
  img {
    position: absolute;
    right: -16px;
    bottom: 20px;
    width: 380px;
    opacity: 0;
  }
}
.upload_box {
  margin-top: 8px;
  background: #eceef5;
  padding: 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .one_upload {
    width: 68px;
    height: 68px;
    background: #ffffff;
    box-shadow: 0px 2px 4px 0px rgba(95, 104, 147, 0.1);
    border-radius: 4px;
    margin-right: 16px;
    position: relative;
    .upload_img {
      width: 68px;
      height: 68px;
      border-radius: 4px;
      object-fit: cover;
    }
    .upload_mark {
      width: 68px;
      height: 68px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      color: #364fcd;
      font-size: 14px;
      p {
        font-size: 10px;
        font-weight: 400;
        color: #909399;
        line-height: 14px;
        transform: scale(0.9);
        margin: 7px 0;
      }
    }
    .close_box {
      opacity: 0;
      cursor: pointer;
      position: absolute;
      right: -10px;
      top: -10px;
      color: #bbb;
      background: #fff;
      border-radius: 100%;
      font-size: 24px;
    }
  }
  .one_upload:hover {
    .close_box {
      opacity: 1;
    }
  }
  .upload_text {
    width: calc(100% - 84px);
    font-size: 12px;
    font-weight: 400;
    color: #909399;
    line-height: 17px;
  }
}
</style>

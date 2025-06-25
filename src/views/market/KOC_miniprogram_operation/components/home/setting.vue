<template>
  <div class="operation-banner">
    <title-wrapper title="" :hasSolt="false" :subtitle="subtitle"></title-wrapper>
    <div class="container">
      <div class="container_title">内容设置</div>
      <div class="add-and-tips">
        <div class="add-icon" @click="addItem"></div>
        <div class="add" @click="addItem">添加Banner图（{{ $data.list.length }}/5）</div>
        <div class="tips">建议尺寸为686*240px，单个不超过2M，支持png、jpg、jpeg</div>
      </div>
      <draggable
        v-model="$data.list"
        group="banner_setting"
        @start="drag = true"
        @end="drag = false"
        item-key="index"
        handle=".icon-tuodongweizhi"
        :animation="300"
      >
        <template #item="{ element, index }">
          <div class="main">
            <banner-dialog :info="element" type="operation"></banner-dialog>
            <sort-icon :list="$data.list" :index="index" :hasMove="true"></sort-icon>
          </div>
        </template>
      </draggable>
      <div class="container_title" style="padding-top: 4px">主题设置</div>
      <div class="container_form">
        <div class="one_form">
          <div class="form_label">首页菜单及页面名称：</div>
          <div class="form_content">
            <el-input
              show-word-limit
              maxlength="8"
              style="width: 328px"
              @blur="retEmitEmj($event)"
              v-model.trim="$data.themeInfo.name"
              placeholder="请输入首页菜单名称，如“粉丝活动”"
            ></el-input>
          </div>
        </div>
        <div class="one_form">
          <div class="form_label">主题色：</div>
          <div class="form_content">
            <div class="one_color">
              <span>主题色一</span>
              <colorPicker
                ref="colorPickerA"
                v-model:color="$data.themeInfo.theme1"
                :defatultColor="'#333333'"
              ></colorPicker>
            </div>
            <div class="one_color">
              <span>主题色二</span>
              <colorPicker
                ref="colorPickerB"
                v-model:color="$data.themeInfo.theme2"
                :defatultColor="'#3865F3'"
              ></colorPicker>
            </div>
          </div>
        </div>
        <div class="one_form">
          <div class="form_label">背景样式：</div>
          <div class="form_content">
            <el-radio-group v-model="$data.themeInfo.backgroundStyle">
              <div class="one_radio">
                <el-radio :label="1">纯色背景</el-radio>
                <colorPicker
                  v-if="$data.themeInfo.backgroundStyle === 1"
                  ref="colorPickerC"
                  v-model:color="$data.themeInfo.backgroundColor"
                  :defatultColor="'#F1F3F7'"
                ></colorPicker>
              </div>
              <div class="one_radio">
                <el-radio :label="2">图片背景</el-radio>
                <div class="radio_tip" v-if="$data.themeInfo.backgroundStyle === 2">
                  请上传规格为375*812px的图片，不超过10M，支持png、jpg、jpeg图片格式
                </div>
              </div>
            </el-radio-group>
            <div
              class="upload_img"
              style="width: 122px"
              v-if="$data.themeInfo.backgroundStyle === 2"
            >
              <!-- 已上传 -->
              <div class="upload_over" v-if="$data.themeInfo.backgroundUrl">
                <el-image
                  class="img_img"
                  :src="$data.themeInfo.backgroundUrl"
                  fit="cover"
                  :preview-src-list="[$data.themeInfo.backgroundUrl]"
                ></el-image>
                <img
                  class="del_img"
                  @click.stop="$data.themeInfo.backgroundUrl = ''"
                  src="https://tagvv-1256030678.file.myqcloud.com/202505273pl83.png"
                  alt=""
                />
              </div>
              <!-- 未上传 -->
              <uploadImage
                key="backgroundUrl"
                v-else
                :maxSize="10240"
                :index="1"
                @success="uploadImgSuccess"
                :showLoading="true"
              >
                <div class="upload_ing">
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div class="text1">添加背景图</div>
                </div>
              </uploadImage>
            </div>
          </div>
        </div>
      </div>
      <div class="container_title" style="padding-top: 20px">注册页面设置</div>
      <div class="container_form">
        <div class="one_form">
          <div class="form_label form_label_valid" style="line-height: 20px">
            注册页面企业logo：
          </div>
          <div class="form_content">
            <div class="upload_tip">
              请上传规格为120*120px的图片，支持png、jpg、jpeg图片格式，不超过10M，将显示在用户注册页面，
              <el-tooltip popper-class="tooltip-class" placement="right-start" raw-content>
                <template #content>
                  <div class="tooltip_content">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20250529y322y.jpg"
                      style="width: 100px; display: flex; border-radius: 2px"
                    />
                  </div>
                </template>
                <span class="remark">示例</span>
              </el-tooltip>
            </div>
            <div class="upload_img" style="margin-left: 0; width: 92px">
              <!-- 已上传 -->
              <div class="upload_over img_90" v-if="$data.logo">
                <el-image
                  class="img_img img_90"
                  :src="$data.logo"
                  fit="cover"
                  :preview-src-list="[$data.logo]"
                ></el-image>
                <img
                  class="del_img"
                  @click.stop="$data.logo = ''"
                  src="https://tagvv-1256030678.file.myqcloud.com/202505273pl83.png"
                  alt=""
                />
              </div>
              <!-- 未上传 -->
              <uploadImage
                key="logo"
                v-else
                :maxSize="10240"
                :index="1"
                @success="uploadImgSuccess2"
                :showLoading="true"
              >
                <div class="upload_ing img_90">
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div class="text1">添加图片</div>
                </div>
              </uploadImage>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import uploadImage from '@/views/market/miniprogram_operation/components/upload_image.vue'
import draggable from 'vuedraggable'
import { ElMessage } from 'element-plus'
import TitleWrapper from '@/views/market/miniprogram_operation/components/title_wrapper.vue'
import BannerDialog from '../components/banner_dialog.vue'
import SortIcon from '@/views/market/miniprogram_operation/components/sort_icon.vue'
import colorPicker from '../components/color_picker.vue'
import { isNotEmpty, isEmpty } from '@/utils/tools'
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {}
    }
  }
})
const drag = ref(false)
const $data = reactive({
  list: [], // banner图信息
  themeInfo: {
    name: '', // 首页菜单名称
    theme1: '#333333', // 主题色一
    theme2: '#3865F3', // 主题色二
    backgroundStyle: 1, // 1 纯色背景 2 图片背景
    backgroundColor: '#F1F3F7', // 纯色背景的色值
    backgroundUrl: '' // 图片背景的地址
  }, // 主题色信息
  logo: '' // 企业Logo
})

const subtitle = `图片将展示在小程序首页，向员工传递关键运营信息。最多支持上传5张图片进行轮播，支持点击跳转任务页面`
function init() {
  if (props.data.KOCInfo) {
    const KOCInfo = props.data.KOCInfo
    if (isNotEmpty(KOCInfo.bannerList)) {
      $data.list = JSON.parse(JSON.stringify(KOCInfo.bannerList))
    } else {
      $data.list = []
    }
    if (isNotEmpty(KOCInfo.themeInfo)) {
      const themeInfo = JSON.parse(JSON.stringify(KOCInfo.themeInfo))
      if (isEmpty(themeInfo.theme1)) {
        themeInfo.theme1 = '#333333'
      }
      if (isEmpty(themeInfo.theme2)) {
        themeInfo.theme2 = '#3865F3'
      }
      if (isEmpty(themeInfo.backgroundStyle)) {
        themeInfo.backgroundStyle = 1
      }
      if (isEmpty(themeInfo.backgroundColor)) {
        themeInfo.backgroundColor = '#F1F3F7'
      }
      $data.themeInfo = themeInfo
    } else {
      $data.themeInfo = {
        name: '', // 首页菜单名称
        theme1: '#333333', // 主题色一
        theme2: '#3865F3', // 主题色二
        backgroundStyle: 1, // 1 纯色背景 2 图片背景
        backgroundColor: '#F1F3F7', // 纯色背景的色值
        backgroundUrl: '' // 图片背景的地址
      }
    }
    $data.logo = KOCInfo.logo || ''
  } else {
    $data.list = []
    $data.themeInfo = {
      name: '', // 首页菜单名称
      theme1: '#333333', // 主题色一
      theme2: '#3865F3', // 主题色二
      backgroundStyle: 1, // 1 纯色背景 2 图片背景
      backgroundColor: '#F1F3F7', // 纯色背景的色值
      backgroundUrl: '' // 图片背景的地址
    }
    $data.logo = ''
  }
  console.log('获取到的首页信息', props.data)
}
init()
const addItem = () => {
  if ($data.list.length === 5) {
    return ElMessage.warning('最多支持上传5张图片进行轮播')
  }
  $data.list.push({
    coverUrl: '',
    type: 1, // 1 不跳转， 2, 任务
    radio: 1,
    jump: {}
  })
}

// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  $data.themeInfo.name = e.target.value.replace(reg, '')
}

function uploadImgSuccess(e) {
  $data.themeInfo.backgroundUrl = e
}
function uploadImgSuccess2(e) {
  $data.logo = e
}

const emits = defineEmits(['updateSetting'])
watch(
  () => $data.list,
  value => {
    emits('updateSetting', 'mission:KOC', value, 'bannerList')
  },
  { deep: true, immediate: true }
)
watch(
  () => $data.themeInfo,
  value => {
    emits('updateSetting', 'mission:KOC', value, 'themeInfo')
  },
  { deep: true, immediate: true }
)
watch(
  () => $data.logo,
  value => {
    emits('updateSetting', 'mission:KOC', value, 'logo')
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
@import '@/views/market/miniprogram_operation/components/css/setting_page.scss';
.operation-banner {
  background-color: #fff;
  color: #909399;
  font-size: 14px;

  .container {
    .add-and-tips {
      line-height: 22px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 0px 0 21px;
      .add-icon {
        cursor: pointer;
        width: 20px;
        height: 20px;
        background-image: url('https://tagvv-1256030678.file.myqcloud.com/202210212istj.png');
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }

      .add {
        cursor: pointer;
        color: $theme-color;
        font-size: 16px;
        margin: 0 12px 0 5px;
      }
    }

    .main {
      position: relative;
      width: 468px;
    }
  }
  .container_v1 {
    :deep(.banner-dialog) {
      min-height: unset !important;
      padding-bottom: 16px !important;
    }
  }
}
:deep(.el-radio) {
  margin-right: 16px !important;
  &:last-child {
    margin-right: 0 !important;
  }
}

.container_form {
  .one_form {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .form_label {
      min-width: 140px;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      line-height: 32px;
    }
    .form_label_valid::before {
      content: '*';
      color: var(--el-color-danger);
      margin-right: 4px;
    }
    .one_color {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      span {
        font-weight: 400;
        font-size: 14px;
        color: #323233;
        line-height: 20px;
        margin-right: 16px;
      }
    }
    .one_color + .one_color {
      margin-top: 16px;
    }
    :deep(.el-radio-group) {
      height: max-content;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      .el-radio__label {
        font-weight: 400;
        font-size: 14px;
        color: #323233;
        line-height: 20px;
      }
    }
    .one_radio {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .radio_tip {
        width: max-content;
        font-weight: 400;
        font-size: 14px;
        color: #909399;
        line-height: 20px;
      }
    }
    .one_radio + .one_radio {
      margin-top: 6px;
    }
  }
  .one_form + .one_form {
    margin-top: 20px;
  }
  .upload_img {
    margin-left: 22px;
    margin-top: 12px;
  }
  .upload_ing {
    width: 121px;
    height: 227px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px dashed #dcdee0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &:hover {
      border-color: $theme_color;
    }
    .icon-plus {
      color: #909399;
      font-size: 20px;
    }
    .text1 {
      margin-top: 4px;
      font-size: 14px;
      font-weight: 400;
      color: #333333;
      line-height: 20px;
    }
  }
  .upload_over {
    width: 121px;
    height: 227px;
    border-radius: 2px;
    position: relative;
    .img_img {
      width: 121px;
      height: 227px;
      border-radius: 2px;
      object-fit: cover;
    }
    .del_img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      position: absolute;
      top: -8px;
      right: -8px;
      cursor: pointer;
      opacity: 0;
    }
  }
  .upload_over:hover {
    .del_img {
      opacity: 1;
    }
  }
  .upload_tip {
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    line-height: 20px;
    span {
      color: #364fcd;
    }
  }
  .tooltip_content {
    img {
      width: 100px;
      display: flex;
      border-radius: 2px;
    }
  }
  .img_90 {
    width: 90px !important;
    height: 90px !important;
  }
}
</style>

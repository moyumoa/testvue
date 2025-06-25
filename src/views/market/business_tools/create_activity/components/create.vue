<template>
  <div class="setting_block">
    <!-- <div class="setting_title">{{ activityInfo.title }}</div> -->
    <div class="setting_main">
      <div class="setting_box">
        <!-- 活动标题 -->
        <el-form-item label="活动标题：" prop="name">
          <el-input
            :disabled="activityInfo.disabled"
            v-model.trim="activityInfo.name"
            placeholder="请输入活动标题，最多20个汉字"
            maxlength="20"
            :autosize="{ minRows: 1, maxRows: 1 }"
          ></el-input>
        </el-form-item>
        <!-- 活动头图 -->
        <el-form-item label="活动头图：" prop="activityHeadImg">
          <div>
            <div class="mark" style="line-height: 32px">
              首张头图将作为活动封面图，图片建议尺寸750*750px，每张图片大小不超过500K
            </div>
            <div class="file_box">
              <div
                class="upload_item_wrapper"
                v-for="(url, index) in activityInfo.headImgList"
                :key="index"
              >
                <el-image
                  style="width: 100%; height: 100%"
                  :src="url"
                  fit="cover"
                  :preview-src-list="activityInfo.headImgList"
                  :initial-index="index"
                ></el-image>
                <div
                  class="close"
                  @click="deleteImageDemo(index, 1)"
                  v-if="!disabled && !activityInfo.disabled"
                >
                  <el-icon>
                    <i-circle-close-filled />
                  </el-icon>
                </div>
              </div>
              <el-upload
                v-loading="activityInfo.headImgLoading"
                v-if="activityInfo.headImgList.length < 5 && !activityInfo.disabled"
                :show-file-list="false"
                accept="image/jpeg, image/jpg, image/png"
                :action="data.uploadImgUrl"
                :headers="headers"
                list-type="picture"
                :on-success="handleHeadSuccess"
                :on-error="handleHeadError"
                :before-upload="beforeHeadUploadFile"
              >
                <div class="upload_text">
                  <img src="@/assets/images/operate/inspection_add.png" alt />
                  {{ `${activityInfo.headImgList.length}/5` }}
                </div>
              </el-upload>
            </div>
          </div>
        </el-form-item>
        <!-- 服务原价 -->
        <el-form-item label="服务原价：" prop="originalPrice" hide-required-asterisk="true">
          <el-input
            class="price"
            :disabled="activityInfo.disabled"
            v-model.trim="activityInfo.originalPrice"
            placeholder="请输入价格，最多保留两位小数"
            maxlength="20"
            :autosize="{ minRows: 1, maxRows: 1 }"
          ></el-input>
          <text style="margin-left: 12px">元</text>
        </el-form-item>
        <!-- 服务售价 -->
        <el-form-item label="服务售价：" prop="sellingPrice" hide-required-asterisk="true">
          <el-input
            class="price"
            :disabled="activityInfo.disabled"
            v-model.trim="activityInfo.sellingPrice"
            placeholder="请输入价格，最多保留两位小数"
            maxlength="20"
            :autosize="{ minRows: 1, maxRows: 1 }"
          ></el-input>
          <text style="margin-left: 12px">元</text>
        </el-form-item>
        <!-- 活动页结构 -->
        <el-form-item label="活动页结构" prop="structureType">
          <el-radio-group v-model="activityInfo.structureType" :disabled="activityInfo.disabled">
            <el-radio :label="1">电商模式</el-radio>
            <el-radio :label="2">通铺模式</el-radio>
          </el-radio-group>
          <div class="explain_box">
            <div class="one_explain">
              <span>页面按照正常结构展示主图、标题等信息</span>
              <!-- <span class="view_example" @click="handleShowFigure(1)">查看示例</span> -->
            </div>
            <div class="one_explain">
              <span>整个详情页只展示商品详情信息</span>
              <!-- <span class="view_example" @click="handleShowFigure(2)">查看示例</span> -->
            </div>
          </div>
        </el-form-item>
        <!-- 图文详情 -->
        <el-form-item label="图文详情：" prop="activityDetailImg">
          <div>
            <div class="mark" style="line-height: 32px">请上传至少一张，每张图片大小不超过500K</div>
            <div class="file_box">
              <div
                class="upload_item_wrapper"
                v-for="(url, index) in activityInfo.detailImgList"
                :key="index"
              >
                <el-image
                  style="width: 100%; height: 100%"
                  :src="url"
                  fit="cover"
                  :preview-src-list="activityInfo.detailImgList"
                  :initial-index="index"
                ></el-image>
                <div
                  class="close"
                  @click="deleteImageDemo(index)"
                  v-if="!disabled && !activityInfo.disabled"
                >
                  <el-icon>
                    <i-circle-close-filled />
                  </el-icon>
                </div>
              </div>
              <el-upload
                v-loading="activityInfo.detailImgLoading"
                v-if="activityInfo.detailImgList.length < 5 && !activityInfo.disabled"
                :show-file-list="false"
                accept="image/jpeg, image/jpg, image/png"
                :action="data.uploadImgUrl"
                :headers="headers"
                list-type="picture"
                :on-success="handleDetailSuccess"
                :on-error="handleDetailError"
                :before-upload="beforeDetailUploadFile"
              >
                <div class="upload_text">
                  <img src="@/assets/images/operate/inspection_add.png" alt />
                  {{ `${activityInfo.detailImgList.length}/5` }}
                </div>
              </el-upload>
            </div>
          </div>
        </el-form-item>
        <!-- 自定义标识 -->
        <el-form-item label="自定义标识：">
          <el-input
            v-model.trim="activityInfo.identity"
            :disabled="activityInfo.disabled"
            :maxlength="45"
            placeholder="请输入自定义标识，最多45字"
            :autosize="{ minRows: 1, maxRows: 1 }"
          ></el-input>
        </el-form-item>
      </div>
      <!-- 试图展示图 -->
      <div class="figure_box" v-if="showFigure">
        <img class="phone_head" src="@/assets/images/phone_head.png" alt="" />
        <div class="content">
          <template v-if="data.showType === 1">
            <img
              class="headImg"
              :src="activityInfo.headImgList[0]"
              v-if="activityInfo.headImgList[0]"
              alt=""
            />
            <img class="headImg" src="@/assets/images/default_headImg.png" v-else alt="" />
            <div class="box">
              <div class="price_box">
                <template v-if="activityInfo.sellingPrice">
                  <span class="unit">¥</span>
                  <span class="price1">{{ activityInfo.sellingPrice }}</span>
                </template>
                <span class="original_price" v-if="activityInfo.originalPrice">
                  {{ activityInfo.originalPrice }}
                </span>
              </div>
              <div class="title" v-if="activityInfo.name">{{ activityInfo.name }}</div>
            </div>
            <div class="text_box">
              <span class="line"></span>
              <span class="text">活动详情</span>
              <span class="line"></span>
            </div>
            <template v-if="activityInfo.detailImgList[0]">
              <img
                v-for="(item, index) in activityInfo.detailImgList"
                :key="index"
                class="detail_box"
                :src="item"
              />
            </template>
            <img class="detail_box" src="@/assets/images/default_detailImg.png" v-else />
          </template>
          <template v-else>
            <template v-if="activityInfo.detailImgList[0]">
              <img
                v-for="(item, index) in activityInfo.detailImgList"
                :key="index"
                class="detail_img"
                :src="item"
              />
            </template>
            <img class="detail_img" src="@/assets/images/default_detailImg.png" v-else />
          </template>
        </div>
        <div class="btn">立即预约</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activityInfo: Object
  // disabled: Boolean
})
const { activityInfo } = reactive(toRefs(props))
// console.log(disabled)
const message = inject('$message')
const showFigure = ref(false)
const data = reactive({
  uploadImgUrl: '/api/mission/file/upload', // 图片上传地址
  headImgLoading: false, // 活动头图上传时的loading状态
  detailImgLoading: false, // 图文详情上传时的loading状态
  showType: 1 // 示例展示的模式 (1: 电商模式    2: 通铺模式)
})
const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token'),
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : '',
  userId: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')).userId
    : ''
})
// 活动头图上传前的回调 （限制图片上传的大小）
function beforeHeadUploadFile(file) {
  console.log('活动头图上传前的回调')
  const isLimit = file.size / 1024 / 1024 < 0.5
  if (!isLimit) {
    message.error('图片大小不能超过500K')
  }
  data.headImgLoading = isLimit
  return isLimit
}
// 活动头图上传成功的回调
function handleHeadSuccess(res, item) {
  console.log('活动头图上传成功的回调')
  data.headImgLoading = false
  activityInfo.headImgList.push(res.data)
}
// 图文详情上传前的回调 （限制图片上传的大小）
function beforeDetailUploadFile(file) {
  console.log('图文详情上传前的回调')
  const isLimit = file.size / 1024 / 1024 < 0.5
  if (!isLimit) {
    message.error('图片大小不能超过500K')
  }
  data.detailImgLoading = isLimit
  return isLimit
}
// 图文详情上传成功的回调
function handleDetailSuccess(res, item) {
  console.log('图文详情上传成功的回调')
  data.detailImgLoading = false
  activityInfo.detailImgList.push(res.data)
}
// 删除图片
function deleteImageDemo(index, type) {
  if (type) {
    activityInfo.headImgList.splice(index, 1)
  } else {
    activityInfo.detailImgList.splice(index, 1)
  }
}
// 展示示例的回调
function handleShowFigure(type) {
  showFigure.value = true
  data.showType = type
}
// 监听选择的是正常模式还是全图模式
watch(
  () => activityInfo.structureType,
  (newVal, oldVal) => {
    if (newVal === 1) {
      handleShowFigure(1)
    } else {
      handleShowFigure(2)
    }
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
.mark {
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
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
:deep(.el-upload--picture) {
  width: 118px;
  height: 118px;
  border-radius: 0;
  border: 1px dashed #dbdfe7;
  background: #fff;
  &:hover {
    border-color: $theme_color;
  }
}
.price {
  width: 260px;
}
:deep(.el-radio:last-child) {
  margin-left: 275px;
}
.explain_box {
  display: flex;
  height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: #c0c4cc;
  line-height: 20px;
  .one_explain:last-child {
    margin-left: 132px;
  }
  .view_example {
    color: #364fcd;
    margin-left: 8px;
    cursor: pointer;
  }
}
.setting_box {
  min-width: 884px;
}
// 示例图
.figure_box {
  position: relative;
  height: 533px;
  background-color: rgba(71, 75, 97, 0.05);
  box-shadow: 4px 4px 8px 0px rgba(71, 75, 97, 0.2);
  border-radius: 8px;
  margin-left: 100px;
  .content {
    &::-webkit-scrollbar {
      display: none;
    }
    margin-top: 59px;
    min-width: 280px;
    width: 280px;
    height: 477px;
    font-size: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    border-radius: 0 0 8px 8px;
  }
  .phone_head {
    width: 280px;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 8px 8px 0 0;
    object-fit: cover;
  }
  .headImg {
    width: 281px;
    height: 280px;
    object-fit: cover;
  }
  .box {
    // width: 280px;
    padding: 12px 10px;
    background: #ffffff;
    .price_box {
      display: flex;
      height: 20px;
      align-items: flex-end;
      .unit {
        padding-bottom: 4px;
        font-size: 9px;
        font-weight: 500;
        color: #fd2d54;
        line-height: 12px;
      }
      .price1 {
        margin-left: 2px;
        font-size: 14px;
        font-weight: bold;
        color: #fd2d54;
        line-height: 20px;
      }
      .original_price {
        margin-left: 5px;
        padding-bottom: 4px;
        font-size: 7px;
        font-weight: 400;
        color: #b2b3b6;
        line-height: 10px;
        text-decoration: line-through;
      }
    }
    .title {
      font-size: 9px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: bold;
      color: #1f2329;
      line-height: 13px;
    }
  }
  .text_box {
    padding: 12px 10px;
    margin-top: 6px;
    align-content: center;
    padding-left: 78px;
    display: flex;
    background: #ffffff;
    .line {
      width: 28px;
      height: 1px;
      margin-top: 5px;
      background-color: #dddddd;
    }
    .text {
      margin: 0 12px;
      font-size: 8px;
      font-weight: 400;
      color: #666666;
      line-height: 11px;
    }
  }
  .detail_box {
    // height: 500px;
    width: 280px;
    object-fit: cover;
  }
  .btn {
    position: absolute;
    left: 0;
    bottom: 24px;
    width: 280px;
    height: 44px;
    line-height: 44px;
    background: #fd2d54;
    border-radius: 2px;
    font-size: 15px;
    font-weight: 400;
    color: #ffffff;
    text-align: center;
  }
  // .dormintory_mode_box {
  //   width: 280px;
  //   height: 477px;
  //   background-color: #ffffff;
  // }
  .detail_img {
    width: 280px;
    // height: 477px;
    object-fit: cover;
  }
}
</style>

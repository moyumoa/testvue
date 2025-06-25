<template>
  <div class="page_box">
    <div class="detail_page" v-loading="loading">
      <div class="page_left">
        <video
          ref="titleInput"
          class="video_dom"
          :src="info.videoPlayUrl"
          :poster="info.videoCoverUrl || defaultCover"
          controls
        ></video>
      </div>
      <div class="page_right">
        <el-form
          :hide-required-asterisk="true"
          class="form_box"
          :model="info"
          :rules="rules"
          ref="ruleForm"
          label-width="88"
        >
          <!-- 基本信息 -->
          <div class="one_info">
            <!-- 每个设置项的标题 -->
            <div class="info_title">
              <div class="title_line"></div>
              <div class="title_text">基本信息</div>
            </div>
            <!-- 每个设置项的具体内容 -->
            <div class="info_content">
              <el-form-item label="标题" prop="videoTitle">
                <el-input
                  class="input_textarea"
                  :rows="7"
                  type="textarea"
                  v-model.trim="info.videoTitle"
                  @blur="retEmit($event, 'videoTitle')"
                  maxlength="1000"
                  resize="none"
                  placeholder=""
                ></el-input>
              </el-form-item>
              <el-form-item label="拍摄难度" prop="shootDifficult">
                <el-rate v-model="info.shootDifficult" />
              </el-form-item>
              <el-form-item label="订阅词" prop="subscribeWord">
                <el-input
                  @blur="retEmit($event, 'subscribeWord')"
                  maxlength="20"
                  v-model.trim="info.subscribeWord"
                  placeholder=""
                  clearable
                  class="form_input"
                ></el-input>
              </el-form-item>
            </div>
          </div>
          <!-- 来源信息 -->
          <div class="one_info">
            <!-- 每个设置项的标题 -->
            <div class="info_title">
              <div class="title_line"></div>
              <div class="title_text">来源信息</div>
            </div>
            <!-- 每个设置项的具体内容 -->
            <div class="info_content">
              <div class="form_row">
                <el-form-item label="来源平台" prop="platform">
                  <el-select
                    class="form_select"
                    placeholder="请选择"
                    v-model="info.platform"
                    style="width: 220px"
                  >
                    <el-option
                      v-for="item in platformList"
                      :key="item.id"
                      :value="item.id"
                      :label="item.name"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="form_row" style="align-items: center">
                <div class="one_origin" style="margin-right: 55px">
                  <div class="origin_label">来源账号</div>
                  <div class="origin_info">
                    <img class="info_img" v-if="brandLogo" :src="brandLogo" />
                    {{ brandInfo.brandName || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </div>
    <div
      class="page_bottom"
      v-if="!loading"
      :style="{
        left: `${isHideLeftMenu ? '0' : isCollapse ? '210px' : '63px'}`,
        width: `calc(100% - ${isHideLeftMenu ? '0' : isCollapse ? '210px' : '63px'})`,
        minWidth: `calc(${isHideLeftMenu ? '1200px' : '1366px'} -  ${
          isHideLeftMenu ? '0' : isCollapse ? '210px' : '63px'
        })`
      }"
    >
      <el-button type="primary" @click="saveFun">保存</el-button>
      <el-button @click="cancelFun">返回</el-button>
    </div>
  </div>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import { throttle } from '@/utils/tools.js'

import { mediaInfoParam } from '@/api/content_center/material_library.js'
import {
  findChildrenByKey,
  saveInspirationVideo,
  inspirationVideoDetail
} from '@/api/content_center/video_library.js'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
const store = useStore()
const ruleForm = ref(null)

const brandLogo = computed(() => store.state.user.brandLogo)
const isHideLeftMenu = store.getters.isHideLeftMenu
const isCollapse = store.getters.isCollapse
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')
const id = ref(null)
const loading = ref(true)
const isEdit = ref(false) // 是否是修改
const info = ref({
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : 0, // 品牌ID 初次是0
  uploadType: 1, // 上传方式
  videoStatus: 0, // 灵感状态 初次是0 (0:隐藏 1:对所有品牌可见)
  videoPlayUrl: '', // 灵感播放地址
  videoCoverUrl: '', // 灵感封面
  videoTitle: '', // 标题
  tradeId: null, // 行业id
  categoryId: null, // 细分类别id
  contentId: null, // 内容定位id
  sourceSwitch: 1, // 来源信息的开关
  platform: null, // 来源平台
  accountFansCount: null, // 粉丝数
  sourceLink: null, // 来源链接
  performanceSwitch: 0, // 表现数据的开关
  diggCount: null, // 点赞数
  commentCount: null, // 评论数
  shareCount: null, // 分享数
  analysisSwitch: 1, // 灵感解析的开关
  shootDifficult: 0, // 拍摄难度
  videoLabel: '', // 灵感标签--给后端的 id拼接成的字符串
  videoLabels: [], // 灵感标签--前端展示用的
  videoAnalysis: '', // 灵感分析
  shootSuggest: '', // 拍摄建议
  videoCopywriting: '' // 灵感文案
})
// 来源平台的验证
const validatePlatform = (rule, value, callback) => {
  // if (info.value.sourceSwitch === 1) {
  if (value) {
    callback()
  } else {
    callback(new Error('请选择来源平台'))
  }
  // } else {
  //   callback()
  // }
}
// 粉丝数的验证
const validateFans = (rule, value, callback) => {
  if (info.value.sourceSwitch === 1) {
    if (
      value !== '' &&
      value !== null &&
      value !== undefined &&
      parseInt(value) <= 99999999 &&
      parseInt(value) >= 0
    ) {
      callback()
    } else {
      callback(new Error('请正确填写粉丝数'))
    }
  } else {
    callback()
  }
}

// 点赞数的验证
const validateDigg = (rule, value, callback) => {
  if (info.value.performanceSwitch === 1) {
    if (
      value !== '' &&
      value !== null &&
      value !== undefined &&
      parseInt(value) <= 99999999 &&
      parseInt(value) >= 0
    ) {
      callback()
    } else {
      callback(new Error('请正确填写点赞数'))
    }
  } else {
    callback()
  }
}
// 评论数的验证
const validateComment = (rule, value, callback) => {
  if (info.value.performanceSwitch === 1) {
    if (
      value !== '' &&
      value !== null &&
      value !== undefined &&
      parseInt(value) <= 99999999 &&
      parseInt(value) >= 0
    ) {
      callback()
    } else {
      callback(new Error('请正确填写评论数'))
    }
  } else {
    callback()
  }
}
// 分享数的验证
const validateShare = (rule, value, callback) => {
  if (info.value.performanceSwitch === 1) {
    if (
      value !== '' &&
      value !== null &&
      value !== undefined &&
      parseInt(value) <= 99999999 &&
      parseInt(value) >= 0
    ) {
      callback()
    } else {
      callback(new Error('请正确填写分享数'))
    }
  } else {
    callback()
  }
}
// 拍摄难度的验证
const validateShoot = (rule, value, callback) => {
  if (info.value.analysisSwitch === 1) {
    if (value) {
      callback()
    } else {
      callback(new Error('请选择拍摄难度'))
    }
  } else {
    callback()
  }
}
const rules = {
  videoTitle: [
    {
      required: true,
      message: '请输入灵感标题',
      trigger: 'blur'
    }
  ],
  subscribeWord: [
    {
      required: true,
      message: '请输入订阅词',
      trigger: 'blur'
    }
  ],
  tradeId: [{ required: true, type: 'number', message: '请选择行业', trigger: 'change' }],
  categoryId: [{ required: true, type: 'number', message: '请选择细分类别', trigger: 'change' }],
  contentId: [{ required: true, type: 'number', message: '请选择内容定位', trigger: 'change' }],

  platform: [{ required: true, type: 'number', validator: validatePlatform, trigger: 'change' }],
  accountFansCount: [{ required: true, validator: validateFans, trigger: 'blur' }],

  diggCount: [{ required: true, validator: validateDigg, trigger: 'blur' }],
  commentCount: [{ required: true, validator: validateComment, trigger: 'blur' }],
  shareCount: [{ required: true, validator: validateShare, trigger: 'blur' }],

  shootDifficult: [{ required: true, validator: validateShoot, trigger: 'change' }]
}
// const contentList = ref([]) // 内容定位的列表
const platformList = ref([]) // 来源平台列表
// const labelList = ref([]) // 标签列表
// --根据key去查询对应的数据 type类型:trade行业 category细分类别 content内容定位 label标签 platform来源平台
function getKey(key, type) {
  findChildrenByKey({
    brandId: 0,
    key: key
  }).then(res => {
    if (res.code === 0) {
      const list = res.data || []
      switch (type) {
        case 'content':
          // contentList.value = list
          break
        case 'label':
          // labelList.value = list
          break
        case 'platform':
          platformList.value = list
          break
      }
    }
  })
}
const route = useRoute()
const router = useRouter()
onMounted(() => {
  ruleForm.value.resetFields()
  // getKey('content', 'content')
  getKey('platform', 'platform')
  console.log('id', route.query.id)
  if (route.query.id) {
    isEdit.value = true
    id.value = route.query.id || null
    getDetail()
  } else {
    isEdit.value = false

    const videoInfo = sessionStorage.getItem('library_video')
    const linkInfo = sessionStorage.getItem('library_link')
    if (videoInfo) {
      // 如果是本地上传的 videoinfo就是灵感地址
      info.value.videoPlayUrl = videoInfo
      info.value.videoCoverUrl = videoInfo + '?x-oss-process=video/snapshot,t_1000,m_fast'
      info.value.sourceSwitch = 1
      info.value.performanceSwitch = 0
      info.value.diggCount = 0
      info.value.commentCount = 0
      info.value.shareCount = 0
      info.value.analysisSwitch = 1
      info.value.uploadType = 1
      // 通过地址获取视频时长，根据时长设置对应的拍摄难度
      getVideoDuration()
    } else {
      // 如果是链接载入的 LinkInfo就是链接对应的灵感信息 包括灵感地址、账号信息、来源等
      info.value = JSON.parse(linkInfo)
      if (info.value.videoTitle && info.value.videoTitle.length > 15) {
        info.value.videoTitle = info.value.videoTitle.substring(0, 15)
      }
      info.value.sourceSwitch = 1
      info.value.platform = 1 // 载入的云灵感来源也要增加快手和小红书
      info.value.performanceSwitch = 1
      info.value.analysisSwitch = 1
      info.value.brandId = localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo')).brandId
        : 0
      info.value.videoStatus = 0
      info.value.uploadType = 1
    }
    initHtml()
  }
})
function getDetail() {
  inspirationVideoDetail({
    id: id.value
  })
    .then(res => {
      if (res.code === 0) {
        const data = res.data || {}
        if (data.subscribeWords && data.subscribeWords.length > 0) {
          data.subscribeWord = data.subscribeWords[0]
        }
        info.value = data
      }
    })
    .finally(() => {
      loading.value = false
      initHtml()
    })
}
function getVideoDuration() {
  mediaInfoParam({
    materialUrl: info.value.videoPlayUrl
  }).then(res => {
    if (res.code === 0) {
      const duration = (res.data.duration || 0) / 1000
      console.log('拍摄时长', duration)
      if (duration <= 15) {
        info.value.shootDifficult = 1
      } else if (duration <= 30) {
        info.value.shootDifficult = 2
      } else if (duration <= 60) {
        info.value.shootDifficult = 3
      } else if (duration <= 120) {
        info.value.shootDifficult = 4
      } else {
        info.value.shootDifficult = 5
      }
    }
  })
}
// 初始化信息
const titleInput = ref(null)
function initHtml() {
  nextTick(() => {
    loading.value = false
    nextTick(() => {
      // 标题的输入框设置焦点
      titleInput.value.focus()
    })
  })
}

// 检查是否有表情包
function retEmit(e, name) {
  const val = e.target.value
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  info.value[name] = val.replace(reg, '')
}

const saveLoading = ref(false)
const saveFun = throttle(function (name) {
  ruleForm.value.validate(valid => {
    saveLoading.value = true
    if (valid) {
      if (info.value.videoPlayUrl) {
        const data = JSON.parse(JSON.stringify(info.value))
        if (data.analysisSwitch === 0) {
          data.shootDifficult = 0
        }
        saveInspirationVideo(data).then(res => {
          if (res.code === 0) {
            ElMessage.success('保存成功')
            router.go(-1)
          }
        })
      } else {
        saveLoading.value = false
        ElMessage.warning('暂未获取到对应的灵感信息')
      }
    } else {
      saveLoading.value = false
      ElMessage.warning('请将内容填写完整')
    }
  })
}, 700)
const cancelFun = throttle(function (name) {
  router.go(-1)
}, 700)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.page_box {
  width: 100%;
  height: 100%;
  .page_bottom {
    z-index: 9;
    position: fixed;
    bottom: 0;
    width: 100%;
    min-width: 1366px;
    height: 80px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: #fff;
    box-shadow: 10px 0px 18px 0px #e4e8f7;
  }
}
.detail_page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;

  .page_left {
    width: 400px;
    height: calc(100% - 64px);
    background: #ffffff;
    border-radius: 4px;
    margin-right: 16px;
    padding: 20px;

    .video_dom {
      width: 100%;
      height: calc(100% - 44px);
      max-height: 640px;
      border-radius: 4px;
      background: #181818;
    }
  }

  .page_right {
    width: calc(100% - 416px);
    height: calc(100% - 64px);
    overflow-y: auto;
    .form_box {
      .one_info {
        width: 100%;
        background: #ffffff;
        border-radius: 4px;
        margin-bottom: 10px;
        .info_title {
          width: 100%;
          height: 58px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          padding-left: 30px;
          border-bottom: 1px solid #f7f7f7;

          .title_line {
            width: 2px;
            height: 18px;
            background: #364fcd;
            margin-right: 10px;
          }

          .title_text {
            font-size: 16px;
            font-weight: 400;
            color: #000000;
            line-height: 22px;
          }

          .title_switch {
            margin-left: 14px;
          }
        }

        .info_content {
          padding: 0px 0 20px 50px;
          .form_input {
            width: 352px;
            height: 32px;
            border-radius: 4px;
          }
          .form_number {
            width: 110px;
            height: 32px;
            border-radius: 4px;
          }

          .form_select {
            width: 128px;
            height: 32px;
            border-radius: 4px;
          }
          :deep(.el-rate__item) {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            .el-rate__icon {
              font-size: 20px;
            }
          }

          .tag_form {
            margin: 14px 0 0;
          }

          .tag_box {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            flex-wrap: wrap;

            .one_tag {
              padding: 2px 9px;
              background: #e4f8fe;
              border-radius: 3px;
              border: 1px solid #93d5fe;
              font-size: 12px;
              font-weight: 400;
              color: #1890ff;
              line-height: 18px;
              margin-right: 12px;
            }

            .one_tag:last-child {
              margin-right: 16px;
            }

            .add_tag_btn {
              font-size: 14px;
              font-weight: 400;
              color: #364fcd;
              line-height: 24px;
              cursor: pointer;
            }
          }
          .editor_box {
            width: 100%;
            max-width: 602px;
            border-radius: 4px;
          }
          .input_textarea {
            width: 100%;
            max-width: 602px;
            border-radius: 4px;
          }
          :deep(.w-e-toolbar) {
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
          }
          :deep(.w-e-text-container) {
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
          }

          .text_btn {
            font-size: 14px;
            font-weight: 400;
            color: #364fcd;
            line-height: 20px;
            margin-top: 12px;
            cursor: pointer;
            display: block;
            padding: 0;
            margin: 12px 0 0;
          }
        }
        .form_row {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          padding-right: 20px;
          flex-wrap: wrap;

          :deep(.el-form-item) {
            margin-top: 20px;
          }

          .one_origin {
            margin-top: 20px;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;

            .origin_label {
              padding-right: 14px;
              width: 80px;
              text-align: right;
              font-size: 14px;
              font-weight: 400;
              color: #333333;
            }

            .origin_info {
              // width: calc(100% - 88px);
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;
              font-size: 14px;
              font-weight: 400;
              color: #333333;
              word-break: break-all;

              .info_img {
                width: 32px;
                height: 32px;
                // background: #d8d8d8;
                border-radius: 100%;
                object-fit: cover;
                margin-right: 12px;
              }
            }
          }
        }
      }
      .one_info:last-child {
        margin-bottom: 0;
      }
    }
    :deep(.el-form-item) {
      margin-bottom: 0px;
      margin-top: 20px;
    }
    :deep(.el-form-item__label) {
      font-size: 14px;
      font-weight: 400;
      color: #333333;
      line-height: 32px;
    }
  }
}
</style>

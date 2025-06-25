<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="基本信息"
      width="560px"
      custom-class="rule_setting_dialog hide_footer_line"
    >
      <div class="edit_popup_wrap">
        <div
          class="video_preview"
          v-loading="editForm.videoStatus === 0 || editForm.videoStatus === 1"
          element-loading-text="正在合成中"
          element-loading-background="rgba(255, 255, 255, 0)"
          :style="
            editForm.status === 1
              ? 'background: linear-gradient( 135deg, #EFF2FF 0%, #DBE0FF 100%);'
              : editForm.videoStatus === 3
              ? 'background: linear-gradient( 135deg, #F5F5F5 0%, #E0E0E0 100%);'
              : ''
          "
        >
          <video
            v-if="editForm.videoStatus === 2 && editForm.status != 1"
            id="previewVideo"
            class="previewVideo"
            :src="editForm.materialPath"
            :poster="editForm.coverUrl"
            controls
          ></video>
          <div
            class="mask"
            style="background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
            v-if="editForm.videoStatus === 3"
          >
            <div class="wrapper">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20250113fovzk.png" alt="" />
              <p style="color: #606266">合成失败</p>
            </div>
          </div>
          <div class="mask" v-if="editForm.status === 1">
            <div class="wrapper">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20250110j4e2f.png" alt="" />
              <p class="marginTop8">模板草稿</p>
            </div>
          </div>
          <!-- 数字人标识 -->
          <img
            v-if="editForm.tag == 2"
            class="digital_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20230309l1jh0.png"
            alt=""
          />
        </div>
        <div class="videoInfo_wrap">
          <div class="info_item">
            <span class="label">名称：</span>
            <span v-show="!$data.isEditName" class="value">{{ editForm.name }}</span>
            <template v-if="!(props.origin && props.origin == 'recycle')">
              <el-input
                v-if="$data.isEditName"
                maxlength="20"
                v-model="editForm.name"
                ref="editNameInput"
                @blur="noEditName($event)"
              ></el-input>
              <img
                v-show="!$data.isEditName"
                @click="editName"
                src="https://tagvv-1256030678.file.myqcloud.com/202303049vra6.png"
                alt=""
              />
            </template>
          </div>
          <div class="info_item">
            <span class="label">类型：</span>
            <span class="value">{{ editForm.container || '视频' }}</span>
          </div>
          <div class="info_item">
            <span class="label">时长：</span>
            <span class="value">{{ parseInt((editForm.duration || 0) / 1000 / 1000) + 's' }}</span>
          </div>
          <div class="info_item">
            <span class="label">分辨率：</span>
            <span class="value">{{ editForm.width || 0 }} X {{ editForm.height || 0 }}</span>
          </div>
          <div class="info_item" v-if="!(props.origin && props.origin == 'recycle')">
            <span class="label">制作者：</span>
            <span class="value">{{ editForm.createUserName || '-' }}</span>
          </div>
          <div class="info_item" v-if="!(props.origin && props.origin == 'recycle')">
            <span class="label">分类：</span>
            <div
              class="info_item_content"
              v-if="$data.editCategoryBindList && $data.editCategoryBindList.length > 0"
            >
              <span
                class=""
                style="color: #303133; line-height: 20px"
                v-for="(item, index) in $data.editCategoryBindList"
                :key="item.id"
              >
                {{ item.categoryName
                }}{{
                  $data.editCategoryBindList.length > 1 &&
                  index < $data.editCategoryBindList.length - 1
                    ? '、'
                    : ''
                }}
              </span>
            </div>
            <div class="info_item_content" v-else>-</div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer" v-if="!(props.origin && props.origin == 'recycle')">
          <el-button @click="showDelDialogFun">移入回收站</el-button>
          <el-button type="primary" @click="toDetail">编辑</el-button>
        </span>
        <span class="dialog-footer" v-else>
          <el-button type="primary" @click="showDelFun">删除</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 删除模板 -->
    <el-dialog
      destroy-on-close
      title="删除模板"
      width="444px"
      @close="delDialog.show = false"
      v-model="delDialog.show"
      custom-class="rule_setting_dialog hide_footer_line"
    >
      <div style="padding: 16px 16px 12px">删除模板后无法找回，请谨慎操作</div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="delDialog.show = false">取消</el-button>
          <el-button :loading="delDialog.loading" type="primary" @click="saveDelFun">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
// 基本信息的弹窗
import { ElMessage } from 'element-plus'

import { recycleDelete } from '@/api/sumvideo/recycle_bin.js'

import {
  details,
  getVideoProduce,
  templateCate,
  modify,
  deleteCreative
} from '@/api/sumvideo/creative_mould.js'
import { throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
  origin: {
    type: String,
    default: ''
  },
  infoDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const loading = ref(false)
const show = toRef(props.infoDialog, 'show')
const editForm = ref({})
const $data = reactive({
  oldName: '', // 修改之前的模板名字
  addCategoryVisible: false,
  isEditName: false,
  videoIsplay: false,
  videoIspreview: false,
  // 分类
  searchClassValue: '',
  editCategoryId: null,
  editCategoryList: [],
  editCategoryBindList: [],
  isEditCategory: false
})

// 获取模板生成视频
function getVideoProduceFun(id) {
  getVideoProduce({ creativeId: id })
    .then(() => {
      getInfo(id)
    })
    .catch(() => {
      loading.value = false
    })
}
const emits = defineEmits(['changeName', 'resetList'])

// 搜索分类
const searchClass = throttle(() => {
  const data = {
    factoryId: $data.editCategoryId,
    name: $data.searchClassValue
  }
  templateCate(data).then(res => {
    if (res.code === 0) {
      const bindList = []
      res.data.forEach(item => {
        if (item.bind === 1) {
          bindList.push(item)
        }
      })
      $data.editCategoryBindList = bindList
    }
  })
}, 500)
// 编辑名称
const editNameInput = ref(null)
const editName = throttle(() => {
  $data.oldName = editForm.value.name
  $data.isEditName = true
  nextTick(() => {
    editNameInput.value.focus()
  })
}, 500)
// 失去焦点完成修改
function noEditName(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  editForm.value.name = e.target.value.replace(reg, '')
  $data.isEditName = false
  saveName()
}
// 重命名弹窗-保存
function saveName() {
  if (!editForm.value.name) {
    editForm.value.name = $data.oldName
    ElMessage({
      message: '请输入名称',
      type: 'warning'
    })
    return
  }

  modify({
    creativeId: editForm.value.id,
    name: editForm.value.name
  }).then(res => {
    if (res.code === 0) {
      emits('changeName', editForm.value.name, props.infoDialog.index)
      // 刷新背景
      $data.editLabelVisible = false
      ElMessage({
        message: '修改成功',
        type: 'success'
      })
    }
  })
}
function getInfo() {
  console.log('props.infodialog.id', props.infoDialog.id)
  if (props.origin === 'recycle') {
    editForm.value = JSON.parse(JSON.stringify(props.infoDialog.info))
  } else {
    loading.value = true
    details(props.infoDialog.id)
      .then(res => {
        if (res.code === 0) {
          editForm.value = res.data
          if (res.data.videoStatus === 0 && res.data.source !== 2) {
            getVideoProduceFun(res.data.id)
          } else {
            loading.value = false
          }
        } else {
          loading.value = false
        }
      })
      .catch(() => {
        loading.value = false
      })
    // 改成点击分组的时候采取请求
    $data.editCategoryId = props.infoDialog.id
    searchClass()
  }
}
getInfo()

// 移入回收站
const showDelDialogFun = throttle(item => {
  const data = {
    creativeId: props.infoDialog.id
  }
  deleteCreative(data).then(res => {
    if (res.code === 0) {
      emits('resetList')
      dialog.value.handleClose()
      ElMessage({
        message: '移入成功',
        type: 'success'
      })
    }
  })
}, 500)
const toDetail = throttle(item => {
  dialog.value.handleClose()
  router.push({
    path: '/sumwhy_video/template_space/template_edit',
    query: {
      id: props.infoDialog.id
    }
  })
}, 500)

// 删除弹窗
const delDialog = reactive({
  show: false,
  ids: [],
  loading: false
})
// 显示删除模板
const showDelFun = throttle(item => {
  delDialog.ids = [props.infoDialog.id]
  delDialog.loading = false
  delDialog.show = true
}, 500)
// 删除
const saveDelFun = throttle(() => {
  console.log('调接口删除')
  delDialog.loading = true
  recycleDelete({
    ids: delDialog.ids || []
  })
    .then(res => {
      if (res.code === 0) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        })
        emits('resetList')
        dialog.value.handleClose()
      }
      delDialog.loading = false
      delDialog.show = false
    })
    .catch(() => {
      dialog.value.handleClose()
      delDialog.loading = false

      delDialog.show = false
    })
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
// 右边抽屉弹窗
.edit_popup_wrap {
  padding: 16px 16px 12px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  // 左边视频区域
  .video_preview {
    background: #141518;
    border-radius: 4px;
    position: relative;
    overflow: hidden;

    width: 144px;
    height: 256px;

    .previewVideo {
      border-radius: 4px;
      width: 144px;
      height: 256px;
      object-fit: contain;
    }
    .mask {
      border-radius: 4px;
      position: relative;
      width: 144px;
      height: 256px;
      object-fit: cover;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
      pointer-events: none;
      background: linear-gradient(135deg, #eff2ff 0%, #dbe0ff 100%);

      .wrapper {
        p {
          font-size: 12px;
          color: #636bb1;
          line-height: 18px;
          text-align: center;
        }

        img {
          width: 56px;
          height: 56px;
          display: flex;
        }
      }
    }
    .digital_icon {
      position: absolute;
      left: 0;
      top: 0;
      width: 52px;
      height: 52px;
    }
  }
}

.videoInfo_wrap {
  width: 370px;
  margin-left: 24px;

  .info_item {
    display: flex;
    margin-bottom: 12px;

    .label {
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      margin-right: 2px;
      white-space: nowrap;
    }
    .info_item_content {
      width: calc(100% - 80px);
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .value {
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    img {
      width: 16px;
      height: 16px;
      margin-left: 8px;
      cursor: pointer;
    }

    :deep(.el-input__inner) {
      padding: 0 12px;
      color: #323233;
      font-size: 14px;
      height: 32px;
      line-height: 32px;
      font-weight: 400;
      background: #f7f8fa;
      border-radius: 2px;
      border: 1px solid #dcdee0;
    }
  }
}

.classification_wrap {
  padding-top: 12px;
  position: relative;
  width: 100%;
  padding-right: 16px;

  .classification_wrap_top {
    display: flex;
    align-items: center;
    vertical-align: middle;

    .title {
      height: 22px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      line-height: 22px;
      border: none;
    }

    .add_btn {
      height: 32px;
      line-height: 32px;
      display: flex;
      align-items: center;
      vertical-align: middle;
      cursor: pointer;
      margin-left: 12px;

      .add_btn_img {
        width: 16px;
        height: 32px;
        img {
          width: 16px;
          height: 16px;
          margin-top: 8px;
        }
      }

      .add_btn_text {
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        font-weight: 400;
        color: #364fcd;
      }
    }
  }

  .classification_list_order {
    .classification_list {
      width: 100%;
      max-height: 135px;
      overflow-y: scroll;
      padding-top: 16px;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;

      .classification_item {
        display: flex;
        align-items: center;
        height: 28px;
        background: #364fcd;
        border-radius: 2px;
        padding-left: 14px;
        padding-right: 12px;
        margin-right: 12px;
        margin-bottom: 12px;

        span {
          height: 20px;
          font-size: 14px;
          font-weight: 400;
          color: #ffffff;
          line-height: 20px;
        }

        img {
          box-sizing: border-box;
          width: 20px;
          height: 20px;
          padding: 5px;
          cursor: pointer;
          margin-left: 1px;
        }
      }
    }
  }

  .addCategory_wrap {
    position: absolute;
    top: -227px;
    left: 374px;
    width: 320px;
    height: 420px;
    background: #ffffff;
    border-radius: 4px;
    padding: 16px;
    .addCategory_del_box {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }
    .addCategory_del {
      cursor: pointer;
      margin-top: -16px;
      margin-right: -16px;
      margin-bottom: 4px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 36px;
      height: 28px;
      img {
        width: 20px;
        height: 20px;
        object-fit: contain;
      }
    }
    .search_wrap {
      width: 100%;
      height: 34px;
      padding: 0 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      border: 1px solid #dcdee0;

      :deep(.el-input__inner) {
        height: 30px;
        line-height: 30px;
        border: 0;
        padding: 0;
        font-size: 14px;
        font-weight: 400;
      }

      img {
        width: 14px;
        height: 14px;
        margin-left: 20px;
        flex-shrink: 0;
      }
    }

    .classification_list {
      width: 100%;
      max-height: calc(100% - 56px);
      overflow: scroll;
      padding-top: 16px;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;

      .classification_item {
        display: flex;
        align-items: center;
        height: 28px;
        background: rgba(144, 147, 153, 0.1);
        border-radius: 2px;
        padding: 0 6px;
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        line-height: 28px;
        margin: 0px 16px 16px 0px;
        cursor: pointer;
      }

      .classification_item_active {
        background: #364fcd;
        color: #ffffff;
      }

      .add_btn {
        height: 28px;
        border-radius: 8px;
        border: 1px solid #364fcd;
        padding: 0 14px;
        font-size: 14px;
        font-weight: 400;
        color: #364fcd;
        line-height: 26px;
        cursor: pointer;
        margin-left: 20px;
      }
    }

    .no_data {
      width: 70px;
      height: 100px;
      margin: auto;
      margin-top: 40%;

      .no_data_img {
        height: 70px;

        img {
          width: 70px;
          height: 70px;
        }
      }

      .no_data_text {
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #8f939a;
        text-align: center;
        margin-top: 5px;
      }
    }
  }
}

.btn_wrap {
  position: absolute;
  bottom: 60px;
  right: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  div {
    text-align: center;
    width: 74px;
    height: 32px;
    border-radius: 20px;
    text-align: center;
    line-height: 32px;
    margin-left: 16px;
    font-size: 16px;
    font-weight: 400;
    color: #ffffff;
    cursor: pointer;
  }

  .cancle_btn {
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .confirm_btn {
    background: #2388ff;
  }
}
</style>

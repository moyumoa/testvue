<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      @close="closeFun"
      v-model="show"
      title="模型详情"
      width="560px"
      custom-class="rule_setting_dialog rule_setting_form_dialog hide_footer_line"
    >
      <div class="dialog_content" v-loading="$data.loading">
        <div class="video_content" v-if="$data.info">
          <div class="video_info">
            <img class="info_cover" :src="$data.info.shadeImg || $data.info.coverUrl" alt="" />
            <img
              v-if="$data.info && $data.info.source === 3"
              class="info_xm"
              src="https://tagvv-1256030678.file.myqcloud.com/20230311qmj6r.png"
              alt=""
            />
            <img
              v-if="props.detailDialog.type === 2"
              @click="previewFun()"
              class="info_play"
              src="https://tagvv-1256030678.file.myqcloud.com/20230308mdq3m.png"
              alt=""
            />
          </div>

          <div class="content_info_box">
            <div class="one_info" v-if="$data.info.everyoneCanUse != 1">
              <div class="info_label">用户名：</div>
              <div class="info_content">{{ $data.info.userName || '-' }}</div>
            </div>
            <div class="one_info">
              <div class="info_label">模型名称：</div>
              <div class="info_content">
                {{ $data.info.name || '-' }}
              </div>
            </div>
            <div class="one_info" v-if="$data.info.everyoneCanUse != 1">
              <div class="info_label">手机号：</div>
              <div class="info_content">
                <table_column_phone
                  v-if="$data.info.mobile"
                  :phone="$data.info.mobile"
                  size="small"
                ></table_column_phone>
                <span v-else>-</span>
              </div>
            </div>
            <div class="one_info" v-if="$data.info.everyoneCanUse != 1">
              <div class="info_label">部门：</div>

              <div
                class="info_content depart_content"
                v-if="
                  $data.info.dep &&
                  $data.info.dep.departmentList &&
                  $data.info.dep.departmentList.length > 0
                "
              >
                <span v-for="(item, index) in $data.info.dep.departmentList" :key="index">
                  {{ item.name }}
                  <span
                    v-if="
                      index < $data.info.dep.departmentList.length - 1 &&
                      $data.info.dep.departmentList.length > 1
                    "
                  >
                    /
                  </span>
                </span>
              </div>
              <div class="info_content" v-else>-</div>
            </div>
            <div class="one_info">
              <div class="info_label">合成时间：</div>
              <div class="info_content">{{ $data.info.modelCreateTime || '-' }}</div>
            </div>
            <div class="one_info">
              <div class="info_label">模型状态：</div>
              <div class="info_content">
                {{
                  $data.info.userIsValid === 0
                    ? '禁用'
                    : $data.info.isBanned === 1
                    ? '禁用'
                    : '启用'
                }}
              </div>
            </div>
            <div class="one_info">
              <div class="info_label">可用范围：</div>
              <div class="info_content">
                {{ $data.info.everyoneCanUse == 1 ? '全员可用' : '个人可用' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <template
        #footer
        v-if="
          $data.info &&
          ($data.info.source == 2 || ($data.info.source == 1 && $data.info.userIsValid == 1))
        "
      >
        <span class="dialog-footer">
          <el-button type="primary" @click="editFun">编辑</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 预览弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 编辑弹窗 -->
    <editDialog v-if="$data.editInfo.show" :editDialog="$data.editInfo" @updateInfo="updateInfo" />
  </div>
</template>
<script setup>
import editDialog from './edit_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import { throttle } from '@/utils/tools.js'
import { listAllFaceModel } from '@/api/sumvideo/digital_model.js'

const props = defineProps({
  detailDialog: {
    type: Object,
    default: () => {
      return {
        id: null,
        info: null,
        type: 1, // 1面部模型 2 人物模型
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.detailDialog, 'show')
const $data = reactive({
  isEdit: false,
  info: null,
  loading: false,
  editInfo: {
    show: false
  }
})
function init() {
  $data.loading = true
  listAllFaceModel({
    modelIds: [props.detailDialog.modelId]
  })
    .then(res => {
      if (res.code === 0 && res.data && res.data.records && res.data.records.length > 0) {
        $data.info = res.data.records[0]
      }
      $data.loading = false
    })
    .catch(() => {
      $data.loading = false
      dialog.value.handleClose()
    })
}
init()
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
// 预览弹窗
const previewFun = throttle(() => {
  if (props.detailDialog.type === 2) {
    previewInfo.value = {
      show: true,
      title: '查看人物模型',
      url: $data.info.videoUrl,
      type: 'digitalVideo',
      cover: $data.info.shadeImg || '',
      maskPosition: JSON.parse($data.info.maskPosition)
    }
  }
}, 500)
// 显示编辑弹窗
const editFun = throttle(() => {
  console.log('编辑')
  $data.editInfo = {
    info: $data.info,
    show: true
  }
}, 500)
function updateInfo() {
  $data.isEdit = true
  init()
}
const emits = defineEmits(['updateList'])
function closeFun() {
  if ($data.isEdit) {
    emits('updateList')
  }
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 16px;
  width: 100%;
  min-height: 256px;
  .audio_info {
    margin-top: 20px;
    width: 100%;
    height: 56px;
    background: #f0f3f5;
    border-radius: 27px;
  }
  .video_content {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .video_info {
      width: 144px;
      height: 256px;
      border-radius: 4px;
      margin-right: 20px;
      position: relative;
      .info_cover {
        width: 144px;
        height: 256px;
        border-radius: 4px;
        object-fit: cover;
      }
      .info_xm {
        width: 52px;
        height: 52px;
        object-fit: contain;
        position: absolute;
        left: 0;
        top: 0;
      }
      .info_play {
        cursor: pointer;
        width: 52px;
        height: 52px;
        object-fit: cover;
        position: absolute;
        left: 46px;
        top: 102px;
      }
    }
    .content_info_box {
      width: calc(100% - 164px);
      .one_info {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        .info_label {
          font-size: 14px;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
        }
        .info_content {
          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
        }
        .info_content_2 {
          width: calc(100% - 50px);
        }
        .info_content_5 {
          width: calc(100% - 90px);
        }
      }
      .one_info + .one_info {
        margin-top: 12px;
      }
    }
  }
}
.depart_content {
  width: calc(100% - 50px);
}
:deep(.small_phone span) {
  font-size: 14px !important;
  font-weight: 400 !important;
  color: #303133 !important;
  line-height: 20px !important;
}
</style>

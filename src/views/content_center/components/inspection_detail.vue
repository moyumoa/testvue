<template>
  <div>
    <el-dialog ref="dialog" v-model="show" :title="detailModal.title" width="802px">
      <div class="content_box">
        <div class="one_box">
          <div class="one_label">质检标记</div>
          <div
            :class="{ one_content: true, red_text: form.isPass == 0, green_text: form.isPass == 1 }"
          >
            {{ form.isPass == 1 ? '合格' : '不合格' }}
          </div>
        </div>
        <div class="one_box">
          <div class="one_label">质检时间</div>
          <div class="one_content">{{ form.opUserTime || '--' }}</div>
        </div>
        <div class="one_box" v-if="detailModal.type == 'video' && form.isPass == 0">
          <div class="one_label">是否下架</div>
          <div class="one_content">{{ form.isTakeOffVideo == 0 ? '否' : '是' }}</div>
        </div>
        <div class="one_box">
          <div class="one_label">操作员</div>
          <div class="one_content">{{ form.opUserNick || '--' }}</div>
        </div>
        <div class="one_box" v-if="form.isPass == 0">
          <div class="one_label">质检附件</div>
          <div class="one_content file_box" v-if="form.attachments && form.attachments.length > 0">
            <div class="one_file" v-for="(item, index) in form.attachments" :key="index">
              <img
                class="file_cover"
                :src="item.attachmentType == 1 ? item.attachmentUrl : item.attachmentCoverUrl"
                alt=""
              />
              <!-- :style="item.attachmentType == 1 ? 'object-fit: contain' : ''" -->

              <div v-if="item.attachmentType == 2" class="file_action" @click="showFile(item)">
                <img src="@/assets/images/content_center/inspection_play.png" alt="" />
              </div>
              <div v-else class="file_action file_img" @click="showFile(item)">预览</div>
            </div>
          </div>
          <div v-else class="one_content file_box">--</div>
        </div>
        <div
          class="one_box"
          v-if="form.isPass == 0"
          :style="form.attachments ? 'margin-top: 8px' : ''"
        >
          <div class="one_label">质检备注</div>
          <div class="one_content">{{ form.remark || '--' }}</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="closeDialog">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="查看附件" v-model="checkDialog" destroy-on-close>
      <div class="check_modal">
        <img v-if="dialogFile.attachmentType == 1" :src="dialogFile.attachmentUrl" alt="" />
        <video v-else :src="dialogFile.attachmentUrl" controls="controls" autoplay />
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
const props = defineProps({
  detailModal: {
    type: Object,
    default: () => {
      return {
        show: true,
        title: '直播质检',
        row: null,
        type: 'live'
      }
    },
    required: true
  }
})

const show = toRef(props.detailModal, 'show') // 是否显示弹窗
const dialog = ref(null) // ==this.$refs.dialog
// 表单相关数据
const form = ref({
  radio: null,
  fileList: [],
  mark: ''
})

const checkDialog = ref(false) // 是否显示查看附件的弹窗
// 查看附件相关数据
const dialogFile = ref({
  attachmentType: '', // 附件属性 2video/1image
  attachmentCoverUrl: '', // 附件的封面图
  attachmentUrl: '' // 附件地址
}) // 查看附件的data
// 查看附件
function showFile(e) {
  checkDialog.value = true
  dialogFile.value = e
}
// 关闭整个弹窗
function closeDialog() {
  dialog.value.handleClose()
}
// 打开弹窗并将数据填写
function init() {
  if (props.detailModal.data) {
    form.value = JSON.parse(JSON.stringify(props.detailModal.data)) // 数量量少的直接使用这个转
  }
}
init()
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
:deep(.el-dialog__body) {
  padding: 22px 24px 28px 0;
}
:deep(.el-form-item__content) {
  min-height: 32px;
  height: auto;
}
.content_box {
  .one_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .one_label {
      width: 94px;
      padding-right: 14px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      text-align: right;
    }
    .one_content {
      width: calc(100% - 94px);
      font-size: 14px;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
    }
    .red_text {
      color: #ff0101 !important;
    }
    .green_text {
      color: #52c41a !important;
    }
  }
  .one_box + .one_box {
    margin-top: 22px;
  }
}
.file_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .one_file {
    width: 120px;
    height: 160px;
    margin-right: 14px;
    margin-bottom: 14px;
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
      cursor: pointer;
      width: 120px;
      height: 160px;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      img {
        width: 48px;
        height: 48px;
        object-fit: cover;
      }
    }
    .file_img {
      opacity: 0;
      background: rgba(0, 0, 0, 0.4);
      font-size: 14px;
      font-weight: 400;
      color: #ffffff;
      line-height: 20px;
      &:hover {
        opacity: 1;
      }
    }
  }
}
.check_modal {
  width: 100%;
  height: 400px;
  padding-left: 24px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  video {
    width: 100%;
    height: 100%;
  }
}
</style>

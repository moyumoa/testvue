<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="`${loading ? '原料' : ELEMENT_TYPE.getCN(info.type) || '未知'}原料`"
    width="560px"
    custom-class="rule_setting_dialog hide_footer_line"
    :before-close="handleClose"
  >
    <div
      class="dialog_content"
      :style="{ paddingBottom: origin == 'mergeDisassembleRecord' ? '16px' : 0 }"
      v-loading="loading"
    >
      <template v-if="isNotEmpty(info)">
        <!-- 视频 -->
        <div class="video_content">
          <div
            class="video_left"
            :style="info.type === 4 ? 'width:256px' : ''"
            v-if="[1, 2, 4].includes(info.type)"
          >
            <video
              v-if="info.type === 1"
              ref="videoFile"
              class="video_info"
              :src="info.url"
              controls="controls"
              :poster="info.coverUrl"
              preload="load"
            ></video>
            <el-image
              v-if="info.type === 2"
              class="img_info"
              :src="info.url"
              fit="contain"
              :preview-src-list="[info.url]"
            ></el-image>
            <div class="content_box" v-if="info.type === 4">{{ info.content || '-' }}</div>
            <!-- 业务主体 -->
            <div class="business_box" v-if="info.businessNameList">
              <table_column_business_entity :list="info.businessNameList" />
            </div>
          </div>
          <div
            class="content_info_box"
            :style="
              info.type === 4 ? 'width: calc(100% - 164px);' : info.type < 3 ? '' : 'width:100%'
            "
          >
            <div class="one_info">
              <div class="info_label">名称：</div>
              <div class="info_content info_content_2" v-if="!showEditName">
                {{ info.name || '-' }}
                <img
                  @click="switchEdit"
                  src="https://tagvv-1256030678.file.myqcloud.com/202303049vra6.png"
                  alt=""
                  v-if="false"
                />
              </div>
              <el-input
                class="info_content info_content_2"
                maxlength="20"
                v-else
                v-model="newName"
                @blur="editNameBlur"
              ></el-input>
              <!--  <div class="info_content info_content_2" v-if="showEditName">{{ info.name || '-' }}</div>-->
            </div>
            <div class="one_info">
              <div class="info_label">类型：</div>
              <div class="info_content">
                {{ ELEMENT_TYPE.getCN(info.type) || '未知' }}
              </div>
            </div>
            <div class="one_info" v-if="info.type === 1 || info.type === 3">
              <div class="info_label">时长：</div>
              <div class="info_content">
                {{ info.duration ? secondToDate(info.duration / 1000, '秒', true, true) : '--' }}
              </div>
            </div>
            <div class="one_info" v-if="info.type < 3">
              <div class="info_label">分辨率：</div>
              <div class="info_content" v-if="info.wight && info.height">
                {{ info.wight }}*{{ info.height }}
              </div>
              <div class="info_content" v-else>-</div>
            </div>
            <div class="one_info">
              <div class="info_label">大小：</div>
              <div class="info_content">{{ changeKB(info.size || 0) }}</div>
            </div>
            <div class="one_info">
              <div class="info_label">创建时间：</div>
              <div class="info_content">{{ info.createTime || '-' }}</div>
            </div>
            <div class="one_info">
              <div class="info_label">原料来源：</div>
              <div class="info_content">{{ ELEMENT_ORIGIN.getCN(info.source) || '-' }}</div>
            </div>
            <div class="one_info one_info_user" v-if="info.source && info.source != 6">
              <div class="info_label">来源成员：</div>
              <div class="info_content">
                <div class="content_name">{{ info.userName || '-' }}</div>
                <table_column_department_info_line
                  v-if="info.depList"
                  className="max"
                  :departmentName="info.depList.join(';')"
                  connectStr="/"
                  divisionStr=";"
                  trigger="hover"
                  tipPlacement="right"
                />
              </div>
            </div>
            <div class="one_info">
              <div class="info_label">上传批次号：</div>
              <div class="info_content info_content_5">
                {{ info.batchNumber || '暂无批次号' }}
              </div>
            </div>
            <div class="one_info" :class="{ one_info_v2: origin == 'mergeDisassembleRecord' }">
              <fileTag
                class="file_tagbox"
                v-if="info.folderList && info.folderList.length > 0 && info.source != 6"
                :fileName="info.folderList[0].name"
                :fileInfo="info.folderList[0]"
                @showRemoveFun="showRemoveFun"
              />
            </div>
          </div>
        </div>

        <audio
          ref="audioFile"
          v-if="info.type === 3"
          class="audio_info"
          :src="info.url"
          controls="controls"
        ></audio>
        <!-- 业务主体 -->
        <table_column_business_entity
          v-if="info.type === 3 && info.businessNameList"
          :list="info.businessNameList"
        />
      </template>
    </div>
    <template #footer v-if="origin != 'mergeDisassembleRecord'">
      <span class="dialog-footer" v-if="!loading">
        <el-button v-if="info.source != 6" @click="deleteMaterial">删除</el-button>
        <el-button type="primary" v-if="info.type !== 4" @click="downloadFileFun">下载</el-button>
        <el-button type="primary" v-if="info.type == 1" @click="disassemble">拆分</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import fileTag from '@/views/sumvideo/components/files/file_tag.vue'

import { save, use, detail } from '@/api/content_center/material_library.js'

import { ELEMENT_TYPE, ELEMENT_ORIGIN } from '@/utils/dictionary/sumvideo'
import { changeKB, throttle, secondToDate, isNotEmpty, isEmpty } from '@/utils/tools.js'
import { downLoadFile } from '@/utils/exportFile.js'
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps({
  elementDialog: {
    type: Object,
    default: () => {
      return {
        itemIndex: null,
        index: null,
        id: null,
        replaceRule: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  },
  origin: {
    type: String,
    default: '' // mergeDisassembleRecord 拆分合并记录
  }
})
const dialog = ref()
const show = toRef(props.elementDialog, 'show')
const itemIndex = toRef(props.elementDialog, 'itemIndex')
const index = toRef(props.elementDialog, 'index')
const { origin } = toRefs(props)
const loading = ref(true)
const info = ref(null)
function init() {
  loading.value = true
  if (props.elementDialog.source === 6) {
    info.value = JSON.parse(JSON.stringify(props.elementDialog.info))
    nextTick(() => {
      loading.value = false
    })
  } else {
    detail({
      id: props.elementDialog.id
    })
      .then(res => {
        if (res.code === 0) {
          info.value = res.data || {}
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
  // info = toRef(props.elementDialog, 'info')
}
init()

const emits = defineEmits(['updateList', 'showRemoveFun', 'closeDialog', 'disassemble'])
function deleteMaterial() {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: '',
    customClass: 'rule_setting_dialog hide_footer_line'
  })
    .then(() => {
      // emit('delItem', index)
      console.log(info.value, 'delete info.value ----')
      save({
        id: info.value.id,
        isDelete: 1
      }).then(res => {
        if (res.code === 0) {
          emits('updateList')
          ElMessage({
            type: 'success',
            message: '删除成功'
          })
          dialog.value.handleClose()
        }
      })
    })
    .catch(() => {
      // ElMessage({
      //   type: 'info',
      //   message: '取消删除'
      // })
    })
}
// 下载
const downloadFileFun = throttle(function () {
  if (info.value.url) {
    ElMessageBox.confirm('是否要下载该原料?', '系统提醒', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: '',
      customClass: 'rule_setting_dialog hide_footer_line',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          instance.confirmButtonText = '确定'
          use({
            id: info.value.id
          })
          const regex = /[^\u4e00-\u9fa5a-zA-Z0-9]/g
          downLoadFile(
            info.value.url,
            (info.value.name || '原料').replace(regex, ''),
            'material_library'
          )
            .then(() => {
              ElMessage.success('下载成功')
              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
            })
            .catch(() => {
              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
            })
        } else {
          done()
        }
      }
    }).then(() => {})
  } else {
    ElMessage({
      type: 'warning',
      message: '暂未找到相关下载链接'
    })
  }
}, 700)
// 拆分
const disassemble = throttle(function () {
  const videoDuration = parseInt(info.value.duration || 0)
  console.log('videoDuration', videoDuration)
  if (videoDuration < 10 * 1000) {
    ElMessage({
      type: 'warning',
      message: '视频时长不符合拆分要求'
    })
    return
  }
  emits('disassemble', info.value.id, videoDuration / 1000, info.value.name)
  // dialog.value.handleClose()
}, 500)
// 显示编辑名称
const showEditName = ref(false)
const newName = ref('')
const switchEdit = () => {
  showEditName.value = true
  newName.value = info.value.name
}
const editNameBlur = () => {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  const value = newName.value.replace(reg, '')
  // 新输入为空不保存 值没有变化 不保存
  if (isEmpty(value) || value === info.value.name) {
    showEditName.value = false
    return
  }
  save({
    id: info.value.id,
    name: value
  }).then(res => {
    if (res.code === 0) {
      showEditName.value = false
      info.value.name = value
      ElMessage.success('修改成功')
    }
  })
}

// 显示移动到的弹窗
function showRemoveFun() {
  if (origin.value === 'mergeDisassembleRecord') return
  emits('showRemoveFun', info.value, itemIndex.value, index.value, 'detailDialog')
}

function handleClose(done) {
  emits('closeDialog', 'elementDetail')
  done()
}
defineExpose({
  init
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 16px 16px 0 16px;
  width: 100%;
  min-height: 50px;
  .audio_info {
    margin-top: 20px;
    width: 100%;
    height: 56px;
    background: #f0f3f5;
    border-radius: 27px;
  }
  .business_box {
    width: 100%;
    height: 30px;
    overflow: hidden;
  }
  :deep(.businessEntity_tag_box) {
    max-width: 100%;
    height: 30px;
    width: max-content;
  }
  .video_left {
    width: 144px;
    margin-right: 20px;
  }
  .video_content {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    .video_info,
    .img_info {
      width: 144px;
      height: 256px;
      border-radius: 4px;
      object-fit: contain;
      background: rgb(48, 49, 51);
    }
    // .img_info {
    //   background: rgb(48, 49, 51);
    //   margin-right: 20px;
    //   width: 144px;
    //   height: 256px;
    //   border-radius: 4px;
    //   object-fit: contain;
    // }
    .content_box {
      // margin-right: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;
      width: 256px;
      height: 256px;
      background: #f6f8fa;
      border-radius: 4px;
      padding: 12px 16px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
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
          display: flex;
          align-items: center;
          img {
            margin-left: 4px;
            width: 16px;
            height: 16px;
          }
        }
        .info_content_5 {
          width: calc(100% - 90px);
        }
        :deep(.file_tag) {
          color: #000;
          background: rgba(0, 0, 0, 0.1);
        }
      }
      .one_info + .one_info {
        margin-top: 12px;
      }
      .one_info_v2 {
        :deep(.file_tag) {
          cursor: default;
        }
      }
      .one_info_user {
        .info_content {
          width: calc(100% - 80px);
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .content_name {
            margin-right: 4px;
            flex-shrink: 0;
            flex-basis: auto;
            flex-grow: 0;
            max-width: 100px;
          }
          :deep(.module_department_box) {
            overflow: hidden;
            height: 20px;
            .max {
              margin-top: 0;
            }
          }
        }
      }
    }
  }
}
</style>

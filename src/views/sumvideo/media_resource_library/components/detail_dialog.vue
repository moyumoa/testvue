<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="`${loading ? '' : RESOURCE_TYPE.getCN(info.specificType) || '未知'}资源`"
    width="560px"
    custom-class="rule_setting_dialog hide_footer_line"
    :before-close="handleClose"
  >
    <div class="dialog_content" v-loading="loading">
      <template v-if="isNotEmpty(info)">
        <!-- 视频/图片 -->
        <div class="video_content">
          <el-image
            v-if="info.specificType === 3"
            class="img_info"
            :src="info.url"
            fit="contain"
            :preview-src-list="[info.url]"
          ></el-image>
          <!-- <div class="content_box" v-if="info.specificType === 4">{{ info.content || '-' }}</div> -->
          <div
            class="content_info_box"
            :style="info.specificType === 3 ? 'width: calc(100% - 212px);' : 'width:100%'"
          >
            <div class="one_info">
              <div class="info_label">名称：</div>
              <div class="info_content info_content_2">
                {{ info.name || '-' }}
              </div>
            </div>
            <div class="one_info">
              <div class="info_label">类型：</div>
              <div class="info_content">
                {{ RESOURCE_TYPE.getCN(info.specificType) || '未知' }}
              </div>
            </div>
            <div class="one_info" v-if="info.specificType === 2 || info.specificType === 4">
              <div class="info_label">时长：</div>
              <div class="info_content">
                {{ info.duration ? secondToDate(info.duration / 1000, '秒', true, true) : '--' }}
              </div>
            </div>
            <div class="one_info" v-if="info.specificType === 3">
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
              <div class="info_label">资源来源：</div>
              <div class="info_content">
                {{ RESOURCE_ORIGIN.getCN(info.subSource) }}
              </div>
            </div>
            <div class="one_info">
              <div class="info_label">上传批次号：</div>
              <div class="info_content info_content_5">
                {{ info.batchNumber || '暂无批次号' }}
              </div>
            </div>
          </div>
        </div>
        <!-- BGM或者音效 -->
        <audio
          ref="audioFile"
          v-if="info.specificType === 2 || info.specificType === 4"
          class="audio_info"
          :src="info.url"
          controls="controls"
        ></audio>
        <!-- 字体 -->
        <div
          class="font_info"
          v-if="info.specificType === 5 || info.specificType === 6"
          :style="`font-family: '${info.id}'`"
        >
          助力企业媒体化转型 规模化提升企业引流获客能力
        </div>
      </template>
    </div>
    <template #footer>
      <span class="dialog-footer" v-if="!loading && info && info.source != 6">
        <el-button @click="deleteMaterial">删除</el-button>
        <el-button
          type="primary"
          v-if="![5, 6].includes(info.specificType)"
          @click="downloadFileFun"
        >
          下载
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { save, use, detail } from '@/api/content_center/material_library.js'
import { RESOURCE_TYPE, RESOURCE_ORIGIN } from '@/utils/dictionary/sumvideo'
import { changeKB, throttle, secondToDate, isNotEmpty } from '@/utils/tools.js'
import { downLoadFile } from '@/utils/exportFile.js'
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps({
  detailDialog: {
    type: Object,
    default: () => {
      return {
        id: null,

        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.detailDialog, 'show')

const loading = ref(true)
const info = ref(null)

const emits = defineEmits(['updateList'])
function deleteMaterial() {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox3 hide_footer_line'
  })
    .then(() => {
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
    .catch(() => {})
}
// 下载
const downloadFileFun = throttle(function () {
  if (info.value.url) {
    ElMessageBox.confirm('是否要下载该资源?', '系统提醒', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: '',
      customClass: 'drawer_systemBox3 hide_footer_line',
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
            (info.value.name || '资源').replace(regex, ''),
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

// 动态加载字体
function initFont(fontList) {
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerText = `@charset "UTF-8"; @font-face {  font-family: "${fontList[0].fontFamily}";  src: url("${fontList[0].fontUrl}");  font-display: block;}`
  document.getElementsByTagName('head')[0].appendChild(style)
  nextTick(() => {
    loading.value = false
  })
}
// 删除字体包
function delFont() {
  var parent = document.getElementsByTagName('head')[0]
  var children = parent.childNodes
  var lastChildIndex = children.length - 1

  // 检查是否有子元素
  if (lastChildIndex >= 0) {
    // 删除类型为'elementType'的最后一个子元素
    parent.removeChild(parent.lastChild)
  }
}

function init() {
  loading.value = true

  detail({
    id: props.detailDialog.id,

    tagType: 10
  })
    .then(res => {
      if (res.code === 0 && isNotEmpty(res.data)) {
        info.value = res.data || {}
        if (info.value.specificType === 5 || info.value.specificType === 6) {
          initFont([
            {
              fontUrl: info.value.url,
              fontFamily: info.value.id,
              label: info.value.name
            }
          ])
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
}

onMounted(() => {
  init()
})
function handleClose(done) {
  // 如果是字体，删除最后一个
  if ([5, 6].includes(info.value.specificType)) delFont()

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
  .font_info {
    margin-top: 20px;
    padding: 14px 0px;
    height: 56px;
    text-align: center;
    width: 100%;
    background: #f0f3f5;
    border-radius: 27px;
    font-weight: 400;
    font-size: 20px;
    color: #303133;
    line-height: 28px;
  }
  .video_content {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .img_info {
      margin-right: 20px;
      width: 192px;
      height: 256px;
      border-radius: 4px;
      object-fit: contain;
      background: #e6e8ee;
    }

    .content_box {
      margin-right: 20px;
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
    }
  }
}
</style>

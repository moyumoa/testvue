<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="图片预览"
    width="560px"
    custom-class="xm_element_dialog"
  >
    <div class="dialog_content">
      <div class="content_left">
        <div class="left_img">
          <el-image
            class="img_info"
            :src="imgList[imgIndex]"
            fit="contain"
            :preview-src-list="imgList"
            :initial-index="imgIndex"
          >
            <template #placeholder>
              <div class="image_placeholder_loading">
                <div class="image_placeholder_icon"></div>
              </div>
            </template>
          </el-image>
        </div>
        <div class="left_change">
          <img
            v-if="imgIndex > 0"
            @click="changeImg(2)"
            class="change_icon change_icon_active"
            src="https://tagvv-1256030678.file.myqcloud.com/20240914ptdvg.png"
            alt=""
          />
          <img
            v-else
            class="change_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240914t8sth.png"
            alt=""
          />
          <div class="change_num">{{ imgIndex + 1 }}/{{ imgList.length }}</div>
          <img
            v-if="imgIndex < imgList.length - 1"
            @click="changeImg(1)"
            class="change_icon change_icon_active"
            src="https://tagvv-1256030678.file.myqcloud.com/20240914yusou.png"
            alt=""
          />
          <img
            v-else
            class="change_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240914ir3n7.png"
            alt=""
          />
        </div>
      </div>
      <div class="content_right">
        <div class="content_info">
          <div class="info_label">名称：</div>
          <div class="info_content">{{ info.name || '--' }}</div>
          <!-- <div class="info_content">
            <el-input
              class="info_content info_content_2"
              maxlength="20"
              v-if="showEditName"
              v-model="newName"
              @blur="editNameBlur"
            ></el-input>

            <template v-else>
              <div class="info_name line-hidden1">
                {{ info.name || '--' }}
              </div>
              <img
                @click="switchEdit"
                src="https://tagvv-1256030678.file.myqcloud.com/20240914jgud5.png"
                alt=""
              />
            </template>
          </div> -->
        </div>
        <div class="content_info">
          <div class="info_label">类型：</div>
          <div class="info_content">{{ info.pictureType === 1 ? '单图' : '组图' }}</div>
        </div>
        <div class="content_info" v-if="info.pictureType == 1">
          <div class="info_label">分辨率：</div>
          <div class="info_content" v-if="info.wight && info.height">
            {{ info.wight }}*{{ info.height }}
          </div>
          <div class="info_content" v-else>--</div>
        </div>
        <div class="content_info">
          <div class="info_label">大小：</div>
          <div class="info_content">{{ getAllSize() }}</div>
        </div>
        <div class="content_info">
          <div class="info_label">创建时间：</div>
          <div class="info_content">{{ info.createTime || '-' }}</div>
        </div>
        <div class="content_info" v-if="info.pictureType == 1">
          <div class="info_label">上传批次号：</div>
          <div class="info_content">{{ info.batchNumber || '暂无批次号' }}</div>
        </div>
      </div>
    </div>
    <template #footer v-if="info.brandId != '0'">
      <div class="dialog_footer">
        <el-button @click="delFun">删除</el-button>
        <el-button type="primary" @click="downFun">下载</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import { save, use } from '@/api/content_center/material_library.js'
import { downLoadFile } from '@/utils/exportFile.js'

import { downLoadAllFile, cancelDownFile } from '@/utils/batchDownloadFile.js'

import { throttle, isNotEmpty, changeKB } from '@/utils/tools'
const props = defineProps({
  detailDialog: {
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
const show = toRef(props.detailDialog, 'show')
const emits = defineEmits(['updateList', 'updateName'])
const info = ref({}) // 详情信息
const imgList = ref([]) // 图片列表 如果是单图 给拼成数组
const imgIndex = ref(0) // 图片的index 用于多图切换
onMounted(() => {
  if (isNotEmpty(props.detailDialog.info)) {
    info.value = JSON.parse(JSON.stringify(props.detailDialog.info))
    imgList.value = info.value.pictures.map(x => x.url)
    imgIndex.value = 0
  }
})
// 获取大小
function getAllSize() {
  // if (   info.value.pictureType===1) {
  return info.value.size ? changeKB(info.value.size) : '--'
  // } else {
  //   let allSize = 0
  //   info.value.pictures.forEach(x => {
  //     allSize += x.size
  //   })
  //   return allSize ? changeKB(allSize) : '--'
  // }
}
// 切换图片
const changeImg = throttle(e => {
  if (e === 1) {
    // 下一张
    if (imgIndex.value <= imgList.value.length - 1) {
      imgIndex.value += 1
    }
  } else {
    // 上一张
    if (imgIndex.value >= 1) {
      imgIndex.value -= 1
    }
  }
}, 300)

// // --修改名称
// const showEditName = ref(false)
// const newName = ref('')
// const switchEdit = () => {
//   showEditName.value = true
//   newName.value = info.value.name
// }
// const editNameBlur = () => {
//   const reg =
//     // eslint-disable-next-line no-misleading-character-class
//     /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
//   const value = newName.value.replace(reg, '')
//   // 新输入为空不保存 值没有变化 不保存
//   if (isEmpty(value) || value === info.value.name) {
//     showEditName.value = false
//     return
//   }
//   save({
//     id: info.value.id,
//     name: value
//   }).then(res => {
//     if (res.code === 0) {
//       showEditName.value = false
//       info.value.name = value
//       ElMessage.success('修改成功')
//       emits('updateName', value)
//     }
//   })
// }
// // --修改名称 end

// 删除
const delFun = throttle(() => {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox3 hide_footer_line',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '确定'
        save({
          id: info.value.id,
          isDelete: 1
        })
          .then(res => {
            if (res.code === 0) {
              emits('updateList')
              ElMessage({
                type: 'success',
                message: '删除成功'
              })
              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
              dialog.value.handleClose()
            } else {
              done()
              setTimeout(() => {
                instance.confirmButtonLoading = false
              }, 300)
            }
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
  })
    .then(() => {})
    .catch(() => {})
}, 700)
// 下载
const downFun = throttle(() => {
  ElMessageBox.confirm('是否要下载该场景图?', '系统提醒', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox3 hide_footer_line',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '确定'
        const regex = /[^\u4e00-\u9fa5a-zA-Z0-9]/g
        const urlList = []
        imgList.value.forEach((x, i) => {
          urlList.push({
            name: i + 1 + '',
            url: x,
            content: ''
          })
        })
        console.log('下载', urlList, info.value.pictureType)
        const downPromise =
          info.value.pictureType === 1
            ? downLoadFile(
                imgList.value[0],
                (info.value.name || '场景图').replace(regex, ''),
                'material_library'
              )
            : downLoadAllFile(urlList, 'productScene', instance, `${info.value.name}.zip`)
        downPromise
          .then(() => {
            use({
              id: info.value.id
            })
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
        if (info.value.pictureType === 2) {
          cancelDownFile()
        }
        done()
      }
    }
  }).then(() => {})
}, 700)
</script>
<style lang="scss" scoped>
.dialog_content {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .content_left {
    width: 192px;
    margin-right: 20px;
    .left_img {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 192px;
      height: 256px;
      border-radius: 4px;
      background: #f2f3f5;
      img,
      .img_info {
        border-radius: 4px;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: flex;
      }
    }
    .left_change {
      margin-top: 14px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .change_icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
        display: flex;
        cursor: not-allowed;
      }
      .change_icon_active {
        cursor: pointer;
        border-radius: 100%;
      }
      .change_icon_active:hover {
        background: rgba(54, 79, 205, 0.1);
      }
      .change_num {
        width: 72px;

        font-weight: 400;
        font-size: 14px;
        color: #606266;
        line-height: 20px;
        text-align: center;
      }
    }
  }
  .content_right {
    width: calc(100% - 212px);
    .content_info {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .info_label {
        flex-shrink: 0;
        font-weight: 400;
        font-size: 14px;
        color: #909399;
        line-height: 20px;
      }
      .info_content {
        width: calc(100% - 90px);
        font-weight: 400;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .info_name {
          max-width: calc(100% - 20px);
        }
        img {
          margin-left: 4px;
          cursor: pointer;
          width: 16px;
          height: 16px;
          object-fit: contain;
          display: flex;
        }
      }
    }
    .content_info + .content_info {
      margin-top: 12px;
    }
  }
}
</style>

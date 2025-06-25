<template>
  <div>
    <div v-show="drawer" class="source_box">
      <!-- :poster="info.coverUrl" -->
      <video
        ref="videoFile"
        v-show="info.type === 1 && info.url"
        class="video"
        :src="info.url || vv"
        controls="controls"
        :style="{
          width: info.wight >= info.height ? '500px' : '300px',
          objectFit: 'contain'
        }"
        preload="load"
      ></video>
      <audio
        ref="audioFile"
        v-if="info.type === 3"
        class="video"
        style="height: 55px"
        :src="info.url"
        controls="controls"
      ></audio>
      <div
        class="img_box video"
        :style="{
          width: info.wight >= info.height ? '500px' : '300px',
          objectFit: 'contain',
          overflowY: 'auto'
        }"
        v-if="info.type === 2"
      >
        <img
          :src="info.url"
          :style="{
            width: info.wight >= info.height ? '500px' : '300px',
            height: 'auto'
          }"
          alt
        />
      </div>
      <div v-if="info.type === 4 && info.content" class="video text_box">
        {{ info.content || '--' }}
      </div>
    </div>
    <!-- <div class="back" v-if="drawer"></div> -->

    <el-drawer
      :before-close="handleClose"
      v-model="drawer"
      :title="
        info.type === 1
          ? '视频素材'
          : info.type === 2
          ? '图片素材'
          : info.type === 3
          ? '音频素材'
          : info.type === 4
          ? '文本素材'
          : '素材'
      "
      direction="rtl"
      :size="400"
      :z-index="98"
    >
      <template #default>
        <div class="resource_info">
          <div class="title">{{ info.name || '--' }}</div>
          <div class="item_info">
            <div class="type">类型：</div>
            <div class="val">
              {{
                info.type === 1
                  ? '视频'
                  : info.type === 2
                  ? '图片'
                  : info.type === 3
                  ? '音频'
                  : info.type === 4
                  ? '文本'
                  : '未知'
              }}
            </div>
          </div>
          <div class="item_info" v-if="info.type === 1 || info.type === 3">
            <div class="type">时长：</div>
            <div class="val">
              {{ info.duration ? secondToDate(info.duration / 1000, '秒', true, true) : '--' }}
            </div>
          </div>
          <div class="item_info" v-if="info.type < 3">
            <div class="type">分辨率：</div>
            <div class="val" v-if="info.wight && info.height">
              {{ info.wight }}*{{ info.height }}
            </div>
            <div class="val" v-else>--</div>
          </div>
          <div class="item_info">
            <div class="type">大小：</div>
            <div class="val">{{ changeKB(info.size || 0) }}</div>
          </div>
          <div class="item_info">
            <div class="type">创建时间：</div>
            <div class="val">{{ info.createTime || '--' }}</div>
          </div>
          <div class="item_info" style="white-space: nowrap">
            <div class="type">上传批次号：</div>
            <div class="val">{{ info.batchNumber || '暂无批次号' }}</div>
          </div>
        </div>
        <div class="tag_manage">
          <div class="title">标签管理</div>
          <div class="tag_box">
            <div class="item_tag" v-for="(item, index) in info.tagList" :key="index">
              {{ item.name || '--' }}
              <img
                class="close"
                src="@/assets/images/diy/add.png"
                @click="delTag(item.id, index)"
                alt
              />
            </div>
            <el-button type="primary" class="btn" style="margin-bottom: 24px" @click="editTags">
              打标签
            </el-button>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="footer">
          <el-button type="primary" @click="toDetail">详情</el-button>
          <el-button
            v-if="info.type === 4 && info.content !== null"
            type="default"
            v-copy="info.content"
          >
            复制
          </el-button>
          <el-button v-if="info.type !== 4" type="default" @click="downloadFile">下载</el-button>
          <el-button type="danger" @click="deleteMaterial">删除</el-button>
        </div>
      </template>
    </el-drawer>
    <!-- <addTagDialog
      ref="addTagDialog"
      v-if="addTagDialog.show"
      :addTagDialog="addTagDialog"
      @updateTag="updateTag"
    /> -->

    <addDialog v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
  </div>
</template>

<script setup>
import vv from '@/assets/vv.mp4'
import addDialog from '../components/addTag_dialog.vue'
import vCopy from '@/directive/copy'
import NProgress from '@/utils/nprogress'
import { useRouter } from 'vue-router'
import { detail, save, use } from '@/api/content_center/material_library.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { changeKB, throttle, secondToDate } from '@/utils/tools.js'
import { downLoadFile } from '@/utils/exportFile.js'
// import addTagDialog from '../components/add_tag_dialog.vue'
const infoLoading = ref(true)
const drawer = ref(false)
// videoFile
const videoFile = ref(null)

NProgress.configure({ showSpinner: false })

const info = ref({})
const addTagDialog = reactive({
  show: false,
  id: null,
  type: null,
  chooseTagList: []
})
function openDrawer(id, show) {
  console.log('id:', id)
  if (!show) {
    NProgress.start()
  }
  detail({ id: id })
    .then(res => {
      if (res.code === 0) {
        if (!show) {
          drawer.value = true
          infoLoading.value = false
        }
        nextTick(() => {
          info.value = res.data
        })
      } else {
        if (!show) {
          infoLoading.value = false
          ElMessage.warning('未获取到素材相关信息，请联系管理员')
          drawer.value = false
        }
      }
      NProgress.done()
    })
    .catch(() => {
      if (!show) {
        infoLoading.value = false
        drawer.value = false
      }
      NProgress.done()
    })
}
// 删除标签
const delTag = throttle((id, index) => {
  // let tagList=[]
  const tagList = info.value.tagList.map(e => e.id)
  tagList.splice(index, 1)
  console.log('删除的标签：', id, index, tagList)
  save({
    id: info.value.id,
    tags: tagList
  }).then(res => {
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      info.value.tagList.splice(index, 1)
    }
  })
}, 700)

const emits = defineEmits(['updateList'])
function deleteMaterial() {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox'
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
          drawer.value = false
          ElMessage({
            type: 'success',
            message: '删除成功'
          })
          // 如果删除的是视频，就暂停播放
          if (info.value.type === 1) {
            videoFile.value.pause()
          }
        }
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      })
    })
}

const router = useRouter()
const toDetail = throttle(function () {
  router.push({
    path: '/content_center/content_repository/material_library/material_detail',
    query: { id: info.value.id }
  })
}, 700)
const downloadFile = throttle(function () {
  if (info.value.url) {
    ElMessageBox.confirm('是否要下载该作品?', '系统提醒', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: '',
      customClass: 'drawer_systemBox'
    }).then(async () => {
      use({
        id: info.value.id
      })
      downLoadFile(info.value.url, info.value.name || '素材', 'material_library')
    })
  } else {
    ElMessage({
      type: 'warning',
      message: '暂未找到相关下载链接'
    })
  }
}, 700)
function handleClose(done) {
  info.value = {}
  done()
}
// 标签
function editTags() {
  addTagDialog.type = 2
  addTagDialog.id = info.value.id
  addTagDialog.show = true
  addTagDialog.chooseTagList = info.value.tagList
    ? JSON.parse(JSON.stringify(info.value.tagList))
    : []
  // chooseTagList.value = info.value.tagList ? JSON.parse(JSON.stringify(info.value.tagList)) : []
  // getTagList()
}
function updateTag() {
  openDrawer(info.value.id, true)
}
// const allDelTag = ref([]) // 所有删除的标签
// const allTagList = ref([])
// const chooseTagList = ref([])
// function getTagList() {
//   add({
//     name: inputTabName.value
//   }).then(res => {
//     if (res.code === 0) {
//       // if(res.)
//       if (res.data.isCreate === 1) {
//         ElMessage({
//           type: 'success',
//           message: '新增成功'
//         })
//       }
//       allTagList.value = res.data.list || []
//       changeDel(true)
//         .then(() => {
//           changeChoose()
//         })
//         .catch(() => {
//           changeChoose()
//         })

//       console.log(res.data)
//     }
//   })
// }
// function changeDel() {
//   return new Promise((resolve, reject) => {
//     if (allDelTag.value.length > 0) {
//       const newAllTagList = JSON.parse(JSON.stringify(allTagList.value))
//       const newAllTagList2 = JSON.parse(JSON.stringify(allTagList.value))
//       console.log(12, allTagList.value)
//       newAllTagList.forEach((x, i) => {
//         x.group.forEach((y, ii) => {
//           allDelTag.value.forEach((z, iii) => {
//             if (y.id === z.id) {
//               newAllTagList2[i].group.splice(ii, 1)
//             }
//           })
//         })
//       })
//       // 判断是否
//       let isHaveData = false
//       newAllTagList2.forEach(x => {
//         if (x.group && x.group.length > 0) {
//           isHaveData = true
//         }
//       })
//       if (isHaveData) {
//         allTagList.value = newAllTagList2
//       } else {
//         allTagList.value = newAllTagList
//         // 还原的id
//         let resId = null
//         if (newAllTagList.length === 1 && newAllTagList[0].group.length === 1) {
//           resId = newAllTagList[0].group[0].id
//         }
//         let resIndex = null
//         allDelTag.value.forEach((x, i) => {
//           if (x.id === resId) {
//             resIndex = i
//           }
//         })
//         if (resIndex !== null) {
//           allDelTag.value.splice(resIndex, 1)
//         }
//       }
//     }
//     resolve()
//   })
// }
// function changeChoose() {
//   allTagList.value.forEach(x => {
//     x.group.forEach(y => {
//       let stu = false
//       chooseTagList.value.forEach(z => {
//         if (y.id === z.id) {
//           stu = true
//         }
//       })
//       y.choose = stu
//     })
//   })
// }
defineExpose({ openDrawer })
</script>

<style lang="scss" scoped>
.source_box {
  .video {
    width: 300px;
    height: auto;
    border-radius: 8px;
    overflow: hidden;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 99;
    max-height: 80vh;
    object-fit: cover;
  }
}

:deep(.el-drawer__header) {
  padding: 0 24px !important;
  margin: 0;
  height: 60px;
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  line-height: 25px;
  border-bottom: 1px solid #f7f7f7;
}
:deep(.el-drawer__body) {
  padding: 0;
}
:deep(.el-drawer__footer) {
  padding: 0;
}
.footer {
  // position: absolute;
  // bottom: 0;
  // width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid #f7f7f7;
  .el-button {
    margin: 0 24px 0 0;
  }
}
.tag_manage {
  padding: 20px 24px 0;

  .title {
    font-size: 18px;
    font-weight: 550;
    color: #333333;
    line-height: 25px;
  }
  .tag_box {
    margin-top: 25px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    .item_tag {
      margin-right: 24px;
      margin-bottom: 24px;
      padding: 0 14px 0 16px;
      height: 28px;
      background: #d2d7f0;
      border-radius: 16px;
      display: flex;
      align-items: center;
      .close {
        margin-left: 10px;
        width: 10px;
        height: 10px;
        transform: rotate(45deg);
        cursor: pointer;
      }
    }
  }
}
.resource_info {
  padding-bottom: 20px;
  margin: 24px 24px 0;
  border-bottom: 1px solid #ebedf0;
  .title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 550;
    color: #333333;
    line-height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-wrap: break-word;
  }
  .item_info {
    margin-bottom: 12px;
    display: flex;
    font-size: 14px;
    line-height: 20px;

    .type {
      width: 84px;
      text-align: right;
      color: #646566;
    }
    .val {
      margin-left: 14px;
      color: #333333;
    }
  }
}
:deep(.el-tag--light) {
  background: #d2d7f0;
  color: #303133;
  border-radius: 16px;
  border: 1px solid #d2d7f0;
  padding: 1px 10px 1px 22px;
  .el-tag__close {
    color: #364fcd;
  }
}
:deep(.el-tag--info) {
  border: 1px solid #999999 !important;
  background: #fff !important;
  .el-tag__close {
    color: #303133 !important;
  }
}
.text_box {
  padding: 10px;
  background: #fff;
  width: 500px !important;
  min-height: 300px !important;
  max-height: 70vh !important;
  overflow-y: auto !important;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 22px;
}
</style>

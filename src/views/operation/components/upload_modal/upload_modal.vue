<template>
  <div class="upload_modal">
    <el-dialog v-model="show" ref="dialog" title="选择图片" width="1144px" destroy-on-close>
      <el-tabs v-model="chooseTab" class="tab_box">
        <el-tab-pane name="upload" label="上传图片">
          <div class="tab_content">
            <div class="tab_one" v-if="uploadGroupInfo.id">
              <div class="label">分组：</div>
              <div class="content" style="line-height: 32px">
                {{ uploadGroupInfo.name || '--' }}
              </div>
            </div>
            <div class="tab_one">
              <div class="label">网络图片：</div>
              <div class="content">
                <el-input
                  style="width: 518px"
                  placeholder="请输入网络图片地址"
                  v-model="imgUrl"
                ></el-input>
                <el-button style="margin-left: 16px" @click="saveUrl">提取</el-button>
              </div>
            </div>
            <div class="tab_one">
              <div class="label">本地图片：</div>
              <div class="content" style="flex-direction: column; align-items: flex-start">
                <div class="content_1">
                  <el-upload
                    :disabled="fileLoading"
                    ref="upload"
                    :show-file-list="false"
                    accept="image/jpeg, image/jpg, image/png, image/gif"
                    :action="action"
                    :headers="headers"
                    :on-success="handleSuccess"
                    :on-error="handleError"
                    :before-upload="beforeUploadFile"
                    :on-exceed="handleExceed"
                    :limit="chooseNum"
                    :multiple="chooseNum > 1"
                  >
                    <el-button type="primary" :loading="fileLoading">
                      <el-icon v-if="!fileLoading"><i-upload-filled /></el-icon>
                      选择图片
                    </el-button>
                  </el-upload>
                  <!-- <div class="content_1_mark">多图按上传的顺序排序</div> -->
                </div>
                <div class="content_1_mark" style="margin: 8px 0">
                  仅支持gif,jpg,png格式，大小不能超过500K
                </div>
              </div>
            </div>
            <div class="img_box">
              <div class="one_img" v-for="(item, index) in imgList" :key="index">
                <div class="one_img_box">
                  <img :src="item.thumb" class="img_cover" alt="" />
                  <div class="img_name line-hidden1">{{ item.title || '--' }}</div>
                </div>
                <div class="img_btn">
                  <el-link type="primary" @click="delImg(index)">删除</el-link>
                </div>
              </div>
            </div>
            <div class="dialog-footer">
              <el-button @click="closeDialog">取消</el-button>
              <el-button type="primary" @click="handleConfirm">确定</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane name="library" label="素材库">
          <div class="library_content">
            <div class="library_left">
              <template v-if="groupsList.length > 0">
                <div
                  :class="{
                    one_group: true,
                    'line-hidden1': true,
                    checked_group: item.id == librayGroupId
                  }"
                  v-for="(item, index) in groupsList"
                  :key="index"
                  @click="chooseGroupFun(item.id)"
                >
                  {{ item.name }}
                </div>
              </template>
              <div v-else class="no_class">暂无数据</div>
            </div>
            <div class="library_right">
              <div class="library_imgBox">
                <div class="img_table">
                  <template v-if="imgForm.listData && imgForm.listData.length > 0">
                    {{ ' ' }}
                    <div
                      class="one_image"
                      v-for="(item, index) in imgForm.listData || []"
                      :key="index"
                      @click="chooseImgFun(item, index)"
                    >
                      <img class="image_cover" v-if="item.thumb" :src="item.thumb" alt="" />
                      <div class="img_name">{{ item.title || '--' }}</div>
                      <div :class="{ image_check: true, checked_img: item.checked }">
                        <el-icon><i-select /></el-icon>
                      </div>
                    </div>
                  </template>
                  <div v-else class="no_class">暂无数据</div>
                </div>
                <div class="xm_table_page">
                  <el-pagination
                    v-model:current-page="pageIndex"
                    background
                    layout="total,sizes, prev, pager, next , jumper"
                    :total="imgForm.page.total"
                    :page-size="imgForm.page.size"
                    :page-sizes="[10, 20, 50, 100]"
                    @current-change="handleCurrentChange"
                    @size-change="handleSizeChange"
                  ></el-pagination>
                </div>
              </div>

              <div class="library_footer">
                <div class="footer_mark">已选{{ imgForm.chooseList.length || 0 }}张图片</div>
                <div class="footer_btn">
                  <el-button @click="closeDialog">取消</el-button>
                  <el-button type="primary" @click="handleLibraryConfirm">确定</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>
<script setup>
import { saveOrUpdateAttachment, getAttachmentCategory } from '@/api/operation/library.js'
import { throttle } from '@/utils/tools.js'
import { pageImg } from './model/library.js'
const props = defineProps({
  uploadModal: {
    type: Object,
    default: () => {
      return {
        show: false,
        chooseNum: 1 // 默认选择一张图片
      }
    }
  }
})

const emits = defineEmits(['upImg'])
const message = inject('$message')
// 是否展示
const show = toRef(props.uploadModal, 'show')

const chooseTab = ref('upload')

const dialog = ref()
const chooseNum = ref(0)
function init() {
  console.log('init', props.uploadModal)
  if (props.uploadModal.chooseNum) {
    chooseNum.value = props.uploadModal.chooseNum
  } else {
    chooseNum.value = 1
  }
  getImgGroup()
}
init()
/**
 * 获取图片分组
 */
const groupsList = ref([]) // 图片分组列表
const uploadGroupInfo = ref({
  id: null,
  name: ''
}) // 上传图片的分组信息[包含id和name]
const librayGroupId = ref() // 素材库的分组ID
function getImgGroup() {
  getAttachmentCategory()
    .then(res => {
      if (res.code === 0) {
        groupsList.value = res.data || []
        // groupsList.value.unshift({
        //   id: -1,
        //   name: '未分组'
        // })
        if (res.data && res.data.length > 0) {
          uploadGroupInfo.value = {
            id: res.data[0].id,
            name: res.data[0].name
          }
          chooseGroupFun(res.data[0].id)
        }
      }
    })
    .catch(() => {})
}
/**
 * 素材库
 */
const { imgForm, resetSearch, pageIndex, handleCurrentChange, handleSizeChange } = pageImg()
// 查看当前分组下的图片
const chooseGroupFun = throttle(id => {
  librayGroupId.value = id
  resetSearch(id, true)
}, 300)
// 选择图片
const chooseImgFun = throttle((e, i) => {
  if (chooseNum.value <= imgForm.chooseList.length && !e.checked) {
    message.warning(`本次最多选择${chooseNum.value}张图片`)
    return
  }
  if (e.checked) {
    e.checked = false
    const chooseIndex = imgForm.chooseList.map(item => item.id).indexOf(e.id)
    imgForm.chooseList.splice(chooseIndex, 1)
  } else {
    e.checked = true
    imgForm.chooseList.push(e)
  }
})
function handleLibraryConfirm() {
  if (imgForm.chooseList.length > 0) {
    const chooseList = imgForm.chooseList.slice(0, chooseNum.value)
    const showList = chooseList.map(x => x.thumb)
    console.log('show', showList)
    emits('upImg', showList)
    dialog.value.handleClose()
  } else {
    message.warning('请先选择图片')
  }
}

/**
 * 上传图片
 */
const imgList = ref([])
const imgUrl = ref('')
const saveUrl = throttle(() => {
  if (imgList.value.length >= chooseNum.value) {
    message.warning(`本次最多选择${chooseNum.value}张图片`)
    return
  }
  if (imgUrl.value) {
    //  /(http|https):\/\/((?!http:\/\/).)+?(\.jpg|\.png)/
    const regx = /^((https|http)?:\/\/)[^\s]+/
    if (regx.test(imgUrl.value)) {
      const titleLen = imgUrl.value.split('/')
      if (imgList.value && imgList.value.length > 0) {
        imgList.value.unshift({
          thumb: imgUrl.value,
          title: titleLen.length > 0 ? titleLen[titleLen.length - 1] : ''
        })
      } else {
        imgList.value = [
          { thumb: imgUrl.value, title: titleLen.length > 0 ? titleLen[titleLen.length - 1] : '' }
        ]
      }

      imgUrl.value = ''
    } else {
      message.warning('请输入正确的网络图片地址')
    }
  } else {
    message.warning('请输入网络图片地址')
  }
}, 300)
const upload = ref()
const uploadNum = ref(0)
const action = '/api/v1/brand/app/appDiyPage/uploadImg'
const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token')
})
const fileLoading = ref(false) // 图片的loading
function handleExceed(files, fileList) {
  if (files.length > chooseNum.value) {
    message.warning(`一次最多选择${chooseNum.value}张图片！`)
    upload.value.clearFiles()
  }
}
// 文件上传之前
function beforeUploadFile(file) {
  uploadNum.value = 0
  const size = file.size
  if (size > 2000000) {
    message({
      type: 'warning',
      message: '图片大小不能超过2M'
    })
    upload.value.clearFiles()
    return false
  }
  fileLoading.value = true
}

// 文件上传成功
function handleSuccess(res, file) {
  if (res.code === 0) {
    saveOrUpdateAttachment({
      categoryId: uploadGroupInfo.value.id || null,
      thumb: res.data,
      title: file.name,
      type: 1,
      url: res.data
    }).then(res2 => {
      if (res2.code === 0) {
        uploadNum.value++
        if (uploadNum.value < 2) {
          message.success('图片上传成功')
        }
        if (imgList.value && imgList.value.length > 0) {
          imgList.value.unshift({ thumb: res.data, title: file.name })
        } else {
          imgList.value = [{ thumb: res.data, title: file.name }]
        }
      }
    })
  } else {
    message.warning('图片上传失败')
  }

  fileLoading.value = false
  upload.value.clearFiles()
}
// 文件上传失败
function handleError() {
  fileLoading.value = false
  upload.value.clearFiles()
}
// 删除图片
const delImg = throttle(i => {
  imgList.value.splice(i, 1)
})
// 关闭整个弹窗
function closeDialog() {
  dialog.value.handleClose()
}
function handleConfirm() {
  if (imgList.value.length > 0) {
    console.log(imgList.value, chooseNum.value)
    const list = imgList.value.slice(0, chooseNum.value)
    const chooseList = list.slice(0, chooseNum.value)
    const showList = chooseList.map(x => x.thumb)
    console.log('show', showList)

    emits('upImg', showList)
    dialog.value.handleClose()
  } else {
    message.warning('请先选择图片')
  }
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
:deep(.el-dialog__body) {
  padding: 16px 0 0;
}
.tab_content {
  padding: 16px 0 0;
  .tab_one {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    font-size: 14px;
    font-weight: 400;
    color: #323233;
    line-height: 20px;
    .label {
      width: 126px;
      padding-right: 8px;
      text-align: right;
      line-height: 32px;
    }
    .content {
      width: calc(100% - 126px);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .content_1 {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
      }
      .content_1_mark {
        margin-left: 16px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
  .tab_one + .tab_one {
    margin-top: 24px;
  }
  .img_box {
    padding-left: 126px;
    width: 100%;
    max-height: 350px;
    overflow-y: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_img {
      margin-right: 16px;
      margin-top: 10px;
      width: 160px;
      height: 182px;
      .one_img_box {
        width: 160px;
        height: 160px;
        background: #f2f2f2;
        border: 1px solid #c0c4cc;
        position: relative;
        .img_cover {
          width: 160px;
          height: 160px;
          object-fit: cover;
        }
      }
      .img_btn {
        width: 100%;
        height: 22px;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
.img_name {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 32px;
  background: rgba($color: #000000, $alpha: 0.3);
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
  line-height: 32px;
  text-align: center;
}
.dialog-footer {
  margin-top: 20px;
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding-right: 24px;
  border-top: 1px solid #dcdfe6;
}

// 素材库
.library_content {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  height: 520px;
  .no_class {
    color: #909399;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .library_left {
    width: 248px;
    height: 100%;
    overflow-y: auto;
    padding: 10px;
    border-right: 1px solid #dcdfe6;
    .one_group {
      width: 100%;
      height: 40px;
      border-radius: 2px;
      line-height: 40px;
      cursor: pointer;
      padding: 0 16px;
    }
    .checked_group {
      background: #f2f2f2;
    }
  }
  .library_right {
    width: calc(100% - 249px);
    .library_imgBox {
      width: 100%;
      height: 439px;
      padding: 0px 0 24px 24px;
      .img_table {
        width: 100%;
        height: 380px;
        overflow-y: auto;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        .one_image {
          cursor: pointer;
          width: 160px;
          height: 160px;
          background: #f2f2f2;
          border: 1px solid #c0c4cc;
          margin: 24px 12px 0px 0;
          position: relative;
          &:nth-child(5n) {
            margin-right: 0;
          }
          .image_cover {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .image_check {
            position: absolute;
            right: 10px;
            top: 10px;
            cursor: pointer;
            width: 16px;
            height: 16px;
            background: #ffffff;
            border-radius: 2px;
            border: 1px solid #dbdee0;
            color: #fff;
          }
          .checked_img {
            background: #364fcd;
            border: 1px solid #364fcd;
            color: #fff;
          }
        }
      }
    }
    .xm_table_page {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      padding: 10px 24px 0;
    }
    .library_footer {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      padding: 0px 24px 0;
      height: 80px;
      border-top: 1px solid #dcdfe6;
      .footer_mark {
        color: #909399;
        font-size: 14px;
        flex: 1;
      }
      .footer_btn {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        flex: 1;
      }
    }
  }
}
</style>

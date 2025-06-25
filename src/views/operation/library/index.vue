<template>
  <div class="libray">
    <div class="libray_left">
      <div class="title">图片分组</div>
      <div class="libray_content" v-loading="groupLoading">
        <template v-if="groupList.length > 0">
          <div
            :class="{ group_list: true, choose_group: chooseGroup == item.id }"
            v-for="(item, index) in groupList"
            :key="index"
            @click="chooseFun(item)"
          >
            <div class="group_name">{{ item.name }}</div>
            <div class="group_btn" v-if="item.id != -1">
              <div class="one_btn" @click.stop="showEditModal(item)">
                <img src="@/assets/images/diy/libray_edit.png" alt="" />
              </div>
              <div class="one_btn" @click.stop="delGroup(item)">
                <img src="@/assets/images/diy/libray_del.png" alt="" />
              </div>
            </div>
          </div>
        </template>
        <div v-else class="no_class">暂无数据</div>
      </div>
      <div class="left_bottom">
        <el-button @click="showAddModal">
          <img src="@/assets/images/diy/libray_add.png" alt="" />
          添加分组
        </el-button>
      </div>
    </div>
    <div class="libray_right">
      <div class="title">{{ chooseGroupName }}</div>
      <div class="libray_content">
        <div v-if="chooseGroup != null">
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
            :limit="20"
            multiple
          >
            <el-button type="primary" :loading="fileLoading">上传图片</el-button>
          </el-upload>
          <div class="upload_mark">
            支持Jpg,jpeg,png,gif格式；单张图片大小不能超过2M;单次上传张数不超过20张
          </div>
        </div>
        <div v-else>
          <el-button type="primary" @click="showToast">上传图片</el-button>
        </div>
        <div class="image_all">
          <div class="image_box" v-loading="imgForm.loading">
            <template v-if="imgForm.listData.length > 0">
              <div class="one_image" v-for="item in imgForm.listData" :key="item.id">
                <div class="image_cover">
                  <img :src="item.thumb" alt="" />
                  <div class="image_name">{{ item.title || '--' }}</div>
                </div>
                <div class="image_btn">
                  <el-link type="primary" @click="showChangeModal(item)">分组</el-link>
                  <div class="line"></div>
                  <el-link type="primary" @click="delImg(item)">删除</el-link>
                </div>
              </div>
            </template>
            <div v-else class="no_class" style="height: 330px">暂无数据</div>
          </div>
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
    </div>
    <addModal v-if="addForm.show" :addForm="addForm" @updateGroup="getGroup"></addModal>
    <changeModal
      v-if="changeForm.show"
      :changeForm="changeForm"
      @updateImg="updateImg"
    ></changeModal>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import addModal from './components/add_modal.vue'
import changeModal from './components/change_modal.vue'
import { pageImg } from './model/get_img.js'
import {
  delAttachmentCategroy,
  saveOrUpdateAttachment,
  getAttachmentCategory,
  delAttachment
} from '@/api/operation/library.js'
defineComponent(addModal, changeModal)
const { imgForm, resetSearch, getList, pageIndex, handleCurrentChange, handleSizeChange } =
  pageImg()
const groupLoading = ref(false)
// 分组列表
const groupList = ref([
  // {
  //   id: -1,
  //   name: '未分组'
  // }
])
// 选中的分组ID
const chooseGroup = ref(-1)
// 获取分组列表
function getGroup() {
  getAttachmentCategory()
    .then(res => {
      if (res.code === 0) {
        groupList.value = res.data || []
        // groupList.value.unshift({
        //   id: -1,
        //   name: '未分组'
        // })
        if (res.data && res.data.length > 0) {
          chooseGroup.value = res.data[0].id
        }
        resetSearch(chooseGroup.value, true)
      }
      groupLoading.value = false
    })
    .catch(() => {
      groupLoading.value = false
    })
}
function searchGroup() {
  groupLoading.value = true
  getGroup()
}
searchGroup()
// 选中的分组名称
const chooseGroupName = computed(() => {
  const chooseList = groupList.value.filter(x => x.id === chooseGroup.value)
  let name = ''
  if (chooseList.length > 0) {
    name = chooseList[0].name
  } else {
    chooseGroup.value = groupList.value.length > 0 ? groupList.value[0].id : null
    name = groupList.value.length > 0 ? groupList.value[0].name : null
  }
  return name
})
const message = inject('$message')
const $confirm = inject('$confirm')

// 删除分组
const delGroup = throttle(e => {
  getAttachmentCategory()
    .then(res => {
      if (res.code === 0) {
        const list = res.data || []
        let attachmentCount = null
        list.forEach(x => {
          if (x.id === e.id) {
            attachmentCount = x.attachmentCount
          }
        })

        if (attachmentCount > 0) {
          $confirm({
            title: '系统提醒',
            content: `分组内有${attachmentCount || 0}个图片，无法删除分组，请先删除图片`,
            success() {}
          })
        } else {
          delAttachmentCategroy({
            id: e.id
          }).then(res => {
            if (res.code === 0) {
              message.success('删除分组成功')
              getGroup()
            }
          })
        }
      }
    })
    .catch(() => {})
}, 300)
// 新增分组
const addForm = reactive({
  show: false,
  title: '',
  data: {
    id: null,
    name: '',
    type: null
  }
})
const showAddModal = throttle(() => {
  addForm.title = '新增分组'
  addForm.show = true
  addForm.data = {
    id: null,
    name: '',
    type: null
  }
}, 300)

const showEditModal = throttle(e => {
  addForm.title = '编辑分组'
  addForm.data = e
  addForm.show = true
}, 300)

//
function updateImg() {
  resetSearch(chooseGroup.value, false)
}
// 选择分组
const chooseFun = throttle(e => {
  chooseGroup.value = e.id
  resetSearch(e.id, true)
}, 300)
// 修改分组
const changeForm = reactive({
  show: false,
  data: {
    id: null,
    categoryId: null
  }
})
const showChangeModal = throttle(e => {
  changeForm.data = {
    id: e.id,
    categoryId: e.categoryId
  }
  changeForm.show = true
}, 300)
// 删除图片
const delImg = throttle(e => {
  delAttachment({
    id: e.id
  }).then(res => {
    if (res.code === 0) {
      message.success('删除图片成功')
      getList()
    }
  })
})

// 上传图片
const upload = ref()
const uploadNum = ref(0)
const action = '/api/v1/brand/app/appDiyPage/uploadImg'
const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token')
})
const fileLoading = ref(false) // 图片的loading
function handleExceed(files, fileList) {
  if (files.length > 20) {
    message.warning('单次最多选择20张图片！')
    upload.value.clearFiles()
  }
}
let mutipImg = 0
// 文件上传之前
function beforeUploadFile(file) {
  const size = file.size
  if (size > 2000000) {
    message({
      type: 'warning',
      message: '单张图片大小不能超过2M'
    })

    // upload.value.clearFiles()
    // fileLoading.value = false
    return false
  } else {
    mutipImg++
    fileLoading.value = true
  }
  //
}

// 文件上传成功
function handleSuccess(res, file) {
  if (res.code === 0) {
    saveOrUpdateAttachment({
      categoryId: chooseGroup.value,
      thumb: res.data,
      title: file.name,
      type: 1,
      url: res.data
    })
      .then(res2 => {
        if (res2.code === 0) {
          uploadNum.value++
          if (uploadNum.value === mutipImg) {
            message.success('图片上传成功')
            mutipImg = 0
            uploadNum.value = 0
            upload.value.clearFiles()
            getList()
          }
        }
      })
      .finally(() => {
        fileLoading.value = false
      })
  } else {
    message.warning('图片上传失败')
    fileLoading.value = false
  }
}
// 文件上传失败
function handleError() {
  fileLoading.value = false
  upload.value.clearFiles()
}

const showToast = throttle(() => {
  message.warning('请先添加图片分组')
}, 300)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.libray {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  .title {
    padding: 22px 0 14px 24px;
    border-bottom: 1px solid #e8e8e8;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    line-height: 22px;
  }
  .left_bottom {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 56px;
    background: #ffffff;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    border-radius: 0px 0px 4px 4px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 12px 16px;
    .el-button {
      width: 100%;
      img {
        width: 10px;
        height: 10px;
        margin-right: 5px;
      }
    }
  }
  .libray_left {
    width: 248px;
    height: 100%;
    background: #ffffff;
    border-radius: 4px;
    margin-right: 16px;
    position: relative;
    .libray_content {
      padding: 16px 10px 6px;
      height: calc(100% - 115px);
      overflow-y: auto;
    }
    .group_list {
      cursor: pointer;
      width: calc(100% - 0px);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border-radius: 2px;
      padding: 8px 12px;

      .group_name {
        width: calc(100% - 60px);
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
      .group_btn {
        width: 60px;
        opacity: 0;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        .one_btn {
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 2px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          margin-left: 6px;
          &:hover {
            background: #e9e9e9;
          }
          img {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
    .group_list:hover {
      background: #f2f2f2;
      .group_btn {
        opacity: 1;
      }
    }
    .choose_group {
      background: #e9e9e9;
      .group_name {
        font-weight: 500 !important;
      }
    }
  }
  .no_class {
    width: 100%;
    height: 400px;
    line-height: 300px;
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    color: #909399;
  }
  .libray_right {
    width: calc(100% - 264px);
    height: 100%;
    background: #ffffff;
    border-radius: 4px;
    .libray_content {
      height: calc(100% - 59px);
      padding: 16px 12px 16px 24px;
      position: relative;
      .upload_mark {
        margin: 12px 0 10px;
        padding-bottom: 16px;
        font-size: 12px;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
        border-bottom: 1px solid #e8e8e8;
      }
      .image_all {
        width: 100%;

        height: calc(100% - 127px);
        overflow-y: auto;
      }
      .image_box {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;

        .one_image {
          width: 12.5%;
          padding-right: 12px;
          margin: 10px 0 6px;
          .image_cover {
            width: 100%;
            padding-bottom: 100%;
            border: 1px solid #c0c4cc;
            background: #f2f2f2;
            position: relative;
            img {
              width: 100%;
              height: 101%;
              object-fit: cover;
              display: flex;
              position: absolute;
              left: 0;
              top: 0;
            }
            .image_name {
              position: absolute;
              left: 0;
              bottom: -1px;
              padding: 0 6px;
              font-size: 14px;
              font-weight: 400;
              color: #ffffff;
              width: calc(100% - 0px);
              height: 32px;
              background: rgba($color: #000000, $alpha: 0.3);
              text-align: center;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow-wrap: break-word;
              line-height: 32px;
            }
          }
          .image_btn {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding-top: 8px;
            .line {
              width: 1px;
              height: 12px;
              background: #c0c4cc;
              margin: 0 8px;
            }
          }
        }
        @media screen and(max-width:1600px) {
          .one_image {
            width: 16.66%;
          }
        }
        @media screen and(max-width:1200px) {
          .one_image {
            width: 20%;
          }
        }
      }
    }
  }
}
.xm_table_page {
  background: #fff;
  padding: 6px 0 12px;
  display: flex;
  justify-content: flex-end;
  position: absolute;
  right: 24px;
  bottom: 0px;
}
::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 7px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 7px;
  margin: 0 2px;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 7px;
  background-color: #c0c2c2;
  // margin: 0 5px;
}
</style>

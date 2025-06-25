<template>
  <div class="works_detail">
    <!-- 详情信息 -->
    <div class="head_info_box">
      <div class="basic_info_box">
        <div class="title">
          <div class="title_left">基础信息</div>
          <div class="title_right" v-if="tableForm.workInfo">
            <el-button type="primary" @click="editTags">打标签</el-button>
            <el-button
              v-if="tableForm.workInfo.type === 4 && tableForm.workInfo.content !== null"
              type="default"
              v-copy="tableForm.workInfo.content"
            >
              复制
            </el-button>
            <el-button v-if="tableForm.workInfo.type !== 4" type="default" @click="downloadFile">
              下载
            </el-button>
            <el-button type="danger" @click="deleteMaterial">删除</el-button>
          </div>
        </div>
        <div class="video_detail_box">
          <div
            class="img_box"
            style="cursor: pointer"
            @click="playVideo"
            v-if="tableForm.workInfo.type === 1"
          >
            <img class="video_img" :src="tableForm.workInfo.coverUrl" alt="" />
            <img class="play" src="@/assets/images/play_btn.png" alt="" />
          </div>
          <div
            class="img_box"
            style="cursor: pointer"
            @click="playVideo"
            v-else-if="tableForm.workInfo.type === 3"
          >
            <img
              class="video_img"
              src="@/assets/images/content_center/material/audio_back.png"
              alt=""
            />
            <img class="play" src="@/assets/images/play_btn.png" alt="" />
          </div>
          <div
            class="img_box"
            v-else-if="tableForm.workInfo.type !== 4"
            :style="{
              backgroundColor: tableForm.workInfo.type !== 2 ? '#fff' : ''
            }"
          >
            <img
              v-if="tableForm.workInfo.type === 2"
              class="img"
              :src="tableForm.workInfo.url"
              alt=""
            />
            <img
              v-if="tableForm.workInfo.type === 3"
              class="img"
              src="@/assets/images/content_center/material/audio_back.png"
              alt=""
            />
            <img
              v-if="tableForm.workInfo.type === 4"
              class="img"
              src="@/assets/images/content_center/material/text_back.png"
              alt
            />
            <img
              v-if="tableForm.workInfo.type === 5"
              class="img"
              src="@/assets/images/content_center/material/none_back.png"
              alt=""
            />
          </div>
          <div class="detail" :style="{ width: tableForm.workInfo.type === 4 ? 'width:100%' : '' }">
            <div class="video_name" v-if="!editForm.stu">
              <div class="line-hidden1" style="max-width: 90%; margin-right: 8px">
                {{ tableForm.workInfo.name || '--' }}
              </div>

              <i
                class="icon iconfont icon-edit"
                style="cursor: pointer; color: #364fcd; font-size: 14px"
                @click="showNameInput"
              ></i>
            </div>
            <el-input
              v-else
              style="width: 80%; min-width: 230px; margin-bottom: 5px"
              maxlength="99"
              v-model.trim="editForm.name"
              placeholder="请输入标题"
              @blur="retEmit($event)"
            >
              <template #append>
                <el-button @click="saveName">确定</el-button>
              </template>
            </el-input>
            <div class="other_box" v-if="tableForm.workInfo.type !== 4">
              <div class="other_info">
                类型：
                {{
                  tableForm.workInfo.type === 1
                    ? '视频'
                    : tableForm.workInfo.type === 2
                    ? '图片'
                    : tableForm.workInfo.type === 3
                    ? '音频'
                    : tableForm.workInfo.type === 4
                    ? '文本'
                    : '未知'
                }}
              </div>

              <div
                class="other_info"
                style="margin-left: 8px"
                v-if="tableForm.workInfo.type === 1 || tableForm.workInfo.type === 3"
              >
                时长：{{
                  tableForm.workInfo.duration
                    ? secondToDate(tableForm.workInfo.duration / 1000, '秒', true, true)
                    : '--'
                }}
              </div>
            </div>
            <div class="other_info" v-if="tableForm.workInfo.type < 3">
              分辨率：{{ tableForm.workInfo.wight || '--' }}*{{ tableForm.workInfo.height || '--' }}
            </div>
            <div class="other_info text_content" v-if="tableForm.workInfo.type === 4">
              {{ tableForm.workInfo.content }}
            </div>
            <div class="other_info">大小：{{ changeKB(tableForm.workInfo.size || 0) }}</div>
            <div class="other_info">创建时间：{{ tableForm.workInfo.createTime || '--' }}</div>
            <div class="other_info">
              上传批次号：{{ tableForm.workInfo.batchNumber || '暂无批次号' }}
            </div>
          </div>
        </div>
        <div
          class="tab_list"
          v-if="tableForm.workInfo.tagList && tableForm.workInfo.tagList.length"
        >
          <el-tag class="tab" v-for="item in tableForm.workInfo.tagList" :key="item">
            {{ item.name }}
          </el-tag>
        </div>
      </div>
      <div class="work_source_box">
        <div class="title">素材来源</div>
        <div class="info_box">
          <span class="label">来源渠道：</span>
          <span class="value">
            {{
              tableForm.workInfo.source === 1
                ? '运营策略'
                : tableForm.workInfo.source === 2
                ? 'Sumvideo'
                : tableForm.workInfo.source === 3
                ? '手动上传'
                : tableForm.workInfo.source === 4
                ? '第三方(酷家乐)'
                : '--'
            }}
          </span>
        </div>
        <div class="info_box">
          <span class="label">上传用户：</span>
          <img
            v-if="tableForm.workInfo.userHeadUrl"
            class="head_portrait"
            :src="tableForm.workInfo.userHeadUrl"
            alt=""
          />
          <span class="value">{{ tableForm.workInfo.userName || '--' }}</span>
        </div>
        <div class="info_box">
          <span class="label">手机号：</span>
          <span class="value">
            <template v-if="tableForm.workInfo.userPhone">
              {{ tableForm.workInfo.userPhone.substring(0, 3) }}****{{
                tableForm.workInfo.userPhone.substring(7)
              }}
            </template>
            <template v-else>--</template>
          </span>
        </div>
        <div class="info_box">
          <span class="label">备注：</span>
          <span class="value">{{ tableForm.workInfo.remark || '--' }}</span>
        </div>
      </div>
    </div>
    <!-- 使用记录列表 -->
    <div class="table_box">
      <div class="title">使用记录</div>
      <xm_table
        class="pic_table"
        v-loading="tableForm.loading"
        :data="tableForm.listData"
        v-model:page="tableForm.page"
        @getTableData="getList"
      >
        <!-- 用户信息 -->
        <el-table-column min-width="200" label="用户信息">
          <template #default="scope">
            <div class="user_box">
              <div class="user_avatar">
                <img
                  v-if="scope.row.useUserHeadUrl"
                  :src="scope.row.useUserHeadUrl"
                  class="user_head"
                  alt
                />
                <img
                  v-else
                  src="@/assets/images/content_center/default_user.png"
                  class="user_head"
                  alt
                />
              </div>
              <div style="max-width: 300px" class="content_text">
                {{ scope.row.useUserName || '--' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 手机号 -->
        <el-table-column min-width="200" label="手机号">
          <template #default="scope">
            <div class="phone">
              <template v-if="scope.row.useUserPhone">
                {{ scope.row.useUserPhone.substring(0, 3) }}****{{
                  scope.row.useUserPhone.substring(7)
                }}
              </template>
              <template v-else>--</template>
            </div>
          </template>
        </el-table-column>
        <!-- 使用平台 -->
        <!-- <el-table-column min-width="200" label="使用平台">
          <template #default="scope">
            <div class="phone">
              {{ scope.row.usePlat ? platList.get(scope.row.usePlat) : '--' }}
            </div>
          </template>
        </el-table-column> -->
        <!-- 使用形式 -->
        <el-table-column min-width="200" label="使用形式">
          <template #default="scope">
            <div class="phone">
              {{ scope.row.useWay ? wayList.get(scope.row.useWay) : '--' }}
            </div>
          </template>
        </el-table-column>
        <!-- 使用时间 -->
        <el-table-column min-width="200" label="使用时间">
          <template #default="scope">
            <div class="phone">
              {{ scope.row.useTime || '--' }}
            </div>
          </template>
        </el-table-column>
      </xm_table>
    </div>
    <el-dialog
      destroy-on-close
      :title="
        tableForm.workInfo.type === 1
          ? '查看视频'
          : tableForm.workInfo.type === 3
          ? '查看音频'
          : '查看素材'
      "
      width="444px"
      @close="bigVideoVisible = false"
      v-model="bigVideoVisible"
    >
      <video
        v-if="tableForm.workInfo.type === 1"
        class="video"
        style="width: 400px; height: auto; max-height: 70vh"
        :src="tableForm.workInfo.url"
        controls="controls"
        autoplay
      ></video>
      <audio
        v-if="tableForm.workInfo.type === 3"
        class="video"
        style="width: 100%; height: 55px"
        :src="tableForm.workInfo.url"
        controls="controls"
      ></audio>
    </el-dialog>
    <addDialog v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="getWorkInfo" />
  </div>
</template>

<script setup>
import addDialog from '../components/addTag_dialog.vue'
import vCopy from '@/directive/copy'
import { throttle, changeKB, secondToDate } from '@/utils/tools.js'
import { detail, logList, save, use } from '@/api/content_center/material_library.js'

import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { downLoadFile } from '@/utils/exportFile.js'
const editForm = reactive({
  stu: false,
  name: ''
})
const route = useRoute()
// 表格的查询条件
const tableForm = reactive({
  loading: false,
  workInfo: {},
  listData: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  }
})
const message = inject('$message')
function showNameInput() {
  editForm.name = tableForm.workInfo.name
  editForm.stu = true
}
// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  editForm.name = e.target.value.replace(reg, '')
}
function saveName() {
  if (editForm.name) {
    save({
      id: route.query.id,
      name: editForm.name
    }).then(res => {
      if (res.code === 0) {
        message({
          type: 'success',
          message: '修改成功'
        })

        getWorkInfo()
        editForm.stu = false
        editForm.name = ''
      }
    })
  } else {
    message({
      type: 'warning',
      message: '请输入标题'
    })
  }
}
const addTagDialog = reactive({
  show: false,
  id: null,
  type: null,
  chooseTagList: []
})
function editTags() {
  addTagDialog.type = 2
  addTagDialog.id = route.query.id
  addTagDialog.show = true
  addTagDialog.chooseTagList = tableForm.workInfo.tagList
    ? JSON.parse(JSON.stringify(tableForm.workInfo.tagList))
    : []
  // chooseTagList.value = info.value.tagList ? JSON.parse(JSON.stringify(info.value.tagList)) : []
  // getTagList()
}
const bigVideoVisible = ref(false)
// 播放视频
function playVideo() {
  bigVideoVisible.value = true
}
// 获取作品详情的回调
async function getWorkInfo() {
  console.log(route)
  const res = await detail({ id: route.query.id || '' })
  if (res.success) {
    console.log(res, 'getWorkInfo res')
    tableForm.workInfo = res.data
  }
  console.log(res)
}
// 获取记录

// const platList = reactive(new Map([[1, '抖音']]))
const wayList = reactive(
  new Map([
    [1, 'Sumvideo'],
    [2, '下载']
  ])
)
function resetList() {
  tableForm.loading = true
  tableForm.page.index = 1
  getList()
}
function getList() {
  logList({
    mIds: route.query.id ? [route.query.id] : [],
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    searchCount: true
  })
    .then(res => {
      if (res.code === 0) {
        tableForm.listData = res.data.records
        tableForm.page.total = res.data.total
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
const downloadFile = throttle(function () {
  if (tableForm.workInfo.url) {
    ElMessageBox.confirm('是否要下载该作品?', '系统提醒', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: '',
      customClass: 'drawer_systemBox'
    }).then(async () => {
      await downLoadFile(
        tableForm.workInfo.url,
        tableForm.workInfo.name || '素材',
        'material_library'
      )

      await use({
        id: tableForm.workInfo.id
      })

      resetList()
    })
  } else {
    ElMessage({
      type: 'warning',
      message: '暂未找到相关下载链接'
    })
  }
}, 700)
const router = useRouter()
function deleteMaterial() {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox'
  })
    .then(() => {
      // emit('delItem', index)
      save({
        id: tableForm.workInfo.id,
        isDelete: 1
      }).then(res => {
        if (res.code === 0) {
          ElMessage({
            type: 'success',
            message: '删除成功'
          })
          router.go(-1)
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

onMounted(() => {
  getWorkInfo()
  resetList()
})
</script>

<style lang="scss" scoped>
.works_detail {
  min-width: 700px;
  .head_info_box {
    display: flex;
    width: 100%;
  }
  .basic_info_box {
    margin-right: 16px;
    padding: 20px 24px 14px;
    width: 50%;
    background: #ffffff;
    border-radius: 4px;
    .title {
      height: 25px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .title_right {
        width: 80%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
      }
    }
    .video_detail_box {
      display: flex;
      margin-top: 16px;
      .img_box {
        width: 90px;
        height: 140px;
        position: relative;
        background-color: #303133;
        border-radius: 3px;
        overflow: hidden;

        .play {
          position: absolute;
          height: 14px;
          width: 14px;
          object-fit: cover;
          top: 50%;
          left: calc(50%);
          transform: translate(-50%, -50%);
        }
        .img {
          width: 100%;
          object-fit: contain;
          position: absolute;
          top: 50%;
          border-radius: 3px;
          transform: translateY(-50%);
        }
        .black_img {
          width: 66px;
          height: 66px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .video_img {
        width: 90px;
        height: 140px;
        object-fit: cover;
        border-radius: 2px;
      }
      .detail {
        width: calc(100% - 98px);
        margin-left: 8px;
        .video_name {
          margin-bottom: 6px;
          // height: 22px;
          font-size: 16px;
          font-weight: 400;
          color: #303133;
          line-height: 22px;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
        }
        .other_info {
          &:last-child {
            margin: 0;
          }
          margin-bottom: 8px;
          height: 17px;
          line-height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
        }
      }
    }
    .tab_list {
      margin: 0;
      .tab {
        margin: 14px 24px 0 0;
        background: #d2d7f0;
        color: #303133;
        border-radius: 16px;
        border: none;
        padding: 1px 22px;
      }
    }
  }
  .work_source_box {
    padding: 20px 24px 14px;
    width: 50%;
    background: #ffffff;
    border-radius: 4px;
    .title {
      height: 25px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
    }
    .info_box {
      display: flex;
      margin-top: 16px;
      font-size: 14px;
      font-weight: 400;
      align-items: center;
      .label {
        width: 70px;
        height: 20px;
        color: #909399;
        line-height: 20px;
        text-align: right;
      }
      .value {
        margin-left: 12px;
        color: #303133;
        line-height: 20px;
      }
      .head_portrait {
        margin-left: 12px;
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 50%;
      }
    }
  }
  .table_box {
    margin-top: 16px;
    padding: 20px 24px 24px;
    background-color: #fff;
    .title {
      margin-bottom: 22px;
      height: 25px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 25px;
    }
  }
  .user_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    // cursor: pointer;
    .user_avatar {
      position: relative;
      display: flex;
    }
    .user_head {
      width: 36px;
      height: 36px;
      border-radius: 100%;
      margin-right: 6px;
    }
  }
  .source_box {
    border-radius: 8px;
    overflow: hidden;
    .video {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 99;
    }
  }
}
.other_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 8px;
  .other_info {
    margin-bottom: 0 !important;
  }
}
.text_content {
  max-height: 100px;
  overflow-y: auto;
  height: auto !important;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

<template>
  <div class="recycle_page sumvideo_page">
    <div class="page_top">
      <div class="top_left">
        <div class="left_title">回收站</div>
        <div class="left_span">此处存放30天内删除剧本、过期后自动清理</div>
      </div>
      <div class="top_right">
        <el-checkbox
          v-model="$data.isAll"
          :indeterminate="
            $data.chooseList.length > 0 && $data.chooseList.length < $data.list.length
          "
          @change="allCheckChange($event)"
        >
          <div class="check_content" v-if="$data.chooseList.length > 0">
            已选中
            <span>{{ $data.chooseList.length }}</span>
            个内容
          </div>
          <div class="check_content" v-else>
            共
            <span>{{ $data.list.length }}</span>
            个内容
          </div>
        </el-checkbox>
        <el-button type="primary" @click="allRevertFun">还原</el-button>
        <el-button v-if="$data.chooseList.length > 0" @click="allDelFun">删除</el-button>
      </div>
    </div>
    <div class="video_box" v-loading="$data.loading">
      <div class="all_video" v-if="$data.list && $data.list.length > 0">
        <template v-for="(item, index) in $data.list">
          <div
            class="one_video"
            :key="index"
            :style="{
              width: `${oneWidth}px`,
              height: `calc((${oneWidth}px - 16px) * 1.23)`
            }"
            v-if="item.creativeVo"
          >
            <div
              :class="{ one_box: true, template_item_active: item.isChoose }"
              v-loading="item.creativeVo.videoStatus === 1 || item.creativeVo.videoStatus === 0"
              element-loading-text="正在合成中"
              element-loading-background="rgba(255, 255,255, 0)"
            >
              <div class="video_cover_box">
                <template v-if="item.creativeVo.videoStatus == 2 && item.creativeVo.status != 1">
                  <img v-if="item.fileCover" class="video_cover" :src="item.fileCover" alt="" />
                  <div v-else class="video_cover_default">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20250110fyu1d.png"
                      alt=""
                    />
                  </div>
                </template>
                <!-- 合成失败 -->
                <template v-if="item.creativeVo.videoStatus === 3">
                  <div
                    class="mask"
                    style="background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
                  >
                    <div class="wrapper">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20250113fovzk.png"
                        alt=""
                      />
                      <p style="color: #606266">合成失败</p>
                    </div>
                  </div>
                </template>
                <!-- 草稿 -->
                <div
                  class="mask"
                  v-if="
                    !(item.creativeVo.videoStatus === 1 || item.creativeVo.videoStatus === 0) &&
                    item.creativeVo.status === 1
                  "
                >
                  <div class="wrapper">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20250110sgw23.png"
                      alt=""
                    />
                    <p class="marginTop8">剧本草稿</p>
                  </div>
                </div>
              </div>
              <div class="video_info">
                <div
                  class="operate_btn"
                  :style="$data.chooseList && $data.chooseList.length > 0 ? 'opacity:1' : ''"
                >
                  <el-checkbox
                    @change="oneCheckChange($event, item)"
                    class="check_btn"
                    @click.stop=""
                    v-model="item.isChoose"
                  ></el-checkbox>
                  <!-- 还原 -->
                  <div class="edit_btn" @click.stop="oneRevertFun(item)">还原</div>

                  <!-- 删除 -->
                  <div class="del_btn" @click.stop="oneDelFun(item, index)">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20230303ajt5u.png"
                      alt=""
                    />
                  </div>
                </div>
                <div class="title_box line-hidden2">
                  {{ item.fileName || '-' }}
                </div>
                <div class="title_box">
                  {{ item.recycleTime.replace('T', ' ') }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-else class="no_echart">
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>

    <!-- 删除剧本 -->
    <el-dialog
      destroy-on-close
      title="删除剧本"
      width="444px"
      @close="delDialog.show = false"
      v-model="delDialog.show"
      custom-class="rule_setting_dialog hide_footer_line"
    >
      <div style="padding: 16px 16px 12px">删除剧本后无法找回，请谨慎操作</div>

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
import { getRecycleList, recycleRollback, recycleDelete } from '@/api/sumvideo/recycle_bin.js'
import { throttle, getCWidth } from '@/utils/tools'

import { ElMessage } from 'element-plus'

const $data = reactive({
  loading: false,
  chooseList: [],
  list: [],
  isAll: true
})
// 获取列表数据
function getList() {
  $data.chooseList = []
  $data.isAll = false
  $data.loading = true
  getRecycleList({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : '',
    recycleType: 2
  })
    .then(res => {
      if (res.code === 0) {
        const list = res.data || []
        list.forEach(x => {
          x.isChoose = false
        })
        $data.list = list
      }
      $data.loading = false
    })
    .catch(() => {
      $data.loading = false
    })
}
getList()

// 总的选中
function allCheckChange(e) {
  console.log(e, 'zongoing')
  $data.list.forEach(x => {
    x.isChoose = e
  })
  if (e) {
    $data.chooseList = JSON.parse(JSON.stringify($data.list))
  } else {
    $data.chooseList = JSON.parse(JSON.stringify([]))
  }
}
// 单个选中
function oneCheckChange(e, item) {
  console.log(item, e)
  if (e) {
    $data.chooseList.push(item)
  } else {
    const index = $data.chooseList.indexOf(x => x.recycleId === item.recycleId)
    $data.chooseList.splice(index, 1)
  }
  $data.isAll = $data.chooseList.length === $data.list.length
}
// 删除弹窗
const delDialog = reactive({
  show: false,
  loading: false,
  ids: []
})
// 单个显示删除剧本
const oneDelFun = throttle(item => {
  delDialog.ids = [item.id]
  delDialog.loading = false
  delDialog.show = true
}, 500)
// 总的显示删除剧本
const allDelFun = throttle(() => {
  if ($data.chooseList && $data.chooseList.length > 0) {
    const ids = $data.chooseList.map(x => x.id)
    delDialog.ids = ids
    delDialog.loading = false
    delDialog.show = true
  } else {
    ElMessage({
      message: '请选择剧本',
      type: 'warning'
    })
  }
}, 500)
// 删除
const saveDelFun = throttle(() => {
  console.log('调接口删除')
  delDialog.loading = false

  recycleDelete({
    ids: delDialog.ids || []
  })
    .then(res => {
      if (res.code === 0) {
        ElMessage({
          message: '删除成功',
          type: 'success'
        })
        getList()
      }
      delDialog.loading = false
      delDialog.show = false
    })
    .catch(() => {
      delDialog.loading = false
      delDialog.show = false
    })
}, 500)
// 单个点击还原
const oneRevertFun = throttle(item => {
  saveRevertFun([item.id])
}, 500)
// 总的点击还原
const allRevertFun = throttle(() => {
  if ($data.chooseList && $data.chooseList.length > 0) {
    const ids = $data.chooseList.map(x => x.id)
    saveRevertFun(ids)
  } else {
    ElMessage({
      message: '请选择剧本',
      type: 'warning'
    })
  }
}, 500)
// 调还原的接口
const saveRevertFun = ids => {
  $data.loading = true
  console.log('调接口还原')
  recycleRollback({
    ids: ids || []
  })
    .then(res => {
      if (res.code === 0) {
        if (res.data) {
          ElMessage({
            message: '还原成功',
            type: 'success'
          })
          getList()
        } else {
          ElMessage({
            message: '还原失败',
            type: 'error'
          })
        }
      }
      $data.loading = false
    })
    .catch(() => {
      $data.loading = false
    })
}
const cLen = ref(7)
const listWidth = ref()
const oneWidth = ref(224)
function getWidth() {
  listWidth.value = getCWidth() - 32 - 30 - 7
  init()
}

getWidth()
function init() {
  console.log('init')

  cLen.value = parseInt((getCWidth() - 32 - 30 - 72) / 224)
  oneWidth.value = Math.floor(listWidth.value / cLen.value)
  console.log(oneWidth.value, cLen.value, listWidth.value)
}
onMounted(() => {
  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  console.log('video_library____unmounted')
  window.onresize = null
})
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.download_client {
  top: -40px !important;
}
.recycle_page {
  .page_top {
    width: 100%;
    height: 80px;
    background: #ffffff;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    .top_left {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      line-height: 26px;
      .left_span {
        margin-left: 16px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
      }
    }
    .top_right {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      :deep(.el-checkbox__input.is-checked + .el-checkbox__label, .el-checkbox__label) {
        color: #909399;
        font-size: 16px;
      }
      :deep(.check_content) {
        color: #909399;
        font-size: 16px;
        span {
          color: rgba(54, 79, 205, 1);
          font-weight: 600;
        }
      }
      :deep(.el-button) {
        margin-left: 24px;
      }
    }
  }
  .video_box {
    min-height: calc(100vh - 230px);
    margin-top: 16px;
    width: 100%;
    background: #ffffff;
    border-radius: 4px;
  }
  .all_video {
    width: 100%;
    padding: 24px 8px 0 24px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .one_video {
    padding: 0 12px 12px 0;
    .template_item_active {
      border: 2px solid #364fcd;
    }
    .one_box {
      :deep(.el-loading-mask) {
        z-index: 0;
        border-radius: 4px;
      }
      .video_cover_box {
        position: relative;

        background: linear-gradient(135deg, #ecf4ff 0%, #d4e4ff 100%);
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
        overflow: hidden;
        .digital_icon {
          position: absolute;
          left: 0;
          top: 0;
          width: 52px;
          height: 52px;
        }
      }
      .video_cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
      .video_cover_default {
        width: 100%;
        height: 100%;
        border-radius: 4px;

        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #ecf4ff 0%, #d4e4ff 100%);
        img {
          width: 64px;
          height: 64px;
          object-fit: contain;
          display: flex;
        }
      }
      .mask {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
        pointer-events: none;

        .wrapper {
          p {
            font-size: 12px;
            color: #598adb;
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
      .video_info {
        z-index: 2;
        cursor: pointer;
        border-radius: 4px;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%);
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
        padding: 12px;
        .operate_btn {
          opacity: 0;
          position: absolute;
          right: 0;
          top: 12px;
          z-index: 2;
          align-items: center;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
          .check_btn {
            // width: 20px;
            // height: 20px;
            width: 14px;
            height: 14px;
            position: absolute;
            left: 12px;
            top: 0px;
            // :deep(.el-checkbox__inner) {
            //   width: 20px;
            //   height: 20px;
            // }
            // :deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
            //   left: 6px;
            //   top: 2px;
            //   width: 5px;
            //   height: 10px;
            // }
          }
          .edit_btn {
            width: 56px;
            height: 32px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 16px;
            font-size: 14px;
            font-weight: 400;
            color: #ffffff;
            line-height: 32px;
            text-align: center;
            cursor: pointer;
            margin-right: 12px;
          }

          .del_btn {
            width: 32px;
            height: 32px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 50%;
            margin-right: 12px;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;

            img {
              width: 16px;
              height: 16px;
              object-fit: contain;
            }
          }
        }

        .title_box {
          width: 100%;

          font-size: 14px;
          font-weight: 400;
          color: #ffffff;
          line-height: 20px;
        }
      }
      .video_info:hover {
        .operate_btn {
          opacity: 1;
        }
      }
    }
  }
  .no_echart {
    width: 100%;
    height: calc(100vh - 230px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #8f939a;
    line-height: 20px;
    img {
      width: 70px;
      height: 70px;
      object-fit: cover;
      margin-bottom: 7px;
    }
  }
}
</style>
